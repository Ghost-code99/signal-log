/**
 * Subscription Check Utilities
 * 
 * Provides utilities for checking user subscription status and features
 * using Clerk's has() helper in Server Actions and API routes.
 */

import { auth, clerkClient } from '@clerk/nextjs/server';

/**
 * Check if user has a specific plan
 * 
 * @param planName - Plan name to check (starter, professional, strategic)
 * @returns Object with hasAccess flag and error message if not
 */
export async function checkPlanAccess(planName: 'starter' | 'professional' | 'strategic'): Promise<{
  hasAccess: boolean;
  error?: string;
  userId?: string;
}> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        hasAccess: false,
        error: 'User not authenticated',
      };
    }

    // Check if user has the plan using Clerk's has() helper
    // Clerk's has() checks subscription features/plans
    // Note: This uses Clerk's billing API to check plan access
    const client = await clerkClient();
    const hasPlan = await client.users.has({ userId, plan: planName });

    if (!hasPlan) {
      return {
        hasAccess: false,
        error: `This feature requires a ${planName} plan`,
        userId,
      };
    }

    return {
      hasAccess: true,
      userId,
    };
  } catch (error) {
    console.error('Error checking plan access:', error);
    return {
      hasAccess: false,
      error: 'Failed to check subscription status',
    };
  }
}

/**
 * Check if user has a specific feature
 * 
 * @param featureKey - Feature key to check (e.g., 'unlimited_projects', 'api_access')
 * @returns Object with hasAccess flag and error message if not
 */
export async function checkFeatureAccess(featureKey: string): Promise<{
  hasAccess: boolean;
  error?: string;
  userId?: string;
}> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        hasAccess: false,
        error: 'User not authenticated',
      };
    }

    // Check if user has the feature using Clerk's hasFeature() method
    const client = await clerkClient();
    const hasFeature = await client.users.hasFeature(userId, featureKey);

    if (!hasFeature) {
      return {
        hasAccess: false,
        error: `This feature requires a subscription`,
        userId,
      };
    }

    return {
      hasAccess: true,
      userId,
    };
  } catch (error) {
    console.error('Error checking feature access:', error);
    return {
      hasAccess: false,
      error: 'Failed to check feature access',
    };
  }
}

/**
 * Get user's current subscription plan
 * 
 * @returns Plan name or null if no subscription
 */
export async function getUserPlan(): Promise<'starter' | 'professional' | 'strategic' | null> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return null;
    }

    // Check each plan tier (from highest to lowest)
    const client = await clerkClient();
    if (await client.users.has({ userId, plan: 'strategic' })) {
      return 'strategic';
    }
    if (await client.users.has({ userId, plan: 'professional' })) {
      return 'professional';
    }
    if (await client.users.has({ userId, plan: 'starter' })) {
      return 'starter';
    }

    return null;
  } catch (error) {
    console.error('Error getting user plan:', error);
    return null;
  }
}

/**
 * Check if user has any active subscription
 * 
 * @returns True if user has any subscription plan
 */
export async function hasActiveSubscription(): Promise<boolean> {
  const plan = await getUserPlan();
  return plan !== null;
}

