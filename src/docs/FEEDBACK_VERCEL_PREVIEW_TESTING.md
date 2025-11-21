# Complete Webhook Flow Testing - Vercel Preview Deployment

**Guide for testing the complete feedback flow on Vercel preview deployments**

---

## Prerequisites

Before starting, make sure you have:

- ✅ All code changes committed locally
- ✅ n8n workflow configured and activated
- ✅ Supabase migration applied (feedback table exists)
- ✅ Vercel project connected to your repository
- ✅ Access to Vercel dashboard

---

## Step 1: Commit and Push Code

### Check Current Status

```bash
# Check what files have changed
git status

# Review the changes
git diff
```

### Stage Changes

```bash
# Stage all changes (or specific files)
git add .

# Or stage specific files:
git add app/actions/submit-feedback.ts
git add app/api/webhooks/n8n/feedback/route.ts
git add components/feedback-modal.tsx
git add lib/supabase-service.ts
git add supabase/schemas/09-feedback.sql
```

### Commit Changes

```bash
# Commit with descriptive message
git commit -m "feat: implement Stage 2 feedback webhook endpoint

- Add webhook endpoint to receive processed feedback from n8n
- Create Supabase feedback table with RLS policies
- Add service role client for webhook operations
- Update feedback modal to use Server Action
- Add comprehensive error handling and validation"
```

### Push to Feature Branch

```bash
# Push to your feature branch
git push origin user-feedback

# If branch doesn't exist remotely:
git push -u origin user-feedback
```

### Wait for Vercel Build

1. **Go to Vercel Dashboard:**
   - Navigate to your project
   - Go to **Deployments** tab

2. **Watch the build:**
   - You'll see a new deployment appear
   - Status will show: "Building..." → "Ready"
   - Build typically takes 2-5 minutes

3. **Check build logs:**
   - Click on the deployment
   - Review build logs for any errors
   - Verify build completes successfully

---

## Step 2: Get Preview URL

### Find Preview URL in Vercel Dashboard

1. **Go to Vercel Dashboard:**
   - Navigate to your project
   - Click on **Deployments** tab

2. **Find your preview deployment:**
   - Look for the most recent deployment
   - It should show branch: `user-feedback`
   - Status should be: **"Ready"** (green)

3. **Copy the preview URL:**
   - Click on the deployment
   - The preview URL is shown at the top
   - Format: `https://your-app-abc123.vercel.app`
   - Or click the **"Visit"** button to open it

### Construct Full Webhook Endpoint URL

Your webhook endpoint URL will be:

```
https://your-app-abc123.vercel.app/api/webhooks/n8n/feedback
```

**Example:**
```
https://signal-log-git-user-feedback.vercel.app/api/webhooks/n8n/feedback
```

**Save this URL** - you'll need it for Step 3.

---

## Step 3: Update n8n HTTP Request Node

### Open n8n Workflow

1. **Go to n8n dashboard**
2. **Open your feedback workflow** (the one with Webhook Trigger)

### Update HTTP Request Node

1. **Click on the HTTP Request node** (the callback node after Gmail)

2. **Update the URL field:**
   - **Current:** `http://localhost:3000/api/webhooks/n8n/feedback`
   - **New:** `https://your-app-abc123.vercel.app/api/webhooks/n8n/feedback`
   - Replace with your actual preview URL

3. **Verify settings:**
   - Method: `POST`
   - Body Content Type: `JSON`
   - Body: Should have the complete payload structure

4. **Save the workflow:**
   - Click **Save** button
   - Make sure workflow is **Activated** (toggle switch ON)

### Verify Node Configuration

The HTTP Request node body should look like:

```json
{
  "userId": {{ JSON.stringify($('Webhook').item.json.body.userId) }},
  "firstName": {{ JSON.stringify($('Webhook').item.json.body.firstName) }},
  "lastName": {{ JSON.stringify($('Webhook').item.json.body.lastName) }},
  "email": {{ JSON.stringify($('Webhook').item.json.body.email) }},
  "message": {{ JSON.stringify($('Webhook').item.json.body.message) }},
  "browser": {{ JSON.stringify($('Webhook').item.json.body.browser) }},
  "timestamp": {{ JSON.stringify($('Webhook').item.json.body.timestamp) }},
  "url": {{ JSON.stringify($('Webhook').item.json.body.url) }},
  "sentiment": {{ JSON.stringify($('AI Agent').item.json.sentiment) }},
  "category": {{ JSON.stringify($('AI Agent').item.json.category) }},
  "priority": {{ JSON.stringify($('AI Agent').item.json.priority) }},
  "summary": {{ JSON.stringify($('AI Agent').item.json.summary) }},
  "actionable": {{ $('AI Agent').item.json.actionable }},
  "processedAt": {{ JSON.stringify($now.toISO()) }}
}
```

