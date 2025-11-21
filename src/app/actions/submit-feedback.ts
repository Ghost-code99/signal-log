'use server';

import { auth, clerkClient } from '@clerk/nextjs/server';
import { headers } from 'next/headers';

/**
 * Server Action for submitting user feedback to n8n webhook
 * 
 * This action:
 * 1. Extracts user data from Clerk session
 * 2. Gets browser info and current URL from headers
 * 3. Validates required fields
 * 4. Calls n8n webhook with complete payload
 * 5. Returns success/error response
 */

interface SubmitFeedbackResult {
  success: boolean;
  message?: string;
  error?: string;
}

interface FeedbackPayload {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  message: string;
  browser: string;
  timestamp: string;
  url: string;
}

export async function submitFeedback(
  message: string,
  url?: string
): Promise<SubmitFeedbackResult> {
  try {
    // Validate message
    if (!message || message.trim().length === 0) {
      return {
        success: false,
        error: 'Message is required',
      };
    }

    // Get user info from Clerk session
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: 'User not authenticated',
      };
    }

    // Get full user object from Clerk
    const client = await clerkClient();
    const user = await client.users.getUser(userId);

    // Extract user data
    const firstName =
      user.firstName ||
      user.emailAddresses[0]?.emailAddress.split('@')[0] ||
      'User';
    const lastName = user.lastName || '';
    const email =
      user.emailAddresses[0]?.emailAddress ||
      user.primaryEmailAddress?.emailAddress ||
      'unknown@example.com';

    // Get browser info from headers
    const headersList = await headers();
    const userAgent = headersList.get('user-agent') || headersList.get('User-Agent') || 'Unknown';

    // Get current timestamp (ISO 8601 format)
    const timestamp = new Date().toISOString();

    // Get current URL
    // Priority: 1. Passed parameter, 2. Referer header, 3. Unknown
    let currentUrl = url || 'Unknown';
    if (currentUrl === 'Unknown') {
      const referer = headersList.get('referer') || headersList.get('Referer');
      if (referer) {
        currentUrl = referer;
      }
    }

    // Validate all required fields
    // Note: lastName is optional (can be empty string) - database and webhook allow it
    if (!userId || !message || !firstName || !email) {
      return {
        success: false,
        error: 'Missing required fields',
      };
    }

    // Construct payload matching PRD structure
    const payload: FeedbackPayload = {
      userId,
      firstName,
      lastName,
      email,
      message: message.trim(),
      browser: userAgent,
      timestamp,
      url: currentUrl,
    };

    // Get n8n webhook URL from environment variable
    const webhookUrl = process.env.N8N_FEEDBACK_WEBHOOK_URL;

    if (!webhookUrl) {
      console.error('❌ N8N_FEEDBACK_WEBHOOK_URL environment variable not set');
      return {
        success: false,
        error: 'Failed to send feedback. Please try again later.',
      };
    }

    // Call n8n webhook with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Validate response status
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error('❌ n8n webhook error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
        });

        return {
          success: false,
          error: 'Failed to send feedback. Please try again later.',
        };
      }

      // Log success (but don't expose internal details to user)
      console.log('✅ Feedback submitted successfully:', {
        userId,
        email,
        messageLength: message.length,
        timestamp,
      });

      return {
        success: true,
        message: 'Feedback submitted successfully',
      };
    } catch (fetchError) {
      clearTimeout(timeoutId);

      // Handle timeout
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        console.error('❌ n8n webhook timeout (10 seconds)');
        return {
          success: false,
          error: 'Request timed out. Please try again later.',
        };
      }

      // Handle network errors
      console.error('❌ Network error calling n8n webhook:', fetchError);
      return {
        success: false,
        error: 'Failed to send feedback. Please try again later.',
      };
    }
  } catch (error) {
    // Log error for debugging (but don't expose to user)
    console.error('❌ Error in submitFeedback:', error);

    return {
      success: false,
      error: 'Failed to send feedback. Please try again later.',
    };
  }
}

