/**
 * Unit tests for Supabase Project Actions
 * Tests CRUD operations, validation, and error handling
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { 
  createProject, 
  updateProject, 
  deleteProject, 
  getProjects,
  getDashboardStats 
} from '../project-actions'

// Mock Supabase
const mockSupabase = {
  from: vi.fn(() => ({
    insert: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn()
      }))
    })),
    update: vi.fn(() => ({
      eq: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn()
        }))
      }))
    })),
    delete: vi.fn(() => ({
      eq: vi.fn()
    })),
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        order: vi.fn()
      }))
    }))
  }))
}

vi.mock('../supabase', () => ({
  supabase: mockSupabase
}))

describe('Project Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createProject', () => {
    it('should create a project successfully', async () => {
      const mockProject = {
        id: 'test-id',
        user_id: 'user-123',
        title: 'Test Project',
        description: 'Test description',
        status: 'idea',
        priority: 'medium',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z'
      }

      mockSupabase.from().insert().select().single.mockResolvedValue({
        data: mockProject,
        error: null
      })

      const result = await createProject({
        title: 'Test Project',
        description: 'Test description',
        status: 'idea',
        priority: 'medium',
        tags: ['test']
      }, 'user-123')

      expect(result.success).toBe(true)
      expect(result.project).toEqual(mockProject)
    })

    it('should handle Supabase errors', async () => {
      mockSupabase.from().insert().select().single.mockResolvedValue({
        data: null,
        error: { message: 'Database error' }
      })

      const result = await createProject({
        title: 'Test Project',
        description: 'Test description'
      }, 'user-123')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Database error')
    })

    it('should add tags when provided', async () => {
      const mockProject = {
        id: 'test-id',
        user_id: 'user-123',
        title: 'Test Project',
        description: 'Test description',
        status: 'idea',
        priority: 'medium'
      }

      mockSupabase.from().insert().select().single.mockResolvedValue({
        data: mockProject,
        error: null
      })

      // Mock tag insertion
      mockSupabase.from().insert.mockResolvedValue({
        data: null,
        error: null
      })

      await createProject({
        title: 'Test Project',
        description: 'Test description',
        tags: ['tag1', 'tag2']
      }, 'user-123')

      expect(mockSupabase.from).toHaveBeenCalledWith('project_tags')
    })
  })

  describe('updateProject', () => {
    it('should update a project successfully', async () => {
      const mockProject = {
        id: 'test-id',
        title: 'Updated Project',
        description: 'Updated description',
        status: 'active',
        priority: 'high'
      }

      mockSupabase.from().update().eq().eq().select().single.mockResolvedValue({
        data: mockProject,
        error: null
      })

      const result = await updateProject({
        id: 'test-id',
        title: 'Updated Project',
        description: 'Updated description',
        status: 'active',
        priority: 'high'
      }, 'user-123')

      expect(result.success).toBe(true)
      expect(result.project).toEqual(mockProject)
    })

    it('should handle update errors', async () => {
      mockSupabase.from().update().eq().eq().select().single.mockResolvedValue({
        data: null,
        error: { message: 'Update failed' }
      })

      const result = await updateProject({
        id: 'test-id',
        title: 'Updated Project'
      }, 'user-123')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Update failed')
    })
  })

  describe('deleteProject', () => {
    it('should delete a project successfully', async () => {
      mockSupabase.from().delete().eq().eq.mockResolvedValue({
        data: null,
        error: null
      })

      const result = await deleteProject('test-id', 'user-123')

      expect(result.success).toBe(true)
    })

    it('should handle delete errors', async () => {
      mockSupabase.from().delete().eq().eq.mockResolvedValue({
        data: null,
        error: { message: 'Delete failed' }
      })

      const result = await deleteProject('test-id', 'user-123')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Delete failed')
    })
  })

  describe('getProjects', () => {
    it('should fetch projects successfully', async () => {
      const mockProjects = [
        {
          id: 'project-1',
          title: 'Project 1',
          description: 'Description 1',
          status: 'active',
          priority: 'high',
          project_tags: [
            { id: 'tag-1', tag_name: 'tag1' },
            { id: 'tag-2', tag_name: 'tag2' }
          ]
        }
      ]

      mockSupabase.from().select().eq().order.mockResolvedValue({
        data: mockProjects,
        error: null
      })

      const result = await getProjects('user-123')

      expect(result.success).toBe(true)
      expect(result.projects).toEqual(mockProjects)
    })

    it('should handle fetch errors', async () => {
      mockSupabase.from().select().eq().order.mockResolvedValue({
        data: null,
        error: { message: 'Fetch failed' }
      })

      const result = await getProjects('user-123')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Fetch failed')
    })
  })

  describe('getDashboardStats', () => {
    it('should calculate stats correctly', async () => {
      const mockProjects = [
        { status: 'active' },
        { status: 'active' },
        { status: 'stalled' }
      ]

      const mockIdeas = [
        { id: 'idea-1' },
        { id: 'idea-2' }
      ]

      const mockExperiments = [
        { id: 'exp-1' },
        { id: 'exp-2' }
      ]

      // Mock projects query
      mockSupabase.from().select().eq.mockResolvedValueOnce({
        data: mockProjects,
        error: null
      })

      // Mock ideas query
      mockSupabase.from().select().eq().gte.mockResolvedValueOnce({
        data: mockIdeas,
        error: null
      })

      // Mock experiments query
      mockSupabase.from().select().eq().eq.mockResolvedValueOnce({
        data: mockExperiments,
        error: null
      })

      const result = await getDashboardStats('user-123')

      expect(result.success).toBe(true)
      expect(result.stats).toEqual({
        totalProjects: 3,
        activeProjects: 2,
        ideasThisWeek: 2,
        experimentsInProgress: 2
      })
    })
  })
})
