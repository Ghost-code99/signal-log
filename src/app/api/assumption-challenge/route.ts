import { NextRequest, NextResponse } from 'next/server'
import { challengeProjectAssumptions } from '@/lib/ai-assumption-challenger'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { projectId, assumptions, context } = body

    if (!projectId || !assumptions || !Array.isArray(assumptions)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { success, session, error } = await challengeProjectAssumptions(
      projectId,
      assumptions,
      user.id,
      context
    )
    
    if (!success) {
      return NextResponse.json({ error }, { status: 500 })
    }

    return NextResponse.json({ session })
  } catch (error) {
    console.error('Error challenging assumptions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
