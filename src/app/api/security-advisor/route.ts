import { NextRequest, NextResponse } from 'next/server'
import { securityAdvisor } from '@/lib/supabase-security-advisor'

/**
 * GET /api/security-advisor
 * Returns current security findings and recommendations
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    switch (action) {
      case 'scan':
        // Force a new scan
        const findings = await securityAdvisor.scanSecurityIssues()
        return NextResponse.json({ 
          success: true, 
          findings,
          timestamp: new Date().toISOString()
        })

      case 'score':
        // Get security score
        const score = await securityAdvisor.getSecurityScore()
        return NextResponse.json({ 
          success: true, 
          score 
        })

      case 'recommendations':
        // Get recommendations for a specific finding
        const findingId = searchParams.get('findingId')
        if (!findingId) {
          return NextResponse.json(
            { success: false, error: 'findingId parameter is required' },
            { status: 400 }
          )
        }
        
        const recommendations = securityAdvisor.getRecommendations(findingId)
        return NextResponse.json({ 
          success: true, 
          recommendations 
        })

      case 'report':
        // Get full security report
        const report = await securityAdvisor.getSummaryReport()
        return NextResponse.json({ 
          success: true, 
          report 
        })

      default:
        // Return all data
        const [allFindings, securityScore, summaryReport] = await Promise.all([
          securityAdvisor.scanSecurityIssues(),
          securityAdvisor.getSecurityScore(),
          securityAdvisor.getSummaryReport()
        ])

        return NextResponse.json({
          success: true,
          data: {
            findings: allFindings,
            score: securityScore,
            report: summaryReport,
            timestamp: new Date().toISOString()
          }
        })
    }
  } catch (error) {
    console.error('Error in security advisor API:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/security-advisor
 * Mark a finding as resolved
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, findingId } = body

    if (action === 'resolve' && findingId) {
      await securityAdvisor.resolveFinding(findingId)
      return NextResponse.json({ 
        success: true, 
        message: 'Finding marked as resolved' 
      })
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action or missing findingId' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error in security advisor API:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    )
  }
}
