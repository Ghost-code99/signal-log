# Feedback Webhook Endpoint - Stage 2 Testing Guide

**Stage:** Stage 2 - Webhook Endpoint to Receive Processed Feedback  
**Date:** January 2025

---

## Overview

This guide walks you through testing the webhook endpoint that receives processed feedback from n8n and stores it in Supabase.

---

## Prerequisites

1. ✅ **Stage 1 Complete:** Feedback submission to n8n working
2. ✅ **Supabase feedback table created** (migration applied)
3. ✅ **Environment variables set:**
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `N8N_FEEDBACK_WEBHOOK_URL` (for Stage 1)

---

## Step 1: Apply Database Migration

### Option A: Using Supabase Dashboard

1. **Open Supabase Dashboard:**
   - Go to your Supabase project
   - Navigate to **SQL Editor**

2. **Run the migration:**
   - Copy contents of `supabase/schemas/09-feedback.sql`
   - Paste into SQL Editor
   - Click **Run**

3. **Verify table created:**
   - Go to **Table Editor**
   - Look for `feedback` table
   - Verify all columns exist

### Option B: Using Supabase CLI

```bash
# If you have Supabase CLI installed
supabase db push
```

### Option C: Using Supabase MCP (if available)

Use the MCP tool to apply the migration.

---

## Step 2: Verify Environment Variables

Check your `.env.local` file has:

```bash
# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# n8n (for Stage 1)
N8N_FEEDBACK_WEBHOOK_URL=https://your-n8n-instance.com/webhook/xxxxx
```

**Important:**
- `SUPABASE_SERVICE_ROLE_KEY` is required for webhook endpoint (bypasses RLS)
- Never expose service role key to client-side code
- Restart dev server after adding env vars

---

## Step 3: Test with curl (Before Connecting n8n)

### Test 1: Valid Payload

```bash
curl -X POST http://localhost:3000/api/webhooks/n8n/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_2abc123def",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "message": "This is a test feedback message",
    "browser": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    "timestamp": "2025-01-28T10:00:00.000Z",
    "url": "http://localhost:3000/dashboard",
    "sentiment": "positive",
    "category": "feature_request",
    "priority": "medium",
    "summary": "User requests a new feature",
    "actionable": true,
    "processedAt": "2025-01-28T10:00:03.000Z"
  }'
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Feedback stored successfully"
}
```

### Test 2: Missing Required Fields

```bash
curl -X POST http://localhost:3000/api/webhooks/n8n/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_2abc123def",
    "message": "Test message"
  }'
```

**Expected Response (400):**
```json
{
  "success": false,
  "error": "Missing required fields: firstName, lastName, timestamp, processedAt"
}
```

### Test 3: Invalid JSON

```bash
curl -X POST http://localhost:3000/api/webhooks/n8n/feedback \
  -H "Content-Type: application/json" \
  -d 'invalid json'
```

**Expected Response (400):**
```json
{
  "success": false,
  "error": "Invalid JSON payload"
}
```

### Test 4: Invalid Field Types

```bash
curl -X POST http://localhost:3000/api/webhooks/n8n/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 123,
    "firstName": "John",
    "lastName": "Doe",
    "message": "Test",
    "timestamp": "2025-01-28T10:00:00.000Z",
    "processedAt": "2025-01-28T10:00:03.000Z",
    "actionable": "not-a-boolean"
  }'
```

**Expected Response (400):**
```json
{
  "success": false,
  "error": "Invalid actionable: must be a boolean"
}
```

---

## Step 4: Verify Data in Supabase

### Option A: Using Supabase Dashboard

1. **Open Supabase Dashboard**
2. **Navigate to Table Editor**
3. **Select `feedback` table**
4. **Verify new record:**
   - Check all fields are populated
   - Verify `created_at` and `processed_at` timestamps
   - Verify AI analysis fields (sentiment, category, priority, summary, actionable)

### Option B: Using SQL Query

```sql
SELECT 
  id,
  user_id,
  first_name,
  last_name,
  email,
  message,
  category,
  priority,
  sentiment,
  actionable,
  created_at,
  processed_at
FROM feedback
ORDER BY created_at DESC
LIMIT 1;
```

---

## Step 5: Test End-to-End with n8n

### Update n8n HTTP Request Node

1. **Open your n8n workflow**
2. **Click on HTTP Request node** (the callback node)
3. **Update URL:**
   - For local testing: `http://localhost:3000/api/webhooks/n8n/feedback`
   - For production: `https://yourdomain.com/api/webhooks/n8n/feedback`
4. **Save workflow**

