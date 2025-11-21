# Feedback Submission - Stage 1 Testing Guide

**Stage:** Stage 1 - Feedback Form Submission  
**Date:** January 2025

---

## Overview

This guide walks you through testing the feedback submission feature that calls the n8n webhook.

---

## Prerequisites

1. ✅ **Server Action created** at `app/actions/submit-feedback.ts`
2. ✅ **Feedback modal updated** to use Server Action
3. ✅ **n8n workflow configured** with Webhook Trigger (from previous section)
4. ✅ **Environment variable set** for n8n webhook URL

---

## Environment Variable Setup

### Local Development (`.env.local`)

Create or update `.env.local` in your project root:

```bash
# n8n Webhook URL (from n8n Production URL)
N8N_FEEDBACK_WEBHOOK_URL=https://your-n8n-instance.com/webhook/xxxxx
```

**Important:**
- Use the **Production URL** from your n8n Webhook node
- The URL is only available when the workflow is **activated**
- Restart your Next.js dev server after adding/updating the env var

### Vercel Environment Variables

For preview and production deployments, add the environment variable in Vercel:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add:
   - **Name:** `N8N_FEEDBACK_WEBHOOK_URL`
   - **Value:** Your n8n webhook Production URL
   - **Environment:** Select all (Production, Preview, Development)

---

## Testing Steps

### Step 1: Verify Environment Variable

1. **Check `.env.local` exists** in project root
2. **Verify variable name:** `N8N_FEEDBACK_WEBHOOK_URL` (not `NEXT_PUBLIC_*`)
3. **Restart dev server** if you just added it:
   ```bash
   npm run dev
   ```

### Step 2: Test Feedback Submission

1. **Start your app:**
   ```bash
   npm run dev
   ```

2. **Open your app** in browser (e.g., `http://localhost:3000`)

3. **Sign in** (if required) - feedback requires authentication

4. **Click "Give Feedback"** link (usually in footer)

5. **Fill in feedback form:**
   - Enter a test message: `"This is a test feedback submission"`
   - Click "Send Feedback"

6. **Observe behavior:**
   - ✅ Button shows "Sending..." loading state
   - ✅ Success message appears: "Thank you for your feedback!"
   - ✅ Modal closes automatically after 2 seconds
   - ❌ If error occurs, error message displays

### Step 3: Check n8n Execution History

1. **Open your n8n dashboard**

2. **Navigate to your workflow** (the one with Webhook Trigger)

3. **Click "Executions"** tab (or "Execution History")

4. **Look for recent execution:**
   - Should show a new execution with timestamp matching your submission
   - Status should be "Success" (green) or "Error" (red)

5. **Click on the execution** to view details

