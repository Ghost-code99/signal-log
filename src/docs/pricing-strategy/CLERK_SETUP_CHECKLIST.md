# Clerk Billing Setup Checklist

**Step-by-step checklist for setting up pricing plans in Clerk**

---

## Pre-Setup

- [ ] Clerk account created and signed in
- [ ] Stripe connected to Clerk (from previous lesson)
- [ ] Pricing strategy document reviewed (`pricing-strategy.md`)
- [ ] Plan names and prices confirmed

---

## Step 1: Create Product

- [ ] Navigate to Clerk Dashboard → Billing
- [ ] Click "Create Product" or "Add Product"
- [ ] Enter product name: `Multi-Project Dashboard` or `Signal Log`
- [ ] Enter description: `Strategic portfolio management for solo founders`
- [ ] Save product

---

## Step 2: Create Plans

### Plan 1: Starter

- [ ] Click "Create Plan" within product
- [ ] Plan Name: `Starter`
- [ ] Plan ID: `starter` (lowercase, no spaces)
- [ ] Price: `$49.00`
- [ ] Currency: `USD`
- [ ] Billing Interval: `Monthly`
- [ ] Trial Period: `None` (or 14 days)
- [ ] Description: "Get organized and see your full portfolio at a glance. Basic AI helps you stay on track."
- [ ] Save plan

### Plan 2: Professional ⭐

- [ ] Click "Create Plan"
- [ ] Plan Name: `Professional`
- [ ] Plan ID: `professional` (lowercase, no spaces)
- [ ] Price: `$99.00`
- [ ] Currency: `USD`
- [ ] Billing Interval: `Monthly`
- [ ] Trial Period: `14 days` (recommended)
- [ ] Description: "Unlock portfolio-level AI intelligence. See conflicts, synergies, and priorities across all your initiatives."
- [ ] Mark as "Recommended" or "Most Popular" (if option available)
- [ ] Save plan

### Plan 3: Strategic

- [ ] Click "Create Plan"
- [ ] Plan Name: `Strategic`
- [ ] Plan ID: `strategic` (lowercase, no spaces)
- [ ] Price: `$149.00`
- [ ] Currency: `USD`
- [ ] Billing Interval: `Monthly`
- [ ] Trial Period: `14 days` (optional)
- [ ] Description: "Maximum strategic intelligence with advanced features and priority support for power users."
- [ ] Save plan

---

## Step 3: Create Features

**Create all features first, then assign to plans.**

### Core Features

- [ ] `visual_portfolio` - Visual Project Portfolio
- [ ] `project_status_tracking` - Project Status Tracking
- [ ] `idea_capture` - Idea Capture
- [ ] `basic_tagging` - Basic Tagging
- [ ] `email_support` - Email Support

### Project Limits

- [ ] `up_to_5_projects` - Up to 5 Projects
- [ ] `unlimited_projects` - Unlimited Projects

### AI Features

- [ ] `basic_health_scanner` - Basic Health Scanner (Weekly)
- [ ] `realtime_health_scanner` - Real-time Health Scanner
- [ ] `cross_project_analysis` - Cross-Project Analysis
- [ ] `assumption_challenger` - Assumption Challenger
- [ ] `experiment_canvas` - Experiment Canvas
- [ ] `advanced_ai_insights` - Advanced AI Insights
- [ ] `custom_ai_prompts` - Custom AI Prompts

### Advanced Features

- [ ] `portfolio_analytics` - Portfolio Analytics
- [ ] `export_reporting` - Export & Reporting
- [ ] `api_access` - API Access
- [ ] `priority_support` - Priority Support
- [ ] `feature_requests` - Feature Requests

---

## Step 4: Assign Features to Plans

### Starter Plan Features

- [ ] Assign `visual_portfolio`
- [ ] Assign `project_status_tracking`
- [ ] Assign `idea_capture`
- [ ] Assign `basic_tagging`
- [ ] Assign `email_support`
- [ ] Assign `up_to_5_projects`
- [ ] Assign `basic_health_scanner`

**Verify these are NOT assigned:**
- [ ] `unlimited_projects` - NOT assigned
- [ ] `cross_project_analysis` - NOT assigned
- [ ] `assumption_challenger` - NOT assigned
- [ ] All advanced features - NOT assigned

### Professional Plan Features

- [ ] Assign all Starter features, plus:
- [ ] Assign `unlimited_projects`
- [ ] Assign `realtime_health_scanner`
- [ ] Assign `cross_project_analysis`
- [ ] Assign `assumption_challenger`
- [ ] Assign `experiment_canvas`
- [ ] Assign `advanced_ai_insights`
- [ ] Assign `priority_support`

**Verify these are NOT assigned:**
- [ ] `custom_ai_prompts` - NOT assigned
- [ ] `portfolio_analytics` - NOT assigned
- [ ] `export_reporting` - NOT assigned
- [ ] `api_access` - NOT assigned
- [ ] `feature_requests` - NOT assigned

### Strategic Plan Features

- [ ] Assign all Professional features, plus:
- [ ] Assign `custom_ai_prompts`
- [ ] Assign `portfolio_analytics`
- [ ] Assign `export_reporting`
- [ ] Assign `api_access`
- [ ] Assign `feature_requests`

---

## Step 5: Verify Configuration

- [ ] All 3 plans created
- [ ] Prices match pricing strategy ($49, $99, $149)
- [ ] Trial periods set correctly (14 days on Professional)
- [ ] Professional marked as recommended
- [ ] All features created
- [ ] Features assigned correctly to each plan
- [ ] Plan descriptions match pricing strategy

---

## Step 6: Test Subscription Flow

- [ ] Create test user in Clerk
- [ ] Navigate to pricing page (or Clerk test environment)
- [ ] Click "Subscribe" on Professional plan
- [ ] Complete checkout with test card: `4242 4242 4242 4242`
- [ ] Verify subscription appears in Clerk dashboard
- [ ] Verify user has correct features assigned
- [ ] Test upgrade flow (Starter → Professional)
- [ ] Test downgrade flow (Strategic → Professional)

---

## Step 7: Document Plan IDs

**Save these for use in code:**

- [ ] Plan ID: `starter`
- [ ] Plan ID: `professional`
- [ ] Plan ID: `strategic`

**Save feature keys:**
- [ ] All feature keys documented (see `CLERK_FEATURE_MAPPING.md`)

---

## Final Verification

- [ ] Plans appear in Clerk's PricingTable component
- [ ] Prices display correctly
- [ ] Trial period works (14 days on Professional)
- [ ] Test subscription completes successfully
- [ ] Features are accessible in code
- [ ] Ready for Lesson 3 (Pricing Page)
- [ ] Ready for Lesson 4 (Feature Gating)

---

## Troubleshooting

**If something doesn't work:**

1. **Check Stripe connection** - Ensure Clerk is connected to Stripe
2. **Verify test mode** - All subscriptions should be in test mode
3. **Check plan status** - Ensure plans are published/active
4. **Review feature assignment** - Verify features are assigned correctly
5. **Check Clerk logs** - Look for errors in Clerk dashboard

---

## Next Steps

After completing this checklist:

1. ✅ Plans are configured in Clerk
2. ✅ Ready to build pricing page (Lesson 3)
3. ✅ Ready to implement feature gating (Lesson 4)
4. ✅ Test subscription flow works

---

**Status:** Complete when all items are checked ✅

**For detailed instructions, see:** `CLERK_BILLING_SETUP_GUIDE.md`

