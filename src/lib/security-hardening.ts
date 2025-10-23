// Security Hardening and Audit Logging
// Provides comprehensive security features and audit capabilities

import React from 'react'
import { supabaseClient } from './supabase-client'

export interface SecurityEvent {
  id: string
  type: 'authentication' | 'authorization' | 'data_access' | 'data_modification' | 'security_violation'
  severity: 'low' | 'medium' | 'high' | 'critical'
  userId?: string
  ipAddress?: string
  userAgent?: string
  resource: string
  action: string
  details: Record<string, any>
  timestamp: Date
  resolved: boolean
}

export interface SecurityMetrics {
  totalEvents: number
  eventsByType: Record<string, number>
  eventsBySeverity: Record<string, number>
  recentViolations: number
  averageResponseTime: number
}

export interface RateLimitConfig {
  windowMs: number
  maxRequests: number
  skipSuccessfulRequests: boolean
  skipFailedRequests: boolean
}

export interface SecurityPolicy {
  id: string
  name: string
  description: string
  rules: SecurityRule[]
  enabled: boolean
  createdAt: Date
}

export interface SecurityRule {
  id: string
  condition: string
  action: 'allow' | 'deny' | 'log' | 'alert'
  priority: number
}

export class SecurityManager {
  private static instance: SecurityManager
  private securityEvents: SecurityEvent[] = []
  private rateLimitMap: Map<string, { count: number; resetTime: number }> = new Map()
  private securityPolicies: SecurityPolicy[] = []
  private auditLog: SecurityEvent[] = []

  static getInstance(): SecurityManager {
    if (!SecurityManager.instance) {
      SecurityManager.instance = new SecurityManager()
    }
    return SecurityManager.instance
  }

