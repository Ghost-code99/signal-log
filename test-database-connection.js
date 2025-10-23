// Quick Database Connection Test Script
// Run this with: node test-database-connection.js

const { createClient } = require('@supabase/supabase-js')

// Your Supabase credentials
const supabaseUrl = 'https://sbvxiljjfolgmpycabep.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNidnhpbGpqZm9sZ21weWNhYmVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMDUzMTIsImV4cCI6MjA3Njc4MTMxMn0.6xt-RAwi8btnjvC6CY4w6uPUxus0PJr90xamcha88sY'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testDatabaseConnection() {
  console.log('🔍 Testing Supabase Database Connection...\n')

  try {
    // Test 1: Projects table access
    console.log('1. Testing projects table access...')
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('count')
      .limit(1)

    if (projectsError) {
      console.error('❌ Projects table access failed:', projectsError.message)
      return false
    }
    console.log('✅ Projects table accessible')

    // Test 2: Users table access
    console.log('\n2. Testing users table access...')
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('count')
      .limit(1)

    if (usersError) {
      console.error('❌ Users table access failed:', usersError.message)
      return false
    }
    console.log('✅ Users table accessible')

    // Test 3: Ideas table access
    console.log('\n3. Testing ideas table access...')
    const { data: ideas, error: ideasError } = await supabase
      .from('ideas')
      .select('count')
      .limit(1)

    if (ideasError) {
      console.error('❌ Ideas table access failed:', ideasError.message)
      return false
    }
    console.log('✅ Ideas table accessible')

    // Test 4: AI interactions table access
    console.log('\n4. Testing AI interactions table access...')
    const { data: aiInteractions, error: aiError } = await supabase
      .from('ai_interactions')
      .select('count')
      .limit(1)

    if (aiError) {
      console.error('❌ AI interactions table access failed:', aiError.message)
      return false
    }
    console.log('✅ AI interactions table accessible')

    // Test 5: Health metrics table access
    console.log('\n5. Testing health metrics table access...')
    const { data: healthMetrics, error: healthError } = await supabase
      .from('project_health_metrics')
      .select('count')
      .limit(1)

    if (healthError) {
      console.error('❌ Health metrics table access failed:', healthError.message)
      return false
    }
    console.log('✅ Health metrics table accessible')

    // Test 6: Project tags table access
    console.log('\n6. Testing project tags table access...')
    const { data: projectTags, error: tagsError } = await supabase
      .from('project_tags')
      .select('count')
      .limit(1)

    if (tagsError) {
      console.error('❌ Project tags table access failed:', tagsError.message)
      return false
    }
    console.log('✅ Project tags table accessible')

    console.log('\n🎉 All database tests passed!')
    console.log('\n📋 Next steps:')
    console.log('1. Go to http://localhost:3000/test-connection')
    console.log('2. Sign in to your account')
    console.log('3. Run the full test suite at http://localhost:3000/test-database')
    console.log('4. Test data persistence at http://localhost:3000/test-persistence')

    return true

  } catch (error) {
    console.error('❌ Database connection test failed:', error.message)
    return false
  }
}

// Run the test
testDatabaseConnection()
  .then(success => {
    if (success) {
      console.log('\n✅ Database connection is working correctly!')
      process.exit(0)
    } else {
      console.log('\n❌ Database connection has issues that need to be fixed.')
      process.exit(1)
    }
  })
  .catch(error => {
    console.error('\n💥 Unexpected error:', error)
    process.exit(1)
  })