# MCP Servers Integration: Daily Development Workflow

**Date:** 2025-11-18  
**MCP Servers Tested:** Linear, Supabase, Chrome DevTools

---

## 🧪 Test Results

### 1. ✅ Linear MCP - Current Sprint Task

**First Task in Current Sprint:**

**Issue:** WIL-1 - "Get familiar with Linear (1)"
- **Status:** Todo
- **Priority:** Urgent
- **Assignee:** Martins Obioha
- **Project:** Linear Onboarding & Setup
- **Team:** WillisGlobal
- **URL:** https://linear.app/willisglobal/issue/WIL-1/get-familiar-with-linear-1
- **Git Branch:** `obiohaomartins/wil-1-get-familiar-with-linear-1`

**Description:** Onboarding task to get familiar with Linear, includes setup guides for different company stages and resources.

**Other Recent Tasks:**
- WIL-2: "Set up your teams (2)" - High priority
- WIL-3: "Connect your tools (3)" - High priority  
- WIL-4: "Import your data (4)" - Medium priority

---

### 2. ✅ Supabase MCP - Database Overview

**Project ID:** `sbvxiljjfolgmpycabep`  
**Project URL:** `https://sbvxiljjfolgmpycabep.supabase.co`

**Database Summary:**
- **Total Tables:** 8 tables in `public` schema
- **RLS Status:** ✅ All tables have Row Level Security enabled
- **Clerk Integration:** ✅ `projects` table configured for Clerk authentication

**Table Relationships:**

```
projects (Clerk-integrated) ⭐
  ├── project_tags (1 FK)
  ├── project_health_metrics (1 FK)
  ├── ai_interactions (1 FK)
  └── ideas (1 FK via related_project_id)

users (legacy)
  ├── ideas (1 FK)
  └── ai_interactions (1 FK)
```

**Key Tables:**
1. **`projects`** - Main application table (Clerk-integrated)
2. **`project_tags`** - Tags for projects
3. **`project_health_metrics`** - Health scores and metrics
4. **`ai_interactions`** - AI interaction logs
5. **`ideas`** - Captured ideas
6. **`users`** - Legacy user table
7. **`mfa_settings`** - MFA configuration
8. **`security_events`** - Security audit log

**Foreign Key Relationships:**
- `ai_interactions` → References `projects` and `users` (2 FKs)
- `ideas` → References `projects` and `users` (2 FKs)
- `project_health_metrics` → References `projects` (1 FK)
- `project_tags` → References `projects` (1 FK)

---

### 3. ⚠️ Chrome DevTools MCP - Browser Instance Conflict

**Status:** Browser instance already running (conflict detected)

**Note:** Chrome DevTools MCP requires an isolated browser instance. The browser is already running for another session, preventing automated testing. However, the server is running at `http://localhost:3000` and can be tested manually.

**Intended Workflow:**
- Navigate to homepage
- Take screenshot
- Analyze performance
- Test user interactions

---

## 🔄 How MCP Servers Work Together in Daily Development

### Morning Routine: Planning & Context

**1. Linear MCP - Check Today's Tasks**
```
"What's my first task today?"
→ Linear MCP shows current sprint tasks
→ Get issue details, priority, assignee
→ Understand what needs to be built
```

**2. Supabase MCP - Understand Data Structure**
```
"What tables do I need to work with?"
→ Supabase MCP shows database schema
→ Understand relationships and constraints
→ Check RLS policies
→ Plan database queries/changes
```

**3. Chrome DevTools MCP - Verify Current State**
```
"Does the app work right now?"
→ Navigate to homepage
→ Take screenshot
→ Check for errors
→ Verify UI state
```

---

### Development Workflow: Build → Test → Verify

**Scenario: Building a New Feature**

**Step 1: Linear MCP - Get Task Context**
- Read issue description
- Understand acceptance criteria
- Check related issues
- Get git branch name

**Step 2: Supabase MCP - Plan Database Changes**
- Check existing table structure
- Understand relationships
- Plan migrations if needed
- Verify RLS policies
- Test queries before implementing

