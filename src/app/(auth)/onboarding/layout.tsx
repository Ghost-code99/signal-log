import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId, sessionClaims } = await auth();

  // If user is not authenticated, redirect to sign-in
  if (!userId) {
    redirect('/sign-in');
  }

  // If user has already completed onboarding, redirect to dashboard
  const onboardingComplete = (
    sessionClaims?.metadata as { onboardingComplete?: boolean }
  )?.onboardingComplete;

  if (onboardingComplete) {
    redirect('/dashboard');
  }

  return <>{children}</>;
}

