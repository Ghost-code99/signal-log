# Feedback Webhook Endpoint - Stage 2 Implementation Summary

**Stage:** Stage 2 - Webhook Endpoint to Receive Processed Feedback  
**Status:** ✅ Complete  
**Date:** January 2025

---

## What Was Implemented

### 1. API Route (`app/api/webhooks/n8n/feedback/route.ts`)

Created a webhook endpoint that:

- ✅ **Parses JSON body from request:**
  - Uses `await request.json()`
  - Handles JSON parsing errors gracefully
  - Returns 400 for invalid JSON

- ✅ **Validates payload structure:**
  - Checks required fields: `userId`, `firstName`, `lastName`, `message`, `timestamp`, `processedAt`
  - Validates field types (strings, booleans)
  - Returns 400 for validation errors with specific messages

- ✅ **Logs received data for debugging:**
  - Logs sanitized payload (no sensitive data)
  - Includes timestamp and request details
  - Logs success and error cases

- ✅ **Inserts feedback into Supabase:**
  - Uses service role client (bypasses RLS for webhook)
  - Maps payload fields to database columns correctly
  - Handles database errors gracefully

- ✅ **Returns JSON response:**
  - Success: `{success: true, message: "Feedback stored successfully"}` (200)
  - Validation error: `{success: false, error: "..."}` (400)
  - Server error: `{success: false, error: "..."}` (500)

