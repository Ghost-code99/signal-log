# How to Test Feedback Submission and Check n8n Execution History

**Quick guide for verifying Stage 1 feedback submission works correctly**

---

## Step-by-Step Testing Process

### Step 1: Set Up Environment Variable

1. **Create or update `.env.local`** in your project root:
   ```bash
   N8N_FEEDBACK_WEBHOOK_URL=https://your-n8n-instance.com/webhook/xxxxx
   ```
   Replace `xxxxx` with your actual n8n webhook Production URL.

2. **Get your n8n webhook URL:**
   - Open your n8n dashboard
   - Navigate to your workflow (the one with Webhook Trigger)
   - Make sure workflow is **activated** (toggle switch in top-right)
   - Click on the **Webhook** node
   - Copy the **Production URL** (not Test URL)
   - It should look like: `https://your-n8n-instance.com/webhook/xxxxx-xxxxx-xxxxx`

3. **Restart your dev server:**
   ```bash
   npm run dev
   ```

---

### Step 2: Submit Test Feedback

1. **Open your app** in browser (e.g., `http://localhost:3000`)

2. **Sign in** (feedback requires authentication via Clerk)

3. **Click "Give Feedback"** link (usually in footer)

4. **Enter test message:**
   ```
   This is a test feedback submission to verify n8n integration works correctly.
   ```

5. **Click "Send Feedback"**

6. **Expected behavior:**
   - ✅ Button shows "Sending..." loading state
   - ✅ Success message appears: "Thank you for your feedback!"
   - ✅ Modal closes automatically after 2 seconds

---

### Step 3: Check n8n Execution History

#### Option A: View Recent Executions

1. **Open your n8n dashboard**

2. **Navigate to your workflow**

3. **Click "Executions" tab** (or look for "Execution History" in the sidebar)

4. **Find your execution:**
   - Look for the most recent execution
   - It should have a timestamp matching when you submitted feedback
   - Status should be **"Success"** (green) or **"Error"** (red)

5. **Click on the execution** to view details

#### Option B: View Workflow Executions

1. **In your workflow view**, look for an **"Executions"** section or button
2. **Click to see all executions** for this workflow
3. **Find the most recent one** (should be at the top)

---

### Step 4: Verify Each Node in n8n

Once you've opened an execution, you'll see all the nodes in your workflow. Verify each one:

#### ✅ Webhook Node (First Node)

**What to check:**
- Node should show **"Success"** status (green)
- Click on the node to see the received data

**Expected payload:**
```json
{
  "userId": "user_2abc123def",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "message": "This is a test feedback submission...",
  "browser": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)...",
  "timestamp": "2025-01-28T10:00:00.000Z",
  "url": "http://localhost:3000/dashboard"
}
```

**Verify:**
- ✅ All 8 fields are present
- ✅ `userId` matches your Clerk user ID
- ✅ `firstName`, `lastName`, `email` are correct
- ✅ `message` matches what you typed
- ✅ `browser` contains user-agent string
- ✅ `timestamp` is in ISO 8601 format
- ✅ `url` matches the page you submitted from

#### ✅ AI Agent Node

**What to check:**
- Node should show **"Success"** status (green)
- Click on the node to see AI analysis output

**Expected output:**
```json
{
  "sentiment": "positive" | "negative" | "neutral",
  "category": "bug" | "feature_request" | "question" | "other",
  "priority": "low" | "medium" | "high",
  "summary": "One sentence summary of the feedback",
  "actionable": true | false
}
```

**Verify:**
- ✅ All 5 fields are present
- ✅ `sentiment` is one of: "positive", "negative", "neutral"
- ✅ `category` is one of: "bug", "feature_request", "question", "other"
- ✅ `priority` is one of: "low", "medium", "high"
- ✅ `summary` is a non-empty string
- ✅ `actionable` is a boolean (true or false)

#### ✅ Gmail Node

**What to check:**
- Node should show **"Success"** status (green)
- Check your email inbox for the notification

**Verify email contains:**
- ✅ User info (name, email)
- ✅ Original message
- ✅ AI analysis (sentiment, category, priority, summary, actionable)
- ✅ Context (browser, URL, timestamp)

