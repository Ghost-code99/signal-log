# AI Assumption Challenger

## Feature Name
AI Assumption Challenger

## Description (What the User Can Do)
The founder enters a business idea, hypothesis, or strategic plan (1-3 sentences) into a simple form. Upon clicking "Challenge My Thinking," the AI acts as a critical sparring partner and responds with 3-5 probing questions designed to challenge core assumptions, identify blind spots, and strengthen the idea. Questions follow patterns like "What evidence supports X?", "What's your weakest assumption?", "Who has failed at this before?", and "What are you not seeing?" The founder can review these challenges, copy them for further reflection, or start over with a new idea.

## User Value (Why It Matters)
This feature directly addresses the loneliness of solo founder decision-making. Most founders lack an experienced advisor to challenge their thinking before they invest time and resources into an idea. This tool:
- **Prevents costly mistakes:** Surfaces flawed assumptions early, before execution
- **Deepens strategic thinking:** Forces critical reflection that founders often skip when alone
- **Builds confidence:** Well-challenged ideas feel more validated and ready to execute
- **Simulates advisory board:** Provides the sparring partner experience without needing investors or mentors
- **Speeds up learning:** Compresses weeks of "figuring it out" into minutes of focused questioning

The feature embodies the core "AI strategy partner" value proposition—it's not just storing information, it's actively helping the founder think better.

## Implementation Considerations (No DB; UI-Only or Mocked Data)
- **No database required:** Each session is stateless; challenges are generated on-demand
- **AI integration:** Uses OpenAI API (GPT-4 recommended for better reasoning) via Next.js API route
- **Client-side state:** React manages the current idea and generated challenges during the session
- **Optional history:** Can use localStorage to save recent challenges for quick reference (read-only)
- **API key:** Requires OpenAI API key (environment variable)
- **Prompt engineering:** System prompt designed specifically for critical questioning patterns
- **Response format:** AI returns structured JSON with array of challenge questions
- **Copy functionality:** Users can copy all challenges to clipboard for use in other tools

## Out of Scope (What We Won't Do Yet)
- **No conversation thread:** Single request/response only—no back-and-forth dialogue
- **No refinement loop:** Founder can't ask AI to "dig deeper" on a specific question
- **No personalization:** AI doesn't learn from previous challenges or founder's context
- **No collaboration:** Can't share challenges with team members or advisors
- **No persistence across devices:** History (if implemented) only in localStorage
- **No structured frameworks:** Doesn't guide founder through specific methodologies (e.g., Jobs-to-be-Done)
- **No action items:** Only questions—doesn't suggest next steps or experiments
- **No comparison:** Can't compare multiple ideas or see which has stronger/weaker assumptions

