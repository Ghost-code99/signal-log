# Authentication & Onboarding PRD

## Status

Ready for Implementation

## Objective

Implement secure, user-friendly authentication with Clerk and Supabase, focusing on email/password login with a 3-screen onboarding experience for new users.

## Scope

**In Scope:**

- User signup with Clerk (email/password only)

- User login with Clerk (email/password only)

- Clerk + Supabase integration (native integration enabled in Clerk dashboard)

- Protected routes and middleware

- 3-screen skippable onboarding using Clerk's native onboarding feature

- Custom redirects after auth actions

- Row-level security (RLS) policies for user data isolation

- Responsive auth UI matching our design system

**Out of Scope (Future Considerations):**

- Social login (Google, GitHub, etc.)

- Password reset flow (uses Clerk defaults initially)

- Email verification (uses Clerk defaults)

- Multi-factor authentication (MFA)

- User profile editing pages

- Advanced onboarding with custom fields

- Webhooks for data synchronization

## User Stories

1. As a new user, I want to sign up with email/password so I can start using the app

2. As a returning user, I want to log in quickly and go straight to my content

3. As a new user, I want to see a brief onboarding that explains the app's value

4. As any user, I want my data to be secure and isolated from other users

5. As a mobile user, I want auth flows to work smoothly on my device

## Acceptance Criteria

- [ ] Clerk project created with Supabase integration enabled in dashboard

- [ ] Signup page created at /sign-up with Clerk <SignUp /> component

- [ ] Login page created at /sign-in with Clerk <SignIn /> component

- [ ] Email/password authentication configured (no social providers)

- [ ] Middleware protects authenticated routes

- [ ] First-time users see 3-screen onboarding after signup

- [ ] Returning users skip onboarding automatically

- [ ] Onboarding is skippable at any point

- [ ] Users redirect to correct pages after auth actions

- [ ] RLS policies prevent users from seeing each other's data

- [ ] Auth flows work on mobile and desktop

- [ ] Loading states show during auth operations

- [ ] Error messages are clear and actionable

- [ ] Auth pages match our design system

## Implementation Plan

### Stage 1: Clerk + Supabase Setup

**User actions (manual steps):**

- [ ] Go to [Clerk Dashboard](https://dashboard.clerk.com/) → Navigate to Integrations → Select Supabase

- [ ] Follow Clerk's setup wizard to connect your Supabase project (Clerk will guide you through the process)

- [ ] Keep the Clerk dashboard tab open - you'll need API keys from here

**Configure Session Token (Critical for Onboarding):**

Before building anything, the user MUST configure the session token in Clerk Dashboard to include publicMetadata:

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)

2. Navigate to: **Sessions** → **Customize session token**

3. Add this custom claim in the JSON editor (copy exactly as shown):

```json
{
  "role": "authenticated",
  "metadata": "{{user.public_metadata}}"
}
```

4. Click **Save**

**Why this matters:** Your middleware checks the JWT session token. Without this configuration, publicMetadata won't be in the JWT, and the onboarding status check will fail, causing infinite redirect loops. This MUST be done during setup, not later.

**AI agent actions (automated):**

- [ ] Install @clerk/nextjs package

- [ ] Install @supabase/supabase-js package

- [ ] Wrap the app with ClerkProvider in the root layout

**Environment variables setup:**

After completing the steps above, you'll need to add environment variables. Copy these keys from the dashboards to the env.local file:

**Required Environment Variables:**

From Clerk Dashboard (Settings → API Keys):
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Copy from "Publishable key"
- `CLERK_SECRET_KEY` - Copy from "Secret key"

From Supabase Dashboard (Project Settings → API):
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key

Clerk Redirect URLs (use the new fallback naming):
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up`
- `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard`
- `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/onboarding`

**Note:** Use the `_FALLBACK_REDIRECT_URL` naming convention (not the deprecated `_AFTER_` naming).

**Example .env.local format:**
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/onboarding
```

- [ ] Test that Clerk is connected (visit the app and see auth state)

### Stage 2: Auth Pages and User Button

**Create Authentication Pages:**

- [ ] Create app/(auth)/sign-up/[[...sign-up]]/page.tsx

