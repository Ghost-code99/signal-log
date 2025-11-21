# Complete Payment Integration Implementation Guide

**Step-by-step guide to complete the payment integration system**

**Date:** January 2025  
**Feature Branch:** `payment-integration`

---

## Overview

This guide walks you through completing the payment integration system that:
1. Receives Clerk Billing webhooks
2. Syncs subscription status to Supabase
3. Gates premium features using Clerk's `has()` helper

---

## ✅ What's Already Done

### 1. PRD Created
- **File:** `src/docs/payment-gates/payment-gates-prd.md`
- Complete specification of the payment system
- All event types, database schema, and feature gating documented

### 2. Database Migration
- **File:** `supabase/schemas/10-subscription-fields.sql`
- Adds subscription fields to `users` table
- Includes indexes and triggers
- Ready to apply

### 3. Webhook Endpoint
- **File:** `src/app/api/webhooks/clerk/route.ts`
- Handles all Clerk Billing webhook events
- Verifies signatures using Svix
- Updates Supabase database
- Error handling and logging

### 4. Dependencies Installed
- `svix` package installed for webhook verification

---

## 📋 Next Steps to Complete

### Step 1: Apply Database Migration

**Option A: Using Supabase Dashboard**
1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `supabase/schemas/10-subscription-fields.sql`
3. Paste and run in SQL Editor
4. Verify migration succeeded

**Option B: Using Supabase CLI**
```bash
# If you have Supabase CLI set up
supabase db push
```

**Verify:**
- Check `users` table has new subscription columns
- Check indexes were created
- Check trigger was created

---

### Step 2: Configure Clerk Webhook

1. **Get your webhook URL:**
   - Local: Use ngrok or similar to expose local server
   - Production: `https://your-domain.com/api/webhooks/clerk`
   - Vercel Preview: Use preview deployment URL

2. **Configure in Clerk Dashboard:**
   - Go to Clerk Dashboard → Webhooks
   - Click "Add Endpoint"
   - Enter your webhook URL
   - Enable these events:
     - `subscription.created`
     - `subscription.updated`
     - `subscription.active`
     - `subscription.pastDue`
   - Save and copy the webhook signing secret

3. **Add Environment Variable:**
   - Add `CLERK_WEBHOOK_SECRET` to `.env.local`
   - Add to Vercel environment variables
   - Value: The signing secret from Clerk

---

### Step 3: Test Webhook Endpoint

**Test locally:**
1. Start dev server: `npm run dev`
2. Use Clerk's webhook testing tool or send test request
3. Check logs for webhook received
4. Verify database updated

**Test with actual subscription:**
1. Create test subscription in Clerk (use test card)
2. Check webhook received
3. Verify database updated with subscription data

---

### Step 4: Implement Feature Gates

**Using Clerk's `has()` Helper:**

**In Server Components/Actions:**
```typescript
import { auth, clerkClient } from '@clerk/nextjs/server';

// Check if user has feature
const { userId } = await auth();
if (userId) {
  const hasFeature = await clerkClient.users.hasFeature(userId, 'unlimited_projects');
  if (!hasFeature) {
    // Show upgrade prompt or redirect
  }
}
```

**In Client Components:**
```typescript
import { useUser } from '@clerk/nextjs';

const { user } = useUser();
const hasFeature = user?.hasFeature('unlimited_projects');

if (!hasFeature) {
  return <UpgradePrompt />;
}
```

**Pages to Gate:**
- `/cross-project-analysis` - Requires `cross_project_analysis`
- `/assumption-challenger` - Requires `assumption_challenger`
- `/experiment-canvas` - Requires `experiment_canvas`
- `/portfolio-analytics` - Requires `portfolio_analytics` (Strategic only)

**Features to Gate:**
- Unlimited projects - Check `unlimited_projects` feature
- Real-time health scanner - Check `realtime_health_scanner` feature
- API access - Check `api_access` feature (Strategic only)

---

### Step 5: Create Upgrade Prompt Component

**File:** `src/components/upgrade-prompt.tsx`

```typescript
'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';

interface UpgradePromptProps {
  feature: string;
  plan?: 'professional' | 'strategic';
}

export function UpgradePrompt({ feature, plan = 'professional' }: UpgradePromptProps) {
  return (
    <Card className="p-8 text-center">
      <Sparkles className="h-12 w-12 text-primary mx-auto mb-4" />
      <h2 className="text-2xl font-bold mb-2">Upgrade to Unlock This Feature</h2>
      <p className="text-muted-foreground mb-6">
        This feature is available on the {plan === 'professional' ? 'Professional' : 'Strategic'} plan.
      </p>
      <Link href="/pricing">
        <Button size="lg">View Pricing Plans</Button>
      </Link>
    </Card>
  );
}
```

---

### Step 6: Test Complete Flow

**Test Scenarios:**

1. **New Subscription:**
   - User subscribes to Professional plan
   - Webhook received: `subscription.created`
   - Database updated
   - Features unlocked

2. **Plan Upgrade:**
   - User upgrades Starter → Professional
   - Webhook received: `subscription.updated`
   - Database updated
   - New features unlocked

3. **Feature Gating:**
   - User without feature tries to access premium page
   - Upgrade prompt shown
   - User subscribes
   - Feature unlocked

4. **Cancellation:**
   - User cancels subscription
   - Webhook received: `subscription.updated` (status: 'canceled')
   - Database updated
   - Access revoked at period end

---

## 🔧 Troubleshooting

### Webhook Not Receiving Events

**Check:**
- Webhook URL is correct in Clerk dashboard
- Webhook secret is set in environment variables
- Endpoint is accessible (not blocked by firewall)
- Check Clerk webhook logs

### Database Not Updating

**Check:**
- Service role key is set correctly
- User exists in database with `clerk_user_id`
- Check webhook logs for errors
- Verify Supabase connection

### Feature Gates Not Working

**Check:**
- User has active subscription
- Features are assigned to plan in Clerk
- Using correct feature keys
- Check Clerk's `has()` helper documentation

---

## 📚 Resources

- **PRD:** `src/docs/payment-gates/payment-gates-prd.md`
- **Clerk Webhooks:** https://clerk.com/docs/webhooks
- **Clerk Billing:** https://clerk.com/docs/billing
- **Clerk has() Helper:** https://clerk.com/docs/billing/feature-gating

---

## ✅ Completion Checklist

- [ ] Database migration applied
- [ ] Clerk webhook configured
- [ ] Webhook secret added to environment
- [ ] Webhook endpoint tested
- [ ] Feature gates implemented
- [ ] Upgrade prompts added
- [ ] Complete flow tested
- [ ] Ready for production

---

**Last Updated:** January 2025

