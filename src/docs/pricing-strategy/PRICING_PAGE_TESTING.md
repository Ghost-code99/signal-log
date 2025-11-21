# Pricing Page Testing Checklist

**Complete testing guide for the pricing page**

**File:** `src/app/pricing/page.tsx`  
**URL:** `/pricing`

---

## Pre-Testing Checklist

Before testing, ensure:
- [ ] Clerk Billing is enabled in dashboard
- [ ] Plans are created in Clerk (Starter, Professional, Strategic)
- [ ] Plans are active/published
- [ ] Stripe is connected to Clerk
- [ ] Test mode is enabled in Stripe

---

## 1. Page Load Test

### Desktop Test

1. **Navigate to:** `http://localhost:3000/pricing`
2. **Check:**
   - [ ] Page loads without errors
   - [ ] No console errors
   - [ ] All sections visible
   - [ ] Hero section displays correctly
   - [ ] PricingTable component renders

### Mobile Test

1. **Resize browser to mobile (375px)**
2. **Check:**
   - [ ] Page loads correctly
   - [ ] No horizontal scrolling
   - [ ] Text is readable
   - [ ] Buttons are tappable (min 44px)

---

## 2. PricingTable Component Test

### Verify Plans Display

**Check:**
- [ ] All 3 plans appear (Starter, Professional, Strategic)
- [ ] Plan names match Clerk dashboard
- [ ] Prices are correct ($49, $99, $149)
- [ ] Trial periods shown (14 days on Professional)
- [ ] "Subscribe" or "Start Free Trial" buttons visible
- [ ] Professional plan highlighted as "Most Popular" (if configured)

### Verify Plan Details

**For each plan, check:**
- [ ] Plan name is correct
- [ ] Price is correct
- [ ] Billing interval shown (Monthly)
- [ ] Trial period shown (if applicable)
- [ ] Features list appears (if configured in Clerk)
- [ ] CTA button is visible and clickable

### If Plans Don't Appear

**Troubleshooting:**
1. Check Clerk dashboard → Billing → Plans
2. Verify plans are active/published
3. Check browser console for errors
4. Verify Stripe connection
5. Check Clerk environment (test vs production)

---

## 3. Subscription Flow Test

### Test Subscription (Each Plan)

**For Starter Plan:**
1. Click "Subscribe" or "Start Free Trial"
2. Should redirect to Clerk checkout
3. Complete checkout with test card: `4242 4242 4242 4242`
4. Verify subscription created in Clerk dashboard

**For Professional Plan:**
1. Click "Start Free Trial" (should show 14-day trial)
2. Should redirect to Clerk checkout
3. Complete checkout (no payment during trial)
4. Verify subscription created with trial status

**For Strategic Plan:**
1. Click "Subscribe" or "Start Free Trial"
2. Should redirect to Clerk checkout
3. Complete checkout with test card
4. Verify subscription created

### Expected Behavior

**Checkout Flow:**
- [ ] Redirects to Clerk checkout page
- [ ] Shows correct plan details
- [ ] Shows correct price
- [ ] Shows trial period (if applicable)
- [ ] Accepts test card
- [ ] Creates subscription successfully
- [ ] Redirects back to your app (or success page)

**Test Card:**
- Number: `4242 4242 4242 4242`
- Expiry: Any future date (e.g., `12/25`)
- CVC: Any 3 digits (e.g., `123`)
- ZIP: Any 5 digits (e.g., `12345`)

---

## 4. Mobile Responsiveness Test

### Test on Different Screen Sizes

**Mobile (375px):**
- [ ] Pricing tiers stack vertically or scroll horizontally
- [ ] Feature comparison table scrolls horizontally
- [ ] All text is readable
- [ ] Buttons are tappable (min 44px height)
- [ ] No horizontal scrolling on page
- [ ] Hero section looks good
- [ ] FAQ section is readable

**Tablet (768px):**
- [ ] Pricing tiers display in grid (2-3 columns)
- [ ] Feature comparison table fits
- [ ] All sections look good
- [ ] Spacing is appropriate

**Desktop (1024px+):**
- [ ] Pricing tiers display in 3 columns
- [ ] Feature comparison table fits
- [ ] All sections look good
- [ ] Maximum width is appropriate

### Test on Actual Devices (If Possible)

- [ ] iPhone (Safari)
- [ ] Android (Chrome)
- [ ] iPad (Safari)
- [ ] Desktop (Chrome, Firefox, Safari)

---

## 5. Styling & Design Test

### Visual Check

- [ ] Matches your design system
- [ ] Colors match theme (purple/pink gradient)
- [ ] Typography is consistent
- [ ] Spacing is appropriate
- [ ] Cards have proper shadows/borders
- [ ] Buttons match design system
- [ ] Badges display correctly

