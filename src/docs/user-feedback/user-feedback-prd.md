# User Feedback System PRD

**Status:** Ready for Implementation  
**Created:** November 19, 2025  
**Feature:** Automated feedback processing with AI analysis and storage

---

## Overview

The User Feedback System enables users to submit feedback directly from the app, which is automatically processed by AI (via n8n) to extract sentiment, categorize the feedback, determine priority, and generate actionable insights. The processed feedback is then stored in Supabase for future analysis and action.

**Why this matters:**
- **User-centric development:** Capture real user insights at the point of experience
- **AI-powered analysis:** Automatically categorize and prioritize feedback without manual review
- **Actionable insights:** Get structured data (sentiment, category, priority) to make informed product decisions
- **Scalable processing:** Handle feedback volume without manual triage
- **Complete audit trail:** Store all feedback with context (browser, URL, timestamp) for analysis

---

## User Flow

**Step-by-step flow from user perspective:**

1. **User clicks "Give Feedback" link**
   - Link appears in footer on all pages
   - User can access feedback from anywhere in the app

2. **Modal opens with feedback form**
   - Modal displays "Share Your Thoughts" headline
   - Single textarea field for message (required)
   - "Cancel" and "Send Feedback" buttons visible

3. **User fills in message textarea**
   - User types their feedback, bug report, feature request, or question
   - Minimum 1 character required (enforced by validation)
   - Textarea is 5 rows tall, resizable

4. **User submits**
   - Clicks "Send Feedback" button
   - Button shows "Sending..." loading state
   - Form is disabled during submission

5. **Success message appears**
   - Modal content switches to success state
   - Displays: "Thank you for your feedback!"
   - Shows checkmark icon
   - Message: "We read every submission and appreciate you taking the time to share your thoughts."

6. **Modal closes automatically**
   - After 2 seconds, modal closes
   - User returns to the page they were on
   - No page refresh or navigation

---

## Technical Flow

**System-level flow:**

1. **Frontend form submits to Server Action**
   - User clicks "Send Feedback"
   - React Hook Form validates message (min 1 char)
   - Server Action called with form data

2. **Server Action validates data and calls n8n webhook**
   - Server Action extracts user info from Clerk session:
     - `userId` (from `auth().userId`)
     - `firstName` (from `auth().sessionClaims.firstName` or `auth().user.firstName`)
     - `lastName` (from `auth().sessionClaims.lastName` or `auth().user.lastName`)
     - `email` (from `auth().sessionClaims.email` or `auth().user.emailAddresses[0]`)
   - Gets browser info from `headers().get('user-agent')`
   - Gets current timestamp (ISO 8601 format)
   - Gets current URL from request headers or form data
   - Validates all required fields
   - Calls n8n webhook URL (from environment variable) with complete payload
   - Returns success/error response to frontend

3. **n8n receives data via Webhook Trigger**
   - Webhook Trigger node receives POST request from app
   - Validates payload structure
   - Passes data to next node

4. **n8n AI Agent processes feedback with OpenRouter**
   - AI Agent node receives feedback message
   - Sends to OpenRouter with prompt:
     - Analyze sentiment (positive/negative/neutral)
     - Categorize feedback (bug/feature_request/question/other)
     - Determine priority (low/medium/high)
     - Generate one-sentence summary
     - Determine if actionable (true/false)
   - Returns structured JSON response

5. **n8n sends Gmail notification with AI analysis**
   - Gmail node receives original data + AI analysis
   - Formats email with:
     - User info (name, email)
     - Original message
     - AI analysis (sentiment, category, priority, summary, actionable)
     - Context (browser, URL, timestamp)
   - Sends email to configured recipient

6. **n8n calls app webhook with enriched data**
   - HTTP Request node receives original data + AI analysis
   - Constructs callback payload (original data + AI fields + processedAt)
   - POSTs to app webhook endpoint: `https://yourdomain.com/api/webhooks/n8n/feedback`
   - Includes all fields from original payload plus AI analysis

