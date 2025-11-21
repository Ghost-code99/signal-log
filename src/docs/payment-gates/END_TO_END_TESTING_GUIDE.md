# End-to-End Testing Guide - Payment Implementation

**Complete testing guide for payment integration on payment-implementation branch**

**Date:** January 2025  
**Branch:** `payment-implementation`  
**Environment:** Clerk Development + Stripe Test + Vercel Preview

---

## Pre-Testing Checklist

Before starting testing, verify:

- [ ] On `payment-implementation` branch
- [ ] All code committed and pushed to GitHub
- [ ] Vercel preview deployment is active
- [ ] Environment variables set in Vercel:
  - [ ] `CLERK_WEBHOOK_SECRET`
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Clerk development environment configured
- [ ] Stripe test account connected to Clerk
- [ ] Supabase database accessible

---

## Step 1: Configure Webhook in Clerk Dashboard

### 1.1 Get Vercel Preview URL

1. Go to Vercel Dashboard → Your Project → Deployments
2. Find the preview deployment for `payment-implementation` branch
3. Copy the preview URL (e.g., `https://your-app-abc123.vercel.app`)
4. Your webhook URL will be: `https://your-app-abc123.vercel.app/api/webhooks/clerk`

### 1.2 Configure Clerk Webhook

1. Go to Clerk Dashboard → Webhooks
2. Click "Add Endpoint" (or edit existing)
3. Enter webhook URL: `https://your-preview-url.vercel.app/api/webhooks/clerk`
4. **Enable these events:**
   - ✅ `subscription.created`
   - ✅ `subscription.updated`
   - ✅ `subscription.active`
   - ✅ `subscription.pastDue`
5. Click "Create" or "Save"
6. **Copy the webhook signing secret** (starts with `whsec_`)
7. **Add to Vercel environment variables:**
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Add `CLERK_WEBHOOK_SECRET` with the secret value
   - Select: Production, Preview, Development
   - **Redeploy** the preview deployment

### 1.3 Test Webhook Endpoint

```bash
# Test health check
curl https://your-preview-url.vercel.app/api/webhooks/clerk

# Should return:
# {"status":"ok","message":"Clerk webhook endpoint is healthy",...}
```

---

## Step 2: Test Subscription Lifecycle

### 2.1 Create Test Subscription

1. **Sign in to your app** (using Clerk development environment)
2. Go to `/pricing` page
3. Click "Subscribe" on any plan (e.g., Starter)
4. **Use Stripe test card:**
   - Card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., `12/25`)
   - CVC: Any 3 digits (e.g., `123`)
   - ZIP: Any 5 digits (e.g., `12345`)
5. Complete checkout
6. **Wait for webhook** (usually processes within seconds)

### 2.2 Verify Webhook Received

**Check Vercel Logs:**
1. Go to Vercel Dashboard → Your Project → Deployments
2. Click on preview deployment
3. Go to "Functions" tab
4. Look for `/api/webhooks/clerk` function logs
5. Should see:
   ```
   Webhook received: {
     type: 'subscription.created',
     userId: 'user_xxxxx',
     subscriptionId: 'sub_xxxxx',
     ...
   }
   Subscription synced successfully: {...}
   ```

**Check Clerk Dashboard:**
1. Go to Clerk Dashboard → Webhooks
2. Click on your webhook endpoint
3. Check "Recent deliveries" tab
4. Should see successful delivery (200 status)

### 2.3 Verify Database Sync

**Check Supabase Dashboard:**
1. Go to Supabase Dashboard → Your Project → Table Editor
2. Open `subscriptions` table
3. Should see new subscription record with:
   - `clerk_subscription_id` = subscription ID from webhook
   - `clerk_user_id` = your Clerk user ID
   - `plan_name` = plan you subscribed to
   - `status` = 'active'
   - `current_period_start` and `current_period_end` set

**Verify User Mapping:**
1. Check `users` table
2. Find your user by email
3. Verify `clerk_user_id` is set (if not, update manually for testing)

### 2.4 Verify Feature Gates Unlock

