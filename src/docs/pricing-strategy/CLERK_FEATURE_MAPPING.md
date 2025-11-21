# Clerk Feature Mapping

**Complete feature-to-plan mapping for Clerk Billing setup**

---

## Feature Assignment by Plan

### Starter Plan ($49/month)

**Feature Keys to Assign:**
```
✅ visual_portfolio
✅ project_status_tracking
✅ idea_capture
✅ basic_tagging
✅ email_support
✅ up_to_5_projects
✅ basic_health_scanner
```

**What Users Get:**
- Visual Project Portfolio
- Project Status Tracking
- Idea Capture
- Basic Tagging
- Email Support
- Up to 5 Active Projects
- Basic AI Health Scanner (Weekly)

**What's Blocked:**
- ❌ Unlimited projects
- ❌ Real-time health scanner
- ❌ Cross-project analysis
- ❌ Assumption challenger
- ❌ Experiment canvas
- ❌ Advanced AI insights
- ❌ All advanced features

---

### Professional Plan ($99/month) ⭐

**Feature Keys to Assign:**
```
✅ visual_portfolio
✅ project_status_tracking
✅ idea_capture
✅ basic_tagging
✅ email_support
✅ unlimited_projects
✅ realtime_health_scanner
✅ cross_project_analysis
✅ assumption_challenger
✅ experiment_canvas
✅ advanced_ai_insights
✅ priority_support
```

**What Users Get:**
- Everything in Starter, plus:
- Unlimited Projects
- Real-time AI Health Scanner
- Cross-Project Strategy Analysis
- Assumption Challenger
- Experiment Canvas Generator
- Advanced AI Health Insights
- Priority Email Support

**What's Blocked:**
- ❌ Custom AI prompts
- ❌ Portfolio analytics
- ❌ Export & reporting
- ❌ API access
- ❌ Feature requests

---

### Strategic Plan ($149/month)

**Feature Keys to Assign:**
```
✅ visual_portfolio
✅ project_status_tracking
✅ idea_capture
✅ basic_tagging
✅ email_support
✅ unlimited_projects
✅ realtime_health_scanner
✅ cross_project_analysis
✅ assumption_challenger
✅ experiment_canvas
✅ advanced_ai_insights
✅ priority_support
✅ custom_ai_prompts
✅ portfolio_analytics
✅ export_reporting
✅ api_access
✅ feature_requests
```

**What Users Get:**
- Everything in Professional, plus:
- Custom AI Prompts
- Advanced Portfolio Analytics
- Export & Reporting
- API Access
- Feature Requests

**What's Blocked:**
- ❌ Nothing - all features included

---

## Feature Definitions

### Core Features (All Plans)

| Feature Key | Feature Name | Description |
|-------------|--------------|-------------|
| `visual_portfolio` | Visual Project Portfolio | Dashboard view of all projects |
| `project_status_tracking` | Project Status Tracking | Track Idea, Active, Stalled, Validated |
| `idea_capture` | Idea Capture | Capture and organize new ideas |
| `basic_tagging` | Basic Tagging | Organize projects by category |
| `email_support` | Email Support | Get help when you need it |

### Project Limits

| Feature Key | Feature Name | Description |
|-------------|--------------|-------------|
| `up_to_5_projects` | Up to 5 Projects | Limit to 5 active projects (Starter only) |
| `unlimited_projects` | Unlimited Projects | No limit on portfolio size (Pro & Strategic) |

### AI Features

| Feature Key | Feature Name | Description |
|-------------|--------------|-------------|
| `basic_health_scanner` | Basic Health Scanner | Weekly health checks (Starter) |
| `realtime_health_scanner` | Real-time Health Scanner | Real-time health signals (Pro & Strategic) |
| `cross_project_analysis` | Cross-Project Analysis | Portfolio-level intelligence (Pro & Strategic) |
| `assumption_challenger` | Assumption Challenger | Challenge assumptions per project (Pro & Strategic) |
| `experiment_canvas` | Experiment Canvas | AI-powered experiment design (Pro & Strategic) |
| `advanced_ai_insights` | Advanced AI Insights | Deeper analysis and recommendations (Pro & Strategic) |
| `custom_ai_prompts` | Custom AI Prompts | Tailor AI to specific needs (Strategic only) |

### Advanced Features

| Feature Key | Feature Name | Description |
|-------------|--------------|-------------|
| `portfolio_analytics` | Portfolio Analytics | Deep insights and trends (Strategic only) |
| `export_reporting` | Export & Reporting | Share insights with stakeholders (Strategic only) |
| `api_access` | API Access | Integrate with your workflow (Strategic only) |
| `priority_support` | Priority Support | Faster response times (Pro & Strategic) |
| `feature_requests` | Feature Requests | Influence product roadmap (Strategic only) |

---

## Feature Gating Logic (For Lesson 4)

### Example: Check if User Has Feature

```typescript
// Check if user has unlimited projects
const hasUnlimitedProjects = user.hasFeature('unlimited_projects');

// Check if user has cross-project analysis
const hasCrossProjectAnalysis = user.hasFeature('cross_project_analysis');

// Check if user has API access
const hasApiAccess = user.hasFeature('api_access');
```

### Example: Check User's Plan

```typescript
// Get user's plan
const userPlan = user.subscription?.planId;

// Check if user is on Professional or higher
const isProOrHigher = ['professional', 'strategic'].includes(userPlan);

// Check if user is on Strategic
const isStrategic = userPlan === 'strategic';
```

### Example: Feature Gating in Components

```typescript
// Show feature only if user has it
{user.hasFeature('cross_project_analysis') && (
  <CrossProjectAnalysis />
)}

// Show upgrade prompt if user doesn't have feature
{!user.hasFeature('unlimited_projects') && (
  <UpgradePrompt feature="unlimited_projects" />
)}
```

---

## Plan Comparison Matrix

| Feature | Starter | Professional | Strategic |
|---------|---------|--------------|-----------|
| `visual_portfolio` | ✅ | ✅ | ✅ |
| `project_status_tracking` | ✅ | ✅ | ✅ |
| `idea_capture` | ✅ | ✅ | ✅ |
| `basic_tagging` | ✅ | ✅ | ✅ |
| `email_support` | ✅ | ✅ | ✅ |
| `up_to_5_projects` | ✅ | ❌ | ❌ |
| `unlimited_projects` | ❌ | ✅ | ✅ |
| `basic_health_scanner` | ✅ | ❌ | ❌ |
| `realtime_health_scanner` | ❌ | ✅ | ✅ |
| `cross_project_analysis` | ❌ | ✅ | ✅ |
| `assumption_challenger` | ❌ | ✅ | ✅ |
| `experiment_canvas` | ❌ | ✅ | ✅ |
| `advanced_ai_insights` | ❌ | ✅ | ✅ |
| `priority_support` | ❌ | ✅ | ✅ |
| `custom_ai_prompts` | ❌ | ❌ | ✅ |
| `portfolio_analytics` | ❌ | ❌ | ✅ |
| `export_reporting` | ❌ | ❌ | ✅ |
| `api_access` | ❌ | ❌ | ✅ |
| `feature_requests` | ❌ | ❌ | ✅ |

---

## Quick Setup Checklist

**When setting up in Clerk:**

1. **Create all features first** (use feature keys above)
2. **Create plans** (Starter, Professional, Strategic)
3. **Assign features to each plan** (use mapping above)
4. **Set prices** ($49, $99, $149)
5. **Set trial periods** (14 days on Professional)
6. **Mark Professional as recommended**

---

**Use this mapping when assigning features to plans in Clerk Billing.**