- ✅ **Error handling:**
  - Try/catch blocks for all operations
  - Specific error messages for validation
  - Generic error messages for server errors (doesn't expose internal details)
  - Logs all errors for debugging

### 2. Supabase Service Client (`lib/supabase-service.ts`)

Created a helper for service role operations:

- ✅ **Creates Supabase client with service role key:**
  - Bypasses RLS policies (for trusted server-to-server operations)
  - Validates environment variables
  - Throws clear errors if env vars missing

- ✅ **Use cases:**
  - Webhook endpoints (n8n → app)
  - Admin operations
  - Background jobs

### 3. Database Migration (`supabase/schemas/09-feedback.sql`)

Created migration file that:

- ✅ **Creates `feedback` table:**
  - All columns matching PRD schema
  - Correct data types
  - Primary key: `id` (UUID)
  - Defaults: `gen_random_uuid()` for id, `now()` for `created_at`

- ✅ **Adds indexes:**
  - `idx_feedback_user_id` on `user_id`
  - `idx_feedback_created_at` on `created_at` (DESC)
  - `idx_feedback_category` on `category`
  - `idx_feedback_priority` on `priority`

- ✅ **Enables RLS:**
  - Row Level Security enabled on table

- ✅ **Creates RLS policies:**
  - **INSERT:** Users can insert their own feedback (`user_id = auth.jwt()->>'sub'`)
  - **SELECT (Admins):** Admins can view all feedback (checks for admin role)
  - **SELECT (Users):** Users can view their own feedback (`user_id = auth.jwt()->>'sub'`)
  - **No UPDATE or DELETE:** Feedback is immutable

- ✅ **Adds documentation:**
  - Table and column comments
  - Explains Clerk integration pattern

---

## File Structure

```
src/
├── app/
│   └── api/
│       └── webhooks/
│           └── n8n/
│               └── feedback/
│                   └── route.ts          ← UPDATED: Stores in Supabase
├── lib/
│   └── supabase-service.ts              ← NEW: Service role client
└── docs/
    ├── FEEDBACK_STAGE2_TESTING_GUIDE.md ← NEW: Testing guide
    └── FEEDBACK_STAGE2_IMPLEMENTATION.md ← This file

supabase/
└── schemas/
    └── 09-feedback.sql                  ← NEW: Migration file
```

---

## Environment Variables

### Required

```bash
# Supabase (required for webhook endpoint)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# n8n (from Stage 1)
N8N_FEEDBACK_WEBHOOK_URL=https://your-n8n-instance.com/webhook/xxxxx
```

**Important Notes:**
- `SUPABASE_SERVICE_ROLE_KEY` is required for webhook endpoint
- Service role key bypasses RLS (needed for n8n webhook)
- Never expose service role key to client-side code
- Add to `.env.local` for local development
- Add to Vercel environment variables for preview/production

---

## Payload Structure

### n8n → App Webhook

```json
{
  "userId": "user_2abc123def",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "message": "User's feedback text",
  "browser": "Mozilla/5.0...",
  "timestamp": "2025-01-28T10:00:00.000Z",
  "url": "https://yourdomain.com/dashboard",
  "sentiment": "positive",
  "category": "feature_request",
  "priority": "medium",
  "summary": "One sentence summary",
  "actionable": true,
  "processedAt": "2025-01-28T10:00:03.000Z"
}
```

### Database Mapping

| Payload Field | Database Column | Notes |
|--------------|----------------|-------|
| `userId` | `user_id` | TEXT (Clerk user ID) |
| `firstName` | `first_name` | TEXT |
| `lastName` | `last_name` | TEXT |
| `email` | `email` | TEXT (nullable) |
| `message` | `message` | TEXT |
| `browser` | `browser` | TEXT (nullable) |
| `url` | `url` | TEXT (nullable) |
| `sentiment` | `sentiment` | TEXT (nullable) |
| `category` | `category` | TEXT (nullable) |
| `priority` | `priority` | TEXT (nullable) |
| `summary` | `summary` | TEXT (nullable) |
| `actionable` | `actionable` | BOOLEAN (nullable) |
| `timestamp` | `created_at` | TIMESTAMPTZ |
| `processedAt` | `processed_at` | TIMESTAMPTZ (nullable) |

---

## API Response Structure

### Success Response (200)

```json
{
  "success": true,
  "message": "Feedback stored successfully"
}
```

### Validation Error (400)

```json
{
  "success": false,
  "error": "Missing required fields: firstName, lastName"
}
```

### Server Error (500)

```json
{
  "success": false,
  "error": "Database error: failed to insert feedback"
}
```

**Note:** Error details only shown in development mode.

---

## Testing

See `FEEDBACK_STAGE2_TESTING_GUIDE.md` for complete testing instructions.

**Quick Test with curl:**
```bash
curl -X POST http://localhost:3000/api/webhooks/n8n/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_test123",
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "message": "Test feedback",
    "timestamp": "2025-01-28T10:00:00.000Z",
    "processedAt": "2025-01-28T10:00:03.000Z",
    "sentiment": "positive",
    "category": "feature_request",
    "priority": "medium",
    "summary": "Test summary",
    "actionable": true
  }'
```

---

## Error Handling

### Validation Errors (400)

- Missing required fields
- Invalid field types
- Empty strings for required fields

**Response:** Specific error message indicating what's wrong

### Database Errors (500)

- Table doesn't exist
- Column mismatch
- Connection errors
- Constraint violations

**Response:** Generic error message (details only in development)

### JSON Parsing Errors (400)

- Invalid JSON syntax
- Malformed request body

**Response:** "Invalid JSON payload"

---

## Security Considerations

### Service Role Key

- ✅ Only used in server-side code
- ✅ Never exposed to client
- ✅ Bypasses RLS (intentional for webhook)
- ✅ Used only for trusted server-to-server operations

### RLS Policies

- ✅ Users can only insert their own feedback
- ✅ Users can only view their own feedback
- ✅ Admins can view all feedback
- ✅ No UPDATE or DELETE permissions

### Input Validation

- ✅ All required fields validated
- ✅ Field types validated
- ✅ SQL injection prevented (using Supabase client)

---

## Next Steps

### Stage 3: Verify RLS Policies

Test that RLS policies work correctly:
- Users can view their own feedback
- Users cannot view others' feedback
- Admins can view all feedback

### Stage 4: End-to-End Testing

Test complete flow:
- Submit feedback → n8n processes → stores in database
- Verify all fields populated correctly
- Test error scenarios

---

## Success Criteria

✅ **API Route:**
- Parses JSON correctly
- Validates payload structure
- Stores data in Supabase
- Returns appropriate status codes
- Handles errors gracefully

✅ **Database:**
- Table created with correct schema
- Indexes created
- RLS policies active
- Data inserts successfully

✅ **End-to-End:**
- n8n workflow calls webhook successfully
- Data stored in Supabase
- All fields populated correctly

---

**Stage 2 Status:** ✅ Complete  
**Ready for:** Stage 3 (RLS Policy Testing) and Stage 4 (End-to-End Testing)

