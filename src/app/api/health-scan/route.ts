import { NextRequest, NextResponse } from 'next/server'
import { runHealthScan } from '@/lib/ai-health-scanner'
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
    const { projectId } = body

    const { success, results, error } = await runHealthScan(user.id, projectId)
    
    if (!success) {
      return NextResponse.json({ error }, { status: 500 })
    }

    return NextResponse.json({ results })
  } catch (error) {
    console.error('Error running health scan:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
