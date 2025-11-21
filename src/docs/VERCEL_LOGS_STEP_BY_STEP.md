# Vercel Logs Practice - Step by Step

**Complete walkthrough: Add error → Find it → Fix it**

---

## ✅ Step 1: Error Added

**Location:** `src/app/api/webhooks/n8n/feedback/route.ts` (line ~603)

**Error Code:**
```typescript
const testError = body.nonExistentProperty.xyz;
```

**What This Does:**
- Tries to access `xyz` property on `body.nonExistentProperty`
- But `nonExistentProperty` doesn't exist in the payload
- So `body.nonExistentProperty` is `undefined`
- Accessing `.xyz` on `undefined` throws: `Cannot read property 'xyz' of undefined`

**This is a common production error!**

---

## Step 2: Commit and Push

### Check Current Status

```bash
cd /Users/ghost_/Desktop/Signal-log/signal-log
git status
```

### Stage the File

```bash
git add src/app/api/webhooks/n8n/feedback/route.ts
```

### Commit

```bash
git commit -m "test: add intentional error for Vercel logs practice

- Add temporary error to webhook endpoint
- This is for learning purposes only
- Will be removed after exercise"
```

### Push to Production

```bash
# Check which branch you're on
git branch --show-current

# If on main:
git push origin main

# If on user-feedback:
git push origin user-feedback
# Then merge to main (see merge guide)
```

### Wait for Deployment

