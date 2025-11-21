#!/usr/bin/env node

/**
 * Clerk Setup Verification Script
 * 
 * Run this after adding Clerk environment variables to verify your setup.
 * Usage: node check-clerk-setup.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking Clerk Setup...\n');

const envPath = path.join(__dirname, '.env.local');
let envContent = '';

// Check if .env.local exists
if (!fs.existsSync(envPath)) {
  console.error('❌ .env.local file not found!');
  console.log('\n📝 Create .env.local in the project root and add your Clerk keys.');
  process.exit(1);
}

// Read .env.local
try {
  envContent = fs.readFileSync(envPath, 'utf8');
} catch (error) {
  console.error('❌ Error reading .env.local:', error.message);
  process.exit(1);
}

// Check for required variables
const requiredVars = {
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY': {
    pattern: /^pk_(test|live)_/,
    description: 'Publishable key (starts with pk_test_ or pk_live_)',
  },
  'CLERK_SECRET_KEY': {
    pattern: /^sk_(test|live)_/,
    description: 'Secret key (starts with sk_test_ or sk_live_)',
  },
  'NEXT_PUBLIC_CLERK_SIGN_IN_URL': {
    pattern: /^\/sign-in$/,
    description: 'Sign-in URL (should be /sign-in)',
  },
  'NEXT_PUBLIC_CLERK_SIGN_UP_URL': {
    pattern: /^\/sign-up$/,
    description: 'Sign-up URL (should be /sign-up)',
  },
  'NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL': {
    pattern: /^\/dashboard$/,
    description: 'Sign-in redirect (should be /dashboard)',
  },
  'NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL': {
    pattern: /^\/onboarding$/,
    description: 'Sign-up redirect (should be /onboarding)',
  },
};

let allValid = true;
const results = [];

// Check each variable
for (const [varName, config] of Object.entries(requiredVars)) {
  const regex = new RegExp(`^${varName}=(.+)$`, 'm');
  const match = envContent.match(regex);
  
  if (!match) {
    console.log(`❌ ${varName}: Missing`);
    results.push({ name: varName, status: 'missing' });
    allValid = false;
  } else {
    const value = match[1].trim();
    if (config.pattern.test(value)) {
      console.log(`✅ ${varName}: Valid`);
      results.push({ name: varName, status: 'valid', value: value.substring(0, 20) + '...' });
    } else {
      console.log(`⚠️  ${varName}: Invalid format`);
      console.log(`   Expected: ${config.description}`);
      console.log(`   Got: ${value.substring(0, 30)}...`);
      results.push({ name: varName, status: 'invalid', value: value.substring(0, 20) + '...' });
      allValid = false;
    }
  }
}

console.log('\n' + '='.repeat(60));

if (allValid) {
  console.log('\n✅ All Clerk environment variables are configured correctly!');
  console.log('\n📋 Next steps:');
  console.log('   1. Verify session token is configured in Clerk Dashboard');
  console.log('   2. Clear Next.js cache: rm -rf .next');
  console.log('   3. Restart dev server: npm run dev');
  console.log('   4. Test signup flow at http://localhost:3000/sign-up');
} else {
  console.log('\n❌ Some environment variables are missing or invalid.');
  console.log('\n📋 To fix:');
  console.log('   1. Open .env.local in the project root');
  console.log('   2. Add the missing or fix the invalid variables');
  console.log('   3. Get your keys from: https://dashboard.clerk.com/');
  console.log('   4. See: src/docs/auth-flow/CLERK_SETUP_STEPS.md for detailed instructions');
}

console.log('\n' + '='.repeat(60));

process.exit(allValid ? 0 : 1);

