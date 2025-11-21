# Webhook Request Logging Guide

**Comprehensive logging for webhook endpoint**

---

## Log Format

All webhook requests are logged in a consistent format:

```
[WEBHOOK] timestamp | IP | status | reason
```

**Format breakdown:**
- `[WEBHOOK]` - Log prefix for easy filtering
- `timestamp` - ISO 8601 format (e.g., `2025-01-15T10:00:00.000Z`)
- `IP` - Client IP address
- `status` - One of: `SUCCESS`, `BLOCKED`, `ERROR`
- `reason` - Specific message describing what happened

**Additional data** (logged as second parameter):
- User ID (if available)
- Request size in bytes
- Error details
- Category, priority, sentiment (for successful requests)

---

## Log Examples

### Successful Request

```
[WEBHOOK] 2025-01-15T10:00:00.000Z | 192.168.1.1 | SUCCESS | Feedback stored successfully
{
  feedbackId: 'abc-123',
  userId: 'user_2abc123def',
  category: 'feature_request',
  priority: 'medium',
  sentiment: 'positive',
  messageLength: 145,
  requestSizeBytes: 1024
}
```

### Rate Limit Blocked

```
[WEBHOOK] 2025-01-15T10:00:01.000Z | 192.168.1.1 | BLOCKED | Rate limit exceeded (retry after 45s)
{
  retryAfter: 45
}
```

### API Key Verification Failed

```
[WEBHOOK] 2025-01-15T10:00:02.000Z | 10.0.0.5 | BLOCKED | Missing API key. Please provide X-API-Key header.
{
  reason: 'API key verification failed'
}
```

### Invalid API Key

```
[WEBHOOK] 2025-01-15T10:00:03.000Z | 10.0.0.5 | BLOCKED | Invalid API key
{
  reason: 'API key verification failed'
}
```

### Validation Error

```
[WEBHOOK] 2025-01-15T10:00:04.000Z | 192.168.1.1 | ERROR | Missing required fields: firstName, lastName
{
  missingFields: ['firstName', 'lastName'],
  userId: 'user_2abc123def'
}
```

### Database Error

```
[WEBHOOK] 2025-01-15T10:00:05.000Z | 192.168.1.1 | ERROR | Database error: failed to insert feedback
{
  userId: 'user_2abc123def',
  error: 'duplicate key value violates unique constraint',
  errorCode: '23505'
}
```

### Large Request Warning

```
[WEBHOOK] 2025-01-15T10:00:06.000Z | 192.168.1.1 | ERROR | Large request detected: 150KB
{
  requestSizeBytes: 153600
}
```

---

## When Logs Are Created

### 1. Request Received (Before Any Checks)

**When:** Immediately when request arrives  
**Status:** `SUCCESS` (initial log, will be updated if blocked/error)  
**Reason:** `Request received`  
**Extra Data:**
- `requestSizeBytes`: Request size from Content-Length header
- `userAgent`: User-Agent header

**Example:**
```
[WEBHOOK] 2025-01-15T10:00:00.000Z | 192.168.1.1 | SUCCESS | Request received
{
  requestSizeBytes: 1024,
  userAgent: 'Mozilla/5.0...'
}
```

### 2. Rate Limit Blocked

**When:** After rate limit check fails  
**Status:** `BLOCKED`  
**Reason:** `Rate limit exceeded (retry after Xs)`  
**Extra Data:**
- `retryAfter`: Seconds until rate limit resets

### 3. API Key Verification Failed

**When:** After API key check fails  
**Status:** `BLOCKED`  
**Reason:** Error message from verification (e.g., "Missing API key", "Invalid API key")  
**Extra Data:**
- `reason`: "API key verification failed"

### 4. JSON Parsing Error

**When:** If request body cannot be parsed as JSON  
**Status:** `ERROR`  
**Reason:** `Failed to parse JSON body`  
**Extra Data:**
- `error`: Error message
- `requestSizeBytes`: Request size

### 5. Validation Error

**When:** If required fields are missing or invalid  
**Status:** `ERROR`  
**Reason:** Specific validation error message  
**Extra Data:**
- `missingFields`: Array of missing fields (if applicable)
- `userId`: User ID if available in payload

### 6. Database Error

**When:** If Supabase insert fails  
**Status:** `ERROR`  
**Reason:** `Database error: failed to insert feedback`  
**Extra Data:**
- `userId`: User ID from payload
- `error`: Database error message
- `errorCode`: Database error code

### 7. Success

**When:** After feedback is successfully stored  
**Status:** `SUCCESS`  
**Reason:** `Feedback stored successfully`  
**Extra Data:**
- `feedbackId`: Database record ID
- `userId`: User ID
- `category`: Feedback category
- `priority`: Feedback priority
- `sentiment`: Feedback sentiment
- `messageLength`: Length of message in characters
- `requestSizeBytes`: Request size in bytes

### 8. Unexpected Error

**When:** If any unexpected error occurs  
**Status:** `ERROR`  
**Reason:** `Unexpected error processing webhook`  
**Extra Data:**
- `error`: Error message
- `errorType`: Error type/constructor name
- `requestSizeBytes`: Request size

### 9. Large Request Warning

**When:** If request size > 100KB  
**Status:** `ERROR`  
**Reason:** `Large request detected: XKB`  
**Extra Data:**
- `requestSizeBytes`: Request size in bytes

---

## Viewing Logs

### Local Development

Logs appear in your terminal where `npm run dev` is running:

