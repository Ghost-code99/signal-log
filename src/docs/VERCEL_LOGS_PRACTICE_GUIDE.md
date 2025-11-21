# Vercel Logs Practice Guide

**Learn how to read and debug errors in Vercel logs by intentionally creating one**

---

## Overview

This exercise will:
1. Add a temporary intentional error to the webhook endpoint
2. Deploy it to production
3. Trigger the error
4. Find and read the error in Vercel logs
5. Understand stack traces
6. Identify the root cause
7. Fix and verify

---

## Step 1: Add Intentional Error

We'll add a simple error that's easy to identify and fix.

**Error Type:** Null reference error (common in production)

**Location:** In the webhook endpoint, right before Supabase insertion

**Error:** Try to access a property on undefined

---

## Step 2: Deploy to Production

1. Commit the error
2. Push to main
3. Wait for Vercel deployment

---

## Step 3: Trigger the Error

Submit feedback through the app, which will trigger the webhook and cause the error.

---

## Step 4: Find Error in Vercel Logs

### Access Vercel Logs

1. Go to: https://vercel.com/dashboard
2. Select your project
3. Click "Logs" tab (or "Deployments" → Latest → "Logs")

### Filter Logs

1. **Filter by function:**
   - Use search/filter: `/api/webhooks/n8n/feedback`
   - Or filter by "Function" dropdown

2. **Filter by time:**
   - Select recent time range
   - Or use "Live" to see real-time logs

3. **Filter by level:**
   - Look for "Error" level logs
   - Usually red or highlighted

### Identify Error Log

**What to look for:**
- Red/highlighted log entry
- "Error" or "Exception" in message
- Stack trace below the error
- Timestamp matching when you triggered it

---

## Step 5: Read the Stack Trace

### Stack Trace Structure

```
Error: Cannot read property 'xyz' of undefined
    at POST (/var/task/app/api/webhooks/n8n/feedback/route.ts:123:45)
    at async handler (/var/task/node_modules/next/dist/server/route-handler.js:45:12)
```

**Breaking it down:**
1. **Error message:** `Cannot read property 'xyz' of undefined`
   - Tells you what went wrong
   - Property name: `xyz`
   - Object was `undefined`

2. **File path:** `/var/task/app/api/webhooks/n8n/feedback/route.ts`
   - Location of error
   - In Vercel, `/var/task/` is the deployment root
   - Your file: `app/api/webhooks/n8n/feedback/route.ts`

3. **Line number:** `:123:45`
   - Line 123, column 45
   - Exact location of the error

4. **Call stack:**
   - Shows function call chain
   - Top = where error occurred
   - Bottom = where it was called from

### Reading Tips

- **Start from the top:** First line is usually the actual error
- **Check line numbers:** Match to your source code
- **Follow the stack:** See how the error propagated
- **Look for your code:** Ignore framework internals, focus on your files

---

## Step 6: Identify Root Cause

### Questions to Ask

1. **What property was accessed?**
   - Error message tells you: `Cannot read property 'xyz'`

2. **What was undefined?**
   - The object before the property access

3. **Why was it undefined?**
   - Check the code at that line
   - Was it supposed to be set?
   - Did validation fail?
   - Was it optional but accessed without check?

4. **Where in the code?**
   - Line number tells you exact location
   - Check surrounding code for context

### Common Patterns

**Pattern 1: Missing null check**
```typescript
const value = data.property.xyz; // Error if data.property is undefined
// Fix: const value = data.property?.xyz;
```

**Pattern 2: Validation failed**
```typescript
if (!data.property) {
  // Should return error, but code continues
}
const value = data.property.xyz; // Error if validation failed
```

**Pattern 3: Wrong assumption**
```typescript
// Assumed data always has property, but it doesn't
const value = data.property.xyz;
```

---

## Step 7: Fix the Error

### Fix Strategy

1. **Add null check:**
   ```typescript
   if (!data.property) {
     return NextResponse.json(
       { success: false, error: 'Missing property' },
       { status: 400 }
     );
   }
   ```

