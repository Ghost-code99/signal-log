# Vercel Logs Quick Reference

**Quick commands and tips for practicing Vercel logs**

---

## Current Status

✅ **Intentional error added** to webhook endpoint
- **File:** `src/app/api/webhooks/n8n/feedback/route.ts`
- **Line:** ~603
- **Error:** `const testError = body.nonExistentProperty.xyz;`
- **Will throw:** `Cannot read property 'xyz' of undefined`

---

## Quick Commands

### 1. Commit and Push Error

```bash
cd /Users/ghost_/Desktop/Signal-log/signal-log
git add src/app/api/webhooks/n8n/feedback/route.ts
git commit -m "test: add intentional error for Vercel logs practice"
git push origin main
```

### 2. Trigger Error

**Option A: Through App**
- Go to production site
- Click "Give Feedback"
- Submit any message

**Option B: curl**
```bash
curl -X POST https://your-domain.com/api/webhooks/n8n/feedback \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_KEY" \
  -d '{"userId":"test","firstName":"Test","lastName":"User","email":"test@example.com","message":"Test","browser":"curl","url":"https://example.com","timestamp":"2025-01-15T10:00:00Z","sentiment":"positive","category":"bug","priority":"high","summary":"Test","actionable":true,"processedAt":"2025-01-15T10:00:00Z"}'
```

### 3. Find Error in Vercel

1. Go to: https://vercel.com/dashboard
2. Select project → "Logs" tab
3. Filter: `/api/webhooks/n8n/feedback`
4. Look for red error entry

### 4. Read Stack Trace

**Look for:**
```
Error: Cannot read property 'xyz' of undefined
    at POST (/var/task/app/api/webhooks/n8n/feedback/route.ts:603:45)
```

**Key info:**
- Error: `Cannot read property 'xyz' of undefined`
- File: `route.ts`
- Line: `603`

### 5. Fix Error

**Remove this code (line ~603):**
```typescript
const testError = body.nonExistentProperty.xyz;
```

**Then:**
```bash
git add src/app/api/webhooks/n8n/feedback/route.ts
git commit -m "fix: remove intentional error"
git push origin main
```

### 6. Verify Fix

- Submit feedback again
- Check logs: should see `SUCCESS`
- No errors in logs

---

## What to Look For in Logs

### Error Log (What You'll See)

```
[WEBHOOK] 2025-01-15T10:00:00Z | IP | ERROR | ...
Error: Cannot read property 'xyz' of undefined
    at POST (/var/task/app/api/webhooks/n8n/feedback/route.ts:603:45)
```

### Success Log (After Fix)

```
[WEBHOOK] 2025-01-15T10:00:01Z | IP | SUCCESS | Feedback stored successfully
```

---

## Common Questions

**Q: Where are Vercel logs?**
A: Dashboard → Project → Logs tab

**Q: How to filter logs?**
A: Use search box: `/api/webhooks/n8n/feedback`

**Q: What line number?**
A: Check stack trace: `route.ts:603:45` = line 603

**Q: How to find the error in code?**
A: Open `src/app/api/webhooks/n8n/feedback/route.ts`, go to line 603

**Q: What does the error mean?**
A: Tried to access `.xyz` on `undefined` (because `body.nonExistentProperty` doesn't exist)

---

## Exercise Checklist

- [ ] Error added to code
- [ ] Committed and pushed
- [ ] Deployment completed
- [ ] Error triggered
- [ ] Found error in Vercel logs
- [ ] Read stack trace
- [ ] Identified root cause
- [ ] Fixed the error
- [ ] Verified fix works

---

**Ready to practice?** Follow the steps above! 🚀

