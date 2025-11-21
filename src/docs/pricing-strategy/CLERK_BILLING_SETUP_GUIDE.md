# Clerk Billing Setup Guide

**Setting up pricing plans and features in Clerk Billing to match your pricing strategy**

**Date:** January 2025  
**Prerequisites:** Clerk connected to Stripe (from previous lesson)

---

## Overview

This guide walks you through setting up your pricing plans and features in Clerk Billing to match your documented pricing strategy from Lesson 1.

**What You'll Create:**
- 1 Product (your SaaS product)
- 3 Plans (Starter, Professional, Strategic)
- Multiple Features (for feature gating)
- Free trial configuration (14 days)

---

## Step 1: Review Your Pricing Strategy

### Quick Reference from Pricing Strategy

**Product Name:** Multi-Project Dashboard with AI Strategy Partner

**Plans:**
1. **Starter** - $49/month
2. **Professional** - $99/month (Most Popular)
3. **Strategic** - $149/month

**Free Trial:** 14 days (recommended on Professional tier)

**Billing:** Monthly subscriptions (annual can be added later)

---

## Step 2: Access Clerk Billing

### Navigate to Billing Dashboard

1. **Go to Clerk Dashboard:**
   - Visit: https://dashboard.clerk.com
   - Sign in to your account

2. **Navigate to Billing:**
   - Click "Billing" in the left sidebar
   - Or go to: https://dashboard.clerk.com/billing

3. **Verify Stripe Connection:**
   - Should see "Connected to Stripe" status
   - If not connected, complete Stripe connection first

---

## Step 3: Create Product

### Create Your Main Product

1. **Click "Create Product" or "Add Product"**
   - Usually a button at the top of the Billing page

2. **Product Details:**
   - **Product Name:** `Multi-Project Dashboard` or `Signal Log`
   - **Description:** `Strategic portfolio management for solo founders`
   - **Product Type:** `SaaS` or `Subscription`

3. **Save Product**
   - This product will contain all your plans

**Note:** You typically create one product that contains all your pricing tiers.

---

## Step 4: Create Plans

### Plan 1: Starter - $49/month

1. **Click "Create Plan" or "Add Plan"**
   - Within your product

2. **Plan Configuration:**
   - **Plan Name:** `Starter`
   - **Plan ID:** `starter` (lowercase, no spaces - used in code)
   - **Description:** `Get organized and see your full portfolio at a glance. Basic AI helps you stay on track.`

3. **Pricing:**
   - **Price:** `$49.00`
   - **Currency:** `USD`
   - **Billing Interval:** `Monthly`
   - **Trial Period:** `None` (or 14 days if you want trial on all tiers)

4. **Save Plan**

### Plan 2: Professional - $99/month ⭐

1. **Click "Create Plan"**

2. **Plan Configuration:**
   - **Plan Name:** `Professional`
   - **Plan ID:** `professional` (lowercase, no spaces)
   - **Description:** `Unlock portfolio-level AI intelligence. See conflicts, synergies, and priorities across all your initiatives.`

3. **Pricing:**
   - **Price:** `$99.00`
   - **Currency:** `USD`
   - **Billing Interval:** `Monthly`
   - **Trial Period:** `14 days` (recommended - shows core value)

4. **Mark as Recommended:**
   - If Clerk has a "Recommended" or "Most Popular" option, enable it
   - This highlights it in the pricing table

5. **Save Plan**

### Plan 3: Strategic - $149/month

1. **Click "Create Plan"**

2. **Plan Configuration:**
   - **Plan Name:** `Strategic`
   - **Plan ID:** `strategic` (lowercase, no spaces)
   - **Description:** `Maximum strategic intelligence with advanced features and priority support for power users.`

3. **Pricing:**
   - **Price:** `$149.00`
   - **Currency:** `USD`
   - **Billing Interval:** `Monthly`
   - **Trial Period:** `14 days` (optional)

4. **Save Plan**

---

## Step 5: Define Features

### Feature List (Based on Pricing Strategy)

Create these features in Clerk. They'll be used for feature gating in Lesson 4.

**Core Features (All Plans):**
- `visual_portfolio` - Visual Project Portfolio
- `project_status_tracking` - Project Status Tracking
- `idea_capture` - Idea Capture
- `basic_tagging` - Basic Tagging
- `email_support` - Email Support

**Project Limits:**
- `unlimited_projects` - Unlimited Projects (Professional & Strategic only)
- `up_to_5_projects` - Up to 5 Projects (Starter only)

**AI Features:**
- `basic_health_scanner` - Basic AI Health Scanner (Weekly)
- `realtime_health_scanner` - Real-time AI Health Scanner
- `cross_project_analysis` - Cross-Project Strategy Analysis
- `assumption_challenger` - Assumption Challenger
- `experiment_canvas` - Experiment Canvas Generator
- `advanced_ai_insights` - Advanced AI Health Insights
- `custom_ai_prompts` - Custom AI Prompts