---

## Step 4: Add Environment Variables to Vercel

### Navigate to Environment Variables

1. **Go to Vercel Dashboard:**
   - Select your project
   - Go to **Settings** tab
   - Click **Environment Variables** in sidebar

### Add N8N_FEEDBACK_WEBHOOK_URL

1. **Click "Add New" button**

2. **Fill in the form:**
   - **Key:** `N8N_FEEDBACK_WEBHOOK_URL`
   - **Value:** Your n8n Webhook Trigger Production URL
     - Get this from n8n: Webhook node → Production URL
     - Format: `https://your-n8n-instance.com/webhook/xxxxx`
   - **Environment:** Select **Preview** and **Production**
     - ✅ Preview
     - ✅ Production
     - ❌ Development (optional, for local testing)

3. **Click "Save"**

### Add SUPABASE_SERVICE_ROLE_KEY (if not already set)

1. **Check if it exists:**
   - Look for `SUPABASE_SERVICE_ROLE_KEY` in the list
   - If missing, add it

2. **Add if needed:**
   - **Key:** `SUPABASE_SERVICE_ROLE_KEY`
   - **Value:** Your Supabase service role key
     - Get from: Supabase Dashboard → Settings → API → Service Role Key
   - **Environment:** Select **Preview** and **Production**

### Redeploy Preview

After adding environment variables:

1. **Option A: Automatic redeploy**
   - Make a small change and push (e.g., add a comment)
   - Or wait for next commit

2. **Option B: Manual redeploy**
   - Go to **Deployments** tab
   - Find your preview deployment
   - Click **"..."** menu → **Redeploy**
   - This will rebuild with new environment variables

3. **Wait for redeploy to complete**
   - Status: "Building..." → "Ready"
   - Usually takes 2-5 minutes

---

## Step 5: Test Submission

### Open Preview URL

1. **Open your preview URL in browser:**
   ```
   https://your-app-abc123.vercel.app
   ```

2. **Sign in** (if required)
   - Use your Clerk credentials
   - Make sure you're authenticated

### Test Case 1: Bug Report (Negative Feedback)

1. **Click "Give Feedback"** (usually in footer)

2. **Enter bug report:**
   ```
   The login button doesn't work. When I click it, nothing happens. This is really frustrating and I can't access my account.
   ```

3. **Click "Send Feedback"**

4. **Expected behavior:**
   - ✅ Button shows "Sending..." loading state
   - ✅ Success message appears: "Thank you for your feedback!"
   - ✅ Modal closes after 2 seconds

5. **Wait 5-10 seconds** for processing

### Test Case 2: Feature Request (Neutral/Positive)

1. **Click "Give Feedback"** again

2. **Enter feature request:**
   ```
   It would be great if you could add dark mode support. I work late at night and the bright screen hurts my eyes. This would be a really helpful feature.
   ```

3. **Click "Send Feedback"**

4. **Expected behavior:**
   - ✅ Success message appears
   - ✅ Modal closes

5. **Wait 5-10 seconds** for processing

### Test Case 3: Praise (Positive Feedback)

1. **Click "Give Feedback"** again

2. **Enter positive feedback:**
   ```
   I love the new dashboard design! It's so clean and easy to use. Great job on the UI improvements.
   ```

3. **Click "Send Feedback"**

4. **Expected behavior:**
   - ✅ Success message appears
   - ✅ Modal closes

5. **Wait 5-10 seconds** for processing

---

## Step 6: Verify Complete Data Flow

For each test submission, verify all these points:

### Verification Point 1: n8n Execution History

1. **Open n8n dashboard**
2. **Go to your workflow**
3. **Click "Executions" tab**
4. **Find the most recent executions** (should match your test submissions)

5. **For each execution, verify:**

   **a. Webhook Node:**
   - ✅ Status: Success (green)
   - ✅ Shows received payload from your app
   - ✅ Contains: userId, firstName, lastName, email, message, browser, timestamp, url

   **b. AI Agent Node:**
   - ✅ Status: Success (green)
   - ✅ Shows AI analysis output
   - ✅ Contains: sentiment, category, priority, summary, actionable
   - ✅ **Bug report:** sentiment should be "negative", category "bug", priority "high"
   - ✅ **Feature request:** sentiment should be "positive" or "neutral", category "feature_request"
   - ✅ **Praise:** sentiment should be "positive", category "other" or "feature_request"

   **c. Gmail Node:**
   - ✅ Status: Success (green)
   - ✅ Email sent notification

   **d. HTTP Request Node:**
   - ✅ Status: Success (green) - **This should now work!**
   - ✅ Shows response from your app: `{"success": true, "message": "Feedback stored successfully"}`
   - ✅ Status code: 200

