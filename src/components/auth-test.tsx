'use client'

import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function AuthTest() {
  const { user, loading, signOut } = useAuth()

  if (loading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading authentication...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Authentication Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {user ? (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <h3 className="font-medium text-green-800">✅ Authenticated</h3>
              <p className="text-sm text-green-600 mt-1">
                Welcome, {user.user_metadata?.full_name || user.email}!
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">User Details:</h4>
              <div className="text-sm space-y-1">
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>User ID:</strong> {user.id}</p>
                <p><strong>Created:</strong> {new Date(user.created_at).toLocaleDateString()}</p>
              </div>
            </div>

            <Button onClick={signOut} variant="outline" className="w-full">
              Sign Out
            </Button>
          </div>
        ) : (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <h3 className="font-medium text-yellow-800">⚠️ Not Authenticated</h3>
            <p className="text-sm text-yellow-600 mt-1">
              Please sign in to access your dashboard
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