### Submit Feedback Through App

1. **Open your app**
2. **Sign in**
3. **Click "Give Feedback"**
4. **Enter test message**
5. **Submit**

### Verify Complete Flow

1. **Check n8n execution history:**
   - Webhook node: ✅ Success
   - AI Agent node: ✅ Success
   - Gmail node: ✅ Success
   - **HTTP Request node: ✅ Success** (should now work!)

2. **Check app logs:**
   - Should see: `✅ Feedback stored successfully`

3. **Check Supabase:**
   - New record in `feedback` table
   - All fields populated correctly

---

## Step 6: Test Error Scenarios

### Test Database Error

Temporarily break the database connection to test error handling:

1. **Set wrong Supabase URL** in `.env.local`
2. **Restart dev server**
3. **Send test request**
4. **Expected:** 500 error with user-friendly message

### Test Validation Errors

Send requests with:
- Missing required fields
- Invalid field types
- Empty strings for required fields

**Expected:** 400 errors with specific error messages

---

## Verification Checklist

### ✅ API Route
- [ ] Handles POST requests correctly
- [ ] Parses JSON body
- [ ] Validates required fields
- [ ] Validates field types
- [ ] Returns 400 for invalid payloads
- [ ] Returns 500 for database errors
- [ ] Returns 200 for successful inserts
- [ ] Logs errors for debugging
- [ ] Doesn't expose sensitive error details in production

### ✅ Database
- [ ] `feedback` table exists
- [ ] All columns match PRD schema
- [ ] Indexes created
- [ ] RLS policies active
- [ ] Data inserts successfully
- [ ] All fields mapped correctly

### ✅ End-to-End
- [ ] n8n workflow calls webhook successfully
- [ ] Data stored in Supabase
- [ ] All fields populated correctly
- [ ] Timestamps correct
- [ ] AI analysis fields present

---

## Troubleshooting

### Issue: "SUPABASE_SERVICE_ROLE_KEY environment variable is not set"

**Solution:**
- Add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local`
- Get the key from Supabase Dashboard → Settings → API → Service Role Key
- Restart dev server

### Issue: "Database error: failed to insert feedback"

**Possible causes:**
- Table doesn't exist (migration not applied)
- Column mismatch
- RLS policy blocking (shouldn't happen with service role, but check)

**Solutions:**
1. Verify migration was applied
2. Check table structure matches schema
3. Check Supabase logs for detailed error

### Issue: "Invalid JSON payload"

**Solution:**
- Verify request has `Content-Type: application/json` header
- Check JSON is valid (no trailing commas, proper quotes)
- Verify n8n HTTP Request node has correct headers

### Issue: "Missing required fields"

**Solution:**
- Check n8n HTTP Request node body configuration
- Verify all required fields are included
- Check field names match exactly (case-sensitive)

---

## Expected Payload Structure

### n8n → App Webhook

```json
{
  "userId": "user_2abc123def",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "message": "User's feedback text",
  "browser": "Mozilla/5.0...",
  "timestamp": "2025-01-28T10:00:00.000Z",
  "url": "https://yourdomain.com/dashboard",
  "sentiment": "positive",
  "category": "feature_request",
  "priority": "medium",
  "summary": "One sentence summary",
  "actionable": true,
  "processedAt": "2025-01-28T10:00:03.000Z"
}
```

### Database Mapping

| Payload Field | Database Column | Type |
|--------------|----------------|------|
| `userId` | `user_id` | TEXT |
| `firstName` | `first_name` | TEXT |
| `lastName` | `last_name` | TEXT |
| `email` | `email` | TEXT (nullable) |
| `message` | `message` | TEXT |
| `browser` | `browser` | TEXT (nullable) |
| `url` | `url` | TEXT (nullable) |
| `sentiment` | `sentiment` | TEXT (nullable) |
| `category` | `category` | TEXT (nullable) |
| `priority` | `priority` | TEXT (nullable) |
| `summary` | `summary` | TEXT (nullable) |
| `actionable` | `actionable` | BOOLEAN (nullable) |
| `timestamp` | `created_at` | TIMESTAMPTZ |
| `processedAt` | `processed_at` | TIMESTAMPTZ (nullable) |

---

## Next Steps

After Stage 2 is working:

1. ✅ **Stage 2 Complete:** Webhook endpoint stores feedback in Supabase
2. ⏭️ **Stage 3:** Verify RLS policies work correctly
3. ⏭️ **Stage 4:** Test end-to-end with Vercel preview

---

**Ready to test?** Start with the curl commands above, then verify in Supabase! 🚀

