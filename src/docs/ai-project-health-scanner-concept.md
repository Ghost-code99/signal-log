# AI Project Health Scanner

## Feature Name
AI Project Health Scanner

## Description
Users can add 3-5 active projects or initiatives (each with a name and brief description) to a simple form. Upon submission, the AI analyzes the entire portfolio and provides a side-by-side health assessment for each project, including:
- **Status signal** (e.g., "Ready to test," "Stalled—needs clarity," "High risk—validate assumptions")
- **Risk flags** (what could go wrong or what's uncertain)
- **Recommended next steps** (the smallest action to make progress)

The results display as cards in a dashboard-style layout, allowing founders to quickly triage their portfolio and decide where to focus their energy.

## User Value
Solo founders juggling multiple initiatives often lack clarity on which projects deserve attention. They waste time on stalled experiments or overlook high-potential ones. This feature acts as a **strategic triage assistant**, giving founders an instant portfolio overview powered by AI intelligence. It helps them:
- **Make smarter prioritization decisions** based on AI-surfaced signals
- **Avoid analysis paralysis** by receiving clear, actionable next steps
- **Feel strategically in control** rather than reactively overwhelmed

Unlike passive project trackers, this feature provides **active strategic guidance** at the portfolio level—helping founders think, not just organize.

## Implementation Considerations
- **No database required:** Stateless feature. User inputs project data via a form; AI processes and returns results. No persistence needed for MVP.
- **UI-only with AI integration:** Simple Next.js page with form inputs (project name + description fields × 3-5). On submit, call OpenAI API (or similar) with a carefully crafted prompt. Display results as project cards with status badges, risk callouts, and next-step bullets.
- **Mocked data for demos:** Can pre-populate example projects (e.g., "Cold Email Campaign," "Landing Page Redesign," "Pricing Experiment") to demonstrate value immediately.
- **Local storage (optional):** Could add browser localStorage to persist form inputs between sessions, but not required for v1.

## Out of Scope (What We Won't Do Yet)
- **Project persistence:** Users can't save projects or revisit historical analyses. Each session is fresh.
- **Cross-project conflict detection:** Won't identify assumption conflicts or resource competition between projects (that's a future feature).
- **Progress tracking:** No timestamps, status history, or "last activity" tracking.
- **Collaboration:** Single-user experience only; no sharing or team features.
- **External integrations:** No connections to GitHub, Notion, or other tools.
- **Advanced AI features:** No iterative chat, no assumption deep-dives, no experiment canvas generation (per-project sparring is a separate feature).

This feature is laser-focused on delivering **one clear value**: instant AI-powered triage of a founder's active project portfolio.

