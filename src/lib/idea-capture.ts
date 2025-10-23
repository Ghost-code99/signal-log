'use server'

import { supabase } from './supabase'

export interface Idea {
  id: string
  user_id: string
  content: string
  suggested_tags: string[]
  related_project_id?: string
  status: 'captured' | 'processed' | 'integrated' | 'dismissed'
  created_at: string
}

export interface IdeaSuggestion {
  idea: string
  suggestedTags: string[]
  relatedProject?: {
    id: string
    title: string
    matchScore: number
  }
  confidence: number
}

// ============================================================================
// SMART IDEA CAPTURE
// ============================================================================

export async function captureIdea(
  content: string,
  userId: string,
  manualTags?: string[]
): Promise<{
  success: boolean
  idea?: Idea
  suggestions?: IdeaSuggestion
  error?: string
}> {
  try {
    // Generate AI suggestions for tags and project matching
    const suggestions = await generateIdeaSuggestions(content, userId)

    const idea: Idea = {
      id: `idea-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      user_id: userId,
      content,
      suggested_tags: suggestions.suggestedTags,
      related_project_id: suggestions.relatedProject?.id,
      status: 'captured',
      created_at: new Date().toISOString()
    }

    // Store the idea
    const { data: savedIdea, error } = await supabase
      .from('ideas')
      .insert({
        id: idea.id,
        user_id: userId,
        content,
        suggested_tags: suggestions.suggestedTags,
        related_project_id: suggestions.relatedProject?.id,
        status: 'captured'
      })
      .select()
      .single()

    if (error) {
      console.error('Error saving idea:', error)
      return { success: false, error: error.message }
    }

    return { 
      success: true, 
      idea: savedIdea,
      suggestions: {
        idea: content,
        suggestedTags: suggestions.suggestedTags,
        relatedProject: suggestions.relatedProject,
        confidence: suggestions.confidence
      }
    }
  } catch (error) {
    console.error('Error capturing idea:', error)
    return { success: false, error: 'Failed to capture idea' }
  }
}

async function generateIdeaSuggestions(content: string, userId: string): Promise<{
  suggestedTags: string[]
  relatedProject?: {
    id: string
    title: string
    matchScore: number
  }
  confidence: number
}> {
  try {
    // Get user's existing projects and tags for context
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select(`
        id,
        title,
        description,
        project_tags (
          tag_name
        )
      `)
      .eq('user_id', userId)

    if (projectsError) {
      console.error('Error fetching projects for idea suggestions:', projectsError)
    }

    // Simple keyword-based tag suggestion (in a real app, this would use AI)
    const suggestedTags = extractTagsFromContent(content)
    
    // Find related project based on keyword matching
    let relatedProject: { id: string; title: string; matchScore: number } | undefined
    let confidence = 0.5

    if (projects && projects.length > 0) {
      const contentLower = content.toLowerCase()
      let bestMatch = { score: 0, project: null as any }
      
      for (const project of projects) {
        let score = 0
        const projectText = `${project.title} ${project.description}`.toLowerCase()
        
        // Check for keyword matches
        const keywords = contentLower.split(' ').filter(word => word.length > 3)
        for (const keyword of keywords) {
          if (projectText.includes(keyword)) {
            score += 1
          }
        }
        
        // Check tag matches
        const projectTags = project.project_tags?.map((t: any) => t.tag_name.toLowerCase()) || []
        for (const tag of projectTags) {
          if (contentLower.includes(tag)) {
            score += 2
          }
        }
        
        if (score > bestMatch.score) {
          bestMatch = { score, project }
        }
      }
      
      if (bestMatch.score > 0) {
        relatedProject = {
          id: bestMatch.project.id,
          title: bestMatch.project.title,
          matchScore: bestMatch.score
        }
        confidence = Math.min(0.9, 0.5 + (bestMatch.score * 0.1))
      }
    }

    return {
      suggestedTags,
      relatedProject,
      confidence
    }
  } catch (error) {
    console.error('Error generating idea suggestions:', error)
    return {
      suggestedTags: extractTagsFromContent(content),
      confidence: 0.3
    }
  }
}

function extractTagsFromContent(content: string): string[] {
  // Simple keyword extraction (in a real app, this would use NLP)
  const commonTags = [
    'Growth', 'Product', 'Marketing', 'Sales', 'Fundraising', 'Technical',
    'User Research', 'Strategy', 'Operations', 'Partnership', 'Content',
    'Analytics', 'Design', 'Development', 'Testing', 'Launch'
  ]
  
  const contentLower = content.toLowerCase()
  const matchedTags = commonTags.filter(tag => 
    contentLower.includes(tag.toLowerCase()) ||
    contentLower.includes(tag.toLowerCase().slice(0, -1)) // Remove 's' for plurals
  )
  
  // Add some generic tags based on content analysis
  const additionalTags = []
  if (contentLower.includes('user') || contentLower.includes('customer')) {
    additionalTags.push('User Research')
  }
  if (contentLower.includes('revenue') || contentLower.includes('money')) {
    additionalTags.push('Revenue')
  }
  if (contentLower.includes('launch') || contentLower.includes('release')) {
    additionalTags.push('Launch')
  }
  if (contentLower.includes('test') || contentLower.includes('experiment')) {
    additionalTags.push('Testing')
  }
  
  return [...matchedTags, ...additionalTags].slice(0, 5) // Limit to 5 tags
}

export async function getIdeas(userId: string, status?: Idea['status']): Promise<{
  success: boolean
  ideas?: Idea[]
  error?: string
}> {
  try {
    let query = supabase
      .from('ideas')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data: ideas, error } = await query

    if (error) {
      console.error('Error fetching ideas:', error)
      return { success: false, error: error.message }
    }

    return { success: true, ideas: ideas || [] }
  } catch (error) {
    console.error('Error fetching ideas:', error)
    return { success: false, error: 'Failed to fetch ideas' }
  }
}

export async function updateIdeaStatus(
  ideaId: string,
  status: Idea['status'],
  userId: string
): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const { error } = await supabase
      .from('ideas')
      .update({ status })
      .eq('id', ideaId)
      .eq('user_id', userId)

    if (error) {
      console.error('Error updating idea status:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error updating idea status:', error)
    return { success: false, error: 'Failed to update idea status' }
  }
}

export async function linkIdeaToProject(
  ideaId: string,
  projectId: string,
  userId: string
): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const { error } = await supabase
      .from('ideas')
      .update({ 
        related_project_id: projectId,
        status: 'integrated'
      })
      .eq('id', ideaId)
      .eq('user_id', userId)

    if (error) {
      console.error('Error linking idea to project:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error linking idea to project:', error)
    return { success: false, error: 'Failed to link idea to project' }
  }
}

export async function getIdeaSuggestions(userId: string): Promise<{
  success: boolean
  suggestions?: {
    recentIdeas: Idea[]
    unprocessedIdeas: Idea[]
    relatedProjects: any[]
  }
  error?: string
}> {
  try {
    // Get recent ideas
    const { data: recentIdeas, error: recentError } = await supabase
      .from('ideas')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'captured')
      .order('created_at', { ascending: false })
      .limit(5)

    if (recentError) {
      console.error('Error fetching recent ideas:', recentError)
    }

    // Get unprocessed ideas
    const { data: unprocessedIdeas, error: unprocessedError } = await supabase
      .from('ideas')
      .select('*')
      .eq('user_id', userId)
      .in('status', ['captured', 'processed'])
      .order('created_at', { ascending: false })

    if (unprocessedError) {
      console.error('Error fetching unprocessed ideas:', unprocessedError)
    }

    // Get related projects
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('id, title, status')
      .eq('user_id', userId)
      .in('status', ['idea', 'active'])

    if (projectsError) {
      console.error('Error fetching projects:', projectsError)
    }

    return {
      success: true,
      suggestions: {
        recentIdeas: recentIdeas || [],
        unprocessedIdeas: unprocessedIdeas || [],
        relatedProjects: projects || []
      }
    }
  } catch (error) {
    console.error('Error getting idea suggestions:', error)
    return { success: false, error: 'Failed to get idea suggestions' }
  }
}

// ============================================================================
// IDEA CAPTURE API ROUTE
// ============================================================================

export async function processIdeaCapture(
  content: string,
  userId: string,
  manualTags?: string[]
): Promise<{
  success: boolean
  idea?: Idea
  suggestions?: IdeaSuggestion
  error?: string
}> {
  try {
    return await captureIdea(content, userId, manualTags)
  } catch (error) {
    console.error('Error processing idea capture:', error)
    return { success: false, error: 'Failed to process idea capture' }
  }
}