**Step 3: Build Feature**
- Write code
- Use Supabase client helper
- Follow Linear task requirements

**Step 4: Chrome DevTools MCP - Test Feature**
- Navigate to feature page
- Take screenshot
- Test interactions
- Check console for errors
- Verify performance
- Test responsive design

**Step 5: Linear MCP - Update Progress**
- Mark task as in progress
- Add comments with findings
- Link to PR/branch

---

### Testing Workflow: Verify Everything Works

**1. Supabase MCP - Verify Data**
```
"Did my changes work correctly?"
→ Query database directly
→ Check RLS policies
→ Verify data isolation
→ Test with multiple users
```

**2. Chrome DevTools MCP - Verify UI**
```
"Does it look and work correctly?"
→ Take screenshots
→ Test user flows
→ Check performance
→ Verify mobile responsiveness
```

**3. Linear MCP - Document Results**
```
"Update task with test results"
→ Add test results as comments
→ Attach screenshots
→ Mark as complete
```

---

## 🎯 Unique Value of Each MCP Server

### 📋 Linear MCP - Project Management & Task Tracking

**What it does:**
- Manages tasks, issues, and sprints
- Tracks project progress
- Organizes work by teams and cycles
- Links code to tasks via git branches

**When to use:**
- ✅ Starting your day - "What should I work on?"
- ✅ Creating tasks - "Create an issue for this bug"
- ✅ Tracking progress - "Update task status"
- ✅ Planning sprints - "What's in the current cycle?"
- ✅ Linking work - "What branch should I use?"

**Unique value:**
- **Context switching:** Quickly understand what you're building
- **Git integration:** Branch names match issue identifiers
- **Team coordination:** See what others are working on
- **Progress tracking:** Visualize sprint progress

**Example workflow:**
```
1. "Show me tasks assigned to me"
2. "Get details for issue WIL-1"
3. "Create a new issue for authentication bug"
4. "What's the git branch name for this task?"
```

---

### 🗄️ Supabase MCP - Database Management & Querying

**What it does:**
- Connects to remote Supabase database
- Lists tables, columns, and relationships
- Executes SQL queries
- Applies migrations
- Checks RLS policies
- Analyzes indexes and constraints

**When to use:**
- ✅ Understanding schema - "What tables exist?"
- ✅ Planning features - "What data do I need?"
- ✅ Debugging - "Why isn't this query working?"
- ✅ Testing - "Verify data isolation works"
- ✅ Migrations - "Apply this schema change"
- ✅ Performance - "Check indexes on this table"

**Unique value:**
- **Direct database access:** No need for separate database client
- **Schema exploration:** Understand structure without leaving editor
- **Safe migrations:** Apply changes with version control
- **RLS verification:** Check security policies
- **Query testing:** Test SQL before implementing in code

**Example workflow:**
```
1. "List all tables in public schema"
2. "Show me the projects table structure"
3. "Check RLS policies on projects table"
4. "Execute: SELECT * FROM projects WHERE user_id = '...'"
5. "Apply migration: update_projects_for_clerk"
```

---

### 🌐 Chrome DevTools MCP - UI Testing & Verification

**What it does:**
- Controls Chrome browser programmatically
- Navigates to pages
- Takes screenshots
- Captures page snapshots
- Analyzes performance
- Tests user interactions
- Checks console errors
- Verifies responsive design

**When to use:**
- ✅ Visual testing - "Take screenshot of homepage"
- ✅ Performance analysis - "Run performance trace"
- ✅ User flow testing - "Navigate to signup and test"
- ✅ Bug verification - "Does this bug still exist?"
- ✅ Responsive testing - "Test on mobile viewport"
- ✅ Error checking - "What errors are in console?"

**Unique value:**
- **Automated testing:** Test UI without manual clicking
- **Visual regression:** Compare screenshots over time
- **Performance insights:** Get real metrics (TTI, FID, CLS)
- **Accessibility:** Analyze a11y tree
- **Network debugging:** See all requests/responses
- **Console analysis:** Catch JavaScript errors

