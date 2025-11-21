# Production Transition - Quick Checklist

**Date:** January 2025  
**Use this checklist during production transition**

---

## ✅ Prerequisites (Complete in Stripe First)

- [ ] Business verification completed
- [ ] Bank account connected and verified
- [ ] Stripe live API keys obtained
- [ ] Payment methods tested in test mode

---

## Step 1: Switch Clerk to Production

- [ ] Access Clerk Dashboard
- [ ] Switch to Production environment (top right)
- [ ] Connect Clerk Production to Stripe Live account
- [ ] Verify all 3 plans exist (Starter, Professional, Strategic)
- [ ] Copy production webhook signing secret

---

## Step 2: Update Vercel Environment Variables

- [ ] Go to Vercel Dashboard → Settings → Environment Variables
- [ ] Select **Production** environment (not Preview)
- [ ] Update `CLERK_WEBHOOK_SECRET` (production value)
- [ ] Verify `NEXT_PUBLIC_SUPABASE_URL` (same database)
- [ ] Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY` (same database)
- [ ] Verify `SUPABASE_SERVICE_ROLE_KEY` (same database)
- [ ] Update `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (production: `pk_live_...`)
- [ ] Update `CLERK_SECRET_KEY` (production: `sk_live_...`)
- [ ] **Never commit secrets to git** ✅

---

## Step 3: Deploy to Production

- [ ] Verify on `main` branch: `git checkout main`
- [ ] Pull latest: `git pull origin main`
- [ ] Check Vercel Dashboard → Deployments
- [ ] Verify main branch deployment is "Ready"
- [ ] Note production domain: `https://your-domain.com`

---

## Step 4: Configure Production Webhook

- [ ] Go to Clerk Production Dashboard → Webhooks
- [ ] Add endpoint: `https://your-domain.com/api/webhooks/clerk`
- [ ] Select events:
  - [ ] `subscription.created`
  - [ ] `subscription.updated`
  - [ ] `subscription.active`
  - [ ] `subscription.pastDue`
- [ ] Save webhook endpoint
- [ ] Copy signing secret → verify matches Vercel `CLERK_WEBHOOK_SECRET`
- [ ] Send test event → verify 200 status in Vercel logs

---

## Step 5: Test Production Flow

- [ ] Go to production site: `https://your-domain.com/pricing`
- [ ] Create test subscription (lowest plan, small amount)
- [ ] Complete checkout with real credit card
- [ ] Verify webhook fires (check Vercel logs)
- [ ] Verify subscription in Clerk Dashboard
- [ ] Verify subscription in Supabase `subscriptions` table
- [ ] Test feature gates (subscribed user)
- [ ] Test feature gates (free user)
- [ ] **Cancel test subscription** (if testing only)

---

## Step 6: Monitor Production

- [ ] Monitor webhook logs (Clerk Dashboard)
- [ ] Monitor webhook logs (Vercel Functions)
- [ ] Monitor subscription events (Stripe Dashboard)
- [ ] Monitor subscription events (Clerk Dashboard)
- [ ] Monitor database sync (Supabase Dashboard)
- [ ] Set up error alerts (recommended)

---

## Critical Verification Points

### Webhook Endpoint
- [ ] URL: `https://your-domain.com/api/webhooks/clerk`
- [ ] Test endpoint: `GET https://your-domain.com/api/webhooks/clerk` returns 200
- [ ] Webhook secret matches in Clerk and Vercel

### Database
- [ ] Same Supabase instance (no migration needed)
- [ ] `subscriptions` table exists
- [ ] `clerk_user_id` column exists in `users` table

### Feature Gates
- [ ] Subscribed users can access premium features
- [ ] Free users see upgrade prompts
- [ ] Server-side checks working (cannot bypass)

---

## Troubleshooting Quick Reference

| Issue | Check |
|-------|-------|
| Webhook not receiving | Verify URL, secret, deployment status |
| Subscription not syncing | Check Vercel logs, Supabase connection |
| Feature gates not working | Verify Clerk keys, check user subscription |

---

## Environment Variables Reference

### Production (Vercel)

```bash
# Clerk Production
CLERK_WEBHOOK_SECRET=whsec_...  # From Clerk Production → Webhooks
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...  # From Clerk Production
CLERK_SECRET_KEY=sk_live_...  # From Clerk Production

# Supabase (same as before)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

---

## Support

- **Full Guide:** See `PRODUCTION_TRANSITION_GUIDE.md`
- **Clerk Docs:** https://clerk.com/docs
- **Stripe Docs:** https://stripe.com/docs

---

**Status:** 📋 **READY TO START TRANSITION**

