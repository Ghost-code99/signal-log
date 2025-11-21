import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServiceClient } from '@/lib/supabase-service';
import { timingSafeEqual } from 'crypto';

/**
 * Webhook endpoint to receive processed feedback from n8n
 * 
 * This endpoint receives the callback from n8n after it has:
 * 1. Processed the feedback through AI Agent
 * 2. Sent email notification
 * 3. Stored in Supabase
 * 
 * Expected payload from n8n (original data + AI analysis):
 * {
 *   userId: string,
 *   firstName: string,
 *   lastName: string,
 *   email: string,
 *   message: string,
 *   browser: string,
 *   timestamp: string,
 *   url: string,
 *   sentiment: string,
 *   category: string,
 *   priority: string,
 *   summary: string,
 *   actionable: boolean,
 *   processedAt: string
 * }
 */

// ============================================================================
// RATE LIMITING CONFIGURATION
// ============================================================================

/**
 * Rate limit configuration
 * - MAX_REQUESTS: Maximum number of requests allowed per time window
 * - WINDOW_MS: Time window in milliseconds (60 seconds = 60,000 ms)
 * - CLEANUP_INTERVAL_MS: How often to clean up old entries (5 minutes)
 */
const MAX_REQUESTS = 10;
const WINDOW_MS = 60 * 1000; // 60 seconds
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Rate limit tracker
 * 
 * This Map stores rate limit data for each IP address:
 * - Key: IP address (string)
 * - Value: Object with:
 *   - count: Number of requests made in current window
 *   - resetTime: Timestamp (ms) when the rate limit window resets
 * 
 * Example:
 * {
 *   "192.168.1.1": { count: 5, resetTime: 1706451234567 },
 *   "10.0.0.1": { count: 10, resetTime: 1706451234567 }
 * }
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

/**
 * Last cleanup timestamp
 * 
 * Tracks when we last cleaned up old entries from the rate limit map.
 * This prevents memory leaks by removing entries older than 5 minutes.
 */
let lastCleanupTime = Date.now();

// ============================================================================
// RATE LIMITING HELPER FUNCTIONS
// ============================================================================

/**
 * Gets the client IP address from the request
 * 
 * Priority order:
 * 1. x-forwarded-for header (used by Vercel, proxies, load balancers)
 *    - May contain multiple IPs: "client, proxy1, proxy2"
 *    - We take the first one (original client IP)
 * 2. x-real-ip header (alternative proxy header)
 * 3. request.socket.remoteAddress (direct connection)
 * 4. Fallback to "unknown" if none found
 * 
 * @param request - The incoming Next.js request
 * @returns IP address string
 */
function getClientIP(request: NextRequest): string {
  // Try x-forwarded-for first (Vercel and most proxies use this)
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs: "client, proxy1, proxy2"
    // We want the first one (original client IP)
    const firstIP = forwardedFor.split(',')[0].trim();
    if (firstIP) {
      return firstIP;
    }
  }

  // Try x-real-ip (alternative proxy header)
  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP.trim();
  }

  // Try socket remote address (direct connection, not behind proxy)
  // Note: In Next.js API routes, this might not always be available
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const remoteAddress = request.headers.get('x-vercel-forwarded-for') || 
                        (request as any).socket?.remoteAddress;
  if (remoteAddress) {
    return remoteAddress;
  }

  // Fallback if we can't determine IP
  // In production, you might want to log this as a warning
  return 'unknown';
}

/**
 * Cleans up old entries from the rate limit map
 * 
 * This prevents memory leaks by removing entries that are older than
 * CLEANUP_INTERVAL_MS (5 minutes). We only run cleanup periodically
 * to avoid performance overhead on every request.
 * 
 * How it works:
 * 1. Check if enough time has passed since last cleanup
 * 2. If yes, iterate through all entries
 * 3. Remove entries where resetTime is older than 5 minutes ago
 * 4. Update lastCleanupTime
 */
