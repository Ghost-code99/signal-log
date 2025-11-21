# Clerk Webhook Quick Reference

**Quick reference for Clerk Billing webhook events and payloads**

---

## Webhook Event Types

| Event | When It Fires | What to Do |
|-------|---------------|------------|
| `subscription.created` | New subscription created | Create subscription record |
| `subscription.updated` | Subscription changed | Update subscription record |
| `subscription.active` | Subscription activated | Set status to 'active' |
| `subscription.pastDue` | Payment failed | Set status to 'past_due' |

**Note:** Cancellations come via `subscription.updated` when status = 'canceled'

---

## Webhook Payload Structure

```typescript
{
  type: 'subscription.created' | 'subscription.updated' | 'subscription.active' | 'subscription.pastDue',
  data: {
    id: 'sub_xxxxx', // Clerk subscription ID
    user_id: 'user_xxxxx', // User who owns subscription
    plan_id: 'professional', // Plan ID
    status: 'active' | 'trialing' | 'past_due' | 'canceled',
    features: ['unlimited_projects', 'cross_project_analysis', ...],
    plan: {
      id: 'professional',
      name: 'Professional',
      price: 9900, // In cents
      currency: 'usd',
    },
    current_period_start: 1234567890,
    current_period_end: 1234567890,
    trial_end: 1234567890 | null,
    stripe_subscription_id: 'sub_xxxxx',
  }
}
```

---

## Database Fields to Update

**When receiving webhook, update these fields:**

```typescript
{
  subscription_status: 'active' | 'trialing' | 'past_due' | 'canceled',
  subscription_plan_id: 'starter' | 'professional' | 'strategic',
  subscription_id: 'sub_xxxxx', // Clerk subscription ID
  subscription_features: ['feature1', 'feature2', ...], // Array
  subscription_current_period_start: timestamp,
  subscription_current_period_end: timestamp,
  subscription_trial_end: timestamp | null,
  subscription_cancel_at_period_end: boolean,
}
```

---

## Event Handling Logic

### subscription.created

```typescript
if (event.type === 'subscription.created') {
  // Create subscription record
  await updateUser({
    subscription_status: event.data.status,
    subscription_plan_id: event.data.plan_id,
    subscription_id: event.data.id,
    subscription_features: event.data.features,
    // ... other fields
  });
}
```

### subscription.updated

```typescript
if (event.type === 'subscription.updated') {
  // Update subscription record
  await updateUser({
    subscription_status: event.data.status,
    subscription_plan_id: event.data.plan_id,
    subscription_features: event.data.features,
    // ... other fields
  });
  
  // Handle cancellation
  if (event.data.status === 'canceled') {
    // Mark as canceled
    // Optionally revoke access
  }
}
```

### subscription.active

```typescript
if (event.type === 'subscription.active') {
  // Activate subscription
  await updateUser({
    subscription_status: 'active',
    // ... other fields
  });
}
```

### subscription.pastDue

```typescript
if (event.type === 'subscription.pastDue') {
  // Mark as past due
  await updateUser({
    subscription_status: 'past_due',
    // ... other fields
  });
  
  // Optionally restrict access
}
```

---

## Security Checklist

- [ ] Verify webhook signature
- [ ] Use CLERK_WEBHOOK_SECRET from environment
- [ ] Reject invalid signatures (401)
- [ ] Log all webhook events
- [ ] Handle errors gracefully
- [ ] Return 200 even on errors (Clerk will retry)

---

## Testing

**Test Card:**
- Number: `4242 4242 4242 4242`
- Expiry: Any future date
- CVC: Any 3 digits

**Test Flow:**
1. Create test subscription
2. Check webhook received
3. Verify database updated
4. Test feature gates

---

## Common Scenarios

**New Subscription:**
```
subscription.created → Create record → User has access
```

**Upgrade:**
```
subscription.updated → Update plan_id → User gets new features
```

**Cancellation:**
```
subscription.updated (status: 'canceled') → Mark canceled → User loses access
```

**Payment Failure:**
```
subscription.pastDue → Mark past_due → User may lose access
```

---

**For detailed guide, see:** `CLERK_WEBHOOK_ARCHITECTURE.md`

