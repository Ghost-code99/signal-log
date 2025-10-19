import { NextRequest, NextResponse } from 'next/server';
import {
  generateTagsSchema,
  validateInput,
  sanitizeText,
} from '../../../lib/validation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input with Zod schema
    const validation = validateInput(generateTagsSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { idea } = validation.data!;
    const sanitizedIdea = sanitizeText(idea);

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      // Fallback tags if no API key configured
      const fallbackTags = ['Product', 'Strategy', 'Growth', 'Customer'];
      return NextResponse.json({ tags: fallbackTags });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a strategic advisor helping solo founders organize their ideas. Analyze the provided idea and suggest 3-5 relevant tags that categorize it. Tags should be concise (1-3 words) and actionable.

Common tag categories include:
- Product Feature
- Growth Hack
- Customer Insight
- Marketing Strategy
- Sales Strategy
- Fundraising
- Team Building
- Competitive Analysis
- Product Roadmap
- User Research
- Technical Debt
- Brand Building

Respond ONLY with a JSON array of tag strings, e.g.: ["Product Feature", "User Research", "Growth Hack"]`,
          },
          {
            role: 'user',
            content: sanitizedIdea,
          },
        ],
        temperature: 0.7,
        max_tokens: 100,
      }),
    });

    if (!response.ok) {
      const fallbackTags = ['Product', 'Strategy', 'Growth'];
      return NextResponse.json({ tags: fallbackTags });
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    // Parse the AI response
    let tags: string[] = [];
    try {
      tags = JSON.parse(content);
      if (!Array.isArray(tags)) {
        tags = ['Product', 'Strategy'];
      }
    } catch {
      // Fallback if parsing fails
      tags = ['Product', 'Strategy'];
    }

    return NextResponse.json({ tags });
  } catch (error) {
    console.error('Error generating tags:', error);
    return NextResponse.json(
      { error: 'Failed to generate tags', tags: ['Product', 'Strategy'] },
      { status: 500 }
    );
  }
}