**Advanced Features:**
- `portfolio_analytics` - Advanced Portfolio Analytics
- `export_reporting` - Export & Reporting
- `api_access` - API Access
- `priority_support` - Priority Support
- `feature_requests` - Feature Requests

### How to Create Features in Clerk

1. **Navigate to Features:**
   - In Clerk Billing, look for "Features" section
   - Or "Plan Features" or "Feature Flags"

2. **Create Each Feature:**
   - **Feature Key:** Use lowercase with underscores (e.g., `unlimited_projects`)
   - **Feature Name:** Human-readable name (e.g., "Unlimited Projects")
   - **Description:** Brief description (optional)

3. **Feature Keys to Create:**
   ```
   Core Features:
   - visual_portfolio
   - project_status_tracking
   - idea_capture
   - basic_tagging
   - email_support
   
   Project Limits:
   - unlimited_projects
   - up_to_5_projects
   
   AI Features:
   - basic_health_scanner
   - realtime_health_scanner
   - cross_project_analysis
   - assumption_challenger
   - experiment_canvas
   - advanced_ai_insights
   - custom_ai_prompts
   
   Advanced Features:
   - portfolio_analytics
   - export_reporting
   - api_access
   - priority_support
   - feature_requests
   ```

**Note:** Clerk's feature system may vary. Some versions use "metadata" or "entitlements" instead of separate features. Check Clerk's current documentation for the exact method.

---

## Step 6: Assign Features to Plans

### Starter Plan Features

Assign these features to Starter plan:
- ✅ `visual_portfolio`
- ✅ `project_status_tracking`
- ✅ `idea_capture`
- ✅ `basic_tagging`
- ✅ `email_support`
- ✅ `up_to_5_projects`
- ✅ `basic_health_scanner`

**Not included:**
- ❌ `unlimited_projects`
- ❌ `realtime_health_scanner`
- ❌ `cross_project_analysis`
- ❌ `assumption_challenger`
- ❌ `experiment_canvas`
- ❌ `advanced_ai_insights`
- ❌ All advanced features

### Professional Plan Features

Assign these features to Professional plan:
- ✅ All Starter features, plus:
- ✅ `unlimited_projects`
- ✅ `realtime_health_scanner`
- ✅ `cross_project_analysis`
- ✅ `assumption_challenger`
- ✅ `experiment_canvas`
- ✅ `advanced_ai_insights`
- ✅ `priority_support`

**Not included:**
- ❌ `custom_ai_prompts`
- ❌ `portfolio_analytics`
- ❌ `export_reporting`
- ❌ `api_access`
- ❌ `feature_requests`

### Strategic Plan Features

Assign these features to Strategic plan:
- ✅ All Professional features, plus:
- ✅ `custom_ai_prompts`
- ✅ `portfolio_analytics`
- ✅ `export_reporting`
- ✅ `api_access`
- ✅ `feature_requests`

---

## Step 7: Configure Plan Details

### For Each Plan, Verify:

1. **Billing Interval:**
   - Set to "Monthly" for all plans
   - Annual can be added later

2. **Trial Period:**
   - **Starter:** None (or 14 days if you want)
   - **Professional:** 14 days (recommended)
   - **Strategic:** 14 days (optional)

3. **Plan Descriptions:**
   - Use value propositions from pricing strategy
   - Keep them concise and value-focused

4. **Plan Order:**
   - Ensure plans appear in order: Starter → Professional → Strategic
   - Professional should be highlighted as "Recommended"

---

## Step 8: Test the Flow

### Create Test User

1. **In Clerk Dashboard:**
   - Go to "Users" section
   - Click "Create User"
   - Create a test user with email: `test@example.com`

### Test Subscription Flow

1. **Navigate to Your App:**
   - Go to your pricing page (you'll build this in Lesson 3)
   - Or use Clerk's test environment

2. **Select a Plan:**
   - Click "Subscribe" or "Start Free Trial" on Professional plan
   - Should redirect to Clerk checkout

3. **Complete Checkout:**
   - Use test card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., `12/25`)
   - CVC: Any 3 digits (e.g., `123`)
   - Name: Any name

4. **Verify Subscription:**
   - Go to Clerk Dashboard → Users
   - Click on your test user
   - Check "Subscriptions" tab
   - Should see active subscription

5. **Verify Features:**
   - Check user's features/entitlements
   - Should match the plan's assigned features

---

## Step 9: Verify Configuration

### Checklist

