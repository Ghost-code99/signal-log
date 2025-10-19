# PRD: AI Assumption Challenger

**Links:** [Concept Doc](./ai-assumption-challenger-concept.md) | [Product Context](./concept.md)

## 1. Objective

Enable solo founders to identify blind spots and strengthen their business ideas through AI-generated critical questions **that prevent costly mistakes**.

## 2. Scope

### In-Scope

- Text input for idea/hypothesis (textarea)
- AI generation of 4-5 critical challenging questions
- Questions displayed in numbered, highlighted cards
- Copy all questions to clipboard
- Optional history of recent challenges (localStorage)
- View and reload past challenges
- Error handling and loading states
- Fallback questions if API unavailable

### Out-of-Scope

- Multi-turn conversation or dialogue
- Follow-up questions on specific challenges
- Saving responses/answers to challenges
- Answer tracking or founder's responses to challenges
- Sharing challenges with others
- Database persistence
- User authentication
- Analytics on question effectiveness
- Integration with other tools

## 3. User Stories

**US-1:** As a solo founder about to invest in building a new feature, I want to receive critical questions about my assumptions, so that I can identify potential blind spots before spending weeks on development.

**US-2:** As a founder who challenged an idea last week, I want to quickly access my previous challenges from history, so that I can revisit the questions as my thinking evolves.

**US-3:** As a user reviewing AI-generated questions, I want to copy all challenges at once, so that I can paste them into my notes or share with my advisor for further discussion.

## 4. Acceptance Criteria

```gherkin
Scenario: Generate challenges for idea
  Given I am on the assumption challenger page
  When I enter "Build a marketplace for AI consultants with 15% commission"
  And I click "Challenge My Thinking"
  Then I should see 4-5 critical questions within 5 seconds
  And questions should be displayed in numbered amber-themed cards

Scenario: Copy challenges to clipboard
  Given I have generated challenges for an idea
  When I click the "Copy All" button
  Then all questions should be copied to clipboard
  And button should show "Copied!" confirmation for 2 seconds

Scenario: Load from history
  Given I have challenged ideas previously
  When I click "History" button
  Then I should see a list of recent challenges
  When I click on a historical challenge
  Then the idea and questions should reload in the main view

Scenario: Handle API failure gracefully
  Given the OpenAI API is unavailable
  When I submit an idea for challenge
  Then I should still see fallback questions
  And not see any error messages to the user
```

## 5. Success Metrics

- **Engagement:** 60%+ of users who generate challenges spend 2+ minutes reviewing questions
- **Quality:** 75%+ of users copy questions (signal of value)
- **Repeat Use:** 40%+ of users challenge multiple ideas in a single session
- **Performance:** Challenge generation completes within 5 seconds for 95% of requests

---

## Implementation Plan

### Stage 1 — UI Design Only

1. ✅ **Create component structure** (`src/components/assumption-challenger.tsx`)
   - Main Card wrapper with header section
   - Textarea for idea input (min 160px height)
   - "Challenge My Thinking" primary button with Sparkles icon
   - Validation: Component renders without errors

2. ✅ **Build challenge results display**
   - Numbered badge + question text layout in ordered list
   - Amber-themed Card components for each question
   - AlertCircle icon in section header
   - Visual hierarchy emphasizing questions as "alerts"
   - Section header "Critical Questions to Consider"
   - Validation: Questions render in amber cards with proper semantics

3. ✅ **Add copy and reset controls**
   - "Copy All" button with Copy/Check icons (outline variant)
   - "Start Over" button with hover effects (appears after generation)
   - Success state for copy button (checkmark, "Copied!" for 2 seconds)
   - Transition animations on all buttons
   - Validation: Buttons toggle states correctly with smooth animations

4. ✅ **Create history panel UI**
   - "History" button in header with History icon (shows count badge)
   - Collapsible Card showing recent challenges (last 10)
   - Each history item: truncated idea + question count + timestamp
   - Keyboard navigation support (Enter/Space to load)
   - Click to load behavior with hover and focus states
   - Validation: History panel toggles open/closed, keyboard accessible

