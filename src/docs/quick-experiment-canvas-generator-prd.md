# PRD: Quick Experiment Canvas Generator

**Links:** [Concept Doc](./quick-experiment-canvas-generator-concept.md) | [Product Context](./concept.md)

## 1. Objective
Enable solo founders to move from vague idea to testable experiment in under 2 minutes—**eliminating analysis paralysis**.

## 2. Scope

### In-Scope
- Text input for idea description (textarea)
- AI generation of 5-section experiment canvas:
  1. Hypothesis (If-Then-Because format)
  2. Success Metric (measurable)
  3. Smallest Test (minimal viable experiment)
  4. Timeline (estimated duration)
  5. Resources Needed (list)
- Inline editing for all generated fields
- Dynamic add/remove resources
- Export as Markdown file (download)
- Copy to clipboard (formatted text)
- Optional history in localStorage (last 10 canvases)
- Loading states and error handling

### Out-of-Scope
- Experiment execution tracking
- Results and outcome recording
- Team collaboration or sharing
- Multiple canvas templates (only Lean Experiment format)
- Integration with project management tools
- Notifications or reminders
- Comparison of multiple experiments
- Database persistence

## 3. User Stories

**US-1:** As a solo founder with a fuzzy idea about testing a pricing change, I want to generate a structured experiment canvas, so that I have a clear hypothesis, success metric, and minimal test plan without spending hours thinking through the structure.

**US-2:** As a founder who wants to customize the AI-generated canvas, I want to edit any field inline, so that I can adjust the hypothesis, metrics, or resources to match my specific context.

**US-3:** As a user ready to execute an experiment, I want to download the canvas as a Markdown file, so that I can reference it while running the experiment and share it with advisors or team members.

## 4. Acceptance Criteria

```gherkin
Scenario: Generate experiment canvas
  Given I am on the experiment canvas page
  When I enter "Test if 7-day free trial increases SaaS conversions"
  And I click "Generate Experiment Canvas"
  Then I should see a canvas with 5 sections within 5 seconds
  And hypothesis should follow "If...then...because" format
  And success metric should be specific and measurable
  
Scenario: Edit canvas fields inline
  Given I have generated a canvas
  When I click into the "Hypothesis" textarea
  And modify the text
  Then the changes should be reflected immediately
  And persisted for download/copy actions
  And canvas maintains valid structure (no broken sections)
  
Scenario: Manage resources list
  Given I have a canvas with 3 resources
  When I click "+ Add Resource"
  Then a new empty input field should appear
  When I fill it with "Analytics tool"
  And click remove on another resource
  Then the list should update accordingly
  
Scenario: Download as Markdown
  Given I have a completed canvas
  When I click "Download"
  Then a .md file should download
  And contain all sections formatted in Markdown
  And include my edited content
  
Scenario: Copy to clipboard
  Given I have a canvas
  When I click "Copy"
  Then formatted text should copy to clipboard
  And button should show "Copied!" confirmation
```

## 5. Success Metrics

- **Utility:** 70%+ of users download or copy their generated canvas
- **Customization:** 80%+ of users edit at least one field before exporting
- **Time Savings:** Users create canvas in under 2 minutes (vs. 30+ min manual)
- **Completeness:** 90%+ of canvases include all 5 required sections
- **Performance:** Canvas generation completes within 5 seconds for 95% of requests

---

## Implementation Plan

### Stage 1 — UI Design Only

1. ✅ **Create component structure** (`src/components/experiment-canvas.tsx`)
   - Main input Card with textarea and description
   - "Generate Experiment Canvas" button with Sparkles icon (primary, large)
   - "New Canvas" button with RotateCcw icon (appears after generation)
   - Validation: Component renders without errors

2. ✅ **Build canvas display layout**
   - Canvas Card with numbered sections (Badges 1-5)
   - Section headers with Label components and proper hierarchy
   - Textarea inputs for multi-line fields (hypothesis min 100px, smallest test min 120px)
   - Text inputs for single-line fields (metric, timeline)
   - All fields have proper IDs and aria-describedby hints
   - Validation: Canvas renders with all 5 sections and proper semantics

