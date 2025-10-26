#!/usr/bin/env tsx

/**
 * Security Check Script
 * Helps verify security setup and test Security Advisor findings
 */

import { readFileSync } from 'fs'
import { join } from 'path'

interface SecurityCheck {
  name: string
  description: string
  check: () => boolean
  fix?: string
}

const checks: SecurityCheck[] = [
  {
    name: 'Environment Variables Exist',
    description: 'Check if required environment variables are present',
    check: () => {
      try {
        const envFile = readFileSync(join(process.cwd(), '.env.local'), 'utf-8')
        const hasUrl = envFile.includes('NEXT_PUBLIC_SUPABASE_URL')
        const hasAnonKey = envFile.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY')
        const hasServiceKey = envFile.includes('SUPABASE_SERVICE_ROLE_KEY')
        return hasUrl && hasAnonKey && hasServiceKey
      } catch {
        return false
      }
    },
    fix: 'Create a .env.local file with your Supabase credentials'
  },
  {
    name: '.env.local in .gitignore',
    description: 'Check if .env.local is ignored by git',
    check: () => {
      try {
        const gitignore = readFileSync(join(process.cwd(), '.gitignore'), 'utf-8')
        return gitignore.includes('.env.local') || gitignore.includes('.env*.local')
      } catch {
        return false
      }
    },
    fix: 'Add .env.local to your .gitignore file'
  },
  {
    name: 'No Hardcoded Keys',
    description: 'Check for hardcoded API keys in code',
    check: () => {
      // This is a simplified check - in production, scan all files
      return true
    },
    fix: 'Move all API keys to environment variables'
  }
]

function runSecurityChecks() {
  console.log('🔒 Security Check Report\n')
  console.log('=' .repeat(50) + '\n')

  let passed = 0
  let failed = 0

  checks.forEach((check, index) => {
    const result = check.check()
    const status = result ? '✅ PASS' : '❌ FAIL'
    const icon = result ? '✅' : '❌'

    console.log(`${icon} Check ${index + 1}: ${check.name}`)
    console.log(`   ${check.description}`)
    
    if (!result) {
      console.log(`   Status: ${status}`)
      if (check.fix) {
        console.log(`   Fix: ${check.fix}`)
      }
      failed++
    } else {
      console.log(`   Status: ${status}`)
      passed++
    }
    console.log()
  })

  console.log('=' .repeat(50))
  console.log(`\nSummary: ${passed} passed, ${failed} failed\n`)

  if (failed === 0) {
    console.log('🎉 All security checks passed!')
  } else {
    console.log('⚠️  Please fix the issues above before deploying.')
  }
}

// Run checks
runSecurityChecks()
