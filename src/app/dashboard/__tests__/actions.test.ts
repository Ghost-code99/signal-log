/**
 * Unit tests for Dashboard Server Actions
 * Tests validation logic, data transformation, and error handling
 */

import { describe, it, expect, vi } from 'vitest';

// Mock console methods to avoid noise in tests
global.console = {
  ...console,
  log: vi.fn(),
  error: vi.fn(),
};

import {
  createProject,
  updateProject,
  deleteProject,
  validateProjectName,
  calculateDashboardStats,
  type Project,
  type CreateProjectInput,
  type UpdateProjectInput,
} from '../actions';

describe('Dashboard Server Actions', () => {
  describe('createProject', () => {
    it('should create a valid project with all fields', async () => {
      const input: CreateProjectInput = {
        name: 'Test Project',
        description: 'A test project description',
        status: 'Active',
        tags: ['test', 'mvp'],
      };

      const result = await createProject(input);

      expect(result.success).toBe(true);
      expect(result.project).toBeDefined();
      expect(result.project?.name).toBe('Test Project');
      expect(result.project?.description).toBe('A test project description');
      expect(result.project?.status).toBe('Active');
      expect(result.project?.tags).toEqual(['test', 'mvp']);
      expect(result.project?.id).toMatch(/^project-\d+-[a-z0-9]+$/);
      expect(result.project?.createdAt).toBeDefined();
      expect(result.project?.updatedAt).toBeDefined();
    });

    it('should trim whitespace from name and description', async () => {
      const input: CreateProjectInput = {
        name: '  Spaces Project  ',
        description: '  Spaces description  ',
        status: 'Active',
        tags: [],
      };

      const result = await createProject(input);

      expect(result.success).toBe(true);
      expect(result.project?.name).toBe('Spaces Project');
      expect(result.project?.description).toBe('Spaces description');
    });

    it('should reject empty project name', async () => {
      const input: CreateProjectInput = {
        name: '',
        description: 'Test',
        status: 'Active',
        tags: [],
      };

      const result = await createProject(input);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Project name is required');
    });

    it('should reject whitespace-only project name', async () => {
      const input: CreateProjectInput = {
        name: '   ',
        description: 'Test',
        status: 'Active',
        tags: [],
      };

      const result = await createProject(input);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Project name is required');
    });

    it('should reject name longer than 60 characters', async () => {
      const input: CreateProjectInput = {
        name: 'A'.repeat(61),
        description: 'Test',
        status: 'Active',
        tags: [],
      };

      const result = await createProject(input);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Project name must be 60 characters or less');
    });

    it('should accept name exactly 60 characters', async () => {
      const input: CreateProjectInput = {
        name: 'A'.repeat(60),
        description: 'Test',
        status: 'Active',
        tags: [],
      };

      const result = await createProject(input);

      expect(result.success).toBe(true);
      expect(result.project?.name.length).toBe(60);
    });

    it('should reject description longer than 300 characters', async () => {
      const input: CreateProjectInput = {
        name: 'Test',
        description: 'A'.repeat(301),
        status: 'Active',
        tags: [],
      };

      const result = await createProject(input);

      expect(result.success).toBe(false);
      expect(result.error).toBe(
        'Project description must be 300 characters or less'
      );
    });

    it('should accept description exactly 300 characters', async () => {
      const input: CreateProjectInput = {
        name: 'Test',
        description: 'A'.repeat(300),
        status: 'Active',
        tags: [],
      };

      const result = await createProject(input);

      expect(result.success).toBe(true);
      expect(result.project?.description.length).toBe(300);
    });

    it('should handle undefined description', async () => {
      const input: CreateProjectInput = {
        name: 'Test',
        description: '',
        status: 'Active',
        tags: [],
      };

      const result = await createProject(input);

      expect(result.success).toBe(true);
      expect(result.project?.description).toBe('');
    });

    it('should handle empty tags array', async () => {
      const input: CreateProjectInput = {
        name: 'Test',
        description: 'Test',
        status: 'Active',
        tags: [],
      };

      const result = await createProject(input);

      expect(result.success).toBe(true);
      expect(result.project?.tags).toEqual([]);
    });
  });

  describe('updateProject', () => {
    it('should update project with partial fields', async () => {
      const input: UpdateProjectInput = {
        id: 'project-123',
        name: 'Updated Name',
        status: 'Validated',
      };

      const result = await updateProject(input);

      expect(result.success).toBe(true);
      expect(result.project?.id).toBe('project-123');
      expect(result.project?.name).toBe('Updated Name');
      expect(result.project?.status).toBe('Validated');
      expect(result.project?.updatedAt).toBeDefined();
    });

    it('should trim whitespace from updated fields', async () => {
      const input: UpdateProjectInput = {
        id: 'project-123',
        name: '  Updated  ',
      };

      const result = await updateProject(input);

      expect(result.success).toBe(true);
      expect(result.project?.name).toBe('Updated');
    });

    it('should reject missing project ID', async () => {
      const input: UpdateProjectInput = {
        id: '',
        name: 'Test',
      };

      const result = await updateProject(input);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Project ID is required');
    });

    it('should reject empty name update', async () => {
      const input: UpdateProjectInput = {
        id: 'project-123',
        name: '',
      };

      const result = await updateProject(input);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Project name cannot be empty');
    });

    it('should reject name longer than 60 characters', async () => {
      const input: UpdateProjectInput = {
        id: 'project-123',
        name: 'A'.repeat(61),
      };

      const result = await updateProject(input);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Project name must be 60 characters or less');
    });

    it('should reject description longer than 300 characters', async () => {
      const input: UpdateProjectInput = {
        id: 'project-123',
        description: 'A'.repeat(301),
      };

      const result = await updateProject(input);

      expect(result.success).toBe(false);
      expect(result.error).toBe(
        'Project description must be 300 characters or less'
      );
    });

    it('should only update provided fields', async () => {
      const input: UpdateProjectInput = {
        id: 'project-123',
        status: 'Stalled',
      };

      const result = await updateProject(input);

      expect(result.success).toBe(true);
      expect(result.project?.id).toBe('project-123');
      expect(result.project?.status).toBe('Stalled');
      expect(result.project?.name).toBeUndefined();
      expect(result.project?.description).toBeUndefined();
    });
  });

  describe('deleteProject', () => {
    it('should successfully delete project with valid ID', async () => {
      const result = await deleteProject('project-123');

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject deletion without project ID', async () => {
      const result = await deleteProject('');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Project ID is required');
    });
  });

  describe('validateProjectName', () => {
    const existingProjects: Project[] = [
      {
        id: 'project-1',
        name: 'Existing Project',
        description: 'Test',
        status: 'Active',
        tags: [],
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      },
      {
        id: 'project-2',
        name: 'Another Project',
        description: 'Test',
        status: 'Active',
        tags: [],
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      },
    ];

    it('should accept unique project name', async () => {
      const result = await validateProjectName('New Project', existingProjects);

      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject duplicate project name (case-insensitive)', async () => {
      const result = await validateProjectName(
        'existing project',
        existingProjects
      );

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('A project with this name already exists');
    });

    it('should reject duplicate with different casing', async () => {
      const result = await validateProjectName(
        'EXISTING PROJECT',
        existingProjects
      );

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('A project with this name already exists');
    });

    it('should allow same name when editing same project', async () => {
      const result = await validateProjectName(
        'Existing Project',
        existingProjects,
        'project-1'
      );

      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should trim whitespace before comparison', async () => {
      const result = await validateProjectName(
        '  Existing Project  ',
        existingProjects
      );

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('A project with this name already exists');
    });

    it('should handle empty project list', async () => {
      const result = await validateProjectName('Any Name', []);

      expect(result.isValid).toBe(true);
    });
  });

  describe('calculateDashboardStats', () => {
    it('should calculate stats correctly with data', async () => {
      const projects: Project[] = [
        {
          id: 'p1',
          name: 'Active 1',
          description: '',
          status: 'Active',
          tags: [],
          createdAt: '2025-01-01',
          updatedAt: '2025-01-01',
        },
        {
          id: 'p2',
          name: 'Active 2',
          description: '',
          status: 'Active',
          tags: [],
          createdAt: '2025-01-01',
          updatedAt: '2025-01-01',
        },
        {
          id: 'p3',
          name: 'Stalled',
          description: '',
          status: 'Stalled',
          tags: [],
          createdAt: '2025-01-01',
          updatedAt: '2025-01-01',
        },
      ];

      const now = new Date();
      const recentIdeas = [
        { id: '1', text: 'Idea 1', timestamp: now.toISOString(), tags: [] },
        {
          id: '2',
          text: 'Idea 2',
          timestamp: new Date(
            now.getTime() - 3 * 24 * 60 * 60 * 1000
          ).toISOString(),
          tags: [],
        }, // 3 days ago
      ];

      const oldIdeas = [
        {
          id: '3',
          text: 'Old idea',
          timestamp: new Date(
            now.getTime() - 10 * 24 * 60 * 60 * 1000
          ).toISOString(),
          tags: [],
        }, // 10 days ago
      ];

      const experiments = [
        { id: 'e1', canvas: {}, timestamp: now.toISOString() },
        { id: 'e2', canvas: {}, timestamp: now.toISOString() },
      ];

      const stats = await calculateDashboardStats(
        projects,
        [...recentIdeas, ...oldIdeas],
        experiments
      );

      expect(stats.totalProjects).toBe(3);
      expect(stats.activeProjects).toBe(2);
      expect(stats.ideasThisWeek).toBe(2);
      expect(stats.experimentsInProgress).toBe(2);
    });

    it('should handle empty data', async () => {
      const stats = await calculateDashboardStats([], [], []);

      expect(stats.totalProjects).toBe(0);
      expect(stats.activeProjects).toBe(0);
      expect(stats.ideasThisWeek).toBe(0);
      expect(stats.experimentsInProgress).toBe(0);
    });

    it('should count only Active projects', async () => {
      const projects: Project[] = [
        {
          id: 'p1',
          name: 'Active',
          description: '',
          status: 'Active',
          tags: [],
          createdAt: '',
          updatedAt: '',
        },
        {
          id: 'p2',
          name: 'Stalled',
          description: '',
          status: 'Stalled',
          tags: [],
          createdAt: '',
          updatedAt: '',
        },
        {
          id: 'p3',
          name: 'Validated',
          description: '',
          status: 'Validated',
          tags: [],
          createdAt: '',
          updatedAt: '',
        },
        {
          id: 'p4',
          name: 'Idea',
          description: '',
          status: 'Idea',
          tags: [],
          createdAt: '',
          updatedAt: '',
        },
      ];

      const stats = await calculateDashboardStats(projects, [], []);

      expect(stats.totalProjects).toBe(4);
      expect(stats.activeProjects).toBe(1);
    });

    it('should only count ideas from past 7 days', async () => {
      const now = new Date();
      const ideas = [
        { id: '1', text: 'Idea 1', timestamp: now.toISOString(), tags: [] }, // Today
        {
          id: '2',
          text: 'Idea 2',
          timestamp: new Date(
            now.getTime() - 6 * 24 * 60 * 60 * 1000
          ).toISOString(),
          tags: [],
        }, // 6 days ago
        {
          id: '3',
          text: 'Idea 3',
          timestamp: new Date(
            now.getTime() - 8 * 24 * 60 * 60 * 1000
          ).toISOString(),
          tags: [],
        }, // 8 days ago - should NOT count
      ];

      const stats = await calculateDashboardStats([], ideas, []);

      expect(stats.ideasThisWeek).toBe(2);
    });
  });
});
