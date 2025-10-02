# Manual Testing Checklist

Use this checklist to manually verify the onboarding flow functionality.

## Pre-Testing Setup

- [ ] Clear browser cache and cookies
- [ ] Test in multiple browsers (Chrome, Firefox, Safari)
- [ ] Test on mobile device or emulator
- [ ] Have test PDF file ready (< 10MB)
- [ ] Ensure Supabase connection is working
- [ ] Check that edge functions are deployed

---

## Test 1: First-Time User Experience

### Setup
- [ ] Log in with new test account
- [ ] Navigate to `/team/onboarding`

### Profile Creation
- [ ] Verify "Create Profile" step displays
- [ ] Try submitting with empty required fields → Should show validation errors
- [ ] Fill in all required fields:
  - [ ] Team name
  - [ ] Sport
  - [ ] Location
  - [ ] Level of play
  - [ ] Competition scope
  - [ ] Organization status
  - [ ] At least one main value
- [ ] Add social media links (optional)
- [ ] Add follower counts (optional)
- [ ] Click "Continue" → Should proceed to profile review

### Profile Review
- [ ] Verify all entered data displays correctly
- [ ] Click edit on team name field
- [ ] Change value and save → Should update immediately
- [ ] Verify toast notification appears
- [ ] Try adding invalid URL to social field → Should show validation error
- [ ] Add a duplicate main value → Should prevent addition
- [ ] Remove a main value → Should update correctly
- [ ] Click "Approve Profile" → Should proceed to method selection

---

## Test 2: Questionnaire Flow

### Method Selection
- [ ] Verify three options displayed clearly
- [ ] Click "Fill out form" → Should start questionnaire

### Questionnaire Steps
- [ ] **Step 1: Fundraising Goal**
  - [ ] Enter invalid amount (0 or negative) → Should show error
  - [ ] Enter valid amount → Can proceed
  - [ ] Click back → Should return to method selection
  
- [ ] **Step 2: Impact Selection**
  - [ ] Select impact tags
  - [ ] Add custom tag if available
  - [ ] Proceed to next step
  
- [ ] **Step 3: Supported Players**
  - [ ] Enter number of players
  - [ ] Proceed to next step
  
- [ ] **Step 4: Duration**
  - [ ] Select duration option
  - [ ] Proceed to next step
  
- [ ] **Step 5: Package Builder**
  - [ ] Create at least one package
  - [ ] Set package name
  - [ ] Set package price
  - [ ] Select placements
  - [ ] Add benefits
  - [ ] Try creating package with missing data → Should prevent
  - [ ] Complete package creation

### Questionnaire Submission
- [ ] Submit questionnaire
- [ ] Loading state appears
- [ ] Redirected to review page

### Offer Review
- [ ] Verify all questionnaire data displays correctly
- [ ] Verify packages show with correct details
- [ ] Click "Launch Campaign" → Should publish offer
- [ ] Success toast appears
- [ ] Redirected to dashboard

---

## Test 3: PDF Upload Flow

### Upload Process
- [ ] Select "Upload PDF" option
- [ ] Try uploading non-PDF file → Should reject
- [ ] Try uploading file > 10MB → Should reject
- [ ] Upload valid PDF file
- [ ] Verify file name displays
- [ ] Click "Analyze PDF"

### Analysis Progress
- [ ] Progress bar advances
- [ ] Step indicators update
- [ ] Estimated time remaining counts down
- [ ] Analysis completes within reasonable time (< 2 minutes)
- [ ] OR timeout handling works if analysis takes too long

### Analysis Review
- [ ] Extracted data displays in review
- [ ] Packages are formatted correctly
- [ ] Placements are assigned
- [ ] Approve offer → Publishes successfully
- [ ] Navigate to dashboard

---

## Test 4: Returning User

### Setup
- [ ] Log in with account that has completed profile
- [ ] Navigate to `/team/onboarding`

### Expected Behavior
- [ ] Loading screen appears briefly
- [ ] User automatically redirected to `/team/dashboard`
- [ ] No profile creation steps shown

