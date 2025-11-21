# Stage 1 Setup Guide - Webhook Infrastructure

**Complete setup guide for Stage 1: Webhook Infrastructure**

**Date:** January 2025  
**Branch:** `payment-implementation`

---

## Overview

Stage 1 implements the webhook endpoint infrastructure with signature verification. This allows your app to receive and verify Clerk Billing webhook events securely.

---

## ✅ What's Already Implemented

1. **Webhook Route:** `app/api/webhooks/clerk/route.ts`
   - POST handler for webhook events
   - GET handler for health checks
   - Signature verification using Svix
   - Error handling and logging

2. **Dependencies:** `svix` package installed

---

## 📋 Setup Steps

### Step 1: Add Environment Variable

**Local Development (.env.local):**

Add to `.env.local`:
```bash
CLERK_WEBHOOK_SECRET=whsec_xxxxx
```

**Note:** You'll get this secret from Clerk dashboard after configuring the webhook (Step 2).

**Vercel Production:**

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add:
   - Key: `CLERK_WEBHOOK_SECRET`
   - Value: `whsec_xxxxx` (from Clerk dashboard)
   - Environment: Production, Preview, Development (select all)

---

### Step 2: Configure Webhook in Clerk Dashboard

**For Local Testing (using ngrok):**

1. **Start your local server:**
   ```bash
   npm run dev
   ```

2. **Expose local server with ngrok:**
   ```bash
   ngrok http 3000
   ```

3. **Copy the ngrok URL:**
   - Example: `https://abc123.ngrok.io`
   - Your webhook URL: `https://abc123.ngrok.io/api/webhooks/clerk`

**For Vercel Preview Testing:**

1. **Push your branch:**
   ```bash
   git push origin payment-implementation
   ```

2. **Get preview URL from Vercel:**
   - Go to Vercel Dashboard → Your Project → Deployments
   - Find the preview deployment
   - Copy the preview URL
   - Your webhook URL: `https://your-preview-url.vercel.app/api/webhooks/clerk`

**Configure in Clerk Dashboard:**

1. Go to Clerk Dashboard → Webhooks
2. Click "Add Endpoint"
3. Enter your webhook URL:
   - Local: `https://your-ngrok-url.ngrok.io/api/webhooks/clerk`
   - Preview: `https://your-preview-url.vercel.app/api/webhooks/clerk`
   - Production: `https://your-domain.com/api/webhooks/clerk`
4. **Enable these events:**
   - ✅ `subscription.created`
   - ✅ `subscription.updated`
   - ✅ `subscription.active`
   - ✅ `subscription.pastDue`
5. Click "Create"
6. **Copy the webhook signing secret:**
   - It will look like: `whsec_xxxxx`
   - Add this to your `.env.local` and Vercel environment variables

---

### Step 3: Test Webhook Endpoint

**Health Check (GET):**

Test the health check endpoint:
```bash
curl http://localhost:3000/api/webhooks/clerk
```

Expected response:
```json
{
  "status": "ok",
  "message": "Clerk webhook endpoint is healthy",
  "timestamp": "2025-01-15T10:30:00Z"
}
```

**Test Webhook from Clerk:**

1. Go to Clerk Dashboard → Webhooks
2. Click on your webhook endpoint
3. Click "Send test event"
4. Select event type: `subscription.created`
5. Click "Send"
6. Check your server logs for:
   ```
   Webhook received: {
     type: 'subscription.created',
     userId: 'user_xxxxx',
     subscriptionId: 'sub_xxxxx',
     ...
   }
   ```

**Verify Signature Verification:**

To test that invalid signatures are rejected:

1. Send a request with invalid signature:
   ```bash
   curl -X POST http://localhost:3000/api/webhooks/clerk \
     -H "Content-Type: application/json" \
     -H "svix-signature: invalid" \
     -d '{"type":"subscription.created","data":{}}'
   ```

2. Should return 401 Unauthorized:
   ```json
   {
     "error": "Invalid webhook signature",
     "details": "Missing svix headers"
   }
   ```

---

## 🔍 Verification Checklist

- [ ] Environment variable `CLERK_WEBHOOK_SECRET` added to `.env.local`
- [ ] Environment variable added to Vercel (Production, Preview, Development)
- [ ] Webhook endpoint configured in Clerk dashboard
- [ ] Webhook URL points to correct endpoint
- [ ] All subscription events enabled (created, updated, active, pastDue)
- [ ] Webhook signing secret copied from Clerk dashboard
- [ ] Health check endpoint returns 200 OK
- [ ] Test webhook from Clerk dashboard succeeds
- [ ] Webhook events logged in server logs
- [ ] Invalid signatures rejected with 401

---

## 🐛 Troubleshooting

### Webhook Not Receiving Events

**Check:**
- Webhook URL is correct in Clerk dashboard
- Server is running and accessible
- ngrok is running (for local testing)
- Vercel preview deployment is active

**Verify:**
- Check Clerk webhook logs in dashboard
- Check server logs for incoming requests
- Test health check endpoint

### Invalid Signature Errors

**Check:**
- `CLERK_WEBHOOK_SECRET` is set correctly
- Secret matches the one in Clerk dashboard
- No extra spaces or characters in secret

**Fix:**
- Copy secret again from Clerk dashboard
- Update `.env.local` and Vercel environment variables
- Restart server

### 404 Not Found

**Check:**
- Route file exists: `app/api/webhooks/clerk/route.ts`
- URL path is correct: `/api/webhooks/clerk`
- Server is running

**Fix:**
- Verify file structure
- Check Next.js routing
- Restart dev server

---

## 📝 Next Steps

After Stage 1 is complete:
- ✅ Webhook receives events
- ✅ Signature verification works
- ✅ Events are logged

**Proceed to Stage 2:** Database Sync and Event Handling

---

**Last Updated:** January 2025

