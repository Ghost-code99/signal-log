// Security Monitoring and Alerting System
// Automated security checks, alerting, and progress tracking

import { securityAdvisor, SecurityFinding } from './supabase-security-advisor'

export interface SecurityAlert {
  id: string
  type: 'critical' | 'warning' | 'info'
  title: string
  message: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  timestamp: Date
  resolved: boolean
  actionUrl?: string
}

export interface SecurityMetrics {
  score: number
  previousScore: number
  trend: 'improving' | 'declining' | 'stable'
  totalFindings: number
  criticalFindings: number
  highFindings: number
  mediumFindings: number
  lowFindings: number
  lastChecked: Date
  checksPerformed: number
}

export interface SecurityTrend {
  date: Date
  score: number
  findings: number
}

export class SecurityMonitor {
  private static instance: SecurityMonitor
  private alerts: SecurityAlert[] = []
  private metrics: SecurityMetrics[] = []
  private checkInterval: NodeJS.Timeout | null = null
  private readonly CHECK_INTERVAL = 3600000 // 1 hour

  static getInstance(): SecurityMonitor {
    if (!SecurityMonitor.instance) {
      SecurityMonitor.instance = new SecurityMonitor()
    }
    return SecurityMonitor.instance
  }

  /**
   * Start automated security monitoring
   */
  startMonitoring(intervalMs: number = this.CHECK_INTERVAL): void {
    if (this.checkInterval) {
      console.log('Monitoring already started')
      return
    }

    console.log(`Starting security monitoring (interval: ${intervalMs / 1000}s)`)
    
    // Run initial check
    this.performSecurityCheck()
    
    // Schedule recurring checks
    this.checkInterval = setInterval(() => {
      this.performSecurityCheck()
    }, intervalMs)
  }

