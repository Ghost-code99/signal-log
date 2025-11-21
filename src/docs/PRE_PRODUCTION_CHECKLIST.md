# Pre-Production Verification Checklist

**Verify your user-feedback branch is ready for production**

---

## Overview

Before merging to production, verify:
1. ✅ TypeScript type checking passes
2. ✅ ESLint code quality checks pass
3. ✅ Production build succeeds
4. ✅ All errors fixed

---

## Step 1: TypeScript Type Checking

### Run Type Check

```bash
npm run type-check
```

**What this does:**
- Runs `tsc --noEmit` (TypeScript compiler without generating files)
- Checks all `.ts` and `.tsx` files for type errors
- Validates imports, types, interfaces, etc.

### What to Look For

**✅ Success:**
```
No output (or "Found 0 errors")
```

**❌ Errors:**
```
error TS2307: Cannot find module '@/lib/supabase-service'
error TS2345: Argument of type 'string' is not assignable to parameter of type 'number'
```

### Common TypeScript Errors

1. **Missing imports:**
   - Fix: Add missing import statements
   - Example: `import { createSupabaseServiceClient } from '@/lib/supabase-service';`

2. **Type mismatches:**
   - Fix: Correct the type or add type assertion
   - Example: `const count: number = parseInt(value, 10);`

3. **Undefined properties:**
   - Fix: Add optional chaining or type guards
   - Example: `body.userId?.trim() || ''`

4. **Missing type definitions:**
   - Fix: Install `@types/package-name` or add type definitions

---

## Step 2: ESLint Code Quality Checks

### Run Linter

```bash
npm run lint
```

**What this does:**
- Runs ESLint on all `.js`, `.jsx`, `.ts`, `.tsx` files
- Checks code quality, best practices, potential bugs
- Validates Next.js-specific rules

### What to Look For

**✅ Success:**
```
✔ No ESLint warnings or errors
```

**❌ Errors:**
```
✖ 3 problems (2 errors, 1 warning)
  app/api/webhooks/n8n/feedback/route.ts
    15:5  error  'unusedVariable' is assigned a value but never used
    20:3  warning  Unexpected console.log statement
```

### Common ESLint Errors

1. **Unused variables:**
   - Fix: Remove unused variables or prefix with `_`
   - Example: `const _unused = value;`

2. **Console statements:**
   - Fix: Remove or use proper logging
   - Note: Console.log is OK for webhook logging (we're using it intentionally)

3. **Missing dependencies in useEffect:**
   - Fix: Add missing dependencies to dependency array
   - Example: `useEffect(() => {...}, [dependency]);`

4. **Unsafe any types:**
   - Fix: Add proper type annotations
   - Example: `const data: FeedbackData = ...`

### Auto-Fix Issues

Many ESLint issues can be auto-fixed:

```bash
npm run lint:fix
```

**Note:** Review changes before committing!

---

## Step 3: Production Build

### Run Production Build

```bash
npm run build
```

**What this does:**
- Runs Next.js production build
- Compiles all TypeScript/JavaScript
- Optimizes code, images, and assets
- Generates static pages
- Catches build-time errors

### What to Look For

**✅ Success:**
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages
✓ Finalizing page optimization

Route (app)                              Size     First Load JS
┌ ○ /                                    5.2 kB          85 kB
└ ○ /api/webhooks/n8n/feedback          0 B             85 kB
...
```

**❌ Errors:**
```
✗ Error occurred while generating the page
  ./app/api/webhooks/n8n/feedback/route.ts
  Module not found: Can't resolve '@/lib/supabase-service'
```

### Common Build Errors

1. **Module not found:**
   - Fix: Check import paths, verify file exists
   - Example: `@/lib/supabase-service` → verify file exists at `src/lib/supabase-service.ts`

2. **Syntax errors:**
   - Fix: Check for missing brackets, quotes, etc.
   - Run `npm run lint` to catch syntax issues

3. **Environment variable issues:**
   - Fix: Ensure all required env vars are documented
   - Build will fail if code references undefined env vars

4. **Type errors (caught during build):**
   - Fix: Same as TypeScript errors from Step 1

---

## Step 4: Fix Any Errors Found

### Error Resolution Workflow

1. **Run all checks:**
   ```bash
   npm run type-check
   npm run lint
   npm run build
   ```

2. **Fix errors one by one:**
   - Start with TypeScript errors (most critical)
   - Then fix ESLint errors
   - Finally fix build errors

3. **Re-run checks after fixes:**
   ```bash
   npm run type-check && npm run lint && npm run build
   ```

4. **Verify fixes:**
   - All checks should pass
   - No new errors introduced

---

## Step 5: Final Verification

### Complete Checklist

Before merging, verify:

- [ ] **TypeScript:** `npm run type-check` passes (0 errors)
- [ ] **ESLint:** `npm run lint` passes (0 errors, warnings OK)
- [ ] **Build:** `npm run build` succeeds
- [ ] **All files committed:** `git status` shows clean working directory
- [ ] **Environment variables:** Documented in `.env.example` or docs
- [ ] **Tests pass:** `npm run test` (if applicable)
- [ ] **Code reviewed:** Self-review or peer review completed

### Quick Verification Command

Run all checks at once:

```bash
npm run type-check && npm run lint && npm run build
```

**Expected output:**
- TypeScript: No errors
- ESLint: No errors
- Build: Compiled successfully

---

## Troubleshooting

### Issue: TypeScript errors in node_modules

**Solution:**
- These are usually safe to ignore
- Check `tsconfig.json` has `"skipLibCheck": true` (it does)

### Issue: ESLint errors in generated files

**Solution:**
- Check `.eslintignore` or `eslint.config.mjs` ignores:
  - `node_modules/**`
  - `.next/**`
  - `out/**`

### Issue: Build fails but dev works

**Possible causes:**
- Missing environment variables
- Import paths incorrect
- Type errors only caught in strict build mode

**Solution:**
- Check build error message carefully
- Verify all imports use correct paths
- Ensure env vars are documented (not required for build, but code should handle missing vars)

### Issue: "Cannot find module" errors

**Solution:**
1. Verify file exists at the path
2. Check import path is correct (use `@/` for src/)
3. Restart TypeScript server in your editor
4. Delete `.next` folder and rebuild: `rm -rf .next && npm run build`

---

## Pre-Merge Checklist

Before merging `user-feedback` branch to main:

- [ ] All TypeScript errors fixed
- [ ] All ESLint errors fixed (warnings OK)
- [ ] Production build succeeds
- [ ] All new files committed
- [ ] Environment variables documented
- [ ] Migration files applied to production Supabase
- [ ] n8n workflow tested and working
- [ ] Webhook endpoint tested on preview deployment
- [ ] Documentation updated (if needed)

---

## Next Steps After Verification

Once all checks pass:

1. **Commit any fixes:**
   ```bash
   git add .
   git commit -m "fix: resolve TypeScript/ESLint/build errors"
   ```

2. **Push to branch:**
   ```bash
   git push origin user-feedback
   ```

3. **Create Pull Request:**
   - Review changes
   - Get approval
   - Merge to main

4. **Deploy to production:**
   - Vercel will auto-deploy on merge
   - Verify deployment succeeds
   - Test in production

---

**Ready to verify?** Run the commands above and fix any errors found! 🚀

