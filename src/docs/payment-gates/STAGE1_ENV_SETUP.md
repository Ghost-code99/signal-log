# Stage 1 Environment Variable Setup

**Setting up CLERK_WEBHOOK_SECRET for webhook signature verification**

---

## Environment Variable

**Name:** `CLERK_WEBHOOK_SECRET`

**Purpose:** Webhook signing secret from Clerk dashboard for verifying webhook signatures

**Format:** `whsec_xxxxx` (starts with `whsec_`)

**Security:** ⚠️ **Never commit this to code** - Always use environment variables

---

## Setup Instructions

### Step 1: Get Webhook Secret from Clerk

1. Go to Clerk Dashboard → Webhooks
2. Create or select your webhook endpoint
3. Copy the "Signing Secret" (starts with `whsec_`)
4. **Important:** This secret is shown only once - save it securely

### Step 2: Add to Local Development

**File:** `.env.local` (in project root)

```bash
CLERK_WEBHOOK_SECRET=whsec_your_secret_here
```

**Note:** `.env.local` is already in `.gitignore` - it won't be committed

### Step 3: Add to Vercel

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Click "Add New"
3. Enter:
   - **Key:** `CLERK_WEBHOOK_SECRET`
   - **Value:** `whsec_your_secret_here` (paste from Clerk)
   - **Environment:** Select all (Production, Preview, Development)
4. Click "Save"
5. **Redeploy** your project for changes to take effect

---

## Verification

**Check if variable is set:**

```bash
# Local
echo $CLERK_WEBHOOK_SECRET

# Or in your code (for debugging only - remove after)
console.log('Secret set:', !!process.env.CLERK_WEBHOOK_SECRET);
```

**Test webhook endpoint:**

The webhook route will return an error if the secret is missing:
```json
{
  "error": "Invalid webhook signature",
  "details": "CLERK_WEBHOOK_SECRET environment variable is not set"
}
```

---

## Security Best Practices

1. ✅ **Never commit secrets to code**
2. ✅ **Use environment variables only**
3. ✅ **Rotate secrets if compromised**
4. ✅ **Use different secrets for dev/staging/production** (if applicable)
5. ✅ **Don't log the secret value** (only check if it exists)

---

## Troubleshooting

### Error: "CLERK_WEBHOOK_SECRET environment variable is not set"

**Fix:**
- Check `.env.local` exists and has the variable
- Restart dev server after adding to `.env.local`
- Verify Vercel environment variables are set
- Redeploy Vercel project after adding variable

### Error: "Invalid webhook signature"

**Possible causes:**
- Secret doesn't match Clerk dashboard
- Secret has extra spaces or characters
- Wrong secret copied

**Fix:**
- Copy secret again from Clerk dashboard
- Remove any extra spaces
- Update `.env.local` and Vercel
- Restart server / redeploy

---

**Last Updated:** January 2025

