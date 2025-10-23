// Advanced Search and Full-Text Indexing
// Provides powerful search capabilities across all data

import { supabaseClient } from './supabase-client'

export interface SearchResult {
  id: string
  table: string
  title: string
  content: string
  relevance: number
  highlights: string[]
  metadata: Record<string, any>
}

export interface SearchFilters {
  tables?: string[]
  dateRange?: {
    start: Date
    end: Date
  }
  status?: string[]
  tags?: string[]
  userId?: string
}

export interface SearchOptions {
  limit?: number
  offset?: number
  sortBy?: 'relevance' | 'date' | 'title'
  sortOrder?: 'asc' | 'desc'
  includeHighlights?: boolean
}

export class AdvancedSearchEngine {
  private static instance: AdvancedSearchEngine
  private searchIndex: Map<string, any> = new Map()

  static getInstance(): AdvancedSearchEngine {
    if (!AdvancedSearchEngine.instance) {
      AdvancedSearchEngine.instance = new AdvancedSearchEngine()
    }
    return AdvancedSearchEngine.instance
  }

  // Perform full-text search across all tables
  async search(
    query: string,
    filters: SearchFilters = {},
    options: SearchOptions = {}
  ): Promise<SearchResult[]> {
    const {
      limit = 20,
      offset = 0,
      sortBy = 'relevance',
      sortOrder = 'desc',
      includeHighlights = true
    } = options

    try {
      // Build search query for each table
      const searchPromises: Promise<SearchResult[]>[] = []

      // Search projects
      if (!filters.tables || filters.tables.includes('projects')) {
        searchPromises.push(this.searchProjects(query, filters, options))
      }

      // Search ideas
      if (!filters.tables || filters.tables.includes('ideas')) {
        searchPromises.push(this.searchIdeas(query, filters, options))
      }

      // Search AI interactions
      if (!filters.tables || filters.tables.includes('ai_interactions')) {
        searchPromises.push(this.searchAIInteractions(query, filters, options))
      }

      // Search project tags
      if (!filters.tables || filters.tables.includes('project_tags')) {
        searchPromises.push(this.searchProjectTags(query, filters, options))
      }

      // Execute all searches in parallel
      const results = await Promise.all(searchPromises)
      const allResults = results.flat()

      // Sort and limit results
      const sortedResults = this.sortResults(allResults, sortBy, sortOrder)
      const paginatedResults = sortedResults.slice(offset, offset + limit)

      return paginatedResults
    } catch (error) {
      console.error('Search failed:', error)
      throw new Error(`Search failed: ${error}`)
    }
  }

  // Search projects with full-text search
  private async searchProjects(
    query: string,
    filters: SearchFilters,
    options: SearchOptions
  ): Promise<SearchResult[]> {
    let searchQuery = supabaseClient
      .from('projects')
      .select(`
        id,
        title,
        description,
        status,
        priority,
        created_at,
        updated_at,
        project_tags(tag_name)
      `)
      .textSearch('title_description', query, {
        type: 'websearch',
        config: 'english'
      })

    // Apply filters
    if (filters.status) {
      searchQuery = searchQuery.in('status', filters.status)
    }

    if (filters.dateRange) {
      searchQuery = searchQuery
        .gte('created_at', filters.dateRange.start.toISOString())
        .lte('created_at', filters.dateRange.end.toISOString())
    }

    if (filters.userId) {
      searchQuery = searchQuery.eq('user_id', filters.userId)
    }

    const { data, error } = await searchQuery

    if (error) throw error

    return (data || []).map(project => ({
      id: project.id,
      table: 'projects',
      title: project.title,
      content: project.description || '',
      relevance: this.calculateRelevance(query, project.title + ' ' + (project.description || '')),
      highlights: this.generateHighlights(query, project.title + ' ' + (project.description || '')),
      metadata: {
        status: project.status,
        priority: project.priority,
        createdAt: project.created_at,
        updatedAt: project.updated_at,
        tags: project.project_tags?.map((t: any) => t.tag_name) || []
      }
    }))
  }

  // Search ideas with full-text search
  private async searchIdeas(
    query: string,
    filters: SearchFilters,
    options: SearchOptions
  ): Promise<SearchResult[]> {
    let searchQuery = supabaseClient
      .from('ideas')
      .select(`
        id,
        content,
        suggested_tags,
        status,
        created_at,
        related_project_id,
        projects(title)
      `)
      .textSearch('content', query, {
        type: 'websearch',
        config: 'english'
      })

    // Apply filters
    if (filters.status) {
      searchQuery = searchQuery.in('status', filters.status)
    }

    if (filters.tags) {
      searchQuery = searchQuery.overlaps('suggested_tags', filters.tags)
    }

    if (filters.dateRange) {
      searchQuery = searchQuery
        .gte('created_at', filters.dateRange.start.toISOString())
        .lte('created_at', filters.dateRange.end.toISOString())
    }

    if (filters.userId) {
      searchQuery = searchQuery.eq('user_id', filters.userId)
    }

    const { data, error } = await searchQuery

    if (error) throw error

    return (data || []).map(idea => ({
      id: idea.id,
      table: 'ideas',
      title: idea.content.substring(0, 100) + '...',
      content: idea.content,
      relevance: this.calculateRelevance(query, idea.content),
      highlights: this.generateHighlights(query, idea.content),
      metadata: {
        status: idea.status,
        suggestedTags: idea.suggested_tags,
        createdAt: idea.created_at,
        relatedProject: idea.projects?.[0]?.title || null
      }
    }))
  }

