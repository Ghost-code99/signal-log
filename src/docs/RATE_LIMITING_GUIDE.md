# Rate Limiting Implementation Guide

**Webhook Endpoint Rate Limiting - In-Memory Implementation**

---

## Overview

The webhook endpoint at `/api/webhooks/n8n/feedback` now includes in-memory rate limiting to prevent abuse and protect the endpoint from too many requests.

---

## How It Works

### Rate Limit Configuration

- **Max Requests:** 10 per minute per IP address
- **Time Window:** 60 seconds (60,000 milliseconds)
- **Cleanup Interval:** 5 minutes (removes old entries to prevent memory leaks)

### Rate Limit Logic Flow

```
1. Request arrives
   ↓
2. Get client IP address
   ↓
3. Clean up old entries (if needed)
   ↓
4. Check if IP exists in rate limit map
   ↓
5. If IP doesn't exist OR window expired:
   → Create new entry (count=1, resetTime=now+60s)
   → Allow request ✅
   ↓
6. If IP exists AND within window:
   → Check if count < 10
   → If yes: increment count, allow request ✅
   → If no: block request, return 429 ❌
```

---

## IP Address Detection

The system tries multiple methods to get the client IP:

1. **`x-forwarded-for` header** (Priority 1)
   - Used by Vercel, proxies, load balancers
   - May contain multiple IPs: `"client, proxy1, proxy2"`
   - Takes the first IP (original client)

2. **`x-real-ip` header** (Priority 2)
   - Alternative proxy header

3. **`x-vercel-forwarded-for` header** (Priority 3)
   - Vercel-specific header

4. **Socket remote address** (Priority 4)
   - Direct connection (not behind proxy)

5. **Fallback: "unknown"** (Priority 5)
   - If all methods fail

---

## Rate Limit Response

### When Rate Limit is Exceeded (429)

**Status Code:** `429 Too Many Requests`

**Response Body:**
```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "retryAfter": 45
}
```

**Headers:**
```
Retry-After: 45
```

**`retryAfter`** is the number of seconds until the rate limit resets.

---

## Memory Management

### Automatic Cleanup

To prevent memory leaks, the system automatically cleans up old entries:

- **Cleanup runs:** Periodically (not on every request)
- **Removes entries:** Older than 5 minutes
- **Frequency:** Only when enough time has passed since last cleanup

### Example Cleanup

```
Before cleanup:
- "192.168.1.1": { count: 5, resetTime: 1706451000000 } (old, will be removed)
- "10.0.0.1": { count: 3, resetTime: 1706451234567 } (recent, kept)

After cleanup:
- "10.0.0.1": { count: 3, resetTime: 1706451234567 } (only recent entry remains)
```

---

## Testing Rate Limiting

### Test 1: Normal Request (Should Succeed)

```bash
curl -X POST http://localhost:3000/api/webhooks/n8n/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_test",
    "firstName": "Test",
    "lastName": "User",
    "message": "Test message",
    "timestamp": "2025-01-28T10:00:00.000Z",
    "processedAt": "2025-01-28T10:00:03.000Z"
  }'
```

**Expected:** `200 OK` with success response

### Test 2: Rate Limit Exceeded (Should Return 429)

Send 11 requests quickly (within 60 seconds):

```bash
# Send 11 requests in a loop
for i in {1..11}; do
  curl -X POST http://localhost:3000/api/webhooks/n8n/feedback \
    -H "Content-Type: application/json" \
    -d '{
      "userId": "user_test",
      "firstName": "Test",
      "lastName": "User",
      "message": "Test message '$i'",
      "timestamp": "2025-01-28T10:00:00.000Z",
      "processedAt": "2025-01-28T10:00:03.000Z"
    }'
  echo "Request $i sent"
done
```

**Expected:**
- Requests 1-10: `200 OK` ✅
- Request 11: `429 Too Many Requests` ❌
- Response includes `retryAfter` seconds

### Test 3: Rate Limit Reset (After 60 Seconds)

1. Send 10 requests (all succeed)
2. Wait 61 seconds
3. Send another request

**Expected:** `200 OK` (rate limit reset)

---

## Implementation Details

### Data Structure

```typescript
// Rate limit map structure
Map<string, { count: number, resetTime: number }>

// Example:
{
  "192.168.1.1": { count: 5, resetTime: 1706451234567 },
  "10.0.0.1": { count: 10, resetTime: 1706451234567 }
}
```

### Key Functions

1. **`getClientIP(request)`**
   - Extracts IP address from request headers
   - Handles proxies and load balancers
   - Returns IP string or "unknown"

2. **`cleanupOldEntries()`**
   - Removes entries older than 5 minutes
   - Runs periodically to prevent memory leaks
   - Logs cleanup activity

3. **`checkRateLimit(request)`**
   - Main rate limiting logic
   - Returns `{ allowed: boolean, retryAfter?: number }`
   - Updates rate limit map

---

## Limitations

### In-Memory Storage

⚠️ **Important:** This is an in-memory implementation, which means:

- **Server restarts:** Rate limit data is lost
- **Multiple servers:** Each server has its own rate limit map (not shared)
- **Not persistent:** Data doesn't survive deployments

### Production Considerations

For production, consider:

1. **Redis-based rate limiting:**
   - Shared across multiple servers
   - Persistent across deployments
   - Better for distributed systems

2. **Database-based rate limiting:**
   - Persistent storage
   - Can track rate limits across time periods
   - More complex but more reliable

3. **Third-party services:**
   - Cloudflare Rate Limiting
   - AWS WAF
   - Vercel Edge Config

---

## Monitoring

### Logs to Watch

**Rate limit exceeded:**
```
⚠️ Rate limit exceeded: { ip: '192.168.1.1', retryAfter: 45 }
```

**Cleanup activity:**
```
🧹 Rate limit cleanup: removed 5 old entries
```

### Metrics to Track

- Number of 429 responses
- Most rate-limited IPs
- Average requests per IP
- Cleanup frequency

---

## Configuration

To adjust rate limits, modify these constants at the top of the file:

```typescript
const MAX_REQUESTS = 10;        // Max requests per window
const WINDOW_MS = 60 * 1000;   // Time window (60 seconds)
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // Cleanup interval (5 minutes)
```

---

## Best Practices

1. **Monitor rate limit hits:**
   - Track 429 responses
   - Identify potential abuse
   - Adjust limits if needed

2. **Set appropriate limits:**
   - Too low: Legitimate users blocked
   - Too high: Doesn't prevent abuse
   - Consider: Normal usage patterns

3. **Handle rate limit errors gracefully:**
   - n8n should retry after `retryAfter` seconds
   - Don't spam retries immediately

4. **Consider IP whitelisting:**
   - For trusted sources (like n8n)
   - Bypass rate limiting for known IPs

---

## Example: Rate Limit Flow

```
Time: 10:00:00
IP: 192.168.1.1
Request 1: ✅ Allowed (count: 1)

Time: 10:00:05
IP: 192.168.1.1
Request 2: ✅ Allowed (count: 2)

...

Time: 10:00:55
IP: 192.168.1.1
Request 10: ✅ Allowed (count: 10)

Time: 10:00:56
IP: 192.168.1.1
Request 11: ❌ Blocked (429, retryAfter: 4 seconds)

Time: 10:01:01
IP: 192.168.1.1
Request 12: ✅ Allowed (count: 1, window reset)
```

---

**For questions or issues, check the implementation in:** `app/api/webhooks/n8n/feedback/route.ts`

