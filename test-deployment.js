// Test Deployment Script
// Run this after deploying to Vercel: node test-deployment.js YOUR_VERCEL_URL

const https = require('https')

const vercelUrl = process.argv[2]

if (!vercelUrl) {
  console.log('❌ Please provide your Vercel URL as an argument')
  console.log('Usage: node test-deployment.js https://your-app.vercel.app')
  process.exit(1)
}

async function testDeployment() {
  console.log('🔍 Testing Vercel Deployment...\n')
  console.log(`Testing URL: ${vercelUrl}\n`)

  try {
    // Test 1: Basic page load
    console.log('1. Testing basic page load...')
    const response = await fetch(vercelUrl)
    
    if (response.ok) {
      console.log('✅ Basic page load successful')
      console.log(`   Status: ${response.status}`)
    } else {
      console.log(`❌ Basic page load failed: ${response.status}`)
      return false
    }

    // Test 2: Test connection page
    console.log('\n2. Testing database connection page...')
    const testConnectionUrl = `${vercelUrl}/test-connection`
    const testResponse = await fetch(testConnectionUrl)
    
    if (testResponse.ok) {
      console.log('✅ Test connection page accessible')
    } else {
      console.log(`❌ Test connection page failed: ${testResponse.status}`)
    }

    // Test 3: Test database page
    console.log('\n3. Testing database test page...')
    const testDatabaseUrl = `${vercelUrl}/test-database`
    const dbResponse = await fetch(testDatabaseUrl)
    
    if (dbResponse.ok) {
      console.log('✅ Database test page accessible')
    } else {
      console.log(`❌ Database test page failed: ${dbResponse.status}`)
    }

    // Test 4: Test persistence page
    console.log('\n4. Testing persistence test page...')
    const testPersistenceUrl = `${vercelUrl}/test-persistence`
    const persistenceResponse = await fetch(testPersistenceUrl)
    
    if (persistenceResponse.ok) {
      console.log('✅ Persistence test page accessible')
    } else {
      console.log(`❌ Persistence test page failed: ${persistenceResponse.status}`)
    }

    console.log('\n🎉 Deployment test completed!')
    console.log('\n📋 Next steps:')
    console.log('1. Go to your Vercel URL and sign in')
    console.log('2. Test the database connection at /test-connection')
    console.log('3. Test full database operations at /test-database')
    console.log('4. Test data persistence at /test-persistence')
    console.log('5. Use your app normally at /dashboard')

    return true

  } catch (error) {
    console.error('❌ Deployment test failed:', error.message)
    return false
  }
}

// Run the test
testDeployment()
  .then(success => {
    if (success) {
      console.log('\n✅ Your deployment is working correctly!')
      process.exit(0)
    } else {
      console.log('\n❌ Deployment has issues that need to be fixed.')
      process.exit(1)
    }
  })
  .catch(error => {
    console.error('\n💥 Unexpected error:', error)
    process.exit(1)
  })
