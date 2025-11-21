# Feedback Webhook - Quick Test Commands

**Quick reference for testing the webhook endpoint**

---

## Prerequisites

1. **Apply migration:**
   ```sql
   -- Run supabase/schemas/09-feedback.sql in Supabase SQL Editor
   ```

2. **Set environment variables:**
   ```bash
   # .env.local
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

3. **Start dev server:**
   ```bash
   npm run dev
   ```

---

## Test Commands

### ✅ Valid Payload (Should Return 200)

```bash
curl -X POST http://localhost:3000/api/webhooks/n8n/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_2abc123def",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "message": "This is a test feedback message",
    "browser": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    "timestamp": "2025-01-28T10:00:00.000Z",
    "url": "http://localhost:3000/dashboard",
    "sentiment": "positive",
    "category": "feature_request",
    "priority": "medium",
    "summary": "User requests a new feature",
    "actionable": true,
    "processedAt": "2025-01-28T10:00:03.000Z"
  }'
```

**Expected:** `{"success": true, "message": "Feedback stored successfully"}`

---

### ❌ Missing Required Fields (Should Return 400)

```bash
curl -X POST http://localhost:3000/api/webhooks/n8n/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_2abc123def",
    "message": "Test message"
  }'
```

**Expected:** `{"success": false, "error": "Missing required fields: firstName, lastName, timestamp, processedAt"}`

---

### ❌ Invalid JSON (Should Return 400)

```bash
curl -X POST http://localhost:3000/api/webhooks/n8n/feedback \
  -H "Content-Type: application/json" \
  -d 'invalid json'
```

**Expected:** `{"success": false, "error": "Invalid JSON payload"}`

---

### ❌ Invalid Field Type (Should Return 400)

```bash
curl -X POST http://localhost:3000/api/webhooks/n8n/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_2abc123def",
    "firstName": "John",
    "lastName": "Doe",
    "message": "Test",
    "timestamp": "2025-01-28T10:00:00.000Z",
    "processedAt": "2025-01-28T10:00:03.000Z",
    "actionable": "not-a-boolean"
  }'
```

**Expected:** `{"success": false, "error": "Invalid actionable: must be a boolean"}`

---

## Verify in Supabase

### SQL Query

```sql
SELECT 
  id,
  user_id,
  first_name,
  last_name,
  email,
  message,
  category,
  priority,
  sentiment,
  actionable,
  created_at,
  processed_at
FROM feedback
ORDER BY created_at DESC
LIMIT 5;
```

### Dashboard

1. Open Supabase Dashboard
2. Go to **Table Editor**
3. Select `feedback` table
4. Verify new records appear

---

## Update n8n Workflow

1. Open n8n workflow
2. Click **HTTP Request** node (callback node)
3. Update URL:
   - **Local:** `http://localhost:3000/api/webhooks/n8n/feedback`
   - **Production:** `https://yourdomain.com/api/webhooks/n8n/feedback`
4. Save workflow

---

## Test End-to-End

1. Submit feedback through app UI
2. Check n8n execution history
3. Verify HTTP Request node shows **Success** (not Error)
4. Check Supabase for new record

---

**For detailed testing guide, see:** `FEEDBACK_STAGE2_TESTING_GUIDE.md`

