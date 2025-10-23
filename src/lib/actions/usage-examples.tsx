// Server Actions Usage Examples
// This file shows how to use server actions in React components

'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../auth-context'

// Import all server actions
import { 
  createProject, 
  getUserProjects, 
  getProject, 
  updateProject, 
  deleteProject,
  addProjectTag,
  removeProjectTag 
} from './project-actions'

import { 
  createIdea, 
  getUserIdeas, 
  updateIdea, 
  deleteIdea 
} from './idea-actions'

import { 
  createAIInteraction, 
  getProjectAIInteractions 
} from './ai-actions'

import { 
  createHealthMetric, 
  getLatestProjectHealth 
} from './health-actions'

// ========================================
// PROJECT MANAGEMENT EXAMPLES
// ========================================

export function ProjectManagementExample() {
  const { user } = useAuth()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load user projects
  const loadProjects = async () => {
    if (!user) return
    
    setLoading(true)
    setError(null)
    
    const result = await getUserProjects(user.id)
    
    if (result.success) {
      setProjects(result.data || [])
    } else {
      setError(result.error || 'Unknown error')
    }
    
    setLoading(false)
  }

  // Create a new project
  const handleCreateProject = async (projectData: {
    title: string
    description?: string
    status?: 'idea' | 'active' | 'stalled' | 'validated' | 'abandoned'
    priority?: 'low' | 'medium' | 'high' | 'critical'
  }) => {
    if (!user) return
    
    setLoading(true)
    setError(null)
    
    const result = await createProject(user.id, projectData)
    
    if (result.success) {
      // Refresh projects list
      await loadProjects()
    } else {
      setError(result.error || 'Unknown error')
    }
    
    setLoading(false)
  }

  // Update a project
  const handleUpdateProject = async (projectId: string, updates: {
    title?: string
    description?: string
    status?: 'idea' | 'active' | 'stalled' | 'validated' | 'abandoned'
    priority?: 'low' | 'medium' | 'high' | 'critical'
  }) => {
    if (!user) return
    
    setLoading(true)
    setError(null)
    
    const result = await updateProject(projectId, user.id, updates)
    
    if (result.success) {
      // Refresh projects list
      await loadProjects()
    } else {
      setError(result.error || 'Unknown error')
    }
    
    setLoading(false)
  }

  // Delete a project
  const handleDeleteProject = async (projectId: string) => {
    if (!user) return
    
    setLoading(true)
    setError(null)
    
    const result = await deleteProject(projectId, user.id)
    
    if (result.success) {
      // Refresh projects list
      await loadProjects()
    } else {
      setError(result.error || 'Unknown error')
    }
    
    setLoading(false)
  }

  // Add a tag to a project
  const handleAddTag = async (projectId: string, tagName: string) => {
    if (!user) return
    
    setLoading(true)
    setError(null)
    
    const result = await addProjectTag(projectId, user.id, tagName)
    
    if (result.success) {
      // Refresh projects list
      await loadProjects()
    } else {
      setError(result.error || 'Unknown error')
    }
    
    setLoading(false)
  }

  // Load projects on component mount
  useEffect(() => {
    loadProjects()
  }, [user])

  return {
    projects,
    loading,
    error,
    createProject: handleCreateProject,
    updateProject: handleUpdateProject,
    deleteProject: handleDeleteProject,
    addTag: handleAddTag,
    refreshProjects: loadProjects
  }
}

// ========================================
// IDEA MANAGEMENT EXAMPLES
// ========================================

