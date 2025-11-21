# Production Transition Guide: Clerk Dev → Clerk Prod

**Date:** January 2025  
**Status:** 📋 **TRANSITION CHECKLIST**

---

## Overview

This guide walks you through transitioning from:
- **Clerk Development** + **Stripe Test** → **Clerk Production** + **Stripe Live**

**Important:** Your Supabase database remains the same (single remote instance).

---

## Prerequisites Checklist

Before starting, ensure you have completed these in Stripe:

- [ ] ✅ Business verification completed in Stripe
- [ ] ✅ Bank account connected and verified in Stripe
- [ ] ✅ Stripe live API keys obtained (publishable and secret)
- [ ] ✅ Stripe live webhook endpoint configured (if using direct Stripe webhooks)
- [ ] ✅ Payment methods tested in Stripe test mode

**Note:** You're using Clerk Billing, so you primarily need Clerk production keys. Stripe is managed by Clerk.

---

## Step 1: Switch Clerk to Production Environment

### 1.1 Access Clerk Production Dashboard

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. **Switch to Production Environment** (top right corner)
   - Click environment selector
   - Select "Production" (not "Development")

### 1.2 Connect Clerk Production to Stripe Live

1. In Clerk Production Dashboard → **Billing** → **Settings**
2. Click **Connect Stripe Account**
3. Select your **Live Stripe Account** (not test)
4. Complete the OAuth connection flow
5. Verify connection shows "Connected" status

### 1.3 Verify Plans in Production

1. Go to **Billing** → **Plans**
2. Verify all 3 plans exist:
   - Starter ($49/month)
   - Professional ($99/month)
   - Strategic ($149/month)
3. Verify plan IDs match your code (check `mapClerkPlanToSchema` function)

### 1.4 Get Production Webhook Secret

