import { supabase } from './supabase'

export interface ExperimentCanvas {
  id: string
  projectId: string
  hypothesis: string
  successMetric: string
  experiment: string
  assumptions: string[]
  risks: string[]
  timeline: string
  resources: string[]
  successCriteria: string
  failureCriteria: string
  nextSteps: string[]
  created_at: string
}

export interface CanvasTemplate {
  id: string
  name: string
  description: string
  category: 'product' | 'marketing' | 'growth' | 'business' | 'technical'
  template: Partial<ExperimentCanvas>
}

// ============================================================================
// EXPERIMENT CANVAS GENERATOR
// ============================================================================

export async function generateExperimentCanvas(
  projectId: string,
  context: string,
  userId: string,
  template?: string
): Promise<{
  success: boolean
  canvas?: ExperimentCanvas
  error?: string
}> {
  try {
    // Get project context
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select(`
        *,
        project_tags (
          tag_name
        )
      `)
      .eq('id', projectId)
      .eq('user_id', userId)
      .single()

    if (projectError || !project) {
      return { success: false, error: 'Project not found' }
    }

    // Generate canvas based on context and template
    const canvas = await createCanvasFromContext(project, context, template)

    // Store the canvas
    const { data: savedCanvas, error: saveError } = await supabase
      .from('ai_interactions')
      .insert({
        project_id: projectId,
        interaction_type: 'experiment_generated',
        content: context,
        ai_response: JSON.stringify(canvas),
        metadata: {
          canvas_id: canvas.id,
          template_used: template || 'default'
        }
      })
      .select()
      .single()

    if (saveError) {
      console.error('Error saving experiment canvas:', saveError)
      return { success: false, error: saveError.message }
    }

    return { success: true, canvas }
  } catch (error) {
    console.error('Error generating experiment canvas:', error)
    return { success: false, error: 'Failed to generate experiment canvas' }
  }
}