- [ ] Add Clerk <SignUp /> component with routing="path" and path="/sign-up"

- [ ] Style signup page to match design system (Clerk appearance prop or CSS)

- [ ] Create app/(auth)/sign-in/[[...sign-in]]/page.tsx

- [ ] Add Clerk <SignIn /> component with routing="path" and path="/sign-in"

- [ ] Style login page to match design system

- [ ] Configure custom redirects in both components

- [ ] Test signup flow: create account → redirects to onboarding

- [ ] Test login flow: sign in → redirects to dashboard

**Add User Button to Header:**

Reference: [Clerk UserButton Documentation](https://clerk.com/docs/nextjs/reference/components/user/user-button)

The <UserButton /> component displays the user's avatar in the top-right corner of the header. When clicked, it opens a dropdown menu with options to manage account settings and sign out.

- [ ] Locate or create your app's header/navbar component (typically in app/components/header.tsx or in the root layout)

- [ ] Import UserButton, SignedIn, and SignedOut from @clerk/nextjs

- [ ] Add UserButton inside <SignedIn> component in the top-right of header

- [ ] Style the header to position UserButton in top-right corner

- [ ] Test: Sign in and verify UserButton appears in top-right

- [ ] Test: Click UserButton → dropdown opens with "Manage account" and "Sign out" options

- [ ] Test: Click "Manage account" → opens user profile modal

- [ ] Test: Click "Sign out" → signs user out and redirects appropriately

**Example implementation:**

```tsx
import { UserButton, SignedIn, SignedOut, SignInButton } from '@clerk/nextjs'

function Header() {
  return (
    <header style={{ display: 'flex', justifyContent: 'space-between', padding: 20 }}>
      <h1>My App</h1>
      <SignedIn>
        <UserButton />
      </SignedIn>
      <SignedOut>
        <SignInButton />
      </SignedOut>
    </header>
  )
}
```

### Stage 3: Protected Routes and Middleware

**What are protected routes?**

Protected routes are pages in your app that require users to be signed in. For example, if you have a dashboard or main app area at /dashboard, only logged-in users should access it. Unauthenticated users get redirected to /sign-in.

**Confirmed:** Main app route is at `/dashboard` (verified from existing codebase)

**AI agent actions:**

- [ ] **Create `src/middleware.ts`** (NOT in project root - must be in src/ directory for proper detection)

- [ ] Import `clerkMiddleware`, `createRouteMatcher` from `@clerk/nextjs/server`

- [ ] Import `NextResponse` from `next/server`

- [ ] **Define protected routes explicitly** using createRouteMatcher:

```typescript
const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);
```

Using "/dashboard(.*)" as the protected route pattern (confirmed from codebase)

- [ ] Implement middleware with **explicit userId check and manual redirect**:

```typescript
export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  
  if (!userId && isProtectedRoute(req)) {
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("redirect_url", req.url);
    return NextResponse.redirect(signInUrl);
  }
  
  return NextResponse.next();
});
```

- [ ] Add middleware config with proper matcher pattern:

```typescript
export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
```

- [ ] **After creating middleware, delete `.next` cache:** Run `rm -rf .next`

- [ ] **Restart dev server completely** (stop and restart, not hot reload)

- [ ] Test: Visit protected route while signed out → should redirect to `/sign-in?redirect_url=...`

- [ ] Test: Sign in, then visit protected route → should load successfully

- [ ] Verify redirect-back works: after login, user returns to original destination

- [ ] Test edge cases (session expires, refresh page)

**Critical Notes:**

- ⚠️ **Middleware MUST be in `src/middleware.ts`**, not in project root

- ⚠️ Use **explicit `userId` check** with manual `NextResponse.redirect()` instead of `auth.protect()`

- ⚠️ Define **protected routes explicitly** with `createRouteMatcher`, not public routes

- ⚠️ Always **clear `.next` cache and restart dev server** after creating/modifying middleware

- ✅ This pattern is more reliable than using `auth.protect()` alone

### Stage 4: 3-Screen Onboarding

**Reference:** [Clerk Custom Onboarding Guide](https://clerk.com/docs/guides/development/add-onboarding-flow)

**Critical Understanding: How Clerk Metadata Works**

Clerk provides three types of metadata for storing custom user data:

- `unsafeMetadata` - Stored on user object, **NOT included in JWT** (don't use for auth checks)

- `publicMetadata` - Stored on user object, **CAN be included in JWT** (use this for onboarding)

- `privateMetadata` - Server-only access, never sent to client

**Why this matters:** Your middleware checks the JWT session token, not the user object. If you store `onboardingComplete` in `unsafeMetadata`, the middleware will never see it because that data isn't in the JWT!

**The Correct Pattern:**

1. Store `onboardingComplete` in `publicMetadata`

2. Session token was already configured in Stage 1 to include `publicMetadata` as a custom claim

3. Force a JWT refresh after updating metadata

4. Redirect with the fresh JWT so middleware sees the update

**AI agent actions:**

**1. Create Onboarding Page Structure:**

- [ ] Create `src/app/(auth)/onboarding/layout.tsx` (server component)

- [ ] Use `auth()` from `@clerk/nextjs/server` to get `userId` and `sessionClaims`

- [ ] Check if user is authenticated - if not, redirect to `/sign-in`

- [ ] Check `sessionClaims?.metadata?.onboardingComplete` - if `true`, redirect to `/dashboard`

- [ ] This prevents returning users from seeing onboarding again

- [ ] Create `src/app/(auth)/onboarding/page.tsx` as a client component (`"use client"`)

- [ ] Import `useAuth` from `@clerk/nextjs` to get `getToken()` function

- [ ] Build state management for 3 screens (useState for currentStep)

**2. Build 3-Screen Component:**

**Screen 1: Welcome**

- [ ] Headline: "Welcome to Signal Log"

- [ ] Subheading: "Your strategic command center for managing multiple project initiatives"

- [ ] Visual: Icon or illustration (project portfolio visualization)

- [ ] Progress indicator: "1 of 3"

- [ ] Buttons: "Next" (primary), "Skip" (secondary/link)

**Screen 2: Key Feature - AI Strategy Partner**

- [ ] Headline: "Your AI Strategy Partner"

- [ ] Supporting text: "Get portfolio-level intelligence: identify conflicts, synergies, and priorities across all your projects"

- [ ] Tip box: "The AI analyzes your entire portfolio, not just individual projects"

- [ ] Visual: Icon or illustration (AI analysis example)

- [ ] Progress indicator: "2 of 3"

- [ ] Buttons: "Next" (primary), "Skip" (secondary/link), "Back" (ghost/link)

**Screen 3: Get Started**

- [ ] Headline: "Ready to Get Started?"

- [ ] Quick tip: "Create your first project to see the dashboard in action"

- [ ] Visual: Icon or illustration (dashboard preview)

- [ ] Progress indicator: "3 of 3"

- [ ] Buttons: "Get Started" (primary), "Skip" (secondary/link), "Back" (ghost/link)

**3. Create Server Action for Metadata Update:**

**IMPORTANT:** Don't update metadata from the client. Use a server action.

- [ ] Create src/app/(auth)/onboarding/actions.ts as a server action file

- [ ] Mark with "use server" directive at top

- [ ] Import auth and clerkClient from @clerk/nextjs/server

- [ ] Create completeOnboarding() function that:

  - Gets userId from auth()

  - Uses clerkClient().users.updateUser(userId, {
      publicMetadata: { onboardingComplete: true }
    })

  - Returns { success: true } on success

  - Returns { error: "message" } on failure

  - DO NOT call redirect() here - let the client handle it

**Why server action?** More secure (API keys stay server-side), proper error handling, can be called from client components.

**4. Implement Client-Side Completion Logic:**

**The Critical JWT Refresh Pattern:**

When you update a user's publicMetadata in Clerk, the existing JWT session token does **NOT** automatically refresh. You must force a refresh before redirecting, otherwise infinite redirect loop occurs.

In your client component (page.tsx):

```typescript
const { getToken } = useAuth();

const handleComplete = async () => {
  setIsCompleting(true);
  try {
    // Step 1: Update metadata via server action
    const result = await completeOnboarding();
    
    if (result?.error) {
      toast.error(result.error);
      setIsCompleting(false);
      return;
    }
    
    // Step 2: Force JWT refresh (CRITICAL!)
    // skipCache: true forces Clerk to fetch a fresh token from server
    await getToken({ skipCache: true });
    
    // Step 3: Hard redirect to ensure middleware sees fresh JWT
    // Use window.location.href, NOT Next.js router.push()
    window.location.href = "/dashboard";
    
  } catch (error) {
    console.error("Error completing onboarding:", error);
    toast.error("Something went wrong");
    setIsCompleting(false);
  }
};
```

- [ ] Implement handleComplete() with the pattern above

- [ ] Wire up "Get Started" button to call handleComplete()

- [ ] Wire up "Skip" button to call handleComplete() (same function)

- [ ] Add loading state during completion (button shows "Loading...")

**5. Implement Navigation Between Screens:**

- [ ] Add state: const [currentStep, setCurrentStep] = useState(1)

- [ ] "Next" button: setCurrentStep(currentStep + 1) if not on screen 3

- [ ] "Back" button: setCurrentStep(currentStep - 1) if not on screen 1

- [ ] On screen 3, "Next" becomes "Get Started" and calls handleComplete()

- [ ] Add smooth animations between screens using Framer Motion

**6. Update Middleware to Check Onboarding Status:**

- [ ] In src/middleware.ts, add route matcher for onboarding:

```typescript
const isOnboardingRoute = createRouteMatcher(["/onboarding"]);
```

- [ ] Extract onboarding status from session claims:

```typescript
const onboardingComplete = (
  sessionClaims?.metadata as { onboardingComplete?: boolean }
)?.onboardingComplete;
```

- [ ] Add logic: If user is authenticated but hasn't completed onboarding AND is trying to access protected route, redirect to /onboarding

- [ ] Exception: Don't redirect if user is already on /onboarding page

- [ ] Allow authenticated users to access onboarding page

**Key insight:** The middleware reads from sessionClaims.metadata (the custom claim we configured in Stage 1), NOT from sessionClaims.publicMetadata. The custom claim maps user.public_metadata to metadata in the JWT.

**7. Style Onboarding to Match Design System:**

- [ ] Use your design system's colors, fonts, and spacing

- [ ] Ensure mobile responsiveness (test on small screens)

- [ ] Add smooth transitions between screens (Framer Motion)

- [ ] Match button styles to your existing components

- [ ] Ensure proper contrast for accessibility

- [ ] Add proper loading states

**8. Test Complete Flow:**

**Test new user:**

- [ ] Sign up with new account

- [ ] Should automatically redirect to /onboarding (via env var)

- [ ] See screen 1 → Click "Next"

- [ ] See screen 2 → Click "Next"

- [ ] See screen 3 → Click "Get Started"

- [ ] Should see brief loading state

- [ ] Should successfully land on /dashboard page

- [ ] Verify no console errors

**Test skip functionality:**

- [ ] Sign up with another new account

- [ ] On screen 1, click "Skip"

- [ ] Should immediately redirect to /dashboard

- [ ] Sign out and sign back in

- [ ] Should go straight to /dashboard (not onboarding)

**Test returning user:**

- [ ] Sign in with account that completed onboarding

- [ ] Should skip /onboarding entirely

- [ ] Should land directly on /dashboard

**Test back navigation:**

- [ ] Sign up with new account

- [ ] Go to screen 2 → Click "Back" → Should see screen 1

- [ ] Go forward to screen 3 → Click "Back" → Should see screen 2

**Test edge cases:**

- [ ] What if user manually types /onboarding URL after completion? (should redirect to /dashboard)

- [ ] What if unauthenticated user tries /onboarding? (should redirect to /sign-in)

- [ ] What if API call fails? (should show error, keep user on page)

**Test metadata update failure:**
- [ ] What if metadata update fails during onboarding completion? (should show error, allow retry)
- [ ] Verify retry mechanism works correctly
- [ ] Ensure user can complete onboarding after retry

**Common Pitfalls to Avoid:**

❌ **Don't** store onboardingComplete in unsafeMetadata - it won't be in the JWT

❌ **Don't** forget to configure the session token custom claim - already done in Stage 1

❌ **Don't** use router.push() or redirect() after updating metadata - causes infinite loops

❌ **Don't** skip calling getToken({ skipCache: true }) - the old JWT will still be used

❌ **Don't** use client-side user.update() - use server actions with clerkClient instead

### Stage 5: Database Setup and RLS (No Webhooks Required)

**How this works with native integration:**

When Clerk's Supabase integration is enabled, your Clerk session tokens automatically include the necessary claims. Supabase can read the user's Clerk ID from the token using `auth.jwt()->>'sub'`. This means you don't need webhooks to sync user data—the authentication works directly through tokens.

**Reference:** [Clerk + Supabase Integration Guide](https://clerk.com/docs/guides/development/integrations/databases/supabase)

**AI agent actions:**

**Step 1: Create a table with user_id that auto-fills from Clerk**

Example SQL for a projects table (matching your existing schema):

```sql
create table projects (
  id uuid primary key default gen_random_uuid(),
  user_id text not null default auth.jwt()->>'sub',
  title text not null,
  description text,
  status text default 'idea',
  priority text default 'medium',
  last_activity timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

The user_id column automatically gets the Clerk user ID from the session token when new records are created.

**Step 2: Enable Row Level Security (RLS)**

```sql
alter table "projects" enable row level security;
```

**Step 3: Create RLS policies to restrict access**

Policy to allow users to view only their own records:

```sql
create policy "Users can view their own projects"
on "public"."projects"
for select
to authenticated
using ((select auth.jwt()->>'sub') = (user_id)::text);
```

Policy to allow users to insert only their own records:

```sql
create policy "Users must insert their own projects"
on "public"."projects"
for insert
to authenticated
with check ((select auth.jwt()->>'sub') = (user_id)::text);
```

Add UPDATE and DELETE policies as needed following the same pattern.

**Step 4: Create Supabase client helper that uses Clerk session**

Use the pattern from the official guide to create a Supabase client that passes Clerk's session token:

```typescript
import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';

export async function createSupabaseClient() {
  const { getToken } = await auth();
  
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        fetch: async (url, options = {}) => {
          const clerkToken = await getToken({ template: 'supabase' });
          const headers = new Headers(options.headers);
          headers.set('Authorization', `Bearer ${clerkToken}`);
          return fetch(url, { ...options, headers });
        },
      },
    }
  );
}
```

**Note:** With the native integration (as of 2025), you may use a simpler pattern:

```typescript
import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';

export async function createSupabaseClient() {
  const { getToken } = await auth();
  
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      async accessToken() {
        return await getToken();
      },
    }
  );
}
```

**Testing checklist:**

- [ ] Create table with user_id defaulting to auth.jwt()->>'sub'

- [ ] Enable RLS on the table

- [ ] Create SELECT and INSERT policies

- [ ] Implement Supabase client helper with Clerk token

- [ ] Test: Sign in as User A, create a record → should succeed

- [ ] Test: User A can read their own records

- [ ] Test: Sign in as User B → should NOT see User A's records

- [ ] Test: Unauthenticated request → should be denied

**Important:** You don't need webhooks for this basic auth + data isolation setup. Webhooks are only needed if you want to sync additional Clerk user profile data (like name, email, avatar) to your Supabase database.

### Stage 6: Testing and Polish

**Test complete new user journey:**

- [ ] Visit landing → click sign up → enter email/password → account created

- [ ] See onboarding screen 1 → next → screen 2 → next → screen 3 → get started

- [ ] Land in main app with auth state

**Test returning user journey:**

- [ ] Visit site → click login → enter credentials

- [ ] Skip onboarding → land in dashboard/app

**Test error states:**

- [ ] Invalid email format

- [ ] Weak password

- [ ] Email already exists

- [ ] Wrong password on login

- [ ] Network errors

**Verify responsive behavior:**

- [ ] Test auth forms on mobile

- [ ] Test onboarding screens on mobile

- [ ] Check loading states during signup, login, onboarding transitions

**Verify redirects and session:**

- [ ] Verify all custom redirects work as designed

- [ ] Test session persistence (refresh page, close/reopen browser)

- [ ] Use Chrome DevTools MCP to automate visual regression testing if available

### Stage 7: Documentation and Commit

**Update documentation:**

- [ ] Update this PRD with ✅ for all completed stages

- [ ] Document any deviations from original plan in a "Changes" section

- [ ] Document environment variables in README or .env.example

**Create git commit:**

- [ ] Use Conventional Commit format:

  - Type: feat

  - Scope: auth

  - Message: "implement clerk authentication with supabase integration"

  - Body: Brief summary of what was built

**Update project tracker:**

- [ ] Update Linear sprint board or project tracker

## Technical References

- **Clerk + Supabase Integration:** [https://clerk.com/docs/guides/development/integrations/databases/supabase](https://clerk.com/docs/guides/development/integrations/databases/supabase)

- **Clerk Next.js Setup:** [https://clerk.com/docs/quickstarts/nextjs](https://clerk.com/docs/quickstarts/nextjs)

- **Clerk Custom Onboarding:** [https://clerk.com/docs/guides/development/add-onboarding-flow](https://clerk.com/docs/guides/development/add-onboarding-flow)

- **Clerk Redirects:** [https://clerk.com/docs/guides/custom-redirects](https://clerk.com/docs/guides/custom-redirects)

- **Clerk Appearance Customization:** [https://clerk.com/docs/customization/overview](https://clerk.com/docs/customization/overview)

- **Supabase Row Level Security:** [https://supabase.com/docs/guides/auth/row-level-security](https://supabase.com/docs/guides/auth/row-level-security)

- **Next.js Middleware:** [https://nextjs.org/docs/app/building-your-application/routing/middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)

## Key Technical Notes

**Middleware:**

- Middleware MUST be placed in `src/middleware.ts`, not project root

- Use explicit protected routes pattern with `createRouteMatcher`, not public routes

- Use explicit `userId` check with manual redirect, not `auth.protect()` alone

- Always clear `.next` cache and restart dev server after creating/modifying middleware

**Clerk Session Tokens:**

- Clerk manages user sessions via JWT tokens

- JWT must be configured to include `publicMetadata` as custom claim (done in Stage 1)

- Session token custom claim: `{"metadata": "{{user.public_metadata}}"}`

- Middleware reads from `sessionClaims.metadata`, not `sessionClaims.publicMetadata`

**Onboarding Metadata:**

- Store `onboardingComplete` in `publicMetadata` (NOT `unsafeMetadata`)

- `unsafeMetadata` is not included in JWT and won't work with middleware

- After updating metadata, MUST call `getToken({ skipCache: true })` to refresh JWT

- Use hard redirect (`window.location.href`) after refresh, not `router.push()`

- Use server actions with `clerkClient` for metadata updates, not client-side `user.update()`

**Supabase Integration:**

- Supabase validates requests using JWT from Clerk (sub claim = user_id)

- RLS policies use `auth.jwt() ->> 'sub'` to identify the current user

- No webhooks needed for basic auth + data isolation

- Native integration (2025) uses `accessToken()` callback pattern

**Environment Variables:**

- Use `_FALLBACK_REDIRECT_URL` naming convention, not deprecated `_AFTER_` naming

**2025 Integration Updates:**

- As of April 1, 2025, Clerk Supabase JWT template is deprecated

- Native third-party auth integration is now the recommended approach

- No need to fetch new tokens for each Supabase request

- No need to share Supabase JWT secret key with Clerk

- Supabase accepts Clerk-signed session tokens directly

## Success Metrics

- Users can sign up in under 90 seconds

- Onboarding completion rate > 60% (vs skip rate)

- Zero data leakage between users (RLS working correctly)

- Auth flows work smoothly on mobile and desktop

- Error messages are clear and users can recover from failures

---

**Note to AI Agent**: This PRD will be executed in Lesson 4.4. Follow the stages sequentially, use @Web to verify current best practices, and mark tasks complete as you go. Research any unclear implementation details before proceeding.

