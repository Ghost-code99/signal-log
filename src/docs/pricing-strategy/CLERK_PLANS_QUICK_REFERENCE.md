# Clerk Plans Quick Reference

**Quick reference for plan IDs, prices, and features**

---

## Plans Configuration

### Plan 1: Starter

**Clerk Configuration:**
- **Plan Name:** `Starter`
- **Plan ID:** `starter`
- **Price:** $49.00/month
- **Trial:** None (or 14 days)
- **Description:** "Get organized and see your full portfolio at a glance. Basic AI helps you stay on track."

**Features:**
- `visual_portfolio`
- `project_status_tracking`
- `idea_capture`
- `basic_tagging`
- `email_support`
- `up_to_5_projects`
- `basic_health_scanner`

---

### Plan 2: Professional ⭐

**Clerk Configuration:**
- **Plan Name:** `Professional`
- **Plan ID:** `professional`
- **Price:** $99.00/month
- **Trial:** 14 days (recommended)
- **Description:** "Unlock portfolio-level AI intelligence. See conflicts, synergies, and priorities across all your initiatives."
- **Mark as:** Recommended / Most Popular

**Features:**
- All Starter features, plus:
- `unlimited_projects`
- `realtime_health_scanner`
- `cross_project_analysis`
- `assumption_challenger`
- `experiment_canvas`
- `advanced_ai_insights`
- `priority_support`

---

### Plan 3: Strategic

**Clerk Configuration:**
- **Plan Name:** `Strategic`
- **Plan ID:** `strategic`
- **Price:** $149.00/month
- **Trial:** 14 days (optional)
- **Description:** "Maximum strategic intelligence with advanced features and priority support for power users."

**Features:**
- All Professional features, plus:
- `custom_ai_prompts`
- `portfolio_analytics`
- `export_reporting`
- `api_access`
- `feature_requests`

---

## Feature Keys Reference

**Copy these when creating features in Clerk:**

```
Core Features:
visual_portfolio
project_status_tracking
idea_capture
basic_tagging
email_support

Project Limits:
unlimited_projects
up_to_5_projects

AI Features:
basic_health_scanner
realtime_health_scanner
cross_project_analysis
assumption_challenger
experiment_canvas
advanced_ai_insights
custom_ai_prompts

Advanced Features:
portfolio_analytics
export_reporting
api_access
priority_support
feature_requests
```

---

## Test Card

**Stripe Test Card:**
- **Number:** `4242 4242 4242 4242`
- **Expiry:** Any future date (e.g., `12/25`)
- **CVC:** Any 3 digits (e.g., `123`)
- **ZIP:** Any 5 digits (e.g., `12345`)

---

## Quick Checklist

- [ ] Product created
- [ ] 3 plans created with correct prices
- [ ] Features defined
- [ ] Features assigned to plans
- [ ] Trial period set (14 days on Professional)
- [ ] Professional marked as recommended
- [ ] Test subscription works

---

**For detailed setup, see:** `CLERK_BILLING_SETUP_GUIDE.md`

