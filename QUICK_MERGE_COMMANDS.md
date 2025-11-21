# Quick Merge Commands - Copy & Paste

**Current Status:** On `user-feedback` branch, ready to merge

---

## Step 1: Check Current Branch

```bash
git branch --show-current
```

**Expected:** `user-feedback`

---

## Step 2: Commit All Feedback Changes

```bash
# Stage all feedback-related files (already done)
# Verify what's staged
git status

# Commit
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

```bash
git push origin user-feedback
```

---

## Step 4: Switch to main and Merge

```bash
# Switch to main
git checkout main

# Pull latest
git pull origin main

# Merge user-feedback
git merge user-feedback --no-ff -m "Merge user-feedback: Add feedback system with n8n integration"

# Verify merge
git log --oneline -3
```

---

## Step 5: Push to Trigger Vercel Deployment

```bash
git push origin main
```

**This automatically triggers Vercel deployment!**

---

## Step 6: Verify in Vercel

1. Go to: https://vercel.com/dashboard
2. Select your project
3. Click "Deployments"
4. Check latest deployment status:
   - ✅ "Ready" (green) = Success
   - ⏳ "Building" = In progress
   - ❌ "Error" = Failed

---

## Step 7: Update n8n Webhook URL

1. Open n8n workflow
2. Find HTTP Request node (after Gmail)
3. Update URL to production:
   ```
   https://your-domain.com/api/webhooks/n8n/feedback
   ```
4. Verify `X-API-Key` header is set
5. Save workflow

---

## Step 8: Test Production

1. Go to production site
2. Submit test feedback
3. Verify:
   - ✅ n8n execution history
   - ✅ Email received
   - ✅ Supabase feedback table
   - ✅ Vercel logs

---

**Ready? Run the commands above!** 🚀

