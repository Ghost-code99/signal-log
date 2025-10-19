import { NextRequest, NextResponse } from 'next/server';
import {
  scanProjectsSchema,
  validateInput,
  sanitizeText,
} from '../../../lib/validation';

interface Project {
  name: string;
  description: string;
}

interface ProjectAnalysis {
  projectName: string;
  status: 'ready' | 'needs_attention' | 'stalled';
  statusLabel: string;
  riskFlags: string[];
  nextSteps: string[];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input with Zod schema
    const validation = validateInput(scanProjectsSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { projects } = validation.data!;

    const apiKey = process.env.OPENAI_API_KEY;

    // Fallback if no API key
    if (!apiKey) {
      const fallbackAnalyses = generateFallbackAnalyses(projects);
      return NextResponse.json({ analyses: fallbackAnalyses });
    }

    // Build prompt with sanitized content
    const projectsList = projects
      .map(
        (p: Project, i: number) =>
          `${i + 1}. ${sanitizeText(p.name)}: ${sanitizeText(p.description)}`
      )
      .join('\n');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a strategic advisor helping solo founders triage their project portfolio. You analyze projects and provide:
1. Status assessment (ready/needs_attention/stalled)
2. Risk flags (2-3 specific concerns or blind spots)
3. Next steps (2-3 concrete, actionable recommendations)

For each project, evaluate:
- Clarity of hypothesis/goal
- Feasibility with founder's likely resources
- Risks being overlooked
- Momentum (does it sound active or stalled?)

Be direct but constructive. Help founders focus energy on high-impact work.

Respond ONLY with valid JSON in this exact format:
{
  "analyses": [
    {
      "projectName": "Exact project name from input",
      "status": "ready|needs_attention|stalled",
      "statusLabel": "Ready to Test|Needs Validation|Stalled—Needs Action",
      "riskFlags": ["specific concern 1", "specific concern 2", "specific concern 3"],
      "nextSteps": ["concrete action 1", "concrete action 2", "concrete action 3"]
    }
  ]
}

Important: Ensure projectName exactly matches the input project name.`,
          },
          {
            role: 'user',
            content: `Analyze these projects:\n\n${projectsList}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.statusText);
      const fallbackAnalyses = generateFallbackAnalyses(projects);
      return NextResponse.json({ analyses: fallbackAnalyses });
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    // Parse AI response
    let analyses: ProjectAnalysis[] = [];
    try {
      const parsed = JSON.parse(content);
      analyses = parsed.analyses || [];

      // Validate response structure
      if (!Array.isArray(analyses) || analyses.length === 0) {
        analyses = generateFallbackAnalyses(projects);
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      analyses = generateFallbackAnalyses(projects);
    }

    return NextResponse.json({ analyses });
  } catch (error) {
    console.error('Error scanning projects:', error);

    // Try to extract projects from request for fallback
    let projects: Project[] = [];
    try {
      const body = await request.json();
      projects = body.projects || [];
    } catch {
      projects = [];
    }

    const fallbackAnalyses =
      projects.length > 0 ? generateFallbackAnalyses(projects) : [];

    return NextResponse.json(
      {
        error: 'Failed to analyze projects',
        analyses: fallbackAnalyses,
      },
      { status: 500 }
    );
  }
}

function generateFallbackAnalyses(projects: Project[]): ProjectAnalysis[] {
  return projects.map(project => ({
    projectName: sanitizeText(project.name),
    status: 'needs_attention',
    statusLabel: 'Needs Validation',
    riskFlags: [
      'Unable to perform AI analysis—validate your core assumptions',
      'Ensure you have clear success metrics defined',
      'Consider whether you have the resources to execute effectively',
    ],
    nextSteps: [
      'Talk to 5 potential users to validate the problem',
      'Define 1-2 specific metrics that would prove this is working',
      'Set a deadline to decide: ship, pivot, or kill this project',
    ],
  }));
}
