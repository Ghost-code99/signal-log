# Production Deployment Checklist

**Complete checklist for deploying user-feedback branch to production**

---

## Pre-Deployment Checklist

### ✅ Code Quality
- [x] TypeScript type checking passes
- [x] ESLint passes (warnings OK)
- [x] Production build succeeds
- [x] All critical errors fixed

### ✅ Git Status
- [ ] All changes committed
- [ ] user-feedback branch pushed to GitHub
- [ ] Ready to merge

---

## Step 1: Commit All Changes

### Current Status
You're on `user-feedback` branch with uncommitted changes.

### Stage All Feedback Files

```bash
# Already staged:
# ✅ src/app/actions/submit-feedback.ts
# ✅ src/app/api/webhooks/n8n/feedback/route.ts
# ✅ src/components/feedback-modal.tsx
# ✅ src/lib/supabase-service.ts
# ✅ supabase/schemas/09-feedback.sql
# ✅ All documentation files
# ✅ src/components/security-advisor.tsx (fixes)

# Stage any remaining important files
git add src/components/security-advisor.tsx
git add src/docs/MERGE_AND_DEPLOY_GUIDE.md
git add src/docs/PRE_PRODUCTION_CHECKLIST.md
git add src/docs/PRODUCTION_READY_GUIDE.md
git add src/docs/PRODUCTION_VERIFICATION_RESULTS.md
```

### Commit

```bash
git commit -m "feat: implement user feedback system with n8n integration

- Add feedback form submission (Stage 1)
- Add webhook endpoint for n8n callback (Stage 2)
- Implement rate limiting and API key verification
- Add request logging
- Fix production build errors
- Add comprehensive documentation"
```

---

## Step 2: Push user-feedback Branch

```bash
git push origin user-feedback
```

**Verify on GitHub:**
- Go to your GitHub repo
- Check `user-feedback` branch exists
- Verify all commits are there

---

## Step 3: Switch to main Branch

```bash
# Check current branch
git branch --show-current
# Should show: user-feedback

# Switch to main
git checkout main

# Pull latest changes
git pull origin main
```

**Expected:**
- Switched to main branch
- Local main is up-to-date

---

## Step 4: Merge user-feedback into main

### Option A: Merge Commit (Recommended)

```bash
git merge user-feedback --no-ff -m "Merge user-feedback: Add feedback system with n8n integration"
```

**`--no-ff` preserves branch history.**

### Option B: Squash Merge (Cleaner)

```bash
git merge --squash user-feedback
git commit -m "feat: implement user feedback system with n8n integration"
```

### Verify Merge

```bash
git log --oneline -3
```

**Should show your merge commit at top.**

---

## Step 5: Push to GitHub (Triggers Vercel)

```bash
git push origin main
```

**This automatically triggers Vercel deployment.**

**Expected Output:**
```
Enumerating objects: X, done.
Counting objects: 100% (X/X), done.
Delta compression using up to X threads
Compressing objects: 100% (X/X), done.
Writing objects: 100% (X/X), done.
To https://github.com/your-username/signal-log.git
   abc1234..def5678  main -> main
```

---

## Step 6: Verify Deployment in Vercel

### Access Vercel Dashboard

1. **Go to:** https://vercel.com/dashboard
2. **Select your project**

### Check Deployment Status

1. **Click "Deployments" in sidebar**
2. **Find latest deployment** (should be at top)
3. **Check status:**
   - ✅ **"Ready"** (green) = Success
   - ⏳ **"Building"** = In progress
   - ❌ **"Error"** = Failed

### Check Build Logs

1. **Click on the deployment**
2. **Click "Build Logs" tab**
3. **Verify:**
   - ✅ Build succeeded
   - ✅ No errors
   - ✅ Routes compiled:
     - `/api/webhooks/n8n/feedback` should appear

### Check Production URL

1. **Click "Visit" button** (or use your domain)
2. **Verify:**
   - ✅ Site loads
   - ✅ No errors
   - ✅ Feedback button visible

### Check Function Logs

1. **Click "Logs" tab**
2. **Filter by:** `/api/webhooks/n8n/feedback`
3. **Should see:** Webhook logs when requests come in

---

## Step 7: Update n8n Webhook Callback URL

### Get Your Production URL

**Your production URL is one of:**
- Custom domain: `https://your-domain.com`
- Vercel domain: `https://your-project.vercel.app`

**Full webhook endpoint:**
```
https://your-domain.com/api/webhooks/n8n/feedback
```

### Update n8n Workflow

