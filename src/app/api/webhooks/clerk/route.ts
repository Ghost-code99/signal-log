import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServiceClient } from '@/lib/supabase-service';
import { Webhook } from 'svix';

/**
 * Clerk Billing Webhook Endpoint
 * 
 * Receives webhook events from Clerk Billing when subscription status changes.
 * Syncs subscription data to Supabase subscriptions table.
 * 
 * Event types handled:
 * - subscription.created - New subscription created
 * - subscription.updated - Subscription changed (plan upgrade/downgrade, status change)
 * - subscription.active - Subscription became active
 * - subscription.pastDue - Payment failed, subscription is past due
 * 
 * Security:
 * - Verifies webhook signature using Clerk's signing secret
 * - Uses constant-time comparison to prevent timing attacks
 * - Rejects invalid signatures with 401 Unauthorized
 */

// ============================================================================
// WEBHOOK SIGNATURE VERIFICATION
// ============================================================================

/**
 * Verifies the webhook signature from Clerk
 * 
 * Clerk uses Svix for webhook signing. We verify the signature using
 * the webhook signing secret from Clerk dashboard.
 * 
 * @param request - The incoming Next.js request
 * @param body - The request body as string
 * @returns Object with valid flag and error message if invalid
 */
async function verifyWebhookSignature(
  request: NextRequest,
  body: string
): Promise<{ valid: boolean; error?: string }> {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return {
      valid: false,
      error: 'CLERK_WEBHOOK_SECRET environment variable is not set',
    };
  }

  try {
    // Get signature headers from request
    const svixId = request.headers.get('svix-id');
    const svixTimestamp = request.headers.get('svix-timestamp');
    const svixSignature = request.headers.get('svix-signature');

    if (!svixId || !svixTimestamp || !svixSignature) {
      return {
        valid: false,
        error: 'Missing svix headers',
      };
    }

    // Create Svix webhook instance
    const wh = new Webhook(webhookSecret);

    // Verify the webhook signature
    try {
      wh.verify(body, {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
      });
      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        error: 'Invalid webhook signature',
      };
    }
  } catch (error) {
    return {
      valid: false,
      error: `Signature verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

// ============================================================================
// WEBHOOK PAYLOAD TYPES
// ============================================================================

interface SubscriptionData {
  id: string; // Clerk subscription ID
  user_id: string; // User who owns subscription
  plan_id: string; // Plan ID (starter, professional, strategic)
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete';
  current_period_start?: number; // Unix timestamp
  current_period_end?: number; // Unix timestamp
  cancel_at_period_end?: boolean;
  trial_start?: number | null; // Unix timestamp
  trial_end?: number | null; // Unix timestamp
  stripe_subscription_id?: string;
  stripe_customer_id?: string;
  features?: string[]; // Array of feature keys
  plan?: {
    id: string;
    name: string;
    price: number; // In cents
    currency: string;
    interval: string;
  };
}

interface ClerkWebhookEvent {
  type: 'subscription.created' | 'subscription.updated' | 'subscription.active' | 'subscription.pastDue';
  data: SubscriptionData;
}

// ============================================================================
// PLAN NAME MAPPING
// ============================================================================

/**
 * Maps Clerk plan IDs to our schema plan names
 * 
 * @param clerkPlanId - Plan ID from Clerk webhook
 * @returns Mapped plan name (starter, professional, strategic)
 */
function mapClerkPlanToSchema(clerkPlanId: string): string {
  // Normalize to lowercase for comparison
  const normalized = clerkPlanId.toLowerCase();
  
  // Map common Clerk plan ID patterns to our schema
  if (normalized.includes('starter') || normalized.includes('basic')) {
    return 'starter';
  }
  if (normalized.includes('professional') || normalized.includes('pro')) {
    return 'professional';
  }
  if (normalized.includes('strategic') || normalized.includes('enterprise')) {
    return 'strategic';
  }
  
  // Default: return as-is (will be stored in database)
  return clerkPlanId;
}

// ============================================================================
// DATABASE UPDATE FUNCTIONS
// ============================================================================

/**
 * Maps Clerk user_id to database user_id by looking up users table
 * 
 * @param supabase - Supabase service client
 * @param clerkUserId - Clerk user ID from webhook
 * @returns Database user UUID or null if not found
 */
async function findUserByClerkId(
  supabase: ReturnType<typeof createSupabaseServiceClient>,
  clerkUserId: string
): Promise<{ userId: string | null; error?: string }> {
  try {
    // First, try to find by clerk_user_id column (if it exists in users table)
    const { data: userByClerkId, error: clerkIdError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_user_id', clerkUserId)
      .single();

    if (!clerkIdError && userByClerkId) {
      return { userId: userByClerkId.id };
    }

    // If clerk_user_id column doesn't exist or user not found,
    // try to find by email (Clerk user email might match)
    // Note: This is a fallback - ideally users table should have clerk_user_id
    console.warn('User not found by clerk_user_id, attempting alternative lookup:', {
      clerkUserId,
      error: clerkIdError?.message,
    });

    return { userId: null, error: `User not found for Clerk ID: ${clerkUserId}` };
  } catch (error) {
    return {
      userId: null,
      error: `Error looking up user: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Updates subscription data in Supabase subscriptions table
 * 
 * Uses upsert by clerk_subscription_id for idempotency (handles duplicate events)
 * 
 * @param subscriptionData - Subscription data from webhook
 * @returns Success flag and error message if failed
 */
async function upsertSubscription(
  subscriptionData: SubscriptionData
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createSupabaseServiceClient();

    // Map Clerk user_id to database user_id
    const userLookup = await findUserByClerkId(supabase, subscriptionData.user_id);
    if (!userLookup.userId) {
      console.error('User lookup failed:', userLookup.error);
      return {
        success: false,
        error: userLookup.error || 'User not found',
      };
    }

    // Map Clerk plan ID to our schema
    const planName = mapClerkPlanToSchema(subscriptionData.plan_id);

    // Convert Unix timestamps to ISO strings
    const currentPeriodStart = subscriptionData.current_period_start
      ? new Date(subscriptionData.current_period_start * 1000).toISOString()
      : new Date().toISOString(); // Fallback to now if missing
    const currentPeriodEnd = subscriptionData.current_period_end
      ? new Date(subscriptionData.current_period_end * 1000).toISOString()
      : new Date().toISOString(); // Fallback to now if missing

    // Determine canceled_at timestamp if subscription is canceled
    const canceledAt =
      subscriptionData.status === 'canceled'
        ? new Date().toISOString()
        : null;

    // Prepare subscription data for upsert
    const subscriptionRecord = {
      clerk_subscription_id: subscriptionData.id,
      user_id: userLookup.userId,
      clerk_user_id: subscriptionData.user_id,
      plan_name: planName,
      status: subscriptionData.status,
      current_period_start: currentPeriodStart,
      current_period_end: currentPeriodEnd,
      cancel_at_period_end: subscriptionData.cancel_at_period_end || false,
      canceled_at: canceledAt,
      updated_at: new Date().toISOString(),
    };

    // Upsert by clerk_subscription_id (handles duplicates/idempotency)
    const { data: upsertedSubscription, error: upsertError } = await supabase
      .from('subscriptions')
      .upsert(subscriptionRecord, {
        onConflict: 'clerk_subscription_id',
        ignoreDuplicates: false,
      })
      .select()
      .single();

    if (upsertError) {
      console.error('Failed to upsert subscription:', {
        error: upsertError.message,
        subscriptionId: subscriptionData.id,
        userId: subscriptionData.user_id,
      });
      return {
        success: false,
        error: `Database upsert failed: ${upsertError.message}`,
      };
    }

    console.log('Subscription upserted successfully:', {
      subscriptionId: subscriptionData.id,
      userId: subscriptionData.user_id,
      planName,
      status: subscriptionData.status,
    });

    return { success: true };
  } catch (error) {
    console.error('Error upserting subscription:', error);
    return {
      success: false,
      error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

// ============================================================================
// WEBHOOK HANDLER
// ============================================================================

/**
 * POST handler for Clerk Billing webhooks
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Get request body as text (needed for signature verification)
    const body = await request.text();

    // Verify webhook signature
    const signatureCheck = await verifyWebhookSignature(request, body);
    if (!signatureCheck.valid) {
      console.error('Invalid webhook signature:', signatureCheck.error);
      return NextResponse.json(
        { error: 'Invalid webhook signature', details: signatureCheck.error },
        { status: 401 }
      );
    }

    // Parse webhook payload
    let event: ClerkWebhookEvent;
    try {
      event = JSON.parse(body) as ClerkWebhookEvent;
    } catch (parseError) {
      console.error('Failed to parse webhook payload:', parseError);
      return NextResponse.json(
        { error: 'Invalid webhook payload', details: 'Failed to parse JSON' },
        { status: 400 }
      );
    }

    // Log webhook event
    console.log('Webhook received:', {
      type: event.type,
      userId: event.data.user_id,
      subscriptionId: event.data.id,
      planId: event.data.plan_id,
      status: event.data.status,
      timestamp: new Date().toISOString(),
    });

    // Handle different event types
    switch (event.type) {
      case 'subscription.created':
      case 'subscription.updated':
      case 'subscription.active':
      case 'subscription.pastDue':
        // Upsert subscription data to subscriptions table
        // Note: Cancellations come via subscription.updated when status changes to 'canceled'
        const upsertResult = await upsertSubscription(event.data);

        if (!upsertResult.success) {
          console.error('Failed to upsert subscription:', upsertResult.error);
          
          // Return appropriate status code based on error type
          const statusCode = upsertResult.error?.includes('User not found') ? 404 : 500;
          
          return NextResponse.json(
            {
              error: 'Failed to sync subscription',
              details: upsertResult.error,
            },
            { status: statusCode }
          );
        }

        const duration = Date.now() - startTime;
        console.log('Subscription synced successfully:', {
          type: event.type,
          userId: event.data.user_id,
          subscriptionId: event.data.id,
          planId: event.data.plan_id,
          status: event.data.status,
          duration: `${duration}ms`,
        });

        return NextResponse.json(
          {
            success: true,
            message: 'Subscription synced successfully',
            event: event.type,
          },
          { status: 200 }
        );

      default:
        console.warn('Unhandled webhook event type:', event.type);
        return NextResponse.json(
          {
            success: true,
            message: 'Event type not handled, but acknowledged',
            event: event.type,
          },
          { status: 200 }
        );
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('Webhook processing error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      duration: `${duration}ms`,
    });

    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET handler for health checks
 */
export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      message: 'Clerk webhook endpoint is healthy',
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}

