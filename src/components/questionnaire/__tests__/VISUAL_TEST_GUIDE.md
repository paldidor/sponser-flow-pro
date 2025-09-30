# Visual Testing Guide - Phase 3: Advanced Placement Selection

## Quick Test Checklist
Follow these steps to visually verify all Phase 3 enhancements are working correctly.

---

## Test 1: Search & Filter (2 min)

### Steps:
1. Navigate to Package Builder step (Step 5)
2. Locate the search bar below "Select Placements" label
3. Click in the search bar
4. Type "social"

### ✅ Expected Results:
- Only placements with "social" in the name appear
- Popular section filters (if it has matching items)
- Category sections filter
- X clear button appears on right side of search
- Search is case-insensitive (try "SOCIAL")

### Steps (continued):
5. Click the X button to clear search

### ✅ Expected Results:
- All placements reappear
- Search input clears
- X button disappears

### Steps (continued):
6. Type "xyz123notfound"

### ✅ Expected Results:
- No placements shown in any section
- Categories may show empty or collapse
- No errors in console

---

## Test 2: Collapsible Categories (2 min)

### Steps:
1. Load Package Builder step
2. Observe the Popular Placements section

### ✅ Expected Results:
- Popular section has star icon
- Count badge shows number (e.g., "5")
- Section is auto-expanded (open by default)
- Background has light primary tint
- Primary border color

### Steps (continued):
3. Click the "Popular Placements" header

### ✅ Expected Results:
- Section collapses smoothly
- ChevronDown icon appears
- Placements hide

4. Click header again

### ✅ Expected Results:
- Section expands smoothly
- ChevronUp icon appears
- Placements reappear

### Steps (continued):
5. Scroll to categorized sections (Uniform, Facility, Digital, Events)
6. Click "Uniform & Apparel" header

### ✅ Expected Results:
- Section expands
- Shows Shirt icon
- ChevronUp icon appears
- Placements display in badges

