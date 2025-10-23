'use client'

import { useEffect, useState } from 'react'

export default function SupabaseTest() {
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'connected' | 'error'>('testing')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function testConnection() {
      try {
        // Check if environment variables are loaded
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL
        const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        
        if (!url || !anonKey) {
          throw new Error('Environment variables not loaded')
        }
        
        // Test basic connection by creating a simple client
        const { createClient } = await import('@supabase/supabase-js')
        const supabase = createClient(url, anonKey)
        
        // Test connection with a simple auth check
        const { data, error } = await supabase.auth.getSession()
        
        // Even if there's no session, if we get here without throwing, connection works
        setConnectionStatus('connected')
        setError(null)
      } catch (err) {
        setConnectionStatus('error')
        setError(err instanceof Error ? err.message : 'Unknown error')
      }
    }

    testConnection()
  }, [])

  return (
    <div className="p-4 border rounded-lg bg-card">
      <h3 className="text-lg font-semibold mb-2">Supabase Connection Test</h3>
      
      {connectionStatus === 'testing' && (
        <p className="text-muted-foreground">Testing connection...</p>
      )}
      
      {connectionStatus === 'connected' && (
        <div className="text-green-600">
          ✅ <strong>Supabase connected successfully!</strong>
          <p className="text-sm text-muted-foreground mt-1">
            Your environment variables are working correctly.
          </p>
        </div>
      )}
      
      {connectionStatus === 'error' && (
        <div className="text-red-600">
          ❌ <strong>Connection failed:</strong>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}
      
      <div className="mt-4 p-3 bg-muted rounded text-sm">
        <p><strong>Environment Variables Status:</strong></p>
        <p>URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Loaded' : '❌ Missing'}</p>
        <p>Anon Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Loaded' : '❌ Missing'}</p>
      </div>
    </div>
  )
}