3. ✅ **Create resources section UI**
   - Dynamic list of Input fields with role="list"
   - "+ Add Resource" button (outline variant, small)
   - Remove button (X icon) next to each resource
   - Minimum 1 resource always present (prevents deletion of last)
   - Proper labels (sr-only for screen readers)
   - Validation: Add/remove buttons work, accessibility verified

4. ✅ **Add export controls**
   - Header row: title + Copy/Download buttons (outline, small)
   - Copy button with Copy/Check icon transition and success state
   - Download button with Download icon (creates .md file)
   - Hover effects with scale transitions
   - Proper aria-labels for all actions
   - Validation: Buttons render with correct states and animations

5. ✅ **Build history panel**
   - "History" button with History icon and count badge in header
   - Toggle-able history Card (max-w-4xl)
   - History items with semantic time elements (dateTime attributes)
   - Keyboard navigation support (Enter/Space to load)
   - History items: truncated idea + "Canvas" badge + timestamp
   - Hover, focus, and click states with smooth transitions
   - Validation: History panel toggles, keyboard accessible

6. ✅ **Create page wrapper** (`src/app/experiment-canvas/page.tsx`)
   - Hero section with title "Quick Experiment Canvas Generator"
   - Value proposition: "Transform vague ideas into structured experiments"
   - Centered container with max-w-4xl
   - Integration with Header/Footer
   - Validation: Page accessible at `/experiment-canvas` route

7. ✅ **Add helper text and formatting**
   - Format hints under hypothesis: "If [action], then [outcome], because [reasoning]"
   - Section descriptions for success metric: "One measurable metric to validate success"
   - Smallest test hint: "The minimal viable way to test your hypothesis"
   - Tip at bottom with border styling: "Edit any field to customize..."
   - All hints use muted text color and proper spacing
   - Validation: All microcopy is legible, helpful, and accessible

8. ✅ **Accessibility & Polish**
   - All form fields have proper Labels with htmlFor attributes
   - Field-specific hints connected via aria-describedby
   - Focus states with ring indicators on all inputs
   - Smooth transitions on all interactive elements
   - Proper heading hierarchy and semantic regions
   - Validation: WCAG 2.1 Level AA compliance verified

**Stage 1 Summary:**  
UI built with shadcn/ui components (Card, Button, Input, Label, Badge). Uses localStorage for history (`canvas-history` key, last 10 canvases). Real API integration to `/api/generate-canvas` with fallback canvas structure. Inline editing with controlled inputs. Markdown export and clipboard copy fully functional. Professional accessibility standards met.

### Stage 2 — Real Functionality

1. **Create API route** (`src/app/api/generate-canvas/route.ts`)
   - Accept POST with `{ idea: string }`
   - Call OpenAI GPT-4 with lean experiment system prompt
   - Parse JSON: `{ hypothesis, successMetric, smallestTest, timeline, resources[] }`
   - Return fallback canvas structure on error
   - Validation: Test endpoint, verify JSON structure

2. **Implement canvas generation flow**
   - Fetch from `/api/generate-canvas` on button click
   - Set loading state (`isGenerating`)
   - Update `canvas` state with response
   - Set `editableCanvas` as mutable copy
   - Show canvas display section
   - Validation: API call completes, UI updates

3. **Wire up inline editing**
   - Bind textarea/input values to `editableCanvas` state
   - `updateField()` function for text fields
   - Update state on change events
   - Validation: Type in fields, verify state updates in React DevTools

4. **Implement resource management**
   - `addResource()` appends empty string to resources array
   - `updateResource(index, value)` updates specific resource
   - `removeResource(index)` filters out by index
   - Prevent removing last resource
   - Validation: Add/edit/remove resources, check state

