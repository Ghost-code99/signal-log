**Status:** Ready for Implementation

# Payment Integration & Feature Gating PRD

**Created:** January 2025  
**Feature:** Webhook handling, database syncing, and feature gating for subscription management

---

## Objective

Implement webhook handling, database syncing, and feature gating for subscription management. This brings together the pricing strategy (Lesson 1), Clerk Billing setup (Lesson 2), and pricing page (Lesson 3) into a working payment system that automatically manages user access to premium features.

---

## Scope

### In-Scope

- Next.js API route for Clerk Billing webhooks (`app/api/webhooks/clerk/route.ts`)
- Webhook signature verification using Svix library
- Syncing subscription status to Supabase `users` table
- Feature gating with Clerk's `has()` helper in Server Actions and components
- Protecting API routes based on subscription status
- Error handling and comprehensive logging for webhook events
- Handling all subscription lifecycle events (create, update, cancel, payment failure)
- Idempotency handling for duplicate webhook events

### Out-of-Scope

- Email notifications (handled by Clerk or separate system)
- Custom checkout UI (using Clerk's hosted checkout from pricing page)
- Usage tracking or analytics (separate feature)
- Payment method management (handled in Clerk customer portal)
- Organization-based subscriptions (using user-level subscriptions only)
- Stripe webhook handling (Clerk manages Stripe subscriptions, includes all Stripe data in webhooks)

---

## User Stories

1. **As a paying user**, I want my subscription status to sync to the database automatically, so that my premium features unlock immediately after payment.

2. **As a free user**, I want to see upgrade prompts when I try to access premium features, so that I understand what I'm missing and can easily upgrade.

3. **As the system**, I want to verify webhook signatures, so that only legitimate Clerk events update subscription status and prevent unauthorized access.

4. **As a paying user**, I want my subscription changes (upgrade/downgrade/cancel) to reflect immediately, so that my access stays accurate and I don't lose features I've paid for.

5. **As a developer**, I want webhook errors logged with context, so that I can debug subscription sync issues and ensure reliable operation.

---

## Acceptance Criteria

- Given a user subscribes via Clerk, when the webhook fires, then their subscription status is saved to Supabase

- Given a webhook has an invalid signature, when it arrives, then the request is rejected with 401

- Given a free user tries to access a premium feature, when they navigate, then they see an upgrade prompt

- Given a user's subscription is updated in Clerk, when the webhook fires, then Supabase is updated within seconds

- Given a webhook fails to process, when an error occurs, then it's logged with context

---

## User Flow

**Step-by-step flow from user perspective:**

1. **User visits pricing page**
   - User navigates to `/pricing`
   - Sees three plans: Starter ($49), Professional ($99), Strategic ($149)
   - Professional plan highlighted as "Most Popular"

2. **User clicks "Start Free Trial" or "Subscribe"**
   - Clerk checkout opens (hosted by Clerk)
   - User enters payment information (or starts trial)
   - User completes checkout

3. **Subscription created in Clerk**
   - Clerk processes payment via Stripe
   - Subscription record created in Clerk
   - Webhook event triggered: `subscription.created`

4. **Webhook updates database**
   - Webhook endpoint receives event
   - Signature verified
   - Subscription data saved to Supabase `users` table
   - User's subscription status now in database

5. **Premium features unlock**
   - User navigates to premium feature
   - Feature gate checks subscription using Clerk's `has()` helper
   - Feature accessible immediately

6. **User upgrades plan**
   - User on Starter wants Professional features
   - User visits pricing page and upgrades
   - Clerk processes upgrade (prorated billing)
   - Webhook event: `subscription.updated`
   - Database updated with new plan and features
   - New features unlock immediately

7. **User cancels subscription**
   - User cancels in Clerk dashboard
   - Webhook event: `subscription.updated` (status: 'canceled')
   - Database updated: `cancel_at_period_end = true`
   - User keeps access until period end
   - At period end, access revoked automatically

---

## Technical Flow

**System-level flow:**

1. **User completes checkout**
   - User clicks "Subscribe" on pricing page
   - Clerk checkout handles payment via Stripe
   - Subscription created in Clerk

2. **Clerk sends webhook**
   - Clerk sends HTTP POST to `/api/webhooks/clerk`
   - Event type: `subscription.created`, `subscription.updated`, `subscription.active`, or `subscription.pastDue`
   - Includes full subscription data (plan, features, status, dates, Stripe IDs)

3. **Webhook endpoint receives event**
   - Next.js API route at `app/api/webhooks/clerk/route.ts` receives POST request
   - Verifies webhook signature using Svix library and `CLERK_WEBHOOK_SECRET`
   - Rejects invalid signatures with 401 Unauthorized

4. **Parse and validate payload**
   - Parse JSON payload
   - Validate required fields (user_id, subscription_id, plan_id, status)
   - Extract subscription data

5. **Update Supabase database**
   - Find user by `clerk_user_id` in `users` table
   - Upsert subscription data:
     - `subscription_status` (active, trialing, past_due, canceled, etc.)
     - `subscription_plan_id` (starter, professional, strategic)
     - `subscription_id` (Clerk subscription ID)
     - `subscription_features` (array of feature keys)
     - Billing period dates (current_period_start, current_period_end)
     - Trial information (trial_end)
     - Cancellation flag (cancel_at_period_end)

6. **Feature gates check subscription**
   - User navigates to premium feature
   - Server Action or component uses Clerk's `has()` helper
   - Checks if user has required feature (e.g., `unlimited_projects`, `cross_project_analysis`)
   - Grants or denies access based on subscription

7. **Error handling and logging**
   - All webhook events logged with context
   - Errors logged with full details
   - Failed webhooks return appropriate status codes
   - Clerk automatically retries failed webhooks

---

## Webhook Payload Structure

**Clerk Billing webhook payload structure:**

```json
{
  "type": "subscription.created" | "subscription.updated" | "subscription.active" | "subscription.pastDue",
  "data": {
    "id": "sub_xxxxx",
    "user_id": "user_xxxxx",
    "plan_id": "professional",
    "status": "active" | "trialing" | "past_due" | "canceled" | "incomplete",
    "current_period_start": 1234567890,
    "current_period_end": 1234567890,
    "cancel_at_period_end": false,
    "trial_start": 1234567890 | null,
    "trial_end": 1234567890 | null,
    "stripe_subscription_id": "sub_xxxxx",
    "stripe_customer_id": "cus_xxxxx",
    "features": [
      "unlimited_projects",
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

**Field Descriptions:**
- `type` (string, required): Event type (`subscription.created`, `subscription.updated`, `subscription.active`, `subscription.pastDue`)
- `data.id` (string, required): Clerk subscription ID
- `data.user_id` (string, required): Clerk user ID who owns the subscription
- `data.plan_id` (string, required): Plan ID (`starter`, `professional`, `strategic`)
- `data.status` (string, required): Subscription status (`active`, `trialing`, `past_due`, `canceled`, `incomplete`)
- `data.current_period_start` (number, optional): Unix timestamp of billing period start
- `data.current_period_end` (number, optional): Unix timestamp of billing period end
- `data.cancel_at_period_end` (boolean, optional): Will cancel at period end?
- `data.trial_start` (number | null, optional): Unix timestamp of trial start
- `data.trial_end` (number | null, optional): Unix timestamp of trial end
- `data.stripe_subscription_id` (string, optional): Stripe subscription ID
- `data.stripe_customer_id` (string, optional): Stripe customer ID
- `data.features` (array, optional): Array of feature keys user has access to
- `data.plan` (object, optional): Plan details (id, name, price in cents, currency, interval)

**Note:** Cancellations come via `subscription.updated` when status changes to `'canceled'`, not a separate event type.

---

## Database Schema

**Subscription fields added to `users` table:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `clerk_user_id` | `text` | NULLABLE, INDEXED | Clerk user ID to link users to Clerk accounts |
| `subscription_status` | `text` | NULLABLE, INDEXED | Status: `active`, `trialing`, `past_due`, `canceled`, `incomplete`, or NULL |
| `subscription_plan_id` | `text` | NULLABLE, INDEXED | Plan ID: `starter`, `professional`, `strategic`, or NULL |
| `subscription_id` | `text` | NULLABLE, INDEXED | Clerk subscription ID (e.g., `sub_xxxxx`) |
| `subscription_features` | `text[]` | NULLABLE | Array of feature keys user has access to |
| `subscription_current_period_start` | `timestamptz` | NULLABLE | Start of current billing period |
| `subscription_current_period_end` | `timestamptz` | NULLABLE | End of current billing period |
| `subscription_trial_end` | `timestamptz` | NULLABLE | End of trial period (if applicable) |
| `subscription_cancel_at_period_end` | `boolean` | DEFAULT `false` | Will cancel at period end? |
| `subscription_updated_at` | `timestamptz` | DEFAULT `now()` | Last time subscription was updated |

**Indexes:**
- Index on `clerk_user_id` for user lookups
- Index on `subscription_status` for status queries
- Index on `subscription_plan_id` for plan queries
- Index on `subscription_id` for subscription lookups

**Triggers:**
- Auto-update `subscription_updated_at` when subscription fields change

**Migration File:**
- `supabase/schemas/10-subscription-fields.sql`

---

## Expected API Responses

### Webhook Endpoint (Clerk → App)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Subscription updated successfully",
  "event": "subscription.created"
}
```

**Invalid Signature (401 Unauthorized):**
```json
{
  "error": "Invalid webhook signature",
  "details": "Missing svix headers"
}
```

**Invalid Payload (400 Bad Request):**
```json
{
  "error": "Invalid webhook payload",
  "details": "Failed to parse JSON"
}
```

**User Not Found (404 Not Found):**
```json
{
  "error": "Failed to update subscription",
  "details": "User not found: user_xxxxx"
}
```

**Database Error (500 Internal Server Error):**
```json
{
  "error": "Failed to update subscription",
  "details": "Database update failed: ..."
}
```

**Health Check (GET /api/webhooks/clerk):**
```json
{
  "status": "ok",
  "message": "Clerk webhook endpoint is healthy",
  "timestamp": "2025-01-15T10:30:00Z"
}
```

---

## Implementation Stages

### Stage 1 — Webhook Infrastructure

**Objective:** Create the webhook endpoint infrastructure with signature verification and basic event handling.

**Tasks:**

- [ ] **Create Next.js API route at app/api/webhooks/clerk/route.ts**
  - Set up basic route handler structure (POST method)
  - Add GET handler for health checks

- [ ] **Implement Clerk webhook signature verification**
  - Install Svix library: `npm install svix`
  - Note: You're handling Clerk Billing webhooks only - Clerk manages Stripe subscriptions, so no Stripe webhook endpoint needed
  - Import `Webhook` from `svix`
  - Get `CLERK_WEBHOOK_SECRET` from environment variables
  - Extract Svix headers and verify signature
  - Return 401 if signature invalid

- [ ] **Configure webhook endpoint in Clerk dashboard**
  - Add webhook URL to Clerk dashboard
  - Enable subscription events (subscription.created, subscription.updated, subscription.active, subscription.pastDue)
  - Copy webhook signing secret

- [ ] **Add environment variable for Clerk webhook secret**
  - Add `CLERK_WEBHOOK_SECRET` to `.env.local`
  - Add to Vercel environment variables

- [ ] **Set up basic error handling and logging**
  - Log webhook events received
  - Log signature verification results
  - Handle parsing errors
  - Return appropriate HTTP status codes

- [ ] **Test webhook endpoint receives events**
  - Use ngrok for local testing (or use deployed URL)
  - Configure Clerk webhook to ngrok/deployed URL
  - Send test webhook from Clerk dashboard
  - Verify endpoint receives events
  - Check logs for received events

**Validation:**
- Webhook endpoint accessible and returns 200 for health check
- Signature verification rejects invalid signatures with 401
- Valid signatures pass verification
- Events logged correctly

---

### Stage 2 — Database Sync and Event Handling

**Objective:** Create database schema and implement subscription data synchronization from webhook events.

**Tasks:**

- [ ] **Add subscription fields to users table via SQL migration**
  - Create migration file using Supabase CLI, following migration rules
  - Add subscription fields to existing `users` table (not a separate table)
  - Note: We're using user-level subscriptions (not organization-based) - Clerk Billing supports both, we're using user-level for simplicity
  - Add `clerk_user_id` column to link users to Clerk accounts
  - Add subscription fields: status, plan_id, subscription_id, features, dates, etc.
  - Create indexes for performance (clerk_user_id, subscription_id, subscription_status)

- [ ] **Use native Clerk + Supabase integration**
  - User data comes from JWT tokens
  - Map Clerk `user_id` to your `users` table via `clerk_user_id` column
  - Handle user lookup in webhook handler

- [ ] **Parse Clerk Billing webhook payload**
  - Handle `subscription.created` events (new subscription)
  - Handle `subscription.updated` events (plan changes, cancellations)
  - Note: Cancellations come via `subscription.updated` with status change to 'canceled'
  - Extract subscription data (plan_id, status, features, dates, Stripe IDs)

- [ ] **Note: Clerk webhooks include all Stripe subscription information**
  - No separate Stripe webhook handling needed
  - Clerk manages Stripe subscriptions and includes all Stripe data in webhooks
  - Extract Stripe subscription ID and customer ID from webhook payload

- [ ] **Map Clerk plan names to your schema**
  - Map Clerk plan IDs to your schema: `starter`, `professional`, `strategic`
  - Store plan ID in database

- [ ] **Update users table with subscription data**
  - Find user by `clerk_user_id` from webhook payload
  - Update subscription fields in `users` table (not a separate subscriptions table)
  - Update all subscription fields from webhook payload
  - Use Supabase service role client (bypasses RLS for webhook updates)

- [ ] **Handle edge cases**
  - Duplicate events (idempotency): Use subscription_id as unique identifier
  - Missing users: Log warning, return 404 if user not found
  - Failed updates: Log error, return 500, Clerk will retry

- [ ] **Test subscription lifecycle**
  - Test create event: New subscription syncs correctly to remote Supabase
  - Test update event: Plan upgrade/downgrade syncs correctly
  - Test cancel event: Cancellation syncs correctly (status = 'canceled')
  - Verify all events sync correctly to remote Supabase

**Validation:**
- Migration applied successfully
- Users table has all subscription fields
- Webhook updates database correctly
- All event types handled
- Database stays in sync with Clerk

---

### Stage 3 — Feature Gating and Protection

**Objective:** Implement feature gates using Clerk's `has()` helper to protect premium features and API routes.

**Tasks:**

- [ ] **Implement has() helper in Server Actions to check subscription**
  - Use `clerkClient.users.hasFeature(userId, featureKey)` in Server Actions
  - Check subscription status before allowing premium operations
  - Return error response if feature not available

- [ ] **Create ProtectedFeature component wrapper using Clerk's Protect component**
  - Create `components/protected-feature.tsx`
  - Uses Clerk's `useUser()` hook to get user
  - Checks feature using `user.hasFeature(featureKey)`
  - Shows upgrade prompt if feature not available
  - Renders children if feature available

- [ ] **Gate specific API routes (return 403 for non-subscribers)**
  - Gate API routes that require premium features
  - Check feature using `has()` helper in API route handler
  - Return 403 Forbidden if feature not available
  - Include error message with upgrade information

- [ ] **Add upgrade prompts for free users attempting premium features**
  - Create `components/upgrade-prompt.tsx`
  - Show upgrade prompt when user tries to access premium feature
  - Include feature name and plan required
  - Link to pricing page

- [ ] **Test feature gates: free users blocked, paid users have access**
  - Test free user (no subscription) blocked from premium features
  - Test Starter user blocked from Professional features
  - Test Professional user has access to Professional features
  - Test Strategic user has access to all features

- [ ] **Verify gates respect real-time subscription changes**
  - Test subscription upgrade unlocks features immediately
  - Test subscription cancellation locks features at period end
  - Verify feature gates check Clerk directly (not just database)

- [ ] **Add runbook documentation for troubleshooting**
  - Create `src/docs/payment-gates/TROUBLESHOOTING.md`
  - Document common issues and solutions
  - Document how to verify subscription status
  - Document how to test webhook locally

**Validation:**
- Feature gates work correctly for all user types
- Upgrade prompts display when features locked
- API routes return 403 for non-subscribers
- Premium pages protected
- Feature gates respect subscription changes in real-time

---

## Testing Strategy

### Local Testing

1. **Set up local webhook testing:**
   - Use ngrok to expose local server: `ngrok http 3000`
   - Configure Clerk webhook to ngrok URL
   - Test webhook receives events

2. **Test subscription flow:**
   - Create test subscription in Clerk (use test card: `4242 4242 4242 4242`)
   - Verify webhook received
   - Verify database updated
   - Verify features unlocked

3. **Test feature gates:**
   - Test as free user (no subscription)
   - Test as Starter user
   - Test as Professional user
   - Test as Strategic user
   - Verify correct access for each tier

### Vercel Preview Testing

1. **Deploy feature branch to Vercel:**
   - Push `payment-implementation` branch to GitHub
   - Vercel creates preview deployment
   - Get preview URL

2. **Configure Clerk webhook:**
   - Update Clerk webhook URL to Vercel preview URL
   - Test webhook receives events
   - Verify database updates

3. **Test complete flow:**
   - Create test subscription
   - Verify webhook received
   - Verify database updated
   - Verify features unlocked
   - Test plan upgrade
   - Test cancellation

### Production Testing

1. **Deploy to production:**
   - Merge `payment-implementation` to `main`
   - Deploy to production
   - Update Clerk webhook URL to production URL

2. **Test with real subscription:**
   - Create real subscription (smallest plan)
   - Verify webhook received
   - Verify database updated
   - Verify features unlocked
   - Cancel subscription
   - Verify cancellation processed

---

## Error Handling

### Webhook Errors

- **Invalid signature:** Return 401, log security warning, don't process
- **Invalid payload:** Return 400, log error, don't update database
- **User not found:** Return 404, log warning, don't update database
- **Database error:** Return 500, log error with context, Clerk will retry

### Feature Gate Errors

- **User not authenticated:** Redirect to sign-in
- **Feature not available:** Show upgrade prompt, don't block (graceful degradation)
- **API route access denied:** Return 403, include error message

### Logging

- Log all webhook events (type, user_id, subscription_id, plan_id, status)
- Log signature verification results
- Log database update results
- Log feature gate checks (optional, for debugging)
- Use structured logging format for easy parsing

---

## Security Considerations

### Webhook Signature Verification

- Always verify webhook signatures using Svix
- Never process webhooks without valid signatures
- Use constant-time comparison (handled by Svix library)
- Log security warnings for invalid signatures

### Database Access

- Use Supabase service role key for webhook updates (bypasses RLS)
- Service role key only used in server-side code
- Never expose service role key to client
- RLS policies still apply to regular user queries

### Feature Gating

- Always check features server-side (never trust client)
- Use Clerk's `has()` helper (official method)
- Don't rely on database subscription status alone (check Clerk directly)
- Handle errors gracefully (fail closed: deny access on error)

---

## Dependencies

- `@clerk/nextjs` - Already installed, for authentication and feature checks
- `svix` - For webhook signature verification (install in Stage 1)
- `@supabase/supabase-js` - Already installed, for database operations

---

## Environment Variables

**Required:**
- `CLERK_WEBHOOK_SECRET` - Webhook signing secret from Clerk dashboard (configured after webhook creation)
- `SUPABASE_SERVICE_ROLE_KEY` - Already configured, for database updates
- `NEXT_PUBLIC_SUPABASE_URL` - Already configured, Supabase project URL

**Optional:**
- `NODE_ENV` - Set to `production` in production (already configured)

---

## Success Metrics

- Webhook receives and processes all subscription events successfully
- Database stays in sync with Clerk (subscription status accurate)
- Feature gates work correctly (users only access features they've paid for)
- Zero unauthorized access to premium features
- Webhook processing time < 500ms (p95)
- Error rate < 1% for webhook processing

---

## Future Enhancements

- Email notifications for subscription events (separate system)
- Usage tracking and analytics (separate feature)
- Organization-based subscriptions (if needed for teams)
- Subscription management UI (customer portal)
- Automated dunning emails for failed payments (Clerk or separate system)

---

---

## Implementation Notes

**Implementation Date:** January 2025  
**Branch:** `payment-implementation`

### Changes from Original Plan

1. **Database Schema:**
   - Created separate `subscriptions` table (instead of adding fields to `users` table)
   - This provides better separation of concerns and allows multiple subscriptions per user in the future
   - `users` table still has `clerk_user_id` for mapping

2. **Webhook Endpoint:**
   - Location: `/api/webhooks/clerk`
   - Health check: `GET /api/webhooks/clerk`
   - Events handled: `subscription.created`, `subscription.updated`, `subscription.active`, `subscription.pastDue`

3. **Feature Gating:**
   - Uses Clerk's `has({ plan: 'planName' })` for plan checks
   - Uses Clerk's `hasFeature(featureKey)` for feature checks
   - Both Server Actions and API routes are gated
   - Components use `ProtectedFeature` wrapper

4. **Environment Variables:**
   - `CLERK_WEBHOOK_SECRET` - Webhook signing secret from Clerk dashboard
   - `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY` - Service role key for webhook updates

### Testing Status

- [x] Stage 1: Webhook Infrastructure - Complete
- [x] Stage 2: Database Sync - Complete
- [x] Stage 3: Feature Gating - Complete
- [ ] End-to-End Testing - In Progress (see END_TO_END_TESTING_GUIDE.md)

### Webhook Configuration

**Webhook URL Format:**
- Local: `https://your-ngrok-url.ngrok.io/api/webhooks/clerk`
- Preview: `https://your-preview-url.vercel.app/api/webhooks/clerk`
- Production: `https://your-domain.com/api/webhooks/clerk`

**Required Events:**
- `subscription.created`
- `subscription.updated`
- `subscription.active`
- `subscription.pastDue`

**Signing Secret:**
- Get from Clerk Dashboard → Webhooks → Your Endpoint → Signing Secret
- Format: `whsec_xxxxx`
- Store in environment variable: `CLERK_WEBHOOK_SECRET`

---

**Last Updated:** January 2025  
**Status:** Implementation Complete - Ready for Testing
