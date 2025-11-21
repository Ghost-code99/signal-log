# Responsive Testing Quick Reference

**Quick checklist for testing with Responsive Viewer**

---

## 🎯 Critical Pages (Test First)

| Page | URL | Why Important | Key Elements |
|------|-----|---------------|--------------|
| **Homepage** | `/` | Main entry point | Hero, navigation, CTA buttons, mobile menu |
| **Sign-Up** | `/sign-up` | First-time users | Clerk form, email/password inputs |
| **Sign-In** | `/sign-in` | Returning users | Clerk form, email/password inputs |
| **Onboarding** | `/onboarding` | New user flow | 3 screens, navigation, skip button |
| **Dashboard** | `/dashboard` | Main app | Stats cards, project grid, filters, forms |
| **Header** | All pages | Navigation | Mobile menu, UserButton, links |
| **Footer** | All pages | Feedback | Feedback trigger, links |

---

## 📋 All Pages to Test

### Public Pages
1. **Homepage** - `/` - Landing page, marketing content
2. **Contact** - `/contact` - Contact form

### Authentication Flow
3. **Sign-Up** - `/sign-up` - User registration form
4. **Sign-In** - `/sign-in` - User login form
5. **Onboarding** - `/onboarding` - 3-screen onboarding flow

### Protected Pages
6. **Dashboard** - `/dashboard` - Main app interface
7. **Project Detail** - `/dashboard/[id]` - Project detail view with tabs

### Feature Pages (AI Tools)
8. **Idea Capture** - `/idea-capture` - Form + AI response
9. **Assumption Challenger** - `/assumption-challenger` - Form + AI response
10. **Experiment Canvas** - `/experiment-canvas` - Form + AI response
11. **Project Health Scanner** - `/project-health-scanner` - Form + AI response
12. **Security Advisor** - `/security-advisor` - Form + AI response

### Utility Pages
13. **Design System** - `/design-system` - Component reference

### Shared Components
14. **Header/Navigation** - All pages - Mobile menu, navigation
15. **Footer** - All pages - Feedback trigger, links
16. **Feedback Modal** - All pages - Feedback form

---

## 📱 Device Configuration

- **iPhone:** 390px × 844px (Mobile)
- **iPad:** 820px × 1180px (Tablet)
- **MacBook:** 1440px × 900px (Desktop)

---

## ✅ Quick Test Checklist (Per Page)

**Layout:**
- [ ] No horizontal scrolling
- [ ] Content doesn't overflow
- [ ] Layout adapts correctly

**Typography:**
- [ ] Text readable (16px min on mobile)
- [ ] Headings clear

**Interactive:**
- [ ] Buttons tappable (44px min on mobile)
- [ ] Forms usable
- [ ] Links work

**Mobile-Specific:**
- [ ] Mobile menu works
- [ ] Touch targets adequate
- [ ] Keyboard doesn't cover inputs

---

## 🚀 Testing Order

1. **Start:** Homepage (`/`)
2. **Auth Flow:** Sign-up → Onboarding → Dashboard
3. **Main App:** Dashboard → Project Detail
4. **Components:** Header → Footer → Feedback Modal
5. **Features:** All AI tool pages
6. **Utility:** Design System

---

**Full checklist:** See `MOBILE_RESPONSIVE_TESTING_CHECKLIST.md`

