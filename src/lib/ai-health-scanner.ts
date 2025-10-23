'use server'

import { supabase } from './supabase'

export interface HealthIndicator {
  type: 'warning' | 'success' | 'info' | 'critical'
  message: string
  suggestion?: string
}

export interface ProjectHealthAnalysis {
  projectId: string
  healthScore: number
  indicators: HealthIndicator[]
  lastActivity: string
  daysSinceUpdate: number
  status: 'healthy' | 'needs_attention' | 'critical' | 'stalled'
}

export interface PortfolioInsight {
  type: 'conflict' | 'synergy' | 'resource_issue' | 'opportunity'
  title: string
  description: string
  affectedProjects: string[]
  priority: 'low' | 'medium' | 'high' | 'critical'
  suggestion: string
}

// ============================================================================
// AI PROJECT HEALTH SCANNER
// ============================================================================

export async function analyzeProjectHealth(projectId: string, userId: string): Promise<{
  success: boolean
  analysis?: ProjectHealthAnalysis
  error?: string
}> {
  try {
    // Get project details
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select(`
        *,
        project_tags (
          tag_name
        ),
        ai_interactions (
          id,
          interaction_type,
          created_at
        )
      `)
      .eq('id', projectId)
      .eq('user_id', userId)
      .single()

    if (projectError || !project) {
      return { success: false, error: 'Project not found' }
    }

    const indicators: HealthIndicator[] = []
    let healthScore = 100

    // Calculate days since last activity
    const lastActivity = new Date(project.last_activity)
    const now = new Date()
    const daysSinceUpdate = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24))

    // Analyze project status
    if (project.status === 'stalled') {
      indicators.push({
        type: 'critical',
        message: 'Project has been marked as stalled',
        suggestion: 'Consider reviewing assumptions or pivoting strategy'
      })
      healthScore -= 30
    } else if (project.status === 'active') {
      if (daysSinceUpdate > 14) {
        indicators.push({
          type: 'warning',
          message: `No activity for ${daysSinceUpdate} days`,
          suggestion: 'Schedule a review session or update project status'
        })
        healthScore -= 20
      } else if (daysSinceUpdate > 7) {
        indicators.push({
          type: 'info',
          message: `Last activity ${daysSinceUpdate} days ago`,
          suggestion: 'Consider scheduling next steps'
        })
        healthScore -= 10
      }
    }

    // Analyze tags for strategic insights
    const tags = project.project_tags?.map((t: { tag_name: string }) => t.tag_name) || []
    if (tags.length === 0) {
      indicators.push({
        type: 'info',
        message: 'No tags assigned',
        suggestion: 'Add tags to help categorize and track this project'
      })
      healthScore -= 5
    }

    // Analyze AI interactions
    const interactions = project.ai_interactions || []
    const recentInteractions = interactions.filter((i: { created_at: string }) => {
      const interactionDate = new Date(i.created_at)
      return (now.getTime() - interactionDate.getTime()) / (1000 * 60 * 60 * 24) <= 7
    })

    if (interactions.length === 0) {
      indicators.push({
        type: 'info',
        message: 'No AI analysis performed',
        suggestion: 'Try the assumption challenger or health scanner for strategic insights'
      })
      healthScore -= 10
    } else if (recentInteractions.length === 0) {
      indicators.push({
        type: 'info',
        message: 'No recent AI analysis',
        suggestion: 'Run a fresh analysis to get updated insights'
      })
      healthScore -= 5
    }

    // Determine overall status
    let status: ProjectHealthAnalysis['status'] = 'healthy'
    if (healthScore < 30) {
      status = 'critical'
    } else if (healthScore < 60) {
      status = 'needs_attention'
    } else if (project.status === 'stalled' || daysSinceUpdate > 21) {
      status = 'stalled'
    }

    const analysis: ProjectHealthAnalysis = {
      projectId,
      healthScore: Math.max(0, healthScore),
      indicators,
      lastActivity: project.last_activity,
      daysSinceUpdate,
      status
    }

    // Store the analysis
    await supabase
      .from('project_health_metrics')
      .insert({
        project_id: projectId,
        health_score: healthScore,
        health_indicators: indicators,
        last_scan: new Date().toISOString()
      })

    return { success: true, analysis }
  } catch (error) {
    console.error('Error analyzing project health:', error)
    return { success: false, error: 'Failed to analyze project health' }
  }
}

