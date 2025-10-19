# AI Project Health Scanner - Product Requirements Document

## 1. Overview

### Product Name
AI Project Health Scanner

### Version
1.0 (MVP)

### Date
October 15, 2025

### Product Manager
AI Product Copilot

---

## 2. Executive Summary

The AI Project Health Scanner is the first feature of the Multi-Project Dashboard. It enables solo founders to quickly assess the health of their active project portfolio through AI-powered analysis. Users input 3-5 projects, and the AI provides instant triage: status signals, risk flags, and actionable next steps for each initiative.

This feature addresses a critical pain point: founders juggling multiple experiments without clarity on which deserve attention. Unlike passive project trackers, this provides **active strategic guidance** to help founders make smarter prioritization decisions.

---

## 3. Goals & Success Metrics

### Primary Goals
1. Demonstrate AI strategic intelligence within 30 seconds of use
2. Help founders prioritize their portfolio with confidence
3. Validate product-market fit for AI-powered strategic tools

### Success Metrics (Post-Launch)
- **Engagement:** 70%+ of users who land on the page submit at least one scan
- **Time to Value:** Users see results within 10 seconds of submission
- **Perceived Value:** 60%+ of users copy or screenshot results (proxy for usefulness)
- **Retention:** 30%+ of users return to scan again within 7 days

### Out of Scope for MVP
- Multi-session persistence (database storage)
- Cross-project conflict detection
- Historical tracking / progress over time
- Collaboration features
- Export to PDF/CSV

---

## 4. User Personas

### Primary Persona: Solo Founder Sam
- **Context:** Running a pre-PMF startup, managing 3-5 active experiments simultaneously
- **Pain:** No clear view of which projects are stalled, risky, or ready to ship
- **Goal:** Quickly triage portfolio to focus energy on highest-impact work
- **Technical Comfort:** High; comfortable with web apps and AI tools

---

## 5. User Stories & Acceptance Criteria

### Epic: Project Portfolio Health Assessment

#### Story 1: Submit Projects for Analysis
**As a** solo founder  
**I want to** input 3-5 active projects with brief descriptions  
**So that** I can get AI-powered health assessments for my portfolio

**Acceptance Criteria:**
- [ ] Form allows 3-5 project entries (each with name + description fields)
- [ ] Name field has 60-character limit; description has 300-character limit
- [ ] Form validates that at least 3 projects are filled in before submission
- [ ] Submit button shows loading state during AI processing
- [ ] Form is disabled during processing to prevent double-submission

#### Story 2: View AI Health Assessments
**As a** solo founder  
**I want to** see health status, risks, and next steps for each project  
**So that** I can make informed prioritization decisions

**Acceptance Criteria:**
- [ ] Results display as project cards in a grid/list layout
- [ ] Each card shows: project name, description (truncated if long), status badge, risk flags, and 2-3 next-step bullets
- [ ] Status badges use color coding: Green (Ready/Healthy), Yellow (Needs Attention), Red (High Risk/Stalled)
- [ ] Results appear within 10 seconds of submission
- [ ] If AI call fails, fallback generic assessment is shown (not a blank error page)

#### Story 3: Copy Results for External Use
**As a** solo founder  
**I want to** copy all results to clipboard  
**So that** I can paste them into my notes or share with advisors

**Acceptance Criteria:**
- [ ] "Copy All" button appears above results
- [ ] Button click copies formatted text (project name, status, risks, next steps)
- [ ] Visual confirmation ("Copied!") appears for 2 seconds after click
- [ ] Copied format is readable in plain text (e.g., Slack, Notes app)

#### Story 4: Scan Multiple Times
**As a** solo founder  
**I want to** easily reset and scan a new set of projects  
**So that** I can compare different portfolio configurations

**Acceptance Criteria:**
- [ ] "Start Over" or "New Scan" button clears form and results
- [ ] Browser back button doesn't break the experience
- [ ] (Optional) Last scan saved to localStorage for quick reference if user refreshes

---