  // Search AI interactions
  private async searchAIInteractions(
    query: string,
    filters: SearchFilters,
    options: SearchOptions
  ): Promise<SearchResult[]> {
    let searchQuery = supabaseClient
      .from('ai_interactions')
      .select(`
        id,
        interaction_type,
        content,
        ai_response,
        created_at,
        projects(title)
      `)
      .or(`content.ilike.%${query}%,ai_response.ilike.%${query}%`)

    // Apply filters
    if (filters.dateRange) {
      searchQuery = searchQuery
        .gte('created_at', filters.dateRange.start.toISOString())
        .lte('created_at', filters.dateRange.end.toISOString())
    }

    if (filters.userId) {
      searchQuery = searchQuery.eq('user_id', filters.userId)
    }

    const { data, error } = await searchQuery

    if (error) throw error

    return (data || []).map(interaction => ({
      id: interaction.id,
      table: 'ai_interactions',
      title: `${interaction.interaction_type}: ${interaction.content.substring(0, 50)}...`,
      content: interaction.content + ' ' + (interaction.ai_response || ''),
      relevance: this.calculateRelevance(query, interaction.content + ' ' + (interaction.ai_response || '')),
      highlights: this.generateHighlights(query, interaction.content + ' ' + (interaction.ai_response || '')),
      metadata: {
        type: interaction.interaction_type,
        createdAt: interaction.created_at,
        project: interaction.projects?.title || null
      }
    }))
  }

  // Search project tags
  private async searchProjectTags(
    query: string,
    filters: SearchFilters,
    options: SearchOptions
  ): Promise<SearchResult[]> {
    let searchQuery = supabaseClient
      .from('project_tags')
      .select(`
        id,
        tag_name,
        created_at,
        projects(title, description)
      `)
      .ilike('tag_name', `%${query}%`)

    // Apply filters
    if (filters.dateRange) {
      searchQuery = searchQuery
        .gte('created_at', filters.dateRange.start.toISOString())
        .lte('created_at', filters.dateRange.end.toISOString())
    }

    const { data, error } = await searchQuery

    if (error) throw error

    return (data || []).map(tag => ({
      id: tag.id,
      table: 'project_tags',
      title: `Tag: ${tag.tag_name}`,
      content: `Tagged in project: ${tag.projects?.title || 'Unknown'}`,
      relevance: this.calculateRelevance(query, tag.tag_name),
      highlights: this.generateHighlights(query, tag.tag_name),
      metadata: {
        tagName: tag.tag_name,
        createdAt: tag.created_at,
        project: tag.projects?.title || null
      }
    }))
  }

  // Calculate search relevance score
  private calculateRelevance(query: string, content: string): number {
    const queryWords = query.toLowerCase().split(/\s+/)
    const contentWords = content.toLowerCase().split(/\s+/)
    
    let score = 0
    let totalWords = contentWords.length

    queryWords.forEach(word => {
      const matches = contentWords.filter(w => w.includes(word)).length
      score += matches / totalWords
    })

    return Math.min(score, 1)
  }

  // Generate search highlights
  private generateHighlights(query: string, content: string): string[] {
    const queryWords = query.toLowerCase().split(/\s+/)
    const sentences = content.split(/[.!?]+/)
    
    return sentences
      .filter(sentence => 
        queryWords.some(word => 
          sentence.toLowerCase().includes(word.toLowerCase())
        )
      )
      .slice(0, 3) // Limit to 3 highlights
      .map(sentence => sentence.trim())
  }

  // Sort search results
  private sortResults(
    results: SearchResult[],
    sortBy: string,
    sortOrder: string
  ): SearchResult[] {
    return results.sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case 'relevance':
          comparison = a.relevance - b.relevance
          break
        case 'date':
          comparison = new Date(a.metadata.createdAt || 0).getTime() - 
                      new Date(b.metadata.createdAt || 0).getTime()
          break
        case 'title':
          comparison = a.title.localeCompare(b.title)
          break
        default:
          comparison = a.relevance - b.relevance
      }

      return sortOrder === 'desc' ? -comparison : comparison
    })
  }

  // Get search suggestions
  async getSearchSuggestions(query: string, limit: number = 5): Promise<string[]> {
    try {
      // Get suggestions from project titles
      const { data: projects } = await supabaseClient
        .from('projects')
        .select('title')
        .ilike('title', `%${query}%`)
        .limit(limit)

      // Get suggestions from tags
      const { data: tags } = await supabaseClient
        .from('project_tags')
        .select('tag_name')
        .ilike('tag_name', `%${query}%`)
        .limit(limit)

      const suggestions = [
        ...(projects || []).map(p => p.title),
        ...(tags || []).map(t => t.tag_name)
      ]

      return [...new Set(suggestions)].slice(0, limit)
    } catch (error) {
      console.error('Failed to get search suggestions:', error)
      return []
    }
  }

  // Get search analytics
  async getSearchAnalytics(): Promise<{
    totalSearches: number
    popularQueries: Array<{ query: string; count: number }>
    searchPerformance: {
      averageResponseTime: number
      successRate: number
    }
  }> {
    // This would typically come from a search analytics table
    return {
      totalSearches: 0,
      popularQueries: [],
      searchPerformance: {
        averageResponseTime: 0,
        successRate: 1
      }
    }
  }
}

// Export singleton instance
export const advancedSearchEngine = AdvancedSearchEngine.getInstance()

// React hook for search
export function useSearch() {
  const [results, setResults] = React.useState<SearchResult[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const search = React.useCallback(async (
    query: string,
    filters: SearchFilters = {},
    options: SearchOptions = {}
  ) => {
    if (!query.trim()) {
      setResults([])
      return
    }

    setLoading(true)
    setError(null)

    try {
      const searchResults = await advancedSearchEngine.search(query, filters, options)
      setResults(searchResults)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed')
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  return { search, results, loading, error }
}