1. **Refresh your app** (or sign out and back in)
2. Navigate to a premium feature protected by `ProtectedFeature`
3. **Should see content** (not upgrade prompt)
4. **Test API route:**
   ```bash
   curl https://your-preview-url.vercel.app/api/premium \
     -H "Authorization: Bearer YOUR_CLERK_SESSION_TOKEN"
   
   # Should return 200 with premium data (not 403)
   ```

---

## Step 3: Test Subscription Upgrade

### 3.1 Upgrade Subscription

1. Go to Clerk Dashboard → Users → Select Your User
2. Go to "Billing" tab
3. Click "Change Plan" or "Upgrade"
4. Select a higher tier (e.g., Professional)
5. Complete upgrade flow

### 3.2 Verify Upgrade Sync

**Check Webhook:**
- Should receive `subscription.updated` event
- Logs should show plan change

**Check Database:**
- `subscriptions` table should show updated `plan_name`
- `status` should remain 'active'
- `updated_at` should be recent

**Verify Features:**
- Higher-tier features should unlock
- Test accessing Professional-only features

---

## Step 4: Test Subscription Cancellation

### 4.1 Cancel Subscription

1. Go to Clerk Dashboard → Users → Select Your User
2. Go to "Billing" tab
3. Click "Cancel Subscription"
4. Confirm cancellation

### 4.2 Verify Cancellation Sync

**Check Webhook:**
- Should receive `subscription.updated` event
- Status should be 'canceled'
- `canceled_at` should be set

**Check Database:**
- `subscriptions.status` should be 'canceled'
- `canceled_at` should be set
- `cancel_at_period_end` may be true (if canceling at period end)

**Verify Features:**
- Features should remain active until period end
- After period end, features should lock
- Upgrade prompts should appear

---

## Step 5: Test Error Scenarios

### 5.1 Test Invalid Webhook Signature

```bash
# Send webhook with invalid signature
curl -X POST https://your-preview-url.vercel.app/api/webhooks/clerk \
  -H "Content-Type: application/json" \
  -H "svix-signature: invalid" \
  -d '{"type":"subscription.created","data":{}}'

# Should return 401 Unauthorized
# {"error":"Invalid webhook signature",...}
```

**Verify:**
- Request rejected with 401
- No database updates
- Error logged in Vercel logs

### 5.2 Test Missing User

**Scenario:** Webhook arrives for user not in database

1. **Create test webhook payload** (or use Clerk test event)
2. Use a Clerk user ID that doesn't exist in your `users` table
3. Send webhook (or trigger from Clerk dashboard)

**Expected:**
- Webhook returns 404
- Error message: "User not found: user_xxxxx"
- No subscription created
- Error logged

**Fix:**
- Create user in database with matching `clerk_user_id`
- Or ensure user creation during sign-up sets `clerk_user_id`

### 5.3 Test Feature Gate Bypass Attempts

**Test Client-Side Bypass:**
1. Try to access premium API route without subscription
2. Should return 403 Forbidden
3. Server-side check should prevent access

**Test Direct API Calls:**
```bash
# Without subscription
curl https://your-preview-url.vercel.app/api/premium

# Should return 403
# {"error":"Subscription required",...}
```

**Verify:**
- Client-side checks are for UX only
- Server-side checks enforce access
- API routes properly gated

---

## Step 6: Verify Database Sync

### 6.1 Check All Webhook Events

**Test Each Event Type:**

1. **subscription.created:**
   - Create new subscription
   - Verify record created in `subscriptions` table
   - Check all fields populated correctly

2. **subscription.updated:**
   - Change plan or status
   - Verify record updated (not duplicated)
   - Check `updated_at` timestamp changed

3. **subscription.active:**
   - Trigger active event (if separate from created)
   - Verify status updated to 'active'

4. **subscription.pastDue:**
   - Simulate payment failure (in Stripe test mode)
   - Verify status updated to 'past_due'

### 6.2 Test Edge Cases

**Duplicate Events:**
1. Send same webhook event twice
2. Verify only one subscription record exists
3. Check `clerk_subscription_id` unique constraint works

**Missing Required Fields:**
1. Test webhook with missing `user_id`
2. Should return 400 Bad Request
3. No database update

**Failed Database Updates:**
1. Temporarily break database connection
2. Send webhook
3. Should return 500 error
4. Clerk should retry webhook

---

## Step 7: Test Feature Gates

### 7.1 Test Free User