5. **Add copy to clipboard functionality**
   - Format text: "Experiment Canvas\n\nIdea: ...\n\nHypothesis:\n..."
   - Use `navigator.clipboard.writeText()`
   - Set `copied` true, reset after 2 seconds
   - Validation: Copy, paste into editor, check formatting

6. **Implement Markdown download**
   - Build markdown string with proper formatting (## headers, lists)
   - Create Blob with type 'text/markdown'
   - Generate download link with `experiment-canvas-{timestamp}.md` filename
   - Trigger download, clean up URL
   - Validation: Download file, open in text editor, verify format

7. **Add localStorage history**
   - Define `SavedCanvas` interface **(localStorage only—no backend)**: `{ id, idea, canvas, timestamp }`
   - Load history on mount
   - Save new canvas to history (keep last 10)
   - Update localStorage after generation
   - Validation: Generate multiple, check localStorage

8. **Wire history panel**
   - Toggle `showHistory` state
   - Render list of saved canvases
   - `loadFromHistory()` populates idea and canvas
   - Close panel after selection
   - Validation: Click history items, verify data loads

9. **Implement reset flow**
   - "New Canvas" clears all states (idea, canvas, editable)
   - Returns to initial input form
   - Validation: Generate → edit → reset → verify clean state

10. **Add error handling**
    - Try-catch around API calls
    - Fallback canvas on API failure
    - Try-catch around clipboard and file operations
    - Console.error for debugging
    - Validation: Test with network off, verify graceful degradation

### Stage 3 — Test, Debug, and Safety Checks

1. **Verify all user stories**
   - Test US-1: Enter idea → generate → review structured canvas
   - Test US-2: Edit multiple fields → verify changes persist
   - Test US-3: Download file → open → verify all content present
   - Validation: All stories pass end-to-end

2. **Test acceptance criteria scenarios**
   - Run all Gherkin scenarios manually
   - Verify hypothesis format ("If...then...because")
   - Check metric is specific and measurable
   - Test add/remove resources flow
   - Validation: Document failures, fix blockers

3. **Input validation and sanitization**
   - Disable generate when textarea empty
   - Trim whitespace from idea text
   - Handle empty resource inputs gracefully
   - Test very long ideas (2000+ chars)
   - Validation: No crashes on edge inputs

4. **Canvas editing edge cases**
   - Clear entire field, save, verify not lost
   - Test with special characters in fields
   - Add 20 resources (no limit, should work)
   - Try to remove last resource (should prevent)
   - Validation: Editing is robust and predictable

5. **Export functionality testing**
   - Download multiple times (unique filenames)
   - Copy, edit canvas, copy again (updated content)
   - Test with canvas containing special chars/emojis
   - Verify Markdown syntax is correct (headers, lists)
   - Validation: Exports work reliably in all cases

6. **History and persistence**
   - Generate 12 canvases (should cap at 10)
   - Test with corrupted localStorage
   - Clear localStorage mid-session
   - Load history item, edit, generate new (both in history)
   - Validation: History is stable and useful

7. **API and error handling**
   - Test with missing OPENAI_API_KEY
   - Test with invalid API key
   - Test with malformed API response
   - Verify fallback canvas is sensible
   - Validation: User never stuck or sees errors

8. **Accessibility quick pass**
   - Keyboard navigation through all fields
   - Tab order: idea → generate → edit fields → export buttons
   - Enter in textarea should NOT submit (newlines allowed)
   - Validation: Usable without mouse

9. **Mobile responsiveness**
   - Test on 375px viewport
   - Verify textareas are adequately sized
   - Check resource list usability on mobile
   - Test download on mobile Safari
   - Validation: Fully functional on mobile devices

10. **Final integration and polish**
    - Test link from homepage feature card
    - Verify numbered badges are consistent (1-5)
    - Check icon usage (Sparkles, Download, Copy, RotateCcw)
    - Run `npm run build` and fix issues
    - Run linter and typecheck
    - No console errors in production
    - Validation: Production-ready, professional polish
```

---

**Status:** Ready for Implementation  
**Last Updated:** October 15, 2025

