# Declarative Schema Management Guide

This guide explains how to use the declarative schema approach for managing your Signal Log database schema with Supabase.

## Overview

We're using the **declarative schema approach** as recommended by the [official Supabase documentation](https://supabase.com/docs/guides/local-development/declarative-database-schemas). This approach:

- Defines the desired end state of your database
- Simplifies schema management and version control
- Enables easy collaboration and deployment
- Provides a single source of truth for your database structure

## Directory Structure

```
supabase/
├── config.toml              # Supabase configuration
├── schema.sql               # Complete declarative schema
└── schemas/                 # Individual schema files
    ├── 01-extensions.sql
    ├── 02-users.sql
    ├── 03-projects.sql
    ├── 04-project-tags.sql
    ├── 05-ai-interactions.sql
    ├── 06-ideas.sql
    ├── 07-project-health-metrics.sql
    └── 08-rls-policies.sql
```

## Workflow

### 1. Making Schema Changes

When you need to modify the database schema:

1. **Edit the declarative schema files** in `supabase/schemas/`
2. **Update the main schema file** `supabase/schema.sql` to reflect changes
3. **Generate a migration** using `supabase db diff`
4. **Review the migration** before applying
5. **Apply the migration** to your database

### 2. Commands

```bash
# Generate a migration from your declarative schema
supabase db diff -f descriptive_migration_name

# Apply migrations to your remote database
supabase db push

# Check the status of your database
supabase status

# View your database in the Supabase dashboard
supabase dashboard
```

### 3. Schema Organization

Each table has its own file in `supabase/schemas/`:

- **01-extensions.sql**: PostgreSQL extensions
- **02-users.sql**: User management
- **03-projects.sql**: Project data
- **04-project-tags.sql**: Project tagging system
- **05-ai-interactions.sql**: AI interaction logs
- **06-ideas.sql**: Idea capture system
- **07-project-health-metrics.sql**: Health metrics
- **08-rls-policies.sql**: Row Level Security policies

### 4. Best Practices

#### PostgreSQL Data Types
- **UUID**: For primary keys (using `uuid_generate_v4()`)
- **TEXT**: For variable-length strings
- **TIMESTAMP WITH TIME ZONE**: For timestamps (using `NOW()`)
- **JSONB**: For structured metadata (with GIN indexes)
- **TEXT[]**: For arrays (with GIN indexes)

#### Indexes
- **Primary keys**: Automatically indexed
- **Foreign keys**: Indexed for join performance
- **Search columns**: Indexed for query performance
- **JSONB columns**: GIN indexes for JSON queries
- **Array columns**: GIN indexes for array operations

#### Constraints
- **CHECK constraints**: For enum-like values
- **UNIQUE constraints**: For business rules
- **Foreign key constraints**: For referential integrity

#### Row Level Security (RLS)
- **Enable RLS**: On all tables
- **User isolation**: Users can only access their own data
- **Project-based access**: Related data access through project ownership

## Migration Safety Protocol

⚠️ **ALWAYS follow the migration safety protocol** before applying changes:

### Step 1: Understand & Plan
- Clarify what you want to change
- Review current schema structure
- Plan modifications following best practices

### Step 2: Update Schema
- Edit `supabase/schemas/` files
- Update `supabase/schema.sql`
- Explain what changed and why

### Step 3: Generate Migration
```bash
supabase db diff -f descriptive_migration_name
```

### Step 4: Risk Assessment (REQUIRED)
Before running `supabase db push`, analyze:

- **What tables/columns** will be added, modified, or deleted?
- **Will this break** existing functionality?
- **Will this cause** data loss?
- **Are there foreign key** constraints that might fail?

**Risk Categories:**
- ✅ **SAFE**: Adding new tables, adding nullable columns, creating indexes
- ⚠️ **CAUTION**: Adding NOT NULL columns (needs default), adding constraints to existing data
- 🚨 **DANGEROUS**: Dropping columns/tables, changing column types, removing constraints

### Step 5: Confirm Before Push (CRITICAL)
- **NEVER** run `supabase db push` without explicit confirmation
- Present your risk assessment clearly
- Ask: "This change is [SAFE/CAUTION/DANGEROUS]. Should I apply it to your database?"
- Only proceed after explicit approval

### Step 6: Apply & Commit
After confirmation:
```bash
supabase db push
```
- Verify changes in Supabase dashboard
- Commit both schema files and migration to Git
- Test your application

## Example Workflow

### Adding a New Column

1. **Edit schema file**:
```sql
-- In supabase/schemas/03-projects.sql
ALTER TABLE projects ADD COLUMN new_field TEXT;
```

2. **Update main schema**:
```sql
-- In supabase/schema.sql
-- Add the new column to the projects table definition
```

3. **Generate migration**:
```bash
supabase db diff -f add_new_field_to_projects
```

4. **Review migration**:
```sql
-- Check the generated migration file
-- Ensure it's safe and correct
```

5. **Apply migration**:
```bash
supabase db push
```

## Troubleshooting

### Common Issues

1. **Migration conflicts**: Check for existing migrations that might conflict
2. **RLS policies**: Ensure policies are correctly defined
3. **Index performance**: Monitor query performance after changes
4. **Data integrity**: Verify foreign key constraints

### Recovery

If a migration fails:
1. Check the error message in the Supabase dashboard
2. Fix the issue in your schema files
3. Generate a new migration
4. Apply the corrected migration

## Resources

- [Supabase Declarative Database Schemas](https://supabase.com/docs/guides/local-development/declarative-database-schemas)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
