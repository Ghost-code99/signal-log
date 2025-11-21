# Mobile Responsive Testing Checklist

**Date:** November 19, 2025  
**Purpose:** Systematic testing of all pages across iPhone (390px), iPad (820px), and MacBook (1440px)

---

## Testing Instructions

1. **Start your app:** `npm run dev`
2. **Open Responsive Viewer** in Chrome
3. **Enable devices:** iPhone, iPad, MacBook
4. **Test each page** listed below
5. **Check items** for each page
6. **Note issues** and fix them

---

## 1. Public-Facing Pages

### Homepage (Landing Page)
**URL:** `/`  
**Why Important:** Main entry point, first impression, marketing content

**Test Items:**
- [ ] Hero section displays correctly
- [ ] Problem section readable
- [ ] Solution section readable
- [ ] CTA buttons tappable (mobile)
- [ ] Feature cards layout correctly
- [ ] Navigation works (desktop and mobile menu)
- [ ] Footer displays correctly
- [ ] No horizontal scrolling
- [ ] Text is readable on all sizes
- [ ] Images scale properly

**Mobile-Specific:**
- [ ] Mobile menu opens/closes correctly
- [ ] Hamburger icon visible and tappable
- [ ] Smooth scroll to sections works

---

### Contact Page
**URL:** `/contact`  
**Why Important:** Has contact form, user interaction point

**Test Items:**
- [ ] Page layout adapts correctly
- [ ] Contact form is usable
- [ ] Form fields are readable
- [ ] Submit button is tappable
- [ ] Form validation works
- [ ] Error messages display correctly
- [ ] Success message displays correctly

**Mobile-Specific:**
- [ ] Form fields are full-width or appropriately sized
- [ ] Textarea is usable
- [ ] Buttons are tappable (min 44px)

---

## 2. Authentication Flow (Critical User Journey)

### Sign-Up Page
**URL:** `/sign-up`  
**Why Important:** First-time user entry point, has form

**Test Items:**
- [ ] Clerk sign-up form displays correctly
- [ ] Form is centered and readable
- [ ] Email input is usable
- [ ] Password input is usable
- [ ] Submit button is tappable
- [ ] Error messages display correctly
- [ ] Link to sign-in works
- [ ] Form validation works

**Mobile-Specific:**
- [ ] Form fits on screen
- [ ] No horizontal scrolling
- [ ] Keyboard doesn't cover inputs
- [ ] Buttons are tappable

---

### Sign-In Page
**URL:** `/sign-in`  
**Why Important:** Returning user entry point, has form

**Test Items:**
- [ ] Clerk sign-in form displays correctly
- [ ] Form is centered and readable
- [ ] Email input is usable
- [ ] Password input is usable
- [ ] Submit button is tappable
- [ ] Error messages display correctly
- [ ] Link to sign-up works
- [ ] "Forgot password" link works (if visible)

**Mobile-Specific:**
- [ ] Form fits on screen
- [ ] No horizontal scrolling
- [ ] Keyboard doesn't cover inputs
- [ ] Buttons are tappable

---

### Onboarding Flow
**URL:** `/onboarding`  
**Why Important:** New user experience, 3-screen flow, interactive

**Test Items:**
- [ ] Screen 1 (Welcome) displays correctly
- [ ] Screen 2 (Features) displays correctly
- [ ] Screen 3 (Get Started) displays correctly
- [ ] Progress indicators visible
- [ ] Navigation buttons work (Next, Back, Skip)
- [ ] Skip button works
- [ ] Animations work smoothly
- [ ] Success state displays correctly
- [ ] Auto-close works after completion

**Mobile-Specific:**
- [ ] All screens fit on mobile screen
- [ ] Text is readable
- [ ] Buttons are tappable
- [ ] Progress indicators visible
- [ ] Icons display correctly
- [ ] No content cut off

---

## 3. Protected Pages (Main App)