function cleanupOldEntries(): void {
  const now = Date.now();
  
  // Only cleanup if enough time has passed (avoid overhead on every request)
  if (now - lastCleanupTime < CLEANUP_INTERVAL_MS) {
    return;
  }

  // Calculate cutoff time: entries older than 5 minutes
  const cutoffTime = now - CLEANUP_INTERVAL_MS;
  
  // Count how many entries we remove (for logging)
  let removedCount = 0;

  // Iterate through all entries and remove old ones
  for (const [ip, data] of rateLimitMap.entries()) {
    // If the resetTime is older than cutoff, remove the entry
    // Note: We check resetTime because that's when the window expires
    // If resetTime is in the past and old, the entry is stale
    if (data.resetTime < cutoffTime) {
      rateLimitMap.delete(ip);
      removedCount++;
    }
  }

  // Update last cleanup time
  lastCleanupTime = now;

  // Log cleanup (only if we removed entries)
  if (removedCount > 0) {
    console.log(`🧹 Rate limit cleanup: removed ${removedCount} old entries`);
  }
}

/**
 * Checks if the request should be rate limited
 * 
 * Rate limiting logic:
 * 1. Get client IP address
 * 2. Clean up old entries (prevent memory leak)
 * 3. Check if IP exists in rate limit map
 * 4. If IP doesn't exist or window expired: create new entry, allow request
 * 5. If IP exists and within window:
 *    - If count < MAX_REQUESTS: increment count, allow request
 *    - If count >= MAX_REQUESTS: block request, return rate limit info
 * 
 * @param request - The incoming Next.js request
 * @returns Object with:
 *   - allowed: boolean - Whether request should be allowed
 *   - retryAfter?: number - Seconds until rate limit resets (if blocked)
 */
function checkRateLimit(request: NextRequest): { allowed: boolean; retryAfter?: number } {
  // Step 1: Get client IP address
  const clientIP = getClientIP(request);

  // Step 2: Clean up old entries periodically (prevent memory leak)
  cleanupOldEntries();

  // Step 3: Get current timestamp
  const now = Date.now();

  // Step 4: Check if IP exists in rate limit map
  const rateLimitData = rateLimitMap.get(clientIP);

  // Step 5: Handle different scenarios
  if (!rateLimitData) {
    // IP not in map: first request or entry was cleaned up
    // Create new entry with count = 1 and resetTime = now + WINDOW_MS
    rateLimitMap.set(clientIP, {
      count: 1,
      resetTime: now + WINDOW_MS,
    });
    
    // Allow the request
    return { allowed: true };
  }

  // Step 6: IP exists in map - check if time window has passed
  if (now >= rateLimitData.resetTime) {
    // Time window has passed: reset the rate limit
    // Set count to 1 (this request) and new resetTime
    rateLimitMap.set(clientIP, {
      count: 1,
      resetTime: now + WINDOW_MS,
    });
    
    // Allow the request
    return { allowed: true };
  }

  // Step 7: IP exists and we're still within the time window
  // Check if count has reached the limit
  if (rateLimitData.count >= MAX_REQUESTS) {
    // Rate limit exceeded: calculate seconds until reset
    const secondsUntilReset = Math.ceil((rateLimitData.resetTime - now) / 1000);
    
    // Block the request
    return {
      allowed: false,
      retryAfter: secondsUntilReset,
    };
  }

  // Step 8: Count is below limit: increment and allow
  rateLimitData.count++;
  
  // Update the map (Map stores references, so this updates the existing entry)
  rateLimitMap.set(clientIP, rateLimitData);
  
  // Allow the request
  return { allowed: true };
}

/**
 * Verifies the API key from the request header
 * 
 * This function implements API key authentication to ensure only authorized
 * services (like n8n) can call this webhook endpoint.
 * 
 * Security flow:
 * 1. Get API key from X-API-Key header
 * 2. Get expected secret from environment variable
 * 3. Compare them using constant-time comparison (prevents timing attacks)
 * 4. Return validation result
 * 
 * @param request - The incoming Next.js request
 * @returns Object with:
 *   - valid: boolean - Whether API key is valid
 *   - error?: string - Error message if invalid
 */
