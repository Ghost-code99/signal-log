# n8n Webhook Integration - Setup Summary

**What we've set up:** Complete integration between your app and n8n workflow

---

## ✅ What's Been Created

### 1. Documentation
- **`N8N_WEBHOOK_UPDATE_GUIDE.md`** - Complete step-by-step guide for updating your n8n workflow
- **`N8N_WEBHOOK_QUICK_START.md`** - Quick reference and troubleshooting guide
- **`N8N_WEBHOOK_SETUP_SUMMARY.md`** - This file (overview)

### 2. App Code
- **`/app/api/webhooks/n8n/feedback/route.ts`** - Webhook endpoint to receive callbacks from n8n
- **`/components/feedback-modal.tsx`** - Updated to send feedback to n8n webhook

---

## 📋 What You Need to Do

### Part 1: Update n8n Workflow (Follow the Guide)

1. **Open your n8n workflow from lesson 5.2**
2. **Follow `N8N_WEBHOOK_UPDATE_GUIDE.md`** step by step:
   - Replace Chat Trigger with Webhook Trigger
   - Update AI Agent to use `{{ $json.body.message }}`
   - Update Gmail node with webhook data
   - Add HTTP Request node for callback
   - Test the workflow
3. **Copy your Production Webhook URL** from n8n

### Part 2: Configure Your App

1. **Create `.env.local` file** (if it doesn't exist) in your project root:
   ```bash
   NEXT_PUBLIC_N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/xxxxx
   ```
   Replace with your actual n8n Production URL

2. **Restart your Next.js dev server:**
   ```bash
   npm run dev
   ```

3. **Test the integration:**
   - Open your app
   - Click "Give Feedback"
   - Submit test feedback
   - Check n8n workflow execution
   - Verify email is sent
   - Check app logs for callback

---

## 🔄 Data Flow

```
User submits feedback
    ↓
Feedback Modal (components/feedback-modal.tsx)
    ↓
POST to n8n Webhook URL
    ↓
n8n Workflow:
  ├─→ Webhook (receives data)
  ├─→ AI Agent (processes message)
  ├─→ Gmail (sends notification)
  └─→ HTTP Request (callback to app)
    ↓
App Webhook Endpoint (app/api/webhooks/n8n/feedback/route.ts)
    ↓
Success response
```

---

## 📦 Payload Structure

### App → n8n (Feedback Modal sends)
```json
{
  "userId": "user_123",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "message": "User feedback text",
  "browser": "Mozilla/5.0...",
  "timestamp": "2025-01-28T10:00:00Z",
  "url": "https://yourapp.com/page"
}
```

### n8n → App (HTTP Request callback)
```json
{
  "userId": "user_123",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "message": "User feedback text",
  "browser": "Mozilla/5.0...",
  "timestamp": "2025-01-28T10:00:00Z",
  "url": "https://yourapp.com/page",
  "sentiment": "positive",
  "category": "feature",
  "priority": "medium",
  "summary": "AI-generated summary",
  "actionable": true,
  "processedAt": "2025-01-28T10:00:05Z"
}
```

---

## 🧪 Testing Checklist

### n8n Workflow
- [ ] Webhook node receives POST request
- [ ] AI Agent processes message and returns structured data
- [ ] Gmail sends email with correct data
- [ ] HTTP Request node sends callback (may fail if app not running - that's OK)

### App Integration
- [ ] Environment variable is set (`NEXT_PUBLIC_N8N_WEBHOOK_URL`)
- [ ] Feedback modal sends data to n8n
- [ ] Webhook endpoint receives callback from n8n
- [ ] No errors in browser console
- [ ] No errors in server logs

### End-to-End
- [ ] Submit feedback through UI
- [ ] Check n8n workflow execution (should show success)
- [ ] Check email inbox (should receive notification)
- [ ] Check app logs (should show callback received)

---

## 🔧 Configuration Files

### Environment Variables (`.env.local`)
```bash
# n8n Webhook URL
NEXT_PUBLIC_N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/xxxxx
```

**Important:**
- File should be in project root (same level as `package.json`)
- Use `NEXT_PUBLIC_` prefix for client-side access
- Never commit to git (should be in `.gitignore`)
- Restart dev server after changes

---

## 📁 Files Modified/Created

### Created
- `docs/N8N_WEBHOOK_UPDATE_GUIDE.md` - Detailed n8n workflow update guide
- `docs/N8N_WEBHOOK_QUICK_START.md` - Quick reference
- `docs/N8N_WEBHOOK_SETUP_SUMMARY.md` - This file
- `app/api/webhooks/n8n/feedback/route.ts` - Webhook callback endpoint

### Modified
- `components/feedback-modal.tsx` - Now sends to n8n webhook

---

## 🚨 Common Issues

### "Webhook URL not configured"
- **Fix:** Add `NEXT_PUBLIC_N8N_WEBHOOK_URL` to `.env.local`
- **Fix:** Restart dev server after adding env var

### "404 Not Found" on callback
- **Fix:** Make sure app is running (`npm run dev`)
- **Fix:** Verify URL in n8n HTTP Request node matches your endpoint

### "Cannot read property 'body' of undefined" in n8n
- **Fix:** Use `{{ $json.body.fieldName }}` not `{{ $json.fieldName }}`

### "Invalid JSON" in n8n HTTP Request
- **Fix:** Use `JSON.stringify()` for all strings
- **Fix:** Don't use `JSON.stringify()` for booleans

---

## 🎯 Next Steps

1. **Complete n8n workflow setup** (follow the guide)
2. **Add environment variable** to your app
3. **Test the integration** end-to-end
4. **Add security** (Lesson 5.5 - webhook authentication)
5. **Add database storage** (store feedback in Supabase)

---

## 📚 Documentation Reference

- **Detailed Guide:** `docs/N8N_WEBHOOK_UPDATE_GUIDE.md`
- **Quick Reference:** `docs/N8N_WEBHOOK_QUICK_START.md`
- **n8n Integration Overview:** `docs/N8N_INTEGRATION_GUIDE.md`

---

**Ready to proceed?** Start with the detailed guide: `N8N_WEBHOOK_UPDATE_GUIDE.md` 🚀

