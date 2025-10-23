'use server'

import { supabase } from './supabase'
import { revalidatePath } from 'next/cache'

export interface Project {
  id: string
  user_id: string
  title: string
  description: string
  status: 'idea' | 'active' | 'stalled' | 'validated' | 'abandoned'
  priority: 'low' | 'medium' | 'high' | 'critical'
  last_activity: string
  created_at: string
  updated_at: string
}

export interface ProjectTag {
  id: string
  project_id: string
  tag_name: string
  created_at: string
}

export interface CreateProjectInput {
  title: string
  description: string
  status?: Project['status']
  priority?: Project['priority']
  tags?: string[]
}

export interface UpdateProjectInput {
  id: string
  title?: string
  description?: string
  status?: Project['status']
  priority?: Project['priority']
  tags?: string[]
}

export interface DashboardStats {
  totalProjects: number
  activeProjects: number
  ideasThisWeek: number
  experimentsInProgress: number
}

// ============================================================================
// PROJECT CRUD OPERATIONS
// ============================================================================

export async function createProject(input: CreateProjectInput, userId: string): Promise<{
  success: boolean
  project?: Project
  error?: string
}> {
  try {
    const { data: project, error } = await supabase
      .from('projects')
      .insert({
        user_id: userId,
        title: input.title,
        description: input.description,
        status: input.status || 'idea',
        priority: input.priority || 'medium',
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating project:', error)
      return { success: false, error: error.message }
    }

    // Add tags if provided
    if (input.tags && input.tags.length > 0) {
      const tagInserts = input.tags.map(tag => ({
        project_id: project.id,
        tag_name: tag
      }))

      const { error: tagError } = await supabase
        .from('project_tags')
        .insert(tagInserts)

      if (tagError) {
        console.error('Error adding tags:', tagError)
        // Don't fail the whole operation for tag errors
      }
    }

    revalidatePath('/dashboard')
    return { success: true, project }
  } catch (error) {
    console.error('Error creating project:', error)
    return { success: false, error: 'Failed to create project' }
  }
}

export async function updateProject(input: UpdateProjectInput, userId: string): Promise<{
  success: boolean
  project?: Project
  error?: string
}> {
  try {
    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (input.title !== undefined) updateData.title = input.title
    if (input.description !== undefined) updateData.description = input.description
    if (input.status !== undefined) updateData.status = input.status
    if (input.priority !== undefined) updateData.priority = input.priority

    const { data: project, error } = await supabase
      .from('projects')
      .update(updateData)
      .eq('id', input.id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating project:', error)
      return { success: false, error: error.message }
    }

    // Update tags if provided
    if (input.tags !== undefined) {
      // Delete existing tags
      await supabase
        .from('project_tags')
        .delete()
        .eq('project_id', input.id)

      // Insert new tags
      if (input.tags.length > 0) {
        const tagInserts = input.tags.map(tag => ({
          project_id: input.id,
          tag_name: tag
        }))

        const { error: tagError } = await supabase
          .from('project_tags')
          .insert(tagInserts)

        if (tagError) {
          console.error('Error updating tags:', tagError)
        }
      }
    }

    revalidatePath('/dashboard')
    return { success: true, project }
  } catch (error) {
    console.error('Error updating project:', error)
    return { success: false, error: 'Failed to update project' }
  }
}

export async function deleteProject(projectId: string, userId: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId)
      .eq('user_id', userId)

    if (error) {
      console.error('Error deleting project:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/dashboard')
    return { success: true }
  } catch (error) {
    console.error('Error deleting project:', error)
    return { success: false, error: 'Failed to delete project' }
  }
}

export async function getProjects(userId: string): Promise<{
  success: boolean
  projects?: Project[]
  error?: string
}> {
  try {
    const { data: projects, error } = await supabase
      .from('projects')
      .select(`
        *,
        project_tags (
          id,
          tag_name
        )
      `)
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Error fetching projects:', error)
      return { success: false, error: error.message }
    }

    return { success: true, projects: projects || [] }
  } catch (error) {
    console.error('Error fetching projects:', error)
    return { success: false, error: 'Failed to fetch projects' }
  }
}

