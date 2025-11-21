/**
 * Supabase Client Helper for Clerk Integration
 * 
 * This module provides a Supabase client that uses Clerk's session tokens
 * for authentication. Use this in server components, server actions, and API routes.
 * 
 * Reference: https://clerk.com/docs/guides/development/integrations/databases/supabase
 */

import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';

/**
 * Creates a Supabase client with Clerk authentication
 * 
 * This client automatically includes the Clerk session token in requests,
 * allowing Supabase RLS policies to identify the current user via auth.jwt()->>'sub'
 * 
 * @returns Supabase client configured with Clerk session token
 * 
 * @example
 * ```typescript
 * const supabase = await createSupabaseClient();
 * const { data, error } = await supabase
 *   .from('projects')
 *   .select('*');
 * ```
 */
export async function createSupabaseClient() {
  const { getToken } = await auth();

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        fetch: async (url, options = {}) => {
          // Get Clerk session token
          const clerkToken = await getToken();
          
          // Add Clerk token to Authorization header
          const headers = new Headers(options.headers);
          if (clerkToken) {
            headers.set('Authorization', `Bearer ${clerkToken}`);
          }
          
          return fetch(url, { ...options, headers });
        },
      },
    }
  );
}

/**
 * Alternative pattern using accessToken() callback (2025 native integration)
 * 
 * This is the simpler pattern recommended for Clerk + Supabase native integration.
 * Uncomment and use this if the above pattern doesn't work.
 */
/*
export async function createSupabaseClient() {
  const { getToken } = await auth();
  
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      async accessToken() {
        return await getToken() || '';
      },
    }
  );
}
*/

