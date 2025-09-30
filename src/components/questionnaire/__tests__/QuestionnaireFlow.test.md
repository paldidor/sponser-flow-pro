# Questionnaire Flow - Visual & Functional Tests

## Test Checklist

### Step 1: Fundraising Goal
- [ ] **Quick select buttons work**
  - Click each suggested amount ($5k, $10k, $25k, $50k)
  - Verify the input field updates
  - Verify selected card has ring border and primary background

- [ ] **Custom input validation**
  - Enter nothing → Continue button disabled
  - Enter letters → Shows error message
  - Enter amount < $500 → Shows minimum error
  - Enter valid amount ≥ $500 → Continue button enabled
  - Shows formatted currency display

- [ ] **Visual feedback**
  - Icon displays correctly
  - Progress bar shows 20%
  - Tips section displays properly
  - Mobile responsive layout

- [ ] **Navigation**
  - Back button returns to Create Offer screen
  - Continue proceeds to Impact Selection (when valid)

---

### Step 2: Impact Selection
- [ ] **Predefined tags selection**
  - Click each tag (Scholarships, Travel, Equipment, etc.)
  - Tags toggle between selected/unselected state
  - Selected tags show checkmark icon
  - Selected tags have primary color styling

- [ ] **Custom impact area**
  - Type custom text → Add button enabled
  - Click Add or press Enter → Tag added to selection
  - Duplicate tags are prevented
  - Input clears after adding

- [ ] **Selected tags management**
  - All selected tags display in summary section
  - X button removes individual tags
  - Count updates correctly

- [ ] **Validation**
  - No tags selected → Continue disabled + helper message
  - At least one tag → Success message + Continue enabled

- [ ] **Navigation**
  - Back preserves Fundraising Goal data
  - Continue proceeds to Supported Players

---

### Step 3: Supported Players
- [ ] **Number input**
  - Only allows numeric input
  - Shows error for invalid numbers
  - Updates team size category dynamically
    - ≤15: "Small Squad"
    - 16-30: "Medium Team"
    - 31-50: "Large Team"
    - 50+: "Multi-Team Program"

- [ ] **Calculations display**
  - Cost per player calculated correctly ($10k ÷ players)
  - Total reach shows players × 4
  - Success badge appears for valid input

- [ ] **Visual feedback**
  - Input border changes color (error → primary)
  - Category badge displays
  - Metric cards show with proper styling

- [ ] **Navigation**
  - Back preserves Impact data
  - Continue proceeds to Duration (when valid)

---

### Step 4: Duration Selection
- [ ] **Radio button cards**
  - All 3 options display: Season, 1-year, Multi-year
  - Click anywhere on card to select
  - Only one can be selected at a time
  - Selected card shows ring, checkmark badge, and details

- [ ] **Visual states**
  - Icons change color when selected
  - Hover effect on unselected cards
  - Smooth transitions between states
  - Selected card has enhanced details section

- [ ] **Validation**
  - No selection → Continue disabled + helper message
  - Selection made → Tip section appears + Continue enabled

- [ ] **Navigation**
  - Back preserves Supported Players data
  - Continue proceeds to Package Builder

---

### Step 5: Package Builder
- [ ] **Database integration**
  - Placement options load from Supabase
  - Loading skeleton shows while fetching
  - Popular placements appear first
  - Categorized sections display correctly

- [ ] **Package creation**
  - Default package appears on load
  - "Add Another Package" button works
  - Package counter increments correctly
  - Each package has unique ID

- [ ] **Package fields**
  - Name input updates state
  - Price input accepts numbers only
  - $ icon displays in price field

- [ ] **Placement selection**
  - Popular placements in separate section
  - Category grouping works correctly
  - Click badge to toggle selection
  - Selected state visually distinct
  - Multiple placements can be selected
  - Selection count updates

- [ ] **Custom placements**
  - Input field for custom placement
  - Add button / Enter key creates placement
  - New placement saved to database
  - New placement immediately available for selection
  - Success toast appears
  - Input clears after adding

- [ ] **Package removal**
  - Remove button only shows when >1 package
  - Confirm removal works
  - Package removed from state

- [ ] **Validation**
  - Empty name → Continue disabled
  - Price = 0 → Continue disabled
  - No placements selected → Continue disabled
  - All fields valid → Continue enabled

- [ ] **Navigation**
  - Back preserves Duration data
  - Continue transforms data and proceeds to Review

---

### Cross-Step Tests
- [ ] **Progress indicator**
  - Shows correct step number (1-5)
  - Progress percentage accurate (20%, 40%, 60%, 80%, 100%)
  - Step label displays correctly

- [ ] **Data persistence**
  - Navigate forward through all steps
  - Navigate backward through all steps
  - Verify all data preserved in both directions

- [ ] **Mobile responsiveness**
  - All steps display properly on mobile viewport
  - Continue button sticky at bottom on mobile
  - Touch targets are adequate size
  - No horizontal scroll
  - Cards stack properly

- [ ] **Animations**
  - fade-in animation on step render
  - scale hover effects work
  - Transitions are smooth

---

### Integration Tests
- [ ] **Complete flow end-to-end**
  1. Start from "Answer Questions" selection
  2. Complete all 5 steps with valid data
  3. Verify data transformation in handleQuestionnaireComplete
  4. Confirm navigation to Sponsorship Review
  5. Verify review page displays all entered data

- [ ] **Error handling**
  - Network errors show toast notifications
  - Failed placement fetch handled gracefully
  - Database save errors display appropriately

- [ ] **Back navigation from Review**
  - "Back" from Review returns to Package Builder
  - All questionnaire data still intact
  - Can re-submit after editing

---

## Manual Testing Scenarios

### Scenario 1: Happy Path - Bronze Package
1. Select $5,000 goal (quick select)
2. Choose "Equipment" and "Travel" impact tags
3. Enter 20 players
4. Select "Season" duration
5. Create one package:
   - Name: "Bronze Supporter"
   - Price: $500
   - Placements: Website, Social Media
6. Continue to review

**Expected:** All data displays correctly in review page

---

### Scenario 2: Complex Multi-Package
1. Enter custom goal: $35,000
2. Add all predefined tags + custom "Coaching Staff"
3. Enter 45 players (Large Team)
4. Select "Multi-year" duration
5. Create 3 packages:
   - Package 1: Gold ($5000) - 5 placements
   - Package 2: Silver ($2500) - 3 placements
   - Package 3: Bronze ($1000) - 2 placements
   - Include custom placement "Stadium Banner"
6. Continue to review

**Expected:** Complex data structure preserved, custom placement saved

---

### Scenario 3: Validation & Error Recovery
1. Try to continue without filling fields
2. Verify all validation messages appear
3. Fill invalid data (letters in numbers)
4. Correct errors and proceed
5. Test back navigation preserves corrections

**Expected:** Smooth error recovery, no data loss

---

### Scenario 4: Mobile User Journey
1. Complete entire flow on mobile viewport
2. Test touch interactions
3. Verify sticky Continue button
4. Check readability and spacing

**Expected:** Excellent mobile UX

---

## Performance Checks
- [ ] Placement options load in < 1 second
- [ ] Step transitions are instant (no lag)
- [ ] No console errors or warnings
- [ ] No memory leaks on repeated navigation

---

## Accessibility
- [ ] All inputs have labels
- [ ] Focus states are visible
- [ ] Keyboard navigation works (Tab, Enter)
- [ ] Screen reader announcements make sense
- [ ] Color contrast meets WCAG AA standards

---

## Browser Compatibility
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Mobile Safari
- [ ] Mobile Chrome
