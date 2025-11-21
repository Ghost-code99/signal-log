'use client';

import { useUser } from '@clerk/nextjs';
import { UpgradePrompt } from './upgrade-prompt';
import { ReactNode } from 'react';

interface ProtectedFeatureProps {
  /**
   * Feature key to check (e.g., 'unlimited_projects', 'api_access')
   * or plan name (e.g., 'starter', 'professional', 'strategic')
   */
  feature: string;
  /**
   * Plan name if checking for plan access (optional)
   */
  plan?: 'starter' | 'professional' | 'strategic';
  /**
   * Children to render if user has access
   */
  children: ReactNode;
  /**
   * Custom message to show in upgrade prompt
   */
  upgradeMessage?: string;
  /**
   * Feature name for upgrade prompt
   */
  featureName?: string;
}

/**
 * ProtectedFeature Component
 * 
 * Wraps content that requires a subscription or specific feature.
 * Shows upgrade prompt if user doesn't have access.
 * 
 * @example
 * ```tsx
 * <ProtectedFeature feature="unlimited_projects" featureName="Unlimited Projects">
 *   <PremiumFeatureContent />
 * </ProtectedFeature>
 * ```
 * 
 * @example
 * ```tsx
 * <ProtectedFeature plan="professional" featureName="Professional Features">
 *   <ProfessionalFeatureContent />
 * </ProtectedFeature>
 * ```
 */
export function ProtectedFeature({
  feature,
  plan,
  children,
  upgradeMessage,
  featureName,
}: ProtectedFeatureProps) {
  const { user, isLoaded } = useUser();

  // Show loading state while checking
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // If user not authenticated, show upgrade prompt
  if (!user) {
    return (
      <UpgradePrompt
        featureName={featureName || feature}
        upgradeMessage={upgradeMessage}
      />
    );
  }

  // Check if user has the feature or plan
  let hasAccess = false;

  if (plan) {
    // Check for plan access using has() helper
    hasAccess = user.has({ plan });
  } else {
    // Check for feature access using hasFeature() method
    hasAccess = user.hasFeature(feature);
  }

  // If user doesn't have access, show upgrade prompt
  if (!hasAccess) {
    return (
      <UpgradePrompt
        featureName={featureName || feature}
        upgradeMessage={upgradeMessage}
        requiredPlan={plan}
      />
    );
  }

  // User has access, render children
  return <>{children}</>;
}

