'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { createProject, getUserProjects, deleteProject } from '@/lib/actions'

export default function PersistenceTestPage() {
  const { user } = useAuth()
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [testProjectId, setTestProjectId] = useState<string | null>(null)

  // Load projects
  const loadProjects = async () => {
    if (!user) return
    
    try {
      const result = await getUserProjects(user.id)
      if (result.success) {
        setProjects(result.data || [])
      }
    } catch (error) {
      console.error('Error loading projects:', error)
    }
  }

  // Create a test project
  const createTestProject = async () => {
    if (!user) return
    
    setLoading(true)
    setMessage('Creating test project...')
    
    try {
      const result = await createProject(user.id, {
        title: `Persistence Test ${Date.now()}`,
        description: 'This project tests data persistence across page refreshes',
        status: 'active',
        priority: 'high'
      })
      
      if (result.success) {
        setTestProjectId(result.data.id)
        setMessage(`✅ Test project created with ID: ${result.data.id}`)
        await loadProjects()
      } else {
        setMessage(`❌ Failed to create project: ${result.error}`)
      }
    } catch (error) {
      setMessage(`❌ Error creating project: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  // Clean up test project
  const cleanupTestProject = async () => {
    if (!testProjectId || !user) return
    
    setLoading(true)
    setMessage('Cleaning up test project...')
    
    try {
      const result = await deleteProject(testProjectId, user.id)
      
      if (result.success) {
        setMessage('✅ Test project cleaned up successfully')
        setTestProjectId(null)
        await loadProjects()
      } else {
        setMessage(`❌ Failed to clean up project: ${result.error}`)
      }
    } catch (error) {
      setMessage(`❌ Error cleaning up project: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  // Load projects on mount
  useEffect(() => {
    loadProjects()
  }, [user])

  if (!user) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Data Persistence Test</h1>
        <p className="text-red-600">Please sign in to test data persistence.</p>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Data Persistence Test</h1>
      
      {/* Test Controls */}
      <div className="mb-8 p-6 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Persistence Test</h2>
        <div className="space-y-4">
          <div className="flex gap-4">
            <button
              onClick={createTestProject}
              disabled={loading || !!testProjectId}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
            >
              Create Test Project
            </button>
            <button
              onClick={cleanupTestProject}
              disabled={loading || !testProjectId}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
            >
              Clean Up Test Project
            </button>
            <button
              onClick={loadProjects}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Refresh Data
            </button>
          </div>
          
          {message && (
            <div className={`p-3 rounded ${
              message.includes('✅') ? 'bg-green-100 border border-green-300' : 
              message.includes('❌') ? 'bg-red-100 border border-red-300' : 
              'bg-blue-100 border border-blue-300'
            }`}>
              {message}
            </div>
          )}
        </div>
      </div>

      {/* Test Instructions */}
      <div className="mb-8 p-6 bg-blue-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Test Instructions</h2>
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>Click "Create Test Project" to create a test project</li>
          <li>Note the project ID that appears in the message</li>
          <li>Refresh the page (F5 or Ctrl+R)</li>
          <li>Verify the test project still appears in the list below</li>
          <li>Click "Clean Up Test Project" to remove the test data</li>
          <li>Refresh the page again to verify the project is gone</li>
        </ol>
      </div>

      {/* Current Projects */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Current Projects ({projects.length})</h2>
        <div className="space-y-4">
          {projects.length === 0 ? (
            <p className="text-gray-500">No projects found. Create a test project to verify persistence.</p>
          ) : (
            projects.map((project) => (
              <div key={project.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium">{project.title}</h3>
                    <p className="text-sm text-gray-600">{project.description}</p>
                    <p className="text-xs text-gray-500 mt-1">ID: {project.id}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      project.status === 'active' ? 'bg-green-100 text-green-800' :
                      project.status === 'idea' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {project.status}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      project.priority === 'high' ? 'bg-red-100 text-red-800' :
                      project.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {project.priority}
                    </span>
                  </div>
                </div>
                {project.project_tags && project.project_tags.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">Tags:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {project.project_tags.map((tag: any) => (
                        <span key={tag.id} className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">
                          {tag.tag_name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Persistence Status */}
      <div className="mt-8 p-6 bg-green-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Persistence Status</h2>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-green-500 rounded-full"></span>
            <span>Database connection: Active</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-green-500 rounded-full"></span>
            <span>User authentication: {user ? 'Authenticated' : 'Not authenticated'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-green-500 rounded-full"></span>
            <span>Data loading: {projects.length} projects loaded</span>
          </div>
          {testProjectId && (
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 bg-blue-500 rounded-full"></span>
              <span>Test project active: {testProjectId}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
