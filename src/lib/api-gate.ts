/**
 * API Route Gating Utilities
 * 
 * Provides utilities for gating API routes based on subscription status.
 */

import { NextResponse } from 'next/server';
import { checkPlanAccess, checkFeatureAccess } from './subscription-check';

/**
 * Gate an API route handler with plan access check
 * 
 * @param handler - The API route handler function
 * @param planName - Required plan name
 * @returns Wrapped handler that checks plan access before executing
 */
export function withPlanGate<T extends (...args: any[]) => Promise<NextResponse>>(
  handler: T,
  planName: 'starter' | 'professional' | 'strategic'
): T {
  return (async (...args: Parameters<T>) => {
    const check = await checkPlanAccess(planName);
    
    if (!check.hasAccess) {
      return NextResponse.json(
        {
          error: 'Subscription required',
          message: check.error || `This endpoint requires a ${planName} plan`,
          upgradeUrl: '/pricing',
        },
        { status: 403 }
      );
    }
    
    return handler(...args);
  }) as T;
}

/**
 * Gate an API route handler with feature access check
 * 
 * @param handler - The API route handler function
 * @param featureKey - Required feature key
 * @returns Wrapped handler that checks feature access before executing
 */
export function withFeatureGate<T extends (...args: any[]) => Promise<NextResponse>>(
  handler: T,
  featureKey: string
): T {
  return (async (...args: Parameters<T>) => {
    const check = await checkFeatureAccess(featureKey);
    
    if (!check.hasAccess) {
      return NextResponse.json(
        {
          error: 'Feature not available',
          message: check.error || 'This feature requires a subscription',
          upgradeUrl: '/pricing',
        },
        { status: 403 }
      );
    }
    
    return handler(...args);
  }) as T;
}