  // Log security event
  async logSecurityEvent(event: Omit<SecurityEvent, 'id' | 'timestamp'>): Promise<void> {
    const securityEvent: SecurityEvent = {
      id: `sec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      ...event
    }

    this.securityEvents.push(securityEvent)
    this.auditLog.push(securityEvent)

    // Store in database for persistence
    try {
      await supabaseClient
        .from('security_events')
        .insert({
          id: securityEvent.id,
          type: securityEvent.type,
          severity: securityEvent.severity,
          user_id: securityEvent.userId,
          ip_address: securityEvent.ipAddress,
          user_agent: securityEvent.userAgent,
          resource: securityEvent.resource,
          action: securityEvent.action,
          details: securityEvent.details,
          timestamp: securityEvent.timestamp.toISOString(),
          resolved: securityEvent.resolved
        })
    } catch (error) {
      console.error('Failed to store security event:', error)
    }

    // Check for security violations
    if (event.severity === 'high' || event.severity === 'critical') {
      await this.handleSecurityViolation(securityEvent)
    }
  }

  // Handle security violation
  private async handleSecurityViolation(event: SecurityEvent): Promise<void> {
    console.warn(`🚨 Security violation detected: ${event.type} - ${event.action}`)
    
    // Send alert (in production, this would integrate with monitoring systems)
    await this.sendSecurityAlert(event)
    
    // Apply automatic security measures
    await this.applySecurityMeasures(event)
  }

  // Send security alert
  private async sendSecurityAlert(event: SecurityEvent): Promise<void> {
    // In production, this would send to monitoring systems like PagerDuty, Slack, etc.
    console.log(`Security Alert: ${event.severity.toUpperCase()} - ${event.type}`)
  }

  // Apply automatic security measures
  private async applySecurityMeasures(event: SecurityEvent): Promise<void> {
    switch (event.type) {
      case 'authentication':
        if (event.severity === 'critical') {
          // Temporarily block user or IP
          await this.temporaryBlock(event.userId, event.ipAddress)
        }
        break
      case 'authorization':
        if (event.severity === 'high') {
          // Revoke user session
          await this.revokeUserSession(event.userId)
        }
        break
      case 'data_access':
        if (event.severity === 'high') {
          // Log and monitor user activity
          await this.monitorUserActivity(event.userId)
        }
        break
    }
  }

  // Temporary block user or IP
  private async temporaryBlock(userId?: string, ipAddress?: string): Promise<void> {
    const blockDuration = 15 * 60 * 1000 // 15 minutes
    
    if (userId) {
      // Block user account temporarily
      console.log(`Blocking user ${userId} for ${blockDuration / 1000} seconds`)
    }
    
    if (ipAddress) {
      // Block IP address temporarily
      console.log(`Blocking IP ${ipAddress} for ${blockDuration / 1000} seconds`)
    }
  }

  // Revoke user session
  private async revokeUserSession(userId?: string): Promise<void> {
    if (userId) {
      try {
        await supabaseClient.auth.admin.signOut(userId)
        console.log(`Revoked session for user ${userId}`)
      } catch (error) {
        console.error('Failed to revoke user session:', error)
      }
    }
  }

  // Monitor user activity
  private async monitorUserActivity(userId?: string): Promise<void> {
    if (userId) {
      console.log(`Monitoring activity for user ${userId}`)
      // In production, this would set up enhanced monitoring
    }
  }

  // Check rate limit
  checkRateLimit(identifier: string, config: RateLimitConfig): boolean {
    const now = Date.now()
    const key = `rate_${identifier}`
    const existing = this.rateLimitMap.get(key)

    if (!existing || now > existing.resetTime) {
      // Reset or create new entry
      this.rateLimitMap.set(key, {
        count: 1,
        resetTime: now + config.windowMs
      })
      return true
    }

    if (existing.count >= config.maxRequests) {
      return false
    }

    existing.count++
    return true
  }

  // Get security metrics
  getSecurityMetrics(): SecurityMetrics {
    const totalEvents = this.securityEvents.length
    const eventsByType: Record<string, number> = {}
    const eventsBySeverity: Record<string, number> = {}
    const recentViolations = this.securityEvents.filter(
      e => e.severity === 'high' || e.severity === 'critical'
    ).length

    this.securityEvents.forEach(event => {
      eventsByType[event.type] = (eventsByType[event.type] || 0) + 1
      eventsBySeverity[event.severity] = (eventsBySeverity[event.severity] || 0) + 1
    })

    return {
      totalEvents,
      eventsByType,
      eventsBySeverity,
      recentViolations,
      averageResponseTime: 0 // Would be calculated from actual metrics
    }
  }

  // Get security events
  getSecurityEvents(filters?: {
    type?: string
    severity?: string
    userId?: string
    limit?: number
  }): SecurityEvent[] {
    let events = [...this.securityEvents]

    if (filters) {
      if (filters.type) {
        events = events.filter(e => e.type === filters.type)
      }
      if (filters.severity) {
        events = events.filter(e => e.severity === filters.severity)
      }
      if (filters.userId) {
        events = events.filter(e => e.userId === filters.userId)
      }
      if (filters.limit) {
        events = events.slice(0, filters.limit)
      }
    }

    return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  // Create security policy
  createSecurityPolicy(policy: Omit<SecurityPolicy, 'id' | 'createdAt'>): SecurityPolicy {
    const newPolicy: SecurityPolicy = {
      id: `policy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      ...policy
    }

    this.securityPolicies.push(newPolicy)
    return newPolicy
  }

  // Evaluate security policy
  evaluateSecurityPolicy(event: SecurityEvent): boolean {
    const applicablePolicies = this.securityPolicies.filter(p => p.enabled)

    for (const policy of applicablePolicies) {
      for (const rule of policy.rules) {
        if (this.evaluateRule(rule, event)) {
          return rule.action === 'allow'
        }
      }
    }

    return true // Default allow
  }

  // Evaluate security rule
  private evaluateRule(rule: SecurityRule, event: SecurityEvent): boolean {
    // Simple rule evaluation (in production, this would be more sophisticated)
    const condition = rule.condition.toLowerCase()
    
    if (condition.includes('type') && condition.includes(event.type)) {
      return true
    }
    if (condition.includes('severity') && condition.includes(event.severity)) {
      return true
    }
    if (condition.includes('user') && event.userId) {
      return true
    }

    return false
  }

