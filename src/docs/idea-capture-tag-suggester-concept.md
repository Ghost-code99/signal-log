# Idea Capture & AI Tag Suggester

## Feature Name
Idea Capture & AI Tag Suggester

## Description (What the User Can Do)
The founder can paste or type a raw business idea, customer insight, or strategic thought into a simple input form. Upon submission, the AI instantly analyzes the content and suggests 3-5 relevant tags (e.g., `Growth Hack`, `Product Feature`, `Customer Insight`, `Marketing`, `Sales Strategy`). The founder can accept suggested tags with one click, remove unwanted ones, or add custom tags manually. The tagged idea is displayed in a clean card format, showing the original text alongside the applied tags.

## User Value (Why It Matters)
This feature delivers immediate value by transforming the chaotic process of idea capture into an organized, intelligent workflow. Instead of manually categorizing every thought or letting ideas remain unstructured, the founder gets instant AI-powered organization. This:
- **Saves time:** No need to think about categorization while capturing ideas
- **Reduces cognitive load:** Focuses founder energy on thinking, not organizing
- **Demonstrates AI partnership:** Shows the product's intelligence in the first interaction
- **Creates structure from chaos:** Makes it easy to see patterns across multiple ideas

The feature solves the core problem of scattered ideas by providing frictionless capture with intelligent organization built in.

## Implementation Considerations (No DB; UI-Only or Mocked Data)
- **No database required:** Ideas are stored in browser `localStorage` for persistence across sessions
- **AI integration:** Uses OpenAI API (GPT-4 or GPT-3.5) for tag generation via a Next.js API route
- **Client-side state:** React state manages the current idea and tags during editing
- **Session persistence:** localStorage ensures ideas survive page refreshes without backend infrastructure
- **API key:** Requires OpenAI API key (set as environment variable)
- **Fallback:** If API fails, shows predefined common tags as fallback suggestions
- **Data structure:** Each idea stored as JSON with `{ id, text, tags, timestamp }`

## Out of Scope (What We Won't Do Yet)
- **No database or backend storage:** All data lives in browser localStorage only
- **No user authentication:** Single-user experience, no accounts or login
- **No cross-device sync:** Ideas only available on the device where they were created
- **No advanced search or filtering:** Simple list view of captured ideas only
- **No idea editing:** Once saved, ideas are read-only (can be deleted but not modified)
- **No collaborative features:** Single founder using one browser instance
- **No export functionality:** No PDF, CSV, or external integrations
- **No AI conversation:** Tags only—no back-and-forth dialogue with AI yet

