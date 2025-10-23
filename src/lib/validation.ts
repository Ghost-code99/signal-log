import { z } from 'zod'

// User validation schemas
export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email().max(255),
  full_name: z.string().min(1).max(100).optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
})

// Project validation schemas
export const projectSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  status: z.enum(['idea', 'active', 'stalled', 'validated', 'abandoned']),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
})

// Idea validation schemas
export const ideaSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  content: z.string().min(1).max(5000),
  suggested_tags: z.array(z.string().max(50)).max(10),
  status: z.enum(['captured', 'processed', 'integrated', 'dismissed']),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
})

// AI interaction validation schemas
export const aiInteractionSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  project_id: z.string().uuid(),
  interaction_type: z.enum(['health_scan', 'assumption_challenge', 'experiment_canvas', 'idea_capture']),
  content: z.string().min(1).max(10000),
  ai_response: z.string().max(20000).optional(),
  metadata: z.record(z.any()).optional(),
  created_at: z.string().datetime()
})

// Project health metrics validation
export const healthMetricSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  project_id: z.string().uuid(),
  health_score: z.number().min(0).max(100),
  health_indicators: z.record(z.any()),
  created_at: z.string().datetime()
})

// Project tag validation
export const projectTagSchema = z.object({
  id: z.string().uuid(),
  project_id: z.string().uuid(),
  tag_name: z.string().min(1).max(50),
  created_at: z.string().datetime()
})

// Sanitization functions
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 1000) // Limit length
}

export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim()
}

export function sanitizeTags(tags: string[]): string[] {
  return tags
    .map(tag => tag.trim().toLowerCase())
    .filter(tag => tag.length > 0 && tag.length <= 50)
    .slice(0, 10) // Max 10 tags
}

// Additional schemas for specific features
export const createProjectSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  status: z.enum(['idea', 'active', 'stalled', 'validated', 'abandoned']),
  priority: z.enum(['low', 'medium', 'high', 'critical'])
})

export const updateProjectSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  status: z.enum(['idea', 'active', 'stalled', 'validated', 'abandoned']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional()
})

export const deleteProjectSchema = z.object({
  id: z.string().uuid()
})

export const generateCanvasSchema = z.object({
  projectId: z.string().uuid(),
  idea: z.string().min(1).max(1000),
  hypothesis: z.string().min(1).max(1000),
  experiment: z.string().min(1).max(1000),
  metrics: z.array(z.string()).max(10)
})

export const generateTagsSchema = z.object({
  idea: z.string().min(1).max(5000),
  content: z.string().min(1).max(5000),
  context: z.string().max(1000).optional()
})

export const challengeIdeaSchema = z.object({
  idea: z.string().min(1).max(5000),
  assumptions: z.array(z.string()).max(10)
})

export const scanProjectsSchema = z.object({
  projects: z.array(z.object({
    id: z.string().uuid(),
    title: z.string(),
    description: z.string().optional(),
    status: z.string(),
    priority: z.string()
  })).max(20)
})

// Sanitization functions
export function sanitizeText(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 1000) // Limit length
}

// Validation helper
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  try {
    const validatedData = schema.parse(data)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      }
    }
    return { success: false, error: 'Validation failed' }
  }
}