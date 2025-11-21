'use server';

import { auth, clerkClient } from '@clerk/nextjs/server';

export async function completeOnboarding() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { error: 'User not authenticated' };
    }

    const client = await clerkClient();
    await client.users.updateUser(userId, {
      publicMetadata: { onboardingComplete: true },
    });

    return { success: true };
  } catch (error) {
    console.error('Error completing onboarding:', error);
    return { error: 'Failed to complete onboarding. Please try again.' };
  }
}