2. **Use optional chaining:**
   ```typescript
   const value = data.property?.xyz;
   ```

3. **Add default value:**
   ```typescript
   const value = data.property?.xyz || 'default';
   ```

### Verify Fix

1. **Deploy fix:**
   - Commit fix
   - Push to main
   - Wait for deployment

2. **Test again:**
   - Trigger webhook again
   - Check logs: should see success
   - No errors in logs

---

## Step 8: Understanding Log Levels

### Log Levels in Vercel

1. **INFO/LOG:**
   - Normal operation
   - Your `console.log()` statements
   - Usually black/white

2. **WARN:**
   - Warnings (non-critical)
   - Potential issues
   - Usually yellow

3. **ERROR:**
   - Errors that occurred
   - Exceptions
   - Usually red

4. **DEBUG:**
   - Debug information
   - Detailed logs
   - Usually gray

### Your Webhook Logs

**Success:**
```
[WEBHOOK] 2025-01-15T10:00:00Z | 192.168.1.1 | SUCCESS | Feedback stored successfully
```

**Error:**
```
[WEBHOOK] 2025-01-15T10:00:01Z | 192.168.1.1 | ERROR | Cannot read property 'xyz' of undefined
Error: Cannot read property 'xyz' of undefined
    at POST (/var/task/app/api/webhooks/n8n/feedback/route.ts:123:45)
```

---

## Step 9: Log Filtering Tips

### Filter by Function

```
/api/webhooks/n8n/feedback
```

### Filter by Error Level

```
level:error
```

### Filter by Time

- Use time picker
- Or search: `timestamp:2025-01-15`

### Filter by IP

```
192.168.1.1
```

### Combine Filters

```
/api/webhooks/n8n/feedback level:error
```

---

## Step 10: Best Practices

### 1. Add Context to Logs

**Bad:**
```typescript
console.log('Error occurred');
```

**Good:**
```typescript
console.log('[WEBHOOK] Error processing feedback', {
  userId: body.userId,
  error: error.message,
  stack: error.stack
});
```

### 2. Log at Key Points

- Before critical operations
- After successful operations
- On errors (with full context)
- On validation failures

### 3. Use Structured Logging

```typescript
logWebhookRequest(clientIP, 'ERROR', 'Database insert failed', {
  error: error.message,
  userId: body.userId,
  payloadSize: JSON.stringify(body).length
});
```

### 4. Include Request IDs

```typescript
const requestId = crypto.randomUUID();
console.log(`[${requestId}] Processing webhook request`);
```

---

## Common Error Patterns

### 1. Null/Undefined Access

**Error:**
```
Cannot read property 'xyz' of undefined
```

**Fix:** Add null check or optional chaining

### 2. Type Mismatch

**Error:**
```
Cannot read property 'length' of null
```

**Fix:** Validate type before access

### 3. Missing Environment Variable

**Error:**
```
process.env.N8N_WEBHOOK_SECRET is undefined
```

**Fix:** Check Vercel environment variables

### 4. Database Connection

**Error:**
```
Connection timeout
```

**Fix:** Check Supabase connection, service role key

### 5. JSON Parse Error

**Error:**
```
Unexpected token in JSON at position X
```

**Fix:** Validate JSON before parsing

---

## Exercise Checklist

- [ ] Add intentional error to webhook
- [ ] Commit and push to production
- [ ] Trigger the error
- [ ] Find error in Vercel logs
- [ ] Read and understand stack trace
- [ ] Identify root cause
- [ ] Fix the error
- [ ] Verify fix works
- [ ] Remove error code

---

## Summary

**Key Takeaways:**

1. **Vercel logs are in:** Dashboard → Project → Logs
2. **Filter by:** Function, time, level, search terms
3. **Stack traces show:** Error message, file, line number, call chain
4. **Read from top:** First line is usually the actual error
5. **Check line numbers:** Match to your source code
6. **Add context:** Log helpful information for debugging
7. **Test fixes:** Always verify after fixing

**Now let's practice!** Follow the steps to add an error, find it, and fix it.