function verifyAPIKey(request: NextRequest): { valid: boolean; error?: string } {
  // Step 1: Get API key from request header
  // The header name is X-API-Key (case-insensitive in HTTP, but we check both)
  const apiKey = request.headers.get('x-api-key') || request.headers.get('X-API-Key');

  // Step 2: Check if API key is present
  if (!apiKey) {
    return {
      valid: false,
      error: 'Missing API key. Please provide X-API-Key header.',
    };
  }

  // Step 3: Get expected secret from environment variable
  const expectedSecret = process.env.N8N_WEBHOOK_SECRET;

  // Step 4: Check if secret is configured
  if (!expectedSecret) {
    // This is a server configuration error, not a client error
    // Log it but don't expose to client (security best practice)
    console.error('❌ N8N_WEBHOOK_SECRET environment variable is not set');
    return {
      valid: false,
      error: 'Server configuration error',
    };
  }

  // Step 5: Compare API key with expected secret
  // Use constant-time comparison to prevent timing attacks
  // Timing attacks: An attacker could measure response time to guess the secret
  // Constant-time comparison takes the same time regardless of where the mismatch occurs
  
  // For better security, we use Node.js crypto.timingSafeEqual()
  // This is a built-in function designed specifically for constant-time comparison
  // It prevents timing attacks by ensuring comparison always takes the same time
  
  // Convert strings to Buffers for timing-safe comparison
  // We need both to be the same length for timingSafeEqual to work
  const apiKeyBuffer = Buffer.from(apiKey, 'utf8');
  const expectedSecretBuffer = Buffer.from(expectedSecret, 'utf8');
  
  // If lengths don't match, they're definitely not equal
  // But we still need to do a comparison to maintain constant time
  // So we compare against a dummy buffer of the same length
  if (apiKeyBuffer.length !== expectedSecretBuffer.length) {
    // Create a dummy buffer of the same length as apiKey for comparison
    // This prevents leaking information about the secret length
    const dummyBuffer = Buffer.alloc(apiKeyBuffer.length);
    // Do a dummy comparison to maintain timing (even though we know it's invalid)
    timingSafeEqual(dummyBuffer, apiKeyBuffer);
    
    return {
      valid: false,
      error: 'Invalid API key',
    };
  }

  // Step 6: Perform constant-time comparison
  // timingSafeEqual throws if buffers are different lengths, but we checked above
  let isValid = false;
  try {
    isValid = timingSafeEqual(apiKeyBuffer, expectedSecretBuffer);
  } catch {
    // This shouldn't happen since we checked lengths, but handle it safely
    // Error is intentionally not used - we just need to catch the exception
    return {
      valid: false,
      error: 'Invalid API key',
    };
  }

  // Step 7: Return validation result
  if (!isValid) {
    return {
      valid: false,
      error: 'Invalid API key',
    };
  }

  // API key is valid
  return { valid: true };
}

// ============================================================================
// LOGGING HELPER FUNCTION
// ============================================================================

/**
 * Logs webhook requests in a consistent format
 * 
 * Format: [WEBHOOK] timestamp | IP | status | reason
 * 
 * Examples:
 * - [WEBHOOK] 2025-01-15T10:00:00Z | 192.168.1.1 | SUCCESS | Feedback stored
 * - [WEBHOOK] 2025-01-15T10:00:01Z | 192.168.1.1 | BLOCKED | Rate limit exceeded
 * - [WEBHOOK] 2025-01-15T10:00:02Z | 10.0.0.5 | BLOCKED | Invalid API key
 * 
 * @param ip - Client IP address
 * @param status - Request status: SUCCESS, BLOCKED, or ERROR
 * @param reason - Specific reason/message
 * @param extra - Optional additional data to log (user ID, request size, etc.)
 */
function logWebhookRequest(
  ip: string,
  status: 'SUCCESS' | 'BLOCKED' | 'ERROR',
  reason: string,
  extra?: Record<string, unknown>
): void {
  const timestamp = new Date().toISOString();
  
  // Build the log message in consistent format
  const logMessage = `[WEBHOOK] ${timestamp} | ${ip} | ${status} | ${reason}`;
  
  // If extra data provided, log it as a second parameter
  // This makes it easier to search/filter logs in Vercel dashboard
  if (extra && Object.keys(extra).length > 0) {
    console.log(logMessage, extra);
  } else {
    console.log(logMessage);
  }
}