### Verification Point 2: Email Inbox

1. **Check your email inbox** (the one configured in Gmail node)

2. **You should have 3 emails** (one for each test submission)

3. **For each email, verify:**
   - ✅ **Subject:** Contains feedback category and priority
   - ✅ **User Info:** Name and email address
   - ✅ **Original Message:** Your test feedback text
   - ✅ **AI Analysis Section:**
     - Sentiment (positive/negative/neutral)
     - Category (bug/feature_request/question/other)
     - Priority (low/medium/high)
     - Summary (one sentence)
     - Actionable (true/false)
   - ✅ **Context:** Browser, URL, timestamp

4. **Verify AI analysis matches feedback type:**
   - **Bug report:** Negative sentiment, "bug" category, high priority
   - **Feature request:** Positive/neutral sentiment, "feature_request" category
   - **Praise:** Positive sentiment, "other" or "feature_request" category

### Verification Point 3: Vercel Logs

1. **Go to Vercel Dashboard**
2. **Select your project**
3. **Go to "Functions" tab** (or "Logs" tab)
4. **Filter by:** `/api/webhooks/n8n/feedback`

5. **You should see 3 function invocations** (one for each test)

6. **For each invocation, verify:**
   - ✅ **Status:** 200 (Success)
   - ✅ **Duration:** < 1 second typically
   - ✅ **Logs show:**
     ```
     📥 Received feedback callback from n8n: { userId: '...', ... }
     ✅ Feedback stored successfully: { id: '...', ... }
     ```

7. **Click on an invocation** to see detailed logs:
   - Request payload received
   - Database insert success
   - Response sent

### Verification Point 4: Supabase Table

1. **Open Supabase Dashboard**
2. **Go to Table Editor**
3. **Select `feedback` table**

4. **You should see 3 new rows** (one for each test submission)

5. **For each row, verify all fields:**

   **Required Fields:**
   - ✅ `user_id`: Your Clerk user ID
   - ✅ `first_name`: Your first name
   - ✅ `last_name`: Your last name
   - ✅ `email`: Your email address
   - ✅ `message`: Your test feedback text
   - ✅ `created_at`: Timestamp when submitted
   - ✅ `processed_at`: Timestamp when AI processing completed

   **AI Analysis Fields:**
   - ✅ `sentiment`: "positive", "negative", or "neutral"
   - ✅ `category`: "bug", "feature_request", "question", or "other"
   - ✅ `priority`: "low", "medium", or "high"
   - ✅ `summary`: One sentence summary (not empty)
   - ✅ `actionable`: true or false

   **Context Fields:**
   - ✅ `browser`: User-Agent string
   - ✅ `url`: Preview URL where feedback was submitted

6. **Verify AI analysis matches feedback:**
   - **Bug report row:**
     - `sentiment`: "negative"
     - `category`: "bug"
     - `priority`: "high" or "medium"
     - `actionable`: true
   
   - **Feature request row:**
     - `sentiment`: "positive" or "neutral"
     - `category`: "feature_request"
     - `priority`: "medium" or "low"
     - `actionable`: true
   
   - **Praise row:**
     - `sentiment`: "positive"
     - `category`: "other" or "feature_request"
     - `priority`: "low"
     - `actionable`: false (usually)

### SQL Query Verification

Run this query in Supabase SQL Editor:

```sql
SELECT 
  id,
  user_id,
  first_name,
  last_name,
  message,
  sentiment,
  category,
  priority,
  actionable,
  summary,
  created_at,
  processed_at
FROM feedback
ORDER BY created_at DESC
LIMIT 3;
```

**Expected:**
- 3 rows returned
- All fields populated
- `created_at` and `processed_at` are different (processing took time)
- AI analysis fields match the feedback type

---

## Step 7: Test Edge Cases

### Edge Case 1: Very Long Message (500+ Characters)

1. **Click "Give Feedback"**

2. **Enter very long message:**
   ```
   This is a very long feedback message to test that the system can handle lengthy user input. I want to make sure that even if someone writes a really detailed bug report or feature request with lots of context and explanation, the system will still process it correctly. This message should be over 500 characters to properly test the edge case. Let me add some more text here to make sure we hit that threshold. I'm also including some special characters like quotes "and" apostrophes' and newlines
   to see if they're handled correctly. The AI should still be able to analyze this and categorize it appropriately. I hope this tests the system thoroughly.
   ```

