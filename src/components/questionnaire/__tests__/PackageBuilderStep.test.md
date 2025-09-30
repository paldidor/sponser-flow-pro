# Package Builder Step - Advanced Placement Selection Tests

## Visual Tests

### Search & Filter Functionality
- [ ] **Search bar displays**
  - Search icon appears on left
  - Placeholder text: "Search placements..."
  - X clear button appears when text entered

- [ ] **Search filtering**
  - Type "social" → Only social media placements show
  - Type "uniform" → Uniform placements filter correctly
  - Case-insensitive search works
  - Partial matches work (e.g., "jer" matches "jersey")
  - Search filters both popular and categorized sections
  - Clear button (X) resets search and shows all placements

- [ ] **Empty search results**
  - Type nonsense text → Shows appropriate empty state
  - Categories with no matches collapse or show empty message

### Collapsible Categories
- [ ] **Popular Placements section**
  - Auto-expanded by default if popular placements exist
  - Shows star icon and "Popular Placements" label
  - Badge shows count (e.g., "5")
  - Click header to collapse/expand
  - ChevronUp/Down icon toggles correctly
  - Smooth collapse animation

- [ ] **Category sections**
  - Each category (Uniform, Facility, Digital, Events, Custom) displays
  - Correct icon for each category:
    - Uniform: Shirt icon
    - Facility: Building2 icon
    - Digital: Smartphone icon
    - Events: Calendar icon
    - Custom: Sparkles icon
  - Category names are properly labeled
  - Count badge shows number of placements in category
  - Click header to toggle expand/collapse
  - Multiple categories can be open simultaneously

### Visual Hierarchy
- [ ] **Popular section styling**
  - Light primary background (bg-primary/5)
  - Primary border
  - Stands out from other sections
  - Star icon in primary color

- [ ] **Category sections styling**
  - Subtle border (border-border/50)
  - Hover effect on header (bg-accent)
  - Icons in muted-foreground color
  - Clean, organized layout

### Placement Badges
- [ ] **Badge states**
  - Unselected: outline variant, grey
  - Selected: default variant (primary), with checkmark icon
  - Hover effects work on both states
  - Selected badges have shadow-sm
  - Smooth transitions between states

- [ ] **Badge interaction**
  - Click anywhere on badge to toggle
  - Visual feedback on click
  - Can deselect by clicking again
  - Touch-friendly on mobile (good tap target size)

### Custom Placement Creation
- [ ] **Custom placement card**
  - Sparkles icon displays
  - Light muted background
  - "Add Custom Placement" label clear
  - Input field and Add button side-by-side
  - Helper text below explaining purpose

- [ ] **Input behavior**
  - Placeholder shows example: "e.g., Stadium Scoreboard"
  - Enter key triggers add
  - Add button disabled when empty
  - Input clears after successful add

### Selection Status
- [ ] **No placements selected**
  - Dashed border card
  - Muted background
  - Message: "Select at least one placement for this package"
  - Pointer emoji (👆) for visual cue

- [ ] **Placements selected**
  - Solid border with primary color
  - Primary background tint
  - Checkmark icon
  - Count displays correctly (singular/plural)
  - Updates in real-time as selections change

### Package Cards
- [ ] **Package header**
  - Package icon in primary-tinted circle
  - "Package {number}" as title
  - Package name displays below if filled
  - Remove button (trash icon) on right when >1 package
  - Hover shadow effect on entire card

- [ ] **Package fields layout**
  - Name and Price in 2-column grid on desktop
  - Stacks to 1 column on mobile
  - Dollar sign icon in price field
  - Clear labels for each field

### Loading State
- [ ] **Skeleton loaders**
  - 3 skeleton bars display while loading
  - Proper height and width
  - Pulse animation works
  - Entire content blocked during load