### Dashboard (Main)
**URL:** `/dashboard`  
**Why Important:** Core app experience, main user interface, has forms and filters

**Test Items:**
- [ ] Stats cards layout correctly
- [ ] Project cards grid adapts (1 col mobile, 2-3 cols desktop)
- [ ] Search input is usable
- [ ] Filter dropdowns work
- [ ] "Add Project" button is tappable
- [ ] Project form modal opens correctly
- [ ] Empty state displays correctly
- [ ] Loading states work
- [ ] Navigation works

**Mobile-Specific:**
- [ ] Stats cards stack vertically
- [ ] Project cards are full-width or 1 column
- [ ] Filters are usable (dropdowns work on mobile)
- [ ] Search bar is full-width
- [ ] Buttons are tappable
- [ ] Modals are full-screen or appropriately sized

---

### Project Detail Page
**URL:** `/dashboard/[id]` (e.g., `/dashboard/123`)  
**Why Important:** Detailed view, has tabs, forms, interactive elements

**Test Items:**
- [ ] Project header displays correctly
- [ ] Tabs (Overview, Ideas, Assumptions, Experiments) work
- [ ] Tab content displays correctly
- [ ] Edit button works
- [ ] Delete button works
- [ ] Edit modal opens correctly
- [ ] Delete confirmation dialog works
- [ ] Linked items display correctly
- [ ] Back button works

**Mobile-Specific:**
- [ ] Tabs are scrollable or wrap correctly
- [ ] Tab content is readable
- [ ] Forms in modals are usable
- [ ] Buttons are tappable
- [ ] Cards/content don't overflow

---

## 4. Feature Pages (AI Tools)

### Idea Capture
**URL:** `/idea-capture`  
**Why Important:** Has form, user input, AI interaction

**Test Items:**
- [ ] Form displays correctly
- [ ] Input fields are usable
- [ ] Submit button works
- [ ] AI response displays correctly
- [ ] Loading states work
- [ ] Error handling works

**Mobile-Specific:**
- [ ] Form is usable on mobile
- [ ] Textarea is readable
- [ ] Buttons are tappable
- [ ] AI response is readable

---

### Assumption Challenger
**URL:** `/assumption-challenger`  
**Why Important:** Has form, user input, AI interaction

**Test Items:**
- [ ] Form displays correctly
- [ ] Input fields are usable
- [ ] Submit button works
- [ ] AI response displays correctly
- [ ] Loading states work

**Mobile-Specific:**
- [ ] Form is usable on mobile
- [ ] Textarea is readable
- [ ] Buttons are tappable

---

### Experiment Canvas
**URL:** `/experiment-canvas`  
**Why Important:** Has form, user input, AI interaction

**Test Items:**
- [ ] Form displays correctly
- [ ] Input fields are usable
- [ ] Submit button works
- [ ] Canvas/results display correctly
- [ ] Loading states work

**Mobile-Specific:**
- [ ] Form is usable on mobile
- [ ] Canvas/results are readable
- [ ] Buttons are tappable

---

### Project Health Scanner
**URL:** `/project-health-scanner`  
**Why Important:** Has form, user input, AI interaction

**Test Items:**
- [ ] Form displays correctly
- [ ] Input fields are usable
- [ ] Submit button works
- [ ] Health scan results display correctly
- [ ] Loading states work

**Mobile-Specific:**
- [ ] Form is usable on mobile
- [ ] Results are readable
- [ ] Buttons are tappable

---

### Security Advisor
**URL:** `/security-advisor`  
**Why Important:** Has form, user input, AI interaction

**Test Items:**
- [ ] Form displays correctly
- [ ] Input fields are usable
- [ ] Submit button works
- [ ] Security recommendations display correctly
- [ ] Loading states work

**Mobile-Specific:**
- [ ] Form is usable on mobile
- [ ] Recommendations are readable
- [ ] Buttons are tappable

---

## 5. Utility Pages

