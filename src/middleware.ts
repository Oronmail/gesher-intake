import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// CORS configuration
const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_APP_URL || 'https://gesher-intake.vercel.app',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token',
  'Access-Control-Max-Age': '86400',
}

// Security headers
const securityHeaders = {
  'X-DNS-Prefetch-Control': 'off',
  'X-Frame-Options': 'SAMEORIGIN',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-Content-Type-Options': 'nosniff',
  'X-Permitted-Cross-Domain-Policies': 'none',
  'Referrer-Policy': 'origin-when-cross-origin',
  'X-XSS-Protection': '1; mode=block',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' https://*.supabase.co https://*.salesforce.com;",
}

// Rate limiting function
function rateLimit(ip: string): boolean {
  const now = Date.now()
  const maxRequests = parseInt(process.env.RATE_LIMIT_MAX || '100')
  const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000') // 1 minute

  const record = rateLimitStore.get(ip)
  
  if (!record || record.resetTime < now) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + windowMs })
    return true
  }
  
  if (record.count >= maxRequests) {
    return false
  }
  
  record.count++
  return true
}

// Clean up old rate limit records periodically
setInterval(() => {
  const now = Date.now()
  for (const [ip, record] of rateLimitStore.entries()) {
    if (record.resetTime < now) {
      rateLimitStore.delete(ip)
    }
  }
}, 60000) // Clean every minute

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 200, headers: corsHeaders })
  }

  // Apply to API routes only
  if (pathname.startsWith('/api')) {
    const response = NextResponse.next()
    
    // Add CORS headers
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
    
    // Add security headers
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
    
    // Get client IP
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               'unknown'
    
    // Apply rate limiting
    if (!rateLimit(ip)) {
      return new NextResponse(
        JSON.stringify({ error: 'Too many requests, please try again later' }),
        { 
          status: 429, 
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '60',
            ...corsHeaders,
          }
        }
      )
    }
    
    // Check API key for sensitive endpoints
    const protectedPaths = ['/api/referrals/initiate', '/api/referrals/consent', '/api/referrals/student-data']
    if (protectedPaths.some(path => pathname.startsWith(path))) {
      const apiKey = request.headers.get('x-api-key')
      const validApiKey = process.env.API_SECRET_KEY
      
      // In production, require API key
      if (process.env.NODE_ENV === 'production' && validApiKey && apiKey !== validApiKey) {
        return new NextResponse(
          JSON.stringify({ error: 'Invalid API key' }),
          { 
            status: 401, 
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            }
          }
        )
      }
    }
    
    return response
  }
  
  // For non-API routes, just add security headers
  const response = NextResponse.next()
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}