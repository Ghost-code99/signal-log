# Quick Merge Steps - user-feedback → main

## Current Status
- ✅ On `user-feedback` branch
- ✅ Production build passes
- ⚠️ Need to commit all changes

---

## Step 1: Commit All Changes

```bash
# Stage all feedback-related files
git add src/app/actions/
git add src/app/api/webhooks/
git add src/components/feedback-modal.tsx
git add src/lib/supabase-service.ts
git add supabase/schemas/09-feedback.sql
git add src/docs/
git add src/components/security-advisor.tsx

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

## Step 2: Push user-feedback Branch

```bash
git push origin user-feedback
```

---

## Step 3: Switch to main and Merge

```bash
# Switch to main
git checkout main

# Pull latest
git pull origin main

# Merge user-feedback
git merge user-feedback --no-ff -m "Merge user-feedback: Add feedback system"

# Push to trigger Vercel deployment
git push origin main
```

---

## Step 4: Verify in Vercel

1. Go to https://vercel.com/dashboard
2. Select your project
3. Check "Deployments" tab
4. Verify latest deployment is "Ready" (green)

---

## Step 5: Update n8n Webhook URL

1. Open n8n workflow
2. Find HTTP Request node (after Gmail)
3. Update URL to: `https://your-domain.com/api/webhooks/n8n/feedback`
4. Save workflow

---

## Step 6: Test

1. Go to production site
2. Submit test feedback
3. Verify in n8n execution history
4. Verify in Supabase feedback table

---

**Ready? Run the commands above!** 🚀

