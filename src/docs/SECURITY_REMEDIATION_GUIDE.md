# Security Remediation Guide

## Overview
This guide will help you fix security issues found by the Security Advisor, step by step, without breaking your application.

## Current Security Status

Let's start by running a security scan to see what issues we need to fix.

## Step 1: Check Your Security Score

First, let's see what issues we're dealing with:

1. Visit `http://localhost:3000/security-advisor` in your browser
2. Click the "Run Scan" button
3. Review your security score and findings

## Common Security Issues and Fixes

Based on the Security Advisor, here are the most common issues and how to fix them:

---

## Issue 1: Enable Row Level Security (RLS)

### Problem
Your database tables may not have RLS enabled, which could allow unauthorized access to data.

### Impact
- **Severity**: High
- **Security Risk**: Users could access data they shouldn't see

### Solution

#### Step 1: Open Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your project
3. Click "Table Editor" in the left sidebar

#### Step 2: Enable RLS on Each Table
For each table (projects, ideas, assumptions, etc.):

1. Click on the table name
2. Find the "RLS" toggle or button
3. Enable "Row Level Security"
4. Click "Save"

#### Step 3: Create Security Policies

Click "New Policy" and create these policies:

**Policy 1: Users can view their own data**
```sql
-- Policy Name: Users can view own data
-- Allowed Operation: SELECT

-- Using Expression:
auth.uid() = user_id
```

**Policy 2: Users can insert their own data**
```sql
-- Policy Name: Users can insert own data
-- Allowed Operation: INSERT

-- Using Expression:
auth.uid() = user_id
```

**Policy 3: Users can update their own data**
```sql
-- Policy Name: Users can update own data
-- Allowed Operation: UPDATE

-- Using Expression:
auth.uid() = user_id
```

**Policy 4: Users can delete their own data**
```sql
-- Policy Name: Users can delete own data
-- Allowed Operation: DELETE

-- Using Expression:
auth.uid() = user_id
```

#### Step 4: Verify
1. Return to the Security Advisor
2. Click "Run Scan" again
3. The RLS finding should be resolved

---

## Issue 2: Enable Multi-Factor Authentication (MFA)

### Problem
User accounts don't have MFA enabled, making them vulnerable to password attacks.

### Impact
- **Severity**: Medium
- **Security Risk**: Compromised passwords can access accounts

### Solution

#### Step 1: Enable MFA in Supabase Dashboard
1. Go to Supabase Dashboard > Authentication > Settings
2. Scroll to "Multi-Factor Authentication"
3. Toggle "Enable MFA" to ON
4. Click "Save"

#### Step 2: Add MFA Support to Your App (Optional)

This is optional but recommended. We'll add a simple MFA setup:

```typescript
// Add to your auth modal component
import { useState } from 'react'
import { supabaseClient } from '@/lib/supabase-client'

export function MFASetup() {
  const [qrCode, setQrCode] = useState<string | null>(null)
  
  const enableMFA = async () => {
    // Generate MFA secret
    const { data, error } = await supabaseClient.auth.mfa.enroll({
      factorType: 'totp'
    })
    
    if (error) {
      console.error('Error enabling MFA:', error)
      return
    }
    
    // Show QR code to user
    setQrCode(data.qr_code)
  }
  
  return (
    <div>
      <button onClick={enableMFA}>Enable MFA</button>
      {qrCode && <img src={qrCode} alt="QR Code" />}
    </div>
  )
}
```

#### Step 3: Verify
1. Return to the Security Advisor
2. Click "Run Scan"
3. The MFA finding should show as improved

---

## Issue 3: Secure API Keys

### Problem
API keys need to be properly secured and rotated regularly.

### Impact
- **Severity**: High
- **Security Risk**: Exposed keys could compromise your database

### Solution

#### Step 1: Verify Keys Are in Environment Variables
Check that you have a `.env.local` file:

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

#### Step 2: Ensure .env.local is in .gitignore
Check your `.gitignore` file:

```bash
# .gitignore
.env.local
.env*.local
```

#### Step 3: Rotate Your Keys (Important!)
If keys were ever exposed:

1. Go to Supabase Dashboard > Settings > API
2. Click "Reset" next to the Service Role Key
3. Copy the new key
4. Update your `.env.local` file
5. Update Vercel environment variables (if deployed)

#### Step 4: Verify
1. Make sure no keys are in your code
2. Check git history: `git log --all -S "your-key"`
3. If found, consider rotating the keys

