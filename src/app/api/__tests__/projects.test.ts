/**
 * Integration tests for Projects API Routes
 * Tests API endpoints with mocked Supabase responses
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { GET, POST } from '../projects/route'

// Mock Supabase
const mockSupabase = {
  auth: {
    getUser: vi.fn()
  }
}

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => mockSupabase)
}))

// Mock project actions
vi.mock('../../../../lib/project-actions', () => ({
  getProjects: vi.fn(),
  createProject: vi.fn()
}))

import { getProjects, createProject } from '../../../../lib/project-actions'

describe('Projects API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/projects', () => {
    it('should return projects for authenticated user', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' }
      const mockProjects = [
        {
          id: 'project-1',
          title: 'Test Project 1',
          description: 'Description 1',
          status: 'active',
          priority: 'high'
        },
        {
          id: 'project-2',
          title: 'Test Project 2',
          description: 'Description 2',
          status: 'idea',
          priority: 'medium'
        }
      ]

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      vi.mocked(getProjects).mockResolvedValue({
        success: true,
        projects: mockProjects
      })

      const request = new NextRequest('http://localhost:3000/api/projects')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.projects).toEqual(mockProjects)
      expect(getProjects).toHaveBeenCalledWith('user-123')
    })

    it('should return 401 for unauthenticated user', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' }
      })

      const request = new NextRequest('http://localhost:3000/api/projects')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should return 500 for database errors', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' }

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      vi.mocked(getProjects).mockResolvedValue({
        success: false,
        error: 'Database connection failed'
      })

      const request = new NextRequest('http://localhost:3000/api/projects')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Database connection failed')
    })
  })

  describe('POST /api/projects', () => {
    it('should create project for authenticated user', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' }
      const mockProject = {
        id: 'project-1',
        title: 'New Project',
        description: 'New description',
        status: 'idea',
        priority: 'medium'
      }

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      vi.mocked(createProject).mockResolvedValue({
        success: true,
        project: mockProject
      })

      const requestBody = {
        title: 'New Project',
        description: 'New description',
        status: 'idea',
        priority: 'medium',
        tags: ['test']
      }

      const request = new NextRequest('http://localhost:3000/api/projects', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.project).toEqual(mockProject)
      expect(createProject).toHaveBeenCalledWith(requestBody, 'user-123')
    })

    it('should return 401 for unauthenticated user', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' }
      })

      const requestBody = {
        title: 'New Project',
        description: 'New description'
      }

      const request = new NextRequest('http://localhost:3000/api/projects', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should return 500 for creation errors', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' }

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      vi.mocked(createProject).mockResolvedValue({
        success: false,
        error: 'Failed to create project'
      })

      const requestBody = {
        title: 'New Project',
        description: 'New description'
      }

      const request = new NextRequest('http://localhost:3000/api/projects', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to create project')
    })

    it('should handle malformed JSON', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' }

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      const request = new NextRequest('http://localhost:3000/api/projects', {
        method: 'POST',
        body: 'invalid json',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await POST(request)

      expect(response.status).toBe(500)
    })
  })
})
