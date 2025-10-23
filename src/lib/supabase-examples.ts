// Supabase Usage Examples
// This file demonstrates proper usage patterns for different scenarios

import { supabaseClient } from './supabase-client'
import { supabaseServer, createServerClient } from './supabase-server'

// ========================================
// CLIENT-SIDE USAGE (React Components)
// ========================================

// ✅ Good: Client-side data fetching
export const getProjectsClient = async () => {
  const { data, error } = await supabaseClient
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

// ✅ Good: Client-side authentication
export const signInClient = async (email: string, password: string) => {
  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  })
  
  if (error) throw error
  return data
}

// ✅ Good: Client-side real-time subscriptions
export const subscribeToProjects = (callback: (payload: any) => void) => {
  return supabaseClient
    .channel('projects')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'projects' },
      callback
    )
    .subscribe()
}

// ========================================
// SERVER-SIDE USAGE (API Routes)
// ========================================

// ✅ Good: Server-side with user context
export const getProjectsServer = async () => {
  const supabase = createServerClient()
  
  // This respects RLS and user permissions
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

// ✅ Good: Server-side admin operations
export const getAllUsersAdmin = async () => {
  // ⚠️ Only use supabaseServer for admin operations
  // This bypasses RLS - use with extreme caution
  const { data, error } = await supabaseServer
    .from('users')
    .select('*')
  
  if (error) throw error
  return data
}

// ========================================
// SECURITY BEST PRACTICES
// ========================================

// ❌ BAD: Never expose service role key to client
// const badClient = createClient(url, SERVICE_ROLE_KEY) // DON'T DO THIS

// ❌ BAD: Never trust client-side data without validation
// const badUpdate = async (data: any) => {
//   return supabaseClient.from('projects').update(data) // DON'T DO THIS
// }

// ✅ GOOD: Always validate on server-side
export const updateProjectServer = async (id: string, updates: any) => {
  const supabase = createServerClient()
  
  // Validate user permissions
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  
  // Validate project ownership
  const { data: project } = await supabase
    .from('projects')
    .select('user_id')
    .eq('id', id)
    .single()
  
  if (project?.user_id !== user.id) {
    throw new Error('Unauthorized')
  }
  
  // Safe to update
  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', id)
  
  if (error) throw error
  return data
}

// ========================================
// ERROR HANDLING PATTERNS
// ========================================

export const handleSupabaseError = (error: any) => {
  console.error('Supabase error:', error)
  
  // Handle specific error types
  if (error.code === 'PGRST116') {
    return 'No data found'
  }
  
  if (error.code === '23505') {
    return 'Duplicate entry'
  }
  
  if (error.message?.includes('JWT')) {
    return 'Authentication required'
  }
  
  return 'An unexpected error occurred'
}
