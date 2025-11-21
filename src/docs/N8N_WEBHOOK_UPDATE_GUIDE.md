# n8n Workflow Update Guide: Chat Trigger → Webhook

**Date:** January 2025  
**Lesson:** 5.2 → 5.3 (Webhook Integration)

---

## Overview

This guide walks you through updating your n8n workflow from lesson 5.2 (Chat Trigger → AI Agent → Gmail) to accept webhooks from your app.

---

## Step 1: Replace Chat Trigger with Webhook Trigger

### 1.1 Open Your Workflow
- Go to your n8n dashboard
- Open the workflow from lesson 5.2

### 1.2 Remove Chat Trigger
- **Option A:** Delete the Chat Trigger node entirely
- **Option B:** Deactivate it (right-click → Deactivate) if you want to keep it for reference

### 1.3 Add Webhook Node
1. Click the **"+"** button or drag a new node onto the canvas
2. Search for **"Webhook"** in the node search
3. Select **"Webhook"** node
4. Place it at the start of your workflow (before AI Agent)

### 1.4 Configure Webhook Node
1. Click on the Webhook node to open configuration
2. Set the following:
   - **HTTP Method:** `POST`
   - **Authentication:** `None` (we'll add security in lesson 5.5)
   - **Response Mode:** `Last Node` (we'll handle this with HTTP Request node)
   - **Path:** Leave default or set to `/feedback` (optional, for clarity)

### 1.5 Get Your Webhook URL
1. **Save your workflow** (important!)
2. **Activate the workflow** (toggle switch in top-right)
3. Once activated, the Webhook node will show:
   - **Production URL:** `https://your-n8n-instance.com/webhook/xxxxx`
   - **Test URL:** `https://your-n8n-instance.com/webhook-test/xxxxx`
4. **Copy the Production URL** - you'll need this for your app!

**⚠️ Important:** The webhook URL is only available when the workflow is **activated**. If you deactivate it, the URL changes.

---

## Step 2: Update AI Agent to Work with Webhook Data

### 2.1 Open AI Agent Node
- Click on your existing AI Agent node

### 2.2 Update Input Prompt
- Find the **"Prompt"** or **"Input"** field
- Replace any chat input references with webhook body reference
- **Old (Chat Trigger):** `{{ $json.message }}` or similar
- **New (Webhook):** `{{ $json.body.message }}`

### 2.3 Verify System Message
Your system message should remain the same for structured output:
```
Analyze the following user feedback and return a JSON object with:
- sentiment: "positive", "negative", or "neutral"
- category: "bug", "feature", "question", or "other"
- priority: "low", "medium", or "high"
- summary: A brief 1-2 sentence summary
- actionable: true or false (whether the feedback requires action)
```

### 2.4 Test Data Structure
The webhook will receive JSON with this structure:
```json
{
  "userId": "user_123",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "message": "This is the feedback message",
  "browser": "Mozilla/5.0...",
  "timestamp": "2025-01-28T10:00:00Z",
  "url": "https://yourapp.com/page"
}
```

In n8n, this will be accessible as:
- `{{ $json.body.userId }}`
- `{{ $json.body.firstName }}`
- `{{ $json.body.message }}`
- etc.

---

## Step 3: Update Gmail Node

### 3.1 Open Gmail Node
- Click on your existing Gmail node

### 3.2 Update Email Body HTML
Replace the email body with this structure:

```html
<h3>📝 Original Feedback</h3>
<p><strong>From:</strong> {{ $json.body.firstName }} {{ $json.body.lastName }} ({{ $json.body.email }})</p>
<p><strong>User ID:</strong> {{ $json.body.userId }}</p>
<p><strong>Page:</strong> {{ $json.body.url }}</p>
<p><strong>Browser:</strong> {{ $json.body.browser }}</p>
<p><strong>Timestamp:</strong> {{ $json.body.timestamp }}</p>
<p><strong>Message:</strong> {{ $json.body.message }}</p>

<hr>

<h3>🤖 AI Analysis</h3>
<p>
  <strong>Sentiment:</strong> {{ $('AI Agent').item.json.sentiment }}<br>
  <strong>Category:</strong> {{ $('AI Agent').item.json.category }}<br>
  <strong>Priority:</strong> {{ $('AI Agent').item.json.priority }}<br>
  <strong>Summary:</strong> {{ $('AI Agent').item.json.summary }}<br>
  <strong>Actionable:</strong> {{ $('AI Agent').item.json.actionable }}
</p>
```

### 3.3 Update Email Subject (Optional)
You can make the subject more informative:
```
Feedback: {{ $('AI Agent').item.json.category }} - {{ $('AI Agent').item.json.priority }} priority
```

### 3.4 Verify Recipient
- Make sure the **"To"** field is set to your team email
- Example: `team@yourapp.com` or `{{ $env.TEAM_EMAIL }}`

---

## Step 4: Add HTTP Request Node for Callback

### 4.1 Add HTTP Request Node
1. Click the **"+"** button after the Gmail node
2. Search for **"HTTP Request"**
3. Add it after Gmail (Gmail → HTTP Request)

### 4.2 Configure HTTP Request Node

**Basic Settings:**
- **Method:** `POST`
- **URL:** `http://localhost:3000/api/webhooks/n8n/feedback` (placeholder for now)
- **Authentication:** `None` (we'll add security later)
- **Body Content Type:** `JSON`

**Body Configuration:**
⚠️ **CRITICAL:** Use `JSON.stringify()` for all string values to properly escape special characters. Do NOT wrap boolean values.

**Body (Expression Mode):**
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

**Why `JSON.stringify()`?**
- Without it, special characters in user input (quotes, newlines, etc.) will break your JSON
- Example: If a user types `"Hello"`, without `JSON.stringify()` it becomes invalid JSON
- Booleans (`actionable`) don't need it because they're already valid JSON values

**How to Enter This:**
1. In the HTTP Request node, find the **"Body"** field
2. Click the **"Expression"** toggle (or use `{{ }}` syntax)
3. Paste the JSON structure above
4. Make sure the node names match your actual node names:
   - `Webhook` - your webhook node name
   - `AI Agent` - your AI Agent node name

### 4.3 Handle Response (Optional)
- **Response Format:** `JSON`
- **Options:** 
  - **Ignore Response:** Check this if you don't need to process the response
  - Or leave unchecked to see response in workflow execution

---

## Step 5: Test the Updated Workflow

### 5.1 Using n8n's Test Feature

1. **Save your workflow**
2. **Activate the workflow** (if not already activated)
3. Click **"Execute Workflow"** button
4. Click **"Listen for test event"** on the Webhook node
5. n8n will show you a test URL
6. Use curl or Postman to send a test request:

```bash
curl -X POST YOUR_TEST_WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_test123",
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "message": "This is a test feedback message with special chars: \"quotes\" and newlines\n",
    "browser": "Mozilla/5.0 (Test Browser)",
    "timestamp": "2025-01-28T10:00:00Z",
    "url": "https://example.com/test"
  }'
```

### 5.2 Verify Each Step

**Check Webhook Node:**
- ✅ Receives the POST request
- ✅ Shows the body data in the output

**Check AI Agent Node:**
- ✅ Processes the message
- ✅ Returns structured JSON with sentiment, category, priority, summary, actionable

**Check Gmail Node:**
- ✅ Sends email with correct data
- ✅ Email includes both original feedback and AI analysis

**Check HTTP Request Node:**
- ✅ Shows the combined payload in the output
- ⚠️ The callback may fail (404) if your app endpoint isn't set up yet - that's OK for now!

### 5.3 Common Issues

**Issue: "Cannot read property 'body' of undefined"**
- **Solution:** Make sure you're using `$json.body.fieldName` not `$json.fieldName`
- The webhook wraps the request body in a `body` property

**Issue: "JSON.stringify is not a function"**
- **Solution:** Make sure you're in Expression mode, not JSON mode
- Toggle the "Expression" switch in the Body field

**Issue: "Invalid JSON"**
- **Solution:** Check that you're using `JSON.stringify()` for all strings
- Verify boolean values (like `actionable`) are NOT wrapped in `JSON.stringify()`

**Issue: "Node 'AI Agent' not found"**
- **Solution:** Make sure the node name exactly matches your AI Agent node name
- Check for typos and case sensitivity

---

## Step 6: Save the Webhook URL

### 6.1 Copy Production URL
1. With workflow **activated**, click on the Webhook node
2. Copy the **Production URL**
3. It will look like: `https://your-n8n-instance.com/webhook/xxxxx-xxxxx-xxxxx`

### 6.2 Store It Securely
- **For now:** Save it in a text file or note
- **Next step:** We'll add it to your app's environment variables
- **Don't commit it to git** (we'll use env vars)

### 6.3 Test URL vs Production URL
- **Test URL:** Only works when workflow is in test mode, changes frequently
- **Production URL:** Stable, works when workflow is activated
- **Use Production URL** for your app integration

---

## Workflow Structure Summary

Your final workflow should look like this:

```
┌─────────────┐
│   Webhook   │  ← Receives POST from your app
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  AI Agent   │  ← Processes message, returns structured data
└──────┬──────┘
       │
       ├─────────────┬─────────────┐
       ▼             ▼             ▼
┌──────────┐  ┌──────────┐  ┌──────────┐
│  Gmail   │  │  HTTP    │  │  (Future) │
│  (Team)  │  │ Request  │  │  Supabase │
│          │  │(Callback)│  │  (Store)  │
└──────────┘  └──────────┘  └──────────┘
```

---

## Next Steps

1. ✅ **Workflow updated** - You've completed the n8n side
2. ⏭️ **Update your app** - Next, we'll:
   - Create the webhook endpoint to receive callbacks
   - Update the feedback modal to send data to n8n
   - Add environment variable for webhook URL

---

## Troubleshooting Checklist

- [ ] Workflow is **activated** (not just saved)
- [ ] Webhook node shows Production URL
- [ ] AI Agent uses `{{ $json.body.message }}`
- [ ] Gmail uses `{{ $json.body.fieldName }}` for webhook data
- [ ] HTTP Request uses `JSON.stringify()` for all strings
- [ ] HTTP Request boolean values are NOT wrapped in `JSON.stringify()`
- [ ] Node names in expressions match actual node names
- [ ] Test request includes all required fields

---

## Quick Reference: n8n Expression Syntax

- **Webhook data:** `{{ $json.body.fieldName }}`
- **Previous node data:** `{{ $('Node Name').item.json.fieldName }}`
- **String escaping:** `{{ JSON.stringify($json.body.fieldName) }}`
- **Current timestamp:** `{{ $now.toISO() }}`
- **Boolean (no escaping):** `{{ $('AI Agent').item.json.actionable }}`

---

**Ready to connect your app? Let's move to the next section!** 🚀

