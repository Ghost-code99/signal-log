'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { 
  createProject, 
  getUserProjects, 
  updateProject, 
  deleteProject,
  addProjectTag,
  createIdea,
  getUserIdeas,
  updateIdea,
  deleteIdea,
  createAIInteraction,
  getProjectAIInteractions,
  createHealthMetric,
  getLatestProjectHealth
} from '@/lib/actions'

interface TestResult {
  operation: string
  success: boolean
  message: string
  data?: any
  error?: string
}

export default function DatabaseTestPage() {
  const { user, loading: authLoading } = useAuth()
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [ideas, setIdeas] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    status: 'idea' as const,
    priority: 'medium' as const
  })
  const [newIdea, setNewIdea] = useState({
    content: '',
    suggested_tags: [] as string[]
  })

  // Add test result
  const addTestResult = (operation: string, success: boolean, message: string, data?: any, error?: string) => {
    setTestResults(prev => [...prev, {
      operation,
      success,
      message,
      data,
      error
    }])
  }

  // Test 1: Database Connection
  const testDatabaseConnection = async () => {
    addTestResult('Database Connection', true, 'Testing connection...', null)
    
    try {
      if (!user) {
        addTestResult('Database Connection', false, 'User not authenticated', null, 'No user found')
        return
      }

      const result = await getUserProjects(user.id)
      
      if (result.success) {
        addTestResult('Database Connection', true, 'Connection successful!', result.data)
        setProjects(result.data || [])
      } else {
        addTestResult('Database Connection', false, 'Connection failed', null, result.error)
      }
    } catch (error) {
      addTestResult('Database Connection', false, 'Connection error', null, error instanceof Error ? error.message : 'Unknown error')
    }
  }

  // Test 2: Create Project
  const testCreateProject = async () => {
    if (!user) return
    
    setLoading(true)
    addTestResult('Create Project', true, 'Creating project...', null)
    
    try {
      const projectData = {
        title: `Test Project ${Date.now()}`,
        description: 'This is a test project created by the database test page',
        status: 'active' as const,
        priority: 'high' as const
      }

      const result = await createProject(user.id, projectData)
      
      if (result.success) {
        addTestResult('Create Project', true, 'Project created successfully!', result.data)
        // Refresh projects list
        await loadProjects()
      } else {
        addTestResult('Create Project', false, 'Failed to create project', null, result.error)
      }
    } catch (error) {
      addTestResult('Create Project', false, 'Create project error', null, error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  // Test 3: Update Project
  const testUpdateProject = async (projectId: string) => {
    if (!user) return
    
    setLoading(true)
    addTestResult('Update Project', true, 'Updating project...', null)
    
    try {
      const updates = {
        title: `Updated Project ${Date.now()}`,
        description: 'This project has been updated by the test page',
        status: 'active' as const,
        priority: 'critical' as const
      }

      const result = await updateProject(projectId, user.id, updates)
      
      if (result.success) {
        addTestResult('Update Project', true, 'Project updated successfully!', result.data)
        // Refresh projects list
        await loadProjects()
      } else {
        addTestResult('Update Project', false, 'Failed to update project', null, result.error)
      }
    } catch (error) {
      addTestResult('Update Project', false, 'Update project error', null, error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  // Test 4: Add Project Tag
  const testAddProjectTag = async (projectId: string) => {
    if (!user) return
    
    setLoading(true)
    addTestResult('Add Project Tag', true, 'Adding tag to project...', null)
    
    try {
      const tagName = `test-tag-${Date.now()}`
      const result = await addProjectTag(projectId, user.id, tagName)
      
      if (result.success) {
        addTestResult('Add Project Tag', true, 'Tag added successfully!', result.data)
        // Refresh projects list
        await loadProjects()
      } else {
        addTestResult('Add Project Tag', false, 'Failed to add tag', null, result.error)
      }
    } catch (error) {
      addTestResult('Add Project Tag', false, 'Add tag error', null, error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  // Test 5: Create Idea
  const testCreateIdea = async () => {
    if (!user) return
    
    setLoading(true)
    addTestResult('Create Idea', true, 'Creating idea...', null)
    
    try {
      const ideaData = {
        content: `Test idea created at ${new Date().toISOString()}`,
        suggested_tags: ['test', 'database', 'verification']
      }

      const result = await createIdea(user.id, ideaData)
      
      if (result.success) {
        addTestResult('Create Idea', true, 'Idea created successfully!', result.data)
        // Refresh ideas list
        await loadIdeas()
      } else {
        addTestResult('Create Idea', false, 'Failed to create idea', null, result.error)
      }
    } catch (error) {
      addTestResult('Create Idea', false, 'Create idea error', null, error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  // Test 6: Create AI Interaction
  const testCreateAIInteraction = async (projectId: string) => {
    if (!user) return
    
    setLoading(true)
    addTestResult('Create AI Interaction', true, 'Creating AI interaction...', null)
    
    try {
      const interactionData = {
        project_id: projectId,
        interaction_type: 'health_scan' as const,
        content: 'Test health scan request',
        ai_response: 'This is a test AI response for database verification',
        metadata: { test: true, timestamp: Date.now() }
      }

      const result = await createAIInteraction(user.id, interactionData)
      
      if (result.success) {
        addTestResult('Create AI Interaction', true, 'AI interaction created successfully!', result.data)
      } else {
        addTestResult('Create AI Interaction', false, 'Failed to create AI interaction', null, result.error)
      }
    } catch (error) {
      addTestResult('Create AI Interaction', false, 'Create AI interaction error', null, error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  // Test 7: Create Health Metric
  const testCreateHealthMetric = async (projectId: string) => {
    if (!user) return
    
    setLoading(true)
    addTestResult('Create Health Metric', true, 'Creating health metric...', null)
    
    try {
      const healthData = {
        project_id: projectId,
        health_score: Math.floor(Math.random() * 100),
        health_indicators: {
          user_engagement: 'high',
          technical_debt: 'low',
          market_fit: 'medium',
          test_metric: true
        }
      }

      const result = await createHealthMetric(user.id, healthData)
      
      if (result.success) {
        addTestResult('Create Health Metric', true, 'Health metric created successfully!', result.data)
      } else {
        addTestResult('Create Health Metric', false, 'Failed to create health metric', null, result.error)
      }
    } catch (error) {
      addTestResult('Create Health Metric', false, 'Create health metric error', null, error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  // Test 8: Delete Project
  const testDeleteProject = async (projectId: string) => {
    if (!user) return
    
    setLoading(true)
    addTestResult('Delete Project', true, 'Deleting project...', null)
    
    try {
      const result = await deleteProject(projectId, user.id)
      
      if (result.success) {
        addTestResult('Delete Project', true, 'Project deleted successfully!', null)
        // Refresh projects list
        await loadProjects()
      } else {
        addTestResult('Delete Project', false, 'Failed to delete project', null, result.error)
      }
    } catch (error) {
      addTestResult('Delete Project', false, 'Delete project error', null, error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

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

  // Load ideas
  const loadIdeas = async () => {
    if (!user) return
    
    try {
      const result = await getUserIdeas(user.id)
      if (result.success) {
        setIdeas(result.data || [])
      }
    } catch (error) {
      console.error('Error loading ideas:', error)
    }
  }

  // Run all tests
  const runAllTests = async () => {
    if (!user) return
    
    setTestResults([])
    setLoading(true)
    
    try {
      // Test 1: Database Connection
      await testDatabaseConnection()
      
      // Test 2: Create Project
      await testCreateProject()
      
      // Test 3: Create Idea
      await testCreateIdea()
      
      // If we have projects, test with the first one
      if (projects.length > 0) {
        const firstProject = projects[0]
        
        // Test 4: Update Project
        await testUpdateProject(firstProject.id)
        
        // Test 5: Add Project Tag
        await testAddProjectTag(firstProject.id)
        
        // Test 6: Create AI Interaction
        await testCreateAIInteraction(firstProject.id)
        
        // Test 7: Create Health Metric
        await testCreateHealthMetric(firstProject.id)
      }
      
      addTestResult('All Tests', true, 'All tests completed!', null)
    } catch (error) {
      addTestResult('All Tests', false, 'Test suite failed', null, error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  // Load data on component mount
  useEffect(() => {
    if (user) {
      loadProjects()
      loadIdeas()
    }
  }, [user])

  if (authLoading) {
    return <div className="p-8">Loading authentication...</div>
  }

  if (!user) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Database Test Page</h1>
        <p className="text-red-600">Please sign in to test database operations.</p>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Database Connection Test</h1>
      
      {/* Test Controls */}
      <div className="mb-8 p-6 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={testDatabaseConnection}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            Test Connection
          </button>
          <button
            onClick={testCreateProject}
            disabled={loading}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            Create Project
          </button>
          <button
            onClick={testCreateIdea}
            disabled={loading}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
          >
            Create Idea
          </button>
          <button
            onClick={runAllTests}
            disabled={loading}
            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
          >
            Run All Tests
          </button>
          <button
            onClick={() => {
              setTestResults([])
              loadProjects()
              loadIdeas()
            }}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Refresh Data
          </button>
        </div>
      </div>

      {/* Test Results */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Test Results</h2>
        <div className="space-y-2">
          {testResults.map((result, index) => (
            <div
              key={index}
              className={`p-3 rounded ${
                result.success ? 'bg-green-100 border border-green-300' : 'bg-red-100 border border-red-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{result.operation}</span>
                <span className={`px-2 py-1 rounded text-sm ${
                  result.success ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                }`}>
                  {result.success ? 'SUCCESS' : 'FAILED'}
                </span>
              </div>
              <p className="text-sm mt-1">{result.message}</p>
              {result.error && (
                <p className="text-sm text-red-600 mt-1">Error: {result.error}</p>
              )}
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

      {/* Current Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Projects */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Projects ({projects.length})</h2>
          <div className="space-y-4">
            {projects.map((project) => (
              <div key={project.id} className="p-4 border rounded-lg">
                <h3 className="font-medium">{project.title}</h3>
                <p className="text-sm text-gray-600">{project.description}</p>
                <div className="flex items-center gap-2 mt-2">
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
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => testUpdateProject(project.id)}
                    disabled={loading}
                    className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 disabled:opacity-50"
                  >
                    Update
                  </button>
                  <button
                    onClick={() => testAddProjectTag(project.id)}
                    disabled={loading}
                    className="px-3 py-1 bg-purple-500 text-white text-sm rounded hover:bg-purple-600 disabled:opacity-50"
                  >
                    Add Tag
                  </button>
                  <button
                    onClick={() => testCreateAIInteraction(project.id)}
                    disabled={loading}
                    className="px-3 py-1 bg-orange-500 text-white text-sm rounded hover:bg-orange-600 disabled:opacity-50"
                  >
                    AI Test
                  </button>
                  <button
                    onClick={() => testCreateHealthMetric(project.id)}
                    disabled={loading}
                    className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 disabled:opacity-50"
                  >
                    Health
                  </button>
                  <button
                    onClick={() => testDeleteProject(project.id)}
                    disabled={loading}
                    className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 disabled:opacity-50"
                  >
                    Delete
                  </button>
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
            ))}
          </div>
        </div>

        {/* Ideas */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Ideas ({ideas.length})</h2>
          <div className="space-y-4">
            {ideas.map((idea) => (
              <div key={idea.id} className="p-4 border rounded-lg">
                <p className="text-sm">{idea.content}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    idea.status === 'captured' ? 'bg-blue-100 text-blue-800' :
                    idea.status === 'processed' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {idea.status}
                  </span>
                </div>
                {idea.suggested_tags && idea.suggested_tags.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">Suggested Tags:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {idea.suggested_tags.map((tag: string, index: number) => (
                        <span key={index} className="px-2 py-1 bg-purple-200 text-purple-700 text-xs rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-8 p-6 bg-blue-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Testing Instructions</h2>
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>Click "Test Connection" to verify database connectivity</li>
          <li>Click "Create Project" to test project creation</li>
          <li>Click "Create Idea" to test idea creation</li>
          <li>Click "Run All Tests" to execute a comprehensive test suite</li>
          <li>Use the individual buttons on projects to test specific operations</li>
          <li>Refresh the page to verify data persistence</li>
          <li>Check the test results above for any errors</li>
        </ol>
      </div>
    </div>
  )
}