7. **App stores feedback in Supabase**
   - Webhook endpoint receives POST request from n8n
   - Validates payload structure
   - Inserts feedback into `feedback` table
   - Returns success response to n8n

---

## Webhook Payload (App → n8n)

**Exact structure of data sent to n8n:**

```json
{
  "userId": "user_2abc123def",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "message": "User's feedback description text",
  "browser": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "timestamp": "2025-10-28T10:00:00Z",
  "url": "https://yourdomain.com/dashboard"
}
```

**Field Descriptions:**
- `userId` (string, required): Clerk user ID from session
- `firstName` (string, required): User's first name from Clerk
- `lastName` (string, required): User's last name from Clerk
- `email` (string, required): User's email address from Clerk
- `message` (string, required): User's feedback text (min 1 char)
- `browser` (string, optional): User-Agent header from request
- `timestamp` (string, required): ISO 8601 timestamp of submission
- `url` (string, optional): Current page URL where feedback was submitted

**Note:** We removed `feedbackType` since the AI Agent categorizes feedback automatically.

---

## Webhook Payload (n8n → App)

**Exact structure of data received from n8n (original data + AI analysis):**

```json
{
  "userId": "user_2abc123def",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "message": "User's feedback description text",
  "browser": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "timestamp": "2025-10-28T10:00:00Z",
  "url": "https://yourdomain.com/dashboard",
  "sentiment": "positive",
  "category": "feature_request",
  "priority": "medium",
  "summary": "User requests dark mode toggle feature",
  "actionable": true,
  "processedAt": "2025-10-28T10:00:03Z"
}
```

**Field Descriptions:**
- All original fields from App → n8n payload (userId, firstName, lastName, email, message, browser, timestamp, url)
- `sentiment` (string, optional): AI-determined sentiment - `"positive"` | `"negative"` | `"neutral"`
- `category` (string, optional): AI-determined category - `"bug"` | `"feature_request"` | `"question"` | `"other"`
- `priority` (string, optional): AI-determined priority - `"low"` | `"medium"` | `"high"`
- `summary` (string, optional): One-sentence summary generated by AI
- `actionable` (boolean, optional): Whether feedback requires action - `true` | `false`
- `processedAt` (string, required): ISO 8601 timestamp when AI processing completed

---

## Database Schema (Supabase)

**Table:** `feedback`

**Columns:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PRIMARY KEY, DEFAULT `gen_random_uuid()` | Unique identifier |
| `user_id` | `text` | NOT NULL | Clerk user ID (references `auth.users.id`) |
| `first_name` | `text` | NOT NULL | User's first name |
| `last_name` | `text` | NOT NULL | User's last name |
| `email` | `text` | NULLABLE | User's email address |
| `message` | `text` | NOT NULL | User's feedback text |
| `browser` | `text` | NULLABLE | User-Agent string |
| `url` | `text` | NULLABLE | Page URL where feedback was submitted |
| `sentiment` | `text` | NULLABLE | AI sentiment: `positive`, `negative`, `neutral` |
| `category` | `text` | NULLABLE | AI category: `bug`, `feature_request`, `question`, `other` |
| `priority` | `text` | NULLABLE | AI priority: `low`, `medium`, `high` |
| `summary` | `text` | NULLABLE | AI-generated summary |
| `actionable` | `boolean` | NULLABLE | Whether feedback requires action |
| `created_at` | `timestamptz` | DEFAULT `now()`, NOT NULL | Submission timestamp |
| `processed_at` | `timestamptz` | NULLABLE | AI processing completion timestamp |

**Indexes:**
- Index on `user_id` for user feedback queries
- Index on `created_at` for chronological sorting
- Index on `category` for filtering by type
- Index on `priority` for priority-based queries

**Row Level Security (RLS) Policies:**

