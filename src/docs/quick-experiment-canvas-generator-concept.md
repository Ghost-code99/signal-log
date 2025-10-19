# Quick Experiment Canvas Generator

## Feature Name

Quick Experiment Canvas Generator

## Description (What the User Can Do)

The founder describes a business idea or hypothesis in 1-3 sentences and clicks "Generate Experiment." The AI instantly transforms this raw input into a structured, actionable experiment canvas containing: (1) a clear hypothesis statement, (2) a measurable success metric, (3) the smallest possible test to validate the idea, (4) estimated timeline, and (5) key resources needed. The founder can edit any field inline, regenerate specific sections, download the canvas as markdown, or copy it to their clipboard for use in project management tools or notes.

## User Value (Why It Matters)

This feature bridges the critical gap between "having an idea" and "taking action." Most founders get stuck in the messy middle—they know what they want to test but struggle to structure it into an actionable plan. This tool:

- **Eliminates analysis paralysis:** Transforms vague concepts into concrete plans in seconds
- **Enforces best practices:** Ensures every experiment has clear success criteria and scope
- **Speeds up execution:** Reduces planning time from hours to minutes
- **Builds experimentation muscle:** Teaches founders how to structure good experiments through repetition
- **Creates portable artifacts:** Outputs are ready to share with advisors, team members, or stakeholders

The feature embodies the "momentum engine" by helping founders move from thinking to doing, ensuring ideas don't stagnate.

## Implementation Considerations (No DB; UI-Only or Mocked Data)

- **No database required:** Each canvas generation is stateless; results exist only in current session
- **AI integration:** Uses OpenAI API (GPT-4 recommended) to generate structured experiment frameworks
- **Client-side state:** React manages the canvas data and inline editing
- **Optional history:** Can use localStorage to save recent canvases (last 5-10) for quick reference
- **API key:** Requires OpenAI API key (environment variable)
- **Structured output:** AI returns JSON with specific fields (hypothesis, metric, test, timeline, resources)
- **Export options:** Copy to clipboard (markdown format) and download as .md file
- **Editable fields:** All generated fields are editable via inline inputs
- **Regenerate capability:** Can regenerate entire canvas or individual sections

## Out of Scope (What We Won't Do Yet)

- **No experiment tracking:** Doesn't track experiment execution or results over time
- **No collaboration:** Can't share canvases with team or get feedback
- **No templates:** Only generates lean experiment format (no Lean Canvas, Business Model Canvas, etc.)
- **No integration:** Can't push to project management tools (Notion, Asana, etc.)
- **No learning loop:** AI doesn't learn from past experiments or outcomes
- **No experiment library:** Can't organize canvases by theme, status, or priority
- **No reminders:** No follow-up notifications or deadlines
- **No comparison:** Can't compare multiple experiment approaches side-by-side