### Tips Section
- [ ] **Tips card at bottom**
  - Secondary color scheme
  - Light bulb emoji + "Package Tips" label
  - 4 bullet points display
  - Bold text on key words
  - Helpful, actionable advice

---

## Functional Tests

### Database Integration
- [ ] **Fetch placements on load**
  - Query to `placement_options` table executes
  - Ordered by: is_popular DESC, category, name
  - Results populate state correctly
  - Loading state ends after fetch

- [ ] **Handle fetch errors**
  - Network error shows toast notification
  - Error logged to console
  - Loading state ends even on error
  - User can retry (refresh page)

### Search Functionality
- [ ] **Real-time filtering**
  - Typing filters immediately (no delay)
  - Popular section filters
  - All category sections filter
  - Empty categories handled gracefully

- [ ] **Search query state**
  - Query stored in state
  - Persists while navigating within package
  - Cleared when clear button clicked
  - Case-insensitive comparison works

### Category Expansion
- [ ] **Toggle state management**
  - Each category has independent open/closed state
  - State persists while editing package
  - Popular auto-expands on initial load
  - Other categories start collapsed

- [ ] **Multiple categories**
  - Can open multiple categories simultaneously
  - No conflicts between category states
  - Smooth animations on expand/collapse

### Placement Selection
- [ ] **Multi-select behavior**
  - Can select multiple placements per package
  - Selection stored as array of IDs
  - Selections independent per package
  - Can select same placement in multiple packages

- [ ] **Toggle logic**
  - Click once → adds to selection
  - Click again → removes from selection
  - No duplicates in placementIds array
  - State updates correctly

### Custom Placement Creation
- [ ] **Validation**
  - Trimmed input required (no spaces-only)
  - Duplicate check (case-insensitive)
  - Shows "Duplicate" toast if exists
  - Button disabled when empty

- [ ] **Database save**
  - INSERT query to `placement_options`
  - Sets category as "custom"
  - Sets is_popular as false
  - Returns created placement data

- [ ] **State update**
  - New placement added to placements array
  - Immediately available for selection
  - Appears in Custom category
  - Input field clears after add
  - Success toast displays

- [ ] **Error handling**
  - Database errors caught
  - Error toast shown to user
  - Placement not added to state on error
  - Input value preserved on error

### Package Management
- [ ] **Add package**
  - New package object created with unique ID
  - Empty name, 0 price, empty placementIds
  - Added to packages array
  - Rendered immediately

- [ ] **Remove package**
  - Only works when >1 package exists
  - Correct package removed by ID
  - Other packages unchanged
  - Validation updates after removal

- [ ] **Update package fields**
  - Name updates correctly
  - Price updates correctly (numeric only)
  - PlacementIds updates via toggle function
  - State updates trigger validation

### Validation Logic
- [ ] **Individual package validation**
  - Name must be non-empty (trimmed)
  - Price must be > 0
  - At least one placement selected
  - All three conditions required

- [ ] **Overall validity**
  - ALL packages must be valid
  - onValidityChange called with correct boolean
  - Continue button disabled when invalid
  - Validation runs on every state change

### Data Flow
- [ ] **Initialize with existing data**
  - initialPackages prop respected
  - Falls back to single empty package if none
  - Existing selections preserved
  - Edit mode works correctly

- [ ] **Value change callback**
  - onValueChange called on every update
  - Passes current packages array
  - Parent component receives updates
  - Data persists in QuestionnaireFlow state