1. **Users can INSERT their own feedback:**
   ```sql
   CREATE POLICY "Users can insert their own feedback"
   ON feedback FOR INSERT
   WITH CHECK ((auth.jwt()->>'sub') = user_id);
   ```

2. **Admins can SELECT all feedback:**
   ```sql
   CREATE POLICY "Admins can view all feedback"
   ON feedback FOR SELECT
   USING (
     EXISTS (
       SELECT 1 FROM auth.users
       WHERE auth.users.id = (auth.jwt()->>'sub')::uuid
       AND auth.users.raw_user_meta_data->>'role' = 'admin'
     )
   );
   ```

3. **Users can SELECT their own feedback:**
   ```sql
   CREATE POLICY "Users can view their own feedback"
   ON feedback FOR SELECT
   USING ((auth.jwt()->>'sub') = user_id);
   ```

4. **No UPDATE permissions:**
   - Feedback is immutable once submitted
   - No UPDATE policy needed

5. **No DELETE permissions:**
   - Feedback should be preserved for audit trail
   - No DELETE policy needed

**Note:** We removed the `type` column since the AI Agent provides `category` automatically.

---

## Expected API Responses

### Server Action (Feedback Submission)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Feedback submitted successfully"
}
```

**Validation Error (400):**
```json
{
  "success": false,
  "error": "Message is required"
}
```

**Server Error (500):**
```json
{
  "success": false,
  "error": "Failed to send feedback. Please try again later."
}
```

### Webhook Endpoint (n8n → App)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Feedback stored successfully"
}
```

**Invalid Payload (400):**
```json
{
  "success": false,
  "error": "Invalid payload: missing required field 'userId'"
}
```

**Database Error (500):**
```json
{
  "success": false,
  "error": "Database error: failed to insert feedback"
}
```

---

## Implementation Stages

### Stage 0: Update Existing n8n Workflow

**Objective:** Modify the existing n8n workflow from Lesson 5.2 to work with webhook-based feedback submission.

**Tasks:**
- [ ] **Replace Chat Trigger with Webhook Trigger node**
  - Remove Chat Trigger node
  - Add Webhook Trigger node
  - Configure webhook path (e.g., `/webhook/feedback`)
  - Set method to POST
  - Enable "Respond When" → "Last Node"
  - Save webhook URL for use in app environment variable

- [ ] **Update AI Agent prompt to work with webhook payload structure**
  - Modify prompt to expect `message` field from webhook payload
  - Ensure prompt still returns structured JSON:
    ```json
    {
      "sentiment": "positive | negative | neutral",
      "category": "bug | feature_request | question | other",
      "priority": "low | medium | high",
      "summary": "One sentence summary",
      "actionable": true | false
    }
    ```
  - Test AI Agent with sample webhook payload

- [ ] **Update Gmail node to include webhook URL fields**
  - Include original webhook payload fields (userId, firstName, lastName, email, message, browser, url, timestamp)
  - Include AI analysis fields (sentiment, category, priority, summary, actionable)
  - Format email body with all relevant information
  - Test email formatting

