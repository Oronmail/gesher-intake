import crypto from 'crypto'
import { z } from 'zod'

// Encryption configuration
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex')
const IV_LENGTH = 16
const ALGORITHM = 'aes-256-cbc'

/**
 * Sanitize input to prevent XSS attacks
 */
export function sanitizeInput(input: string): string {
  if (!input) return ''
  
  // Remove dangerous characters and scripts
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim()
}

/**
 * Sanitize object recursively
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sanitized: any = {}
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value)
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value)
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === 'string' ? sanitizeInput(item) : item
      )
    } else {
      sanitized[key] = value
    }
  }
  
  return sanitized as T
}

/**
 * Validate email format - using loose validation to allow more email formats
 * We rely on Zod's built-in email validation and just do a basic sanity check
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false
  
  // Very loose validation - just check for @ and at least one character before and after
  // This allows edge cases and international domains
  const hasAtSign = email.includes('@')
  const parts = email.split('@')
  
  // Must have exactly one @ and both parts must have content
  if (parts.length !== 2) return false
  if (parts[0].length === 0 || parts[1].length === 0) return false
  
  // Allow any valid email that has @ and content on both sides
  return hasAtSign
}

/**
 * Validate Israeli ID number
 */
export function isValidIsraeliId(id: string): boolean {
  if (!id || id.length !== 9) return false
  
  // Israeli ID validation algorithm
  let sum = 0
  for (let i = 0; i < 9; i++) {
    const num = Number(id[i]) * ((i % 2) + 1)
    sum += num > 9 ? num - 9 : num
  }
  
  return sum % 10 === 0
}

/**
 * Validate phone number (lenient format to match client-side validation)
 */
export function isValidPhone(phone: string): boolean {
  if (!phone) return true  // Empty is valid (handled by other validation)
  const cleaned = phone.replace(/[-\s\(\)]/g, '')
  // Allow any string with 9+ digits that only contains phone characters
  return /^[\d\+]+$/.test(cleaned) && cleaned.replace(/\+/g, '').length >= 9
}

/**
 * Encrypt sensitive data
 */
export function encrypt(text: string): string {
  const key = Buffer.from(ENCRYPTION_KEY.slice(0, 32), 'utf8')
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  
  return iv.toString('hex') + ':' + encrypted
}

/**
 * Decrypt sensitive data
 */
export function decrypt(text: string): string {
  const key = Buffer.from(ENCRYPTION_KEY.slice(0, 32), 'utf8')
  const parts = text.split(':')
  const iv = Buffer.from(parts.shift()!, 'hex')
  const encryptedText = parts.join(':')
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
  
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  
  return decrypted
}

/**
 * Generate secure random token
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex')
}

/**
 * Hash sensitive data (one-way)
 */
export function hashData(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex')
}

/**
 * Validate referral number format
 */
export function isValidReferralNumber(referralNumber: string): boolean {
  const regex = /^REF-\d{6}-\d{4}$/
  return regex.test(referralNumber)
}

/**
 * Generate CSRF token
 */
export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Verify CSRF token
 */
export function verifyCSRFToken(token: string, sessionToken: string): boolean {
  if (!token || !sessionToken) return false
  return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(sessionToken))
}

/**
 * Redact sensitive information for logging
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function redactSensitiveData(obj: any): any {
  const sensitiveFields = [
    'password', 'token', 'key', 'secret', 'signature', 
    'id', 'student_id', 'parent_id', 'credit_card', 'ssn'
  ]
  
  const redacted = { ...obj }
  
  for (const key in redacted) {
    if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
      redacted[key] = '[REDACTED]'
    } else if (typeof redacted[key] === 'object' && redacted[key] !== null) {
      redacted[key] = redactSensitiveData(redacted[key])
    }
  }
  
  return redacted
}

// Enhanced validation schemas with security checks
export const secureFormSchemas = {
  counselorInitial: z.object({
    counselor_name: z.string().min(2).max(100).transform(sanitizeInput),
    counselor_email: z.string().email(),  // Just use Zod's built-in email validation
    counselor_mobile: z.string().min(9).max(20),  // Phone validation
    school_name: z.string().min(2).max(200).transform(sanitizeInput),
    warm_home_destination: z.string().min(1).max(100).transform(sanitizeInput),
    consent_method: z.enum(['digital', 'manual']),  // NEW: Consent method selection
    parent_email: z.string().email().optional().or(z.literal('')),  // Allow empty string
    parent_phone: z.string().optional().or(z.literal('')).refine(
      val => !val || isValidPhone(val),
      'Invalid phone format'
    ),
    manual_consent_confirmed: z.boolean().optional(),  // NEW: Confirmation for manual consent
    // Student name fields (required for manual consent)
    student_first_name: z.string().max(100).optional().or(z.literal('')).transform(val => val ? sanitizeInput(val) : val),
    student_last_name: z.string().max(100).optional().or(z.literal('')).transform(val => val ? sanitizeInput(val) : val),
  }).superRefine((data, ctx) => {
    // Only require parent contact when digital consent is selected
    if (data.consent_method === 'digital') {
      if (!data.parent_email && !data.parent_phone) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "At least one parent contact method is required (email or phone)",
          path: ["parent_phone"],
        })
      }
    }
    // Require confirmation checkbox when manual consent is selected
    if (data.consent_method === 'manual' && !data.manual_consent_confirmed) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Manual consent confirmation is required",
        path: ["manual_consent_confirmed"],
      })
    }
    // Require student name when manual consent is selected
    if (data.consent_method === 'manual') {
      if (!data.student_first_name || data.student_first_name.trim().length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Student first name is required for manual consent",
          path: ["student_first_name"],
        })
      }
      if (!data.student_last_name || data.student_last_name.trim().length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Student last name is required for manual consent",
          path: ["student_last_name"],
        })
      }
    }
  }),
  
  parentConsent: z.object({
    parent1_name: z.string().min(2).max(100).transform(sanitizeInput),
    parent1_id: z.string().min(9).max(9).refine(isValidIsraeliId, 'Invalid ID format'),
    parent1_address: z.string().max(255).optional().transform(val => val ? sanitizeInput(val) : val),
    parent1_phone: z.string().optional().refine(
      val => !val || isValidPhone(val), 
      'Invalid phone format'
    ),
    parent2_name: z.string().max(100).optional().transform(val => val ? sanitizeInput(val) : val),
    parent2_id: z.string().optional().refine(
      val => !val || (val.length === 9 && isValidIsraeliId(val)), 
      'Invalid ID format'
    ),
    student_name: z.string().min(2).max(100).transform(sanitizeInput),
    referral_number: z.string().refine(isValidReferralNumber, 'Invalid referral number'),
  }),
  
  studentData: z.object({
    referral_number: z.string().refine(isValidReferralNumber, 'Invalid referral number'),
    student_first_name: z.string().min(2).max(100).transform(sanitizeInput),
    student_last_name: z.string().min(2).max(100).transform(sanitizeInput),
    student_id: z.string().min(9).max(9).refine(isValidIsraeliId, 'Invalid ID format'),
    date_of_birth: z.string().min(1, 'Date of birth is required'),
    // Add more fields as needed with proper validation
  })
}