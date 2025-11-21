# Clerk Billing Webhook Architecture

**Understanding how Clerk Billing webhooks work and keep your database in sync**

**Date:** January 2025  
**Purpose:** Prepare for Lesson 4 webhook implementation

---

## Table of Contents

1. [Overview](#1-overview)
2. [How Clerk Billing Webhooks Work](#2-how-clerk-billing-webhooks-work)
3. [Webhook Event Types](#3-webhook-event-types)
4. [Webhook Payload Structure](#4-webhook-payload-structure)
5. [Database Sync Flow](#5-database-sync-flow)
6. [Why This Matters](#6-why-this-matters)
7. [What You'll Implement](#7-what-youll-implement-in-lesson-4)
8. [Security Considerations](#8-security-considerations)

---

## 1. Overview

### What Are Webhooks?

**Webhooks are HTTP callbacks** - Clerk sends HTTP POST requests to your application whenever subscription events occur.

**Think of it like this:**
- **Polling:** Your app asks Clerk "Any updates?" every few minutes (inefficient)
- **Webhooks:** Clerk tells your app "Hey, something changed!" immediately (efficient)

### Why Webhooks Matter

**Real-time synchronization:**
- Subscription changes reflect immediately in your app
- No delays or polling needed
- Reliable event delivery

**Automatic updates:**
- No manual intervention required
- Database stays in sync automatically
- Feature gates work correctly

---

## 2. How Clerk Billing Webhooks Work

### The Flow

```
1. User subscribes → Clerk processes payment via Stripe
2. Clerk sends webhook → Your Next.js API route receives event
3. You update database → Sync subscription status to Supabase
4. Feature gates check database → Premium features unlock automatically
```

### Visual Flow Diagram

```
┌─────────┐      ┌─────────┐      ┌──────────┐      ┌──────────┐
│  User   │─────▶│  Clerk   │─────▶│ Stripe   │─────▶│ Payment  │
│         │      │          │      │          │      │ Processed│
└─────────┘      └─────────┘      └──────────┘      └──────────┘
                        │
                        │ Webhook Event
                        ▼
                 ┌──────────────┐
                 │  Your App    │
                 │  API Route   │
                 │ /api/webhook │
                 └──────────────┘
                        │
                        │ Update Database
                        ▼
                 ┌──────────────┐
                 │  Supabase    │
                 │  Database    │
                 └──────────────┘
                        │
                        │ Check Subscription
                        ▼
                 ┌──────────────┐
                 │ Feature Gates│
                 │  Unlock      │
                 └──────────────┘
```

### Step-by-Step Process

**Step 1: User Subscribes**
- User clicks "Subscribe" on pricing page
- Clerk handles checkout via Stripe
- Payment processed successfully

**Step 2: Clerk Sends Webhook**
- Clerk immediately sends HTTP POST to your webhook endpoint
- Event type: `subscription.created`
- Includes all subscription data

**Step 3: Your App Receives Webhook**
- Next.js API route at `/api/webhooks/clerk` receives the event
- Verifies webhook signature (security)
- Parses the event payload

**Step 4: Update Database**
- Extract user ID and subscription data
- Update Supabase `users` table with subscription status
- Store plan ID, features, status, etc.

**Step 5: Feature Gates Work**
- User's subscription status is now in database
- Feature gates check database
- Premium features unlock automatically

---

## 3. Webhook Event Types

### Subscription Lifecycle Events

Clerk Billing sends these webhook events:

#### 3.1 subscription.created

**When:** New subscription is created

**Triggered by:**
- User completes checkout
- User starts free trial
- Subscription is created programmatically

**What to do:**
- Create subscription record in database
- Set user's subscription status to "active" or "trialing"
- Store plan ID and features
- Log subscription creation

**Example scenario:**
```
User subscribes to Professional plan ($99/month)
→ Clerk processes payment
→ Sends subscription.created webhook
→ Your app creates subscription record
→ User gets access to Professional features
```

#### 3.2 subscription.updated

**When:** Subscription is modified

**Triggered by:**
- User upgrades plan (Starter → Professional)
- User downgrades plan (Strategic → Professional)
- Plan features change
- Billing interval changes
- Subscription status changes

**What to do:**
- Update subscription record in database
- Update plan ID and features
- Update subscription status
- Handle plan changes (upgrade/downgrade logic)

**Example scenario:**
```
User upgrades from Starter to Professional
→ Clerk processes upgrade
→ Sends subscription.updated webhook
→ Your app updates subscription record
→ User gets access to new features
```

#### 3.3 subscription.active

**When:** Subscription becomes active

**Triggered by:**
- Trial period ends and payment succeeds
- Past due subscription is paid
- Subscription is reactivated

**What to do:**
- Update subscription status to "active"
- Ensure user has access to features
- Log subscription activation

**Example scenario:**
```
User's 14-day trial ends
→ Stripe charges payment method
→ Payment succeeds
→ Clerk sends subscription.active webhook
→ Your app sets status to "active"
→ User continues to have access
```

#### 3.4 subscription.pastDue

**When:** Payment fails

**Triggered by:**
- Payment method declined
- Insufficient funds
- Payment retry failed

**What to do:**
- Update subscription status to "past_due"
- Optionally restrict access to premium features
- Send notification to user
- Log payment failure

**Example scenario:**
```
User's payment method expires
→ Stripe attempts to charge
→ Payment fails
→ Clerk sends subscription.pastDue webhook
→ Your app sets status to "past_due"
→ User may lose access to premium features
```

#### 3.5 subscription.canceled (via subscription.updated)

**When:** Subscription is canceled

**Triggered by:**
- User cancels subscription
- Subscription expires
- Manual cancellation via Clerk dashboard

**Note:** Cancellations come via `subscription.updated` when status changes to `'canceled'`, not a separate event.

**What to do:**
- Update subscription status to "canceled"
- Set cancellation date
- Optionally revoke access immediately or at period end
- Log cancellation

**Example scenario:**
```
User cancels subscription
→ Clerk processes cancellation
→ Sends subscription.updated webhook (status: 'canceled')
→ Your app sets status to "canceled"
→ User loses access (immediately or at period end)
```

---

## 4. Webhook Payload Structure

### Standard Webhook Payload

**Every Clerk webhook includes:**

```typescript
{
  // Webhook metadata
  type: 'subscription.created' | 'subscription.updated' | 'subscription.active' | 'subscription.pastDue',
  object: 'event',
  data: {
    // Subscription data
    id: 'sub_xxxxx', // Clerk subscription ID
    object: 'subscription',
    user_id: 'user_xxxxx', // User who owns the subscription
    plan_id: 'professional', // Plan ID (starter, professional, strategic)
    status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete',
    
    // Billing information
    current_period_start: 1234567890, // Unix timestamp
    current_period_end: 1234567890, // Unix timestamp
    cancel_at_period_end: false, // Will cancel at period end?
    
    // Trial information
    trial_start: 1234567890 | null,
    trial_end: 1234567890 | null,
    
    // Stripe data (Clerk includes all Stripe data you need)
    stripe_subscription_id: 'sub_xxxxx',
    stripe_customer_id: 'cus_xxxxx',
    
    // Features (array of feature keys)
    features: [
      'unlimited_projects',
      'cross_project_analysis',
      'assumption_challenger',
      // ... etc
    ],
    
    // Plan details
    plan: {
      id: 'professional',
      name: 'Professional',
      price: 9900, // In cents ($99.00)
      currency: 'usd',
      interval: 'month',
    }
  }
}
```

### Example: subscription.created Payload

```json
{
  "type": "subscription.created",
  "object": "event",
  "data": {
    "id": "sub_abc123",
    "object": "subscription",
    "user_id": "user_xyz789",
    "plan_id": "professional",
    "status": "trialing",
    "current_period_start": 1704067200,
    "current_period_end": 1705276800,
    "trial_start": 1704067200,
    "trial_end": 1705276800,
    "cancel_at_period_end": false,
    "stripe_subscription_id": "sub_stripe123",
    "stripe_customer_id": "cus_stripe456",
    "features": [
      "visual_portfolio",
      "project_status_tracking",
      "idea_capture",
      "unlimited_projects",
      "realtime_health_scanner",
      "cross_project_analysis",
      "assumption_challenger",
      "experiment_canvas",
      "advanced_ai_insights",
      "priority_support"
    ],
    "plan": {
      "id": "professional",
      "name": "Professional",
      "price": 9900,
      "currency": "usd",
      "interval": "month"
    }
  }
}
```

### Example: subscription.updated Payload (Upgrade)

```json
{
  "type": "subscription.updated",
  "object": "event",
  "data": {
    "id": "sub_abc123",
    "object": "subscription",
    "user_id": "user_xyz789",
    "plan_id": "strategic", // Changed from "professional"
    "status": "active",
    "current_period_start": 1704067200,
    "current_period_end": 1705276800,
    "features": [
      // ... all Professional features, plus:
      "custom_ai_prompts",
      "portfolio_analytics",
      "export_reporting",
      "api_access",
      "feature_requests"
    ],
    "plan": {
      "id": "strategic",
      "name": "Strategic",
      "price": 14900, // Changed from 9900
      "currency": "usd",
      "interval": "month"
    }
  }
}
```

### Example: subscription.updated Payload (Cancellation)

```json
{
  "type": "subscription.updated",
  "object": "event",
  "data": {
    "id": "sub_abc123",
    "object": "subscription",
    "user_id": "user_xyz789",
    "plan_id": "professional",
    "status": "canceled", // Status changed to canceled
    "cancel_at_period_end": true,
    "canceled_at": 1704067200,
    "current_period_end": 1705276800,
    // ... other fields
  }
}
```

---

## 5. Database Sync Flow

### How Webhooks Keep Your Database in Sync

**The Problem:**
- User's subscription status is in Clerk
- Your app needs to know subscription status for feature gating
- Database must stay in sync with Clerk

**The Solution:**
- Webhooks update database whenever subscription changes
- Feature gates check database (not Clerk directly)
- Database is the source of truth for your app

### Database Schema

**Users Table (Supabase):**
```sql
CREATE TABLE users (
  id uuid PRIMARY KEY,
  clerk_user_id text UNIQUE NOT NULL,
  email text,
  
  -- Subscription fields
  subscription_status text, -- 'active', 'trialing', 'past_due', 'canceled', null
  subscription_plan_id text, -- 'starter', 'professional', 'strategic', null
  subscription_id text, -- Clerk subscription ID
  subscription_features text[], -- Array of feature keys
  
  -- Billing dates
  subscription_current_period_start timestamptz,
  subscription_current_period_end timestamptz,
  subscription_trial_end timestamptz,
  subscription_cancel_at_period_end boolean,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### Sync Flow Examples

#### Example 1: New Subscription

```
1. User subscribes → Clerk creates subscription
2. Clerk sends webhook: subscription.created
3. Your API route receives webhook
4. Update database:
   - subscription_status = 'trialing' (or 'active')
   - subscription_plan_id = 'professional'
   - subscription_id = 'sub_abc123'
   - subscription_features = ['unlimited_projects', 'cross_project_analysis', ...]
   - subscription_current_period_start = ...
   - subscription_current_period_end = ...
5. Database is now in sync
6. Feature gates check database → User has access
```

#### Example 2: Plan Upgrade

```
1. User upgrades Starter → Professional
2. Clerk processes upgrade
3. Clerk sends webhook: subscription.updated
4. Your API route receives webhook
5. Update database:
   - subscription_plan_id = 'professional' (changed from 'starter')
   - subscription_features = [...new features...]
6. Database is now in sync
7. Feature gates check database → User gets new features
```

#### Example 3: Payment Failure

```
1. User's payment method fails
2. Stripe retries payment
3. Payment still fails
4. Clerk sends webhook: subscription.pastDue
5. Your API route receives webhook
6. Update database:
   - subscription_status = 'past_due'
7. Database is now in sync
8. Feature gates check database → User may lose access
```

#### Example 4: Cancellation

```
1. User cancels subscription
2. Clerk processes cancellation
3. Clerk sends webhook: subscription.updated (status: 'canceled')
4. Your API route receives webhook
5. Update database:
   - subscription_status = 'canceled'
   - subscription_cancel_at_period_end = true
6. Database is now in sync
7. Feature gates check database → User loses access (immediately or at period end)
```

---

## 6. Why This Matters

### Real-Time Sync

**Without webhooks:**
- User subscribes → Database doesn't know
- User tries to use premium feature → Access denied (even though they paid)
- Manual refresh or polling needed → Poor user experience

**With webhooks:**
- User subscribes → Webhook updates database immediately
- User tries to use premium feature → Access granted instantly
- No delays, no manual steps → Great user experience

### Reliability

**Webhooks ensure:**
- Database never gets out of sync with Clerk
- All subscription changes are captured
- No missed events (Clerk retries failed webhooks)
- Automatic recovery from errors

### Automatic Updates

**No manual intervention:**
- Upgrades happen automatically
- Downgrades happen automatically
- Cancellations are handled automatically
- Payment failures are handled automatically

**You don't need to:**
- Manually check subscription status
- Poll Clerk API for updates
- Manually update database
- Handle edge cases manually

---

## 7. What You'll Implement in Lesson 4

### API Route Structure

**File:** `app/api/webhooks/clerk/route.ts`

```typescript
export async function POST(request: Request) {
  // 1. Verify webhook signature (security)
  // 2. Parse webhook payload
  // 3. Handle different event types
  // 4. Update Supabase database
  // 5. Return success response
}
```

### Event Handling

**You'll handle:**
- `subscription.created` → Create subscription record
- `subscription.updated` → Update subscription record
- `subscription.active` → Activate subscription
- `subscription.pastDue` → Mark as past due

### Database Updates

**You'll update:**
- User's subscription status
- Plan ID
- Features array
- Billing period dates
- Trial information

### Error Handling

**You'll implement:**
- Webhook signature verification
- Error logging
- Retry logic (Clerk retries failed webhooks)
- Idempotency (handle duplicate events)

---

## 8. Security Considerations

### Webhook Signature Verification

**Why it matters:**
- Prevents unauthorized webhooks
- Ensures webhooks are from Clerk
- Protects against webhook spoofing

**How it works:**
- Clerk signs each webhook with a secret
- Your app verifies the signature
- If signature doesn't match, reject the webhook

**Implementation:**
```typescript
// Clerk provides webhook signing secret
const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

// Verify signature
const signature = request.headers.get('svix-signature');
const isValid = verifySignature(payload, signature, webhookSecret);

if (!isValid) {
  return new Response('Invalid signature', { status: 401 });
}
```

### Idempotency

**Why it matters:**
- Clerk may send duplicate webhooks
- Network retries can cause duplicates
- Prevents duplicate database updates

**How to handle:**
- Use subscription ID as unique identifier
- Check if subscription already exists before creating
- Update existing record instead of creating duplicate

### Error Handling

**What to do:**
- Log all webhook events
- Log errors for debugging
- Return appropriate status codes
- Don't expose internal errors to Clerk

---

## 9. User-Level vs Organization-Level Subscriptions

### User-Level Subscriptions (What We're Using)

**How it works:**
- Each user has their own subscription
- Subscription tied to `user_id`
- Simple to implement
- Perfect for solo founders (our target)

**Webhook payload:**
```json
{
  "data": {
    "user_id": "user_xxxxx", // Individual user
    "plan_id": "professional",
    // ...
  }
}
```

### Organization-Level Subscriptions (Future)

**How it works:**
- Subscription tied to organization/team
- Multiple users share one subscription
- More complex (per-seat pricing, etc.)
- For teams/companies

**When to use:**
- If you add team collaboration features
- If you need per-seat pricing
- If you want to bill companies instead of individuals

**For now:** We're using user-level subscriptions (simpler, matches our target customer).

---

## 10. Testing Webhooks

### Test Mode

**Clerk Test Mode:**
- All subscriptions in test mode
- Use test cards (4242 4242 4242 4242)
- Webhooks sent to your test endpoint
- No real charges

### Testing Flow

1. **Set up webhook endpoint:**
   - Deploy to Vercel (or use ngrok for local testing)
   - Configure webhook URL in Clerk dashboard

2. **Create test subscription:**
   - Use test user
   - Complete checkout with test card
   - Watch for webhook event

3. **Verify webhook received:**
   - Check Vercel logs
   - Verify database updated
   - Test feature gates

### Webhook Testing Tools

**Local testing:**
- Use ngrok to expose local server
- Configure Clerk webhook to ngrok URL
- Test webhooks locally

**Production testing:**
- Use Vercel preview deployments
- Configure Clerk webhook to preview URL
- Test in production-like environment

---

## 11. Common Webhook Scenarios

### Scenario 1: User Subscribes During Trial

```
1. User starts 14-day trial
2. Clerk sends: subscription.created (status: 'trialing')
3. Your app: Creates subscription record, status = 'trialing'
4. User has access during trial
5. Trial ends, payment succeeds
6. Clerk sends: subscription.active (status: 'active')
7. Your app: Updates status to 'active'
8. User continues to have access
```

### Scenario 2: User Upgrades Plan

```
1. User on Starter ($49/month)
2. User upgrades to Professional ($99/month)
3. Clerk processes upgrade (prorated)
4. Clerk sends: subscription.updated
5. Your app: Updates plan_id and features
6. User immediately gets new features
```

### Scenario 3: User Cancels

```
1. User cancels subscription
2. Clerk sends: subscription.updated (status: 'canceled', cancel_at_period_end: true)
3. Your app: Updates status to 'canceled'
4. User keeps access until period end
5. At period end, access revoked
```

### Scenario 4: Payment Fails

```
1. User's payment method expires
2. Stripe attempts to charge
3. Payment fails
4. Clerk sends: subscription.pastDue
5. Your app: Updates status to 'past_due'
6. User may lose access (your decision)
7. User updates payment method
8. Payment succeeds
9. Clerk sends: subscription.active
10. Your app: Updates status to 'active'
11. User regains access
```

---

## 12. Summary

### Key Takeaways

1. **Webhooks are HTTP callbacks** - Clerk sends POST requests to your app
2. **Real-time sync** - Database updates immediately when subscriptions change
3. **Automatic** - No manual intervention needed
4. **Reliable** - Clerk retries failed webhooks

### Event Types

- `subscription.created` - New subscription
- `subscription.updated` - Subscription changed
- `subscription.active` - Subscription activated
- `subscription.pastDue` - Payment failed

### What You'll Build

- API route to receive webhooks
- Signature verification (security)
- Event parsing and handling
- Database updates (Supabase)
- Error handling and logging

### Why It Matters

- **User experience:** Features unlock immediately
- **Reliability:** Database stays in sync
- **Automation:** No manual steps needed
- **Security:** Signature verification prevents spoofing

---

## 13. Next Steps

**Before Lesson 4:**
- [ ] Understand webhook flow
- [ ] Review event types
- [ ] Understand payload structure
- [ ] Plan database schema

**In Lesson 4:**
- [ ] Create webhook API route
- [ ] Implement signature verification
- [ ] Handle all event types
- [ ] Update database
- [ ] Test webhook flow

---

**Resources:**
- [Clerk Billing API Docs](https://clerk.com/docs/billing)
- [Clerk Webhooks Guide](https://clerk.com/docs/webhooks)
- [Stripe Webhook Testing](https://stripe.com/docs/webhooks/test)

---

**Last Updated:** January 2025  
**Status:** Ready for Lesson 4 Implementation

