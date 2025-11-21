# Vercel Logs Practice Exercise

**Step-by-step guide to practice reading Vercel logs with an intentional error**

---

## Exercise Overview

We've added a temporary intentional error to the webhook endpoint:
```typescript
const testError = body.nonExistentProperty.xyz; // This will throw
```

This simulates a common production error: accessing a property on `undefined`.

---

## Step 1: Verify the Error is Added

**File:** `src/app/api/webhooks/n8n/feedback/route.ts`

**Location:** Right before Supabase insertion (around line 545)

**Error Code:**
```typescript
const testError = body.nonExistentProperty.xyz; // This will throw
```

**What will happen:**
- `body.nonExistentProperty` is `undefined`
- Accessing `.xyz` on `undefined` throws: `Cannot read property 'xyz' of undefined`

---

## Step 2: Commit and Push to Production

### Stage the Change

```bash
# Make sure you're in the project root
cd /Users/ghost_/Desktop/Signal-log/signal-log

# Check current branch
git branch --show-current
# Should be: main (or user-feedback if you haven't merged yet)

# Stage the file with the error
git add src/app/api/webhooks/n8n/feedback/route.ts
```

### Commit with Clear Message

```bash
git commit -m "test: add intentional error for Vercel logs practice

- Add temporary error to webhook endpoint
- This is for learning purposes only
- Will be removed after exercise"
```

### Push to Trigger Deployment

```bash
# If on main branch
git push origin main

# If on user-feedback branch
git push origin user-feedback
# Then merge to main (see merge guide)
```

### Wait for Deployment

