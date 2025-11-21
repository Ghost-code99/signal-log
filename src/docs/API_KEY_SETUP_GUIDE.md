# API Key Setup Guide

**Webhook Endpoint API Key Authentication**

---

## Overview

The webhook endpoint at `/api/webhooks/n8n/feedback` now requires API key authentication. Only requests with a valid API key in the `X-API-Key` header will be processed.

---

## Step 1: Generate API Key Secret

### Generate Random Secret

Run this command in your terminal:

```bash
openssl rand -hex 32
```

**Example output:**
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

**Save this secret** - you'll need it for the next steps.

---

## Step 2: Add to Local Environment

### Update `.env.local`

Add the secret to your `.env.local` file:

```bash
# n8n Webhook API Key Secret
N8N_WEBHOOK_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

**Important:**
- Replace with your actual generated secret
- Never commit `.env.local` to git
- Keep the secret secure

### Restart Dev Server

After adding the environment variable:

```bash
# Stop your dev server (Ctrl+C)
# Then restart it
npm run dev
```

---

## Step 3: Add to Vercel Environment Variables

### For Preview and Production

1. **Go to Vercel Dashboard:**
   - Select your project
   - Go to **Settings** → **Environment Variables**

2. **Add new variable:**
   - **Key:** `N8N_WEBHOOK_SECRET`
   - **Value:** Your generated secret (same as in `.env.local`)
   - **Environment:** Select **Preview** and **Production**
     - ✅ Preview
     - ✅ Production
     - ❌ Development (optional, for local testing)

3. **Click "Save"**

4. **Redeploy:**
   - Go to **Deployments** tab
   - Find your preview/production deployment
   - Click **"..."** menu → **Redeploy**
   - Or wait for next commit to trigger redeploy

---

## Step 4: Update n8n Workflow

### Add API Key to HTTP Request Node

1. **Open your n8n workflow**

2. **Click on HTTP Request node** (the callback node)

3. **Add Header:**
   - Find **"Headers"** section
   - Click **"Add Header"** or **"Add Value"**
   - **Name:** `X-API-Key`
   - **Value:** Your generated secret (same as in environment variables)
     - You can use n8n expression: `{{$env.N8N_WEBHOOK_SECRET}}`
     - Or hardcode it (less secure but works)

4. **Save the workflow**

### Example n8n Header Configuration

```
Headers:
  Content-Type: application/json
  X-API-Key: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

---

## Step 5: Test API Key Verification

### Test 1: Valid API Key (Should Succeed)

```bash
curl -X POST http://localhost:3000/api/webhooks/n8n/feedback \
  -H "Content-Type: application/json" \
  -H "X-API-Key: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2" \
  -d '{
    "userId": "user_test",
    "firstName": "Test",
    "lastName": "User",
    "message": "Test message",
    "timestamp": "2025-01-28T10:00:00.000Z",
    "processedAt": "2025-01-28T10:00:03.000Z"
  }'
```

**Expected:** `200 OK` with success response

### Test 2: Missing API Key (Should Return 401)

```bash
curl -X POST http://localhost:3000/api/webhooks/n8n/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_test",
    "firstName": "Test",
    "lastName": "User",
    "message": "Test message",
    "timestamp": "2025-01-28T10:00:00.000Z",
    "processedAt": "2025-01-28T10:00:03.000Z"
  }'
```

**Expected:** `401 Unauthorized`
```json
{
  "success": false,
  "error": "Missing API key. Please provide X-API-Key header."
}
```

### Test 3: Invalid API Key (Should Return 401)

```bash
curl -X POST http://localhost:3000/api/webhooks/n8n/feedback \
  -H "Content-Type: application/json" \
  -H "X-API-Key: wrong-secret-key" \
  -d '{
    "userId": "user_test",
    "firstName": "Test",
    "lastName": "User",
    "message": "Test message",
    "timestamp": "2025-01-28T10:00:00.000Z",
    "processedAt": "2025-01-28T10:00:03.000Z"
  }'
```

