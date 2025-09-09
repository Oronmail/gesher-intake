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
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
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
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
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
 * Validate phone number (Israeli format)
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^(\+972|0)([23489]|5[0248]|7[2-9])\d{7}$/
  return phoneRegex.test(phone.replace(/[-\s]/g, ''))
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
    counselor_email: z.string().email().refine(isValidEmail, 'Invalid email format'),
    school_name: z.string().min(2).max(200).transform(sanitizeInput),
    parent_email: z.string().email().optional().refine(
      val => !val || isValidEmail(val), 
      'Invalid email format'
    ),
    parent_phone: z.string().optional().refine(
      val => !val || isValidPhone(val), 
      'Invalid phone format'
    ),
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
    date_of_birth: z.string().refine(val => {
      const date = new Date(val)
      const now = new Date()
      const age = now.getFullYear() - date.getFullYear()
      return age >= 10 && age <= 25 // Reasonable age range for the program
    }, 'Invalid date of birth'),
    // Add more fields as needed with proper validation
  })
}