## 6. Functional Requirements

### 6.1 User Interface

#### Project Input Form
- 3-5 expandable project entry sections
- Each section contains:
  - **Project Name:** Single-line text input (max 60 chars)
  - **Project Description:** Multi-line textarea (max 300 chars, 3-4 lines visible)
- Character counters below each field
- "Add Project" button (if <5 projects) and "Remove" buttons (if >3 projects)
- Primary CTA: "Analyze My Portfolio" button (disabled until ≥3 projects filled)

#### Results Display
- Full-width card grid (2 columns on desktop, 1 on mobile)
- Each project card includes:
  - **Header:** Project name + status badge
  - **Description snippet:** First 100 chars + "..." if truncated
  - **Risk Flags section:** 2-3 bullet points highlighting concerns
  - **Next Steps section:** 2-3 actionable recommendations
- "Copy All Results" and "Start Over" buttons above grid

#### Loading States
- Submit button → spinner + "Analyzing..." text
- Skeleton cards appear during processing
- Error state: Friendly message + "Try Again" button

### 6.2 API Specifications

#### Endpoint: `POST /api/scan-projects`

**Request Body:**
```json
{
  "projects": [
    {
      "name": "Cold Email Campaign",
      "description": "Testing outbound sales via personalized cold emails to 200 SMB founders. Goal: 5% reply rate."
    },
    {
      "name": "Landing Page Redesign",
      "description": "Simplifying hero section and adding social proof. Hypothesis: Conversion rate will increase from 2% to 4%."
    },
    {
      "name": "Pricing Experiment",
      "description": "Testing $49/mo vs $99/mo tiers. Currently getting feedback from 10 beta users."
    }
  ]
}
```

**Response Body:**
```json
{
  "analyses": [
    {
      "projectName": "Cold Email Campaign",
      "status": "needs_attention",
      "statusLabel": "Needs Validation",
      "riskFlags": [
        "5% reply rate assumption is very aggressive for cold outreach",
        "200 contacts may be too small a sample size",
        "No mention of email deliverability/spam risk"
      ],
      "nextSteps": [
        "Research industry benchmarks (typical reply rates are 1-2%)",
        "Test email copy with 20 contacts before scaling",
        "Set up email warmup to protect sender reputation"
      ]
    },
    {
      "projectName": "Landing Page Redesign",
      "status": "ready",
      "statusLabel": "Ready to Test",
      "riskFlags": [
        "Doubling conversion rate is ambitious without data",
        "No A/B test plan mentioned"
      ],
      "nextSteps": [
        "Set up A/B test with 50/50 traffic split",
        "Define success criteria (min sample size, confidence level)",
        "Ship within 1 week to maintain momentum"
      ]
    },
    {
      "projectName": "Pricing Experiment",
      "status": "stalled",
      "statusLabel": "Stalled—Needs Action",
      "riskFlags": [
        "10 beta users is too small for pricing signal",
        "No timeline for decision mentioned",
        "Feedback collection method unclear"
      ],
      "nextSteps": [
        "Expand beta to 30+ users for meaningful data",
        "Create structured survey to gauge willingness to pay",
        "Set decision deadline (e.g., 2 weeks) to avoid analysis paralysis"
      ]
    }
  ]
}
```

**Status Codes:**
- `200 OK`: Successful analysis
- `400 Bad Request`: Invalid input (e.g., <3 projects, missing fields)
- `500 Internal Server Error`: AI call failure (returns fallback analysis)

**Fallback Behavior:**
If OpenAI API fails, return generic but useful assessments:
- Status: All projects marked "needs_attention"
- Risk flags: Generic strategic questions
- Next steps: Standard best practices (validate assumptions, talk to users, set deadlines)

---

## 7. Technical Architecture

### Tech Stack
- **Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS
- **API:** Next.js API Routes (Edge Runtime for speed)
- **AI:** OpenAI GPT-4 (gpt-4o-mini for cost efficiency)
- **State Management:** React hooks (useState)
- **Storage:** Browser localStorage (optional, for last scan)

