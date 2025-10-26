# Quick Security Fixes for Score 48/100

## Current Status: 48/100 ⚠️ NEEDS IMMEDIATE ACTION

Your security score is low. Follow these steps to improve it.

## 🚀 Quick Wins (Do These First)

### 1. Enable Row Level Security (RLS) - **CRITICAL** [+15-20 points]
**Time**: 15 minutes  
**Impact**: Highest security improvement

**Steps**:
1. Go to https://supabase.com/dashboard
2. Select your project
3. Click "Table Editor" in left sidebar
4. For EACH table (projects, ideas, assumptions):
   - Click on the table name
   - Find the "RLS" toggle
   - Enable "Row Level Security"
   - Click "New Policy"
   - Policy name: "Users can access own data"
   - Allowed operation: SELECT, INSERT, UPDATE, DELETE
   - Policy expression: `auth.uid() = user_id`
   - Save the policy

**Test**: After enabling, users should only see their own data.

---

### 2. Secure API Keys - **HIGH** [+8-10 points]
**Time**: 5 minutes

**Steps**:
1. Check `.env.local` exists in project root
2. Verify it contains:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
   SUPABASE_SERVICE_ROLE_KEY=your_key
   ```
3. Confirm `.gitignore` includes `.env.local`
4. If keys were committed to git:
   - Rotate keys in Supabase Dashboard > Settings > API
   - Update `.env.local` with new keys

**Test**: Run `git log` to check no keys are in history.

---

### 3. Enable Multi-Factor Authentication (MFA) - **MEDIUM** [+5-8 points]
**Time**: 20 minutes

**Steps**:
1. Go to Supabase Dashboard
2. Click "Authentication" > "Settings"
3. Scroll to "Multi-Factor Authentication"
4. Toggle "Enable MFA" to ON
5. Save changes

**Test**: Try creating a new account - should see MFA setup option.

---

### 4. Configure Network Restrictions - **MEDIUM** [+3-5 points]
**Time**: 10 minutes

**Steps**:
1. Go to Supabase Dashboard > Settings
2. Click "Network Restrictions"
3. Enable "Restrict connections"
4. Add your current IP address
   - Find your IP: https://whatismyipaddress.com
5. Save changes

**Test**: App should work from your IP, fail from others.

---

### 5. Set Password Complexity Requirements - **LOW** [+2-3 points]
**Time**: 5 minutes

**Steps**:
1. Go to Supabase Dashboard > Authentication > Settings
2. Scroll to "Password"
3. Configure:
   - Minimum length: 8
   - Require uppercase: Yes
   - Require lowercase: Yes
   - Require numbers: Yes
4. Save changes

**Test**: Try weak password (should fail).

---

## 📊 Expected Score Progression

| Fix | Before | After | Improvement |
|-----|--------|-------|-------------|
| Current | 48 | 48 | - |
| + RLS | 48 | 68 | +20 |
| + API Keys | 68 | 76 | +8 |
| + MFA | 76 | 84 | +8 |
| + Network | 84 | 88 | +4 |
| + Passwords | 88 | 90 | +2 |
| **Final** | **48** | **90** | **+42** |

---

## ⏱️ Time Investment

- RLS: 15 minutes
- API Keys: 5 minutes
- MFA: 20 minutes
- Network: 10 minutes
- Passwords: 5 minutes
- **Total: 55 minutes** ⏱️

**Result: Go from 48 to 90/100** 🎯

---

## ✅ Checklist

After each fix, check your score at:
http://localhost:3001/security-advisor

- [ ] RLS enabled on all tables
- [ ] API keys secured in .env.local
- [ ] MFA enabled in auth settings
- [ ] Network restrictions configured
- [ ] Password complexity set
- [ ] Score improved to 85+

---

## 🆘 Need Help?

See detailed guides:
- Full Guide: `docs/SECURITY_REMEDIATION_GUIDE.md`
- Quick Ref: `docs/SECURITY_REMEDIATION_SUMMARY.md`

---

**Start with RLS - it's your biggest win!** 🚀
