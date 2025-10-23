# Supabase Setup Guide for Multi-Project Dashboard

## Step 1: Environment Variables Setup

1. Create a `.env.local` file in your project root with:
```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-publishable-key-here
SUPABASE_SERVICE_ROLE_KEY=your-secret-key-here
```

2. Replace the placeholder values with your actual Supabase credentials from your dashboard.

## Step 2: Database Schema Setup

1. Go to your Supabase dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Run the contents of `database-schema.sql` to create all tables
4. Run the contents of `rls-policies.sql` to set up security policies

## Step 3: Authentication Setup

1. In your Supabase dashboard, go to **Authentication** > **Settings**
2. Configure your site URL (e.g., `http://localhost:3000` for development)
3. Enable email authentication
4. Optionally configure OAuth providers (Google, GitHub, etc.)

## Step 4: Test Your Connection

Your existing `lib/supabase.ts` file is already configured correctly. You can test the connection by:

1. Starting your development server: `npm run dev`
2. Visiting your app and checking the browser console for any Supabase connection errors

## Database Schema Overview

### Core Tables:
- **users**: Solo founders using the dashboard
- **projects**: Individual initiatives/experiments
- **project_tags**: Categorization system
- **ai_interactions**: AI-powered analysis and suggestions
- **ideas**: Captured thoughts and insights
- **project_health_metrics**: Health scoring and indicators

### Key Features:
- Row Level Security (RLS) ensures users only see their own data
- Automatic timestamps with triggers
- JSONB fields for flexible metadata storage
- Optimized indexes for performance

## Next Steps

Once your database is set up, you can:
1. Test the connection with your existing components
2. Implement user authentication
3. Build the project management features
4. Integrate AI-powered analysis

Your Supabase client is already configured in `lib/supabase.ts` and ready to use!
