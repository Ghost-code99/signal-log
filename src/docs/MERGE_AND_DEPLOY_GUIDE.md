# Merge and Deploy Guide - user-feedback → main

**Complete guide to merge your user-feedback branch to main and deploy to production**

---

## Step 1: Check Current Branch

### Verify You're on user-feedback Branch

```bash
git branch --show-current
```

**Expected Output:**
```
user-feedback
```

**If you're on a different branch:**
```bash
git checkout user-feedback
```

---

## Step 2: Commit All Changes

### Check What Needs to Be Committed

```bash
git status
```

### Stage All Changes

```bash
# Stage all changes (including new files)
git add .

# Or stage specific files:
git add src/components/security-advisor.tsx
git add src/app/api/webhooks/n8n/feedback/route.ts
git add src/app/actions/
git add src/components/feedback-modal.tsx
git add src/docs/
git add supabase/schemas/09-feedback.sql
```

### Commit Changes

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

## Step 3: Push user-feedback Branch

### Push to GitHub

```bash
git push origin user-feedback
```

**This ensures all your changes are on GitHub before merging.**

---

## Step 4: Switch to main Branch

### Checkout main Branch

```bash
git checkout main
```

### Pull Latest Changes

```bash
git pull origin main
```

**This ensures your local main is up-to-date with remote.**

---

## Step 5: Merge user-feedback into main

### Option A: Merge Commit (Recommended)

```bash
git merge user-feedback --no-ff -m "Merge user-feedback branch: Add feedback system with n8n integration"
```

**`--no-ff` creates a merge commit, preserving branch history.**

### Option B: Squash Merge (Cleaner History)

```bash
git merge --squash user-feedback
git commit -m "feat: implement user feedback system with n8n integration"
```

**Squash merge combines all commits into one.**

### Verify Merge

```bash
git log --oneline -5
```

**You should see your merge commit at the top.**

---

## Step 6: Push to GitHub (Triggers Vercel)

### Push main Branch

```bash
git push origin main
```

**This triggers Vercel deployment automatically.**

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

## Step 7: Verify Deployment in Vercel

### Option A: Vercel Dashboard

1. **Go to Vercel Dashboard:**
   - Visit: https://vercel.com/dashboard
   - Select your project

2. **Check Deployments Tab:**
   - Click "Deployments" in sidebar
   - Look for latest deployment
   - Status should be "Ready" (green checkmark)

3. **Check Build Logs:**
   - Click on the deployment
   - Click "Build Logs" tab
   - Verify:
     - ✅ Build succeeded
     - ✅ No errors
     - ✅ All routes compiled

4. **Check Production URL:**
   - Click "Visit" button
   - Or use your production domain
   - Verify app loads correctly

### Option B: Vercel CLI

```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Check deployment status
vercel ls

# View latest deployment
vercel inspect
```

### What to Look For

**✅ Success Indicators:**
- Status: "Ready" (green)
- Build time: Reasonable (< 5 minutes)
- Build logs: No errors
- Production URL: App loads

**❌ Failure Indicators:**
- Status: "Error" (red)
- Build logs: Error messages
- Production URL: 404 or error page

---

## Step 8: Update n8n Webhook Callback URL

### Get Your Production URL

**Your production URL is:**
- Custom domain: `https://your-domain.com`
- Vercel domain: `https://your-project.vercel.app`

**Full webhook endpoint:**
```
https://your-domain.com/api/webhooks/n8n/feedback
```

### Update n8n Workflow

1. **Open n8n Workflow:**
   - Go to your n8n instance
   - Open the feedback workflow

2. **Find HTTP Request Node:**
   - This is the node that sends data back to your app
   - It should be after the Gmail node

3. **Update URL:**
   - Click on the HTTP Request node
   - Find "URL" field
   - Replace preview URL with production URL:
     ```
     https://your-domain.com/api/webhooks/n8n/feedback
     ```

4. **Verify API Key:**
   - Check "Headers" section
   - Ensure `X-API-Key` header is set
   - Value should match `N8N_WEBHOOK_SECRET` from Vercel

