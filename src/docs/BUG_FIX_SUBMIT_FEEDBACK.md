# Bug Fix: submit-feedback.ts - lastName Validation

**Date:** January 2025  
**File:** `src/app/actions/submit-feedback.ts`

---

## Bug Description

**Issue:** Users without a `lastName` in their Clerk profile cannot submit feedback, even though the database schema and n8n webhook allow empty strings for `lastName`.

**Root Cause:**
- Line 66 sets `lastName` to empty string when missing: `const lastName = user.lastName || '';`
- Line 90 validates that `lastName` is truthy: `if (!userId || !message || !firstName || !lastName || !email)`
- Since empty string is falsy in JavaScript, validation fails
- This prevents users without `lastName` from submitting feedback

**Impact:** HIGH - Blocks legitimate users from submitting feedback

---

## Fix Applied

**Changed:** Removed `lastName` from truthy validation check

**Before:**
```typescript
// Validate all required fields
if (!userId || !message || !firstName || !lastName || !email) {
  return {
    success: false,
    error: 'Missing required fields',
  };
}
```

**After:**
```typescript
// Validate all required fields
// Note: lastName is optional (can be empty string) - database and webhook allow it
if (!userId || !message || !firstName || !email) {
  return {
    success: false,
    error: 'Missing required fields',
  };
}
```

---

## Verification

### Database Schema
- `last_name TEXT NOT NULL` - Allows empty strings (NOT NULL means cannot be NULL, but empty string is valid)

### Webhook Route
- `lastName` is in requiredFields array, but validation only checks `!(field in body)` (existence, not truthiness)
- Empty strings pass the webhook validation

### TypeScript Interface
- `lastName: string;` - Allows any string including empty strings

### Fix Verification
- ✅ Removed `lastName` from truthy check
- ✅ Added comment explaining why `lastName` is optional
- ✅ All other required fields still validated
- ✅ Empty string for `lastName` now allowed

---

## Testing

**Test Case:** User without lastName in Clerk profile

**Expected Behavior:**
1. User submits feedback
2. `lastName` is set to empty string (`''`)
3. Validation passes (no longer checks `lastName` for truthiness)
4. Feedback submitted successfully to n8n webhook
5. Webhook processes and stores in database with empty `last_name`

**Test Steps:**
1. Sign in as user without `lastName` in Clerk profile
2. Submit feedback through UI
3. Verify feedback is submitted successfully
4. Check n8n webhook receives payload with `lastName: ""`
5. Verify database stores feedback with empty `last_name`

---

## Related Files

- `src/app/actions/submit-feedback.ts` - Fixed
- `src/app/api/webhooks/n8n/feedback/route.ts` - Already handles empty strings correctly
- `supabase/schemas/09-feedback.sql` - Schema allows empty strings

---

**Status:** ✅ **FIXED**

**Last Updated:** January 2025