### Design System
**URL:** `/design-system`  
**Why Important:** Reference page, shows all components

**Test Items:**
- [ ] All components display correctly
- [ ] Component examples are readable
- [ ] Layout adapts correctly

**Mobile-Specific:**
- [ ] Components are readable
- [ ] Examples don't overflow

---

## 6. Shared Components (Test on Multiple Pages)

### Header/Navigation
**Appears on:** All pages  
**Why Important:** Primary navigation, mobile menu, user actions

**Test Items:**
- [ ] Logo/brand displays correctly
- [ ] Desktop navigation works
- [ ] Mobile menu button visible (hamburger)
- [ ] Mobile menu opens/closes
- [ ] Mobile menu items are tappable
- [ ] UserButton displays correctly (when signed in)
- [ ] Sign-in link works (when signed out)
- [ ] Theme toggle works
- [ ] Sticky header works

**Mobile-Specific:**
- [ ] Mobile menu is full-width or appropriately sized
- [ ] Menu items are tappable (min 44px)
- [ ] Menu doesn't cover content
- [ ] Close button works

---

### Footer
**Appears on:** All pages  
**Why Important:** Contains feedback trigger, links, branding

**Test Items:**
- [ ] Footer displays correctly
- [ ] Links are tappable
- [ ] "Give Feedback" link works
- [ ] Feedback modal opens
- [ ] Theme toggle works
- [ ] Layout adapts (stacks on mobile)

**Mobile-Specific:**
- [ ] Footer stacks vertically on mobile
- [ ] Links are tappable
- [ ] Spacing is appropriate

---

### Feedback Modal
**Appears on:** All pages (via footer trigger)  
**Why Important:** User feedback collection, has form

**Test Items:**
- [ ] Modal opens correctly
- [ ] Modal is centered
- [ ] Form displays correctly
- [ ] Textarea is usable
- [ ] Submit button works
- [ ] Validation works
- [ ] Success message displays
- [ ] Auto-close works
- [ ] Close button works

**Mobile-Specific:**
- [ ] Modal fits on screen
- [ ] Modal is full-width or appropriately sized
- [ ] Textarea is usable
- [ ] Buttons are tappable
- [ ] Keyboard doesn't cover form
- [ ] Can scroll if needed

---

## 7. Forms & Modals (Test Across All Pages)

### Project Form Modal
**Appears on:** Dashboard pages  
**Why Important:** Complex form with multiple fields

**Test Items:**
- [ ] Modal opens correctly
- [ ] All form fields are usable
- [ ] Dropdowns work
- [ ] Tag input works
- [ ] Submit button works
- [ ] Validation works
- [ ] Error messages display

**Mobile-Specific:**
- [ ] Modal fits on screen
- [ ] Form fields are readable
- [ ] Dropdowns are usable
- [ ] Buttons are tappable

---

### Delete Confirmation Dialog
**Appears on:** Dashboard pages  
**Why Important:** Critical action, needs to be clear

**Test Items:**
- [ ] Dialog opens correctly
- [ ] Message is readable
- [ ] Buttons are tappable
- [ ] Cancel button works
- [ ] Confirm button works

**Mobile-Specific:**
- [ ] Dialog fits on screen
- [ ] Buttons are tappable
- [ ] Text is readable

---

## Testing Priority

### Critical (Must Test)
1. ✅ Homepage (`/`)
2. ✅ Sign-up (`/sign-up`)
3. ✅ Sign-in (`/sign-in`)
4. ✅ Onboarding (`/onboarding`)
5. ✅ Dashboard (`/dashboard`)
6. ✅ Header/Navigation
7. ✅ Footer with Feedback Modal

### Important (Should Test)
8. ✅ Project Detail (`/dashboard/[id]`)
9. ✅ Contact Page (`/contact`)
10. ✅ Feedback Modal (all pages)