- [ ] **Add HTTP Request node to send data back to app**
  - Add HTTP Request node after Gmail node
  - Configure method: POST
  - Set URL: `{{$env.APP_WEBHOOK_URL}}/api/webhooks/n8n/feedback`
  - Set body: Merge original webhook payload + AI analysis + processedAt timestamp
  - Set headers: `Content-Type: application/json`
  - Handle errors (log if callback fails, but don't block workflow)

- [ ] **Test workflow end-to-end**
  - Use n8n "Test Workflow" with sample payload
  - Verify AI Agent processes correctly
  - Verify Gmail sends notification
  - Verify HTTP Request calls app webhook (will fail until Stage 2, but should see request in logs)

---

### Stage 1: Create Server Action for Feedback Submission

**Objective:** Create a server action that collects user data, validates input, and sends feedback to n8n webhook.

**Tasks:**
- [ ] **Create Server Action file**
  - Create `src/app/actions/feedback.ts` (or similar path)
  - Mark with `"use server"` directive
  - Export `submitFeedback` function

- [ ] **Extract user info from Clerk session**
  - Import `auth` from `@clerk/nextjs/server`
  - Get `userId` from `auth().userId`
  - Get user object from `auth().user` or `clerkClient().users.getUser(userId)`
  - Extract:
    - `firstName`: `user.firstName` or `user.firstName || user.emailAddresses[0]?.emailAddress.split('@')[0]`
    - `lastName`: `user.lastName` or `''`
    - `email`: `user.emailAddresses[0]?.emailAddress` or `user.primaryEmailAddress?.emailAddress`

- [ ] **Get browser info from headers**
  - Import `headers` from `next/headers`
  - Get `user-agent` header: `headers().get('user-agent')` or `headers().get('User-Agent')`
  - Fallback to `'Unknown'` if not available

- [ ] **Get current timestamp**
  - Use `new Date().toISOString()` for ISO 8601 format

- [ ] **Get current URL**
  - Accept `url` as parameter to `submitFeedback` function
  - Or extract from `headers().get('referer')` or `headers().get('x-url')`
  - Fallback to `'Unknown'` if not available

- [ ] **Validate all required fields**
  - Validate `message` (required, min 1 char, max reasonable length)
  - Validate `userId` exists
  - Validate `firstName` and `lastName` exist (or provide defaults)
  - Return validation error if any required field is missing

- [ ] **Call n8n webhook with complete payload**
  - Get n8n webhook URL from environment variable: `process.env.N8N_WEBHOOK_URL`
  - Construct payload matching structure defined above
  - Use `fetch()` to POST to n8n webhook
  - Set headers: `Content-Type: application/json`
  - Set timeout (e.g., 10 seconds)
  - Handle network errors gracefully

- [ ] **Handle errors gracefully with try/catch**
  - Wrap webhook call in try/catch
  - Log errors for debugging
  - Return user-friendly error messages
  - Don't expose internal errors to user

- [ ] **Return success/error response**
  - Return `{success: true, message: "Feedback submitted successfully"}` on success
  - Return `{success: false, error: "..."}` on error
  - Match expected API response structure

- [ ] **Update feedback modal to use Server Action**
  - Import `submitFeedback` in `src/components/feedback-modal.tsx`
  - Replace `console.log` with `submitFeedback` call
  - Pass `message` and `url` (from `window.location.href`) to Server Action
  - Handle success/error responses
  - Show error message if submission fails

---

### Stage 2: Create Webhook Endpoint to Receive Processed Data

**Objective:** Create an API route that receives enriched feedback data from n8n and stores it in Supabase.

**Tasks:**
- [ ] **Create API route file**
  - Create `src/app/api/webhooks/n8n/feedback/route.ts`
  - Export async `POST` handler function

- [ ] **Parse JSON body from request**
  - Use `await request.json()` to parse request body
  - Handle JSON parsing errors gracefully

- [ ] **Validate payload structure**
  - Check all required fields exist:
    - `userId` (required)
    - `firstName` (required)
    - `lastName` (required)
    - `message` (required)
    - `timestamp` (required)
    - `processedAt` (required)
  - Validate field types (strings, booleans, etc.)
  - Return 400 error if validation fails

- [ ] **Log received data for debugging**
  - Use `console.log` or logging service to log received payload
  - Include timestamp and request ID for traceability
  - Don't log sensitive data in production

- [ ] **Insert feedback into Supabase `feedback` table**
  - Import `createSupabaseClient` from `@/lib/supabase-clerk`
  - Create Supabase client with Clerk session
  - Use `supabase.from('feedback').insert()` with payload data
  - Map payload fields to database columns:
    - `userId` → `user_id`
    - `firstName` → `first_name`
    - `lastName` → `last_name`
    - `email` → `email`
    - `message` → `message`
    - `browser` → `browser`
    - `url` → `url`
    - `sentiment` → `sentiment`
    - `category` → `category`
    - `priority` → `priority`
    - `summary` → `summary`
    - `actionable` → `actionable`
    - `timestamp` → `created_at`
    - `processedAt` → `processed_at`

- [ ] **Return JSON response**
  - Return `{success: true, message: "Feedback stored successfully"}` on success
  - Return appropriate status codes (200, 400, 500)
  - Match expected API response structure

- [ ] **Handle errors and return appropriate status codes**
  - Catch database errors
  - Catch validation errors
  - Return 400 for validation errors
  - Return 500 for server errors
  - Log errors for debugging

- [ ] **Add webhook secret verification (optional but recommended)**
  - Verify webhook secret from n8n (if configured)
  - Compare `request.headers.get('x-webhook-secret')` with `process.env.N8N_WEBHOOK_SECRET`
  - Return 401 if secret doesn't match

---

### Stage 3: Create Supabase Feedback Table

**Objective:** Create the database table and RLS policies for storing feedback.

**Tasks:**
- [ ] **Create migration file for `feedback` table**
  - Use Supabase MCP or create migration file manually
  - File: `supabase/migrations/YYYYMMDDHHMMSS_create_feedback_table.sql` (or use Supabase MCP)

- [ ] **Define schema with all columns**
  - Match schema defined above exactly
  - Use appropriate data types
  - Set defaults where specified
  - Add NOT NULL constraints where specified

- [ ] **Add indexes**
  - Index on `user_id` for user feedback queries
  - Index on `created_at` for chronological sorting
  - Index on `category` for filtering by type
  - Index on `priority` for priority-based queries

- [ ] **Add RLS policies**
  - Enable RLS on `feedback` table
  - Create INSERT policy: Users can insert their own feedback
  - Create SELECT policy: Admins can view all feedback
  - Create SELECT policy: Users can view their own feedback
  - No UPDATE or DELETE policies (feedback is immutable)

- [ ] **Test migration locally**
  - Run migration against local Supabase instance (if available)
  - Or test directly on remote Supabase using Supabase MCP
  - Verify table structure matches schema
  - Verify RLS policies work correctly
  - Test INSERT as authenticated user
  - Test SELECT as user (should see own feedback)
  - Test SELECT as admin (should see all feedback)

---

### Stage 4: Test End-to-End with Vercel Preview

**Objective:** Verify the complete feedback flow works in a deployed environment.

**Tasks:**
- [ ] **Commit and push code to trigger preview deployment**
  - Commit all changes (Server Action, webhook endpoint, migration)
  - Push to feature branch (e.g., `user-feedback`)
  - Wait for Vercel preview deployment to complete

- [ ] **Get preview URL from Vercel dashboard**
  - Navigate to Vercel project dashboard
  - Find preview deployment URL (e.g., `https://signal-log-git-user-feedback.vercel.app`)
  - Copy preview URL

- [ ] **Update n8n HTTP Request node callback URL**
  - Open n8n workflow
  - Find HTTP Request node (added in Stage 0)
  - Update URL to: `{{$env.APP_WEBHOOK_URL}}/api/webhooks/n8n/feedback`
  - Or hardcode preview URL: `https://signal-log-git-user-feedback.vercel.app/api/webhooks/n8n/feedback`
  - Save workflow

- [ ] **Update environment variables in Vercel**
  - Add `N8N_WEBHOOK_URL` to Vercel environment variables (Preview environment)
  - Add `N8N_WEBHOOK_SECRET` (if using webhook secret verification)
  - Verify Supabase environment variables are set

- [ ] **Submit test feedback via preview app**
  - Open preview URL in browser
  - Sign in (if required)
  - Click "Give Feedback" link
  - Enter test message: "This is a test feedback submission"
  - Click "Send Feedback"
  - Verify success message appears
  - Verify modal closes after 2 seconds

- [ ] **Verify complete data flow:**
  - [ ] **Form → Server Action → n8n webhook**
    - Check Vercel function logs for Server Action execution
    - Verify n8n webhook receives payload (check n8n execution logs)
    - Verify payload structure matches expected format

  - [ ] **n8n → AI Agent → enriched data**
    - Check n8n execution logs for AI Agent node
    - Verify AI Agent returns structured JSON
    - Verify all AI fields are populated (sentiment, category, priority, summary, actionable)

  - [ ] **n8n → Gmail → notification email received**
    - Check email inbox for notification
    - Verify email contains:
      - User info (name, email)
      - Original message
      - AI analysis (sentiment, category, priority, summary, actionable)
      - Context (browser, URL, timestamp)

  - [ ] **n8n → App webhook → Supabase storage**
    - Check Vercel function logs for webhook endpoint execution
    - Verify webhook receives enriched payload from n8n
    - Check Supabase `feedback` table for new record
    - Verify all fields are populated correctly:
      - Original fields (user_id, first_name, last_name, email, message, browser, url, created_at)
      - AI fields (sentiment, category, priority, summary, actionable, processed_at)

- [ ] **Check Vercel logs for webhook callback**
  - Navigate to Vercel project → Functions → `/api/webhooks/n8n/feedback`
  - Check execution logs for successful requests
  - Verify response status is 200
  - Check for any errors

- [ ] **Check Supabase table for stored feedback with AI analysis**
  - Use Supabase MCP or Supabase dashboard
  - Query `feedback` table: `SELECT * FROM feedback ORDER BY created_at DESC LIMIT 1;`
  - Verify record exists
  - Verify all fields are populated
  - Verify AI analysis fields match email notification

- [ ] **Test error scenarios**
  - Test with invalid payload (missing required fields)
  - Test with network error (n8n webhook down)
  - Test with database error (Supabase connection issue)
  - Verify error handling works correctly
  - Verify user sees appropriate error messages

---

## Success Criteria

### Functional Requirements

- ✅ **User can submit feedback from any page**
  - Feedback link accessible from footer on all pages
  - Modal opens correctly
  - Form validation works
  - Submission succeeds

- ✅ **Feedback is processed by AI within 5 seconds**
  - n8n workflow completes AI processing within 5 seconds
  - AI analysis is accurate and structured
  - All AI fields are populated (sentiment, category, priority, summary, actionable)

- ✅ **Email notification received with structured AI analysis**
  - Email arrives within 10 seconds of submission
  - Email contains all required information
  - AI analysis is clearly formatted
  - Email is readable and actionable

- ✅ **Data stored in Supabase with all fields populated**
  - Record exists in `feedback` table
  - All original fields populated (user_id, first_name, last_name, email, message, browser, url, created_at)
  - All AI fields populated (sentiment, category, priority, summary, actionable, processed_at)
  - No NULL values in required fields

- ✅ **No data loss**
  - All feedback submissions are stored
  - No submissions are lost during processing
  - Webhook callbacks are reliable

- ✅ **Graceful error handling with user-friendly messages**
  - Network errors show: "Failed to send feedback. Please try again later."
  - Validation errors show: "Please enter a message."
  - Server errors don't expose internal details
  - User always sees appropriate feedback

- ✅ **Workflow works identically on preview and production deployments**
  - Preview deployment works correctly
  - Production deployment works correctly
  - Environment variables configured correctly
  - Webhook URLs updated for each environment

### Technical Requirements

- ✅ **Server Action validates input correctly**
  - Required fields validated
  - User data extracted from Clerk session
  - Browser and URL context captured

- ✅ **n8n webhook receives correct payload structure**
  - Payload matches defined structure exactly
  - All required fields present
  - Data types correct

- ✅ **AI Agent returns structured JSON**
  - Sentiment: one of `positive`, `negative`, `neutral`
  - Category: one of `bug`, `feature_request`, `question`, `other`
  - Priority: one of `low`, `medium`, `high`
  - Summary: non-empty string
  - Actionable: boolean

- ✅ **Webhook endpoint validates and stores data correctly**
  - Payload validation works
  - Database insertion succeeds
  - RLS policies enforced
  - Error handling works

- ✅ **Database schema matches specification**
  - All columns present
  - Data types correct
  - Constraints applied
  - Indexes created
  - RLS policies active

### Performance Requirements

- ✅ **Feedback submission completes within 10 seconds**
  - Server Action responds within 2 seconds
  - n8n processing completes within 5 seconds
  - Database insertion completes within 1 second
  - Total time under 10 seconds

- ✅ **Email notification arrives within 15 seconds**
  - Gmail node sends email promptly
  - Email delivery is reliable

---

## Environment Variables

### Required for App

```bash
# n8n Webhook URL (for sending feedback to n8n)
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/feedback

# n8n Webhook Secret (optional, for webhook verification)
N8N_WEBHOOK_SECRET=your-secret-key-here

# Supabase (already configured)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

### Required for n8n

```bash
# App Webhook URL (for sending processed data back to app)
APP_WEBHOOK_URL=https://yourdomain.com

# Or for preview:
APP_WEBHOOK_URL=https://signal-log-git-user-feedback.vercel.app
```

---

## Testing Checklist

### Unit Tests

- [ ] Server Action validates input correctly
- [ ] Server Action extracts user data from Clerk session
- [ ] Server Action constructs payload correctly
- [ ] Webhook endpoint validates payload structure
- [ ] Webhook endpoint maps payload to database columns correctly
- [ ] Database schema matches specification

### Integration Tests

- [ ] Server Action calls n8n webhook successfully
- [ ] n8n webhook receives payload correctly
- [ ] AI Agent processes feedback correctly
- [ ] Gmail sends notification correctly
- [ ] n8n calls app webhook successfully
- [ ] App webhook stores data in Supabase correctly

### End-to-End Tests

- [ ] User can submit feedback from homepage
- [ ] User can submit feedback from dashboard
- [ ] User can submit feedback from any page
- [ ] Feedback is processed by AI
- [ ] Email notification is received
- [ ] Data is stored in Supabase
- [ ] All fields are populated correctly

### Error Handling Tests

- [ ] Invalid input shows validation error
- [ ] Network error shows user-friendly message
- [ ] Database error is handled gracefully
- [ ] n8n webhook failure doesn't crash app
- [ ] App webhook failure is logged but doesn't block n8n workflow

---

## Future Enhancements

### Phase 2 (Out of Scope for Initial Release)

- **Feedback Dashboard:** Admin view to see all feedback with filtering and sorting
- **Feedback Analytics:** Charts showing sentiment trends, category distribution, priority breakdown
- **Auto-Response:** Automated email responses to users based on feedback category
- **Integration with Linear:** Create Linear issues automatically for high-priority bugs
- **Feedback Status:** Track feedback status (new, in-progress, resolved, closed)
- **User Notifications:** Notify users when their feedback is addressed

---

## Appendix

### AI Agent Prompt Template

```
Analyze the following user feedback and return a JSON object with:
- sentiment: "positive", "negative", or "neutral"
- category: "bug", "feature_request", "question", or "other"
- priority: "low", "medium", or "high"
- summary: One sentence summarizing the feedback
- actionable: true if feedback requires action, false otherwise

User Feedback:
{{$json.message}}

Return only valid JSON, no additional text.
```

### Sample n8n Workflow Structure

```
Webhook Trigger
  ↓
AI Agent (OpenRouter)
  ↓
Gmail (Send Notification)
  ↓
HTTP Request (Callback to App)
```

---

**PRD Status:** ✅ Ready for Implementation  
**Next Step:** Begin Stage 0 (Update Existing n8n Workflow)