1. Go to **Webhooks** in Clerk Production Dashboard
2. Click **Add Endpoint** (or edit existing)
3. **Copy the Signing Secret** (you'll need this for `CLERK_WEBHOOK_SECRET`)
4. **Save the secret securely** - you'll add it to Vercel

---

## Step 2: Update Environment Variables in Vercel

### 2.1 Access Vercel Environment Variables

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**

### 2.2 Update Production Environment Variables

Add or update these variables for **Production** environment:

#### Required Variables

```bash
# Clerk Production
CLERK_WEBHOOK_SECRET=whsec_...  # From Clerk Production Dashboard → Webhooks

# Supabase (same as before - single remote database)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...  # Your Supabase anon key
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # Your Supabase service role key

# Clerk (if not already set)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...  # From Clerk Production
CLERK_SECRET_KEY=sk_live_...  # From Clerk Production
```

#### Optional Variables (if using direct Stripe)

```bash
# Only if you're making direct Stripe API calls (not needed for Clerk Billing)
STRIPE_SECRET_KEY=sk_live_...  # From Stripe Dashboard
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...  # From Stripe Dashboard
```

### 2.3 Apply Environment Variables

1. **Select Environment:** Choose "Production" (not Preview or Development)
2. **Add each variable** with the production value
3. **Save** each variable
4. **Verify** all variables are listed for Production environment

### 2.4 Important Notes

- ⚠️ **Never commit secrets to git** - they're only in Vercel
- ✅ **Production environment only** - these values are for production
- ✅ **Preview/Development** can keep test keys for testing

---

## Step 3: Deploy to Production

### 3.1 Verify Main Branch

Your `main` branch should already have the payment implementation merged:

```bash
git checkout main
git pull origin main
```

### 3.2 Trigger Production Deployment

**Option A: Automatic (Recommended)**
- Vercel automatically deploys `main` branch to production
- Check Vercel Dashboard → **Deployments** tab
- Wait for deployment to complete (usually 2-5 minutes)

**Option B: Manual Trigger**
- Go to Vercel Dashboard → **Deployments**
- Click **Redeploy** on latest main branch deployment
- Select "Use existing Build Cache" or "Rebuild"

### 3.3 Verify Deployment

1. Check deployment status in Vercel Dashboard
2. Verify deployment shows "Ready" status
3. Click on deployment to see build logs
4. Check for any build errors or warnings

---

## Step 4: Configure Production Webhook URL

### 4.1 Get Your Production Domain

Your production domain should be:
- `https://your-domain.com` (your custom domain)
- Or `https://your-project.vercel.app` (Vercel default domain)

### 4.2 Add Webhook Endpoint in Clerk

1. Go to **Clerk Production Dashboard** → **Webhooks**
2. Click **Add Endpoint**
3. Enter webhook URL:
   ```
   https://your-domain.com/api/webhooks/clerk
   ```
   Replace `your-domain.com` with your actual production domain

4. **Select Events:**
   - ✅ `subscription.created`
   - ✅ `subscription.updated`
   - ✅ `subscription.active`
   - ✅ `subscription.pastDue` (or `subscription.past_due`)

5. **Save** the webhook endpoint

### 4.3 Test Webhook Endpoint

1. In Clerk Dashboard → **Webhooks** → Your endpoint
2. Click **Send Test Event**
3. Select event type: `subscription.created`
4. Check Vercel logs to verify webhook received:
   - Go to Vercel Dashboard → **Functions** tab
   - Filter by `/api/webhooks/clerk`
   - Check latest invocation shows 200 status

### 4.4 Verify Webhook Secret

1. In Clerk Dashboard → **Webhooks** → Your endpoint
2. Copy the **Signing Secret**
3. Verify it matches `CLERK_WEBHOOK_SECRET` in Vercel
4. If different, update Vercel environment variable

---

## Step 5: Test Production Flow (Small Amount)

### 5.1 Create Test Subscription

**⚠️ IMPORTANT:** Use a small amount and cancel immediately if testing only.

1. Go to your production site: `https://your-domain.com/pricing`
2. Click **Subscribe** on the lowest plan (Starter - $49/month)
3. Complete checkout with your real credit card
4. **Use a small amount** - you'll cancel immediately

### 5.2 Verify Webhook Fires

1. Check Vercel logs:
   - Vercel Dashboard → **Functions** → `/api/webhooks/clerk`
   - Should see `subscription.created` event
   - Status should be 200

2. Check Clerk Dashboard:
   - **Billing** → **Subscriptions**
   - Should see your test subscription

3. Check Supabase:
   - Go to Supabase Dashboard → **Table Editor** → `subscriptions`
   - Should see new subscription record
   - Verify `status` is `active`
   - Verify `plan_name` matches

### 5.3 Verify Feature Gates Work

1. As subscribed user, test premium features:
   - Try creating a project (should work)
   - Try accessing `/api/premium` (should return 200)
   - Verify `ProtectedFeature` components show content

2. As free user (different account):
   - Try creating a project (should be blocked)
   - Try accessing `/api/premium` (should return 403)
   - Verify upgrade prompts appear

### 5.4 Cancel Test Subscription (If Testing Only)

1. Go to Clerk Dashboard → **Billing** → **Subscriptions**
2. Find your test subscription
3. Click **Cancel Subscription**
4. Verify webhook fires `subscription.updated` with `status: canceled`
5. Verify Supabase updates subscription status

---

## Step 6: Monitor Production

### 6.1 Monitor Webhook Logs

**Clerk Dashboard:**
1. Go to **Webhooks** → Your endpoint
2. Check **Recent Deliveries** tab
3. Verify all events show "Success" status
4. Check for any failed deliveries

**Vercel Dashboard:**
1. Go to **Functions** → `/api/webhooks/clerk`
2. Monitor invocation count
3. Check for errors in logs
4. Verify response times are reasonable (< 1 second)

### 6.2 Monitor Subscription Events

**Stripe Dashboard:**
1. Go to **Events** tab
2. Filter by subscription events
3. Verify events are firing correctly
4. Check for any errors

**Clerk Dashboard:**
1. Go to **Billing** → **Subscriptions**
2. Monitor active subscriptions
3. Check for any issues

### 6.3 Monitor Database Sync

**Supabase Dashboard:**
1. Go to **Table Editor** → `subscriptions`
2. Verify new subscriptions are being created
3. Verify subscription updates are syncing
4. Check for any missing data

### 6.4 Set Up Alerts (Recommended)

**Vercel:**
- Set up error alerts for webhook endpoint
- Monitor function execution time

**Clerk:**
- Set up webhook failure alerts
- Monitor subscription events

**Supabase:**
- Set up database error alerts
- Monitor table growth

---

## Troubleshooting

### Webhook Not Receiving Events

**Symptoms:**
- No webhook invocations in Vercel
- Clerk shows "Failed" deliveries

**Solutions:**
1. Verify webhook URL is correct (https, not http)
2. Verify `CLERK_WEBHOOK_SECRET` matches Clerk dashboard
3. Check Vercel deployment is live
4. Test webhook endpoint manually: `GET https://your-domain.com/api/webhooks/clerk`

### Subscription Not Syncing to Database

**Symptoms:**
- Webhook receives events (200 status)
- No data in Supabase `subscriptions` table

**Solutions:**
1. Check Vercel logs for database errors
2. Verify `SUPABASE_SERVICE_ROLE_KEY` is set correctly
3. Verify database migrations are applied
4. Check Supabase logs for connection issues

### Feature Gates Not Working

**Symptoms:**
- Subscribed users can't access features
- Free users can access premium features

**Solutions:**
1. Verify `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is production key
2. Verify `CLERK_SECRET_KEY` is production key
3. Check Clerk Dashboard → User → Subscriptions (verify subscription exists)
4. Test `checkPlanAccess()` function directly

---

## Production Checklist

### Pre-Deployment

- [ ] Business verified in Stripe
- [ ] Bank account connected in Stripe
- [ ] Stripe live keys obtained
- [ ] Clerk production environment active
- [ ] Clerk production connected to Stripe live

### Deployment

- [ ] Environment variables updated in Vercel (Production)
- [ ] `CLERK_WEBHOOK_SECRET` set to production value
- [ ] Main branch deployed to production
- [ ] Production deployment verified (status: Ready)

### Webhook Configuration

- [ ] Webhook endpoint added in Clerk production
- [ ] Webhook URL: `https://your-domain.com/api/webhooks/clerk`
- [ ] Events selected: `subscription.created`, `subscription.updated`, `subscription.active`, `subscription.pastDue`
- [ ] Test event sent and verified (200 status)

### Testing

- [ ] Test subscription created (small amount)
- [ ] Webhook received and processed (check Vercel logs)
- [ ] Subscription synced to Supabase (check database)
- [ ] Feature gates tested (subscribed user)
- [ ] Feature gates tested (free user)
- [ ] Test subscription canceled (if testing only)

### Monitoring

- [ ] Webhook logs monitored (Clerk + Vercel)
- [ ] Subscription events monitored (Stripe + Clerk)
- [ ] Database sync verified (Supabase)
- [ ] Error alerts configured

---

## Important Notes

### Database

- ✅ **Same Supabase database** - No migration needed
- ✅ **Single remote instance** - Used for both dev and prod
- ✅ **Migrations already applied** - From payment-implementation branch

### Environment Separation

- **Development:** Clerk Dev + Stripe Test (for testing)
- **Production:** Clerk Prod + Stripe Live (for real customers)
- **Database:** Same Supabase instance (shared)

### Security

- ⚠️ **Never commit secrets** - Only in Vercel environment variables
- ✅ **Webhook signature verification** - Prevents forged webhooks
- ✅ **Server-side checks** - Feature gates cannot be bypassed

---

## Next Steps After Transition

1. **Monitor for 24-48 hours:**
   - Watch webhook logs
   - Monitor subscription events
   - Check for any errors

2. **Test with real customer:**
   - Have a trusted user test the full flow
   - Verify subscription works end-to-end
   - Confirm feature gates work correctly

3. **Set up monitoring:**
   - Configure error alerts
   - Set up dashboards
   - Monitor key metrics

4. **Document production setup:**
   - Document environment variables
   - Document webhook configuration
   - Create runbook for common issues

---

## Support Resources

- **Clerk Documentation:** https://clerk.com/docs
- **Stripe Documentation:** https://stripe.com/docs
- **Vercel Documentation:** https://vercel.com/docs
- **Supabase Documentation:** https://supabase.com/docs

---

**Status:** 📋 **READY FOR PRODUCTION TRANSITION**

**Last Updated:** January 2025

