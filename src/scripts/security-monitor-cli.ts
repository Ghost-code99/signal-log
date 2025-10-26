#!/usr/bin/env tsx

/**
 * Security Monitoring CLI
 * Run security checks and generate reports
 */

import { securityMonitor } from '../lib/security-monitoring'

async function main() {
  const args = process.argv.slice(2)
  const command = args[0]

  switch (command) {
    case 'check':
      console.log('🔍 Running security check...\n')
      await securityMonitor.performSecurityCheck()
      break

    case 'report':
      console.log('📊 Generating security report...\n')
      const report = await securityMonitor.generateReport()
      console.log(report)
      break

    case 'trends':
      console.log('📈 Security trends:\n')
      const trends = securityMonitor.getSecurityTrends()
      console.table(trends)
      break

    case 'alerts':
      console.log('🔔 Active alerts:\n')
      const alerts = securityMonitor.getActiveAlerts()
      if (alerts.length === 0) {
        console.log('✅ No active alerts')
      } else {
        alerts.forEach(alert => {
          console.log(`- ${alert.title} (${alert.severity})`)
          console.log(`  ${alert.message}\n`)
        })
      }
      break

    case 'start':
      console.log('▶️  Starting security monitoring...\n')
      securityMonitor.startMonitoring()
      console.log('✅ Monitoring started (interval: 1 hour)')
      break

    case 'stop':
      console.log('⏹️  Stopping security monitoring...\n')
      securityMonitor.stopMonitoring()
      console.log('✅ Monitoring stopped')
      break

    default:
      console.log(`
Security Monitoring CLI

Usage: npm run security:monitor <command>

Commands:
  check    - Run a security check
  report   - Generate security report
  trends   - Show security trends
  alerts   - Show active alerts
  start    - Start automated monitoring
  stop     - Stop automated monitoring

Examples:
  npm run security:monitor check
  npm run security:monitor report
  npm run security:monitor trends
      `)
      process.exit(1)
  }
}

main().catch(console.error)