---

## Test 5: Error Handling

### Network Errors
- [ ] Disconnect internet
- [ ] Try to save profile → Should show error
- [ ] Reconnect internet
- [ ] Retry → Should work

### Authentication Errors
- [ ] Start onboarding flow
- [ ] Log out in another tab
- [ ] Try to continue flow → Should detect and redirect to auth

### Database Errors
- [ ] Test with invalid data
- [ ] Verify error messages are user-friendly
- [ ] Verify errors don't break the UI

---

## Test 6: Loading States

### Profile Loading
- [ ] Verify loading indicator during initial check
- [ ] Message is clear and informative
- [ ] Loading doesn't exceed 5 seconds

### Offer Loading
- [ ] After questionnaire, verify loading state
- [ ] Progress message updates
- [ ] Loading completes or shows error

### Publishing Loading
- [ ] Click "Launch Campaign"
- [ ] Loading state appears briefly
- [ ] Success feedback provided

---

## Test 7: Back Navigation

### Throughout Flow
- [ ] Test back button on each step
- [ ] Verify returns to correct previous step
- [ ] Verify data is preserved when going back
- [ ] Test browser back button behavior

---

## Test 8: Validation

### Profile Validation
- [ ] Empty team name → Error
- [ ] Empty sport → Error
- [ ] Empty location → Error
- [ ] No main values → Error
- [ ] Invalid Instagram URL → Error
- [ ] Invalid Facebook URL → Error
- [ ] Negative follower count → Error

### PDF Validation
- [ ] Wrong file type → Error
- [ ] Empty file → Error
- [ ] File too large → Error

### Offer Validation
- [ ] Zero fundraising goal → Error
- [ ] Missing duration → Error
- [ ] No packages → Error
- [ ] Package with no name → Error
- [ ] Package with zero price → Error
- [ ] Package with no benefits → Error

---

## Test 9: Accessibility

### Keyboard Navigation
- [ ] Tab through all form fields
- [ ] Press Enter to submit forms
- [ ] ESC to close modals if applicable
- [ ] Arrow keys work in dropdowns

### Screen Reader
- [ ] Form labels are read correctly
- [ ] Error messages are announced
- [ ] Loading states are announced
- [ ] Success messages are announced

---

## Test 10: Mobile Testing

### Responsive Layout
- [ ] All steps render correctly on mobile
- [ ] Text is readable without zooming
- [ ] Buttons are tap-able
- [ ] Forms are usable
- [ ] File upload works on mobile

### Mobile-Specific
- [ ] Touch gestures work
- [ ] No horizontal scrolling
- [ ] Bottom navigation accessible
- [ ] Modals fit screen

---

## Performance Testing

### Page Load Times
- [ ] Initial page load < 3 seconds
- [ ] Navigation between steps < 500ms
- [ ] Form submissions < 2 seconds
- [ ] PDF analysis starts within 5 seconds

### Resource Usage
- [ ] No memory leaks during flow
- [ ] No console errors
- [ ] Network requests are reasonable

---

## Post-Testing Verification

### Database Check
- [ ] Log into Supabase dashboard
- [ ] Verify `team_profiles` entry created correctly
- [ ] Verify `sponsorship_offers` entry created
- [ ] Verify `sponsorship_packages` linked correctly
- [ ] Verify `package_placements` linked correctly
- [ ] Verify all user_id references correct

### Dashboard Check
- [ ] Navigate to `/team/dashboard`
- [ ] Verify created offer displays
- [ ] Verify profile information accessible
- [ ] Verify all features work

---

## Issues Found

Document any issues discovered during testing:

| Issue # | Description | Severity | Steps to Reproduce | Status |
|---------|-------------|----------|-------------------|--------|
|         |             |          |                   |        |

**Severity Levels:**
- Critical: Blocks core functionality
- High: Major feature broken
- Medium: Minor feature issue
- Low: UI/UX polish