5. ✅ **Create page wrapper** (`src/app/assumption-challenger/page.tsx`)
   - Hero section with title and value proposition
   - Centered content container (max-w-4xl)
   - Integration with Header/Footer
   - Validation: Page accessible at `/assumption-challenger` route

6. ✅ **Add helpful microcopy**
   - Tip text: "Take time to honestly answer each question..."
   - Placeholder text with detailed example idea
   - Description: "Share your idea and let AI ask the hard questions"
   - Field hint: "Be detailed about your assumptions..."
   - Validation: All copy is clear and helpful

7. ✅ **Accessibility & Polish**
   - Proper ARIA labels and roles throughout
   - Ordered list semantics for questions
   - Focus management on panel toggle
   - Screen reader support with descriptive labels
   - Validation: Full keyboard navigation and screen reader compatible

**Stage 1 Summary:**  
UI built with shadcn/ui components (Card, Button, Badge). Uses localStorage for history (`challenge-history` key, last 10 items). Real API integration to `/api/challenge-idea` with fallback questions. Amber color theme emphasizes critical thinking. Professional accessibility (WCAG 2.1 Level AA).

### Stage 2 — Real Functionality

1. ✅ **Create API route** (`src/app/api/challenge-idea/route.ts`)
   - ✅ Accept POST with `{ idea: string }`
   - ✅ Call OpenAI GPT-4 with critical questioning system prompt
   - ✅ Parse JSON response: `{ questions: string[] }`
   - ✅ Return fallback questions on error
   - ✅ Validation: Test endpoint with curl, verify structured response

2. ✅ **Implement challenge generation flow**
   - ✅ Fetch from `/api/challenge-idea` on button click
   - ✅ Set `isGenerating` loading state
   - ✅ Update `challenges` state with response questions
   - ✅ Show challenge results section
   - ✅ Validation: Network tab shows successful GPT-4 call

3. ✅ **Wire up copy to clipboard**
   - ✅ Format text: "Idea: [idea]\n\nChallenging Questions:\n1. [q1]..."
   - ✅ Use `navigator.clipboard.writeText()`
   - ✅ Set `copied` state to true, reset after 2 seconds
   - ✅ Validation: Paste into text editor, verify formatting

4. ✅ **Implement reset functionality**
   - ✅ Clear `ideaText`, `challenges`, `showChallenges` states
   - ✅ Return to initial form view
   - ✅ Validation: Click "Start Over", verify form resets

5. ✅ **Add localStorage history**
   - ✅ Define `Challenge` interface: `{ id, idea, questions, timestamp }`
   - ✅ Load history from localStorage on mount
   - ✅ Save new challenge to history (keep last 10)
   - ✅ Update localStorage after each generation
   - ✅ Validation: Check localStorage in DevTools after multiple challenges

6. ✅ **Implement history panel interactions**
   - ✅ Toggle `showHistory` state on button click
   - ✅ Render history items with click handlers
   - ✅ `loadFromHistory()` populates idea and questions
   - ✅ Close history panel after selection
   - ✅ Validation: Click through history items, verify data loads

7. ✅ **Add error handling**
   - ✅ Try-catch around API calls
   - ✅ Fallback questions if fetch fails
   - ✅ Try-catch around localStorage operations
   - ✅ Console.error for debugging
   - ✅ Validation: Test with network disabled, verify fallbacks

**Stage 2 Summary:**

- **Route Added:** `/api/challenge-idea` (POST)
- **Request Shape:** `{ idea: string }`
- **Response Shape:** `{ questions: string[] }`
- **Notable Constraints:** Uses GPT-4 for deeper reasoning, includes fallback questions, supports project linking via URL parameters

### Stage 3 — Test, Debug, and Safety Checks

