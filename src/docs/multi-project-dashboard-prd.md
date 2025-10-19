# Multi-Project Dashboard PRD

## Product Overview

A unified dashboard that transforms the four standalone AI strategy tools into a cohesive portfolio management system for solo founders. Instead of treating each project in isolation, the dashboard provides a command center view where founders can see all their initiatives, understand relationships between projects, and get portfolio-level strategic guidance.

## Problem Statement

Currently, the four features (Project Health Scanner, Idea Capture, Assumption Challenger, Experiment Canvas) exist as separate tools. While valuable individually, they don't help founders manage the complexity of juggling multiple projects simultaneously. Founders need to:

- See all projects in one unified view
- Understand which projects deserve focus
- Track project evolution over time
- Connect ideas, assumptions, and experiments to specific projects

## Target User

Solo founders and small teams (≤5 people) navigating pre-product-market-fit chaos who are actively pursuing 3-10 parallel initiatives.

## Core User Journey

1. **Landing**: Founder arrives at dashboard and sees all active projects as cards
2. **Quick Scan**: At a glance, understands which projects are healthy, stalled, or need attention
3. **Deep Dive**: Clicks into a project to see linked ideas, assumptions, and experiments
4. **Portfolio Strategy**: Gets AI-powered insights about conflicts, synergies, and prioritization across all projects
5. **Quick Capture**: Adds new ideas from anywhere and the system suggests which project(s) they relate to

---

## Stage 1 — UI-Only Prototype (Mock Data)

**Goal**: Validate the dashboard UX with fake data before building real persistence.

### Deliverables:

- Dashboard page at `/dashboard` showing 3-5 mock project cards
- Each card displays: project name, status badge (Active/Stalled/Validated), tags, last activity timestamp
- Add Project button (opens modal with form)
- Filter/sort controls (by status, last updated, tags)
- Basic grid layout responsive on mobile/desktop
- Click card → Navigate to project detail view showing tabs: Overview, Ideas, Assumptions, Experiments
- All data hard-coded in component state (no persistence)

### Acceptance Criteria:

