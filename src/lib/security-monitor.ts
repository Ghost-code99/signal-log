// Security monitoring and logging
interface SecurityEvent {
  type: 'auth_failure' | 'rate_limit' | 'suspicious_activity' | 'data_access' | 'admin_action'
  userId?: string
  ip: string
  userAgent: string
  timestamp: string
  details: Record<string, any>
  severity: 'low' | 'medium' | 'high' | 'critical'
}

class SecurityMonitor {
  private events: SecurityEvent[] = []
  private maxEvents = 1000 // Keep last 1000 events

  logEvent(event: Omit<SecurityEvent, 'timestamp'>) {
    const securityEvent: SecurityEvent = {
      ...event,
      timestamp: new Date().toISOString()
    }

    this.events.push(securityEvent)
    
    // Keep only recent events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents)
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🔒 Security Event:', securityEvent)
    }

    // In production, you would send this to a monitoring service
    // like Sentry, DataDog, or CloudWatch
  }

  logAuthFailure(ip: string, userAgent: string, details: Record<string, any>) {
    this.logEvent({
      type: 'auth_failure',
      ip,
      userAgent,
      details,
      severity: 'medium'
    })
  }

  logRateLimit(ip: string, userAgent: string, details: Record<string, any>) {
    this.logEvent({
      type: 'rate_limit',
      ip,
      userAgent,
      details,
      severity: 'medium'
    })
  }

  logSuspiciousActivity(ip: string, userAgent: string, details: Record<string, any>) {
    this.logEvent({
      type: 'suspicious_activity',
      ip,
      userAgent,
      details,
      severity: 'high'
    })
  }

  logDataAccess(userId: string, ip: string, userAgent: string, details: Record<string, any>) {
    this.logEvent({
      type: 'data_access',
      userId,
      ip,
      userAgent,
      details,
      severity: 'low'
    })
  }

  logAdminAction(userId: string, ip: string, userAgent: string, details: Record<string, any>) {
    this.logEvent({
      type: 'admin_action',
      userId,
      ip,
      userAgent,
      details,
      severity: 'high'
    })
  }

  getRecentEvents(limit: number = 50): SecurityEvent[] {
    return this.events.slice(-limit)
  }

  getEventsByType(type: SecurityEvent['type'], limit: number = 50): SecurityEvent[] {
    return this.events
      .filter(event => event.type === type)
      .slice(-limit)
  }

  getEventsBySeverity(severity: SecurityEvent['severity'], limit: number = 50): SecurityEvent[] {
    return this.events
      .filter(event => event.severity === severity)
      .slice(-limit)
  }

  // Check for suspicious patterns
  checkSuspiciousActivity(ip: string, timeWindow: number = 15 * 60 * 1000): boolean {
    const now = Date.now()
    const windowStart = now - timeWindow
    
    const recentEvents = this.events.filter(event => 
      event.ip === ip && 
      new Date(event.timestamp).getTime() > windowStart
    )

    // Flag if more than 10 events in 15 minutes
    return recentEvents.length > 10
  }
}

// Export singleton instance
export const securityMonitor = new SecurityMonitor()

// Helper function to get client info
export function getClientInfo(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'unknown'
  const userAgent = request.headers.get('user-agent') || 'unknown'
  
  return { ip, userAgent }
}