```bash
[WEBHOOK] 2025-01-15T10:00:00.000Z | 192.168.1.1 | SUCCESS | Request received { requestSizeBytes: 1024, userAgent: '...' }
[WEBHOOK] 2025-01-15T10:00:00.500Z | 192.168.1.1 | SUCCESS | Feedback stored successfully { feedbackId: '...', userId: '...' }
```

### Vercel Dashboard

1. **Go to Vercel Dashboard**
2. **Select your project**
3. **Go to "Functions" tab** (or "Logs" tab)
4. **Filter by:** `/api/webhooks/n8n/feedback`
5. **Search for:** `[WEBHOOK]`

### Filtering Logs

**In Vercel:**
- Search: `[WEBHOOK]` - All webhook logs
- Search: `[WEBHOOK] ... | BLOCKED` - Only blocked requests
- Search: `[WEBHOOK] ... | ERROR` - Only errors
- Search: `[WEBHOOK] ... | SUCCESS` - Only successful requests

**By IP:**
- Search: `[WEBHOOK] ... | 192.168.1.1` - All requests from specific IP

**By User:**
- Search: `userId: 'user_2abc123def'` - All requests from specific user

---

## Log Status Types

### SUCCESS
- Request received
- Feedback stored successfully

### BLOCKED
- Rate limit exceeded
- Missing API key
- Invalid API key

### ERROR
- JSON parsing error
- Validation error
- Database error
- Large request detected (> 100KB)
- Unexpected errors

---

## Request Size Monitoring

### Normal Requests
- Typical size: 500 bytes - 5KB
- Logged in extra data: `requestSizeBytes`

### Large Request Warning
- Threshold: > 100KB
- Triggers separate log entry with `ERROR` status
- Helps identify potential abuse or malformed requests

**Example:**
```
[WEBHOOK] 2025-01-15T10:00:00.000Z | 192.168.1.1 | ERROR | Large request detected: 150KB
{
  requestSizeBytes: 153600
}
```

---

## User ID Tracking

When available, user ID is included in logs:

- **Success logs:** `userId` from stored feedback
- **Error logs:** `userId` from request payload (if parsing succeeded)
- **Validation errors:** `userId` if present in payload

This helps:
- Track feedback from specific users
- Debug user-specific issues
- Monitor user behavior

---

## Complete Request Flow Logging

A typical successful request produces 2 log entries:

```
1. [WEBHOOK] ... | SUCCESS | Request received
   (Initial log with request metadata)

2. [WEBHOOK] ... | SUCCESS | Feedback stored successfully
   (Final log with feedback details)
```

A blocked request produces 2 log entries:

```
1. [WEBHOOK] ... | SUCCESS | Request received
   (Initial log)

2. [WEBHOOK] ... | BLOCKED | Rate limit exceeded (retry after 45s)
   (Block reason)
```

An error produces 2+ log entries:

```
1. [WEBHOOK] ... | SUCCESS | Request received
   (Initial log)

2. [WEBHOOK] ... | ERROR | Missing required fields: firstName, lastName
   (Error reason)
```

---

## Best Practices

### 1. Monitor Logs Regularly

- Check Vercel logs dashboard daily
- Look for patterns in blocked/error requests
- Identify potential abuse or issues

### 2. Set Up Alerts

- Alert on high error rates
- Alert on rate limit blocks from same IP
- Alert on large requests (> 100KB)

### 3. Analyze Patterns

- Track which IPs are blocked most
- Identify common validation errors
- Monitor database error rates

### 4. Use Logs for Debugging

- Search by user ID to track specific user issues
- Search by IP to investigate abuse
- Search by error type to identify patterns

---

## Log Retention

### Vercel

- **Free tier:** Logs retained for 24 hours
- **Pro tier:** Logs retained for 7 days
- **Enterprise:** Custom retention

### Exporting Logs

For longer retention, consider:
- Exporting logs to external service
- Setting up log aggregation (Datadog, LogRocket, etc.)
- Storing important logs in database

---

## Example: Complete Request Log Sequence

### Successful Request

```
[WEBHOOK] 2025-01-15T10:00:00.000Z | 192.168.1.1 | SUCCESS | Request received
{ requestSizeBytes: 1024, userAgent: 'n8n/1.0' }

[WEBHOOK] 2025-01-15T10:00:00.500Z | 192.168.1.1 | SUCCESS | Feedback stored successfully
{
  feedbackId: 'abc-123-def-456',
  userId: 'user_2abc123def',
  category: 'feature_request',
  priority: 'medium',
  sentiment: 'positive',
  messageLength: 145,
  requestSizeBytes: 1024
}
```

### Rate Limited Request

```
[WEBHOOK] 2025-01-15T10:00:00.000Z | 192.168.1.1 | SUCCESS | Request received
{ requestSizeBytes: 1024, userAgent: 'n8n/1.0' }

[WEBHOOK] 2025-01-15T10:00:00.100Z | 192.168.1.1 | BLOCKED | Rate limit exceeded (retry after 45s)
{ retryAfter: 45 }
```

### Invalid API Key

```
[WEBHOOK] 2025-01-15T10:00:00.000Z | 10.0.0.5 | SUCCESS | Request received
{ requestSizeBytes: 1024, userAgent: 'curl/7.68.0' }

[WEBHOOK] 2025-01-15T10:00:00.050Z | 10.0.0.5 | BLOCKED | Invalid API key
{ reason: 'API key verification failed' }
```

---

**For implementation details, see:** `app/api/webhooks/n8n/feedback/route.ts`