### Component Structure
```
/src/app/project-health-scanner/
  page.tsx                    # Page wrapper with header/footer
  
/src/components/
  project-health-scanner.tsx  # Main client component

/src/app/api/scan-projects/
  route.ts                    # API route for AI analysis
```

### AI Prompt Engineering

**System Prompt:**
```
You are a strategic advisor helping solo founders triage their project portfolio. You analyze projects and provide:
1. Status assessment (ready/needs_attention/stalled)
2. Risk flags (2-3 specific concerns or blind spots)
3. Next steps (2-3 concrete, actionable recommendations)

For each project, evaluate:
- Clarity of hypothesis/goal
- Feasibility with founder's likely resources
- Risks being overlooked
- Momentum (does it sound active or stalled?)

Be direct but constructive. Help founders focus energy on high-impact work.

Respond ONLY with valid JSON in this format:
{
  "analyses": [
    {
      "projectName": "...",
      "status": "ready|needs_attention|stalled",
      "statusLabel": "Ready to Test|Needs Validation|Stalled—Needs Action",
      "riskFlags": ["...", "...", "..."],
      "nextSteps": ["...", "...", "..."]
    }
  ]
}
```

**User Prompt:**
```
Analyze these projects:
1. [Project Name]: [Description]
2. [Project Name]: [Description]
...
```

---

## 8. UI/UX Design Specifications

