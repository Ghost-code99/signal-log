#!/usr/bin/env tsx

/**
 * Comprehensive Test Runner
 * Runs all tests with proper setup and reporting
 */

import { execSync } from 'child_process'
import { existsSync } from 'fs'
import path from 'path'

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
}

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function runCommand(command: string, description: string) {
  log(`\n${colors.bold}${colors.blue}Running: ${description}${colors.reset}`)
  log(`Command: ${command}`)
  
  try {
    const output = execSync(command, { 
      stdio: 'inherit',
      cwd: process.cwd()
    })
    log(`✅ ${description} completed successfully`, 'green')
    return true
  } catch (error) {
    log(`❌ ${description} failed`, 'red')
    console.error(error)
    return false
  }
}

function checkEnvironment() {
  log('🔍 Checking environment...', 'blue')
  
  const requiredFiles = [
    'package.json',
    'vitest.config.ts',
    'src/test/setup.ts'
  ]
  
  for (const file of requiredFiles) {
    if (!existsSync(file)) {
      log(`❌ Required file missing: ${file}`, 'red')
      return false
    }
  }
  
  log('✅ Environment check passed', 'green')
  return true
}

function runTests() {
  log('🧪 Starting comprehensive test suite...', 'blue')
  
  if (!checkEnvironment()) {
    process.exit(1)
  }
  
  const testSuites = [
    {
      command: 'npm run test:unit',
      description: 'Unit Tests',
      required: false
    },
    {
      command: 'npm run test:integration',
      description: 'Integration Tests', 
      required: false
    },
    {
      command: 'npm run test:components',
      description: 'Component Tests',
      required: false
    },
    {
      command: 'npm run test:api',
      description: 'API Route Tests',
      required: false
    },
    {
      command: 'npm run test:coverage',
      description: 'Coverage Report',
      required: false
    }
  ]
  
  const results = testSuites.map(suite => ({
    ...suite,
    success: runCommand(suite.command, suite.description)
  }))
  
  // Summary
  log('\n📊 Test Results Summary:', 'bold')
  const passed = results.filter(r => r.success).length
  const total = results.length
  
  results.forEach(result => {
    const status = result.success ? '✅' : '❌'
    log(`${status} ${result.description}`, result.success ? 'green' : 'red')
  })
  
  log(`\nOverall: ${passed}/${total} test suites passed`, 
    passed === total ? 'green' : 'yellow')
  
  if (passed < total) {
    log('\n💡 Some tests failed. Check the output above for details.', 'yellow')
    process.exit(1)
  }
  
  log('\n🎉 All tests passed!', 'green')
}

function runSpecificTest(testPattern: string) {
  log(`🎯 Running specific test: ${testPattern}`, 'blue')
  
  const command = `npx vitest run --reporter=verbose ${testPattern}`
  runCommand(command, `Specific Test: ${testPattern}`)
}

function runWatchMode() {
  log('👀 Starting watch mode...', 'blue')
  
  const command = 'npx vitest --watch'
  runCommand(command, 'Watch Mode')
}

// Main execution
const args = process.argv.slice(2)

if (args.includes('--help') || args.includes('-h')) {
  log('Test Runner Options:', 'bold')
  log('  npm run test              - Run all tests')
  log('  npm run test:watch        - Run tests in watch mode')
  log('  npm run test:unit         - Run unit tests only')
  log('  npm run test:integration  - Run integration tests only')
  log('  npm run test:components   - Run component tests only')
  log('  npm run test:api          - Run API tests only')
  log('  npm run test:coverage     - Run tests with coverage')
  log('  npm run test:auth         - Run authentication tests')
  log('  npm run test:ai           - Run AI feature tests')
  process.exit(0)
}

if (args.includes('--watch') || args.includes('-w')) {
  runWatchMode()
} else if (args.length > 0) {
  runSpecificTest(args.join(' '))
} else {
  runTests()
}
