'use server'

import { createServerClient } from '../supabase-server'

// ========================================
// IDEA MANAGEMENT SERVER ACTIONS
// ========================================

export interface Idea {
  id: string
  user_id: string
  content: string
  suggested_tags: string[] | null
  related_project_id: string | null
  status: 'captured' | 'processed' | 'integrated' | 'dismissed'
  created_at: string
}

export interface CreateIdeaData {
  content: string
  suggested_tags?: string[]
  related_project_id?: string
}

export interface UpdateIdeaData {
  content?: string
  suggested_tags?: string[]
  related_project_id?: string
  status?: Idea['status']
}

/**
 * Create a new idea
 */
export async function createIdea(userId: string, data: CreateIdeaData) {
  try {
    const supabase = createServerClient()
    
    // If related_project_id is provided, verify it belongs to the user
    if (data.related_project_id) {
      const { data: project, error: fetchError } = await supabase
        .from('projects')
        .select('user_id')
        .eq('id', data.related_project_id)
        .single()

      if (fetchError || project?.user_id !== userId) {
        return { success: false, error: 'Related project not found or unauthorized' }
      }
    }

    const { data: idea, error } = await supabase
      .from('ideas')
      .insert({
        user_id: userId,
        content: data.content,
        suggested_tags: data.suggested_tags || null,
        related_project_id: data.related_project_id || null,
        status: 'captured'
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create idea: ${error.message}`)
    }

    return { success: true, data: idea }
  } catch (error) {
    console.error('createIdea error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * Get all ideas for a user
 */
export async function getUserIdeas(userId: string, status?: Idea['status']) {
  try {
    const supabase = createServerClient()
    
    let query = supabase
      .from('ideas')
      .select(`
        *,
        projects (
          id,
          title
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data: ideas, error } = await query

    if (error) {
      throw new Error(`Failed to get ideas: ${error.message}`)
    }

    return { success: true, data: ideas }
  } catch (error) {
    console.error('getUserIdeas error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * Get a single idea by ID
 */
export async function getIdea(ideaId: string, userId: string) {
  try {
    const supabase = createServerClient()
    
    const { data: idea, error } = await supabase
      .from('ideas')
      .select(`
        *,
        projects (
          id,
          title
        )
      `)
      .eq('id', ideaId)
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return { success: false, error: 'Idea not found' }
      }
      throw new Error(`Failed to get idea: ${error.message}`)
    }

    return { success: true, data: idea }
  } catch (error) {
    console.error('getIdea error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * Update an idea
 */
export async function updateIdea(ideaId: string, userId: string, updates: UpdateIdeaData) {
  try {
    const supabase = createServerClient()
    
    // If related_project_id is being updated, verify it belongs to the user
    if (updates.related_project_id) {
      const { data: project, error: fetchError } = await supabase
        .from('projects')
        .select('user_id')
        .eq('id', updates.related_project_id)
        .single()

      if (fetchError || project?.user_id !== userId) {
        return { success: false, error: 'Related project not found or unauthorized' }
      }
    }

    const { data: idea, error } = await supabase
      .from('ideas')
      .update(updates)
      .eq('id', ideaId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update idea: ${error.message}`)
    }

    return { success: true, data: idea }
  } catch (error) {
    console.error('updateIdea error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * Delete an idea
 */
export async function deleteIdea(ideaId: string, userId: string) {
  try {
    const supabase = createServerClient()
    
    const { error } = await supabase
      .from('ideas')
      .delete()
      .eq('id', ideaId)
      .eq('user_id', userId)

    if (error) {
      throw new Error(`Failed to delete idea: ${error.message}`)
    }

    return { success: true }
  } catch (error) {
    console.error('deleteIdea error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * Get ideas by status
 */
export async function getIdeasByStatus(userId: string, status: Idea['status']) {
  try {
    const supabase = createServerClient()
    
    const { data: ideas, error } = await supabase
      .from('ideas')
      .select(`
        *,
        projects (
          id,
          title
        )
      `)
      .eq('user_id', userId)
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to get ideas by status: ${error.message}`)
    }

    return { success: true, data: ideas }
  } catch (error) {
    console.error('getIdeasByStatus error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * Get ideas related to a specific project
 */
export async function getProjectIdeas(projectId: string, userId: string) {
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

    const { data: ideas, error } = await supabase
      .from('ideas')
      .select('*')
      .eq('related_project_id', projectId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to get project ideas: ${error.message}`)
    }

    return { success: true, data: ideas }
  } catch (error) {
    console.error('getProjectIdeas error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}
