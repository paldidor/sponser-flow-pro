# End-to-End Test Scenarios - Complete Questionnaire Flow

## Scenario 1: Youth Soccer Team - Bronze Package Only

### User Story:
Maria coaches a local youth soccer team with 20 players. They need basic sponsorships to cover uniforms and tournament fees. She wants to offer one simple sponsorship package.

### Test Steps:

**Step 1 - Fundraising Goal:**
1. Click "Quick Select" $5k button
2. Click Continue

**Step 2 - Impact Selection:**
1. Select: Equipment, Travel
2. Click Continue

**Step 3 - Supported Players:**
1. Type: 20
2. Verify shows "Medium Team"
3. Verify cost per player: $250
4. Click Continue

**Step 4 - Duration:**
1. Select "Season"
2. Click Continue

**Step 5 - Package Builder:**
1. Package 1:
   - Name: "Team Supporter"
   - Price: 500
   - Expand Popular
   - Select: Social Media, Website Logo
   - Expand Digital
   - Select: Email Newsletter
2. Click Continue

**Review Page:**
- Verify all data displays correctly
- Goal: $5,000
- Impact: Equipment, Travel
- Players: 20
- Duration: Season
- 1 package with 3 placements

### ✅ Success Criteria:
- Smooth navigation through all steps
- Data persists correctly
- Validation works at each step
- Review displays complete information

---

## Scenario 2: High School Basketball - Three-Tier Packages

### User Story:
Coach Johnson runs a competitive high school basketball program with 35 players. He wants to offer Bronze, Silver, and Gold packages with increasing visibility levels.

### Test Steps:

**Step 1 - Fundraising Goal:**
1. Type custom: 25000
2. Verify shows formatted: $25,000
3. Click Continue

**Step 2 - Impact Selection:**
1. Select: Scholarships, Equipment, Travel, Player Development
2. Add custom: "Coaching Resources"
3. Verify 5 tags selected
4. Click Continue

**Step 3 - Supported Players:**
1. Type: 35
2. Verify shows "Large Team"
3. Click Continue

**Step 4 - Duration:**
1. Select "1 Year"
2. Click Continue

**Step 5 - Package Builder:**

**Package 1 - Gold:**
- Name: "Gold Partner"
- Price: 5000
- Expand Popular
- Select all popular placements
- Expand Uniform
- Select: Home Jersey, Away Jersey
- Expand Facility
- Select: Court Banner, Entrance Sign

**Package 2 - Silver:**
- Click "Add Another Package"
- Name: "Silver Sponsor"
- Price: 2500
- Select from Popular: Website, Social Media
- Expand Uniform
- Select: Practice Jersey
- Expand Digital
- Select: Social Media Posts

**Package 3 - Bronze:**
- Add another package
- Name: "Bronze Supporter"
- Price: 1000
- Search "social"
- Select: Social Media
- Clear search
- Expand Digital
- Select: Website Listing
- Create custom: "Game Program Ad"
- Select the new custom placement

5. Click Continue

**Review Page:**
- Verify 3 distinct packages
- Verify each has correct placements
- Verify total potential: $8,500
- Verify custom placement displays

### ✅ Success Criteria:
- Multiple packages created independently
- Custom placement saved and used
- Search functionality works correctly
- All selections persist
- Validation passes

---

## Scenario 3: College Club Team - Multi-Year Campaign

### User Story:
Sarah manages a college ultimate frisbee club with 50 players. They're launching a multi-year fundraising campaign and want comprehensive sponsorship tiers.

### Test Steps:

**Step 1 - Fundraising Goal:**
1. Click "Advanced" quick select ($50k)
2. Click Continue

**Step 2 - Impact Selection:**
1. Select all predefined tags
2. Add custom tags:
   - "Tournament Entry Fees"
   - "Video Equipment"
   - "Training Camps"
3. Verify 9 total tags
4. Click Continue

**Step 3 - Supported Players:**
1. Type: 50
2. Verify shows "Multi-Team Program"
3. Verify cost per player: $1,000
4. Verify total reach: 200+
5. Click Continue

**Step 4 - Duration:**
1. Select "Multi Year"
2. Verify tip appears about long-term partnerships
3. Click Continue

**Step 5 - Package Builder:**

Test comprehensive search and categorization:

1. Type "jersey" in search
2. Verify only jersey-related placements show
3. Select 2 jersey placements
4. Clear search

