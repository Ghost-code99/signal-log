# Vercel Preview Testing - Quick Reference

**Quick commands and URLs for testing feedback webhook on Vercel**

---

## Git Commands

```bash
# Check status
git status

# Stage changes
git add .

# Commit
git commit -m "feat: implement Stage 2 feedback webhook endpoint"

# Push to feature branch
git push origin user-feedback
```

---

## Vercel Dashboard Locations

### Find Preview URL
1. Vercel Dashboard → Your Project → **Deployments** tab
2. Click on preview deployment (branch: `user-feedback`)
3. Copy URL: `https://your-app-abc123.vercel.app`

### Add Environment Variables
1. Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Add:
   - `N8N_FEEDBACK_WEBHOOK_URL` = your n8n webhook URL
   - `SUPABASE_SERVICE_ROLE_KEY` = your service role key
3. Apply to: **Preview** and **Production**

### View Logs
1. Vercel Dashboard → Your Project → **Functions** tab
2. Filter by: `/api/webhooks/n8n/feedback`
3. Click on invocation to see details

---

## n8n Updates

### HTTP Request Node URL
```
https://your-app-abc123.vercel.app/api/webhooks/n8n/feedback
```

Replace `your-app-abc123.vercel.app` with your actual preview URL.

---

## Test Payloads

### Bug Report (Negative)
```
The login button doesn't work. When I click it, nothing happens. This is really frustrating and I can't access my account.
```

**Expected AI Analysis:**
- sentiment: "negative"
- category: "bug"
- priority: "high" or "medium"
- actionable: true

### Feature Request (Neutral/Positive)
```
It would be great if you could add dark mode support. I work late at night and the bright screen hurts my eyes. This would be a really helpful feature.
```

**Expected AI Analysis:**
- sentiment: "positive" or "neutral"
- category: "feature_request"
- priority: "medium" or "low"
- actionable: true

### Praise (Positive)
```
I love the new dashboard design! It's so clean and easy to use. Great job on the UI improvements.
```

**Expected AI Analysis:**
- sentiment: "positive"
- category: "other" or "feature_request"
- priority: "low"
- actionable: false

---

## Verification Commands

### Test Webhook Endpoint (curl)
```bash
curl -X POST https://your-app-abc123.vercel.app/api/webhooks/n8n/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_test",
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "message": "Test message",
    "timestamp": "2025-01-28T10:00:00.000Z",
    "processedAt": "2025-01-28T10:00:03.000Z",
    "sentiment": "positive",
    "category": "feature_request",
    "priority": "medium",
    "summary": "Test summary",
    "actionable": true
  }'
```

### Supabase Query
```sql
SELECT 
  id,
  user_id,
  first_name,
  message,
  sentiment,
  category,
  priority,
  actionable,
  created_at,
  processed_at
FROM feedback
ORDER BY created_at DESC
LIMIT 5;
```

---

## Verification Checklist

### n8n Execution History
- [ ] Webhook node: Success (green)
- [ ] AI Agent node: Success (green)
- [ ] Gmail node: Success (green)
- [ ] HTTP Request node: Success (green) - **Should work now!**

### Email Inbox
- [ ] 3 emails received (one per test)
- [ ] Each email has AI analysis section
- [ ] Analysis matches feedback type

### Vercel Logs
- [ ] 3 function invocations
- [ ] All show 200 status
- [ ] Logs show "Feedback stored successfully"

### Supabase Table
- [ ] 3 rows in `feedback` table
- [ ] All required fields populated
- [ ] All AI analysis fields populated
- [ ] No null values in critical fields

---

## Common Issues

### "404 Not Found" in n8n
- Check preview URL is correct
- Verify deployment is "Ready"
- Test endpoint with curl first

### "Environment variable not set"
- Check Vercel env vars are set
- Verify applied to "Preview"
- Redeploy preview

### No data in Supabase
- Check `SUPABASE_SERVICE_ROLE_KEY` is set
- Verify migration applied
- Check Supabase logs

---

**For detailed guide, see:** `FEEDBACK_VERCEL_PREVIEW_TESTING.md`

