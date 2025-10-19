# Quick Start: Testing & Debugging Guide

Get your dashboard tested and running in 5 minutes!

---

## Step 1: Install Node.js (Required)

You need Node.js to run the development server and tests.

### macOS (Using Homebrew):
```bash
brew install node
```

### macOS (Official Installer):
1. Download from: https://nodejs.org/
2. Choose "LTS" version (recommended)
3. Run the installer
4. Verify installation:
```bash
node --version  # Should show v18+ or v20+
npm --version   # Should show 9+ or 10+
```

---

## Step 2: Install Dependencies

```bash
cd /Users/ghost_/Desktop/Signal-log/signal-log
npm install
```

**Expected output:**
```
added 324 packages, and audited 325 packages in 15s
```

---

## Step 3: Add Test Scripts

Add these to your `package.json` (if not already there):

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

---

## Step 4: Install Test Dependencies

```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

---

## Step 5: Run Tests

```bash
# Run all tests once
npm run test

# Run tests in watch mode (auto re-run on changes)
npm run test:watch
```

**Expected output:**
```
✓ src/app/dashboard/__tests__/actions.test.ts (30)
✓ src/app/dashboard/__tests__/page.test.tsx (12)

Test Files  2 passed (2)
Tests  42 passed (42)
```

---

## Step 6: Start Development Server

```bash
npm run dev
```

**Open in browser:**
- Main Dashboard: http://localhost:3000/dashboard
- Homepage: http://localhost:3000

---

## Step 7: Manual Testing

### Test Server Actions:

**1. Create a Project:**
- Click "Add Project"
- Fill in: Name, Description, Status, Tags
- Click "Create Project"
- ✅ Project appears in grid

**2. Test Search (Debounced):**
- Type in search box
- Notice it waits ~300ms before filtering
- ✅ No lag when typing fast

**3. Test Edit:**
- Hover over project card
- Click edit icon
- Change status
- ✅ Changes save immediately

**4. Test Delete:**
- Click trash icon
- Confirm deletion
- ✅ Project removed

### Check Browser DevTools:

**Console Tab:**
```
[Server Action] createProject called: { name: "...", status: "..." }
[Server Action] Created project: project-1729...
```

**Network Tab:**
- Look for `/dashboard` requests
- ✅ No failed requests
- ✅ No duplicate calls

**Application → Local Storage:**
- `dashboard-projects` - Array of projects
- `project-activity` - Activity timeline
- ✅ Data persists after refresh

---

## Step 8: Apply Performance Optimizations

### Option A: Replace Current File
```bash
cd src/app/dashboard
mv page.tsx page.backup.tsx
mv page.optimized.tsx page.tsx
```

### Option B: Compare & Merge
```bash
# View differences
diff src/app/dashboard/page.tsx src/app/dashboard/page.optimized.tsx
```

Then manually apply optimizations:
1. Add `useDebounce` hook
2. Replace `useEffect` with `useMemo` for filtering
3. Wrap handlers in `useCallback`

---

## Troubleshooting

### "npm: command not found"
**Problem:** Node.js not installed or not in PATH

**Fix:**
```bash
# Check if Node.js is installed
which node

# If not found, install Node.js (see Step 1)
brew install node
```

---

### "Cannot find module 'vitest'"
**Problem:** Test dependencies not installed

**Fix:**
```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom
```

---

### Tests Fail with "ReferenceError: window is not defined"
**Problem:** jsdom environment not configured

**Fix:**
- Check `vitest.config.ts` has: `environment: 'jsdom'`
- Check `src/test/setup.ts` exists
- Restart test runner

---

### Port 3000 Already in Use
**Problem:** Another process using port 3000

**Fix:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
npm run dev -- --port 3001
```

---

## Quick Reference

### Commands
```bash
npm run dev          # Start dev server
npm run test         # Run tests once
npm run test:watch   # Run tests in watch mode
npm run build        # Build for production
```

### URLs
- Dashboard: http://localhost:3000/dashboard
- Idea Capture: http://localhost:3000/idea-capture
- Assumptions: http://localhost:3000/assumption-challenger
- Experiments: http://localhost:3000/experiment-canvas

### Files Created
```
src/
├── app/dashboard/
│   ├── __tests__/
│   │   ├── actions.test.ts      # 30 unit tests
│   │   └── page.test.tsx        # 12 UI tests
│   ├── page.tsx                 # Current implementation
│   └── page.optimized.tsx       # Performance-optimized version
├── test/
│   └── setup.ts                 # Test configuration
└── vitest.config.ts             # Vitest config
```

### Documentation
- `TESTING_AND_DEBUGGING_REPORT.md` - Full analysis
- `STAGE_2_IMPLEMENTATION_SUMMARY.md` - Implementation details
- `multi-project-dashboard-prd.md` - Product requirements

---

## Next Steps

After testing locally:

1. ✅ Verify all 42 tests pass
2. ✅ Manually test CRUD operations
3. ✅ Check DevTools for errors/warnings
4. ✅ Apply performance optimizations
5. ⚠️ Consider adding E2E tests (Playwright/Cypress)
6. ⚠️ Add error monitoring (Sentry/LogRocket)
7. ⚠️ Set up CI/CD pipeline for automated testing

---

**Questions or Issues?**

1. Check `TESTING_AND_DEBUGGING_REPORT.md` for detailed troubleshooting
2. Review test files for examples
3. Check console for specific error messages

**Happy Testing! 🚀**