1. Go to Vercel dashboard
2. Watch deployment progress
3. Wait for "Ready" status
4. **Note the deployment time** (you'll need this to find logs)

---

## Step 3: Trigger the Error

### Option A: Submit Feedback Through App

1. **Go to production site:**
   - Visit your production URL
   - Or use: `https://your-domain.com`

2. **Submit feedback:**
   - Click "Give Feedback" button
   - Enter any test message: "Testing error logs"
   - Click "Submit"

3. **Expected result:**
   - Form shows error (webhook failed)
   - Error in Vercel logs

### Option B: Use curl (Direct Webhook Call)

```bash
# Replace with your actual values
curl -X POST https://your-domain.com/api/webhooks/n8n/feedback \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key-here" \
  -d '{
    "userId": "test-user-123",
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "message": "Testing error logs",
    "browser": "curl",
    "url": "https://example.com",
    "timestamp": "2025-01-15T10:00:00Z",
    "sentiment": "positive",
    "category": "bug",
    "priority": "high",
    "summary": "Test feedback",
    "actionable": true,
    "processedAt": "2025-01-15T10:00:00Z"
  }'
```

**Expected response:**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## Step 4: Find the Error in Vercel Logs

### Access Vercel Dashboard

1. **Go to:** https://vercel.com/dashboard
2. **Select your project:** `signal-log`
3. **Click "Logs" tab** (in sidebar)

### Filter Logs

1. **Filter by function:**
   - In search/filter box, type: `/api/webhooks/n8n/feedback`
   - Or use "Function" dropdown → Select your function

2. **Filter by time:**
   - Click time picker
   - Select "Last 5 minutes" (or when you triggered the error)
   - Or use "Live" to see real-time logs

3. **Filter by level:**
   - Look for red/highlighted entries
   - These are ERROR level logs

### Identify the Error Log

**What you're looking for:**

1. **Red/highlighted log entry**
   - Usually says "Error" or "Exception"
   - Timestamp matches when you triggered it

2. **Your custom log:**
   ```
   [WEBHOOK] 2025-01-15T10:00:00Z | IP | ERROR | ...
   ```

3. **Error message:**
   ```
   Error: Cannot read property 'xyz' of undefined
   ```

4. **Stack trace:**
   ```
   at POST (/var/task/app/api/webhooks/n8n/feedback/route.ts:545:XX)
   ```

---

## Step 5: Read the Stack Trace

### Example Stack Trace

```
Error: Cannot read property 'xyz' of undefined
    at POST (/var/task/app/api/webhooks/n8n/feedback/route.ts:545:45)
    at async handler (/var/task/node_modules/next/dist/server/route-handler.js:45:12)
    at async /var/task/node_modules/next/dist/server/route-handler.js:78:12
```

### Breaking It Down

**Line 1: Error Message**
```
Error: Cannot read property 'xyz' of undefined
```
- **What:** Tried to access property `xyz` on `undefined`
- **Why:** `body.nonExistentProperty` is `undefined`
- **Where:** In the POST handler

**Line 2: Your Code**
```
at POST (/var/task/app/api/webhooks/n8n/feedback/route.ts:545:45)
```
- **Function:** `POST` (your handler)
- **File:** `app/api/webhooks/n8n/feedback/route.ts`
- **Line:** 545
- **Column:** 45
- **This is where the error occurred!**

**Line 3+: Framework Code**
```
at async handler (/var/task/node_modules/next/dist/server/route-handler.js:45:12)
```
- **Framework:** Next.js route handler
- **Not your code:** Can ignore for now
- **Shows call chain:** How the error propagated

### Reading Tips

1. **Start from the top:** First line is the actual error
2. **Find your file:** Look for `route.ts` in the stack
3. **Check line number:** Match to your source code (line 545)
4. **Ignore framework:** Focus on your code files

---

## Step 6: Identify the Root Cause

### Analyze the Error

**Error Message:**
```
Cannot read property 'xyz' of undefined
```

**Questions to Ask:**

1. **What property?** → `xyz`
2. **What was undefined?** → `body.nonExistentProperty`
3. **Why undefined?** → `nonExistentProperty` doesn't exist in `body`
4. **Where in code?** → Line 545 in `route.ts`

### Check Your Code

**Open:** `src/app/api/webhooks/n8n/feedback/route.ts`

**Go to line 545:**
```typescript
const testError = body.nonExistentProperty.xyz; // This will throw
```

**Analysis:**
- `body` exists (we parsed it successfully)
- `body.nonExistentProperty` doesn't exist → returns `undefined`
- Accessing `.xyz` on `undefined` throws the error

**Root Cause:**
- Code assumes `body.nonExistentProperty` exists
- But it's not in the payload
- No null check before accessing `.xyz`

---

## Step 7: Fix the Error

### Remove the Intentional Error

**File:** `src/app/api/webhooks/n8n/feedback/route.ts`

**Find this code (around line 545):**
```typescript
// PRACTICE ERROR: Intentional error for learning Vercel logs
// TODO: Remove this after practice exercise
// Simulating a common production error: accessing property on undefined
const testError = body.nonExistentProperty.xyz; // This will throw: Cannot read property 'xyz' of undefined
```

**Delete it completely:**
```typescript
// Remove the entire block above
```

**Result:**
```typescript
// ========================================================================
// STEP 4: INSERT INTO SUPABASE
// ========================================================================
// Use service role client to bypass RLS (server-to-server operation)
const supabase = createSupabaseServiceClient();
```

### Commit the Fix

```bash
# Stage the fix
git add src/app/api/webhooks/n8n/feedback/route.ts

# Commit
git commit -m "fix: remove intentional error from webhook endpoint

- Remove practice error code
- Webhook should work correctly now"

# Push to trigger deployment
git push origin main
```

---

## Step 8: Verify the Fix

### Wait for Deployment

1. Go to Vercel dashboard
2. Wait for new deployment to complete
3. Status should be "Ready"

### Test Again

1. **Submit feedback again:**
   - Go to production site
   - Click "Give Feedback"
   - Submit: "Testing after fix"

2. **Expected result:**
   - ✅ Form shows success
   - ✅ No errors in logs
   - ✅ Feedback stored in Supabase

### Check Logs Again

1. **Go to Vercel → Logs**
2. **Filter:** `/api/webhooks/n8n/feedback`
3. **Look for:**
   ```
   [WEBHOOK] 2025-01-15T10:00:01Z | IP | SUCCESS | Feedback stored successfully
   ```
4. **Should NOT see:**
   - ❌ Error messages
   - ❌ Stack traces
   - ❌ "Cannot read property" errors

### Verify in Supabase

1. Go to Supabase dashboard
2. Check `feedback` table
3. Should see new row with your test feedback

---

## Step 9: Understanding What You Learned

### Key Takeaways

1. **Vercel logs location:**
   - Dashboard → Project → Logs tab
   - Filter by function, time, level

2. **Error identification:**
   - Red/highlighted entries
   - Error messages at top
   - Stack traces show location

3. **Stack trace reading:**
   - First line = actual error
   - Your files = where to look
   - Line numbers = exact location
   - Framework code = can ignore

4. **Root cause analysis:**
   - Read error message carefully
   - Check line number in your code
   - Understand what was undefined/null
   - Identify why it was undefined

5. **Fixing errors:**
   - Remove problematic code
   - Add null checks if needed
   - Test the fix
   - Verify in logs

---

## Common Error Patterns (For Future Reference)

### Pattern 1: Null/Undefined Access

**Error:**
```
Cannot read property 'xyz' of undefined
```

**Fix:**
```typescript
// Before (error)
const value = data.property.xyz;

// After (fixed)
const value = data.property?.xyz;
// Or
if (data.property) {
  const value = data.property.xyz;
}
```

### Pattern 2: Missing Environment Variable

**Error:**
```
process.env.N8N_WEBHOOK_SECRET is undefined
```

**Fix:**
- Check Vercel environment variables
- Ensure variable is set for Production

### Pattern 3: Database Error

**Error:**
```
Connection timeout
```

**Fix:**
- Check Supabase connection
- Verify service role key
- Check network connectivity

### Pattern 4: JSON Parse Error

**Error:**
```
Unexpected token in JSON at position X
```

**Fix:**
- Validate JSON before parsing
- Check request body format
- Ensure Content-Type header is correct

---

## Exercise Checklist

- [ ] Error added to webhook endpoint
- [ ] Committed and pushed to production
- [ ] Deployment completed
- [ ] Error triggered (submitted feedback)
- [ ] Found error in Vercel logs
- [ ] Read and understood stack trace
- [ ] Identified root cause
- [ ] Fixed the error
- [ ] Verified fix works
- [ ] Removed error code

---

## Next Steps

Now that you've practiced:

1. **Monitor logs regularly:**
   - Check Vercel logs daily
   - Look for errors
   - Fix issues proactively

2. **Add better error handling:**
   - Add try/catch blocks
   - Log helpful context
   - Return user-friendly errors

3. **Set up alerts:**
   - Configure Vercel alerts for errors
   - Get notified when errors occur
   - Respond quickly

---

**Great job completing the exercise!** You now know how to:
- Find errors in Vercel logs
- Read stack traces
- Identify root causes
- Fix errors quickly

**Keep practicing!** 🚀

