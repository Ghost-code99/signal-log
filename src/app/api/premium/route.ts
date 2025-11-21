/**
 * Premium API Route Example
 * 
 * This is an example of a gated API route that requires a subscription.
 * Use this pattern for any premium features.
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkPlanAccess } from '@/lib/subscription-check';

/**
 * Example premium endpoint that requires Professional plan
 */
export async function GET(request: NextRequest) {
  // Check if user has Professional plan access
  const accessCheck = await checkPlanAccess('professional');

  if (!accessCheck.hasAccess) {
    return NextResponse.json(
      {
        error: 'Subscription required',
        message: accessCheck.error || 'This endpoint requires a Professional plan',
        upgradeUrl: '/pricing',
      },
      { status: 403 }
    );
  }

  // User has access, return premium data
  return NextResponse.json({
    success: true,
    data: {
      message: 'Welcome to Premium Features!',
      features: [
        'Advanced analytics',
        'Priority support',
        'API access',
      ],
    },
  });
}

/**
 * Example premium POST endpoint
 */
export async function POST(request: NextRequest) {
  // Check if user has Professional plan access
  const accessCheck = await checkPlanAccess('professional');

  if (!accessCheck.hasAccess) {
    return NextResponse.json(
      {
        error: 'Subscription required',
        message: accessCheck.error || 'This endpoint requires a Professional plan',
        upgradeUrl: '/pricing',
      },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    
    // Process premium request
    return NextResponse.json({
      success: true,
      message: 'Premium action completed',
      data: body,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Invalid request',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 400 }
    );
  }
}