1. ✅ **Verify all user stories**
   - Test US-1: Enter idea → get questions → review for blind spots
   - Test US-2: Generate multiple → check history → reload previous
   - Test US-3: Generate → copy → paste into notes app
   - Validation: All stories pass end-to-end

2. ✅ **Test acceptance criteria scenarios**
   - Run all Gherkin scenarios manually
   - Verify timing (questions within 5 seconds)
   - Check copied text format and content
   - Validation: Document any failures, prioritize fixes

3. ✅ **Input validation and edge cases**
   - Disable button when textarea empty
   - Trim whitespace from idea text
   - Handle very long ideas (2000+ characters)
   - Test special characters and emojis
   - Validation: No crashes on edge inputs

4. ✅ **API error handling verification**
   - Test with missing OPENAI_API_KEY
   - Test with invalid API key
   - Test with rate limit error (mock if needed)
   - Verify fallback questions display
   - Validation: User never sees raw error messages; **feature remains useful even offline with fallbacks**

5. ✅ **History functionality testing**
   - Add 15 challenges (should cap at 10)
   - Test with corrupted localStorage data
   - Delete localStorage manually and reload
   - Test clicking history items in sequence
   - Validation: History robust to edge cases

6. ✅ **Copy functionality cross-browser**
   - Test clipboard API in Chrome, Firefox, Safari
   - Verify "Copied!" confirmation appears
   - Check formatted text includes all questions
   - Validation: Works in all major browsers

7. ✅ **Accessibility quick pass**
   - Keyboard navigation through entire flow
   - Tab order is logical (textarea → button → history)
   - Enter key submits form from textarea
   - Validation: Complete flow without mouse

8. ✅ **Performance with real API**
   - Test multiple rapid submissions
   - Verify loading states prevent double-submission
   - Check response times (should be 2-5 seconds)
   - Validation: No race conditions or hanging states

9. ✅ **Mobile responsiveness check**
   - Test on 375px viewport
   - Verify amber cards are readable and well-spaced
   - Check history panel usability on mobile
   - Test textarea sizing on mobile keyboards
   - Validation: Fully functional on mobile

10. ✅ **Final polish and integration**
    - Ensure amber color theme is consistent
    - Verify icon usage (Sparkles for generate)
    - Test link from homepage feature card
    - Run `npm run build` and fix any issues
    - Run linter and typecheck
    - Validation: Production-ready, no console errors

**Stage 3 Summary:**

- **Security Implementation:** Added Zod validation on API route; escaped user content before render
- **Zero Trust Applied:** All inputs validated, outputs sanitized, safe rendering implemented

```

---

---

## ✅ Implementation Completion Summary

**Date**: January 2025
**Status**: Complete - Production Ready

### Completed Tasks:

✅ **Core Functionality**
- AI-powered assumption challenging with OpenAI integration
- Critical question generation (4-5 questions per submission)
- Amber-themed UI with numbered question cards
- Copy to clipboard functionality with confirmation
- LocalStorage history with 10-item limit and cleanup

✅ **User Experience**
- Responsive design for desktop and mobile
- Loading states and error handling
- Keyboard navigation and accessibility
- Form validation and submission prevention
- History panel with delete functionality

✅ **Technical Implementation**
- Zod validation on API routes for security
- Content sanitization and safe rendering
- Cross-browser clipboard API support
- Performance optimization and race condition prevention
- Production build compatibility

### Technical Improvements:
- **Security**: Zero-trust input validation and output sanitization
- **UX**: Smooth loading states and error recovery
- **Performance**: Optimized API calls and state management
- **Accessibility**: Full keyboard navigation and screen reader support
- **Mobile**: Responsive design with touch-friendly interactions

### Deployment Status:
- ✅ Production build successful
- ✅ All features functional and tested
- ✅ Ready for Vercel deployment

**Status:** Complete - Production Ready
**Last Updated:** January 2025

```
