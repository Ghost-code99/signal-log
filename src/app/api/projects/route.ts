import { NextRequest, NextResponse } from 'next/server'
import { getProjects, createProject } from '@/lib/project-actions'
import { createClient } from '@supabase/supabase-js'
import { withRateLimit } from '@/lib/rate-limit'
import { securityMonitor, getClientInfo } from '@/lib/security-monitor'
import { validateInput, projectSchema } from '@/lib/validation'

async function handleGetProjects(request: NextRequest) {
  try {
    const { ip, userAgent } = getClientInfo(request)
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      securityMonitor.logAuthFailure(ip, userAgent, { endpoint: '/api/projects' })
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Log data access
    securityMonitor.logDataAccess(user.id, ip, userAgent, { endpoint: '/api/projects', action: 'GET' })

    const { success, projects, error } = await getProjects(user.id)
    
    if (!success) {
      securityMonitor.logSuspiciousActivity(ip, userAgent, { 
        endpoint: '/api/projects', 
        userId: user.id,
        error: error 
      })
      return NextResponse.json({ error }, { status: 500 })
    }

    return NextResponse.json({ projects })
  } catch (error) {
    const { ip, userAgent } = getClientInfo(request)
    securityMonitor.logSuspiciousActivity(ip, userAgent, { 
      endpoint: '/api/projects', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export const GET = withRateLimit(handleGetProjects)

async function handleCreateProject(request: NextRequest) {
  try {
    const { ip, userAgent } = getClientInfo(request)
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      securityMonitor.logAuthFailure(ip, userAgent, { endpoint: '/api/projects' })
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Validate input
    const validation = validateInput(projectSchema, body)
    if (!validation.success) {
      securityMonitor.logSuspiciousActivity(ip, userAgent, { 
        endpoint: '/api/projects', 
        userId: user.id,
        error: 'Invalid input',
        details: validation.error
      })
      return NextResponse.json({ error: 'Invalid input data' }, { status: 400 })
    }

    // Log data creation
    securityMonitor.logDataAccess(user.id, ip, userAgent, { endpoint: '/api/projects', action: 'POST' })

    const { success, project, error } = await createProject(body, user.id)
    
    if (!success) {
      securityMonitor.logSuspiciousActivity(ip, userAgent, { 
        endpoint: '/api/projects', 
        userId: user.id,
        error: error 
      })
      return NextResponse.json({ error }, { status: 500 })
    }

    return NextResponse.json({ project }, { status: 201 })
  } catch (error) {
    const { ip, userAgent } = getClientInfo(request)
    securityMonitor.logSuspiciousActivity(ip, userAgent, { 
      endpoint: '/api/projects', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export const POST = withRateLimit(handleCreateProject)
