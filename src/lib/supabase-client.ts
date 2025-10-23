// Client-side Supabase client
// Use this in React components and client-side code

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client-side client with optimized settings for browser use
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
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

// Helper function to get current user
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabaseClient.auth.getUser()
  if (error) throw error
  return user
}

// Helper function to get current session
export const getCurrentSession = async () => {
  const { data: { session }, error } = await supabaseClient.auth.getSession()
  if (error) throw error
  return session
}