### Dark Mode Test (If Enabled)

- [ ] Switch to dark mode
- [ ] All sections look good
- [ ] Text is readable
- [ ] Colors are appropriate
- [ ] PricingTable component adapts (if Clerk supports it)

---

## 6. Content Test

### Verify Content Matches Pricing Strategy

**Hero Section:**
- [ ] Value proposition matches pricing strategy
- [ ] Key benefits listed (14-day trial, cancel anytime)
- [ ] Headline is compelling

**Value Proposition Section:**
- [ ] Benefits match pricing strategy
- [ ] Icons are appropriate
- [ ] Text is clear

**Feature Comparison:**
- [ ] Features match pricing strategy
- [ ] Professional tier highlighted
- [ ] Comparison is accurate

**FAQ Section:**
- [ ] Questions are relevant
- [ ] Answers match pricing strategy
- [ ] Answers are helpful

---

## 7. Navigation Test

### Header Link

- [ ] "Pricing" link appears in header
- [ ] Clicking link navigates to `/pricing`
- [ ] Link works on mobile menu

### Footer Link (If Added)

- [ ] "Pricing" link appears in footer
- [ ] Clicking link navigates to `/pricing`

### Internal Links

- [ ] "View Pricing Plans" button scrolls to pricing table
- [ ] All internal links work

---

## 8. Performance Test

### Load Time

- [ ] Page loads quickly (< 2 seconds)
- [ ] PricingTable loads without delay
- [ ] No layout shift (CLS)

### Console Errors

- [ ] No JavaScript errors
- [ ] No network errors
- [ ] No Clerk-related errors

---

## 9. Accessibility Test

### Basic Checks

- [ ] Page has proper heading hierarchy
- [ ] Images have alt text (if any)
- [ ] Buttons are keyboard accessible
- [ ] Links are keyboard accessible
- [ ] Color contrast is sufficient
- [ ] Focus states are visible

### Screen Reader Test (If Possible)

- [ ] Page structure is logical
- [ ] Content is readable
- [ ] Navigation is clear

---

## 10. Integration Test

### With Clerk

- [ ] PricingTable fetches plans from Clerk
- [ ] Checkout flow works
- [ ] Subscriptions are created
- [ ] User is redirected correctly

### With Your App

- [ ] Page fits with overall design
- [ ] Header/Footer display correctly
- [ ] Navigation works
- [ ] Theme switching works (if applicable)

---

## Common Issues & Solutions

### Issue: PricingTable Not Rendering

**Symptoms:**
- Blank space where table should be
- Console errors

**Solutions:**
- Check Clerk Billing is enabled
- Verify plans exist in Clerk
- Check import: `import { PricingTable } from '@clerk/nextjs';`
- Verify `for="user"` prop is set
- Check browser console for errors

### Issue: Plans Don't Match Clerk Dashboard

**Symptoms:**
- Wrong prices
- Wrong plan names
- Missing plans

**Solutions:**
- Verify plans in Clerk dashboard
- Check plan IDs match
- Ensure plans are active
- Clear browser cache
- Check Clerk environment

### Issue: Checkout Not Working

**Symptoms:**
- Clicking "Subscribe" does nothing
- Checkout page doesn't load
- Error messages

**Solutions:**
- Verify Stripe connection in Clerk
- Check test mode is enabled
- Verify webhook URL is set
- Check Clerk logs
- Test with different browser

### Issue: Mobile Layout Broken

**Symptoms:**
- Horizontal scrolling
- Overlapping elements
- Unreadable text

**Solutions:**
- Check responsive Tailwind classes
- Verify feature table has horizontal scroll
- Test on actual device
- Check viewport meta tag
- Verify container max-widths

---

## Test Results Template

**Date:** _______________

**Tester:** _______________

**Environment:** Test / Production

### Results

- [ ] Page loads correctly
- [ ] PricingTable displays plans
- [ ] Subscription flow works
- [ ] Mobile responsive
- [ ] Styling matches design
- [ ] Content is correct
- [ ] Navigation works
- [ ] Performance is good
- [ ] Accessibility is good
- [ ] Integration works

### Issues Found

1. _______________________________
2. _______________________________
3. _______________________________

### Notes

_______________________________
_______________________________

---

## Next Steps After Testing

1. **Fix any issues found**
2. **Deploy to production**
3. **Test in production environment**
4. **Monitor for errors**
5. **Prepare for Lesson 4** (webhook handling)

---

**For setup instructions, see:** `PRICING_PAGE_GUIDE.md`

