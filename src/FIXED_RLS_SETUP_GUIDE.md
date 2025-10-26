# ✅ CORRECTED RLS Setup Guide

## ⚠️ The Issue

You got this error: `column "user_id" does not exist` on the `users` table.

## 🔍 Why This Happened

Each table uses **different column names**:
- **`users` table**: Uses `id` (not `user_id`)
- **`projects` table**: Uses `user_id`
- **`ideas` table**: Uses `user_id`

## ✅ The Correct RLS Policies

### Table 1: `users` Table
**Use**: `auth.uid() = id` (NOT `user_id`)

```
Policy expression: auth.uid() = id
```

### Table 2: `projects` Table
**Use**: `auth.uid() = user_id`

```
Policy expression: auth.uid() = user_id
```

### Table 3: `ideas` Table
**Use**: `auth.uid() = user_id`

```
Policy expression: auth.uid() = user_id
```

### Tables 4-6: Other Tables
These use **joins** to check ownership:

- `project_tags`
- `ai_interactions`
- `project_health_metrics`

Use this expression:
```sql
EXISTS (
  SELECT 1 FROM projects 
  WHERE projects.id = [table].project_id 
  AND projects.user_id = auth.uid()
)
```

---

## 🚀 Quick Fix Steps

### Option 1: Use the Pre-built SQL Script

I've created a complete SQL file with all the correct policies. **This is the easiest way!**

**Steps**:
1. Go to Supabase Dashboard > SQL Editor
2. Open the file: `../apply-schema.sql`
3. Copy lines 120-255 (the RLS section)
4. Paste into SQL Editor
5. Click "Run"

This will:
- ✅ Enable RLS on all tables
- ✅ Create all policies with correct expressions
- ✅ Set up everything automatically

---

### Option 2: Manual Setup (Table by Table)

If you prefer to do it manually in the Table Editor:

#### **`users` Table**
```
✅ Enable RLS: ON
Policy Name: "Users can view own profile"
Table: users
Operations: SELECT, INSERT, UPDATE
Expression: auth.uid() = id  ← Note: "id" not "user_id"
```

#### **`projects` Table**
```
✅ Enable RLS: ON
Policy Name: "Users can manage own projects"
Table: projects
Operations: ALL (SELECT, INSERT, UPDATE, DELETE)
Expression: auth.uid() = user_id
```

#### **`ideas` Table**
```
✅ Enable RLS: ON
Policy Name: "Users can manage own ideas"
Table: ideas
Operations: ALL
Expression: auth.uid() = user_id
```

#### **`project_tags` Table**
```
✅ Enable RLS: ON
Policy Name: "Users can manage tags for own projects"
Table: project_tags
Operations: ALL
Expression: EXISTS (
  SELECT 1 FROM projects 
  WHERE projects.id = project_tags.project_id 
  AND projects.user_id = auth.uid()
)
```

#### **`ai_interactions` Table**
```
✅ Enable RLS: ON
Policy Name: "Users can view AI interactions for own projects"
Table: ai_interactions
Operations: SELECT, INSERT
Expression: EXISTS (
  SELECT 1 FROM projects 
  WHERE projects.id = ai_interactions.project_id 
  AND projects.user_id = auth.uid()
)
```

#### **`project_health_metrics` Table**
```
✅ Enable RLS: ON
Policy Name: "Users can view health metrics for own projects"
Table: project_health_metrics
Operations: SELECT, INSERT
Expression: EXISTS (
  SELECT 1 FROM projects 
  WHERE projects.id = project_health_metrics.project_id 
  AND projects.user_id = auth.uid()
)
```

---

## 🎯 Recommended Approach

**Use Option 1** (the SQL script) - it's fastest and guaranteed to work correctly!

The file `../apply-schema.sql` has all the correct policies already written.

---

## ✅ After Enabling RLS

1. Return to Security Advisor: http://localhost:3001/security-advisor
2. Click "Run Scan"
3. Your score should improve significantly!

Expected improvement: **+15-20 points** (48 → 63-68)

---

## 🆘 Still Having Issues?

Check the actual column names in your Supabase dashboard:

1. Go to Table Editor
2. Click on each table
3. Look at the column list
4. Use the actual column names

The most common mistake: Using `user_id` on the `users` table (should be `id`)

---

**Good luck!** You're almost there! 🚀
