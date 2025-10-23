import { NextRequest, NextResponse } from 'next/server'
import { processIdeaCapture } from '@/lib/idea-capture'
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
    const { content, manualTags } = body

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    const { success, idea, suggestions, error } = await processIdeaCapture(
      content,
      user.id,
      manualTags
    )
    
    if (!success) {
      return NextResponse.json({ error }, { status: 500 })
    }

    return NextResponse.json({ idea, suggestions })
  } catch (error) {
    console.error('Error processing idea capture:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