7. Click "Digital & Online" header (don't close Uniform)

### ✅ Expected Results:
- Digital section expands
- Uniform section stays open
- Both sections visible simultaneously
- Smartphone icon visible

---

## Test 3: Visual Hierarchy & Icons (1 min)

### Verify Each Icon:
- Popular Placements: ⭐ Star icon
- Uniform & Apparel: 👕 Shirt icon
- Facility & Venue: 🏢 Building2 icon
- Digital & Online: 📱 Smartphone icon
- Events & Programs: 📅 Calendar icon
- Custom Placements: ✨ Sparkles icon

### Verify Styling:
- Popular section has light blue background
- Popular section has blue border
- Category sections have subtle grey border
- Icons are grey when collapsed
- Header has hover effect (background changes)

---

## Test 4: Placement Badge Selection (3 min)

### Steps:
1. Expand Popular Placements section
2. Click any unselected badge (e.g., "Website Logo")

### ✅ Expected Results:
- Badge changes from outline to filled (primary color)
- Checkmark icon appears on left
- Badge has subtle shadow
- Selection count updates at top

### Steps (continued):
3. Click the same badge again

### ✅ Expected Results:
- Badge returns to outline style
- Checkmark disappears
- Selection count decreases

### Steps (continued):
4. Click 5 different placement badges

### ✅ Expected Results:
- All 5 show as selected (primary color + checkmark)
- Selection count shows "5 selected"
- Badge at bottom shows "5 placements selected" with checkmark

### Steps (continued):
5. Hover over an unselected badge

### ✅ Expected Results:
- Badge scales up slightly (hover effect)
- Border color brightens
- Smooth transition

6. Hover over a selected badge

### ✅ Expected Results:
- Background darkens slightly
- Cursor shows pointer
- Smooth transition

---

## Test 5: Custom Placement Creation (3 min)

### Steps:
1. Scroll to "Add Custom Placement" card at bottom
2. Observe the initial state

### ✅ Expected Results:
- Sparkles icon (✨) visible
- Light grey/muted background
- Input field with placeholder: "e.g., Stadium Scoreboard"
- Add button visible but disabled (grey)
- Helper text below: "Create unique placement options for your team"

### Steps (continued):
3. Click in the input field
4. Type "VIP Suite Logo"

### ✅ Expected Results:
- Text appears in input
- Add button becomes enabled (primary color)

### Steps (continued):
5. Click "Add" button

### ✅ Expected Results:
- Success toast appears: "VIP Suite Logo" added to placement options
- Input field clears
- New placement appears in Custom Placements category
- Can immediately select the new placement

### Steps (continued):
6. Type "VIP Suite Logo" again (duplicate)
7. Click "Add"

### ✅ Expected Results:
- Error toast appears: "This placement already exists"
- Input is NOT cleared (so user can edit)
- No new placement added

### Steps (continued):
8. Clear input
9. Type "   " (spaces only)

### ✅ Expected Results:
- Add button stays disabled
- Cannot submit empty/whitespace-only

### Steps (continued):
10. Type "Stadium Banner"
11. Press Enter key (don't click button)

### ✅ Expected Results:
- Placement added (same as clicking Add button)
- Success toast appears
- Input clears

---

## Test 6: Selection Status Indicators (2 min)

### Steps:
1. Create new package (or use existing)
2. Don't select any placements

### ✅ Expected Results:
- At bottom of placements section:
- Dashed border card
- Muted background
- Pointer emoji (👆)
- Text: "Select at least one placement for this package"

### Steps (continued):
3. Select 1 placement

### ✅ Expected Results:
- Dashed card replaced with solid card
- Light primary background
- Checkmark icon appears
- Text: "1 placement selected"

### Steps (continued):
4. Select 2 more placements (total 3)

### ✅ Expected Results:
- Text updates: "3 placements selected"
- Badge at top also shows "3 selected"
- Both indicators update in real-time

---

## Test 7: Multi-Package Independence (3 min)

### Steps:
1. Fill Package 1:
   - Name: "Gold"
   - Price: 5000
   - Select: Website, Social Media, Jersey

2. Click "Add Another Package"

3. Fill Package 2:
   - Name: "Silver"
   - Price: 2500
   - Select: Field Banner, Program Ad

### ✅ Expected Results:
- Package 1 selections unchanged
- Package 2 has different selections
- Each package shows its own count
- Each package has independent placement UI

### Steps (continued):
4. Go back to Package 1
5. Change selections (deselect Jersey, add Field Banner)

### ✅ Expected Results:
- Package 1 updates correctly
- Package 2 selections unchanged
- No cross-contamination between packages

---

## Test 8: Search + Category Interaction (2 min)

### Steps:
1. Collapse all categories
2. Type "jersey" in search
3. Expand "Uniform & Apparel" category

### ✅ Expected Results:
- Only uniform items with "jersey" visible
- Other categories filtered too (if you expand them)

### Steps (continued):
4. Select a jersey placement
5. Clear search (click X)

### ✅ Expected Results:
- All placements reappear
- Jersey still selected
- Selection persists through search changes

---

## Test 9: Loading States (1 min)

### Steps:
1. Refresh the page / restart flow
2. Navigate quickly to Package Builder step

### ✅ Expected Results:
- While loading:
  - 3 grey skeleton bars pulse
  - No placement UI visible
- After loading:
  - Skeletons disappear
  - Placements appear
  - No flash of content

---

## Test 10: Mobile Responsiveness (3 min)

### Steps:
1. Open browser DevTools (F12)
2. Toggle device toolbar (mobile view)
3. Select iPhone or Pixel viewport
4. Navigate to Package Builder step

### ✅ Expected Results:
- Search bar full width
- Package name/price fields stack vertically
- Categories full width
- Placement badges wrap properly
- No horizontal scroll
- Touch targets adequately sized (easy to tap)

### Steps (continued):
5. Try tapping badges

### ✅ Expected Results:
- Badges respond to touch
- No accidental double-taps
- Selection works smoothly

### Steps (continued):
6. Scroll through entire step

### ✅ Expected Results:
- Smooth scrolling
- Can reach all content
- Continue button accessible
- No content hidden

---

## Test 11: Validation Integration (2 min)

### Steps:
1. Create Package 1 with:
   - Name: (empty)
   - Price: 0
   - Placements: none

### ✅ Expected Results:
- Continue button at bottom is DISABLED
- Cannot proceed to next step

### Steps (continued):
2. Fill name: "Test Package"

### ✅ Expected Results:
- Continue still disabled (price = 0, no placements)

### Steps (continued):
3. Set price: 1000

### ✅ Expected Results:
- Continue still disabled (no placements)

### Steps (continued):
4. Select 1 placement

### ✅ Expected Results:
- Continue button becomes ENABLED
- Can proceed to review

---

## Test 12: Tips Section (30 sec)

### Steps:
1. Scroll to bottom of Package Builder step
2. Locate the tips card

### ✅ Expected Results:
- Light secondary background
- Secondary border
- 💡 icon with "Package Tips" label
- 4 bullet points with helpful advice:
  - Bronze/Silver/Gold tiers
  - Higher tiers more placements
  - Popular placements attract premium sponsors
  - Mix physical and digital
- Keywords like "more visible" in bold

---

## Test 13: End-to-End Package Creation (5 min)

### Complete Scenario:
1. Create 3 packages:
   
   **Package 1 - Gold ($5000)**
   - Search "uniform"
   - Select: Home Jersey, Away Jersey, Practice Jersey
   - Clear search
   - Expand Digital
   - Select: Website Hero, Social Media Posts
   
   **Package 2 - Silver ($2500)**
   - Select from Popular: Website Logo, Social Media
   - Expand Facility
   - Select: Field Banner
   
   **Package 3 - Bronze ($1000)**
   - Select: Social Media
   - Create custom: "Newsletter Mention"
   - Select the new custom placement

2. Click Continue

### ✅ Expected Results:
- All 3 packages created successfully
- All selections saved correctly
- Custom placement saved to database
- Navigation proceeds to Review step
- Review page displays all package data

---

## Console Check (Always)

After each test, check browser console:
- ✅ No errors
- ✅ No warnings
- ✅ Only expected logs (if any)

---

## Accessibility Quick Check

1. Tab through all elements:
   - Search bar is focusable
   - Category headers are focusable
   - Badges are focusable
   - Custom input/button focusable
   - Add Package button focusable

2. Visual focus indicators:
   - Blue outline visible on focus
   - Can see which element is focused

3. Enter/Space keys:
   - Enter in search (nothing happens - OK)
   - Enter in custom input (adds placement)
   - Space on category header (toggles)
   - Enter on badge (selects placement)

---

## Performance Check

- Placements load in < 1 second
- Search filtering is instant
- No lag when selecting/deselecting
- Smooth animations on collapse/expand
- No stuttering when scrolling

---

## Summary

If all tests pass:
✅ Phase 3 - Advanced Placement Selection is complete!

Areas tested:
- Search & filter functionality
- Collapsible category sections
- Visual hierarchy with icons
- Multi-select placement badges
- Custom placement creation & database integration
- Real-time validation
- Multi-package independence
- Mobile responsiveness
- Accessibility
- Performance

Total test time: ~30 minutes