export function IdeaManagementExample() {
  const { user } = useAuth()
  const [ideas, setIdeas] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load user ideas
  const loadIdeas = async (status?: 'captured' | 'processed' | 'integrated' | 'dismissed') => {
    if (!user) return
    
    setLoading(true)
    setError(null)
    
    const result = await getUserIdeas(user.id, status)
    
    if (result.success) {
      setIdeas(result.data || [])
    } else {
      setError(result.error || 'Unknown error')
    }
    
    setLoading(false)
  }

  // Create a new idea
  const handleCreateIdea = async (ideaData: {
    content: string
    suggested_tags?: string[]
    related_project_id?: string
  }) => {
    if (!user) return
    
    setLoading(true)
    setError(null)
    
    const result = await createIdea(user.id, ideaData)
    
    if (result.success) {
      // Refresh ideas list
      await loadIdeas()
    } else {
      setError(result.error || 'Unknown error')
    }
    
    setLoading(false)
  }

  // Update an idea
  const handleUpdateIdea = async (ideaId: string, updates: {
    content?: string
    suggested_tags?: string[]
    related_project_id?: string
    status?: 'captured' | 'processed' | 'integrated' | 'dismissed'
  }) => {
    if (!user) return
    
    setLoading(true)
    setError(null)
    
    const result = await updateIdea(ideaId, user.id, updates)
    
    if (result.success) {
      // Refresh ideas list
      await loadIdeas()
    } else {
      setError(result.error || 'Unknown error')
    }
    
    setLoading(false)
  }

  // Delete an idea
  const handleDeleteIdea = async (ideaId: string) => {
    if (!user) return
    
    setLoading(true)
    setError(null)
    
    const result = await deleteIdea(ideaId, user.id)
    
    if (result.success) {
      // Refresh ideas list
      await loadIdeas()
    } else {
      setError(result.error || 'Unknown error')
    }
    
    setLoading(false)
  }

  return {
    ideas,
    loading,
    error,
    createIdea: handleCreateIdea,
    updateIdea: handleUpdateIdea,
    deleteIdea: handleDeleteIdea,
    loadIdeas,
    refreshIdeas: loadIdeas
  }
}

// ========================================
// AI INTERACTIONS EXAMPLES
// ========================================

export function AIInteractionsExample() {
  const { user } = useAuth()
  const [interactions, setInteractions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load AI interactions for a project
  const loadProjectInteractions = async (projectId: string) => {
    if (!user) return
    
    setLoading(true)
    setError(null)
    
    const result = await getProjectAIInteractions(projectId, user.id)
    
    if (result.success) {
      setInteractions(result.data || [])
    } else {
      setError(result.error || 'Unknown error')
    }
    
    setLoading(false)
  }

  // Create an AI interaction
  const handleCreateAIInteraction = async (interactionData: {
    project_id: string
    interaction_type: 'health_scan' | 'assumption_challenge' | 'strategy_analysis' | 'experiment_generated'
    content: string
    ai_response?: string
    metadata?: Record<string, any>
  }) => {
    if (!user) return
    
    setLoading(true)
    setError(null)
    
    const result = await createAIInteraction(user.id, interactionData)
    
    if (result.success) {
      // Refresh interactions list
      await loadProjectInteractions(interactionData.project_id)
    } else {
      setError(result.error || 'Unknown error')
    }
    
    setLoading(false)
  }

  return {
    interactions,
    loading,
    error,
    createAIInteraction: handleCreateAIInteraction,
    loadProjectInteractions,
    refreshInteractions: loadProjectInteractions
  }
}

// ========================================
// HEALTH METRICS EXAMPLES
// ========================================

export function HealthMetricsExample() {
  const { user } = useAuth()
  const [healthMetrics, setHealthMetrics] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load health metrics for a project
  const loadProjectHealth = async (projectId: string) => {
    if (!user) return
    
    setLoading(true)
    setError(null)
    
    const result = await getLatestProjectHealth(projectId, user.id)
    
    if (result.success) {
      setHealthMetrics(result.data)
    } else {
      setError(result.error || 'Unknown error')
    }
    
    setLoading(false)
  }

  // Create health metrics
  const handleCreateHealthMetric = async (healthData: {
    project_id: string
    health_score: number
    health_indicators: Record<string, any>
  }) => {
    if (!user) return
    
    setLoading(true)
    setError(null)
    
    const result = await createHealthMetric(user.id, healthData)
    
    if (result.success) {
      // Refresh health metrics
      await loadProjectHealth(healthData.project_id)
    } else {
      setError(result.error || 'Unknown error')
    }
    
    setLoading(false)
  }

  return {
    healthMetrics,
    loading,
    error,
    createHealthMetric: handleCreateHealthMetric,
    loadProjectHealth,
    refreshHealth: loadProjectHealth
  }
}

// ========================================
// ERROR HANDLING UTILITIES
// ========================================

export function useErrorHandler() {
  const [error, setError] = useState<string | null>(null)

  const handleError = (error: any) => {
    console.error('Server action error:', error)
    setError(error instanceof Error ? error.message : 'Unknown error')
  }

  const clearError = () => setError(null)

  return {
    error,
    handleError,
    clearError
  }
}

// ========================================
// LOADING STATE UTILITIES
// ========================================

export function useLoadingState() {
  const [loading, setLoading] = useState(false)

  const executeWithLoading = async (action: () => Promise<any>) => {
    setLoading(true)
    try {
      const result = await action()
      return result
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    executeWithLoading
  }
}