1. **Sign in as user with no subscription**
2. Navigate to premium feature
3. **Should see:**
   - Upgrade prompt component
   - Link to pricing page
   - Feature content hidden

4. **Test API:**
   - Should return 403
   - Error message with upgrade URL

### 7.2 Test Starter User

1. **Sign in as user with Starter plan**
2. Test Starter features (should work)
3. Test Professional features (should be blocked)
4. Test Strategic features (should be blocked)

### 7.3 Test Professional User

1. **Sign in as user with Professional plan**
2. Test Professional features (should work)
3. Test Strategic features (should be blocked)

### 7.4 Test Strategic User

1. **Sign in as user with Strategic plan**
2. Test all features (should work)
3. No upgrade prompts should appear

### 7.5 Test Real-Time Updates

1. **Subscribe user to plan**
2. Wait for webhook to process (5-10 seconds)
3. **Refresh page** (or reload user session)
4. Features should unlock immediately
5. No manual cache clearing needed

---

## Step 8: Documentation Updates

### 8.1 Update PRD

Update `src/docs/payment-gates/payment-gates-prd.md`:

1. **Add Implementation Notes:**
   - Document any deviations from original plan
   - Note any additional features added
   - Document testing results

2. **Update Status:**
   - Change status to "Tested and Ready for Production"
   - Add testing completion date

3. **Add Webhook Configuration:**
   - Document webhook URL format
   - Document required events
   - Document environment variables

### 8.2 Create Testing Summary

Document:
- Test results for each scenario
- Any issues found and resolved
- Performance observations
- Recommendations for production

---

## Testing Checklist

### Webhook Testing
- [ ] Webhook endpoint accessible
- [ ] Health check returns 200
- [ ] Signature verification works
- [ ] Invalid signatures rejected (401)
- [ ] All event types received
- [ ] Events logged correctly

### Subscription Lifecycle
- [ ] subscription.created syncs to database
- [ ] subscription.updated syncs to database
- [ ] subscription.active handled
- [ ] subscription.pastDue handled
- [ ] Cancellation syncs correctly
- [ ] Upgrade syncs correctly

### Database Sync
- [ ] Subscriptions table has correct data
- [ ] User mapping works correctly
- [ ] Duplicate events handled (idempotency)
- [ ] Missing users handled gracefully
- [ ] Failed updates logged

### Feature Gating
- [ ] Free user sees upgrade prompts
- [ ] Starter user has Starter features
- [ ] Professional user has Professional features
- [ ] Strategic user has all features
- [ ] API routes return 403 for non-subscribers
- [ ] Features unlock after subscription
- [ ] Features lock after cancellation

### Error Handling
- [ ] Invalid signatures rejected
- [ ] Missing users return 404
- [ ] Database errors return 500
- [ ] All errors logged
- [ ] Error messages are clear

---

## Common Issues and Solutions

### Issue: Webhook Not Receiving Events

**Check:**
- Webhook URL correct in Clerk dashboard
- Vercel preview deployment is active
- Environment variable `CLERK_WEBHOOK_SECRET` set
- Events enabled in Clerk dashboard

**Solution:**
- Verify webhook URL
- Test health check endpoint
- Check Vercel logs for errors
- Resend test webhook from Clerk

### Issue: Subscription Not Syncing

**Check:**
- Webhook received (check logs)
- User exists in database
- `clerk_user_id` set correctly
- Database connection working

**Solution:**
- Check Vercel function logs
- Verify user in Supabase
- Check database schema
- Test database connection

### Issue: Features Not Unlocking

**Check:**
- Subscription active in Clerk
- Subscription in database
- User session refreshed
- Plan name matches exactly

**Solution:**
- Verify subscription status
- Refresh user session
- Check plan name spelling
- Wait a few seconds after webhook

---

## Next Steps After Testing

Once all tests pass:

1. **Document Results:**
   - Update PRD with testing notes
   - Document any issues found
   - Note performance observations

2. **Prepare for Production:**
   - All code on `payment-implementation` branch
   - All tests passing
   - Documentation complete

3. **Ready for Lesson 5.4:**
   - Production setup with Clerk production environment
   - Live Stripe account
   - Production database
   - Merge to main branch

---

**Last Updated:** January 2025

