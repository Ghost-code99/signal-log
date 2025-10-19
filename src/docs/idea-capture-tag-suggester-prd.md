# PRD: Idea Capture & AI Tag Suggester

**Links:** [Concept Doc](./idea-capture-tag-suggester-concept.md) | [Product Context](./concept.md)

## 1. Objective

Enable solo founders to capture raw business ideas and instantly organize them with AI-suggested tags, eliminating manual categorization friction.

## 2. Scope

### In-Scope

- Text input for capturing ideas (textarea)
- AI-powered tag generation (3-5 tags per idea)
- Accept/remove suggested tags with one click
- Add custom tags manually
- Save ideas to localStorage with tags and timestamps
- View list of saved ideas with tags
- Delete individual ideas
- Basic error handling and loading states

### Out-of-Scope

- Database persistence or backend storage
- User authentication or multi-user support
- Idea editing after save (single-shot capture only—prevents scope creep)
- Search, filtering, or advanced organization
- Export functionality (PDF, CSV)
- Cross-device synchronization
- Tag analytics or suggestions based on history

## 3. User Stories

**US-1:** As a solo founder capturing a product insight during a customer call, I want to quickly paste my raw notes and get instant tag suggestions, so that I can categorize the idea without breaking my flow.

**US-2:** As a founder reviewing my captured ideas, I want to see all ideas organized with their tags and timestamps, so that I can quickly scan related concepts and identify patterns **without needing cloud sync or accounts**.

**US-3:** As a user who prefers specific terminology, I want to add my own custom tags in addition to AI suggestions, so that my organizational system matches my mental model.

## 4. Acceptance Criteria

```gherkin
Scenario: Generate tags for new idea
  Given I am on the idea capture page
  When I enter "Add referral program with 20% discount for both parties"
  And I click "Generate Tags"
  Then I should see 3-5 relevant tag suggestions within 3 seconds
  And tags should be clickable to toggle selection

Scenario: Save idea with tags
  Given I have generated tags for an idea
  When I select 2 tags and click "Save Idea"
  Then the idea should appear in my saved list
  And display the selected tags
  And show the timestamp

Scenario: Add custom tag
  Given I have generated AI tags
  When I type "Q4 Priority" in the custom tag field
  And press Enter
  Then "Q4 Priority" should be added to selected tags

Scenario: Delete saved idea
  Given I have saved ideas in my list
  When I click the delete button on an idea
  Then that idea should be removed from the list
  And removed from localStorage
```

## 5. Success Metrics

- **Adoption:** 80%+ of test users capture at least 3 ideas in first session
- **AI Value:** 70%+ of suggested tags are accepted without modification
- **Retention:** Users return to review saved ideas at least once within 7 days
- **Performance:** Tag generation completes within 3 seconds for 95% of requests

---

## Implementation Plan

### Stage 1 — UI Design Only

1. ✅ **Create component structure** (`src/components/idea-capture.tsx`)
   - Main Card wrapper with header and description
   - Textarea input for idea entry (min 140px height)
   - Generate button with loading state (disabled when empty)
   - Validation: Component renders without errors

2. ✅ **Build tag suggestion UI section**
   - Badge components for suggested tags (clickable, toggle states)
   - Visual distinction between selected/unselected (outline vs filled)
   - Custom tag input field with add button
   - Keyboard support (Enter/Space to toggle tags)
   - Validation: Tags toggle between states on click and keyboard

3. ✅ **Create saved ideas list display**
   - Card list showing idea text, tags (secondary badges), timestamp
   - Delete button (Trash2 icon) per item with hover effects
   - Empty state when no ideas saved
   - Semantic time elements with dateTime attributes
   - Validation: List renders with localStorage data

4. ✅ **Add applied tags section**
   - Display currently selected tags before save
   - Tag count indicator
   - Visual separation from suggestions
   - Validation: Selected tags update in real-time

5. ✅ **Create page wrapper** (`src/app/idea-capture/page.tsx`)
   - Header section with title and description
   - Centered max-width container (max-w-4xl)
   - Integration with existing Header/Footer components
   - Validation: Page loads at `/idea-capture` route

6. ✅ **Style and responsive layout**
   - Mobile-first responsive design (375px to desktop)
   - Proper spacing and typography hierarchy
   - Loading spinner with Sparkles icon on generate button
   - Smooth transitions and hover effects
   - Validation: Tested on mobile (375px) and desktop (1440px) viewports

7. ✅ **Accessibility & Polish**
   - All inputs have proper labels (visible and sr-only)
   - Checkbox roles for tag badges with aria-checked
   - Focus states with ring indicators
   - Screen reader support with aria-describedby
   - Validation: Full keyboard navigation works

**Stage 1 Summary:**  
UI built with shadcn/ui components (Card, Button, Input, Badge). Uses localStorage for persistence (`captured-ideas` key). Real API integration to `/api/generate-tags` with fallback tags. Professional accessibility (WCAG 2.1 Level AA) with keyboard navigation support.

### Stage 2 — Real Functionality

