'use server'

import { supabase } from './supabase'

export interface AssumptionChallenge {
  id: string
  projectId: string
  assumption: string
  questions: string[]
  aiAnalysis: string
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  suggestions: string[]
  created_at: string
}

export interface ChallengeSession {
  id: string
  projectId: string
  assumptions: AssumptionChallenge[]
  sessionSummary: string
  nextSteps: string[]
  created_at: string
}

// ============================================================================
// AI ASSUMPTION CHALLENGER
// ============================================================================

export async function generateAssumptionQuestions(assumption: string, context?: string): Promise<{
  success: boolean
  questions?: string[]
  error?: string
}> {
  try {
    // This would typically call an AI service like OpenAI
    // For now, we'll use a template-based approach
    const baseQuestions = [
      "What evidence do you have to support this assumption?",
      "What would happen if this assumption is wrong?",
      "Who else might have a different perspective on this?",
      "What data would you need to validate this assumption?",
      "How could you test this assumption quickly and cheaply?"
    ]

    const contextualQuestions = context ? [
      `Given the context of "${context}", what specific risks does this assumption carry?`,
      `How does this assumption align with your overall strategy in this context?`
    ] : []

    const questions = [...baseQuestions, ...contextualQuestions]

    return { success: true, questions }
  } catch (error) {
    console.error('Error generating assumption questions:', error)
    return { success: false, error: 'Failed to generate questions' }
  }
}

export async function analyzeAssumption(assumption: string, context?: string): Promise<{
  success: boolean
  analysis?: {
    riskLevel: 'low' | 'medium' | 'high' | 'critical'
    analysis: string
    suggestions: string[]
  }
  error?: string
}> {
  try {
    // Analyze assumption strength and risk
    const riskFactors = [
      assumption.length < 20 ? 'assumption_too_vague' : null,
      assumption.toLowerCase().includes('always') || assumption.toLowerCase().includes('never') ? 'absolute_language' : null,
      assumption.toLowerCase().includes('everyone') || assumption.toLowerCase().includes('nobody') ? 'generalization' : null,
      !assumption.includes('because') && !assumption.includes('since') ? 'lacks_reasoning' : null
    ].filter(Boolean)

    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low'
    if (riskFactors.length >= 3) {
      riskLevel = 'critical'
    } else if (riskFactors.length === 2) {
      riskLevel = 'high'
    } else if (riskFactors.length === 1) {
      riskLevel = 'medium'
    }

    // Generate analysis based on risk factors
    let analysis = `This assumption has a ${riskLevel} risk level. `
    
    if (riskFactors.includes('assumption_too_vague')) {
      analysis += "The assumption is too vague to be actionable. "
    }
    if (riskFactors.includes('absolute_language')) {
      analysis += "Using absolute language (always/never) makes the assumption fragile. "
    }
    if (riskFactors.includes('generalization')) {
      analysis += "Generalizing to 'everyone' or 'nobody' is rarely accurate. "
    }
    if (riskFactors.includes('lacks_reasoning')) {
      analysis += "The assumption lacks clear reasoning or evidence. "
    }

    // Generate suggestions
    const suggestions = []
    if (riskLevel === 'critical' || riskLevel === 'high') {
      suggestions.push("Break this assumption into smaller, testable hypotheses")
      suggestions.push("Design a quick experiment to validate this assumption")
      suggestions.push("Talk to 3-5 people who might have different perspectives")
    }
    
    if (riskFactors.includes('assumption_too_vague')) {
      suggestions.push("Make the assumption more specific and measurable")
    }
    if (riskFactors.includes('absolute_language')) {
      suggestions.push("Replace absolute terms with probabilistic language")
    }
    if (riskFactors.includes('generalization')) {
      suggestions.push("Identify specific user segments instead of generalizing")
    }
    if (riskFactors.includes('lacks_reasoning')) {
      suggestions.push("Add clear reasoning and evidence to support this assumption")
    }

    return {
      success: true,
      analysis: {
        riskLevel,
        analysis,
        suggestions
      }
    }
  } catch (error) {
    console.error('Error analyzing assumption:', error)
    return { success: false, error: 'Failed to analyze assumption' }
  }
}

