import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Environment variables validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
}

if (!supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
}

if (!supabaseServiceRoleKey) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable')
}

// Client-side Supabase client (for browser use)
// This uses the anon key and is safe to expose to the client
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Enable automatic token refresh
    autoRefreshToken: true,
    // Persist session in localStorage
    persistSession: true,
    // Detect session from URL (for OAuth flows)
    detectSessionInUrl: true
  },
  // Enable real-time subscriptions
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Server-side Supabase client (for API routes and server actions)
// This uses the service role key and bypasses RLS
// ⚠️ NEVER expose this client to the browser
export const supabaseAdmin: SupabaseClient = createClient(
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
