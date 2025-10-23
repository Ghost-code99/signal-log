'use server'

import { createServerClient } from '../supabase-server'

// ========================================
// AI INTERACTIONS SERVER ACTIONS
// ========================================

export interface AIInteraction {
  id: string
  project_id: string
  user_id: string
  interaction_type: 'health_scan' | 'assumption_challenge' | 'strategy_analysis' | 'experiment_generated'
  content: string
  ai_response: string | null
  metadata: Record<string, any> | null
  created_at: string
}

export interface CreateAIInteractionData {
  project_id: string
  interaction_type: AIInteraction['interaction_type']
  content: string
  ai_response?: string
  metadata?: Record<string, any>
}

/**
 * Create an AI interaction record
 */
export async function createAIInteraction(userId: string, data: CreateAIInteractionData) {
  try {
    const supabase = createServerClient()
    
    // First verify the project belongs to the user
    const { data: project, error: fetchError } = await supabase
      .from('projects')
      .select('user_id')
      .eq('id', data.project_id)
      .single()

    if (fetchError || project?.user_id !== userId) {
      return { success: false, error: 'Project not found or unauthorized' }
    }

    const { data: interaction, error } = await supabase
      .from('ai_interactions')
      .insert({
        project_id: data.project_id,
        user_id: userId,
        interaction_type: data.interaction_type,
        content: data.content,
        ai_response: data.ai_response || null,
        metadata: data.metadata || null
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create AI interaction: ${error.message}`)
    }

    return { success: true, data: interaction }
  } catch (error) {
    console.error('createAIInteraction error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * Get AI interactions for a project
 */
export async function getProjectAIInteractions(projectId: string, userId: string) {
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

    const { data: interactions, error } = await supabase
      .from('ai_interactions')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to get AI interactions: ${error.message}`)
    }

    return { success: true, data: interactions }
  } catch (error) {
    console.error('getProjectAIInteractions error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * Get all AI interactions for a user
 */
export async function getUserAIInteractions(userId: string, limit: number = 50) {
  try {
    const supabase = createServerClient()
    
    const { data: interactions, error } = await supabase
      .from('ai_interactions')
      .select(`
        *,
        projects (
          id,
          title
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      throw new Error(`Failed to get AI interactions: ${error.message}`)
    }

    return { success: true, data: interactions }
  } catch (error) {
    console.error('getUserAIInteractions error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * Update an AI interaction (e.g., add AI response)
 */
export async function updateAIInteraction(
  interactionId: string, 
  userId: string, 
  updates: {
    ai_response?: string
    metadata?: Record<string, any>
  }
) {
  try {
    const supabase = createServerClient()
    
    // First verify the interaction belongs to the user
    const { data: interaction, error: fetchError } = await supabase
      .from('ai_interactions')
      .select('user_id')
      .eq('id', interactionId)
      .single()

    if (fetchError || interaction?.user_id !== userId) {
      return { success: false, error: 'AI interaction not found or unauthorized' }
    }

    const { data: updatedInteraction, error } = await supabase
      .from('ai_interactions')
      .update(updates)
      .eq('id', interactionId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update AI interaction: ${error.message}`)
    }

    return { success: true, data: updatedInteraction }
  } catch (error) {
    console.error('updateAIInteraction error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * Delete an AI interaction
 */
export async function deleteAIInteraction(interactionId: string, userId: string) {
  try {
    const supabase = createServerClient()
    
    const { error } = await supabase
      .from('ai_interactions')
      .delete()
      .eq('id', interactionId)
      .eq('user_id', userId)

    if (error) {
      throw new Error(`Failed to delete AI interaction: ${error.message}`)
    }

    return { success: true }
  } catch (error) {
    console.error('deleteAIInteraction error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}
