# n8n Webhook Integration - Quick Start

**Quick reference for connecting your app to n8n webhook**

---

## Step-by-Step Checklist

### ✅ n8n Workflow Setup

- [ ] **Step 1:** Replace Chat Trigger with Webhook Trigger
  - Delete/deactivate Chat Trigger node
  - Add Webhook node
  - Configure: POST, No Auth
  - **Save and activate workflow**
  - **Copy Production URL** → `https://your-n8n-instance.com/webhook/xxxxx`

- [ ] **Step 2:** Update AI Agent Node
  - Change input from `{{ $json.message }}` to `{{ $json.body.message }}`
  - Keep system message for structured output

- [ ] **Step 3:** Update Gmail Node
  - Use `{{ $json.body.fieldName }}` for webhook data
  - Use `{{ $('AI Agent').item.json.fieldName }}` for AI analysis

- [ ] **Step 4:** Add HTTP Request Node
  - Method: POST
  - URL: `http://localhost:3000/api/webhooks/n8n/feedback` (for now)
  - Body: Use `JSON.stringify()` for all strings, NOT for booleans
  - See full guide for exact body structure

- [ ] **Step 5:** Test Workflow
  - Use "Listen for test event" on Webhook node
  - Send test POST request with sample data
  - Verify all nodes execute successfully

---

### ✅ App Configuration

- [ ] **Step 1:** Add Environment Variable
  - Create/update `.env.local`:
    ```
    NEXT_PUBLIC_N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/xxxxx
    ```
  - Replace with your actual n8n Production URL

- [ ] **Step 2:** Verify Webhook Endpoint
  - Endpoint created: `/app/api/webhooks/n8n/feedback/route.ts`
  - Handles POST requests from n8n callback
  - Returns success/error responses

- [ ] **Step 3:** Test Feedback Form
  - Open feedback modal
  - Submit test feedback
  - Check browser console for logs
  - Verify n8n receives the request

---

## n8n Expression Reference

### Accessing Webhook Data
```javascript
// Webhook body fields
{{ $json.body.userId }}
{{ $json.body.firstName }}
{{ $json.body.lastName }}
{{ $json.body.email }}
{{ $json.body.message }}
{{ $json.body.browser }}
{{ $json.body.timestamp }}
{{ $json.body.url }}
```

### Accessing AI Agent Output
```javascript
{{ $('AI Agent').item.json.sentiment }}
{{ $('AI Agent').item.json.category }}
{{ $('AI Agent').item.json.priority }}
{{ $('AI Agent').item.json.summary }}
{{ $('AI Agent').item.json.actionable }}
```

### HTTP Request Body (with proper escaping)
```json
{
  "userId": {{ JSON.stringify($('Webhook').item.json.body.userId) }},
  "message": {{ JSON.stringify($('Webhook').item.json.body.message) }},
  "actionable": {{ $('AI Agent').item.json.actionable }}
}
```

**Key Points:**
- ✅ Use `JSON.stringify()` for ALL strings
- ❌ Do NOT use `JSON.stringify()` for booleans
- ✅ Use `$('Node Name')` to reference previous nodes

---

## Testing Commands

### Test n8n Webhook (curl)
```bash
curl -X POST YOUR_N8N_WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_test123",
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "message": "This is a test message",
    "browser": "Mozilla/5.0 (Test)",
    "timestamp": "2025-01-28T10:00:00Z",
    "url": "https://example.com/test"
  }'
```

### Test App Webhook Endpoint (curl)
```bash
curl -X POST http://localhost:3000/api/webhooks/n8n/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_test123",
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "message": "Test message",
    "sentiment": "positive",
    "category": "feature",
    "priority": "medium",
    "summary": "Test summary",
    "actionable": true,
    "processedAt": "2025-01-28T10:00:00Z"
  }'
```

---

## Common Issues & Solutions

### Issue: "Cannot read property 'body' of undefined"
**Solution:** Make sure you're using `$json.body.fieldName` not `$json.fieldName`

### Issue: "JSON.stringify is not a function"
**Solution:** Enable Expression mode in HTTP Request body field

### Issue: "Invalid JSON" in HTTP Request
**Solution:** 
- Check all strings use `JSON.stringify()`
- Verify booleans are NOT wrapped in `JSON.stringify()`
- Check for typos in node names

### Issue: "Webhook URL not configured"
**Solution:** 
- Add `NEXT_PUBLIC_N8N_WEBHOOK_URL` to `.env.local`
- Restart Next.js dev server
- Verify the URL is correct

### Issue: "404 Not Found" on callback
**Solution:** 
- Make sure your app is running (`npm run dev`)
- Verify the URL in HTTP Request node matches your app endpoint
- Check that the route file exists: `/app/api/webhooks/n8n/feedback/route.ts`

---

## File Structure

```
src/
├── app/
│   └── api/
│       └── webhooks/
│           └── n8n/
│               └── feedback/
│                   └── route.ts          ← Receives callback from n8n
├── components/
│   └── feedback-modal.tsx                ← Sends data to n8n webhook
└── docs/
    ├── N8N_WEBHOOK_UPDATE_GUIDE.md       ← Detailed step-by-step guide
    └── N8N_WEBHOOK_QUICK_START.md        ← This file
```

---

## Next Steps

1. ✅ **Complete n8n workflow setup** (Steps 1-5 above)
2. ✅ **Configure app** (Add env var, test endpoint)
3. ⏭️ **Test end-to-end** (Submit feedback, verify flow)
4. ⏭️ **Add security** (Lesson 5.5 - webhook authentication)
5. ⏭️ **Add database storage** (Store feedback in Supabase)

---

## Environment Variables

Add to `.env.local`:
```bash
# n8n Webhook URL (from n8n Production URL)
NEXT_PUBLIC_N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/xxxxx
```

**Important:**
- Use `NEXT_PUBLIC_` prefix for client-side access
- Never commit `.env.local` to git
- Use different URLs for dev/staging/production

---

**Need more details?** See `N8N_WEBHOOK_UPDATE_GUIDE.md` for complete instructions.

