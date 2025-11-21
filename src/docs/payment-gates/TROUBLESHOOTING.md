# Payment Integration Troubleshooting Runbook

**Complete troubleshooting guide for payment integration, webhooks, and feature gating**

**Date:** January 2025  
**Branch:** `payment-implementation`

---

## Table of Contents

1. [Webhook Issues](#webhook-issues)
2. [Subscription Sync Issues](#subscription-sync-issues)
3. [Feature Gating Issues](#feature-gating-issues)
4. [Database Issues](#database-issues)
5. [Common Error Messages](#common-error-messages)
6. [Testing Checklist](#testing-checklist)

---

## Webhook Issues

### Webhook Not Receiving Events

**Symptoms:**
- Webhook endpoint not receiving events from Clerk
- No logs in server console
- Clerk dashboard shows webhook delivery failures

**Diagnosis:**
1. Check webhook URL in Clerk dashboard
2. Verify endpoint is accessible (test with GET request)
3. Check server logs for incoming requests
4. Verify `CLERK_WEBHOOK_SECRET` is set correctly

**Solutions:**

**1. Verify Webhook URL:**
```bash
# Test health check endpoint
curl https://your-domain.com/api/webhooks/clerk

# Should return:
# {"status":"ok","message":"Clerk webhook endpoint is healthy",...}
```

**2. Check Environment Variables:**
```bash
# Local
echo $CLERK_WEBHOOK_SECRET

# Vercel
# Go to Vercel Dashboard → Settings → Environment Variables
# Verify CLERK_WEBHOOK_SECRET is set
```

**3. Verify Clerk Dashboard Configuration:**
- Go to Clerk Dashboard → Webhooks
- Check webhook URL matches your endpoint
- Verify events are enabled:
  - ✅ subscription.created
  - ✅ subscription.updated
  - ✅ subscription.active
  - ✅ subscription.pastDue

**4. Test with ngrok (Local):**
```bash
# Start ngrok
ngrok http 3000

# Copy ngrok URL
# Update Clerk webhook URL to: https://your-ngrok-url.ngrok.io/api/webhooks/clerk

# Send test webhook from Clerk dashboard
```

---

### Invalid Webhook Signature

**Symptoms:**
- Webhook returns 401 Unauthorized
- Logs show "Invalid webhook signature"
- Events not processed

**Diagnosis:**
1. Check `CLERK_WEBHOOK_SECRET` matches Clerk dashboard
2. Verify secret has no extra spaces or characters
3. Check if secret was rotated (need to update)

**Solutions:**

**1. Verify Secret:**
```bash
# Get secret from Clerk dashboard
# Go to Clerk Dashboard → Webhooks → Your Endpoint → Signing Secret

# Update .env.local
CLERK_WEBHOOK_SECRET=whsec_xxxxx

# Restart server
npm run dev
```

**2. Check Secret Format:**
- Secret should start with `whsec_`
- No extra spaces before/after
- Copy directly from Clerk dashboard (don't type manually)

**3. Update Vercel Environment Variable:**
- Go to Vercel Dashboard → Settings → Environment Variables
- Update `CLERK_WEBHOOK_SECRET`
- Redeploy application

---

### Webhook Payload Parsing Errors

**Symptoms:**
- Webhook returns 400 Bad Request
- Logs show "Failed to parse webhook payload"
- JSON parsing errors

**Diagnosis:**
1. Check webhook payload structure
2. Verify event type matches expected format
3. Check for missing required fields

**Solutions:**

**1. Log Raw Payload:**
```typescript
// In route.ts, add logging:
const body = await request.text();
console.log('Raw webhook body:', body);
```

**2. Verify Event Structure:**
- Check Clerk webhook documentation
- Verify event has `type` and `data` fields
- Ensure `data.user_id` and `data.id` exist

**3. Handle Missing Fields:**
```typescript
// Add null checks in webhook handler
const subscriptionId = event.data?.id;
if (!subscriptionId) {
  console.error('Missing subscription ID in webhook');
  return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
}
```

---

## Subscription Sync Issues

### Subscription Not Syncing to Database

**Symptoms:**
- Webhook received but subscription not in database
- User subscription status not updated
- Features not unlocking

**Diagnosis:**
1. Check webhook logs for errors
2. Verify database connection
3. Check user exists in users table
4. Verify `clerk_user_id` column exists

**Solutions:**

**1. Check Webhook Logs:**
```bash
# Look for errors in server logs
# Check for:
# - "User not found"
# - "Database update failed"
# - "Failed to upsert subscription"
```

**2. Verify User Exists:**
```sql
-- Check if user exists in users table
SELECT id, email, clerk_user_id 
FROM users 
WHERE clerk_user_id = 'user_xxxxx';
```

**3. Check Subscriptions Table:**
```sql
-- Check if subscription exists
SELECT * 
FROM subscriptions 
WHERE clerk_subscription_id = 'sub_xxxxx';
```

**4. Verify Database Schema:**
```sql
-- Check if clerk_user_id column exists
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name = 'clerk_user_id';

-- Check if subscriptions table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'subscriptions';
```

**5. Apply Migrations:**
```bash
# If migrations not applied, run them:
# Option 1: Via Supabase CLI
supabase migration up --include-all

# Option 2: Via Supabase Dashboard SQL Editor
# Run migration files in order
```

---

### User Not Found Error

**Symptoms:**
- Webhook returns 404
- Logs show "User not found: user_xxxxx"
- Subscription not created

**Diagnosis:**
1. User doesn't exist in users table
2. `clerk_user_id` not set for user
3. User created in Clerk but not in database

**Solutions:**

**1. Check User in Database:**
```sql
-- Find user by email
SELECT id, email, clerk_user_id 
FROM users 
WHERE email = 'user@example.com';

-- If clerk_user_id is NULL, update it:
UPDATE users 
SET clerk_user_id = 'user_xxxxx' 
WHERE email = 'user@example.com';
```

**2. Create User if Missing:**
- User should be created during sign-up/onboarding
- Check onboarding flow creates user in database
- Ensure `clerk_user_id` is set during user creation

**3. Manual User Creation (Temporary Fix):**
```sql
-- Create user manually (if needed)
INSERT INTO users (email, clerk_user_id, created_at, updated_at)
VALUES ('user@example.com', 'user_xxxxx', NOW(), NOW());
```

---

### Duplicate Subscription Records

**Symptoms:**
- Multiple subscription records for same user
- Webhook processed multiple times
- Database constraint violations

**Diagnosis:**
1. Webhook retries creating duplicates
2. Upsert not working correctly
3. Missing unique constraint on `clerk_subscription_id`

**Solutions:**

**1. Verify Unique Constraint:**
```sql
-- Check if unique constraint exists
SELECT constraint_name 
FROM information_schema.table_constraints 
WHERE table_name = 'subscriptions' 
AND constraint_type = 'UNIQUE';

-- Should have unique constraint on clerk_subscription_id
```

**2. Check Upsert Logic:**
```typescript
// Verify upsert uses onConflict correctly
await supabase
  .from('subscriptions')
  .upsert(subscriptionRecord, {
    onConflict: 'clerk_subscription_id',
    ignoreDuplicates: false,
  });
```

**3. Clean Up Duplicates:**
```sql
-- Find duplicates
SELECT clerk_subscription_id, COUNT(*) 
FROM subscriptions 
GROUP BY clerk_subscription_id 
HAVING COUNT(*) > 1;

-- Keep most recent, delete others
DELETE FROM subscriptions 
WHERE id NOT IN (
  SELECT DISTINCT ON (clerk_subscription_id) id 
  FROM subscriptions 
  ORDER BY clerk_subscription_id, updated_at DESC
);
```

---

## Feature Gating Issues

### Features Not Unlocking After Subscription

**Symptoms:**
- User subscribed but features still locked
- Upgrade prompt still showing
- `has()` helper returns false

**Diagnosis:**
1. Subscription synced but Clerk not updated
2. Feature gates checking wrong plan/feature
3. Cache issues with Clerk data

**Solutions:**

**1. Verify Subscription in Clerk:**
- Go to Clerk Dashboard → Users → Select User
- Check "Billing" tab
- Verify subscription is active

**2. Check Database:**
```sql
-- Verify subscription in database
SELECT * 
FROM subscriptions 
WHERE clerk_user_id = 'user_xxxxx' 
AND status = 'active';
```

**3. Test has() Helper:**
```typescript
// In Server Action or API route
const { userId } = await auth();
const client = await clerkClient();
const hasPlan = await client.users.has({ userId, plan: 'professional' });
console.log('Has plan:', hasPlan);
```

**4. Clear Cache:**
- Clerk caches subscription data
- Wait a few seconds after webhook processes
- Refresh page/restart session

**5. Verify Feature Keys:**
- Check Clerk dashboard for feature keys
- Ensure feature keys match what you're checking
- Verify features are assigned to plan in Clerk

---

### Upgrade Prompt Showing for Subscribed Users

**Symptoms:**
- User has active subscription
- Upgrade prompt still displays
- Features locked despite subscription

**Diagnosis:**
1. `has()` helper not working correctly
2. Wrong plan/feature key checked
3. User session not refreshed

**Solutions:**

**1. Check User Session:**
```typescript
// In component
const { user, isLoaded } = useUser();
console.log('User:', user?.id);
console.log('Has plan:', user?.has({ plan: 'professional' }));
```

**2. Verify Plan Name:**
- Check plan names match exactly
- Case-sensitive: 'professional' not 'Professional'
- Check Clerk dashboard for exact plan IDs

**3. Refresh User Data:**
```typescript
// Force refresh user data
const { user, reload } = useUser();
await reload();
```

**4. Check Component Logic:**
```typescript
// Verify ProtectedFeature component
<ProtectedFeature plan="professional" featureName="Premium Features">
  {/* Content */}
</ProtectedFeature>
```

---

### API Routes Returning 403

**Symptoms:**
- API routes return 403 Forbidden
- Error message about subscription required
- Features work in UI but not in API

**Diagnosis:**
1. API route gating logic incorrect
2. `checkPlanAccess()` failing
3. User not authenticated in API route

**Solutions:**

**1. Check Authentication:**
```typescript
// Verify user is authenticated
const { userId } = await auth();
if (!userId) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

**2. Test Plan Check:**
```typescript
// Add logging
const accessCheck = await checkPlanAccess('professional');
console.log('Access check:', accessCheck);
if (!accessCheck.hasAccess) {
  return NextResponse.json({ error: accessCheck.error }, { status: 403 });
}
```

**3. Verify API Route Gating:**
```typescript
// Check if using correct plan name
// Check if using correct helper function
import { checkPlanAccess } from '@/lib/subscription-check';
```

---

## Database Issues

### Migration Not Applied

**Symptoms:**
- Tables/columns don't exist
- Database errors about missing columns
- Schema out of sync

**Solutions:**

**1. Check Migration Status:**
```bash
# If using Supabase CLI
supabase migration list

# Check which migrations are applied
```

**2. Apply Migrations:**
```bash
# Apply all pending migrations
supabase migration up --include-all

# Or apply manually via Supabase Dashboard SQL Editor
```

**3. Verify Schema:**
```sql
-- Check if subscriptions table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'subscriptions';

-- Check if clerk_user_id column exists
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name = 'clerk_user_id';
```

---

### Foreign Key Constraint Errors

**Symptoms:**
- Database errors about foreign key violations
- Cannot insert subscription
- User_id not found

**Solutions:**

**1. Verify User Exists:**
```sql
-- Check if user exists
SELECT id, email, clerk_user_id 
FROM users 
WHERE id = 'user-uuid-here';
```

**2. Check Foreign Key:**
```sql
-- Verify foreign key constraint
SELECT constraint_name, table_name 
FROM information_schema.table_constraints 
WHERE constraint_type = 'FOREIGN KEY' 
AND table_name = 'subscriptions';
```

**3. Fix Orphaned Records:**
```sql
-- Find subscriptions with invalid user_id
SELECT s.* 
FROM subscriptions s 
LEFT JOIN users u ON s.user_id = u.id 
WHERE u.id IS NULL;

-- Delete orphaned records or fix user_id
```

---

## Common Error Messages

### "CLERK_WEBHOOK_SECRET environment variable is not set"

**Solution:**
- Add `CLERK_WEBHOOK_SECRET` to `.env.local`
- Add to Vercel environment variables
- Restart server / redeploy

### "User not found: user_xxxxx"

**Solution:**
- Verify user exists in users table
- Check `clerk_user_id` is set
- Create user if missing

### "Database update failed"

**Solution:**
- Check database connection
- Verify table/column exists
- Check for constraint violations
- Review database logs

### "Invalid webhook signature"

**Solution:**
- Verify `CLERK_WEBHOOK_SECRET` matches Clerk dashboard
- Check for extra spaces/characters
- Update secret if rotated

---

## Testing Checklist

### Webhook Testing

- [ ] Webhook endpoint accessible (GET returns 200)
- [ ] Health check works
- [ ] Test webhook from Clerk dashboard succeeds
- [ ] Signature verification works
- [ ] Invalid signatures rejected (401)
- [ ] Events logged correctly

### Subscription Sync Testing

- [ ] `subscription.created` event syncs to database
- [ ] `subscription.updated` event updates database
- [ ] `subscription.active` event processed
- [ ] `subscription.pastDue` event handled
- [ ] Cancellation syncs correctly
- [ ] Plan upgrade/downgrade syncs correctly

### Feature Gating Testing

- [ ] Free user sees upgrade prompt
- [ ] Starter user has Starter features
- [ ] Professional user has Professional features
- [ ] Strategic user has all features
- [ ] API routes return 403 for non-subscribers
- [ ] Features unlock after subscription
- [ ] Features lock after cancellation

### Database Testing

- [ ] Migrations applied successfully
- [ ] Tables exist with correct schema
- [ ] Indexes created
- [ ] Foreign keys work correctly
- [ ] Upsert handles duplicates
- [ ] Timestamps update automatically

---

## Getting Help

If issues persist:

1. **Check Logs:**
   - Server logs for webhook processing
   - Database logs for errors
   - Clerk dashboard webhook delivery logs

2. **Verify Configuration:**
   - Environment variables
   - Clerk dashboard settings
   - Database schema

3. **Test Incrementally:**
   - Test webhook endpoint first
   - Then test database sync
   - Finally test feature gates

4. **Documentation:**
   - Clerk Billing docs: https://clerk.com/docs/billing
   - Supabase docs: https://supabase.com/docs

---

**Last Updated:** January 2025

