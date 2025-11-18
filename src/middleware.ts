import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Define protected routes explicitly
const isProtectedRoute = createRouteMatcher(['/dashboard(.*)']);
const isOnboardingRoute = createRouteMatcher(['/onboarding']);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();

  // Extract onboarding status from session claims
  const onboardingComplete = (
    sessionClaims?.metadata as { onboardingComplete?: boolean }
  )?.onboardingComplete;

  // If user is not authenticated and trying to access a protected route
  if (!userId && isProtectedRoute(req)) {
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('redirect_url', req.url);
    return NextResponse.redirect(signInUrl);
  }

  // If user is authenticated but hasn't completed onboarding
  // and is trying to access a protected route (not onboarding page itself)
  if (
    userId &&
    !onboardingComplete &&
    isProtectedRoute(req) &&
    !isOnboardingRoute(req)
  ) {
    return NextResponse.redirect(new URL('/onboarding', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