**Expected:** `401 Unauthorized`
```json
{
  "success": false,
  "error": "Invalid API key"
}
```

---

## Security Best Practices

### 1. Keep Secret Secure

- ✅ Store in environment variables (never in code)
- ✅ Use different secrets for dev/staging/production
- ✅ Rotate secrets periodically
- ❌ Never commit secrets to git
- ❌ Never log the secret value

### 2. Use Strong Secrets

- ✅ Use `openssl rand -hex 32` (64 characters)
- ✅ Use random, unpredictable values
- ❌ Don't use simple passwords or predictable values

### 3. Monitor API Key Failures

- Watch for 401 responses in logs
- Track failed authentication attempts
- Alert on suspicious patterns

### 4. Rotate Secrets

- Change secrets periodically (e.g., every 90 days)
- Update both Vercel and n8n when rotating
- Test after rotation

---

## How It Works

### Request Flow

```
1. Request arrives with X-API-Key header
   ↓
2. Extract API key from header
   ↓
3. Get expected secret from N8N_WEBHOOK_SECRET env var
   ↓
4. Compare API key with secret (constant-time comparison)
   ↓
5. If match: Allow request ✅
   If mismatch: Return 401 ❌
```

### Constant-Time Comparison

The implementation uses constant-time comparison to prevent timing attacks:

- **Timing attack:** An attacker measures response time to guess the secret
- **Constant-time:** Comparison takes same time regardless of where mismatch occurs
- **Protection:** Prevents leaking information about the secret

---

## Troubleshooting

### Issue: "Missing API key" Error

**Symptoms:**
- 401 Unauthorized response
- Error: "Missing API key. Please provide X-API-Key header."

**Solutions:**
1. Check n8n HTTP Request node has `X-API-Key` header
2. Verify header name is exactly `X-API-Key` (case-sensitive in n8n)
3. Check header value is set correctly

### Issue: "Invalid API key" Error

**Symptoms:**
- 401 Unauthorized response
- Error: "Invalid API key"

**Solutions:**
1. Verify `N8N_WEBHOOK_SECRET` in `.env.local` matches n8n header value
2. Check for extra spaces or newlines in secret
3. Verify environment variable is loaded (restart dev server)
4. For Vercel: Check env var is set and deployment is redeployed

### Issue: "Server configuration error"

**Symptoms:**
- 401 Unauthorized response
- Error: "Server configuration error"

**Solutions:**
1. Check `N8N_WEBHOOK_SECRET` is set in environment variables
2. Verify env var name is exactly `N8N_WEBHOOK_SECRET`
3. Restart dev server after adding env var
4. For Vercel: Redeploy after adding env var

---

## Verification Checklist

- [ ] Secret generated with `openssl rand -hex 32`
- [ ] Secret added to `.env.local`
- [ ] Dev server restarted
- [ ] Secret added to Vercel (Preview and Production)
- [ ] Vercel deployment redeployed
- [ ] n8n HTTP Request node updated with `X-API-Key` header
- [ ] Test with valid API key: ✅ 200 OK
- [ ] Test without API key: ✅ 401 Unauthorized
- [ ] Test with invalid API key: ✅ 401 Unauthorized

---

## Example: Complete n8n HTTP Request Configuration

**Method:** POST

**URL:** `https://your-app.vercel.app/api/webhooks/n8n/feedback`

**Headers:**
```
Content-Type: application/json
X-API-Key: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

**Body (JSON):**
```json
{
  "userId": {{ JSON.stringify($('Webhook').item.json.body.userId) }},
  "firstName": {{ JSON.stringify($('Webhook').item.json.body.firstName) }},
  ...
}
```

---

**For questions or issues, check the implementation in:** `app/api/webhooks/n8n/feedback/route.ts`