- [ ] Product created with correct name
- [ ] 3 plans created (Starter, Professional, Strategic)
- [ ] Prices match pricing strategy ($49, $99, $149)
- [ ] Trial period set (14 days on Professional)
- [ ] Features defined and assigned to plans
- [ ] Professional plan marked as "Recommended"
- [ ] Test subscription works
- [ ] Features appear correctly for test user

---

## Step 10: Plan IDs for Code

### Save These Plan IDs

You'll use these in your code for feature gating:

```typescript
// Plan IDs (from Clerk)
export const PLAN_IDS = {
  STARTER: 'starter',
  PROFESSIONAL: 'professional',
  STRATEGIC: 'strategic',
} as const;

// Feature Keys (for feature gating)
export const FEATURES = {
  // Core
  VISUAL_PORTFOLIO: 'visual_portfolio',
  PROJECT_STATUS_TRACKING: 'project_status_tracking',
  IDEA_CAPTURE: 'idea_capture',
  BASIC_TAGGING: 'basic_tagging',
  EMAIL_SUPPORT: 'email_support',
  
  // Limits
  UNLIMITED_PROJECTS: 'unlimited_projects',
  UP_TO_5_PROJECTS: 'up_to_5_projects',
  
  // AI
  BASIC_HEALTH_SCANNER: 'basic_health_scanner',
  REALTIME_HEALTH_SCANNER: 'realtime_health_scanner',
  CROSS_PROJECT_ANALYSIS: 'cross_project_analysis',
  ASSUMPTION_CHALLENGER: 'assumption_challenger',
  EXPERIMENT_CANVAS: 'experiment_canvas',
  ADVANCED_AI_INSIGHTS: 'advanced_ai_insights',
  CUSTOM_AI_PROMPTS: 'custom_ai_prompts',
  
  // Advanced
  PORTFOLIO_ANALYTICS: 'portfolio_analytics',
  EXPORT_REPORTING: 'export_reporting',
  API_ACCESS: 'api_access',
  PRIORITY_SUPPORT: 'priority_support',
  FEATURE_REQUESTS: 'feature_requests',
} as const;
```

---

## Important Notes

### Plans Match Pricing Strategy

✅ **Your Clerk plans should exactly match:**
- Plan names from pricing strategy
- Prices from pricing strategy ($49, $99, $149)
- Features from pricing strategy
- Trial periods from pricing strategy

### Features for Gating

✅ **Features you define here will be used:**
- To gate premium functionality in Lesson 4
- To check user entitlements in your app
- To show/hide features based on plan

### Test Mode

✅ **All subscriptions created now are:**
- In test mode (no real charges)
- Safe to test with test cards
- Can be deleted without issues

### PricingTable Component

✅ **These plans will automatically:**
- Appear in Clerk's `<PricingTable />` component
- Show correct prices and features
- Handle checkout flow

---

## Troubleshooting

### Issue: Can't find "Features" section

**Solution:**
- Clerk's feature system may be called "Entitlements" or "Metadata"
- Check Clerk's latest documentation
- Features might be assigned via plan metadata instead

### Issue: Plans not appearing

**Solution:**
- Ensure plans are published/active
- Check that product is active
- Verify Stripe connection is working

### Issue: Test subscription fails

**Solution:**
- Verify Stripe test mode is enabled
- Check test card number is correct
- Ensure Clerk webhook is configured
- Check Clerk logs for errors

### Issue: Features not working

**Solution:**
- Verify features are assigned to plans
- Check feature keys match in code
- Ensure user subscription is active
- Check Clerk API response for features

---

## Next Steps

After completing this setup:

1. **Save Plan IDs and Feature Keys:**
   - Document them for use in Lesson 4
   - Create constants file in your codebase

2. **Test Subscription Flow:**
   - Create test user
   - Complete test subscription
   - Verify features work

3. **Prepare for Lesson 3:**
   - Plans are ready for pricing page
   - PricingTable component will use these plans

4. **Prepare for Lesson 4:**
   - Features are ready for feature gating
   - Plan IDs ready for code

---

## Resources

- **Clerk Billing Docs:** https://clerk.com/docs/billing
- **Setting Up Plans:** Check Clerk's latest documentation
- **Stripe Test Cards:** https://stripe.com/docs/testing

---

## Summary

**What You've Created:**
- ✅ 1 Product (Multi-Project Dashboard)
- ✅ 3 Plans (Starter $49, Professional $99, Strategic $149)
- ✅ Multiple Features (for feature gating)
- ✅ Free trial configuration (14 days on Professional)

**What's Ready:**
- ✅ Plans match pricing strategy exactly
- ✅ Features defined for all tiers
- ✅ Ready for pricing page (Lesson 3)
- ✅ Ready for feature gating (Lesson 4)

**Status:** ✅ **Ready to proceed to Lesson 3 (Pricing Page)**

---

**Last Updated:** January 2025

