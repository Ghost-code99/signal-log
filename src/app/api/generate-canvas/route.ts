import { NextRequest, NextResponse } from 'next/server';
import { generateCanvasSchema, validateInput, sanitizeText } from '../../../lib/validation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input with Zod schema
    const validation = validateInput(generateCanvasSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const { idea } = validation.data!;
    const sanitizedIdea = sanitizeText(idea);

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      // Fallback canvas if no API key configured
      const fallbackCanvas = {
        hypothesis: 'If we [action], then [expected outcome] because [reasoning].',
        successMetric: 'Number of users who complete the desired action within 7 days',
        smallestTest: 'Create a simple landing page and drive 100 visitors to measure interest',
        timeline: '1-2 weeks',
        resources: ['Landing page builder', 'Marketing budget ($50-100)', 'Analytics tool'],
      };
      return NextResponse.json({ canvas: fallbackCanvas });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a lean startup advisor helping founders design rapid, low-cost experiments. When given an idea, transform it into a structured experiment canvas using these principles:

1. HYPOTHESIS: Clear, testable statement following "If [action], then [outcome], because [reasoning]"
2. SUCCESS METRIC: One specific, measurable metric with a target number/threshold
3. SMALLEST TEST: The absolute minimum viable way to test the hypothesis (emphasize speed, low cost, manual processes)
4. TIMELINE: Realistic timeframe (usually 1-4 weeks for early experiments)
5. RESOURCES: List of 3-5 specific things needed (tools, skills, budget, people)

Focus on experiments that:
- Can be done WITHOUT building full products
- Prioritize learning over perfection
- Use manual processes and existing tools
- Cost less than $500 if possible
- Take less than 1 month

Respond ONLY with JSON in this exact format:
{
  "hypothesis": "If we...",
  "successMetric": "X users do Y within Z days",
  "smallestTest": "Description of minimal test",
  "timeline": "1-2 weeks",
  "resources": ["Resource 1", "Resource 2", "Resource 3"]
}`,
          },
          {
            role: 'user',
            content: `Design an experiment canvas for this idea: ${sanitizedIdea}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const fallbackCanvas = {
        hypothesis: 'Define a clear, testable hypothesis for your idea',
        successMetric: 'Choose one measurable metric to track success',
        smallestTest: 'Design the simplest possible test to validate your hypothesis',
        timeline: '2-3 weeks',
        resources: ['Time investment', 'Basic tools', 'Initial budget'],
      };
      return NextResponse.json({ canvas: fallbackCanvas });
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    // Parse the AI response
    let canvas;
    try {
      canvas = JSON.parse(content);
      
      // Validate structure
      if (!canvas.hypothesis || !canvas.successMetric || !canvas.smallestTest) {
        throw new Error('Invalid canvas structure');
      }

      // Ensure resources is an array
      if (!Array.isArray(canvas.resources)) {
        canvas.resources = ['Time', 'Basic tools', 'Small budget'];
      }
    } catch {
      // Fallback if parsing fails
      canvas = {
        hypothesis: 'Create a clear hypothesis based on your idea',
        successMetric: 'Define one measurable success metric',
        smallestTest: 'Identify the smallest way to test your hypothesis',
        timeline: '2 weeks',
        resources: ['Time', 'Tools', 'Initial investment'],
      };
    }

    return NextResponse.json({ canvas });
  } catch (error) {
    console.error('Error generating canvas:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate canvas',
        canvas: {
          hypothesis: 'Define your hypothesis',
          successMetric: 'Choose a success metric',
          smallestTest: 'Design your test',
          timeline: '2 weeks',
          resources: ['Basic resources needed'],
        },
      },
      { status: 500 }
    );
  }
}




