'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabaseClient } from '@/lib/supabase-client'

export default function ConnectionTestPage() {
  const { user, loading: authLoading } = useAuth()
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'connected' | 'failed'>('testing')
  const [error, setError] = useState<string | null>(null)
  const [testResults, setTestResults] = useState<any[]>([])

  // Test database connection
  const testConnection = async () => {
    setConnectionStatus('testing')
    setError(null)
    setTestResults([])

    try {
      // Test 1: Basic connection
      const { data: tables, error: tablesError } = await supabaseClient
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .limit(5)

      if (tablesError) {
        throw new Error(`Tables query failed: ${tablesError.message}`)
      }

      setTestResults(prev => [...prev, {
        test: 'Database Connection',
        status: 'success',
        message: 'Successfully connected to database',
        data: tables
      }])

      // Test 2: User table access
      if (user) {
        const { data: userData, error: userError } = await supabaseClient
          .from('users')
          .select('id, email, created_at')
          .eq('id', user.id)
          .single()

        if (userError) {
          setTestResults(prev => [...prev, {
            test: 'User Data Access',
            status: 'warning',
            message: `User data access failed: ${userError.message}`,
            data: null
          }])
        } else {
          setTestResults(prev => [...prev, {
            test: 'User Data Access',
            status: 'success',
            message: 'Successfully accessed user data',
            data: userData
          }])
        }
      }

      // Test 3: Projects table access
      const { data: projectsData, error: projectsError } = await supabaseClient
        .from('projects')
        .select('count')
        .limit(1)

      if (projectsError) {
        setTestResults(prev => [...prev, {
          test: 'Projects Table Access',
          status: 'warning',
          message: `Projects table access failed: ${projectsError.message}`,
          data: null
        }])
      } else {
        setTestResults(prev => [...prev, {
          test: 'Projects Table Access',
          status: 'success',
          message: 'Successfully accessed projects table',
          data: projectsData
        }])
      }

      // Test 4: Real-time connection
      const channel = supabaseClient.channel('test-connection')
      const subscription = channel
        .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, (payload) => {
          console.log('Real-time event received:', payload)
        })
        .subscribe()

      setTestResults(prev => [...prev, {
        test: 'Real-time Connection',
        status: 'success',
        message: 'Real-time subscription established',
        data: { channel: channel.topic }
      }])

      // Clean up subscription
      setTimeout(() => {
        subscription.unsubscribe()
      }, 1000)

      setConnectionStatus('connected')
    } catch (error) {
      setConnectionStatus('failed')
      setError(error instanceof Error ? error.message : 'Unknown error')
      setTestResults(prev => [...prev, {
        test: 'Connection Test',
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
        data: null
      }])
    }
  }

  // Test environment variables
  const testEnvironmentVariables = () => {
    const envTests = [
      {
        name: 'NEXT_PUBLIC_SUPABASE_URL',
        value: process.env.NEXT_PUBLIC_SUPABASE_URL,
        required: true
      },
      {
        name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
        value: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        required: true
      }
    ]

    envTests.forEach(env => {
      setTestResults(prev => [...prev, {
        test: `Environment Variable: ${env.name}`,
        status: env.value ? 'success' : 'error',
        message: env.value ? 'Variable is set' : 'Variable is missing',
        data: env.value ? 'Set' : 'Not set'
      }])
    })
  }

  // Run all tests on mount
  useEffect(() => {
    testEnvironmentVariables()
    testConnection()
  }, [user])

  if (authLoading) {
    return <div className="p-8">Loading authentication...</div>
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Database Connection Test</h1>
      
      {/* Connection Status */}
      <div className="mb-8 p-6 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
        <div className="flex items-center gap-4">
          <div className={`w-4 h-4 rounded-full ${
            connectionStatus === 'connected' ? 'bg-green-500' :
            connectionStatus === 'failed' ? 'bg-red-500' :
            'bg-yellow-500'
          }`}></div>
          <span className="text-lg">
            {connectionStatus === 'connected' ? '✅ Connected' :
             connectionStatus === 'failed' ? '❌ Connection Failed' :
             '🔄 Testing...'}
          </span>
        </div>
        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded">
            <p className="text-red-800">Error: {error}</p>
          </div>
        )}
      </div>

      {/* Test Results */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Test Results</h2>
        <div className="space-y-2">
          {testResults.map((result, index) => (
            <div
              key={index}
              className={`p-3 rounded ${
                result.status === 'success' ? 'bg-green-100 border border-green-300' :
                result.status === 'warning' ? 'bg-yellow-100 border border-yellow-300' :
                'bg-red-100 border border-red-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{result.test}</span>
                <span className={`px-2 py-1 rounded text-sm ${
                  result.status === 'success' ? 'bg-green-200 text-green-800' :
                  result.status === 'warning' ? 'bg-yellow-200 text-yellow-800' :
                  'bg-red-200 text-red-800'
                }`}>
                  {result.status.toUpperCase()}
                </span>
              </div>
              <p className="text-sm mt-1">{result.message}</p>
              {result.data && (
                <details className="mt-2">
                  <summary className="text-sm cursor-pointer">View Data</summary>
                  <pre className="text-xs bg-gray-100 p-2 mt-1 rounded overflow-auto">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* User Information */}
      {user && (
        <div className="mb-8 p-6 bg-blue-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">User Information</h2>
          <div className="space-y-2 text-sm">
            <div><strong>User ID:</strong> {user.id}</div>
            <div><strong>Email:</strong> {user.email}</div>
            <div><strong>Created:</strong> {new Date(user.created_at).toLocaleString()}</div>
          </div>
        </div>
      )}

      {/* Test Controls */}
      <div className="mb-8 p-6 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
        <div className="flex gap-4">
          <button
            onClick={testConnection}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Test Connection Again
          </button>
          <button
            onClick={testEnvironmentVariables}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Test Environment Variables
          </button>
        </div>
      </div>

      {/* Next Steps */}
      <div className="p-6 bg-green-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Next Steps</h2>
        <div className="space-y-2 text-sm">
          <p>If all tests pass, you can proceed to:</p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li><a href="/test-database" className="text-blue-600 hover:underline">Full Database Test Page</a> - Test all CRUD operations</li>
            <li><a href="/test-persistence" className="text-blue-600 hover:underline">Persistence Test Page</a> - Test data persistence across page refreshes</li>
            <li><a href="/dashboard" className="text-blue-600 hover:underline">Dashboard</a> - Use your application normally</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
