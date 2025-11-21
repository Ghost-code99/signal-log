# Clerk Webhook Flow Diagrams

**Visual representation of how Clerk Billing webhooks work**

---

## Complete Flow: User Subscribes

```
┌─────────────┐
│    User     │
│  Subscribes │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│  Clerk Checkout │
│  (Pricing Page) │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│  Stripe Payment │
│  Processing     │
└──────┬──────────┘
       │
       │ Payment Success
       ▼
┌─────────────────┐
│  Clerk Creates  │
│  Subscription   │
└──────┬──────────┘
       │
       │ Webhook Event
       │ subscription.created
       ▼
┌─────────────────────┐
│  Your API Route     │
│  /api/webhooks/clerk│
│  Receives Webhook   │
└──────┬──────────────┘
       │
       │ 1. Verify Signature
       │ 2. Parse Payload
       │ 3. Extract Data
       ▼
┌─────────────────────┐
│  Update Supabase    │
│  Database           │
│  - subscription_*   │
│  - plan_id          │
│  - features         │
└──────┬──────────────┘
       │
       │ Database Updated
       ▼
┌─────────────────────┐
│  Feature Gates      │
│  Check Database     │
│  → User Has Access  │
└─────────────────────┘
```

---

## Event Flow: subscription.created

```
User Subscribes
    │
    ▼
Clerk Processes Payment
    │
    ▼
Payment Success
    │
    ▼
Clerk Creates Subscription
    │
    ▼
Clerk Sends Webhook
POST /api/webhooks/clerk
{
  type: 'subscription.created',
  data: {
    user_id: 'user_xxx',
    plan_id: 'professional',
    status: 'trialing',
    features: [...],
    ...
  }
}
    │
    ▼
Your API Route
1. Verify signature ✓
2. Parse payload ✓
3. Extract user_id, plan_id, features
    │
    ▼
Update Supabase
INSERT/UPDATE users SET
  subscription_status = 'trialing',
  subscription_plan_id = 'professional',
  subscription_features = [...],
  ...
    │
    ▼
Database Synced ✓
    │
    ▼
Feature Gates Work
User has access to Professional features
```

---

## Event Flow: subscription.updated (Upgrade)

```
User Upgrades Plan
Starter → Professional
    │
    ▼
Clerk Processes Upgrade
    │
    ▼
Clerk Updates Subscription
    │
    ▼
Clerk Sends Webhook
POST /api/webhooks/clerk
{
  type: 'subscription.updated',
  data: {
    user_id: 'user_xxx',
    plan_id: 'professional', // Changed
    status: 'active',
    features: [...new features...], // Changed
    ...
  }
}
    │
    ▼
Your API Route
1. Verify signature ✓
2. Parse payload ✓
3. Detect plan change
    │
    ▼
Update Supabase
UPDATE users SET
  subscription_plan_id = 'professional',
  subscription_features = [...new features...],
  ...
    │
    ▼
Database Synced ✓
    │
    ▼
Feature Gates Work
User gets new features immediately
```

---

## Event Flow: subscription.pastDue

```
Payment Method Fails
    │
    ▼
Stripe Attempts Retry
    │
    ▼
Payment Still Fails
    │
    ▼
Clerk Sends Webhook
POST /api/webhooks/clerk
{
  type: 'subscription.pastDue',
  data: {
    user_id: 'user_xxx',
    plan_id: 'professional',
    status: 'past_due', // Changed
    ...
  }
}
    │
    ▼
Your API Route
1. Verify signature ✓
2. Parse payload ✓
3. Detect status change
    │
    ▼
Update Supabase
UPDATE users SET
  subscription_status = 'past_due',
  ...
    │
    ▼
Database Synced ✓
    │
    ▼
Feature Gates Work
User may lose access (your decision)
```

---

## Event Flow: subscription.updated (Cancellation)

```
User Cancels Subscription
    │
    ▼
Clerk Processes Cancellation
    │
    ▼
Clerk Updates Subscription
    │
    ▼
Clerk Sends Webhook
POST /api/webhooks/clerk
{
  type: 'subscription.updated',
  data: {
    user_id: 'user_xxx',
    plan_id: 'professional',
    status: 'canceled', // Changed
    cancel_at_period_end: true,
    ...
  }
}
    │
    ▼
Your API Route
1. Verify signature ✓
2. Parse payload ✓
3. Detect cancellation
    │
    ▼
Update Supabase
UPDATE users SET
  subscription_status = 'canceled',
  subscription_cancel_at_period_end = true,
  ...
    │
    ▼
Database Synced ✓
    │
    ▼
Feature Gates Work
User keeps access until period end
Then loses access automatically
```

---

## Database Sync States

### State 1: No Subscription

```
Database:
  subscription_status: null
  subscription_plan_id: null
  subscription_features: []

User Access:
  ❌ No premium features
  ✅ Basic features only
```