export async function getProject(projectId: string, userId: string): Promise<{
  success: boolean
  project?: Project
  error?: string
}> {
  try {
    const { data: project, error } = await supabase
      .from('projects')
      .select(`
        *,
        project_tags (
          id,
          tag_name
        )
      `)
      .eq('id', projectId)
      .eq('user_id', userId)
      .single()

    if (error) {
      console.error('Error fetching project:', error)
      return { success: false, error: error.message }
    }

    return { success: true, project }
  } catch (error) {
    console.error('Error fetching project:', error)
    return { success: false, error: 'Failed to fetch project' }
  }
}

// ============================================================================
// DASHBOARD STATISTICS
// ============================================================================

export async function getDashboardStats(userId: string): Promise<{
  success: boolean
  stats?: DashboardStats
  error?: string
}> {
  try {
    // Get project counts
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('status')
      .eq('user_id', userId)

    if (projectsError) {
      console.error('Error fetching projects for stats:', projectsError)
      return { success: false, error: projectsError.message }
    }

    const totalProjects = projects?.length || 0
    const activeProjects = projects?.filter(p => p.status === 'active').length || 0

    // Get ideas from the past week
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    const { data: ideas, error: ideasError } = await supabase
      .from('ideas')
      .select('id')
      .eq('user_id', userId)
      .gte('created_at', oneWeekAgo.toISOString())

    if (ideasError) {
      console.error('Error fetching ideas for stats:', ideasError)
      return { success: false, error: ideasError.message }
    }

    const ideasThisWeek = ideas?.length || 0

    // Get experiments in progress
    const { data: experiments, error: experimentsError } = await supabase
      .from('ai_interactions')
      .select('id')
      .eq('user_id', userId)
      .eq('interaction_type', 'experiment_generated')

    if (experimentsError) {
      console.error('Error fetching experiments for stats:', experimentsError)
      return { success: false, error: experimentsError.message }
    }

    const experimentsInProgress = experiments?.length || 0

    const stats: DashboardStats = {
      totalProjects,
      activeProjects,
      ideasThisWeek,
      experimentsInProgress
    }

    return { success: true, stats }
  } catch (error) {
    console.error('Error calculating dashboard stats:', error)
    return { success: false, error: 'Failed to calculate stats' }
  }
}

// ============================================================================
// PROJECT TAGS
// ============================================================================

export async function getProjectTags(projectId: string): Promise<{
  success: boolean
  tags?: ProjectTag[]
  error?: string
}> {
  try {
    const { data: tags, error } = await supabase
      .from('project_tags')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching project tags:', error)
      return { success: false, error: error.message }
    }

    return { success: true, tags: tags || [] }
  } catch (error) {
    console.error('Error fetching project tags:', error)
    return { success: false, error: 'Failed to fetch tags' }
  }
}

export async function addProjectTag(projectId: string, tagName: string, userId: string): Promise<{
  success: boolean
  tag?: ProjectTag
  error?: string
}> {
  try {
    // Verify project belongs to user
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single()

    if (projectError || !project) {
      return { success: false, error: 'Project not found' }
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
      console.error('Error adding project tag:', error)
      return { success: false, error: error.message }
    }

    return { success: true, tag }
  } catch (error) {
    console.error('Error adding project tag:', error)
    return { success: false, error: 'Failed to add tag' }
  }
}

export async function removeProjectTag(tagId: string, userId: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    // Verify tag belongs to user's project
    const { data: tag, error: tagError } = await supabase
      .from('project_tags')
      .select(`
        id,
        projects!inner(user_id)
      `)
      .eq('id', tagId)
      .single()

    if (tagError || !tag) {
      return { success: false, error: 'Tag not found' }
    }

    const { error } = await supabase
      .from('project_tags')
      .delete()
      .eq('id', tagId)

    if (error) {
      console.error('Error removing project tag:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error removing project tag:', error)
    return { success: false, error: 'Failed to remove tag' }
  }
}