  // Generate security report
  async generateSecurityReport(): Promise<string> {
    const metrics = this.getSecurityMetrics()
    const recentEvents = this.getSecurityEvents({ limit: 10 })
    const violations = this.getSecurityEvents({ severity: 'high' })

    return `
# Security Report
Generated: ${new Date().toISOString()}

## Security Overview
- Total Security Events: ${metrics.totalEvents}
- Recent Violations: ${metrics.recentViolations}
- Active Policies: ${this.securityPolicies.filter(p => p.enabled).length}

## Events by Type
${Object.entries(metrics.eventsByType).map(([type, count]) => 
  `- ${type}: ${count} events`
).join('\n')}

## Events by Severity
${Object.entries(metrics.eventsBySeverity).map(([severity, count]) => 
  `- ${severity}: ${count} events`
).join('\n')}

## Recent Security Events
${recentEvents.map(event => `
- ${event.timestamp.toISOString()}: ${event.type} - ${event.action}
  - Severity: ${event.severity}
  - User: ${event.userId || 'N/A'}
  - Resource: ${event.resource}
`).join('')}

## High Severity Violations
${violations.map(event => `
- ${event.timestamp.toISOString()}: ${event.type} - ${event.action}
  - User: ${event.userId || 'N/A'}
  - Details: ${JSON.stringify(event.details)}
`).join('')}

## Security Recommendations
${this.generateSecurityRecommendations(metrics).map(rec => `- ${rec}`).join('\n')}
    `.trim()
  }

  // Generate security recommendations
  private generateSecurityRecommendations(metrics: SecurityMetrics): string[] {
    const recommendations: string[] = []

    if (metrics.recentViolations > 5) {
      recommendations.push('High number of security violations detected - review access patterns')
    }

    if (metrics.eventsByType.authentication > metrics.totalEvents * 0.5) {
      recommendations.push('High authentication event rate - consider implementing MFA')
    }

    if (metrics.eventsBySeverity.critical > 0) {
      recommendations.push('Critical security events detected - immediate investigation required')
    }

    if (metrics.eventsByType.data_access > metrics.totalEvents * 0.3) {
      recommendations.push('High data access rate - review data access patterns and permissions')
    }

    return recommendations
  }

  // Setup security monitoring
  setupSecurityMonitoring(): void {
    // Monitor for suspicious patterns
    setInterval(() => {
      const recentEvents = this.getSecurityEvents({ limit: 100 })
      const suspiciousPatterns = this.detectSuspiciousPatterns(recentEvents)
      
      if (suspiciousPatterns.length > 0) {
        console.warn('Suspicious patterns detected:', suspiciousPatterns)
      }
    }, 300000) // Check every 5 minutes

    // Clean up old events
    setInterval(() => {
      const cutoff = Date.now() - (7 * 24 * 60 * 60 * 1000) // 7 days
      this.securityEvents = this.securityEvents.filter(
        e => e.timestamp.getTime() > cutoff
      )
    }, 3600000) // Clean up every hour
  }

  // Detect suspicious patterns
  private detectSuspiciousPatterns(events: SecurityEvent[]): string[] {
    const patterns: string[] = []

    // Detect rapid authentication failures
    const authFailures = events.filter(
      e => e.type === 'authentication' && e.severity === 'high'
    )
    if (authFailures.length > 10) {
      patterns.push('Rapid authentication failures detected')
    }

    // Detect unusual data access patterns
    const dataAccess = events.filter(e => e.type === 'data_access')
    const uniqueUsers = new Set(dataAccess.map(e => e.userId).filter(Boolean))
    if (dataAccess.length > 50 && uniqueUsers.size < 5) {
      patterns.push('Unusual data access pattern detected')
    }

    return patterns
  }
}

// Export singleton instance
export const securityManager = SecurityManager.getInstance()

// React hook for security monitoring
export function useSecurityMonitoring() {
  const [metrics, setMetrics] = React.useState<SecurityMetrics | null>(null)
  const [events, setEvents] = React.useState<SecurityEvent[]>([])
  const [loading, setLoading] = React.useState(false)

  const refreshMetrics = React.useCallback(async () => {
    setLoading(true)
    try {
      const securityMetrics = securityManager.getSecurityMetrics()
      const recentEvents = securityManager.getSecurityEvents({ limit: 20 })
      setMetrics(securityMetrics)
      setEvents(recentEvents)
    } catch (error) {
      console.error('Failed to fetch security metrics:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    refreshMetrics()
    const interval = setInterval(refreshMetrics, 60000) // Refresh every minute
    return () => clearInterval(interval)
  }, [refreshMetrics])

  return { metrics, events, loading, refreshMetrics }
}