- ✅ User can view mock project cards in grid layout
- ✅ User can see status, tags, and last activity for each project
- ✅ User can click "Add Project" and see form modal (doesn't save yet)
- ✅ User can filter by status using dropdown
- ✅ User can click a card and navigate to detail view
- ✅ Mobile layout shows single column, desktop shows 2-3 columns
- ✅ Dark mode support for all dashboard components

---

## Stage 2 — Real Functionality (Server Actions & localStorage)

**Goal**: Make the dashboard fully functional with real project CRUD operations, localStorage persistence, and integration with existing features.

### 2.1 Core Project Management

**Server Action**: `createProject`, `updateProject`, `deleteProject`, `getProjects`

**Functionality**:

- User can create projects with: name (60 chars), description (300 chars), status (Active/Stalled/Validated/Idea), and tags (multi-select)
- Projects save to localStorage under key `dashboard-projects`
- Each project gets unique ID, created timestamp, and last updated timestamp
- User can edit project details inline or via modal
- User can archive/delete projects with confirmation
- Projects list persists across page reloads

**Data Schema**:

```typescript
interface Project {
  id: string;
  name: string;
  description: string;
  status: 'Active' | 'Stalled' | 'Validated' | 'Idea';
  tags: string[];
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}
```

### 2.2 Link Existing Features to Projects

**Server Action**: `linkIdeaToProject`, `linkAssumptionToProject`, `linkExperimentToProject`

**Functionality**:

- When user creates an idea in Idea Capture, they can optionally assign it to a project
- When user creates an assumption challenge, they can optionally assign it to a project
- When user creates an experiment canvas, they can optionally assign it to a project
- Project detail view shows linked ideas, assumptions, and experiments in separate tabs
- User can view quick count badges on project cards (e.g., "3 ideas, 2 experiments")

**Data Schema Extension**:

```typescript
// Extend existing stored items
interface CapturedIdea {
  // ... existing fields
  projectId?: string;
}

interface ChallengeHistory {
  // ... existing fields
  projectId?: string;
}

interface CanvasHistory {
  // ... existing fields
  projectId?: string;
}
```

### 2.3 Project Activity Timeline

**Server Action**: `getProjectActivity`

**Functionality**:

- Project detail view shows chronological timeline of all activity
- Activity types: Project created, Idea added, Assumption challenged, Experiment generated, Status changed
- Each activity item shows timestamp, type icon, and brief description
- Timeline auto-updates when new items are linked

**Data Schema**:

```typescript
interface ProjectActivity {
  id: string;
  projectId: string;
  type:
    | 'project_created'
    | 'idea_added'
    | 'assumption_challenged'
    | 'experiment_generated'
    | 'status_changed';
  description: string;
  timestamp: string; // ISO timestamp
  metadata?: Record<string, any>; // e.g., { ideaId: '123' }
}
```

### 2.4 Dashboard Stats & Quick Filters

**Server Action**: `getDashboardStats`

**Functionality**:

- Dashboard header shows stats: Total Projects, Active Projects, Ideas Captured This Week, Experiments In Progress
- Quick filter chips: All, Active, Stalled, Validated, Ideas
- Search bar filters projects by name or tag
- Sort dropdown: Last Updated, Alphabetical, Status

### Acceptance Criteria:

- ✅ User can create a project and see it saved to localStorage
- ✅ User can edit project name, description, status, and tags
- ✅ User can delete a project with confirmation dialog
- ✅ User can assign existing ideas/assumptions/experiments to projects
- ✅ User can create new ideas/assumptions/experiments directly from project detail view
- ✅ Project cards show count badges (e.g., "3 ideas")
- ✅ Project detail view shows activity timeline
- ✅ Dashboard stats update in real-time
- ✅ Filters and search work correctly
- ✅ All data persists across page reloads
- ✅ Loading states shown during async operations
- ✅ Error states handle corrupted localStorage gracefully

**Stage 2 Summary:**

- **Server Actions Added:** `createProject`, `updateProject`, `deleteProject`, `logProjectActivity`, `linkItemToProject`, `calculateDashboardStats`, `validateProjectName`
- **Data Storage:** localStorage with keys `dashboard-projects`, `project-activity`, `captured-ideas`, `challenge-history`, `canvas-history`
- **Notable Constraints:** Client-side persistence only, project linking via URL parameters, activity logging for all feature interactions

### Implementation Approach:

- Use Next.js Server Actions for all data operations (preferred over API routes)
- Store data in localStorage with structured keys: `dashboard-projects`, `project-activity`
- Update existing Idea Capture, Assumption Challenger, and Experiment Canvas components to accept optional `projectId` parameter
- Create new `ProjectForm`, `ProjectCard`, `ProjectDetail`, `ActivityTimeline` components
- Wire components to Server Actions with loading/error states

---

## Stage 3 — AI Portfolio Intelligence (Future)

**Goal**: Add cross-project AI analysis that provides strategic recommendations.

### Planned Features:

- AI scans all projects and identifies conflicting assumptions
- AI suggests which projects might have synergies
- AI recommends prioritization based on status and activity
- AI generates portfolio health report
- AI suggests which stalled projects to revisit or archive

**Note**: Stage 3 will require API routes to call OpenAI with portfolio-level context. This is intentionally deferred until Stages 1-2 validate the core UX.

---

## Out of Scope (All Stages)

- User authentication / multi-user support
- Database persistence (Postgres/Supabase)
- Collaboration features (comments, sharing)
- External integrations (Notion, Slack)
- Mobile app
- Advanced analytics dashboard
- File attachments or image uploads
- Recurring tasks or reminders
- Calendar integration

---

## Success Metrics (Stage 2)

After Stage 2 is complete, we'll measure success by:

1. **Usage**: Do founders actually create projects? (Goal: Avg 3-5 projects per active user)
2. **Linking**: Do they link ideas/assumptions/experiments to projects? (Goal: 60%+ of new items linked)
3. **Return visits**: Do they come back to the dashboard regularly? (Goal: 3+ visits per week)
4. **Completion**: Do they move projects through statuses? (Goal: 40%+ of projects transition status within 30 days)

---

## Technical Constraints

- **No external database**: Continue using localStorage for MVP validation
- **Server Actions preferred**: Only use API routes if external services need to call our app
- **Mobile-first responsive**: All views must work on phones, tablets, and desktop
- **Performance**: Dashboard with 10 projects must load in < 500ms
- **Accessibility**: WCAG 2.1 Level AA compliance for all interactive elements

---

## Design Principles

1. **Glanceable**: Status of all projects visible without scrolling on desktop
2. **Minimal friction**: Adding a project takes < 15 seconds
3. **Contextual**: Always show project name when viewing linked items
4. **Reversible**: All destructive actions (delete) require confirmation
5. **Forgiving**: Handle corrupted localStorage gracefully with helpful errors

---

## Next Steps

After Stage 2 completion:

1. Gather user feedback on dashboard utility
2. Measure linking behavior (which features get linked most?)
3. Prototype Stage 3 AI portfolio intelligence
4. Consider database migration if retention validates need for cross-device sync
