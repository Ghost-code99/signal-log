/**
 * Supabase Service Role Client
 * 
 * This module provides a Supabase client with service role key
 * for server-side operations that need to bypass RLS policies.
 * 
 * ⚠️ WARNING: Only use this for trusted server-to-server operations.
 * Never expose the service role key to the client.
 * 
 * Use cases:
 * - Webhook endpoints that receive data from external services (n8n)
 * - Admin operations that need to bypass RLS
 * - Background jobs and migrations
 */

import { createClient } from '@supabase/supabase-js';

/**
 * Creates a Supabase client with service role key
 * 
 * This client bypasses RLS policies and should only be used
 * in server-side code for trusted operations.
 * 
 * @returns Supabase client with service role permissions
 * 
 * @example
 * ```typescript
 * const supabase = createSupabaseServiceClient();
 * const { data, error } = await supabase
 *   .from('feedback')
 *   .insert({ ... });
 * ```
 */
export function createSupabaseServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL environment variable is not set');
  }

  if (!supabaseServiceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is not set');
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