1. **Open n8n:**
   - Go to your n8n instance
   - Open the feedback workflow

2. **Find HTTP Request Node:**
   - This is the node after Gmail
   - It sends processed feedback back to your app

3. **Update URL:**
   - Click on HTTP Request node
   - Find "URL" field
   - **Current (preview):** `https://your-app-abc123.vercel.app/api/webhooks/n8n/feedback`
   - **Update to (production):** `https://your-domain.com/api/webhooks/n8n/feedback`

4. **Verify Headers:**
   - Check "Headers" section
   - Ensure `X-API-Key` header exists
   - Value should match `N8N_WEBHOOK_SECRET` from Vercel

5. **Save:**
   - Click "Save" button
   - Workflow now uses production URL

### Test Updated Webhook

1. **Submit test feedback:**
   - Go to production site
   - Click "Give Feedback"
   - Submit: "Testing production webhook"

2. **Verify in n8n:**
   - Check execution history
   - Should show successful callback to production URL

3. **Verify in Vercel logs:**
   - Go to Vercel → Logs
   - Should see: `[WEBHOOK] ... | SUCCESS | Feedback stored`

4. **Verify in Supabase:**
   - Check `feedback` table
   - New row with all fields populated

---

## Step 8: Verify Environment Variables

### Check Vercel Environment Variables

1. **Go to:** Vercel Dashboard → Project Settings → Environment Variables

2. **Verify These Are Set:**
   - ✅ `N8N_FEEDBACK_WEBHOOK_URL` = Your n8n webhook URL
   - ✅ `N8N_WEBHOOK_SECRET` = API key for webhook (from `openssl rand -hex 32`)
   - ✅ `SUPABASE_SERVICE_ROLE_KEY` = Supabase service role key
   - ✅ `NEXT_PUBLIC_SUPABASE_URL` = Your Supabase URL

3. **Ensure Applied To:**
   - ✅ Production
   - ✅ Preview (optional)

### If Missing, Add Them

1. Click "Add New"
2. Enter name and value
3. Select "Production"
4. Click "Save"
5. **Redeploy** if needed (Vercel will auto-redeploy)

---

## Step 9: Final Testing

### Test Complete Flow

1. **Submit Feedback:**
   - Go to production site
   - Click "Give Feedback"
   - Submit: "Production test feedback"

2. **Check n8n:**
   - ✅ Execution history shows webhook received
   - ✅ AI Agent processed message
   - ✅ Gmail sent notification

3. **Check Email:**
   - ✅ Receive Gmail notification
   - ✅ Contains feedback + AI analysis

4. **Check Supabase:**
   - ✅ Query `feedback` table
   - ✅ New row with all fields:
     - userId, firstName, lastName, email
     - message, browser, url, timestamp
     - sentiment, category, priority, summary, actionable

5. **Check Vercel Logs:**
   - ✅ Go to Vercel → Logs
   - ✅ Should see:
     ```
     [WEBHOOK] 2025-01-15T10:00:00Z | IP | SUCCESS | Feedback stored successfully
     ```

---

## Troubleshooting

### Deployment Fails

**Check:**
1. Build logs for errors
2. Environment variables are set
3. All dependencies in package.json

**Fix:**
1. Fix errors in code
2. Add missing env vars
3. Redeploy

### n8n Webhook Fails

**Check:**
1. Production URL is correct
2. API key matches
3. Vercel logs for errors

**Fix:**
1. Update URL in n8n
2. Verify API key
3. Check Vercel logs

### Supabase Insert Fails

**Check:**
1. RLS policies are correct
2. Service role key is valid
3. Table exists

**Fix:**
1. Review RLS policies
2. Verify service role key
3. Run migration if needed

---

## Post-Deployment Checklist

- [ ] Vercel deployment succeeded
- [ ] Production site loads
- [ ] n8n webhook URL updated
- [ ] Environment variables set
- [ ] Test feedback submission works
- [ ] n8n receives webhook
- [ ] n8n sends callback to production
- [ ] Supabase stores feedback
- [ ] Email notifications working
- [ ] Vercel logs show success

---

## Quick Command Reference

```bash
# Check branch
git branch --show-current

# Commit changes
git add .
git commit -m "feat: implement user feedback system"

# Push branch
git push origin user-feedback

# Switch to main
git checkout main
git pull origin main

# Merge
git merge user-feedback --no-ff -m "Merge user-feedback"

# Push to trigger deployment
git push origin main
```

---

**You're ready to deploy!** Follow the steps above. 🚀

