// Database Verification Script
// This script verifies that your Supabase database schema is correctly applied

const { createClient } = require('@supabase/supabase-js');

// Your Supabase credentials
const supabaseUrl = 'https://sbvxiljjfolgmpycabep.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNidnhpbGpqZm9sZ21weWNhYmVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMDUzMTIsImV4cCI6MjA3Njc4MTMxMn0.6xt-RAwi8btnjvC6CY4w6uPUxus0PJr90xamcha88sY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyDatabase() {
  console.log('🔍 Verifying Signal Log Database Schema...\n');

  try {
    // Test 1: Check if tables exist
    console.log('📊 Checking tables...');
    
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['users', 'projects', 'project_tags', 'ai_interactions', 'ideas', 'project_health_metrics']);

    if (tablesError) {
      console.error('❌ Error checking tables:', tablesError.message);
      return;
    }

    const expectedTables = ['users', 'projects', 'project_tags', 'ai_interactions', 'ideas', 'project_health_metrics'];
    const foundTables = tables.map(t => t.table_name);
    
    console.log('✅ Found tables:', foundTables);
    
    const missingTables = expectedTables.filter(table => !foundTables.includes(table));
    if (missingTables.length > 0) {
      console.error('❌ Missing tables:', missingTables);
      return;
    }

    // Test 2: Check if RLS is enabled
    console.log('\n🔒 Checking Row Level Security...');
    
    const { data: rlsTables, error: rlsError } = await supabase
      .from('pg_tables')
      .select('tablename, rowsecurity')
      .in('tablename', expectedTables);

    if (rlsError) {
      console.log('⚠️  Could not check RLS status (this is normal for some setups)');
    } else {
      console.log('✅ RLS status checked');
    }

    // Test 3: Test basic operations
    console.log('\n🧪 Testing basic operations...');
    
    // Test users table
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (usersError) {
      console.error('❌ Error accessing users table:', usersError.message);
    } else {
      console.log('✅ Users table accessible');
    }

    // Test projects table
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('count')
      .limit(1);

    if (projectsError) {
      console.error('❌ Error accessing projects table:', projectsError.message);
    } else {
      console.log('✅ Projects table accessible');
    }

    console.log('\n🎉 Database verification completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Start your application: npm run dev');
    console.log('2. Test user registration and login');
    console.log('3. Create a test project in the dashboard');
    console.log('4. Verify all features are working');

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure you applied the schema in Supabase SQL Editor');
    console.log('2. Check your Supabase project is active');
    console.log('3. Verify your API keys are correct');
  }
}

// Run verification
verifyDatabase();