### Edge Cases
- [ ] **Empty placements array**
  - Handles gracefully (shouldn't happen in production)
  - No categories render
  - Custom placement still works

- [ ] **No popular placements**
  - Popular section doesn't render
  - Categories work normally
  - No errors or warnings

- [ ] **All placements filtered out**
  - Empty state for popular section
  - Empty state for categories
  - Search still functional
  - Can clear search to see all

- [ ] **Single package**
  - Remove button hidden
  - Can't delete last package
  - Validation still works
  - Add button still available

---

## Integration Tests

### Complete Package Creation Flow
1. Load step → placements fetch
2. Enter package name: "Gold Sponsor"
3. Enter price: 5000
4. Search "social" → filter results
5. Select 3 placements from popular
6. Expand Uniform category
7. Select 2 uniform placements
8. Clear search
9. Expand Digital category
10. Create custom placement: "Mobile App Banner"
11. Select the new custom placement
12. Verify selection count: 6 placements
13. Add second package
14. Fill second package completely
15. Verify validation passes (Continue enabled)
16. Click Continue → data passed to parent

**Expected:** Complete flow works smoothly, data structure correct

### Search + Category Interaction
1. Start with all categories collapsed
2. Search "jersey"
3. Expand Uniform category (should show jersey items)
4. Select jerseys
5. Clear search
6. Verify selections persist
7. Search "social"
8. Expand Digital category
9. Select social placements
10. Clear search
11. Verify both selections still present

**Expected:** Search doesn't affect selections, categories work with search

### Multi-Package Independence
1. Create Package 1 with Uniform placements
2. Create Package 2 with Digital placements
3. Create Package 3 with mix of both
4. Verify each package has correct placements
5. Edit Package 1 selections
6. Verify Packages 2 & 3 unchanged
7. Remove Package 2
8. Verify Packages 1 & 3 intact

**Expected:** Packages completely independent, no cross-contamination

### Custom Placement Lifecycle
1. Create custom placement "VIP Suite Logo"
2. Verify appears in Custom category
3. Select it in Package 1
4. Create Package 2
5. Verify custom placement available
6. Select it in Package 2 also
7. Navigate back and forward in flow
8. Verify custom placement persists
9. Refresh page (new session)
10. Verify custom placement in database

**Expected:** Custom placement fully integrated, persists across packages and sessions

---

## Mobile Responsiveness Tests

- [ ] **Layout on small screens**
  - Package fields stack vertically
  - Search bar full width
  - Categories full width
  - Badges wrap properly
  - Add button full width
  - No horizontal scroll

- [ ] **Touch interactions**
  - Badges easy to tap (min 44x44px)
  - Collapsible headers easy to tap
  - Input fields easy to focus
  - Buttons adequately sized
  - No accidental double-taps

- [ ] **Scrolling behavior**
  - Smooth scroll through all sections
  - Sticky Continue button doesn't obstruct
  - Can reach all placements
  - Categories expand without layout shift

---

## Accessibility Tests

- [ ] **Keyboard navigation**
  - Tab through all interactive elements
  - Enter key works on badges
  - Enter key submits custom placement
  - Space key toggles collapsibles
  - Focus indicators visible

- [ ] **Screen reader**
  - Labels read correctly
  - Selection state announced
  - Category expand/collapse announced
  - Validation errors announced
  - Success messages announced

- [ ] **Color contrast**
  - All text meets WCAG AA
  - Selected vs unselected badges distinguishable
  - Focus states clear
  - Not relying solely on color

---

## Performance Tests

- [ ] **Large dataset**
  - 100+ placements load smoothly
  - Search filters quickly (<100ms)
  - Collapse/expand instant
  - No lag on selection
  - Memory usage reasonable

- [ ] **Multiple packages**
  - 10 packages render without lag
  - State updates performant
  - No unnecessary re-renders
  - Add/remove operations smooth

---

## Error Scenarios

- [ ] **Network failure during fetch**
  - Error toast displays
  - Loading state ends
  - Doesn't crash
  - Can retry (refresh)

- [ ] **Network failure during custom add**
  - Error toast displays
  - Input value preserved
  - Can retry
  - State remains consistent

- [ ] **Duplicate custom placement**
  - Prevented with warning
  - No database call made
  - Input not cleared
  - User can edit and retry

- [ ] **Invalid database response**
  - Gracefully handled
  - Empty array fallback
  - No crash
  - Error logged