  /**
   * Stop automated monitoring
   */
  stopMonitoring(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
      this.checkInterval = null
      console.log('Security monitoring stopped')
    }
  }

  /**
   * Perform a security check
   */
  async performSecurityCheck(): Promise<SecurityMetrics> {
    console.log('Performing security check...')
    
    try {
      const score = await securityAdvisor.getSecurityScore()
      const findings = await securityAdvisor.scanSecurityIssues()
      
      const metrics: SecurityMetrics = {
        score: score.overallScore,
        previousScore: this.getLastScore(),
        trend: this.calculateTrend(score.overallScore),
        totalFindings: score.totalFindings,
        criticalFindings: score.criticalFindings,
        highFindings: score.highFindings,
        mediumFindings: score.mediumFindings,
        lowFindings: score.lowFindings,
        lastChecked: new Date(),
        checksPerformed: this.metrics.length + 1
      }

      this.metrics.push(metrics)

      // Check for alert conditions
      const alerts = this.checkAlertConditions(score, findings)
      this.alerts.push(...alerts)

      // Send notifications if needed
      await this.sendNotifications(alerts)

      // Log summary
      this.logSecuritySummary(metrics)

      return metrics
    } catch (error) {
      console.error('Error performing security check:', error)
      throw error
    }
  }

  /**
   * Check for alert conditions
   */
  private checkAlertConditions(score: any, findings: SecurityFinding[]): SecurityAlert[] {
    const alerts: SecurityAlert[] = []

    // Critical score threshold
    if (score.overallScore < 60) {
      alerts.push({
        id: `alert-${Date.now()}-1`,
        type: 'critical',
        title: 'Security Score Critical',
        message: `Security score is dangerously low: ${score.overallScore}/100. Immediate action required.`,
        severity: 'critical',
        timestamp: new Date(),
        resolved: false,
        actionUrl: '/security-advisor'
      })
    }

    // New critical findings
    const criticalFindings = findings.filter(f => f.severity === 'critical' && !f.resolved)
    if (criticalFindings.length > 0) {
      alerts.push({
        id: `alert-${Date.now()}-2`,
        type: 'critical',
        title: `${criticalFindings.length} Critical Finding(s) Detected`,
        message: `Found ${criticalFindings.length} critical security issues that need immediate attention.`,
        severity: 'critical',
        timestamp: new Date(),
        resolved: false,
        actionUrl: '/security-advisor'
      })
    }

    // Score dropped significantly
    const lastScore = this.getLastScore()
    if (lastScore > 0 && score.overallScore < lastScore - 10) {
      alerts.push({
        id: `alert-${Date.now()}-3`,
        type: 'warning',
        title: 'Security Score Decreased',
        message: `Security score dropped from ${lastScore} to ${score.overallScore}. Review recent changes.`,
        severity: 'high',
        timestamp: new Date(),
        resolved: false,
        actionUrl: '/security-advisor'
      })
    }

    return alerts
  }

  /**
   * Send notifications
   */
  private async sendNotifications(alerts: SecurityAlert[]): Promise<void> {
    if (alerts.length === 0) return

    // In production, you would integrate with:
    // - Slack webhooks
    // - Email services
    // - PagerDuty
    // - Discord notifications

    alerts.forEach(alert => {
      if (alert.severity === 'critical' || alert.severity === 'high') {
        console.warn(`🚨 ${alert.type.toUpperCase()}: ${alert.title}`)
        console.warn(`   ${alert.message}`)
      }
    })

    // Example: Send to browser console (development)
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      alerts.forEach(alert => {
        console.group(`🔔 Security Alert: ${alert.title}`)
        console.log(alert.message)
        if (alert.actionUrl) {
          console.log(`Action: ${alert.actionUrl}`)
        }
        console.groupEnd()
      })
    }
  }

  /**
   * Log security summary
   */
  private logSecuritySummary(metrics: SecurityMetrics): void {
    const trendIcon = metrics.trend === 'improving' ? '📈' : 
                      metrics.trend === 'declining' ? '📉' : '➡️'
    
    console.log(`
═══════════════════════════════════════════════════════
🔒 Security Check Summary
═══════════════════════════════════════════════════════
Score: ${metrics.score}/100 ${trendIcon}
Previous: ${metrics.previousScore}/100
Findings: ${metrics.totalFindings} (${metrics.criticalFindings} critical, ${metrics.highFindings} high)
Last checked: ${metrics.lastChecked.toLocaleString()}
Total checks: ${metrics.checksPerformed}
═══════════════════════════════════════════════════════
    `)
  }

  /**
   * Get last security score
   */
  private getLastScore(): number {
    if (this.metrics.length === 0) return 0
    return this.metrics[this.metrics.length - 1].score
  }

  /**
   * Calculate trend
   */
  private calculateTrend(currentScore: number): 'improving' | 'declining' | 'stable' {
    const lastScore = this.getLastScore()
    if (lastScore === 0) return 'stable'
    
    const diff = currentScore - lastScore
    if (diff > 2) return 'improving'
    if (diff < -2) return 'declining'
    return 'stable'
  }

  /**
   * Get recent metrics
   */
  getRecentMetrics(days: number = 30): SecurityMetrics[] {
    const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000)
    return this.metrics.filter(m => m.lastChecked.getTime() > cutoff)
  }

  /**
   * Get security trends
   */
  getSecurityTrends(): SecurityTrend[] {
    return this.metrics.map(m => ({
      date: m.lastChecked,
      score: m.score,
      findings: m.totalFindings
    }))
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(): SecurityAlert[] {
    return this.alerts.filter(a => !a.resolved)
  }

  /**
   * Mark alert as resolved
   */
  resolveAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId)
    if (alert) {
      alert.resolved = true
    }
  }

  /**
   * Get security summary report
   */
  async generateReport(): Promise<string> {
    const latestMetrics = this.metrics[this.metrics.length - 1]
    const trends = this.getSecurityTrends()
    const activeAlerts = this.getActiveAlerts()

    return `
# Security Monitoring Report
Generated: ${new Date().toISOString()}

## Current Status
- **Security Score**: ${latestMetrics?.score || 'N/A'}/100
- **Total Findings**: ${latestMetrics?.totalFindings || 0}
- **Critical Findings**: ${latestMetrics?.criticalFindings || 0}
- **Active Alerts**: ${activeAlerts.length}

## Trend Analysis
${trends.length > 0 ? `
- Initial Score: ${trends[0].score}/100
- Current Score: ${trends[trends.length - 1].score}/100
- Change: ${trends[trends.length - 1].score - trends[0].score > 0 ? '+' : ''}${trends[trends.length - 1].score - trends[0].score}
- Checks Performed: ${trends.length}
` : 'No historical data available'}

## Active Alerts
${activeAlerts.length > 0 ? activeAlerts.map(a => `
- **${a.title}** (${a.severity})
  ${a.message}
`).join('') : 'No active alerts'}

## Recommendations
${latestMetrics && latestMetrics.score < 80 ? `
⚠️ Security score below 80. Focus on:
1. Resolve critical findings immediately
2. Address high-priority issues
3. Implement recommended security measures
` : '✅ Security score is healthy. Continue monitoring.'}

---
Report generated by Security Monitoring System
    `.trim()
  }
}

// Export singleton instance
export const securityMonitor = SecurityMonitor.getInstance()

// Auto-start monitoring in development (can be disabled)
if (process.env.NODE_ENV === 'development' && typeof window === 'undefined') {
  // Start with 1 hour interval in development
  // securityMonitor.startMonitoring(3600000)
}