#### ✅ HTTP Request Node (Callback)

**What to check:**
- Node may show **"Error"** status (red) - **This is OK for Stage 1!**
- The error is expected because the app webhook endpoint isn't set up yet (that's Stage 2)

**If it shows error:**
- ✅ This is normal - we'll fix it in Stage 2
- The error should be something like: "404 Not Found" or "Connection refused"
- This means n8n tried to call your app, but the endpoint doesn't exist yet

**If it shows success:**
- ✅ Great! Your app webhook endpoint is already set up
- Check your app logs to verify it received the data

---

### Step 5: Check App Logs

1. **Check browser console:**
   - Open DevTools (F12)
   - Go to Console tab
   - Look for any errors (should be none if everything worked)

2. **Check server logs:**
   - Look at your terminal where `npm run dev` is running
   - Should see:
     ```
     ✅ Feedback submitted successfully: { userId: '...', email: '...', messageLength: 123, timestamp: '...' }
     ```

---

## Troubleshooting n8n Execution History

### Issue: No executions appear

**Possible causes:**
- Workflow is not activated
- Webhook URL is incorrect
- Network connectivity issue

**Solutions:**
1. Check workflow is **activated** (toggle switch should be ON)
2. Verify webhook URL in `.env.local` matches Production URL from n8n
3. Check n8n instance is running and accessible
4. Try submitting feedback again

### Issue: Webhook node shows error

**Possible causes:**
- Payload structure mismatch
- Missing required fields
- Network timeout

**Solutions:**
1. Check the error message in the node
2. Verify payload structure matches expected format
3. Check all required fields are present
4. Verify network connectivity to n8n

### Issue: AI Agent node shows error

**Possible causes:**
- AI service (OpenRouter) is down
- API key not configured
- Invalid prompt format

**Solutions:**
1. Check AI Agent node configuration
2. Verify OpenRouter API key is set
3. Check AI Agent prompt format
4. Review error message in the node

### Issue: Gmail node shows error

**Possible causes:**
- Gmail credentials not configured
- Invalid email address
- Email service error

**Solutions:**
1. Check Gmail node credentials
2. Verify recipient email address is valid
3. Check Gmail API quota/limits
4. Review error message in the node

---

## Expected Execution Flow

```
✅ Webhook (Success)
   ↓
✅ AI Agent (Success)
   ↓
✅ Gmail (Success)
   ↓
⚠️ HTTP Request (Error - Expected for Stage 1)
```

**Note:** The HTTP Request error is expected until Stage 2 is implemented.

---

## Quick Verification Checklist

- [ ] Environment variable `N8N_FEEDBACK_WEBHOOK_URL` is set
- [ ] Dev server restarted after adding env var
- [ ] User is signed in (Clerk authentication)
- [ ] Feedback form submits successfully
- [ ] Success message appears in UI
- [ ] n8n execution history shows new execution
- [ ] Webhook node shows received payload with all 8 fields
- [ ] AI Agent node shows structured JSON output
- [ ] Gmail node shows email sent
- [ ] Email notification received in inbox
- [ ] HTTP Request node shows error (expected for Stage 1)

---

## What Success Looks Like

### In Your App:
- ✅ Form submits without errors
- ✅ Success message appears
- ✅ Modal closes automatically

### In n8n Execution History:
- ✅ New execution appears with recent timestamp
- ✅ All nodes show "Success" (except HTTP Request, which may show error)
- ✅ Webhook node contains complete payload
- ✅ AI Agent node contains structured analysis
- ✅ Gmail node shows email sent

### In Your Email:
- ✅ Notification email received
- ✅ Contains user info, message, and AI analysis

---

## Next Steps After Verification

Once you've verified everything works:

1. ✅ **Stage 1 Complete:** Feedback submission to n8n working
2. ⏭️ **Stage 2:** Create webhook endpoint to receive processed data from n8n
3. ⏭️ **Stage 3:** Create Supabase feedback table and store data
4. ⏭️ **Stage 4:** Test end-to-end with Vercel preview

---

**Need help?** Check the detailed testing guide: `FEEDBACK_STAGE1_TESTING_GUIDE.md`