1. Go to: https://vercel.com/dashboard
2. Select your project
3. Watch "Deployments" tab
4. Wait for status: "Ready" (green checkmark)
5. **Note the deployment time** (you'll need this)

---

## Step 3: Trigger the Error

### Method 1: Through the App (Recommended)

1. **Go to production site:**
   - Visit: `https://your-domain.com`
   - Or your Vercel domain

2. **Submit feedback:**
   - Click "Give Feedback" button
   - Enter message: "Testing error logs"
   - Click "Submit"

3. **Expected:**
   - Form shows error message
   - Webhook failed (this is expected!)

### Method 2: Direct curl (Alternative)

```bash
curl -X POST https://your-domain.com/api/webhooks/n8n/feedback \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_API_KEY_HERE" \
  -d '{
    "userId": "test-123",
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "message": "Testing error",
    "browser": "curl",
    "url": "https://example.com",
    "timestamp": "2025-01-15T10:00:00Z",
    "sentiment": "positive",
    "category": "bug",
    "priority": "high",
    "summary": "Test",
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

## Step 4: Find Error in Vercel Logs

### Access Vercel Dashboard

1. **Go to:** https://vercel.com/dashboard
2. **Select project:** `signal-log`
3. **Click "Logs"** (in left sidebar)

### Filter the Logs

**Option 1: Filter by Function**
1. In the search/filter box at top
2. Type: `/api/webhooks/n8n/feedback`
3. Press Enter

**Option 2: Use Function Dropdown**
1. Look for "Function" dropdown
2. Select: `/api/webhooks/n8n/feedback`

**Option 3: Filter by Time**
1. Click time picker (top right)
2. Select "Last 5 minutes" (or when you triggered error)
3. Or click "Live" for real-time logs

### Identify the Error

**What you're looking for:**

1. **Red/highlighted entry**
   - Usually at the top of filtered results
   - Says "Error" or "Exception"

2. **Your custom log:**
   ```
   [WEBHOOK] 2025-01-15T10:00:00Z | 192.168.1.1 | ERROR | ...
   ```

3. **Error message:**
   ```
   Error: Cannot read property 'xyz' of undefined
   ```

4. **Stack trace:**
   ```
   at POST (/var/task/app/api/webhooks/n8n/feedback/route.ts:603:XX)
   ```

**Screenshot what you see!** This helps you remember the pattern.

---

## Step 5: Read the Stack Trace

### Example Stack Trace

```
Error: Cannot read property 'xyz' of undefined
    at POST (/var/task/app/api/webhooks/n8n/feedback/route.ts:603:45)
    at async handler (/var/task/node_modules/next/dist/server/route-handler.js:45:12)
    at async /var/task/node_modules/next/dist/server/route-handler.js:78:12
```

### Breaking It Down Line by Line

**Line 1: Error Message**
```
Error: Cannot read property 'xyz' of undefined
```
- **What happened:** Tried to access property `xyz` on something that's `undefined`
- **What property:** `xyz`
- **What was undefined:** `body.nonExistentProperty`

**Line 2: Your Code (This is the important one!)**
```
at POST (/var/task/app/api/webhooks/n8n/feedback/route.ts:603:45)
```
- **Function:** `POST` (your webhook handler)
- **File path:** `/var/task/app/api/webhooks/n8n/feedback/route.ts`
  - In Vercel, `/var/task/` is the deployment root
  - Your actual file: `src/app/api/webhooks/n8n/feedback/route.ts`
- **Line number:** `603` (where the error occurred)
- **Column:** `45` (character position on that line)

**Line 3+: Framework Code (Can ignore)**
```
at async handler (/var/task/node_modules/next/dist/server/route-handler.js:45:12)
```
- This is Next.js framework code
- Shows how the error propagated
- Not your code, so you can ignore it

### How to Use This Information

1. **Open your code editor**
2. **Navigate to:** `src/app/api/webhooks/n8n/feedback/route.ts`
3. **Go to line 603** (or the line number from stack trace)
4. **Look at that line:**
   ```typescript
   const testError = body.nonExistentProperty.xyz;
   ```
5. **This is where the error happened!**

---

## Step 6: Identify Root Cause

### Analyze the Error

**Error says:**
```
Cannot read property 'xyz' of undefined
```

**Questions to answer:**

1. **What property?** → `xyz`
2. **What was undefined?** → `body.nonExistentProperty`
3. **Why undefined?** → `nonExistentProperty` doesn't exist in the payload
4. **Where?** → Line 603 in `route.ts`

### Check Your Code

**At line 603:**
```typescript
const testError = body.nonExistentProperty.xyz;
```

**Analysis:**
- `body` exists ✅ (we parsed JSON successfully)
- `body.nonExistentProperty` doesn't exist ❌ → returns `undefined`
- Accessing `.xyz` on `undefined` throws error ❌

**Root Cause:**
- Code assumes `body.nonExistentProperty` exists
- But it's not in the webhook payload
- No null/undefined check before accessing `.xyz`

### Real-World Scenario

This happens when:
- You assume a field exists but it's optional
- API changes and removes a field
- Frontend doesn't send all expected fields
- Data structure is different than expected

**Fix:** Always check if property exists before accessing nested properties.

---

## Step 7: Fix the Error

### Remove the Intentional Error

**File:** `src/app/api/webhooks/n8n/feedback/route.ts`

**Find this code (around line 603):**
```typescript
// ========================================================================
// PRACTICE ERROR: Intentional error for learning Vercel logs
// TODO: Remove this after practice exercise
// ========================================================================
// Simulating a common production error: accessing property on undefined
// This will throw: "Cannot read property 'xyz' of undefined"
const testError = body.nonExistentProperty.xyz;
```

**Delete the entire block** (lines with the error and comments)

**Result should be:**
```typescript
// Create Supabase client with service role (bypasses RLS for webhook)
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

### Wait for Deployment

1. Go to Vercel dashboard
2. Wait for new deployment
3. Status should be "Ready"

---

## Step 8: Verify the Fix

### Test Again

1. **Go to production site**
2. **Submit feedback:**
   - Click "Give Feedback"
   - Enter: "Testing after fix"
   - Click "Submit"

3. **Expected:**
   - ✅ Form shows success message
   - ✅ No errors
   - ✅ Feedback stored

### Check Logs Again

1. **Go to Vercel → Logs**
2. **Filter:** `/api/webhooks/n8n/feedback`
3. **Look for latest entry:**
   ```
   [WEBHOOK] 2025-01-15T10:00:01Z | IP | SUCCESS | Feedback stored successfully
   ```
4. **Should NOT see:**
   - ❌ "Cannot read property" errors
   - ❌ Stack traces
   - ❌ Red error entries

### Verify in Supabase

1. **Go to Supabase dashboard**
2. **Open SQL Editor or Table Editor**
3. **Check `feedback` table**
4. **Should see:**
   - New row with your test feedback
   - All fields populated
   - `sentiment`, `category`, `priority` from AI analysis

---

## What You Learned

### ✅ Key Skills

1. **Finding errors in Vercel:**
   - Dashboard → Logs tab
   - Filter by function, time, level

2. **Reading stack traces:**
   - First line = error message
   - Your files = where to look
   - Line numbers = exact location

3. **Identifying root cause:**
   - Read error message
   - Check line number
   - Understand what was undefined/null

4. **Fixing errors:**
   - Remove problematic code
   - Add null checks if needed
   - Test and verify

### 🎯 Common Patterns

**Pattern 1: Null/Undefined Access**
```typescript
// Error
const value = data.property.xyz;

// Fix
const value = data.property?.xyz;
```

**Pattern 2: Missing Validation**
```typescript
// Error
if (!data.property) {
  // Should return, but continues
}
const value = data.property.xyz;

// Fix
if (!data.property) {
  return NextResponse.json({ error: 'Missing property' }, { status: 400 });
}
```

---

## Next Steps

1. **Monitor logs regularly:**
   - Check daily for errors
   - Fix issues proactively

2. **Add better error handling:**
   - Try/catch blocks
   - Helpful error messages
   - Proper logging

3. **Set up alerts:**
   - Vercel error notifications
   - Get alerted when errors occur

---

**Congratulations!** You've completed the exercise! 🎉

You now know how to:
- ✅ Find errors in Vercel logs
- ✅ Read stack traces
- ✅ Identify root causes
- ✅ Fix errors quickly

**Keep practicing!** 🚀

