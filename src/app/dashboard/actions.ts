'use server';

import {
  createProjectSchema,
  updateProjectSchema,
  deleteProjectSchema,
  validateInput,
  sanitizeText,
} from '../../lib/validation';

/**
 * Server Actions for Multi-Project Dashboard
 * Handles project CRUD, linking features, and activity tracking
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'Active' | 'Stalled' | 'Validated' | 'Idea';
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ProjectActivity {
  id: string;
  projectId: string;
  type:
    | 'project_created'
    | 'idea_added'
    | 'assumption_challenged'
    | 'experiment_generated'
    | 'status_changed'
    | 'project_updated';
  description: string;
  timestamp: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface Idea {
  id: string;
  text: string;
  tags: string[];
  timestamp: string;
}

export interface Experiment {
  id: string;
  canvas: {
    hypothesis?: string;
    successMetric?: string;
  };
  timestamp: string;
}

export interface Assumption {
  id: string;
  idea: string;
  questions: string[];
  timestamp: string;
}

export interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  ideasThisWeek: number;
  experimentsInProgress: number;
}

export interface CreateProjectInput {
  name: string;
  description: string;
  status: Project['status'];
  tags: string[];
}

export interface UpdateProjectInput {
  id: string;
  name?: string;
  description?: string;
  status?: Project['status'];
  tags?: string[];
}

// ============================================================================
// SERVER ACTION: CREATE PROJECT
// ============================================================================

export async function createProject(input: CreateProjectInput): Promise<{
  success: boolean;
  project?: Project;
  error?: string;
}> {
  console.log('[Server Action] createProject called:', {
    name: input.name,
    status: input.status,
  });

  try {
    // Validate input with Zod schema
    const validation = validateInput(createProjectSchema, input);
    if (!validation.success) {
      return { success: false, error: validation.error };
    }

    const validatedInput = validation.data!;

    // Create new project with sanitized data
    const now = new Date().toISOString();
    const newProject: Project = {
      id: `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: sanitizeText(validatedInput.name),
      description: sanitizeText(validatedInput.description),
      status: validatedInput.status,
      tags: validatedInput.tags.map(tag => sanitizeText(tag)),
      createdAt: now,
      updatedAt: now,
    };

    console.log('[Server Action] Created project:', newProject.id);

    return {
      success: true,
      project: newProject,
    };
  } catch (error) {
    console.error('[Server Action] Error creating project:', error);
    return {
      success: false,
      error: 'Failed to create project. Please try again.',
    };
  }
}

// ============================================================================
// SERVER ACTION: UPDATE PROJECT
// ============================================================================

export async function updateProject(input: UpdateProjectInput): Promise<{
  success: boolean;
  project?: Partial<Project>;
  error?: string;
}> {
  console.log('[Server Action] updateProject called:', { id: input.id });

  try {
    // Validate input with Zod schema
    const validation = validateInput(updateProjectSchema, input);
    if (!validation.success) {
      return { success: false, error: validation.error };
    }

    const validatedInput = validation.data!;

    // Build update object with sanitized data
    const updates: Partial<Project> = {
      id: validatedInput.id,
      updatedAt: new Date().toISOString(),
    };

    if (validatedInput.name !== undefined)
      updates.name = sanitizeText(validatedInput.name);
    if (validatedInput.description !== undefined)
      updates.description = sanitizeText(validatedInput.description);
    if (validatedInput.status !== undefined)
      updates.status = validatedInput.status;
    if (validatedInput.tags !== undefined)
      updates.tags = validatedInput.tags.map(tag => sanitizeText(tag));

    console.log('[Server Action] Updated project:', input.id);

    return {
      success: true,
      project: updates,
    };
  } catch (error) {
    console.error('[Server Action] Error updating project:', error);
    return {
      success: false,
      error: 'Failed to update project. Please try again.',
    };
  }
}

// ============================================================================
// SERVER ACTION: DELETE PROJECT
// ============================================================================

export async function deleteProject(projectId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  console.log('[Server Action] deleteProject called:', projectId);

  try {
    // Validate input with Zod schema
    const validation = validateInput(deleteProjectSchema, { id: projectId });
    if (!validation.success) {
      return { success: false, error: validation.error };
    }

    console.log('[Server Action] Deleted project:', projectId);

    return { success: true };
  } catch (error) {
    console.error('[Server Action] Error deleting project:', error);
    return {
      success: false,
      error: 'Failed to delete project. Please try again.',
    };
  }
}

// ============================================================================
// SERVER ACTION: LOG ACTIVITY
// ============================================================================

export async function logProjectActivity(
  projectId: string,
  type: ProjectActivity['type'],
  description: string,
  metadata?: Record<string, string | number | boolean>
): Promise<{
  success: boolean;
  activity?: ProjectActivity;
  error?: string;
}> {
  console.log('[Server Action] logProjectActivity called:', {
    projectId,
    type,
  });

  try {
    if (!projectId) {
      return { success: false, error: 'Project ID is required' };
    }

    const activity: ProjectActivity = {
      id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      projectId,
      type,
      description,
      timestamp: new Date().toISOString(),
      metadata,
    };

    console.log('[Server Action] Logged activity:', activity.id);

    return {
      success: true,
      activity,
    };
  } catch (error) {
    console.error('[Server Action] Error logging activity:', error);
    return {
      success: false,
      error: 'Failed to log activity.',
    };
  }
}

// ============================================================================
// SERVER ACTION: LINK ITEM TO PROJECT
// ============================================================================

export async function linkItemToProject(
  projectId: string,
  itemType: 'idea' | 'assumption' | 'experiment',
  itemId: string,
  itemTitle: string
): Promise<{
  success: boolean;
  error?: string;
}> {
  console.log('[Server Action] linkItemToProject called:', {
    projectId,
    itemType,
    itemId,
  });

  try {
    if (!projectId || !itemType || !itemId) {
      return { success: false, error: 'Missing required parameters' };
    }

    // Log the linking activity
    const activityType =
      itemType === 'idea'
        ? 'idea_added'
        : itemType === 'assumption'
          ? 'assumption_challenged'
          : 'experiment_generated';

    const description =
      itemType === 'idea'
        ? `Added idea: "${itemTitle}"`
        : itemType === 'assumption'
          ? `Challenged assumption: "${itemTitle}"`
          : `Generated experiment: "${itemTitle}"`;

    await logProjectActivity(projectId, activityType, description, {
      itemId,
      itemType,
      itemTitle,
    });

    console.log('[Server Action] Linked item to project:', {
      projectId,
      itemType,
      itemId,
    });

    return { success: true };
  } catch (error) {
    console.error('[Server Action] Error linking item:', error);
    return {
      success: false,
      error: 'Failed to link item to project.',
    };
  }
}

// ============================================================================
// SERVER ACTION: CALCULATE DASHBOARD STATS
// ============================================================================

export async function calculateDashboardStats(
  projects: Project[],
  ideas: Idea[],
  experiments: Experiment[]
): Promise<DashboardStats> {
  console.log('[Server Action] calculateDashboardStats called');

  try {
    const activeProjects = projects.filter(p => p.status === 'Active').length;

    // Calculate ideas from the past 7 days
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const ideasThisWeek = ideas.filter(idea => {
      const ideaDate = new Date(idea.timestamp);
      return ideaDate >= oneWeekAgo;
    }).length;

    // Count experiments (assuming any experiment stored is "in progress")
    const experimentsInProgress = experiments.length;

    return {
      totalProjects: projects.length,
      activeProjects,
      ideasThisWeek,
      experimentsInProgress,
    };
  } catch (error) {
    console.error('[Server Action] Error calculating stats:', error);
    return {
      totalProjects: 0,
      activeProjects: 0,
      ideasThisWeek: 0,
      experimentsInProgress: 0,
    };
  }
}

// ============================================================================
// SERVER ACTION: VALIDATE PROJECT NAME UNIQUENESS
// ============================================================================

export async function validateProjectName(
  name: string,
  existingProjects: Project[],
  excludeId?: string
): Promise<{
  isValid: boolean;
  error?: string;
}> {
  console.log('[Server Action] validateProjectName called:', name);

  try {
    const normalizedName = name.trim().toLowerCase();

    const duplicate = existingProjects.find(
      p => p.name.toLowerCase() === normalizedName && p.id !== excludeId
    );

    if (duplicate) {
      return {
        isValid: false,
        error: 'A project with this name already exists',
      };
    }

    return { isValid: true };
  } catch (error) {
    console.error('[Server Action] Error validating name:', error);
    return {
      isValid: true, // Fail open
    };
  }
}
