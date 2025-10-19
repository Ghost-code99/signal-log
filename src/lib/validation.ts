import { z } from 'zod';

// ============================================================================
// COMMON VALIDATION SCHEMAS
// ============================================================================

// Sanitized string with length limits
const sanitizedString = (minLength: number, maxLength: number) =>
  z.string()
    .min(minLength, `Must be at least ${minLength} characters`)
    .max(maxLength, `Must be no more than ${maxLength} characters`)
    .trim()
    .transform((val) => val.replace(/[<>]/g, '')); // Remove potential HTML tags

// Project name validation
export const projectNameSchema = sanitizedString(1, 60);

// Project description validation
export const projectDescriptionSchema = sanitizedString(0, 300);

// Idea text validation
export const ideaTextSchema = sanitizedString(10, 2000);

// Project status validation
export const projectStatusSchema = z.enum(['Active', 'Stalled', 'Validated', 'Idea']);

// Tag validation
export const tagSchema = sanitizedString(1, 30);

// ============================================================================
// API ROUTE SCHEMAS
// ============================================================================

// Project Health Scanner API
export const scanProjectsSchema = z.object({
  projects: z.array(
    z.object({
      name: projectNameSchema,
      description: projectDescriptionSchema,
    })
  ).min(3, 'Must provide at least 3 projects')
   .max(5, 'Must provide no more than 5 projects'),
});

// Assumption Challenger API
export const challengeIdeaSchema = z.object({
  idea: ideaTextSchema,
});

// Idea Capture API
export const generateTagsSchema = z.object({
  idea: ideaTextSchema,
});

// Experiment Canvas API
export const generateCanvasSchema = z.object({
  idea: ideaTextSchema,
});

// ============================================================================
// DASHBOARD SCHEMAS
// ============================================================================

// Create Project Schema
export const createProjectSchema = z.object({
  name: projectNameSchema,
  description: projectDescriptionSchema,
  status: projectStatusSchema,
  tags: z.array(tagSchema).max(10, 'Maximum 10 tags allowed'),
});

// Update Project Schema
export const updateProjectSchema = z.object({
  id: z.string().min(1, 'Project ID is required'),
  name: projectNameSchema.optional(),
  description: projectDescriptionSchema.optional(),
  status: projectStatusSchema.optional(),
  tags: z.array(tagSchema).max(10, 'Maximum 10 tags allowed').optional(),
});

// Delete Project Schema
export const deleteProjectSchema = z.object({
  id: z.string().min(1, 'Project ID is required'),
});

// ============================================================================
// URL PARAMETER SCHEMAS
// ============================================================================

// Project ID from URL params
export const projectIdSchema = z.string()
  .min(1, 'Project ID is required')
  .regex(/^project-\d+-[a-z0-9]+$/, 'Invalid project ID format');

// Project name from URL params
export const urlProjectNameSchema = z.string()
  .min(1, 'Project name is required')
  .max(60, 'Project name too long')
  .transform((val) => decodeURIComponent(val));

// ============================================================================
// RESPONSE SCHEMAS
// ============================================================================

// Standard API response
export const apiResponseSchema = z.object({
  success: z.boolean(),
  error: z.string().optional(),
  data: z.any().optional(),
});

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean;
  data?: T;
  error?: string;
} {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.issues
        .map(err => `${err.path.join('.')}: ${err.message}`)
        .join(', ');
      return { success: false, error: errorMessage };
    }
    return { success: false, error: 'Validation failed' };
  }
}

// Safe HTML encoding for user content
export function encodeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Safe text content (no HTML)
export function sanitizeText(unsafe: string): string {
  return unsafe
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}
