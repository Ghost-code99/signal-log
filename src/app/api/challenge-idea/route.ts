import { NextRequest, NextResponse } from 'next/server';
import { challengeIdeaSchema, validateInput, sanitizeText } from '../../../lib/validation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input with Zod schema
    const validation = validateInput(challengeIdeaSchema, body);
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
      // Fallback questions if no API key configured
      const fallbackQuestions = [
        'What evidence do you have that customers actually want this?',
        'What is your weakest assumption in this idea?',
        'Who has tried something similar and failed? What can you learn from them?',
        'What are you NOT seeing about this problem or market?',
      ];
      return NextResponse.json({ questions: fallbackQuestions });
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
            content: `You are a critical but supportive strategic advisor helping solo founders stress-test their ideas. Your job is to challenge assumptions, identify blind spots, and ask the hard questions that founders often avoid.

When presented with an idea, generate 4-5 probing questions that:
1. Challenge core assumptions (e.g., "What evidence supports your belief that X?")
2. Identify risks and blind spots (e.g., "What are you NOT seeing about this market?")
3. Test market understanding (e.g., "Who has tried this before and why did they fail?")
4. Probe weakest links (e.g., "What's your most fragile assumption here?")
5. Force resource reality (e.g., "Do you have the skills/time/money to actually execute this?")

Be direct but constructive. The goal is to strengthen the idea, not discourage the founder.

Respond ONLY with a JSON object containing a "questions" array of strings, e.g.:
{
  "questions": [
    "What evidence do you have that customers will pay for this?",
    "Who has tried this approach before and what happened?",
    "What's your weakest assumption in this plan?",
    "What market dynamics are you potentially overlooking?"
  ]
}`,
          },
          {
            role: 'user',
            content: `Challenge this idea: ${sanitizedIdea}`,
          },
        ],
        temperature: 0.8,
        max_tokens: 400,
      }),
    });

    if (!response.ok) {
      const fallbackQuestions = [
        'What evidence supports your core assumptions about this idea?',
        'What is the biggest risk you might be overlooking?',
        'Who has attempted something similar, and what did they learn?',
        'If this fails, what would be the most likely reason?',
      ];
      return NextResponse.json({ questions: fallbackQuestions });
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    // Parse the AI response
    let questions: string[] = [];
    try {
      const parsed = JSON.parse(content);
      questions = parsed.questions || [];
      
      if (!Array.isArray(questions) || questions.length === 0) {
        questions = [
          'What evidence supports your assumptions about customer demand?',
          'What are the biggest risks in this approach?',
          'Who has tried this before and what happened?',
          'What might you be overlooking about this problem?',
        ];
      }
    } catch {
      // Fallback if parsing fails
      questions = [
        'What validates your core assumptions here?',
        'What could cause this idea to fail?',
        'What are you NOT seeing about this opportunity?',
        'Do you have the resources to execute this effectively?',
      ];
    }

    return NextResponse.json({ questions });
  } catch (error) {
    console.error('Error generating challenges:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate challenges',
        questions: [
          'What evidence supports your assumptions?',
          'What are the biggest risks here?',
          'Who has tried this before?',
          'What might you be missing?',
        ],
      },
      { status: 500 }
    );
  }
}