async function createCanvasFromContext(
  project: any,
  context: string,
  template?: string
): Promise<ExperimentCanvas> {
  const canvasId = `canvas-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  
  // Generate hypothesis based on context and project
  const hypothesis = generateHypothesis(project, context)
  
  // Generate success metric
  const successMetric = generateSuccessMetric(project, context)
  
  // Generate experiment design
  const experiment = generateExperiment(project, context)
  
  // Extract assumptions from context
  const assumptions = extractAssumptions(context)
  
  // Identify risks
  const risks = identifyRisks(project, context)
  
  // Generate timeline
  const timeline = generateTimeline(project, context)
  
  // Identify required resources
  const resources = identifyResources(project, context)
  
  // Define success and failure criteria
  const successCriteria = generateSuccessCriteria(successMetric)
  const failureCriteria = generateFailureCriteria(successMetric)
  
  // Generate next steps
  const nextSteps = generateNextSteps(experiment, timeline)

  return {
    id: canvasId,
    projectId: project.id,
    hypothesis,
    successMetric,
    experiment,
    assumptions,
    risks,
    timeline,
    resources,
    successCriteria,
    failureCriteria,
    nextSteps,
    created_at: new Date().toISOString()
  }
}

function generateHypothesis(project: any, context: string): string {
  const projectTitle = project.title.toLowerCase()
  const contextLower = context.toLowerCase()
  
  // Simple hypothesis generation based on keywords
  if (contextLower.includes('user') || contextLower.includes('customer')) {
    return `If we improve the user experience for ${projectTitle}, then we will see increased user engagement and satisfaction.`
  } else if (contextLower.includes('revenue') || contextLower.includes('sales')) {
    return `If we implement this revenue strategy for ${projectTitle}, then we will see a 20% increase in revenue within 3 months.`
  } else if (contextLower.includes('growth') || contextLower.includes('acquisition')) {
    return `If we optimize our growth channels for ${projectTitle}, then we will see a 30% increase in user acquisition.`
  } else if (contextLower.includes('product') || contextLower.includes('feature')) {
    return `If we build this feature for ${projectTitle}, then we will see improved user retention and engagement.`
  } else {
    return `If we implement this strategy for ${projectTitle}, then we will see measurable improvement in our key metrics.`
  }
}

function generateSuccessMetric(project: any, context: string): string {
  const contextLower = context.toLowerCase()
  
  if (contextLower.includes('user') || contextLower.includes('engagement')) {
    return 'User engagement rate (daily active users / total users)'
  } else if (contextLower.includes('revenue') || contextLower.includes('sales')) {
    return 'Monthly recurring revenue (MRR)'
  } else if (contextLower.includes('growth') || contextLower.includes('acquisition')) {
    return 'New user acquisition rate'
  } else if (contextLower.includes('retention')) {
    return 'User retention rate (30-day)'
  } else if (contextLower.includes('conversion')) {
    return 'Conversion rate (visitors to customers)'
  } else {
    return 'Key performance indicator (KPI) specific to your goals'
  }
}

function generateExperiment(project: any, context: string): string {
  const contextLower = context.toLowerCase()
  
  if (contextLower.includes('user') || contextLower.includes('customer')) {
    return `Conduct user interviews with 10-15 target customers to understand their pain points and validate our assumptions about ${project.title}.`
  } else if (contextLower.includes('product') || contextLower.includes('feature')) {
    return `Build a minimum viable product (MVP) of the key feature and test it with a small group of beta users.`
  } else if (contextLower.includes('marketing') || contextLower.includes('growth')) {
    return `Run a 2-week marketing campaign across 2-3 channels to test which approach resonates best with our target audience.`
  } else if (contextLower.includes('pricing') || contextLower.includes('revenue')) {
    return `Test different pricing strategies with A/B testing to find the optimal price point.`
  } else {
    return `Design and run a focused experiment to test the core assumption: ${context}`
  }
}

function extractAssumptions(context: string): string[] {
  const assumptions = []
  const contextLower = context.toLowerCase()
  
  // Common assumption patterns
  if (contextLower.includes('users want') || contextLower.includes('customers need')) {
    assumptions.push('Users actually want this feature/solution')
  }
  if (contextLower.includes('will pay') || contextLower.includes('willing to pay')) {
    assumptions.push('Users are willing to pay for this solution')
  }
  if (contextLower.includes('easy to') || contextLower.includes('simple to')) {
    assumptions.push('This solution is easy to implement and use')
  }
  if (contextLower.includes('market') || contextLower.includes('demand')) {
    assumptions.push('There is sufficient market demand for this solution')
  }
  
  // Add generic assumptions if none found
  if (assumptions.length === 0) {
    assumptions.push('The problem we\'re solving is important to our target users')
    assumptions.push('Our proposed solution will effectively address the problem')
    assumptions.push('Users will adopt and use our solution')
  }
  
  return assumptions
}

function identifyRisks(project: any, context: string): string[] {
  const risks = []
  const contextLower = context.toLowerCase()
  
  // Time-related risks
  if (contextLower.includes('quick') || contextLower.includes('fast')) {
    risks.push('Rushing implementation may lead to poor quality results')
  }
  
  // Resource risks
  if (contextLower.includes('expensive') || contextLower.includes('cost')) {
    risks.push('High implementation costs may not be justified by results')
  }
  
  // Technical risks
  if (contextLower.includes('technical') || contextLower.includes('complex')) {
    risks.push('Technical complexity may cause delays or failures')
  }
  
  // Market risks
  risks.push('Market conditions may change during experiment period')
  risks.push('Competitors may launch similar solutions')
  
  // User adoption risks
  risks.push('Users may not adopt the solution as expected')
  risks.push('User feedback may be negative or inconclusive')
  
  return risks
}

function generateTimeline(project: any, context: string): string {
  const contextLower = context.toLowerCase()
  
  if (contextLower.includes('quick') || contextLower.includes('fast')) {
    return '1-2 weeks for setup and execution'
  } else if (contextLower.includes('comprehensive') || contextLower.includes('detailed')) {
    return '4-6 weeks for thorough analysis'
  } else if (contextLower.includes('pilot') || contextLower.includes('test')) {
    return '2-3 weeks for pilot testing'
  } else {
    return '3-4 weeks for complete experiment cycle'
  }
}

function identifyResources(project: any, context: string): string[] {
  const resources = []
  const contextLower = context.toLowerCase()
  
  // Always include basic resources
  resources.push('Time for planning and execution')
  resources.push('Access to target users or customers')
  
  // Add specific resources based on context
  if (contextLower.includes('technical') || contextLower.includes('development')) {
    resources.push('Development team or technical expertise')
    resources.push('Development tools and infrastructure')
  }
  
  if (contextLower.includes('marketing') || contextLower.includes('growth')) {
    resources.push('Marketing budget for campaigns')
    resources.push('Marketing tools and platforms')
  }
  
  if (contextLower.includes('user') || contextLower.includes('research')) {
    resources.push('User research tools and methods')
    resources.push('Incentives for user participation')
  }
  
  return resources
}

function generateSuccessCriteria(successMetric: string): string {
  return `Achieve a measurable improvement in ${successMetric} that is statistically significant and sustainable over time.`
}

function generateFailureCriteria(successMetric: string): string {
  return `No significant improvement in ${successMetric} or negative impact on other key metrics.`
}

function generateNextSteps(experiment: string, timeline: string): string[] {
  return [
    'Define specific success metrics and measurement methods',
    'Set up tracking and analytics tools',
    'Recruit participants or identify test subjects',
    'Create experiment materials and resources',
    'Execute experiment according to timeline',
    'Collect and analyze results',
    'Document learnings and next steps'
  ]
}

// ============================================================================
// CANVAS TEMPLATES
// ============================================================================

export const CANVAS_TEMPLATES: CanvasTemplate[] = [
  {
    id: 'product-feature',
    name: 'Product Feature Test',
    description: 'Template for testing new product features',
    category: 'product',
    template: {
      hypothesis: 'If we build this feature, then users will engage with it and it will improve our key metrics.',
      successMetric: 'Feature adoption rate and user engagement',
      experiment: 'Build MVP feature and test with beta users',
      timeline: '3-4 weeks',
      resources: ['Development team', 'Beta users', 'Analytics tools']
    }
  },
  {
    id: 'marketing-campaign',
    name: 'Marketing Campaign Test',
    description: 'Template for testing marketing strategies',
    category: 'marketing',
    template: {
      hypothesis: 'If we run this marketing campaign, then we will see increased brand awareness and lead generation.',
      successMetric: 'Lead generation rate and cost per acquisition',
      experiment: 'Run campaign across multiple channels and measure results',
      timeline: '2-3 weeks',
      resources: ['Marketing budget', 'Creative assets', 'Analytics tools']
    }
  },
  {
    id: 'pricing-strategy',
    name: 'Pricing Strategy Test',
    description: 'Template for testing pricing models',
    category: 'business',
    template: {
      hypothesis: 'If we adjust our pricing strategy, then we will see improved conversion rates and revenue.',
      successMetric: 'Conversion rate and average revenue per user',
      experiment: 'A/B test different pricing models with segments',
      timeline: '4-6 weeks',
      resources: ['Pricing data', 'Customer segments', 'Analytics tools']
    }
  }
]

export async function getCanvasTemplates(): Promise<{
  success: boolean
  templates?: CanvasTemplate[]
  error?: string
}> {
  try {
    return { success: true, templates: CANVAS_TEMPLATES }
  } catch (error) {
    console.error('Error fetching canvas templates:', error)
    return { success: false, error: 'Failed to fetch canvas templates' }
  }
}

// ============================================================================
// EXPERIMENT CANVAS API ROUTE
// ============================================================================

export async function createExperimentCanvas(
  projectId: string,
  context: string,
  userId: string,
  template?: string
): Promise<{
  success: boolean
  canvas?: ExperimentCanvas
  error?: string
}> {
  try {
    return await generateExperimentCanvas(projectId, context, userId, template)
  } catch (error) {
    console.error('Error creating experiment canvas:', error)
    return { success: false, error: 'Failed to create experiment canvas' }
  }
}