export async function POST(request: NextRequest) {
  // Get client IP early (we'll use it for all logging)
  const clientIP = getClientIP(request);
  
  // Get request size from Content-Length header (if available)
  // This helps identify unusually large requests
  const contentLength = request.headers.get('content-length');
  const requestSizeBytes = contentLength ? parseInt(contentLength, 10) : null;
  
  // Log all incoming requests (before any checks)
  // This gives us visibility into all attempts, even blocked ones
  logWebhookRequest(
    clientIP,
    'SUCCESS', // Will be updated if blocked/error
    'Request received',
    {
      requestSizeBytes: requestSizeBytes || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    }
  );
  
  // Warn if request is unusually large (> 100KB)
  if (requestSizeBytes && requestSizeBytes > 100 * 1024) {
    logWebhookRequest(
      clientIP,
      'ERROR',
      `Large request detected: ${Math.round(requestSizeBytes / 1024)}KB`,
      { requestSizeBytes }
    );
  }
  try {
    // ========================================================================
    // STEP 1: RATE LIMITING CHECK
    // ========================================================================
    // Check if this request should be rate limited before processing
    // This prevents abuse and protects the endpoint from too many requests
    
    const rateLimitCheck = checkRateLimit(request);
    
    if (!rateLimitCheck.allowed) {
      // Rate limit exceeded: return 429 Too Many Requests
      const retryAfter = rateLimitCheck.retryAfter || 60;
      
      // Log rate limit block
      logWebhookRequest(
        clientIP,
        'BLOCKED',
        `Rate limit exceeded (retry after ${retryAfter}s)`,
        { retryAfter }
      );
      
      return NextResponse.json(
        {
          success: false,
          error: 'Rate limit exceeded',
          retryAfter,
        },
        {
          status: 429,
          headers: {
            // Retry-After header tells clients when they can retry
            // Standard HTTP header for rate limiting
            'Retry-After': retryAfter.toString(),
          },
        }
      );
    }

    // ========================================================================
    // STEP 2: API KEY VERIFICATION
    // ========================================================================
    // Verify that the request includes a valid API key in the X-API-Key header
    // This ensures only authorized services (like n8n) can call this endpoint
    // This is a security measure to prevent unauthorized access
    
    const apiKeyCheck = verifyAPIKey(request);
    
    if (!apiKeyCheck.valid) {
      // API key is missing or invalid: return 401 Unauthorized
      // We don't log the actual API key for security reasons
      
      // Log API key verification failure
      logWebhookRequest(
        clientIP,
        'BLOCKED',
        apiKeyCheck.error || 'Invalid API key',
        { reason: 'API key verification failed' }
      );
      
      return NextResponse.json(
        {
          success: false,
          error: apiKeyCheck.error || 'Unauthorized',
        },
        {
          status: 401,
          // Optional: Include WWW-Authenticate header (HTTP standard)
          headers: {
            'WWW-Authenticate': 'ApiKey',
          },
        }
      );
    }

    // ========================================================================
    // STEP 3: PARSE REQUEST BODY
    // ========================================================================
    // If rate limit and API key checks passed, continue with normal request processing
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      // Log JSON parsing error
      logWebhookRequest(
        clientIP,
        'ERROR',
        'Failed to parse JSON body',
        {
          error: parseError instanceof Error ? parseError.message : 'Unknown error',
          requestSizeBytes: requestSizeBytes || 'unknown',
        }
      );
      
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid JSON payload',
        },
        { status: 400 }
      );
    }

    // Validate required fields (per PRD)
    const requiredFields = [
      'userId',
      'firstName',
      'lastName',
      'message',
      'timestamp',
      'processedAt',
    ];

    const missingFields = requiredFields.filter(field => !(field in body));
    if (missingFields.length > 0) {
      // Log validation error
      logWebhookRequest(
        clientIP,
        'ERROR',
        `Missing required fields: ${missingFields.join(', ')}`,
        {
          missingFields,
          userId: body.userId || 'not provided',
        }
      );
      
      return NextResponse.json(
        {
          success: false,
          error: `Missing required fields: ${missingFields.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Validate field types
    if (typeof body.userId !== 'string' || body.userId.trim().length === 0) {
      logWebhookRequest(
        clientIP,
        'ERROR',
        'Invalid userId: must be a non-empty string',
        { userId: body.userId || 'not provided' }
      );
      
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid userId: must be a non-empty string',
        },
        { status: 400 }
      );
    }

    if (typeof body.message !== 'string' || body.message.trim().length === 0) {
      logWebhookRequest(
        clientIP,
        'ERROR',
        'Invalid message: must be a non-empty string',
        { userId: body.userId }
      );
      
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid message: must be a non-empty string',
        },
        { status: 400 }
      );
    }

    // Validate optional boolean field
    if (body.actionable !== undefined && typeof body.actionable !== 'boolean') {
      logWebhookRequest(
        clientIP,
        'ERROR',
        'Invalid actionable: must be a boolean',
        { userId: body.userId, actionable: body.actionable }
      );
      
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid actionable: must be a boolean',
        },
        { status: 400 }
      );
    }

    // ========================================================================
    // PRACTICE ERROR: Intentional error for learning Vercel logs
    // TODO: Remove this after practice exercise
    // ========================================================================
    // Simulating a common production error: accessing property on undefined
    // This will throw: "Cannot read property 'xyz' of undefined"
    const testError = body.nonExistentProperty.xyz;
    
    // Create Supabase client with service role (bypasses RLS for webhook)
    const supabase = createSupabaseServiceClient();

    // Map payload fields to database columns (per PRD mapping)
    const feedbackData = {
      user_id: body.userId,
      first_name: body.firstName,
      last_name: body.lastName,
      email: body.email || null,
      message: body.message,
      browser: body.browser || null,
      url: body.url || null,
      sentiment: body.sentiment || null,
      category: body.category || null,
      priority: body.priority || null,
      summary: body.summary || null,
      actionable: body.actionable ?? null,
      created_at: body.timestamp, // Use timestamp from original submission
      processed_at: body.processedAt, // Use processedAt from AI processing
    };

    // Insert feedback into Supabase
    const { data, error } = await supabase
      .from('feedback')
      .insert(feedbackData)
      .select()
      .single();

    if (error) {
      // Log database error
      logWebhookRequest(
        clientIP,
        'ERROR',
        'Database error: failed to insert feedback',
        {
          userId: body.userId,
          error: error.message,
          errorCode: error.code,
        }
      );
      
      return NextResponse.json(
        {
          success: false,
          error: 'Database error: failed to insert feedback',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        },
        { status: 500 }
      );
    }

    // Log successful processing
    logWebhookRequest(
      clientIP,
      'SUCCESS',
      'Feedback stored successfully',
      {
        feedbackId: data.id,
        userId: data.user_id,
        category: data.category || 'not provided',
        priority: data.priority || 'not provided',
        sentiment: data.sentiment || 'not provided',
        messageLength: body.message?.length || 0,
        requestSizeBytes: requestSizeBytes || 'unknown',
      }
    );

    // Return success response (per PRD)
    return NextResponse.json(
      {
        success: true,
        message: 'Feedback stored successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    // Catch any unexpected errors
    // Log unexpected error
    logWebhookRequest(
      clientIP,
      'ERROR',
      'Unexpected error processing webhook',
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.constructor.name : typeof error,
        requestSizeBytes: requestSizeBytes || 'unknown',
      }
    );

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process webhook callback',
        details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

// Optional: Handle GET requests for health checks
export async function GET() {
  return NextResponse.json(
    {
      success: true,
      message: 'n8n feedback webhook endpoint is active',
      endpoint: '/api/webhooks/n8n/feedback',
      method: 'POST',
    },
    { status: 200 }
  );
}

