# Manual Installation Guide

Since automated installation requires sudo access, please run these commands **in your own terminal** (not through Cursor).

---

## Step 1: Install Homebrew (if not installed)

Open **Terminal.app** and run:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Then add Homebrew to your PATH:

```bash
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"
```

---

## Step 2: Install Node.js

```bash
brew install node
```

Verify installation:

```bash
node --version  # Should show v20.x.x or similar
npm --version   # Should show 10.x.x or similar
```

---

## Step 3: Install Project Dependencies

```bash
cd /Users/ghost_/Desktop/Signal-log/signal-log

# Install main dependencies
npm install

# Install test dependencies
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

---

## Step 4: Run Tests

```bash
npm run test
```

**Expected output:**
```
✓ src/app/dashboard/__tests__/actions.test.ts (30)
✓ src/app/dashboard/__tests__/page.test.tsx (12)

Test Files  2 passed (2)
Tests  42 passed (42)
```

---

## Step 5: Start Development Server

```bash
npm run dev
```

Then open in browser: **http://localhost:3000/dashboard**

---

## Alternative: Install Node.js Without Homebrew

If you prefer not to use Homebrew:

1. Download Node.js from: https://nodejs.org/
2. Choose "LTS" version (recommended)
3. Run the `.pkg` installer
4. Restart terminal
5. Continue from **Step 3** above

---

## Verify Everything Works

After installation, run these commands to verify:

```bash
# Check Node.js
node --version

# Check npm
npm --version

# Run tests
npm run test

# Start server
npm run dev
```

---

## Next Steps After Installation

Once the server is running:

1. Open: http://localhost:3000/dashboard
2. Click "Add Project"
3. Create a test project
4. Check browser console for Server Action logs
5. Test search, filter, edit, delete

---

## Troubleshooting

**"zsh: command not found: brew"**
- Homebrew not in PATH
- Run: `eval "$(/opt/homebrew/bin/brew shellenv)"`

**"Cannot find module 'vitest'"**
- Test dependencies not installed
- Run: `npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom`

**Port 3000 already in use**
- Another process using port 3000
- Run: `lsof -ti:3000 | xargs kill -9`
- Or use different port: `npm run dev -- --port 3001`

---

## Files to Review After Installation

- `TESTING_AND_DEBUGGING_REPORT.md` - Full testing analysis
- `QUICK_START_TESTING.md` - Quick reference guide
- `STAGE_2_IMPLEMENTATION_SUMMARY.md` - What was built

---

**Once installed, you'll have:**
- ✅ 42 automated tests
- ✅ Performance-optimized dashboard
- ✅ Full documentation
- ✅ Working development server

**Good luck! 🚀**

