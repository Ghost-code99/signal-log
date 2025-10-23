'use server'

import { createServerClient } from '../supabase-server'

// ========================================
// HEALTH METRICS SERVER ACTIONS
// ========================================

export interface HealthMetric {
  id: string
  project_id: string
  health_score: number | null
  health_indicators: Record<string, any> | null
  last_scan: string
  created_at: string
}

export interface CreateHealthMetricData {
  project_id: string
  health_score: number
  health_indicators: Record<string, any>
}

export interface UpdateHealthMetricData {
  health_score?: number
  health_indicators?: Record<string, any>
}

/**
 * Create or update health metrics for a project
 */
export async function createHealthMetric(userId: string, data: CreateHealthMetricData) {
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

    const { data: healthMetric, error } = await supabase
      .from('project_health_metrics')
      .insert({
        project_id: data.project_id,
        health_score: data.health_score,
        health_indicators: data.health_indicators,
        last_scan: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create health metric: ${error.message}`)
    }

    return { success: true, data: healthMetric }
  } catch (error) {
    console.error('createHealthMetric error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * Get health metrics for a project
 */
export async function getProjectHealthMetrics(projectId: string, userId: string) {
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

    const { data: healthMetrics, error } = await supabase
      .from('project_health_metrics')
      .select('*')
      .eq('project_id', projectId)
      .order('last_scan', { ascending: false })

    if (error) {
      throw new Error(`Failed to get health metrics: ${error.message}`)
    }

    return { success: true, data: healthMetrics }
  } catch (error) {
    console.error('getProjectHealthMetrics error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * Get the latest health metrics for a project
 */
export async function getLatestProjectHealth(projectId: string, userId: string) {
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

    const { data: healthMetric, error } = await supabase
      .from('project_health_metrics')
      .select('*')
      .eq('project_id', projectId)
      .order('last_scan', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return { success: false, error: 'No health metrics found for this project' }
      }
      throw new Error(`Failed to get latest health metrics: ${error.message}`)
    }

    return { success: true, data: healthMetric }
  } catch (error) {
    console.error('getLatestProjectHealth error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * Update health metrics
 */
export async function updateHealthMetric(
  metricId: string, 
  userId: string, 
  updates: UpdateHealthMetricData
) {
  try {
    const supabase = createServerClient()
    
    // First verify the health metric belongs to a project owned by the user
    const { data: healthMetric, error: fetchError } = await supabase
      .from('project_health_metrics')
      .select(`
        id,
        projects!inner (
          user_id
        )
      `)
      .eq('id', metricId)
      .single()

    if (fetchError || (healthMetric as any)?.projects?.user_id !== userId) {
      return { success: false, error: 'Health metric not found or unauthorized' }
    }

    const { data: updatedMetric, error } = await supabase
      .from('project_health_metrics')
      .update({
        ...updates,
        last_scan: new Date().toISOString()
      })
      .eq('id', metricId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update health metric: ${error.message}`)
    }

    return { success: true, data: updatedMetric }
  } catch (error) {
    console.error('updateHealthMetric error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * Delete health metrics for a project
 */
export async function deleteProjectHealthMetrics(projectId: string, userId: string) {
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
      .from('project_health_metrics')
      .delete()
      .eq('project_id', projectId)

    if (error) {
      throw new Error(`Failed to delete health metrics: ${error.message}`)
    }

    return { success: true }
  } catch (error) {
    console.error('deleteProjectHealthMetrics error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * Get health metrics summary for all user projects
 */
export async function getUserHealthSummary(userId: string) {
  try {
    const supabase = createServerClient()
    
    const { data: healthMetrics, error } = await supabase
      .from('project_health_metrics')
      .select(`
        *,
        projects!inner (
          id,
          title,
          user_id
        )
      `)
      .eq('projects.user_id', userId)
      .order('last_scan', { ascending: false })

    if (error) {
      throw new Error(`Failed to get health summary: ${error.message}`)
    }

    // Calculate summary statistics
    const summary = {
      total_projects: new Set(healthMetrics.map(m => m.project_id)).size,
      average_health_score: healthMetrics.length > 0 
        ? Math.round(healthMetrics.reduce((sum, m) => sum + (m.health_score || 0), 0) / healthMetrics.length)
        : 0,
      healthy_projects: healthMetrics.filter(m => (m.health_score || 0) >= 80).length,
      needs_attention: healthMetrics.filter(m => (m.health_score || 0) < 50).length,
      recent_scans: healthMetrics.slice(0, 5)
    }

    return { success: true, data: summary }
  } catch (error) {
    console.error('getUserHealthSummary error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}