3. **Submit and verify:**
   - ✅ Submission succeeds
   - ✅ Message stored completely in database
   - ✅ AI analysis still generated
   - ✅ Email contains full message
   - ✅ No truncation or errors

### Edge Case 2: Multiple Rapid Submissions

1. **Submit 3 feedbacks quickly** (within 10 seconds):
   - Feedback 1: "First quick test"
   - Feedback 2: "Second quick test"
   - Feedback 3: "Third quick test"

2. **Verify all are processed:**
   - ✅ All 3 show success messages
   - ✅ All 3 appear in n8n execution history
   - ✅ All 3 emails received
   - ✅ All 3 rows in Supabase table
   - ✅ No duplicates or missing submissions

### Edge Case 3: AI Analysis Field Verification

1. **Check all 3 test submissions in Supabase**

2. **Verify AI analysis fields are populated:**
   - ✅ `sentiment`: Always one of "positive", "negative", "neutral" (never null)
   - ✅ `category`: Always one of "bug", "feature_request", "question", "other" (never null)
   - ✅ `priority`: Always one of "low", "medium", "high" (never null)
   - ✅ `summary`: Always a non-empty string (never null)
   - ✅ `actionable`: Always true or false (never null)

3. **Verify consistency:**
   - Same feedback should get similar analysis
   - Different feedback types should get different analysis
   - Analysis makes sense for the feedback content

---

## Troubleshooting

### Issue: n8n HTTP Request Node Shows Error

**Symptoms:**
- HTTP Request node shows red error status
- Error message: "404 Not Found" or "Connection refused"

**Solutions:**
1. Verify preview URL is correct (no typos)
2. Check Vercel deployment is "Ready" (not building)
3. Verify endpoint path: `/api/webhooks/n8n/feedback`
4. Test endpoint directly with curl (see below)

**Test endpoint directly:**
```bash
curl -X POST https://your-app-abc123.vercel.app/api/webhooks/n8n/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_test",
    "firstName": "Test",
    "lastName": "User",
    "message": "Test",
    "timestamp": "2025-01-28T10:00:00.000Z",
    "processedAt": "2025-01-28T10:00:03.000Z"
  }'
```

### Issue: No Data in Supabase

**Symptoms:**
- n8n shows success
- Vercel logs show success
- But no rows in Supabase table

**Solutions:**
1. Check `SUPABASE_SERVICE_ROLE_KEY` is set in Vercel
2. Verify migration was applied (table exists)
3. Check Supabase logs for errors
4. Verify service role key is correct

### Issue: Environment Variables Not Working

**Symptoms:**
- Error: "N8N_FEEDBACK_WEBHOOK_URL environment variable not set"
- Error: "SUPABASE_SERVICE_ROLE_KEY environment variable is not set"

**Solutions:**
1. Verify env vars are set in Vercel dashboard
2. Check they're applied to "Preview" environment
3. Redeploy preview deployment
4. Check Vercel build logs for env var warnings

### Issue: AI Analysis Fields Are Null

**Symptoms:**
- Rows in Supabase but `sentiment`, `category`, etc. are null

**Solutions:**
1. Check n8n AI Agent node output
2. Verify AI Agent returns structured JSON
3. Check HTTP Request node body configuration
4. Verify `JSON.stringify()` is used correctly

---

## Success Checklist

After completing all steps, verify:

- [ ] Code committed and pushed to `user-feedback` branch
- [ ] Vercel preview deployment successful
- [ ] Preview URL obtained and saved
- [ ] n8n HTTP Request node updated with preview URL
- [ ] Environment variables added to Vercel (Preview)
- [ ] 3 test submissions completed (bug, feature, praise)
- [ ] All 3 appear in n8n execution history with success
- [ ] All 3 emails received with AI analysis
- [ ] All 3 function invocations in Vercel logs (200 status)
- [ ] All 3 rows in Supabase table with all fields populated
- [ ] Edge cases tested (long message, rapid submissions)
- [ ] AI analysis fields always populated correctly

---

## Next Steps

After successful testing:

1. ✅ **Stage 2 Complete:** Webhook endpoint working on preview
2. ⏭️ **Merge to main:** When ready, merge `user-feedback` branch
3. ⏭️ **Update production:** Update n8n HTTP Request URL to production URL
4. ⏭️ **Add production env vars:** Set environment variables for Production environment
5. ⏭️ **Monitor:** Set up monitoring/alerts for webhook endpoint

---

**Ready to test?** Follow each step carefully and verify at each checkpoint! 🚀

