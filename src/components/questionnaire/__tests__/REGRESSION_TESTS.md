# Regression Test Suite - Ensure Nothing Breaks

## Overview
This test suite validates that all existing functionality remains intact after implementing Phase 4 (Database Integration & State Management).

---

## Section 1: Existing Flow Paths (15 min)

### Test 1.1: Website Analysis Path
**Status:** Must remain functional

**Steps:**
1. From landing page, click "Get Started"
2. Complete auth flow
3. Complete team profile creation
4. Select "Analyze Website" method
5. Enter test URL: "https://example.com"
6. Click "Analyze Website"

**✅ Expected:**
- Website analysis spinner appears
- Mock data loads after ~2.5 seconds
- Review page displays with:
  - Mock packages (Bronze, Silver, Gold)
  - Mock placements
  - Source shows "website"
- No console errors
- Flow completes normally

---

### Test 1.2: PDF Upload Path
**Status:** Must remain functional

**Steps:**
1. Navigate to "Upload PDF" method
2. Select test PDF file
3. Upload file

**✅ Expected:**
- File uploads successfully
- PDF analysis progress screen shows
- Database record created with `analysis_status = 'pending'`
- Edge function invoked
- Analysis completes or times out gracefully
- Review page displays extracted data
- No blocking errors

**Check Edge Function:**
```sql
SELECT id, analysis_status, title, source 
FROM sponsorship_offers 
WHERE source = 'pdf' 
ORDER BY created_at DESC LIMIT 1;
```

---

### Test 1.3: Old Manual Form (if still used)
**Status:** Verify deprecation or functionality

**Steps:**
1. Check if `SponsorshipForm.tsx` is still accessible
2. If yes, test complete form flow
3. If deprecated, verify proper redirect to questionnaire

**✅ Expected:**
- Either works completely OR
- Properly deprecated with clear message

---

## Section 2: Navigation & Routing (10 min)

### Test 2.1: Back Button Navigation
**Steps:**
1. Complete questionnaire to Step 3
2. Click Back button
3. Verify Step 2 data intact
4. Click Back to Step 1
5. Click Continue through all steps
6. Verify data preserved

**✅ Expected:**
- Back button works at every step
- Data never lost
- Can proceed forward after going back
- No navigation errors

---

### Test 2.2: Browser Back/Forward Buttons
**Steps:**
1. Start questionnaire
2. Complete Step 1
3. Use browser back button
4. Use browser forward button

**✅ Expected:**
- Application handles browser navigation
- Data integrity maintained
- No crashes or blank screens

---

### Test 2.3: Direct URL Access
**Steps:**
1. Copy URL when on Step 3 of questionnaire
2. Open in new tab
3. Paste URL

**✅ Expected:**
- Redirects appropriately
- Doesn't break application state
- User lands on valid page

---

## Section 3: Authentication & User Management (10 min)

### Test 3.1: Unauthenticated User
**Steps:**
1. Sign out completely
2. Try to access questionnaire directly

**✅ Expected:**
- Redirected to auth or landing
- Error message displayed
- No crash or infinite loop

---

### Test 3.2: Session Timeout
**Steps:**
1. Start questionnaire
2. Wait for session to expire (or manually invalidate)
3. Try to continue

**✅ Expected:**
- Graceful error handling
- Prompted to re-authenticate
- Draft data preserved if possible

---

### Test 3.3: Account Switching
**Steps:**
1. User A starts questionnaire
2. Sign out
3. Sign in as User B
4. Navigate to questionnaire