### Nice to Have (Test if Time)
11. ✅ Idea Capture (`/idea-capture`)
12. ✅ Assumption Challenger (`/assumption-challenger`)
13. ✅ Experiment Canvas (`/experiment-canvas`)
14. ✅ Project Health Scanner (`/project-health-scanner`)
15. ✅ Security Advisor (`/security-advisor`)

---

## Quick Testing Checklist

### For Each Page, Check:

**Layout:**
- [ ] No horizontal scrolling
- [ ] Content doesn't overflow
- [ ] Layout adapts correctly

**Typography:**
- [ ] Text is readable (not too small)
- [ ] Line height is appropriate
- [ ] Headings are clear

**Interactive Elements:**
- [ ] Buttons are tappable (min 44px on mobile)
- [ ] Links are tappable
- [ ] Forms are usable
- [ ] Dropdowns work

**Navigation:**
- [ ] Mobile menu works
- [ ] Links work correctly
- [ ] Back buttons work

**Modals/Dialogs:**
- [ ] Open correctly
- [ ] Fit on screen
- [ ] Forms are usable
- [ ] Close buttons work

---

## Device-Specific Checks

### iPhone (390px) - Mobile
- [ ] Mobile menu works
- [ ] Forms are full-width or appropriately sized
- [ ] Buttons are tappable (44px min)
- [ ] Text is readable (16px min)
- [ ] No horizontal scrolling
- [ ] Touch targets are adequate

### iPad (820px) - Tablet
- [ ] Layout adapts from mobile
- [ ] More content visible
- [ ] Better use of space
- [ ] Still touch-friendly
- [ ] Navigation works

### MacBook (1440px) - Desktop
- [ ] Full layout visible
- [ ] Optimal spacing
- [ ] Hover states work
- [ ] Desktop navigation works
- [ ] No wasted space

---

## Common Issues to Watch For

### Text Issues
- ❌ Text too small on mobile
- ❌ Line height too tight
- ❌ Text overflow

**Fix:** Increase font sizes, adjust line-height, use text truncation

### Button Issues
- ❌ Buttons too small to tap
- ❌ Buttons too close together
- ❌ Buttons cut off

**Fix:** Min 44px height, adequate padding, proper spacing

### Form Issues
- ❌ Inputs too small
- ❌ Labels not visible
- ❌ Keyboard covers inputs

**Fix:** Increase input sizes, ensure labels visible, add scroll padding

### Layout Issues
- ❌ Horizontal scrolling
- ❌ Content overflow
- ❌ Cards don't wrap

**Fix:** Use `max-width: 100%`, flex-wrap, proper containers

### Modal Issues
- ❌ Modal too large for screen
- ❌ Form not usable
- ❌ Close button not accessible

**Fix:** Responsive modal sizing, scrollable content, accessible close

---

## Testing Workflow

### Step 1: Setup
1. Start app: `npm run dev`
2. Install Responsive Viewer
3. Configure devices (iPhone, iPad, MacBook)
4. Open app in Chrome

### Step 2: Test Critical Pages
1. Homepage
2. Sign-up
3. Sign-in
4. Onboarding
5. Dashboard

### Step 3: Test Components
1. Header/Navigation
2. Footer
3. Feedback Modal
4. Project Form Modal

### Step 4: Test Feature Pages
1. Idea Capture
2. Assumption Challenger
3. Experiment Canvas
4. Project Health Scanner
5. Security Advisor

### Step 5: Document Issues
- Note any problems found
- Prioritize fixes
- Fix issues
- Re-test

---

## Summary

**Total Pages to Test:** 15+ pages

**Critical Pages:** 7 (homepage, auth flow, dashboard, components)

**Testing Time Estimate:**
- Critical pages: 30-45 minutes
- All pages: 1-2 hours

**Outcome:** Your app will be fully responsive and provide a great experience on all devices! 🚀

---

**Ready to start testing!** Use Responsive Viewer with iPhone (390px), iPad (820px), and MacBook (1440px) to test each page systematically.

