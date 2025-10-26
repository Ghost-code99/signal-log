import { NextRequest, NextResponse } from 'next/server'
import { securityMonitor } from '@/lib/security-monitoring'

/**
 * GET /api/security-monitoring
 * Get security monitoring data
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    switch (action) {
      case 'check':
        // Trigger a manual security check
        const metrics = await securityMonitor.performSecurityCheck()
        return NextResponse.json({ success: true, metrics })

      case 'trends':
        // Get security trends
        const trends = securityMonitor.getSecurityTrends()
        return NextResponse.json({ success: true, trends })

      case 'alerts':
        // Get active alerts
        const alerts = securityMonitor.getActiveAlerts()
        return NextResponse.json({ success: true, alerts })

      case 'report':
        // Generate security report
        const report = await securityMonitor.generateReport()
        return NextResponse.json({ success: true, report })

      case 'start':
        // Start monitoring
        securityMonitor.startMonitoring()
        return NextResponse.json({ success: true, message: 'Monitoring started' })

      case 'stop':
        // Stop monitoring
        securityMonitor.stopMonitoring()
        return NextResponse.json({ success: true, message: 'Monitoring stopped' })

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error in security monitoring API:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/security-monitoring
 * Resolve alerts
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { alertId } = body

    if (alertId) {
      securityMonitor.resolveAlert(alertId)
      return NextResponse.json({ success: true, message: 'Alert resolved' })
    }

    return NextResponse.json(
      { success: false, error: 'Invalid alert ID' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error in security monitoring API:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