---

## Issue 4: Configure Network Restrictions

### Problem
Your database is accessible from any IP address.

### Impact
- **Severity**: Medium
- **Security Risk**: Unauthorized IPs could access your database

### Solution

#### Step 1: Enable Network Restrictions
1. Go to Supabase Dashboard > Settings > Network Restrictions
2. Enable "Restrict connections"
3. Add your IP address (or IP range)
4. Click "Save"

#### Step 2: Add Additional IPs as Needed
- Development IP: Add your home/office IP
- Server IP: Add Vercel/deployment IP
- Team IPs: Add team member IPs

#### Step 3: Verify
1. Test your application still works
2. Try accessing from a different IP (should fail)
3. Return to Security Advisor - finding should be resolved

---

## Issue 5: Implement Password Complexity

### Problem
Passwords may not have complexity requirements.

### Impact
- **Severity**: Low
- **Security Risk**: Weak passwords are easier to crack

### Solution

#### Step 1: Configure Password Settings
1. Go to Supabase Dashboard > Authentication > Settings
2. Scroll to "Password"
3. Configure:
   - **Minimum length**: 8
   - **Require uppercase**: Yes
   - **Require lowercase**: Yes
   - **Require numbers**: Yes
   - **Require special characters**: Yes (optional)
4. Click "Save"

#### Step 2: Verify
1. Try creating a new account with a weak password
2. It should be rejected
3. Create with a strong password - should work
4. Return to Security Advisor

---

## Testing After Security Changes

After making security changes, test your application:

### Test Checklist

- [ ] Can I log in?
- [ ] Can I create a new project?
- [ ] Can I edit my projects?
- [ ] Can I delete my projects?
- [ ] Do I only see my own data?
- [ ] Can't access other users' data?

### Running the Tests

```bash
# Run the development server
npm run dev

# Visit http://localhost:3000
# Test all features
```

---

## Monitoring Security

### Weekly Security Check
Set a reminder to check security weekly:

1. Run Security Advisor scan
2. Review findings
3. Address any new issues
4. Update documentation

### Monthly Tasks
- Review security logs
- Update security policies
- Rotate keys (every 90 days)
- Review user access

---

## Troubleshooting

### "My app stopped working after enabling RLS"

**Problem**: RLS blocked legitimate requests

**Solution**:
1. Check if policies are correct
2. Verify `user_id` column exists
3. Test with a simple policy first
4. Gradually add more restrictive policies

### "I can't access my database after network restrictions"

**Problem**: Your IP wasn't whitelisted

**Solution**:
1. Add your current IP to the whitelist
2. Check your IP at whatismyipaddress.com
3. Add a wildcard range if needed

### "Users can't register anymore"

**Problem**: Password requirements too strict

**Solution**:
1. Temporarily relax password requirements
2. Test the registration flow
3. Gradually increase requirements
4. Notify users of requirements

---

## Security Score Improvement Tracking

Track your improvements:

| Date | Security Score | Changes Made | Issues Resolved |
|------|---------------|--------------|-----------------|
| Day 1 | 65 | Initial scan | - |
| Day 2 | 75 | Enabled RLS | RLS-001 |
| Day 3 | 85 | Configured MFA | Auth-001 |
| Day 4 | 90 | Network restrictions | Net-001 |
| Day 5 | 95 | Final optimizations | - |

---

## Next Steps

1. ✅ Run initial Security Advisor scan
2. ⬜ Fix RLS issues (Issue 1)
3. ⬜ Test your application
4. ⬜ Fix MFA (Issue 2)
5. ⬜ Test your application
6. ⬜ Secure API keys (Issue 3)
7. ⬜ Test your application
8. ⬜ Configure network restrictions (Issue 4)
9. ⬜ Test your application
10. ⬜ Final security scan
11. ⬜ Celebrate your improved security! 🎉

---

## Getting Help

If you run into issues:

1. Check the Security Advisor for specific errors
2. Review Supabase documentation
3. Check application logs
4. Test in development first
5. Ask for help in the community

---

## Resources

- [Supabase Security Docs](https://supabase.com/docs/guides/platform/security)
- [RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [MFA Documentation](https://supabase.com/docs/guides/auth/auth-mfa)
- [Network Restrictions](https://supabase.com/docs/guides/platform/network-restrictions)

---

**Remember**: Security is a journey, not a destination. Regular checks and updates keep your application secure.

Good luck! 🚀🔒