6. **Verify data flow:**

   **a. Webhook Node:**
   - ✅ Should show received payload
   - ✅ Check payload structure:
     ```json
     {
       "userId": "user_xxxxx",
       "firstName": "John",
       "lastName": "Doe",
       "email": "john@example.com",
       "message": "This is a test feedback submission",
       "browser": "Mozilla/5.0...",
       "timestamp": "2025-01-28T10:00:00Z",
       "url": "http://localhost:3000/..."
     }
     ```

   **b. AI Agent Node:**
   - ✅ Should show processed output
   - ✅ Check for structured JSON:
     ```json
     {
       "sentiment": "positive" | "negative" | "neutral",
       "category": "bug" | "feature_request" | "question" | "other",
       "priority": "low" | "medium" | "high",
       "summary": "One sentence summary",
       "actionable": true | false
     }
     ```

   **c. Gmail Node:**
   - ✅ Should show email sent
   - ✅ Check your email inbox for notification

   **d. HTTP Request Node (Callback):**
   - ⚠️ May show error if app webhook endpoint not set up yet (that's OK for Stage 1)
   - ✅ Should show attempted POST to your app endpoint

### Step 4: Check App Logs

1. **Check browser console:**
   - Open browser DevTools (F12)
   - Look for any errors in Console tab
   - Should see success message or error details

2. **Check server logs:**
   - Look at your terminal where `npm run dev` is running
   - Should see logs like:
     ```
     ✅ Feedback submitted successfully: { userId: '...', email: '...', ... }
     ```
   - Or error logs if something failed:
     ```
     ❌ Error in submitFeedback: ...
     ```

### Step 5: Test Error Scenarios

#### Test 1: Missing Message
1. Open feedback modal
2. Don't enter any message
3. Try to submit
4. ✅ Should show validation error: "Please share your thoughts"

#### Test 2: Network Error (n8n Down)
1. Temporarily set wrong webhook URL in `.env.local`
2. Submit feedback
3. ✅ Should show user-friendly error: "Failed to send feedback. Please try again later."
4. ✅ Should NOT expose internal error details

#### Test 3: Timeout
1. If n8n is slow, wait for 10 seconds
2. ✅ Should show timeout error after 10 seconds
3. ✅ Error message should be user-friendly

#### Test 4: Unauthenticated User
1. Sign out
2. Try to submit feedback
3. ✅ Should show authentication error (if auth is required)

---

## Verification Checklist

### ✅ Server Action
- [ ] Extracts user data from Clerk session correctly
- [ ] Gets browser info from headers
- [ ] Gets current URL (from parameter or referer header)
- [ ] Validates required fields (userId, message)
- [ ] Calls n8n webhook with correct payload structure
- [ ] Handles errors gracefully
- [ ] Returns structured response: `{success: boolean, message?: string, error?: string}`

### ✅ Feedback Modal
- [ ] Calls Server Action on form submit
- [ ] Shows loading state ("Sending...")
- [ ] Shows success message after submission
- [ ] Shows error message if submission fails
- [ ] Closes modal after successful submission (2 seconds)
- [ ] Resets form after submission

### ✅ n8n Workflow
- [ ] Webhook receives POST request
- [ ] Payload structure matches expected format
- [ ] AI Agent processes message correctly
- [ ] Gmail sends notification email
- [ ] HTTP Request attempts callback (may fail if endpoint not set up)

### ✅ Error Handling
- [ ] Validation errors show user-friendly messages
- [ ] Network errors don't expose internal details
- [ ] Timeout errors handled (10 seconds)
- [ ] Server errors logged but not exposed to user

---

## Troubleshooting

### Issue: "User not authenticated"
**Solution:**
- Make sure you're signed in
- Check Clerk authentication is working
- Verify `auth()` is returning userId

### Issue: "N8N_FEEDBACK_WEBHOOK_URL environment variable not set"
**Solution:**
- Check `.env.local` exists in project root
- Verify variable name is exactly `N8N_FEEDBACK_WEBHOOK_URL`
- Restart dev server after adding env var
- For Vercel, add env var in dashboard

### Issue: "Failed to send feedback" (but no specific error)
**Solution:**
- Check n8n workflow is **activated**
- Verify webhook URL is correct (Production URL, not Test URL)
- Check n8n execution history for errors
- Verify network connectivity to n8n instance

### Issue: n8n webhook timeout
**Solution:**
- Check n8n instance is running
- Verify webhook URL is accessible
- Check n8n workflow execution logs
- May need to increase timeout (currently 10 seconds)

### Issue: Payload structure mismatch
**Solution:**
- Verify Server Action sends exact structure from PRD
- Check n8n Webhook node receives correct structure
- Compare payload in n8n execution with expected format

---

## Expected Payload Structure

### App → n8n (Server Action sends)

```json
{
  "userId": "user_2abc123def",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "message": "User's feedback text",
  "browser": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36...",
  "timestamp": "2025-01-28T10:00:00.000Z",
  "url": "http://localhost:3000/dashboard"
}
```

**Field Validation:**
- ✅ `userId`: Required, Clerk user ID
- ✅ `firstName`: Required, from Clerk user object
- ✅ `lastName`: Required, from Clerk user object (can be empty string)
- ✅ `email`: Required, from Clerk user email addresses
- ✅ `message`: Required, trimmed, min 1 character
- ✅ `browser`: Optional, from User-Agent header (defaults to "Unknown")
- ✅ `timestamp`: Required, ISO 8601 format
- ✅ `url`: Optional, from window.location.href or referer header (defaults to "Unknown")

---

## Next Steps

After Stage 1 is working:

1. ✅ **Stage 1 Complete:** Feedback submission to n8n working
2. ⏭️ **Stage 2:** Create webhook endpoint to receive processed data from n8n
3. ⏭️ **Stage 3:** Create Supabase feedback table and store data
4. ⏭️ **Stage 4:** Test end-to-end with Vercel preview

---

## Quick Test Command

You can also test the Server Action directly using curl (if you want to bypass the UI):

```bash
# This won't work directly since it's a Server Action, but you can test the n8n webhook:
curl -X POST YOUR_N8N_WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_test123",
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "message": "Test feedback message",
    "browser": "Mozilla/5.0 (Test)",
    "timestamp": "2025-01-28T10:00:00Z",
    "url": "https://example.com/test"
  }'
```

Then check n8n execution history to verify it was received and processed.

---

**Ready to test?** Follow the steps above and check n8n execution history to verify everything works! 🚀

