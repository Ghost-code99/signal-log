import { NextRequest, NextResponse } from 'next/server'
import { createExperimentCanvas } from '@/lib/experiment-canvas'
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
    const { projectId, context, template } = body

    if (!projectId || !context) {
      return NextResponse.json({ error: 'Project ID and context are required' }, { status: 400 })
    }

    const { success, canvas, error } = await createExperimentCanvas(
      projectId,
      context,
      user.id,
      template
    )
    
    if (!success) {
      return NextResponse.json({ error }, { status: 500 })
    }

    return NextResponse.json({ canvas })
  } catch (error) {
    console.error('Error creating experiment canvas:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