**Package 1 - Platinum:**
- Name: "Platinum Sponsor"
- Price: 10000
- Select 10+ placements across all categories
- Mix popular + categorized

**Package 2 - Gold:**
- Add package
- Name: "Gold Sponsor"
- Price: 5000
- Select 6-8 placements
- Focus on digital + uniform

**Package 3 - Silver:**
- Add package
- Name: "Silver Sponsor"
- Price: 2500
- Select 4-5 placements
- Mix of categories

**Package 4 - Bronze:**
- Add package
- Name: "Bronze Supporter"
- Price: 1000
- Select 2-3 basic placements

**Test Navigation:**
1. Click Back button
2. Verify Duration step still shows "Multi Year"
3. Click Back again
4. Verify Supported Players shows 50
5. Click Continue through steps
6. Verify all package data preserved

6. Click Continue to Review

### ✅ Success Criteria:
- Complex multi-package structure works
- Search doesn't affect selections
- Back navigation preserves data
- Large selection counts handled
- Validation works across all packages

---

## Scenario 4: Error Recovery & Edge Cases

### Test Steps:

**Intentional Errors:**

**Step 1 - Fundraising Goal:**
1. Type: abc (letters)
2. Verify error message
3. Type: 100 (below minimum)
4. Verify error message
5. Type: 5000 (valid)
6. Continue

**Step 2 - Impact:**
1. Don't select anything
2. Try to continue
3. Verify button disabled
4. Select 1 tag
5. Continue

**Step 3 - Players:**
1. Leave empty
2. Verify cannot continue
3. Type: 0
4. Verify error
5. Type: 25
6. Continue

**Step 4 - Duration:**
1. Leave unselected
2. Verify cannot continue
3. Select any option
4. Continue

**Step 5 - Packages:**

**Test Validation:**
1. Leave all fields empty
2. Verify Continue disabled
3. Fill name only
4. Still disabled
5. Fill price: 0
6. Still disabled
7. Fill price: 1000
8. Still disabled (no placements)
9. Select 1 placement
10. Now enabled

**Test Package Removal:**
1. Try to remove last package
2. Verify remove button hidden
3. Add second package
4. Remove button appears
5. Can remove packages

**Test Search Edge Cases:**
1. Search: "zzzznotfound"
2. Verify no placements shown
3. Verify no errors
4. Clear search
5. All placements return

**Test Custom Placement:**
1. Try to add empty string
2. Verify button disabled
3. Type "Test Placement"
4. Add it
5. Try to add "Test Placement" again
6. Verify duplicate error
7. Add "Test Placement 2"
8. Success

11. Complete package and Continue

### ✅ Success Criteria:
- All validation catches errors
- Error messages clear and helpful
- User can recover from all errors
- No crashes or console errors
- Edge cases handled gracefully

---

## Scenario 5: Mobile User Journey

### Test Steps:

1. Switch to mobile viewport (375px width)
2. Complete entire questionnaire flow
3. Pay attention to:
   - Touch targets (easy to tap?)
   - Layout (no overflow?)
   - Sticky buttons (accessible?)
   - Keyboard (opens correctly?)
   - Scrolling (smooth?)

**Mobile-Specific Checks:**

**Step 1:**
- Numeric keyboard for goal input
- Quick select buttons touch-friendly

**Step 2:**
- Tags wrap properly
- Can tap to select
- Custom input + button side-by-side works

**Step 3:**
- Numeric keyboard for players
- Metric cards stack vertically

**Step 4:**
- Radio cards full width
- Easy to tap anywhere on card

**Step 5:**
- Name/Price fields stack
- Search bar full width
- Categories collapsible (saves space)
- Badges wrap nicely
- Can scroll through all placements
- Add button full width
- Continue button sticky at bottom

**Navigation:**
- Progress bar readable
- Back button accessible
- Continue button always reachable

### ✅ Success Criteria:
- Excellent mobile UX
- No pinch-zoom needed
- All features work on touch
- Comfortable tap targets
- Smooth interactions

---

## Scenario 6: Data Persistence & Navigation

### Test Steps:

1. Complete Steps 1-3 with specific data
2. At Step 4, click Back
3. Verify Step 3 data intact
4. Click Back to Step 2
5. Verify impact tags preserved
6. Click Back to Step 1
7. Verify goal amount preserved
8. Click Continue through all steps
9. Verify all data still correct
10. Complete to Step 5
11. Fill 2 packages completely
12. Click Back
13. Verify duration preserved
14. Click Continue
15. Verify both packages still complete
16. Click Continue to Review
17. Verify all data present