5. **Save Workflow:**
   - Click "Save" button
   - Workflow is now using production URL

### Test the Updated Webhook

1. **Submit test feedback:**
   - Go to your production site
   - Click "Give Feedback"
   - Submit a test message

2. **Verify in n8n:**
   - Check execution history
   - Should show successful webhook callback

3. **Verify in Supabase:**
   - Check `feedback` table
   - Should see new row with all fields

---

## Step 9: Verify Environment Variables

### Check Vercel Environment Variables

1. **Go to Vercel Dashboard:**
   - Project Settings → Environment Variables

2. **Verify These Are Set:**
   - ✅ `N8N_FEEDBACK_WEBHOOK_URL` (n8n webhook URL)
   - ✅ `N8N_WEBHOOK_SECRET` (API key for webhook)
   - ✅ `SUPABASE_SERVICE_ROLE_KEY` (Supabase service role key)
   - ✅ `NEXT_PUBLIC_SUPABASE_URL` (Supabase URL)

3. **Ensure They're Applied To:**
   - ✅ Production
   - ✅ Preview (optional)

### If Missing, Add Them:

1. Click "Add New"
2. Enter variable name
3. Enter variable value
4. Select "Production" (and "Preview" if needed)
5. Click "Save"
6. Redeploy if needed

---

## Step 10: Final Verification

### Test Complete Flow

1. **Submit Feedback:**
   - Go to production site
   - Click "Give Feedback"
   - Submit a test message

2. **Check n8n:**
   - Execution history shows webhook received
   - AI Agent processed message
   - Gmail sent notification

3. **Check Email:**
   - Receive Gmail notification
   - Contains feedback + AI analysis

4. **Check Supabase:**
   - Query `feedback` table
   - New row with all fields populated

5. **Check Vercel Logs:**
   - Go to Vercel Dashboard
   - Click "Logs" tab
   - Should see webhook logs:
     ```
     [WEBHOOK] 2025-01-15T10:00:00Z | IP | SUCCESS | Feedback stored
     ```

---

## Troubleshooting

### Issue: Merge Conflicts

**Solution:**
```bash
# Resolve conflicts
git status  # See conflicted files
# Edit files to resolve conflicts
git add .
git commit -m "fix: resolve merge conflicts"
```

### Issue: Vercel Deployment Fails

**Check:**
1. Build logs for errors
2. Environment variables are set
3. All dependencies are in package.json

**Fix:**
1. Fix errors in code
2. Add missing env vars
3. Redeploy

### Issue: n8n Webhook Fails

**Check:**
1. Production URL is correct
2. API key matches in n8n and Vercel
3. Vercel logs for errors

**Fix:**
1. Update URL in n8n
2. Verify API key
3. Check Vercel logs

### Issue: Supabase Insert Fails

**Check:**
1. RLS policies are correct
2. Service role key is valid
3. Table exists

**Fix:**
1. Review RLS policies
2. Verify service role key
3. Run migration if needed

---

## Quick Reference Commands

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
git merge user-feedback --no-ff -m "Merge user-feedback branch"

# Push to trigger deployment
git push origin main

# Check deployment
# Go to Vercel dashboard
```

---

## Post-Deployment Checklist

- [ ] Vercel deployment succeeded
- [ ] Production site loads correctly
- [ ] n8n webhook URL updated to production
- [ ] Environment variables set in Vercel
- [ ] Test feedback submission works
- [ ] n8n receives webhook from app
- [ ] n8n sends callback to production webhook
- [ ] Supabase receives and stores feedback
- [ ] Email notifications working
- [ ] Vercel logs show successful webhook calls

---

## Summary

**You're ready to merge!** Follow these steps:

1. ✅ Commit all changes
2. ✅ Push user-feedback branch
3. ✅ Switch to main
4. ✅ Merge user-feedback
5. ✅ Push to trigger deployment
6. ✅ Verify in Vercel
7. ✅ Update n8n webhook URL
8. ✅ Test complete flow

**Good luck with your deployment!** 🚀

