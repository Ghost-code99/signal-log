# Pricing Page Quick Start

**Quick reference for the pricing page**

---

## File Location

**Pricing Page:** `src/app/pricing/page.tsx`  
**URL:** `/pricing`

---

## Clerk PricingTable

```typescript
import { PricingTable } from '@clerk/nextjs';

<PricingTable for="user" />
```

**That's it!** Clerk handles everything else.

---

## What You Need

**Before pricing page works:**
- [ ] Plans created in Clerk dashboard
- [ ] Plans are active/published
- [ ] Stripe connected to Clerk

**See:** `CLERK_BILLING_SETUP_GUIDE.md`

---

## Quick Test

1. **Visit:** `http://localhost:3000/pricing`
2. **Check:**
   - Plans appear
   - Click "Subscribe"
   - Redirects to Clerk checkout

---

## Test Card

- **Number:** `4242 4242 4242 4242`
- **Expiry:** Any future date
- **CVC:** Any 3 digits

---

## Navigation

**Pricing link added to header:**
- Desktop: Shows in navigation
- Mobile: Shows in mobile menu

---

## Page Sections

1. Hero - Value proposition
2. PricingTable - Clerk component
3. Value Props - Why choose us
4. Feature Comparison - Side-by-side
5. Trust Signals - ROI metrics
6. FAQ - Common questions
7. Final CTA - Call to action

---

## Mobile Responsive

- ✅ Pricing tiers stack on mobile
- ✅ Feature table scrolls horizontally
- ✅ All sections responsive
- ✅ Buttons tappable (44px min)

---

## Next Steps

1. **Test subscription flow**
2. **Verify mobile responsiveness**
3. **Prepare for Lesson 4** (webhooks)

---

**For details, see:** `PRICING_PAGE_GUIDE.md`