**✅ Expected:**
- User B sees their own draft (not User A's)
- No data leakage between accounts
- RLS policies enforced

---

## Section 4: Profile & Team Management (10 min)

### Test 4.1: User Without Team Profile
**Steps:**
1. Create new account (no team profile)
2. Complete questionnaire

**✅ Expected:**
- Flow works without team profile
- `team_profile_id` is null
- No blocking errors
- User can still create offers

---

### Test 4.2: User With Team Profile
**Steps:**
1. User with existing team profile
2. Complete questionnaire

**✅ Expected:**
- Offer automatically linked to team profile
- `team_profile_id` populated
- No errors

---

### Test 4.3: Multiple Team Profiles
**Steps:**
1. User with 2+ team profiles
2. Complete questionnaire

**✅ Expected:**
- Uses most recent team profile
- Or prompts user to select (if implemented)
- No ambiguity errors

---

## Section 5: Review & Marketplace Pages (10 min)

### Test 5.1: Review Page Data Display
**Steps:**
1. Complete questionnaire
2. Arrive at review page

**✅ Expected:**
- All form data displayed accurately:
  - Fundraising goal formatted as currency
  - Impact tags shown
  - Player count visible
  - Duration displayed
  - All packages listed with details
  - Placements show as names (not IDs)
- Visual layout intact
- No rendering errors

---

### Test 5.2: Review Page Back Button
**Steps:**
1. From review page, click Back
2. Modify data
3. Return to review

**✅ Expected:**
- Returns to questionnaire (Step 5)
- Can edit packages
- Changes reflected on review page
- No data loss

---

### Test 5.3: Marketplace Navigation
**Steps:**
1. From review page, approve offer
2. Navigate to marketplace

**✅ Expected:**
- Marketplace loads
- Mock cards display
- No errors

---

## Section 6: UI Components & Styling (10 min)

### Test 6.1: Design System Integrity
**Steps:**
1. Navigate through entire questionnaire
2. Check all components

**✅ Expected:**
- All colors use semantic tokens
- No hardcoded colors (text-white, bg-black)
- Consistent styling
- Dark mode works (if applicable)
- Hover states functional
- Animations smooth

---

### Test 6.2: Responsive Design
**Steps:**
1. Test on mobile viewport (375px)
2. Test on tablet (768px)
3. Test on desktop (1440px)

**✅ Expected:**
- All steps responsive
- No horizontal scroll
- Touch targets adequate
- Sticky buttons accessible
- Layout doesn't break

---

### Test 6.3: Component Reusability
**Steps:**
1. Check that components used elsewhere still work:
   - Button
   - Input
   - Card
   - Badge
   - etc.

**✅ Expected:**
- No component regressions
- Styles consistent
- Props work correctly

---

## Section 7: Database Operations (10 min)

### Test 7.1: Existing Database Queries
**Steps:**
1. Test all database queries still work:
   - Placement options fetch
   - Team profile fetch
   - Sponsorship offers list
   - Package queries

**✅ Expected:**
- All queries execute
- Results formatted correctly
- No SQL errors
- RLS policies enforced

---

### Test 7.2: Edge Function Compatibility
**Steps:**
1. Upload PDF (triggers edge function)
2. Check edge function logs

**✅ Expected:**
- Edge function still works
- No conflicts with new code
- Database writes succeed
- Analysis completes

---

### Test 7.3: Database Migrations
**Steps:**
1. Review recent migrations
2. Verify no breaking changes
3. Check foreign keys intact

**✅ Expected:**
- All migrations applied
- No constraint violations
- Referential integrity maintained

---

## Section 8: Toast Notifications (5 min)

### Test 8.1: Success Toasts
**Steps:**
1. Trigger success scenarios:
   - Auto-save success
   - Custom placement added
   - Offer submitted

**✅ Expected:**
- Success toasts appear
- Clear messaging
- Proper styling
- Auto-dismiss works

---

### Test 8.2: Error Toasts
**Steps:**
1. Trigger error scenarios:
   - Network failure
   - Database error
   - Validation error

**✅ Expected:**
- Error toasts appear
- Descriptive messages
- Destructive variant styling
- Don't auto-dismiss (or long duration)

---

## Section 9: Performance (10 min)

### Test 9.1: Initial Load Time
**Steps:**
1. Clear cache
2. Navigate to questionnaire
3. Measure time to interactive

**✅ Expected:**
- < 2 seconds to first render
- < 3 seconds to interactive
- No long loading screens

---

### Test 9.2: Step Transitions
**Steps:**
1. Navigate through all 5 steps
2. Click Continue each time

**✅ Expected:**
- Instant transitions
- No lag or stuttering
- Smooth animations

---

### Test 9.3: Database Operations Speed
**Steps:**
1. Monitor network tab
2. Complete questionnaire

**✅ Expected:**
- Auto-save completes in < 500ms
- Placement fetch < 1 second
- Final submission < 5 seconds

---

## Section 10: Error Handling (10 min)

### Test 10.1: Network Errors
**Steps:**
1. Test with intermittent network
2. Toggle offline/online

**✅ Expected:**
- Graceful degradation
- Helpful error messages
- Recovery when back online
- No crashes

---

### Test 10.2: Database Errors
**Steps:**
1. Simulate database unavailable
2. Try to save progress

**✅ Expected:**
- Error caught
- User notified
- Can retry
- No data corruption

---

### Test 10.3: Invalid Data
**Steps:**
1. Try to submit invalid data
2. Manipulate form state

**✅ Expected:**
- Validation catches issues
- Clear error messages
- Cannot proceed with invalid data

---

## Section 11: Accessibility (10 min)

### Test 11.1: Keyboard Navigation
**Steps:**
1. Use only keyboard
2. Tab through entire flow

**✅ Expected:**
- All elements reachable
- Focus visible
- Logical tab order
- Can complete form

---

### Test 11.2: Screen Reader
**Steps:**
1. Enable screen reader
2. Navigate questionnaire

**✅ Expected:**
- Labels announced
- Errors announced
- Progress announced
- Understandable without visuals

---

### Test 11.3: Color Contrast
**Steps:**
1. Check all text/background combinations
2. Use contrast checker tool

**✅ Expected:**
- WCAG AA compliance
- Text readable
- Not relying solely on color

---

## Section 12: Browser Compatibility (10 min)

### Test on Multiple Browsers:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

**✅ Expected:**
- Consistent behavior across all
- No browser-specific bugs
- Polyfills working (if needed)

---

## Section 13: Console & Network Logs (5 min)

### Test 13.1: Console Cleanliness
**Steps:**
1. Complete entire flow
2. Monitor browser console

**✅ Expected:**
- No errors
- No warnings (except known ones)
- Helpful debug logs only
- No sensitive data logged

---

### Test 13.2: Network Efficiency
**Steps:**
1. Monitor network requests
2. Complete questionnaire

**✅ Expected:**
- No redundant requests
- Proper caching
- Efficient payload sizes
- No leaked API keys

---

## Section 14: Data Integrity (10 min)

### Test 14.1: Data Consistency
**Steps:**
1. Fill form with specific data
2. Submit
3. Query database
4. Check review page

**✅ Expected:**
- Database matches input
- Review page matches input
- No data loss
- No corruption

---

### Test 14.2: Special Characters
**Steps:**
1. Use special characters in inputs:
   - Emojis: "🏀 Basketball Team"
   - Symbols: "Team $$ Money"
   - Quotes: "Team "Champions""
   - Apostrophes: "Coach's Choice"

**✅ Expected:**
- All characters saved correctly
- No escaping issues
- Display correctly
- No SQL injection vulnerabilities

---

### Test 14.3: Edge Cases
**Steps:**
1. Test boundary values:
   - Goal: $0.01 (minimum)
   - Goal: $999,999,999 (maximum)
   - Players: 1 (minimum)
   - Players: 10000 (large number)
   - Empty optional fields

**✅ Expected:**
- All boundaries handled
- Validation works
- No crashes
- Sensible defaults

---

## Quick Smoke Test (5 min)

For rapid verification, run this quick test:

1. ✅ Start questionnaire
2. ✅ Complete Step 1
3. ✅ Auto-save works (see indicator)
4. ✅ Navigate to Step 5
5. ✅ Add custom placement
6. ✅ Submit offer
7. ✅ Review page loads
8. ✅ Database record created
9. ✅ No console errors
10. ✅ All existing paths still accessible

If all pass: Basic integrity maintained ✓

---

## Critical Path Test (10 min)

Must pass before deployment:

1. ✅ Auth works
2. ✅ Questionnaire initializes
3. ✅ All 5 steps load
4. ✅ Validation works
5. ✅ Auto-save functions
6. ✅ Custom placements save
7. ✅ Final submission creates:
   - Published offer
   - Correct packages
   - All placements
8. ✅ Review page displays data
9. ✅ No data leakage between users
10. ✅ RLS policies enforced

---

## Regression Test Summary

Total sections: 14
Total tests: 60+
Estimated time: **2-3 hours for complete suite**

### Automated Testing Recommendations

Consider automating:
- Navigation flows
- Form validation
- Database operations
- API calls
- Component rendering

Tools:
- Jest for unit tests
- React Testing Library for component tests
- Cypress/Playwright for E2E tests

---

## Sign-Off Checklist

Before considering Phase 4 complete:

- [ ] All regression tests passed
- [ ] No existing functionality broken
- [ ] Performance acceptable
- [ ] Security validated
- [ ] Accessibility maintained
- [ ] Cross-browser compatibility confirmed
- [ ] Database integrity verified
- [ ] Error handling robust
- [ ] User experience smooth
- [ ] Documentation updated

## Result

If all tests pass: 
✅ **Phase 4 implementation is SAFE and ready for production!**

If any test fails:
⚠️ Fix issues before proceeding