export async function createAssumptionChallenge(
  projectId: string,
  assumption: string,
  userId: string,
  context?: string
): Promise<{
  success: boolean
  challenge?: AssumptionChallenge
  error?: string
}> {
  try {
    // Generate questions and analysis
    const [questionsResult, analysisResult] = await Promise.all([
      generateAssumptionQuestions(assumption, context),
      analyzeAssumption(assumption, context)
    ])

    if (!questionsResult.success || !analysisResult.success) {
      return { 
        success: false, 
        error: questionsResult.error || analysisResult.error 
      }
    }

    const challenge: AssumptionChallenge = {
      id: `challenge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      projectId,
      assumption,
      questions: questionsResult.questions || [],
      aiAnalysis: analysisResult.analysis?.analysis || '',
      riskLevel: analysisResult.analysis?.riskLevel || 'medium',
      suggestions: analysisResult.analysis?.suggestions || [],
      created_at: new Date().toISOString()
    }

    // Store the challenge
    const { error } = await supabase
      .from('ai_interactions')
      .insert({
        project_id: projectId,
        interaction_type: 'assumption_challenge',
        content: assumption,
        ai_response: JSON.stringify({
          questions: challenge.questions,
          analysis: challenge.aiAnalysis,
          riskLevel: challenge.riskLevel,
          suggestions: challenge.suggestions
        }),
        metadata: {
          challenge_id: challenge.id,
          risk_level: challenge.riskLevel
        }
      })

    if (error) {
      console.error('Error storing assumption challenge:', error)
      return { success: false, error: error.message }
    }

    return { success: true, challenge }
  } catch (error) {
    console.error('Error creating assumption challenge:', error)
    return { success: false, error: 'Failed to create assumption challenge' }
  }
}

export async function getProjectAssumptionChallenges(projectId: string, userId: string): Promise<{
  success: boolean
  challenges?: AssumptionChallenge[]
  error?: string
}> {
  try {
    const { data: interactions, error } = await supabase
      .from('ai_interactions')
      .select('*')
      .eq('project_id', projectId)
      .eq('interaction_type', 'assumption_challenge')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching assumption challenges:', error)
      return { success: false, error: error.message }
    }

    const challenges: AssumptionChallenge[] = interactions?.map(interaction => {
      const aiResponse = JSON.parse(interaction.ai_response || '{}')
      return {
        id: interaction.metadata?.challenge_id || interaction.id,
        projectId: interaction.project_id,
        assumption: interaction.content,
        questions: aiResponse.questions || [],
        aiAnalysis: aiResponse.analysis || '',
        riskLevel: aiResponse.riskLevel || 'medium',
        suggestions: aiResponse.suggestions || [],
        created_at: interaction.created_at
      }
    }) || []

    return { success: true, challenges }
  } catch (error) {
    console.error('Error fetching assumption challenges:', error)
    return { success: false, error: 'Failed to fetch assumption challenges' }
  }
}

export async function runAssumptionChallengeSession(
  projectId: string,
  assumptions: string[],
  userId: string,
  context?: string
): Promise<{
  success: boolean
  session?: ChallengeSession
  error?: string
}> {
  try {
    const challenges: AssumptionChallenge[] = []
    
    // Process each assumption
    for (const assumption of assumptions) {
      const { success, challenge, error } = await createAssumptionChallenge(
        projectId,
        assumption,
        userId,
        context
      )
      
      if (success && challenge) {
        challenges.push(challenge)
      } else {
        console.error('Error processing assumption:', error)
      }
    }

    // Generate session summary
    const highRiskChallenges = challenges.filter(c => c.riskLevel === 'high' || c.riskLevel === 'critical')
    const sessionSummary = `Analyzed ${challenges.length} assumptions. ${highRiskChallenges.length} high-risk assumptions identified that need immediate attention.`

    // Generate next steps
    const nextSteps = []
    if (highRiskChallenges.length > 0) {
      nextSteps.push('Prioritize testing high-risk assumptions with quick experiments')
    }
    if (challenges.length > 3) {
      nextSteps.push('Consider focusing on fewer, more critical assumptions')
    }
    nextSteps.push('Schedule follow-up sessions to track assumption validation progress')

    const session: ChallengeSession = {
      id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      projectId,
      assumptions: challenges,
      sessionSummary,
      nextSteps,
      created_at: new Date().toISOString()
    }

    return { success: true, session }
  } catch (error) {
    console.error('Error running assumption challenge session:', error)
    return { success: false, error: 'Failed to run assumption challenge session' }
  }
}

// ============================================================================
// ASSUMPTION CHALLENGER API ROUTE
// ============================================================================

export async function challengeProjectAssumptions(
  projectId: string,
  assumptions: string[],
  userId: string,
  context?: string
): Promise<{
  success: boolean
  session?: ChallengeSession
  error?: string
}> {
  try {
    return await runAssumptionChallengeSession(projectId, assumptions, userId, context)
  } catch (error) {
    console.error('Error challenging project assumptions:', error)
    return { success: false, error: 'Failed to challenge assumptions' }
  }
}