### Visual Design
- **Brand Alignment:** Use existing Signal Log design system (Tailwind, shadcn/ui components)
- **Color Palette:**
  - Status badges: Green (#10b981), Yellow (#f59e0b), Red (#ef4444)
  - Cards: White/dark mode compatible with subtle shadow
  - Accents: Primary brand color for CTAs

### Responsive Behavior
- **Desktop (≥1024px):** 2-column grid for results, full-width form
- **Tablet (768-1023px):** 2-column grid, slightly condensed form
- **Mobile (<768px):** Single-column layout, stacked project cards

### Accessibility
- [ ] All form inputs have associated labels
- [ ] Status badges have ARIA labels (not just color-coded)
- [ ] Keyboard navigation works for entire flow
- [ ] Color contrast meets WCAG AA standards
- [ ] Loading states announced to screen readers

---

## 9. Implementation Plan

### Phase 1: Core Functionality (MVP)
**Timeline:** 2-3 hours

#### Stage 1 — UI Design Only

1. ✅ **Component Structure** (`src/components/project-health-scanner.tsx`)
   - Main Card wrapper with header and icon
   - Form layout with 3-5 expandable project sections
   - Character counters for inputs
   - Validation: Component renders without errors

2. ✅ **Project Input Form**
   - Name field (60 char limit) and Description textarea (300 char limit)
   - "Add Project" button (appears when <5 projects)
   - "Remove" buttons (appear when >3 projects)
   - Live character count displays
   - Validation: Add/remove buttons work, counters update

3. ✅ **Submit Button & Loading State**
   - "Analyze My Portfolio" button with Activity icon
   - Loading spinner during mock API delay
   - Disabled state during processing
   - Validation: Button shows loading state correctly

4. ✅ **Results Display Layout**
   - 2-column grid (1 column on mobile)
   - Project cards with status badges
   - Risk flags section with AlertTriangle icon
   - Next steps section with CheckCircle2 icon
   - Validation: Mock results render in proper layout

5. ✅ **Action Buttons**
   - "Copy All Results" button with copy/check icons
   - "Start Over" button with RefreshCw icon
   - Copy confirmation state (2 second duration)
   - Validation: Buttons trigger correct states

6. ✅ **Page Wrapper** (`src/app/project-health-scanner/page.tsx`)
   - Hero section with title and value prop
   - Integrated with Header/Footer components
   - Proper metadata
   - Validation: Page accessible at `/project-health-scanner` route

7. ✅ **Accessibility & Polish**
   - All form inputs have proper labels and ARIA attributes
   - Keyboard navigation support
   - Focus indicators and hover states
   - Screen reader support with aria-live regions
   - Validation: Full keyboard navigation works

8. ✅ **Sample Data Feature**
   - "Try Sample Data" button for quick demo
   - Pre-fills form with 3 realistic example projects
   - Validation: Sample data loads correctly

**Stage 1 Summary:**  
UI built with shadcn/ui components (Card, Button, Input, Textarea, Label, Badge). Mock data stored in `MOCK_ANALYSES` constant in component. Form validation, character limits, and copy-to-clipboard all functional. Professional accessibility standards met (WCAG 2.1 Level AA).

#### Stage 2 — Real Functionality

1. **API Route** (30 min)
   - Create `/api/scan-projects/route.ts`
   - Implement OpenAI integration
   - Add fallback logic

2. **Wire up API integration**
   - Replace mock setTimeout with real API call
   - Handle loading and error states
   - Parse and display real AI analysis

3. **Testing** (20 min)
   - Test with 3, 4, and 5 projects
   - Test error states and fallbacks
   - Mobile responsiveness check

### Phase 2: Polish & Optimization (Future)
- Add localStorage to persist last scan
- Improve AI prompt for better edge cases
- Add "Export as PDF" feature
- Implement rate limiting

---

## 10. Testing & Validation

### Test Scenarios

**Happy Path:**
1. User lands on page
2. Fills in 3 projects with realistic descriptions
3. Clicks "Analyze My Portfolio"
4. Sees results within 10 seconds
5. Copies results to clipboard
6. Clicks "Start Over" to scan again

**Edge Cases:**
- User submits with only 2 projects → Validation error
- User submits with 250+ word descriptions → Truncated gracefully
- API call times out → Fallback results shown
- User refreshes during loading → Returns to empty form (no broken state)

### QA Checklist
- [ ] Form validation prevents submission with <3 projects
- [ ] Loading state appears immediately on submit
- [ ] Results render correctly in light and dark mode
- [ ] Copy button successfully copies formatted text
- [ ] Mobile layout doesn't break on small screens
- [ ] Browser back/forward doesn't cause errors
- [ ] Error messages are user-friendly (not technical)

---

## 11. Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| AI responses are too generic | High | Medium | Iterate on prompt engineering; include few-shot examples |
| API latency >15 seconds | Medium | Low | Use streaming response; show per-project results as they arrive |
| Users don't understand status labels | Medium | Medium | Add tooltips explaining "Ready/Needs Attention/Stalled" |
| Feature feels like a toy (no persistence) | High | Medium | Add localStorage; mention in UI this is MVP; promise more features soon |
| OpenAI API costs spike | Low | Low | Use gpt-4o-mini; implement rate limiting in Phase 2 |

---

## 12. Launch Plan

### Pre-Launch
- [ ] Add feature card to homepage (update `/app/page.tsx`)
- [ ] Create social media preview image
- [ ] Write launch tweet/post copy

### Launch
- [ ] Deploy to production
- [ ] Post to social media with demo video
- [ ] Share in founder communities (Indie Hackers, Twitter)
- [ ] Monitor for errors in first 24 hours

### Post-Launch
- [ ] Collect user feedback (add feedback button?)
- [ ] Track usage metrics (GA or similar)
- [ ] Iterate on AI prompt based on user reactions
- [ ] Plan Phase 2 features based on demand

---

## 13. Appendix

### Related Documents
- [AI Project Health Scanner Concept](./ai-project-health-scanner-concept.md)
- [Multi-Project Dashboard Concept](./concept.md)

### Open Questions
1. Should we allow 6+ projects, or keep strict 3-5 limit?
2. Should status labels be customizable (e.g., user can override AI assessment)?
3. Do we need a "Refresh Analysis" button for same projects?

### Glossary
- **Portfolio:** The collection of active projects/experiments a founder is managing
- **Triage:** The process of prioritizing which projects deserve immediate attention
- **Status Signal:** AI-generated indicator of project health (ready/needs attention/stalled)