**Example workflow:**
```
1. "Navigate to http://localhost:3000/sign-up"
2. "Take screenshot"
3. "Fill form with test@example.com"
4. "Click submit button"
5. "Check console for errors"
6. "Run performance trace"
```

---

## 🔗 Integrated Workflow Example

### Real-World Scenario: "Fix Authentication Bug"

**Step 1: Linear MCP - Get Task**
```
"Show me issue about authentication bug"
→ Get issue WIL-5: "Fix sign-in redirect issue"
→ Priority: High
→ Branch: fix/auth-redirect
```

**Step 2: Supabase MCP - Check Database**
```
"Show me users table structure"
→ Verify user_id column type
→ Check RLS policies
→ Test query: "SELECT * FROM projects WHERE user_id = 'test'"
```

**Step 3: Build Fix**
```
- Update middleware
- Fix redirect logic
- Test locally
```

**Step 4: Chrome DevTools MCP - Test Fix**
```
"Navigate to http://localhost:3000/sign-in"
"Fill form and submit"
"Take screenshot of result"
"Check console for errors"
→ Verify redirect works correctly
```

**Step 5: Supabase MCP - Verify Data**
```
"Test data isolation"
→ Create test user A
→ Create test user B
→ Verify user B can't see user A's data
```

**Step 6: Linear MCP - Update Task**
```
"Add comment: Fix verified, redirects working correctly"
"Attach screenshot"
"Mark as complete"
```

---

## 📊 MCP Server Comparison

| Feature | Linear MCP | Supabase MCP | Chrome DevTools MCP |
|---------|-----------|--------------|---------------------|
| **Primary Use** | Task management | Database operations | UI testing |
| **When to Use** | Planning, tracking | Schema, queries | Testing, debugging |
| **Key Benefit** | Context & organization | Direct DB access | Automated testing |
| **Integration** | Git branches | Code queries | Visual verification |
| **Output** | Issues, tasks | Data, schema | Screenshots, metrics |

---

## 🎯 Best Practices

### Daily Workflow

**Morning:**
1. Linear MCP → Check today's tasks
2. Supabase MCP → Understand data needs
3. Chrome DevTools MCP → Verify app state

**During Development:**
1. Linear MCP → Reference task requirements
2. Supabase MCP → Query/test database
3. Chrome DevTools MCP → Test UI changes

**Before Committing:**
1. Chrome DevTools MCP → Visual verification
2. Supabase MCP → Data verification
3. Linear MCP → Update task status

---

## 🚀 Advanced Integration Patterns

### Pattern 1: Feature Development
```
Linear (task) → Supabase (schema) → Code → Chrome (test) → Linear (update)
```

### Pattern 2: Bug Fixing
```
Chrome (reproduce) → Supabase (check data) → Code (fix) → Chrome (verify) → Linear (close)
```

### Pattern 3: Performance Optimization
```
Chrome (trace) → Supabase (query analysis) → Code (optimize) → Chrome (verify) → Linear (document)
```

---

## 💡 Key Insights

1. **Linear MCP** = Your project memory - keeps context of what you're building
2. **Supabase MCP** = Your data layer - understand and query your database directly
3. **Chrome DevTools MCP** = Your user's eyes - see what users actually experience

**Together, they provide:**
- ✅ Complete development context
- ✅ Direct database access
- ✅ Automated UI testing
- ✅ Seamless workflow integration

---

## 📝 Summary

**Linear MCP** helps you:
- Know what to work on
- Track progress
- Organize work
- Link code to tasks

**Supabase MCP** helps you:
- Understand your database
- Query data directly
- Apply migrations safely
- Verify security policies

**Chrome DevTools MCP** helps you:
- Test UI automatically
- Verify user experience
- Analyze performance
- Catch visual bugs

**Together:** They create a complete development environment where you can plan, build, test, and verify without leaving your editor.

---

**Last Updated:** 2025-11-18  
**Test Status:** ✅ Linear & Supabase working | ⚠️ Chrome DevTools (browser conflict)