1. ✅ **Create API route** (`src/app/api/generate-tags/route.ts`)
   - ✅ Accept POST with `{ idea: string }`
   - ✅ Call OpenAI API with tag generation prompt
   - ✅ Return `{ tags: string[] }` or fallback tags if API fails
   - ✅ Validation: Test with curl/Postman, verify JSON response

2. ✅ **Implement localStorage persistence**
   - ✅ Define `Idea` interface: `{ id, text, tags, timestamp }`
   - ✅ Load ideas from localStorage on component mount
   - ✅ Save to localStorage when idea is added
   - ✅ Validation: Check localStorage in browser DevTools after save

3. ✅ **Wire up tag generation flow**
   - ✅ Fetch from `/api/generate-tags` on button click
   - ✅ Set loading state during API call
   - ✅ Update `suggestedTags` and `selectedTags` state with response
   - ✅ Show tag suggestion UI section after response
   - ✅ Validation: Network tab shows successful API call

4. ✅ **Implement tag interaction logic**
   - ✅ Toggle tag selection on badge click
   - ✅ Add custom tag on button click or Enter key
   - ✅ Prevent duplicate custom tags
   - ✅ Clear custom input after adding
   - ✅ Validation: Click through all tag interactions

5. ✅ **Wire save idea functionality**
   - ✅ Create new Idea object with current data
   - ✅ Prepend to savedIdeas state array
   - ✅ Reset form (clear text, tags, hide suggestions)
   - ✅ Validation: Verify idea persists after page refresh

6. ✅ **Implement delete functionality**
   - ✅ Filter idea from state by ID
   - ✅ Update localStorage after deletion
   - ✅ Clear localStorage if last idea deleted
   - ✅ Validation: Delete multiple ideas, refresh, verify persistence

7. ✅ **Add error handling**
   - ✅ Try-catch around API calls with console.error
   - ✅ Fallback tags if fetch fails
   - ✅ Try-catch around localStorage operations
   - ✅ Validation: Test with network offline, verify fallbacks work

**Stage 2 Summary:**

- **Route Added:** `/api/generate-tags` (POST)
- **Request Shape:** `{ idea: string }`
- **Response Shape:** `{ tags: string[] }`
- **Notable Constraints:** Uses GPT-3.5-turbo for cost efficiency, includes fallback tags, supports project linking via URL parameters

### Stage 3 — Test, Debug, and Safety Checks

1. ✅ **Verify all user stories map to completed implementation**
   - Test US-1 (capture flow): Paste idea → generate → tags appear
   - Test US-2 (review): View saved list with multiple ideas, verify localStorage
   - Test US-3 (customization): Add custom tag → appears in applied list
   - Validation: All user stories pass manual testing, no DB dependency

2. ✅ **Test acceptance criteria scenarios**
   - Run through all Gherkin scenarios manually
   - Verify timing (tags appear within 3 seconds)
   - Check localStorage persistence after each action
   - Validation: Document any failures, fix blocking issues

3. ✅ **Input validation and sanitization**
   - Disable generate button when textarea empty
   - Trim whitespace from idea text before sending
   - Trim and validate custom tags (no empty strings)
   - Validation: Try edge cases (empty strings, whitespace only)

4. ✅ **Error state testing**
   - Test with invalid/missing OPENAI_API_KEY
   - Verify fallback tags display
   - Test localStorage quota exceeded scenario
   - Validation: All error paths show graceful degradation

5. ✅ **Edge case testing**
   - Very long ideas (1000+ characters)
   - Special characters in ideas and tags
   - Rapid clicks on generate button
   - localStorage with corrupted data
   - Validation: No crashes, appropriate behavior for all cases

6. ✅ **Accessibility quick pass**
   - Keyboard navigation (Tab through form, Enter to submit)
   - Button disabled states are clear
   - Loading states announced (aria-live or spinner visible)
   - Validation: Complete flow using only keyboard

7. ✅ **Performance sanity check**
   - Test with 50+ saved ideas in localStorage
   - Verify no lag on typing or tag clicks
   - Check bundle size doesn't include unnecessary deps
   - Validation: Smooth UX with realistic data volume

8. ✅ **Cross-browser smoke test**
   - Test in Chrome, Firefox, Safari (if available)
   - Verify localStorage works in all browsers
   - Check button/input styling consistency
   - Validation: Core functionality works in all browsers

9. ✅ **Mobile responsiveness verification**
   - Test textarea usability on mobile (375px width)
   - Verify tags wrap properly on narrow screens
   - Check touch targets are adequate (44x44px minimum)
   - Validation: Feature fully usable on mobile device/emulator

10. ✅ **Final integration check**
    - Verify page appears in navigation if applicable
    - Test link from homepage feature cards
    - Run `npm run build` to catch production issues
    - Run linter and fix any warnings
    - Validation: No console errors, clean production build

**Stage 3 Summary:**

- **Security Implementation:** Added Zod validation on API route; escaped user content before render
- **Zero Trust Applied:** All inputs validated, outputs sanitized, safe rendering implemented

```

---

**Status:** Ready for Implementation
**Last Updated:** October 15, 2025

```
