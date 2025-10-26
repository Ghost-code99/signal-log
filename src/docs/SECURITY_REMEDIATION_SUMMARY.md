# Security Remediation Quick Reference

## 🎯 Your Action Plan

Follow these steps to improve your security:

---

## Step 1: Access Security Advisor

```bash
# Start your dev server
npm run dev

# Visit in browser
http://localhost:3000/security-advisor
```

Click "Run Scan" to see your current security score.

---

## Step 2: Fix Issues (Priority Order)

### ⚠️ CRITICAL (Do First)

#### 1. Enable Row Level Security (RLS)
**Time**: 15 minutes | **Impact**: High

**Steps**:
1. Supabase Dashboard → Table Editor
2. For each table: Enable RLS
3. Create policies: `auth.uid() = user_id`
4. Test your app still works
5. Re-run Security Advisor scan

**Test**: Try accessing another user's data (should fail)

---

### ⚠️ HIGH PRIORITY

#### 2. Secure API Keys
**Time**: 5 minutes | **Impact**: High

**Steps**:
1. Check `.env.local` exists
2. Verify `.gitignore` includes `.env.local`
3. Run: `git log --all -S "your-key"` (check for exposed keys)
4. If found: Rotate keys in Supabase dashboard

**Test**: `npm run security-check`

---

#### 3. Network Restrictions
**Time**: 10 minutes | **Impact**: Medium-High

**Steps**:
1. Supabase Dashboard → Settings → Network Restrictions
2. Enable "Restrict connections"
3. Add your IP address
4. Test your app

**Test**: App should work from your IP, fail from others

---

### ⚠️ MEDIUM PRIORITY

#### 4. Enable Multi-Factor Authentication (MFA)
**Time**: 20 minutes | **Impact**: Medium

**Steps**:
1. Supabase Dashboard → Authentication → Settings
2. Enable MFA
3. (Optional) Add MFA setup UI to your app
4. Test user registration

**Test**: Users should be prompted for MFA setup

---

#### 5. Password Complexity
**Time**: 5 minutes | **Impact**: Medium

**Steps**:
1. Supabase Dashboard → Authentication → Settings
2. Configure password requirements
3. Test weak password (should fail)
4. Test strong password (should work)

**Test**: Registration with weak password should fail

---

## Step 3: Verify Each Fix

After each fix:

1. ✅ Run Security Advisor scan
2. ✅ Check security score improved
3. ✅ Test your application still works
4. ✅ Document the change

---

## Step 4: Test Your Application

After all fixes:

```bash
# Full application test
✅ Can I log in?
✅ Can I create projects?
✅ Can I edit projects?
✅ Can I delete projects?
✅ Do I only see my data?
✅ Can't see other users' data?
```

---

## Quick Commands

```bash
# Run security checks
npm run security-check

# Start dev server
npm run dev

# Check for hardcoded keys
grep -r "eyJ" lib/ app/ components/

# Verify environment variables
cat .env.local
```

---

## Security Score Tracker

Track your improvement:

| Fix | Before | After | Status |
|-----|--------|-------|--------|
| RLS Enabled | 65 | 80 | ⬜ |
| API Keys Secure | 80 | 90 | ⬜ |
| Network Restrictions | 90 | 95 | ⬜ |
| MFA Enabled | 95 | 98 | ⬜ |
| Password Complexity | 98 | 100 | ⬜ |

---

## Common Issues & Fixes

### "RLS blocked my requests"
→ Check your policies: `auth.uid() = user_id`
→ Verify user is logged in
→ Check `user_id` column exists

### "Can't access database after network restrictions"
→ Add your current IP to whitelist
→ Check your IP: whatismyipaddress.com

### "Users can't register"
→ Relax password requirements temporarily
→ Test registration flow
→ Gradually increase requirements

---

## Weekly Security Routine

- [ ] Monday: Run Security Advisor scan
- [ ] Wednesday: Review security logs
- [ ] Friday: Check for new security advisories

---

## Emergency Response

**If keys were exposed:**

1. Rotate keys immediately (Supabase Dashboard)
2. Update `.env.local`
3. Update production environment variables
4. Revoke old key access
5. Review audit logs for unauthorized access

---

## Getting Help

1. Check Security Advisor findings
2. Review `docs/SECURITY_REMEDIATION_GUIDE.md`
3. Consult Supabase documentation
4. Ask in community forums

---

## Success Checklist

- [ ] Security score improved
- [ ] All critical issues resolved
- [ ] Application tested and working
- [ ] No hardcoded keys in code
- [ ] RLS policies active
- [ ] Network restrictions enabled
- [ ] MFA enabled
- [ ] Password requirements set

---

**Remember**: Security is ongoing. Check regularly! 🚀🔒
