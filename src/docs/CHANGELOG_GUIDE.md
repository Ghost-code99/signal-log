# How to Add Changelog Entries

**Quick guide for documenting new features and updates**

---

## Format

Each changelog entry follows this structure:

```markdown
## v1.X - [Date]

### [Category Emoji] [Title]

[Description - what changed and why it matters to users]

#### What's New

- Feature 1
- Feature 2

#### Improvements

- Improvement 1
- Improvement 2

#### Bug Fixes

- Fixed issue X
```

---

## Categories

### New Feature 🎉
Something users can now do that they couldn't before.

**Example:**
```markdown
### 🎉 New Feature: Changelog Page

Users can now view all product updates in one place! We've added a public changelog page at `/changelog` where you can see what's new, what's improved, and what we've fixed.

**What's New:**
- Public changelog page at `/changelog`
- Version history with dates and descriptions
- Easy-to-read format with categories
```

### Bug Fix 🐛
Fixing something that was broken.

**Example:**
```markdown
### 🐛 Bug Fix: Feedback Form Last Name Validation

Fixed an issue where users without a last name in their Clerk profile couldn't submit feedback. The form now correctly handles optional last names.

**What's Fixed:**
- Users can now submit feedback even if they haven't set a last name
- Form validation updated to allow empty last names
```

### Improvement ✨
Making something better.

**Example:**
```markdown
### ✨ Improvement: Faster Dashboard Loading

We've optimized the dashboard to load 50% faster. Your projects now appear almost instantly!

**What's Better:**
- Reduced initial load time by 50%
- Optimized data fetching
- Smoother scrolling experience
```

### Security 🔒
Security-related updates.

**Example:**
```markdown
### 🔒 Security: Enhanced Webhook Verification

We've strengthened webhook signature verification to prevent unauthorized access. All webhook endpoints now use improved security measures.

**What's Secure:**
- Enhanced signature verification
- Additional security checks
- Improved error handling
```

---

## Writing Tips

### ✅ Do:
- **Focus on user value** - What can users do now?
- **Be specific** - "Added dark mode toggle" not "Updated UI"
- **Explain why** - Why does this matter to users?
- **Use clear language** - Avoid technical jargon
- **Include examples** - Show how to use new features

### ❌ Don't:
- Don't use technical details users don't need
- Don't say "we updated X" - say "you can now do Y"
- Don't be vague - be specific about what changed
- Don't forget the date - always include it

---

## Adding an Entry

1. **Open** `src/data/changelog.md`
2. **Add new entry** at the top (after the header, before v1.0)
3. **Use the format** above
4. **Increment version** (v1.1, v1.2, etc.)
5. **Add today's date**
6. **Commit** with your feature

---

## Example Entry Template

```markdown
## v1.1 - January 22, 2025

### 🎉 New Feature: [Feature Name]

[One sentence describing what users can now do and why it matters.]

**What's New:**
- Feature detail 1
- Feature detail 2

**How to Use:**
- Step 1
- Step 2

[Optional: Link to documentation or feature page]
```

---

## Quick Reference

- **File:** `src/data/changelog.md`
- **Location:** Top of file (newest first)
- **Format:** Markdown with version, date, title, description
- **Categories:** New Feature, Bug Fix, Improvement, Security
- **Commit:** Include changelog update with feature commit

---

**Need help?** Review existing entries in `src/data/changelog.md` for examples.