### ✅ Success Criteria:
- Zero data loss on navigation
- Back button works at every step
- Forward navigation preserves edits
- Complex data structures maintained
- Can edit and re-submit

---

## Scenario 7: Performance & Load Testing

### Test Steps:

**Large Dataset:**
1. Assume 100+ placement options exist
2. Load Package Builder step
3. Time how long to load
4. Test search performance
5. Test selection with many placements
6. Test multiple packages with many selections

**Multiple Operations:**
1. Create 5 packages
2. Fill all 5 completely
3. Select 10+ placements each
4. Test scrolling performance
5. Test validation speed
6. Remove packages
7. Add packages
8. Edit existing packages

**Browser Tab Switching:**
1. Fill form halfway
2. Switch browser tabs
3. Wait 5 minutes
4. Return to form
5. Verify state preserved
6. Continue filling
7. Submit successfully

### ✅ Success Criteria:
- Loads in < 2 seconds
- No lag during interactions
- Smooth with large datasets
- State survives tab switching
- Memory usage reasonable

---

## Scenario 8: Accessibility Full Test

### Test Steps:

**Keyboard Only:**
1. Start questionnaire
2. Use only Tab, Shift+Tab, Enter, Space
3. Navigate through all 5 steps
4. Complete entire flow without mouse

**Screen Reader Simulation:**
1. Enable screen reader (VoiceOver/NVDA)
2. Navigate through form
3. Verify all labels read
4. Verify validation messages announced
5. Verify success feedback announced

**Color Blind Mode:**
1. Use browser extension to simulate color blindness
2. Verify can still distinguish:
   - Selected vs unselected placements
   - Valid vs invalid states
   - Different package cards
3. Not relying solely on color

### ✅ Success Criteria:
- 100% keyboard accessible
- Screen reader friendly
- Color contrast meets WCAG AA
- Focus indicators always visible
- No keyboard traps

---

## Scenario 9: Integration with Review Page

### Test Steps:

1. Complete full questionnaire:
   - Goal: $15,000
   - Impact: Equipment, Travel, Scholarships
   - Players: 30
   - Duration: 1 Year
   - 3 packages with varied placements

2. Arrive at Review page

**Verify Display:**
- Fundraising goal: $15,000
- Impact shows as tags or description
- Player count: 30
- Duration: 1 Year
- All 3 packages listed with:
  - Name
  - Price
  - Placements (by name, not IDs)
  - Total potential calculated

3. Click Back from Review

**Verify:**
- Returns to Package Builder (Step 5)
- All packages still complete
- Can edit packages
- Can re-submit

4. Make an edit (change price)
5. Continue to Review again
6. Verify edit reflected

### ✅ Success Criteria:
- Data transformation correct
- Review displays human-readable data
- Can return and edit
- Edits propagate to review
- No data loss or corruption

---

## Scenario 10: Database Integration

### Test Steps:

**Custom Placements:**
1. Navigate to Package Builder
2. Create custom placement: "Stadium Jumbotron"
3. Note current timestamp
4. Complete and submit form
5. Refresh browser
6. Start new questionnaire
7. Navigate to Package Builder
8. Verify "Stadium Jumbotron" appears in Custom category
9. Verify it's selectable in new packages

**Placement Options Fetch:**
1. Open DevTools Network tab
2. Navigate to Package Builder
3. Verify query to `placement_options` table
4. Check query parameters:
   - Orders by is_popular DESC
   - Orders by category
   - Orders by name
5. Verify response structure

**Error Handling:**
1. Simulate network failure (DevTools offline mode)
2. Try to load Package Builder
3. Verify error toast
4. Verify graceful degradation
5. Re-enable network
6. Refresh
7. Verify recovery

### ✅ Success Criteria:
- Custom placements persist in database
- Placements load correctly on each session
- Proper query optimization
- Error handling robust
- No data corruption

---

## Summary

Total scenarios: 10
Estimated test time: 2-3 hours for complete suite

Each scenario tests different aspects:
1. Simple single-package flow
2. Multi-tier packages
3. Complex campaign with all features
4. Error handling & recovery
5. Mobile experience
6. Data persistence
7. Performance under load
8. Accessibility compliance
9. Integration with next step
10. Database operations

If all scenarios pass:
✅ Phase 3 is production-ready!
