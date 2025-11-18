# Authentication Flow Journey Map

## Overview

This document maps the complete authentication journey for Signal Log, a multi-project dashboard with AI strategy partner for solo founders. It covers new user signup, returning user login, onboarding, and error handling scenarios.

**App Context:** Signal Log helps solo founders of pre-product-market fit startups visualize, analyze, and optimize their portfolio of initiatives through a strategic command center with AI-powered intelligence.

**Implementation Scope:** This journey map reflects the initial implementation using Clerk for authentication with email/password only. Social login and advanced features are planned for future releases.

---

## New User Path: First-Time Signup Journey

### Step 1: Landing Page (Unauthenticated)

**What the user sees:**
- Hero section: "AI Project Journal for Indie SaaS Founders"
- Problem/Solution sections explaining the value proposition
- "Get Started" or "Sign Up" CTA buttons
- "Open Dashboard" button (redirects to auth if not logged in)
- Navigation header with "Sign In" button

**What actions they can take:**
- Click "Get Started" / "Sign Up" → Navigate to signup
- Click "Sign In" → Navigate to login
- Click "Open Dashboard" → Redirect to auth (if not authenticated)
- Scroll through marketing content
- Click "Contact" or other navigation links

**What happens next:**
- User clicks primary CTA → Proceeds to Step 2 (Signup Page)

**Decision points:**
- New user → Signup path
- Returning user → Login path
- Just browsing → Stays on landing page

---

### Step 2: Signup Page