### State 2: Active Subscription

```
Database:
  subscription_status: 'active'
  subscription_plan_id: 'professional'
  subscription_features: ['unlimited_projects', 'cross_project_analysis', ...]

User Access:
  ✅ All Professional features
  ✅ Premium functionality unlocked
```

### State 3: Past Due

```
Database:
  subscription_status: 'past_due'
  subscription_plan_id: 'professional'
  subscription_features: [...]

User Access:
  ⚠️ Features may be restricted (your decision)
  ⚠️ Payment required to restore
```

### State 4: Canceled

```
Database:
  subscription_status: 'canceled'
  subscription_plan_id: 'professional'
  subscription_cancel_at_period_end: true

User Access:
  ⚠️ Access until period end
  ❌ Then loses access
```

---

## Webhook Processing Flow

```
┌─────────────────────┐
│  Clerk Sends        │
│  Webhook            │
│  POST /api/webhooks │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Verify Signature   │
│  (Security Check)   │
└──────────┬──────────┘
           │
           │ Valid?
           ├─── No ──▶ Return 401 (Unauthorized)
           │
           ▼ Yes
┌─────────────────────┐
│  Parse Payload      │
│  Extract Event Type │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Route by Event Type│
│  - created          │
│  - updated          │
│  - active           │
│  - pastDue          │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Extract Data       │
│  - user_id          │
│  - plan_id          │
│  - status           │
│  - features         │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Update Supabase    │
│  Database           │
└──────────┬──────────┘
           │
           │ Success?
           ├─── No ──▶ Log Error, Return 500 (Clerk will retry)
           │
           ▼ Yes
┌─────────────────────┐
│  Return 200 OK      │
│  (Webhook Processed)│
└─────────────────────┘
```

---

## Feature Gate Check Flow

```
User Tries to Access
Premium Feature
    │
    ▼
┌─────────────────────┐
│  Feature Gate       │
│  Checks Database    │
└──────────┬──────────┘
           │
           │ Has Feature?
           ├─── No ──▶ Show Upgrade Prompt
           │
           ▼ Yes
┌─────────────────────┐
│  Allow Access       │
│  Show Feature       │
└─────────────────────┘
```

**Example:**
```typescript
// User tries to use cross-project analysis
const hasFeature = user.subscription_features?.includes('cross_project_analysis');

if (!hasFeature) {
  // Show upgrade prompt
  return <UpgradePrompt />;
}

// User has feature, show feature
return <CrossProjectAnalysis />;
```

---

## Complete User Journey

```
1. User Visits Pricing Page
   └─▶ Sees 3 plans (Starter, Professional, Strategic)

2. User Clicks "Start Free Trial" (Professional)
   └─▶ Clerk Checkout opens

3. User Completes Checkout
   └─▶ Stripe processes payment (test mode)

4. Clerk Creates Subscription
   └─▶ Status: 'trialing' (14-day trial)

5. Clerk Sends Webhook
   └─▶ subscription.created event

6. Your API Receives Webhook
   └─▶ Verifies signature
   └─▶ Updates database

7. Database Updated
   └─▶ subscription_status = 'trialing'
   └─▶ subscription_plan_id = 'professional'
   └─▶ subscription_features = [...]

8. User Returns to App
   └─▶ Feature gates check database
   └─▶ User has access to Professional features

9. Trial Ends (14 days later)
   └─▶ Stripe charges payment method
   └─▶ Payment succeeds

10. Clerk Sends Webhook
    └─▶ subscription.active event

11. Your API Updates Database
    └─▶ subscription_status = 'active'

12. User Continues to Have Access
    └─▶ No interruption
    └─▶ Features still work
```

---

## Error Handling Flow

```
Webhook Received
    │
    ▼
Verify Signature
    │
    ├─── Invalid ──▶ Return 401
    │                 Log Security Warning
    │
    ▼ Valid
Parse Payload
    │
    ├─── Error ──▶ Return 400
    │              Log Parse Error
    │
    ▼ Success
Update Database
    │
    ├─── Error ──▶ Return 500
    │              Log Database Error
    │              Clerk will retry
    │
    ▼ Success
Return 200 OK
    │
    ▼
Webhook Processed ✓
```

---

## Summary

**Key Points:**
1. **Clerk sends webhooks** when subscriptions change
2. **Your API receives** and verifies webhooks
3. **Database updates** keep everything in sync
4. **Feature gates check** database for access
5. **Everything is automatic** - no manual steps

**Flow:**
```
User Action → Clerk → Webhook → Your API → Database → Feature Gates
```

**Result:**
- Real-time sync
- Reliable updates
- Automatic feature unlocking
- Great user experience

---

**For detailed information, see:** `CLERK_WEBHOOK_ARCHITECTURE.md`

