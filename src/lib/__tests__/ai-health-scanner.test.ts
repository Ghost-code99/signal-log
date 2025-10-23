/**
 * Unit tests for AI Health Scanner
 * Tests project health analysis and portfolio insights
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { 
  analyzeProjectHealth, 
  analyzePortfolioHealth,
  runHealthScan 
} from '../ai-health-scanner'

// Mock Supabase
const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn()
        }))
      }))
    })),
    insert: vi.fn()
  }))
}

vi.mock('../supabase', () => ({
  supabase: mockSupabase
}))

describe('AI Health Scanner', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('analyzeProjectHealth', () => {
    it('should analyze healthy project correctly', async () => {
      const mockProject = {
        id: 'project-1',
        title: 'Test Project',
        description: 'Test description',
        status: 'active',
        priority: 'medium',
        last_activity: new Date().toISOString(),
        project_tags: [
          { tag_name: 'growth' },
          { tag_name: 'product' }
        ],
        ai_interactions: [
          {
            id: 'interaction-1',
            interaction_type: 'health_scan',
            created_at: new Date().toISOString()
          }
        ]
      }

      mockSupabase.from().select().eq().eq().single.mockResolvedValue({
        data: mockProject,
        error: null
      })

      mockSupabase.from().insert.mockResolvedValue({
        data: null,
        error: null
      })

      const result = await analyzeProjectHealth('project-1', 'user-123')

      expect(result.success).toBe(true)
      expect(result.analysis).toBeDefined()
      expect(result.analysis?.projectId).toBe('project-1')
      expect(result.analysis?.healthScore).toBeGreaterThan(0)
      expect(result.analysis?.status).toBe('healthy')
    })

    it('should identify stalled project', async () => {
      const oldDate = new Date()
      oldDate.setDate(oldDate.getDate() - 30) // 30 days ago

      const mockProject = {
        id: 'project-1',
        title: 'Stalled Project',
        description: 'Test description',
        status: 'stalled',
        priority: 'medium',
        last_activity: oldDate.toISOString(),
        project_tags: [],
        ai_interactions: []
      }

      mockSupabase.from().select().eq().eq().single.mockResolvedValue({
        data: mockProject,
        error: null
      })

      mockSupabase.from().insert.mockResolvedValue({
        data: null,
        error: null
      })

      const result = await analyzeProjectHealth('project-1', 'user-123')

      expect(result.success).toBe(true)
      expect(result.analysis?.status).toBe('stalled')
      expect(result.analysis?.healthScore).toBeLessThan(70)
    })

    it('should identify project needing attention', async () => {
      const oldDate = new Date()
      oldDate.setDate(oldDate.getDate() - 15) // 15 days ago

      const mockProject = {
        id: 'project-1',
        title: 'Needs Attention Project',
        description: 'Test description',
        status: 'active',
        priority: 'medium',
        last_activity: oldDate.toISOString(),
        project_tags: [],
        ai_interactions: []
      }

      mockSupabase.from().select().eq().eq().single.mockResolvedValue({
        data: mockProject,
        error: null
      })

      mockSupabase.from().insert.mockResolvedValue({
        data: null,
        error: null
      })

      const result = await analyzeProjectHealth('project-1', 'user-123')

      expect(result.success).toBe(true)
      expect(result.analysis?.status).toBe('needs_attention')
      expect(result.analysis?.indicators).toHaveLength(2) // No tags + no AI analysis
    })

    it('should handle project not found', async () => {
      mockSupabase.from().select().eq().eq().single.mockResolvedValue({
        data: null,
        error: { message: 'Project not found' }
      })

      const result = await analyzeProjectHealth('nonexistent', 'user-123')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Project not found')
    })
  })

  describe('analyzePortfolioHealth', () => {
    it('should analyze portfolio with multiple projects', async () => {
      const mockProjects = [
        {
          id: 'project-1',
          title: 'Active Project 1',
          status: 'active',
          priority: 'high',
          project_tags: [{ tag_name: 'growth' }]
        },
        {
          id: 'project-2',
          title: 'Active Project 2',
          status: 'active',
          priority: 'medium',
          project_tags: [{ tag_name: 'product' }]
        },
        {
          id: 'project-3',
          title: 'Stalled Project',
          status: 'stalled',
          priority: 'low',
          project_tags: []
        }
      ]

      // Mock projects fetch
      mockSupabase.from().select().eq.mockResolvedValueOnce({
        data: mockProjects,
        error: null
      })

      // Mock individual project analysis
      mockSupabase.from().select().eq().eq().single
        .mockResolvedValueOnce({
          data: mockProjects[0],
          error: null
        })
        .mockResolvedValueOnce({
          data: mockProjects[1],
          error: null
        })
        .mockResolvedValueOnce({
          data: mockProjects[2],
          error: null
        })

      mockSupabase.from().insert.mockResolvedValue({
        data: null,
        error: null
      })

      const result = await analyzePortfolioHealth('user-123')

      expect(result.success).toBe(true)
      expect(result.analyses).toHaveLength(3)
      expect(result.insights).toBeDefined()
    })

    it('should generate insights for resource conflicts', async () => {
      const mockProjects = Array.from({ length: 6 }, (_, i) => ({
        id: `project-${i}`,
        title: `Project ${i}`,
        status: 'active',
        priority: 'high',
        project_tags: []
      }))

      mockSupabase.from().select().eq.mockResolvedValue({
        data: mockProjects,
        error: null
      })

      // Mock individual project analysis
      mockSupabase.from().select().eq().eq().single.mockResolvedValue({
        data: mockProjects[0],
        error: null
      })

      mockSupabase.from().insert.mockResolvedValue({
        data: null,
        error: null
      })

      const result = await analyzePortfolioHealth('user-123')

      expect(result.success).toBe(true)
      expect(result.insights).toBeDefined()
      
      // Should have resource conflict insight
      const resourceInsight = result.insights?.find(
        insight => insight.type === 'resource_issue' && insight.title.includes('Too Many Active Projects')
      )
      expect(resourceInsight).toBeDefined()
    })
  })

  describe('runHealthScan', () => {
    it('should run single project health scan', async () => {
      const mockProject = {
        id: 'project-1',
        title: 'Test Project',
        status: 'active',
        last_activity: new Date().toISOString(),
        project_tags: [],
        ai_interactions: []
      }

      mockSupabase.from().select().eq().eq().single.mockResolvedValue({
        data: mockProject,
        error: null
      })

      mockSupabase.from().insert.mockResolvedValue({
        data: null,
        error: null
      })

      const result = await runHealthScan('user-123', 'project-1')

      expect(result.success).toBe(true)
      expect(result.results?.projectAnalyses).toHaveLength(1)
      expect(result.results?.portfolioInsights).toBeUndefined()
    })

    it('should run full portfolio health scan', async () => {
      const mockProjects = [
        {
          id: 'project-1',
          title: 'Project 1',
          status: 'active',
          project_tags: []
        }
      ]

      mockSupabase.from().select().eq.mockResolvedValue({
        data: mockProjects,
        error: null
      })

      mockSupabase.from().select().eq().eq().single.mockResolvedValue({
        data: mockProjects[0],
        error: null
      })

      mockSupabase.from().insert.mockResolvedValue({
        data: null,
        error: null
      })

      const result = await runHealthScan('user-123')

      expect(result.success).toBe(true)
      expect(result.results?.projectAnalyses).toBeDefined()
      expect(result.results?.portfolioInsights).toBeDefined()
    })
  })
})
