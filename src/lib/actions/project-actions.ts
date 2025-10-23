'use server'

import { createServerClient } from '../supabase-server'

// ========================================
// PROJECT MANAGEMENT SERVER ACTIONS
// ========================================

export interface Project {
  id: string
  user_id: string
  title: string
  description: string | null
  status: 'idea' | 'active' | 'stalled' | 'validated' | 'abandoned'
  priority: 'low' | 'medium' | 'high' | 'critical'
  last_activity: string
  created_at: string
  updated_at: string
}

export interface CreateProjectData {
  title: string
  description?: string
  status?: Project['status']
  priority?: Project['priority']
}

export interface UpdateProjectData {
  title?: string
  description?: string
  status?: Project['status']
  priority?: Project['priority']
}

export interface ProjectWithTags extends Project {
  project_tags: Array<{
    id: string
    tag_name: string
    created_at: string
  }>
}

/**
 * Create a new project
 */
export async function createProject(userId: string, data: CreateProjectData) {
  try {
    const supabase = createServerClient()
    
    const { data: project, error } = await supabase
      .from('projects')
      .insert({
        user_id: userId,
        title: data.title,
        description: data.description || null,
        status: data.status || 'idea',
        priority: data.priority || 'medium',
        last_activity: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create project: ${error.message}`)
    }

    return { success: true, data: project }
  } catch (error) {
    console.error('createProject error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * Get all projects for a user
 */
export async function getUserProjects(userId: string) {
  try {
    const supabase = createServerClient()
    
    const { data: projects, error } = await supabase
      .from('projects')
      .select(`
        *,
        project_tags (
          id,
          tag_name,
          created_at
        )
      `)
      .eq('user_id', userId)
      .order('last_activity', { ascending: false })

    if (error) {
      throw new Error(`Failed to get projects: ${error.message}`)
    }

    return { success: true, data: projects as ProjectWithTags[] }
  } catch (error) {
    console.error('getUserProjects error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * Get a single project by ID
 */
export async function getProject(projectId: string, userId: string) {
  try {
    const supabase = createServerClient()
    
    const { data: project, error } = await supabase
      .from('projects')
      .select(`
        *,
        project_tags (
          id,
          tag_name,
          created_at
        )
      `)
      .eq('id', projectId)
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return { success: false, error: 'Project not found' }
      }
      throw new Error(`Failed to get project: ${error.message}`)
    }

    return { success: true, data: project as ProjectWithTags }
  } catch (error) {
    console.error('getProject error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * Update a project
 */
export async function updateProject(projectId: string, userId: string, updates: UpdateProjectData) {
  try {
    const supabase = createServerClient()
    
    // First verify the project belongs to the user
    const { data: existingProject, error: fetchError } = await supabase
      .from('projects')
      .select('user_id')
      .eq('id', projectId)
      .single()

    if (fetchError || existingProject?.user_id !== userId) {
      return { success: false, error: 'Project not found or unauthorized' }
    }

    const { data: project, error } = await supabase
      .from('projects')
      .update({
        ...updates,
        last_activity: new Date().toISOString()
      })
      .eq('id', projectId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update project: ${error.message}`)
    }

    return { success: true, data: project }
  } catch (error) {
    console.error('updateProject error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * Delete a project
 */
export async function deleteProject(projectId: string, userId: string) {
  try {
    const supabase = createServerClient()
    
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId)
      .eq('user_id', userId)

    if (error) {
      throw new Error(`Failed to delete project: ${error.message}`)
    }

    return { success: true }
  } catch (error) {
    console.error('deleteProject error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * Add a tag to a project
 */
export async function addProjectTag(projectId: string, userId: string, tagName: string) {
  try {
    const supabase = createServerClient()
    
    // First verify the project belongs to the user
    const { data: project, error: fetchError } = await supabase
      .from('projects')
      .select('user_id')
      .eq('id', projectId)
      .single()

    if (fetchError || project?.user_id !== userId) {
      return { success: false, error: 'Project not found or unauthorized' }
    }

    const { data: tag, error } = await supabase
      .from('project_tags')
      .insert({
        project_id: projectId,
        tag_name: tagName
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return { success: false, error: 'Tag already exists for this project' }
      }
      throw new Error(`Failed to add tag: ${error.message}`)
    }

    return { success: true, data: tag }
  } catch (error) {
    console.error('addProjectTag error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * Remove a tag from a project
 */
export async function removeProjectTag(projectId: string, userId: string, tagId: string) {
  try {
    const supabase = createServerClient()
    
    // First verify the project belongs to the user
    const { data: project, error: fetchError } = await supabase
      .from('projects')
      .select('user_id')
      .eq('id', projectId)
      .single()

    if (fetchError || project?.user_id !== userId) {
      return { success: false, error: 'Project not found or unauthorized' }
    }

    const { error } = await supabase
      .from('project_tags')
      .delete()
      .eq('id', tagId)
      .eq('project_id', projectId)

    if (error) {
      throw new Error(`Failed to remove tag: ${error.message}`)
    }

    return { success: true }
  } catch (error) {
    console.error('removeProjectTag error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}