export async function analyzePortfolioHealth(userId: string): Promise<{
  success: boolean
  analyses?: ProjectHealthAnalysis[]
  insights?: PortfolioInsight[]
  error?: string
}> {
  try {
    // Get all user projects
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select(`
        *,
        project_tags (
          tag_name
        )
      `)
      .eq('user_id', userId)

    if (projectsError) {
      return { success: false, error: projectsError.message }
    }

    if (!projects || projects.length === 0) {
      return { success: true, analyses: [], insights: [] }
    }

    // Analyze each project
    const analyses: ProjectHealthAnalysis[] = []
    for (const project of projects) {
      const { success, analysis } = await analyzeProjectHealth(project.id, userId)
      if (success && analysis) {
        analyses.push(analysis)
      }
    }

    // Generate portfolio insights
    const insights = await generatePortfolioInsights(projects, analyses)

    return { success: true, analyses, insights }
  } catch (error) {
    console.error('Error analyzing portfolio health:', error)
    return { success: false, error: 'Failed to analyze portfolio health' }
  }
}

async function generatePortfolioInsights(projects: any[], analyses: ProjectHealthAnalysis[]): Promise<PortfolioInsight[]> {
  const insights: PortfolioInsight[] = []

  // Check for resource conflicts
  const activeProjects = projects.filter(p => p.status === 'active')
  if (activeProjects.length > 5) {
    insights.push({
      type: 'resource_issue',
      title: 'Too Many Active Projects',
      description: `You have ${activeProjects.length} active projects. This may lead to context switching and reduced focus.`,
      affectedProjects: activeProjects.map(p => p.id),
      priority: 'high',
      suggestion: 'Consider pausing or consolidating some projects to focus on the most critical ones.'
    })
  }

  // Check for stalled projects
  const stalledProjects = analyses.filter(a => a.status === 'stalled' || a.status === 'critical')
  if (stalledProjects.length > 0) {
    insights.push({
      type: 'conflict',
      title: 'Stalled Projects Need Attention',
      description: `${stalledProjects.length} project(s) are stalled or in critical condition.`,
      affectedProjects: stalledProjects.map(a => a.projectId),
      priority: 'critical',
      suggestion: 'Review stalled projects and either revive them with new strategies or archive them to reduce cognitive load.'
    })
  }

  // Check for tag synergies
  const allTags = projects.flatMap(p => p.project_tags?.map((t: any) => t.tag_name) || [])
  const tagCounts = allTags.reduce((acc, tag) => {
    acc[tag] = (acc[tag] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const commonTags = Object.entries(tagCounts).filter(([_, count]) => (count as number) > 1)
  if (commonTags.length > 0) {
    insights.push({
      type: 'synergy',
      title: 'Potential Project Synergies',
      description: `Found common themes across projects: ${commonTags.map(([tag, count]) => `${tag} (${count} projects)`).join(', ')}.`,
      affectedProjects: projects.filter(p => 
        p.project_tags?.some((t: any) => commonTags.some(([tag]) => tag === t.tag_name))
      ).map(p => p.id),
      priority: 'medium',
      suggestion: 'Consider how these projects might complement each other or if they could be combined for greater impact.'
    })
  }

  // Check for priority distribution
  const highPriorityProjects = projects.filter(p => p.priority === 'critical' || p.priority === 'high')
  if (highPriorityProjects.length > 3) {
    insights.push({
      type: 'resource_issue',
      title: 'High Priority Overload',
      description: `You have ${highPriorityProjects.length} high-priority projects. This may indicate unclear prioritization.`,
      affectedProjects: highPriorityProjects.map(p => p.id),
      priority: 'medium',
      suggestion: 'Review your priority matrix and ensure you\'re focusing on the most impactful projects.'
    })
  }

  return insights
}

// ============================================================================
// HEALTH SCANNER API ROUTE
// ============================================================================

export async function runHealthScan(userId: string, projectId?: string): Promise<{
  success: boolean
  results?: {
    projectAnalyses?: ProjectHealthAnalysis[]
    portfolioInsights?: PortfolioInsight[]
  }
  error?: string
}> {
  try {
    if (projectId) {
      // Single project analysis
      const { success, analysis, error } = await analyzeProjectHealth(projectId, userId)
      if (!success) {
        return { success: false, error }
      }
      return { 
        success: true, 
        results: { 
          projectAnalyses: analysis ? [analysis] : [] 
        } 
      }
    } else {
      // Full portfolio analysis
      const { success, analyses, insights, error } = await analyzePortfolioHealth(userId)
      if (!success) {
        return { success: false, error }
      }
      return { 
        success: true, 
        results: { 
          projectAnalyses: analyses, 
          portfolioInsights: insights 
        } 
      }
    }
  } catch (error) {
    console.error('Error running health scan:', error)
    return { success: false, error: 'Failed to run health scan' }
  }
}
