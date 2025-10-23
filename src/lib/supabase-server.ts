// Server-side Supabase client
// Use this in API routes, server actions, and server components
// ⚠️ NEVER expose this client to the browser

import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Server-side client with service role key (bypasses RLS)
export const supabaseServer = createClient(
  supabaseUrl,
  supabaseServiceRoleKey,
  {
    auth: {
      // Disable automatic token refresh for server-side
      autoRefreshToken: false,
      // Don't persist session for server-side
      persistSession: false
    },
    // Server-side doesn't need real-time
    realtime: {
      params: {
        eventsPerSecond: 1
      }
    }
  }
)

// Server-side client that respects user session
export const createServerClient = () => {
  return createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// Helper function to get user from server-side
export const getServerUser = async () => {
  const supabase = createServerClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

// Helper function to get session from server-side
export const getServerSession = async () => {
  const supabase = createServerClient()
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) throw error
  return session
}