**What the user sees:**
- Dedicated signup page at `/sign-up`
- Title: "Create Your Account"
- Subtitle: "Start managing your project portfolio with AI strategy intelligence"
- Email input field
- Password input field (with strength indicator)
- Name field (handled by Clerk's SignUp component)
- "Show password" toggle
- "Create Account" button
- Link to switch to login: "Already have an account? Sign in"
- Terms of Service / Privacy Policy links (footer)

**What actions they can take:**
- Enter email/password → Form submission
- Toggle "Show password" → Reveal/hide password
- Click "Sign in" link → Switch to login mode

**What happens next:**
- Form validation → Account creation → Step 3 (Email Verification - handled by Clerk)

**Decision points:**
- Valid credentials → Proceeds to email verification
- Invalid credentials → Error message displayed

**Note:** Social login (Google, GitHub, etc.) is planned for future implementation. Initial release uses email/password only.

---

### Step 3: Account Creation (Email Signup)

**What the user sees:**
- Clerk handles email verification automatically
- User may see Clerk's default verification screen or be redirected
- Email verification link sent to user's email address

**What actions they can take:**
- Check email inbox for verification link
- Click verification link in email (handled by Clerk)
- Use Clerk's default "Resend email" option if needed

**What happens next:**
- User clicks email verification link → Clerk verifies → Step 4 (Account Creation Success)
- User doesn't verify → Clerk handles resend flow

**Decision points:**
- Verify email → Proceeds to onboarding
- Don't verify → Clerk manages verification state

**Note:** Email verification is handled by Clerk's default flow. No custom verification screen needed in initial implementation.

---

### Step 4: Account Creation Success

**What the user sees:**
- Success confirmation: "Account created successfully!"
- Welcome message: "Welcome to Signal Log, [Name]!"
- Brief loading state
- Automatic redirect to onboarding (or dashboard if onboarding skipped)

**What actions they can take:**
- Wait for automatic redirect
- Click "Continue" button (if manual)
- Click "Skip onboarding" (if option available)

**What happens next:**
- New user → Step 5 (First Login / Session Start)
- User with onboarding preference → Step 6 (Onboarding) or Step 7 (Main App)

**Decision points:**
- First-time user → Onboarding flow
- Returning user (from social login) → May skip onboarding

---

### Step 5: First Login / Session Start

**What the user sees:**
- Session initialization
- User profile loading
- Dashboard data fetching
- Brief loading spinner or skeleton screen

**What actions they can take:**
- Wait for session to initialize
- (No user actions required at this step)

**What happens next:**
- Session established → Step 6 (Onboarding) for new users
- Session established → Step 7 (Main App) if onboarding completed/skipped

**Decision points:**
- Has completed onboarding → Go to dashboard
- Has not completed onboarding → Show onboarding

---

### Step 6: Onboarding (3 Screens - Skippable)

#### Screen 1: Welcome & Value Proposition

**What the user sees:**
- Large heading: "Welcome to Your Strategic Command Center"
- Subheading: "See all your projects, experiments, and initiatives in one place"
- Visual: Dashboard preview or illustration
- Progress indicator: "1 of 3" (dots or step counter)
- "Next" button
- "Skip" button (top-right or bottom)

**What actions they can take:**
- Click "Next" → Proceed to Screen 2
- Click "Skip" → Skip to Step 7 (Main App)
- Swipe left (mobile) → Next screen

**What happens next:**
- Continue → Screen 2
- Skip → Main App

---

#### Screen 2: AI Strategy Partner Feature

**What the user sees:**
- Heading: "Your AI Strategy Partner"
- Subheading: "Get portfolio-level intelligence: identify conflicts, synergies, and priorities"
- Visual: AI analysis example or illustration
- Progress indicator: "2 of 3"
- "Next" button
- "Skip" button
- "Back" button

**What actions they can take:**
- Click "Next" → Proceed to Screen 3
- Click "Back" → Return to Screen 1
- Click "Skip" → Skip to Main App

**What happens next:**
- Continue → Screen 3
- Skip/Back → Respective screens

---

#### Screen 3: Quick Start / First Action

**What the user sees:**
- Heading: "Ready to Get Started?"
- Subheading: "Create your first project or explore the dashboard"
- Visual: "Create Project" button preview
- Progress indicator: "3 of 3"
- "Get Started" / "Create First Project" button
- "Skip" button
- "Back" button

**What actions they can take:**
- Click "Get Started" → Proceed to Step 7 (Main App)
- Click "Create First Project" → Go to project creation
- Click "Skip" → Go to Main App
- Click "Back" → Return to Screen 2

**What happens next:**
- Complete onboarding → Step 7 (Main App)
- Skip → Step 7 (Main App)

**Decision points:**
- Complete all screens → Full onboarding experience
- Skip at any point → Direct to main app (onboarding marked as skipped)

---

### Step 7: Main App Experience

**What the user sees:**
- Multi-project dashboard
- Empty state (if no projects): "Create your first project" CTA
- Or populated dashboard with project cards
- Navigation: Dashboard, Projects, Ideas, etc.
- User menu/profile icon
- AI features accessible

**What actions they can take:**
- Create first project
- Explore dashboard features
- Access AI tools (Health Scanner, Assumption Challenger, etc.)
- Navigate to different sections
- Access user settings/profile

**What happens next:**
- User starts using the app
- Can return anytime (becomes returning user)

**Decision points:**
- Create project → Project creation flow
- Explore features → Feature discovery
- Logout → Returns to landing page

---

## Returning User Path: Login Journey

### Step 1: Direct Visit or Login Page

**What the user sees:**
- **Scenario A:** User visits app URL directly
  - If session valid → Redirected to dashboard (Step 4)
  - If session expired → Redirected to login page
- **Scenario B:** User clicks "Sign In" from landing page
  - Login modal or dedicated login page

**What actions they can take:**
- Enter credentials
- Click social login
- Click "Forgot password" if needed
- Click "Sign up" if they don't have account

**What happens next:**
- Valid session → Step 4 (Main App)
- No session → Step 2 (Login)

---

### Step 2: Login

**What the user sees:**
- Dedicated login page at `/sign-in`
- Title: "Sign In"
- Email input field
- Password input field
- "Show password" toggle
- "Remember me" checkbox (optional)
- "Forgot password?" link (uses Clerk defaults)
- "Sign In" button
- Link to switch to signup: "Don't have an account? Sign up"

**What actions they can take:**
- Enter email/password → Form submission
- Click "Forgot password" → Password reset flow (Clerk defaults)
- Click "Sign up" → Switch to signup
- Toggle "Show password"
- Check "Remember me"

**What happens next:**
- **Email login:** Credentials validated → Step 3 (Session Established)
- **Invalid credentials:** Error message → Stay on login page

**Decision points:**
- Valid credentials → Proceeds to dashboard
- Invalid credentials → Error displayed, can retry
- Forgot password → Clerk's default password reset flow

**Note:** Social login (Google, GitHub, etc.) is planned for future implementation. Initial release uses email/password only.

---

### Step 3: Session Established / Skip Onboarding

**What the user sees:**
- Brief loading state
- Session initialization
- User data loading

**What actions they can take:**
- Wait for redirect
- (No user actions required)

**What happens next:**
- Onboarding completed previously → Step 4 (Main App)
- Onboarding not completed → Step 4 (Main App) - onboarding already seen, so skip

**Decision points:**
- Has seen onboarding → Skip to dashboard
- Hasn't seen onboarding → Show onboarding (rare for returning users)

---

### Step 4: Main App Experience

**What the user sees:**
- Dashboard with their projects
- Last state preserved
- All features accessible

**What actions they can take:**
- Continue working on projects
- Create new projects
- Use AI features
- Access settings

**What happens next:**
- User continues using the app
- Session remains active until logout or expiration

---

## Error States & Recovery

### Error 1: Invalid Credentials

**What the user sees:**
- Error message: "Invalid email or password. Please try again."
- Form fields remain filled (except password cleared for security)
- Red error indicator on form
- "Forgot password?" link highlighted

**What actions they can take:**
- Re-enter password
- Click "Forgot password" → Password reset flow
- Click "Show password" to verify they're typing correctly
- Try social login instead
- Switch to signup if they don't have account

**What happens next:**
- Correct credentials → Login succeeds
- Click "Forgot password" → Password reset email sent
- Multiple failed attempts → Rate limiting / account lockout (if implemented)

**Recovery path:**
1. User corrects credentials → Retry login
2. User clicks "Forgot password" → Reset flow
3. User tries social login → Alternative authentication

---

### Error 2: Email Already Exists (Signup)

**What the user sees:**
- Error message: "This email is already registered. Try signing in instead."
- Email field highlighted with error
- "Sign in" link/button prominently displayed
- Option to use "Forgot password" if they don't remember password

**What actions they can take:**
- Click "Sign in" → Switch to login form
- Click "Forgot password" → Password reset flow
- Try different email address
- Try social login with that email

**What happens next:**
- User switches to login → Login flow
- User resets password → Password reset flow
- User uses different email → Signup continues

**Recovery path:**
1. User realizes they have account → Switch to login
2. User forgot password → Reset password
3. User wants different account → Use different email

---

### Error 3: Network Errors

**What the user sees:**
- Error message: "We couldn't connect to our servers. Please check your internet connection and try again."
- Retry button
- Offline indicator (if applicable)
- Form data preserved (not lost)

**What actions they can take:**
- Click "Retry" button
- Check internet connection
- Refresh page
- Try again later

**What happens next:**
- Connection restored + Retry → Request succeeds
- Still offline → Error persists, can retry later

**Recovery path:**
1. User fixes connection → Click retry → Success
2. User waits → Retry later when connection restored
3. User refreshes → Page reload, can retry

---

### Error 4: Session Expired

**What the user sees:**
- Toast notification or modal: "Your session has expired. Please sign in again."
- Automatic redirect to login page
- Current page/state information preserved (if possible)
- "Sign In" button/link

**What actions they can take:**
- Click "Sign In" → Login flow
- Enter credentials
- Use social login for faster re-authentication

**What happens next:**
- User logs in → Redirected back to where they were (if possible)
- Or redirected to dashboard

**Recovery path:**
1. User logs in → Session restored → Continue where left off
2. User uses social login → Faster re-authentication

---

### Error 5: Email Verification Required

**What the user sees:**
- Message: "Please verify your email address to continue."
- "Resend verification email" button
- "Change email address" option
- Instructions on where to find the email

**What actions they can take:**
- Check email inbox (including spam)
- Click "Resend verification email"
- Click "Change email address"
- Contact support (if option available)

**What happens next:**
- User clicks verification link → Account activated → Proceed to app
- User resends email → New email sent
- User changes email → New verification email sent

**Recovery path:**
1. User finds email → Clicks link → Account verified
2. User resends → New email sent → User verifies
3. User changes email → New verification → User verifies

---

### Error 6: Password Requirements Not Met

**What the user sees:**
- Inline error message: "Password must be at least 8 characters with one number"
- Real-time validation feedback
- Password strength indicator
- Specific requirements listed

**What actions they can take:**
- Adjust password to meet requirements
- See real-time feedback as they type
- Use password generator (if available)

**What happens next:**
- Password meets requirements → Error clears → Can submit
- Password still invalid → Error persists → Cannot submit

**Recovery path:**
1. User fixes password → Real-time validation → Error clears → Submit succeeds

---

## Decision Points Summary

### New User Journey Decisions

1. **Landing Page → Signup or Login?**
   - New user → Signup
   - Returning user → Login

2. **Signup Method?**
   - Email signup → Requires verification (handled by Clerk)
   - Note: Social login planned for future release

3. **Onboarding?**
   - Complete all screens → Full onboarding
   - Skip → Direct to app

4. **First Action?**
   - Create project → Project creation
   - Explore dashboard → Feature discovery

### Returning User Journey Decisions

1. **Session Status?**
   - Valid session → Direct to app
   - Expired session → Login required

2. **Login Method?**
   - Email/password → Standard authentication
   - Note: Social login planned for future release

3. **Onboarding Status?**
   - Completed → Skip onboarding
   - Not completed → Show onboarding (rare)

### Error Recovery Decisions

1. **Invalid Credentials?**
   - Retry → Correct credentials
   - Forgot password → Reset flow (Clerk defaults)

2. **Email Exists?**
   - Sign in → Login flow
   - Forgot password → Reset flow (Clerk defaults)
   - Different email → New signup

3. **Network Error?**
   - Retry → When connection restored
   - Wait → Retry later

---

## Technical Implementation Notes

### Authentication Provider
- Using Clerk for authentication (email/password in initial release)
- Clerk + Supabase integration for database access
- Social login planned for future implementation

### Session Management
- JWT tokens stored securely
- Session expiration handling
- Remember me functionality (optional)

### Onboarding State
- Track onboarding completion in user profile
- Allow skip at any point
- Remember skip preference

### Error Handling
- Inline validation for real-time feedback
- Clear, actionable error messages
- Recovery paths for all error states
- Network error retry mechanisms

### Mobile Considerations
- Touch-friendly buttons (44px minimum)
- Single-column layout
- Native keyboard types
- Responsive modals/forms

---

## Success Metrics

### Conversion Funnel
1. Landing page → Signup page: Target 30%+
2. Signup page → Account created: Target 60%+
3. Account created → Email verified: Target 80%+
4. Email verified → Onboarding started: Target 90%+
5. Onboarding started → Completed: Target 70%+
6. Onboarding completed → First project created: Target 50%+

### User Experience Metrics
- Time to first project creation: < 5 minutes
- Onboarding completion rate: > 70%
- Error recovery success rate: > 80%
- Social login adoption: > 40%

---

## Next Steps

1. **Design Phase:**
   - Create wireframes for each step
   - Design error states
   - Create onboarding screen mockups

2. **Implementation Phase:**
   - Build signup/login components
   - Implement onboarding flow
   - Add error handling
   - Integrate social login

3. **Testing Phase:**
   - Test all user paths
   - Test error scenarios
   - Test mobile responsiveness
   - User acceptance testing

4. **Optimization Phase:**
   - A/B test onboarding flow
   - Optimize conversion funnel
   - Improve error messages
   - Enhance recovery paths

---

## References

- App Concept: `src/docs/concept.md`
- Current Auth Components: `src/components/auth/`
- Supabase Auth Documentation
- 2025 Authentication UX Best Practices (from research)

