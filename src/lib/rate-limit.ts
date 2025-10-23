import { NextRequest } from 'next/server'

interface RateLimitConfig {
  windowMs: number
  maxRequests: number
}

const rateLimitConfig: RateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per window
}

// Simple in-memory rate limiter (for production, use Redis)
const requestCounts = new Map<string, { count: number; resetTime: number }>()

export function rateLimit(request: NextRequest): { allowed: boolean; remaining: number } {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  const now = Date.now()
  const windowStart = now - rateLimitConfig.windowMs

  // Clean up old entries
  for (const [key, value] of requestCounts.entries()) {
    if (value.resetTime < windowStart) {
      requestCounts.delete(key)
    }
  }

  // Get or create entry for this IP
  const entry = requestCounts.get(ip) || { count: 0, resetTime: now + rateLimitConfig.windowMs }
  
  // Reset if window has passed
  if (entry.resetTime < now) {
    entry.count = 0
    entry.resetTime = now + rateLimitConfig.windowMs
  }

  // Check if limit exceeded
  if (entry.count >= rateLimitConfig.maxRequests) {
    return { allowed: false, remaining: 0 }
  }

  // Increment counter
  entry.count++
  requestCounts.set(ip, entry)

  return { 
    allowed: true, 
    remaining: rateLimitConfig.maxRequests - entry.count 
  }
}

// Rate limiting middleware
export function withRateLimit(handler: Function) {
  return async (request: NextRequest) => {
    const { allowed, remaining } = rateLimit(request)
    
    if (!allowed) {
      return new Response('Rate limit exceeded', { 
        status: 429,
        headers: {
          'Retry-After': '900', // 15 minutes
          'X-RateLimit-Remaining': '0'
        }
      })
    }

    const response = await handler(request)
    
    // Add rate limit headers
    response.headers.set('X-RateLimit-Remaining', remaining.toString())
    response.headers.set('X-RateLimit-Reset', new Date(Date.now() + rateLimitConfig.windowMs).toISOString())
    
    return response
  }
}
