# Database Integration & State Management Tests - Phase 4

## Test Suite Overview

This test suite validates:
- Draft creation and recovery
- Progressive auto-save functionality
- Database operations (CRUD)
- Error handling and recovery
- Network resilience
- Data integrity
- Team profile association

---

## Test 1: Initial Draft Creation (2 min)

### Steps:
1. Clear all existing drafts from database (using Supabase dashboard)
2. Navigate to "Answer Questions" flow
3. Observe initialization

### ✅ Expected Results:
- Loading screen appears: "Setting up your questionnaire..."
- Takes < 2 seconds to initialize
- Step 1 loads (Fundraising Goal)
- No errors in console
- Check database: New draft record created with:
  - `status = 'draft'`
  - `source = 'questionnaire'`
  - `fundraising_goal = 0`
  - `impact = 'In progress...'`
  - `duration = 'TBD'`
  - `user_id` = current user

### Database Verification Query:
```sql
SELECT id, status, source, fundraising_goal, impact, duration, user_id, created_at
FROM sponsorship_offers
WHERE status = 'draft' AND source = 'questionnaire'
ORDER BY created_at DESC
LIMIT 1;
```

---

## Test 2: Draft Recovery (3 min)

### Steps:
1. Complete Steps 1-3 of questionnaire:
   - Goal: $10,000
   - Impact: Equipment, Travel
   - Players: 25

2. Close browser tab (or navigate away)
3. Reopen application
4. Navigate back to "Answer Questions"

### ✅ Expected Results:
- Initialization loads existing draft
- Returns to Step 1 with $10,000 already filled
- Click Continue to Step 2
- Impact tags "Equipment" and "Travel" already selected
- Click Continue to Step 3
- Players field shows "25"
- All data preserved from previous session

### Database Verification:
```sql
SELECT * FROM sponsorship_offers
WHERE status = 'draft' AND source = 'questionnaire'
ORDER BY updated_at DESC LIMIT 1;
```
Should show updated values.

---

## Test 3: Auto-Save Functionality (3 min)

### Steps:
1. Start new questionnaire or continue existing
2. Step 1: Type goal amount "15000"
3. Wait 3 seconds (don't click Continue)
4. Observe top-right corner of screen

### ✅ Expected Results:
- After ~2 seconds: "Saving..." indicator appears
- Then: "Saved HH:MM" with green dot
- Auto-save indicator fades in smoothly

### Steps (continued):
5. Open DevTools → Network tab
6. Clear network log
7. Change goal to "20000"
8. Wait 3 seconds
9. Observe network requests

### ✅ Expected Results:
- After 2 seconds: PATCH/UPDATE request to `sponsorship_offers`
- Request body contains `fundraising_goal: 20000`
- Response status: 200 OK
- Auto-save indicator updates

### Database Verification:
```sql
SELECT fundraising_goal, updated_at 
FROM sponsorship_offers 
WHERE id = '<your-draft-id>';
```
Should show 20000 and recent timestamp.

---

## Test 4: Progressive Saving Across Steps (5 min)

### Test Data:
- Goal: $25,000
- Impact: Scholarships, Equipment, Travel, "Training Camp"
- Players: 35
- Duration: Multi Year
- Package 1: Gold ($5000), 5 placements
- Package 2: Silver ($2500), 3 placements

### Steps:
1. Complete each step and verify database updates

**After Step 1:**
```sql
SELECT fundraising_goal FROM sponsorship_offers WHERE id = '<draft-id>';
```
Expected: `25000`

**After Step 2:**
```sql
SELECT impact FROM sponsorship_offers WHERE id = '<draft-id>';
```
Expected: `"Scholarships, Equipment, Travel, Training Camp"`

**After Step 3:**
```sql
SELECT supported_players FROM sponsorship_offers WHERE id = '<draft-id>';
```
Expected: `35`

**After Step 4:**
```sql
SELECT duration FROM sponsorship_offers WHERE id = '<draft-id>';
```
Expected: `"Multi Year"`

**After Step 5 (Final):**
```sql
SELECT status FROM sponsorship_offers WHERE id = '<draft-id>';
```
Expected: `'published'` (not 'draft' anymore)

```sql
SELECT COUNT(*) FROM sponsorship_packages WHERE sponsorship_offer_id = '<offer-id>';
```
Expected: `2` (two packages)

```sql
SELECT COUNT(*) FROM package_placements pp
JOIN sponsorship_packages sp ON pp.package_id = sp.id
WHERE sp.sponsorship_offer_id = '<offer-id>';
```
Expected: `8` (5 + 3 placements total)

### ✅ Success Criteria:
- Each step saves to database
- Data persists across navigation
- Final submission creates packages and placements
- Status changes from 'draft' to 'published'

---

## Test 5: Team Profile Association (2 min)

### Prerequisites:
Ensure you have a team profile created:
```sql
SELECT id, user_id, team_name FROM team_profiles WHERE user_id = '<your-user-id>';
```

### Steps:
1. Complete entire questionnaire
2. After submission, check sponsorship offer:

```sql
SELECT id, team_profile_id FROM sponsorship_offers 
WHERE id = '<offer-id>';
```

### ✅ Expected Results:
- `team_profile_id` is NOT NULL
- `team_profile_id` matches your team profile ID
- Association created automatically

### No Team Profile Test:
1. Delete your team profile (or use account without one)
2. Complete questionnaire

### ✅ Expected Results:
- Flow still completes successfully
- `team_profile_id` is NULL
- No errors thrown
- User can still create offers

---

## Test 6: Network Error Handling (4 min)

### Scenario A: Network Failure During Init
1. Open DevTools → Network tab
2. Enable "Offline" mode
3. Navigate to "Answer Questions"

### ✅ Expected Results:
- Initialization error toast appears
- User not kicked out of flow
- Can still use form (offline mode)
- When back online, next save succeeds

### Scenario B: Network Failure During Save
1. Start questionnaire (online)
2. Fill Step 1
3. Enable "Offline" mode in DevTools
4. Wait for auto-save attempt (3 seconds)
5. Disable "Offline" mode
6. Continue to Step 2

### ✅ Expected Results:
- Auto-save fails silently (no destructive toast)
- Form still functional
- When back online, next save includes all data
- No data loss

### Scenario C: Network Failure on Final Submit
1. Complete all steps to Step 5
2. Enable "Offline" mode
3. Click Continue (final submit)

### ✅ Expected Results:
- Submission fails
- Error toast: "Submission failed"
- User stays on Step 5
- Can retry when back online
- Draft still exists in database

---

## Test 7: Concurrent Session Handling (3 min)

### Steps:
1. Open questionnaire in Browser 1
2. Fill Step 1: Goal = $10,000
3. Wait for auto-save
4. Open questionnaire in Browser 2 (same account)

### ✅ Expected Results:
- Browser 2 loads the same draft
- Shows $10,000 in Step 1

### Steps (continued):
5. In Browser 1: Change to $15,000, wait for save
6. In Browser 2: Change to $20,000, wait for save
7. Close both browsers
8. Open fresh browser, navigate to questionnaire

### ✅ Expected Results:
- Last save wins (likely $20,000)
- No data corruption
- No duplicate drafts created

### Database Check:
```sql
SELECT COUNT(*) FROM sponsorship_offers 
WHERE user_id = '<user-id>' AND status = 'draft' AND source = 'questionnaire';
```
Expected: `1` (only one draft, not multiple)

---

## Test 8: Database RLS Policies (3 min)

### Test User Isolation:
1. User A creates draft, fills partially
2. User B (different account) navigates to questionnaire
3. User B should see their own draft or new draft
4. User B should NOT see User A's data

### Verify RLS:
```sql
-- As User A
SELECT * FROM sponsorship_offers WHERE status = 'draft';
-- Should see only User A's drafts

-- As User B  
SELECT * FROM sponsorship_offers WHERE status = 'draft';
-- Should see only User B's drafts
```

### Test Unauthorized Access:
Try to update another user's draft (use API or direct query):
```sql
UPDATE sponsorship_offers 
SET fundraising_goal = 99999 
WHERE user_id != '<your-user-id>' AND status = 'draft';
```

### ✅ Expected Results:
- Update fails (RLS blocks it)
- No rows affected
- Your own data untouched

---

## Test 9: Package & Placement Creation (5 min)

### Steps:
1. Complete questionnaire with 3 packages:
   - Package 1: 5 placements
   - Package 2: 3 placements
   - Package 3: 2 placements (include 1 custom)

2. Submit successfully

### Database Verification:

**Check Packages Created:**
```sql
SELECT id, name, price, package_order 
FROM sponsorship_packages 
WHERE sponsorship_offer_id = '<offer-id>'
ORDER BY package_order;
```

✅ Expected:
- 3 rows returned
- package_order: 1, 2, 3
- Names and prices match input

**Check Placements Created:**
```sql
SELECT 
  sp.name as package_name,
  po.name as placement_name,
  po.category
FROM package_placements pp
JOIN sponsorship_packages sp ON pp.package_id = sp.id
JOIN placement_options po ON pp.placement_option_id = po.id
WHERE sp.sponsorship_offer_id = '<offer-id>'
ORDER BY sp.package_order, po.name;
```

✅ Expected:
- 10 total placements (5+3+2)
- All placement names match selections
- Custom placement included with category='custom'

**Check Custom Placement Saved:**
```sql
SELECT * FROM placement_options 
WHERE category = 'custom' 
ORDER BY created_at DESC LIMIT 5;
```

✅ Expected:
- Your custom placement appears
- Available for future use

---

## Test 10: Data Transformation & Review Page (3 min)

### Steps:
1. Complete questionnaire with test data:
   - Goal: $30,000
   - Impact: Equipment, Scholarships, "Custom Impact"
   - Players: 40
   - Duration: 1 Year
   - 2 packages with multiple placements

2. Click Continue from Package Builder
3. Arrive at Review Page

### ✅ Verify Review Display:
- Fundraising goal: "$30,000" (formatted)
- Impact: Shows "Equipment, Scholarships, Custom Impact"
- Players: "40"
- Duration: "1 Year"
- Package 1:
  - Name displayed
  - Price displayed
  - Placements show as names (not IDs)
- Package 2:
  - Name displayed
  - Price displayed
  - Placements show as names

### Check Database Query:
Verify placement IDs were transformed to names:
```sql
SELECT 
  po.id, 
  po.name 
FROM placement_options po
WHERE po.id IN (SELECT DISTINCT placement_option_id FROM package_placements);
```

### ✅ Success Criteria:
- All data accurately displayed
- IDs converted to human-readable names
- No raw IDs shown to user
- Formatting applied (currency, etc.)

---

## Test 11: Error Recovery Scenarios (5 min)

### Scenario A: Database Constraint Violation
1. Manually create invalid draft in database
2. Try to load questionnaire

✅ Expected: Error handled, user not stuck

### Scenario B: Partial Submission Failure
1. Complete to Step 5
2. Simulate database down during final submit
3. Verify draft still exists
4. Retry submission when DB back up

✅ Expected: Can retry, no data loss

### Scenario C: Concurrent Package Creation
1. Two tabs, same offer
2. Both try to create packages simultaneously

✅ Expected: Last write wins, no duplicates

### Scenario D: Invalid Placement ID
1. Delete placement option from DB
2. Try to finalize offer that references it

✅ Expected: Error caught, helpful message shown

---

## Test 12: Performance & Load (3 min)

### Auto-Save Performance:
1. Complete form with rapid typing
2. Verify auto-save doesn't fire on every keystroke
3. Verify debounce works (2 second delay)

### Large Package Count:
1. Create 10 packages with 10 placements each
2. Submit offer

✅ Expected:
- Submission completes (may take 5-10 seconds)
- All 10 packages created
- All 100 placements created
- No timeout errors

### Database Query:
```sql
SELECT COUNT(*) FROM sponsorship_packages WHERE sponsorship_offer_id = '<offer-id>';
-- Expected: 10

SELECT COUNT(*) FROM package_placements pp
JOIN sponsorship_packages sp ON pp.package_id = sp.id
WHERE sp.sponsorship_offer_id = '<offer-id>';
-- Expected: 100
```

---

## Test 13: Regression - Existing Functionality (10 min)

### Test All Other Creation Methods Still Work:

**1. Website Analysis Path:**
- Navigate to "Analyze Website"
- Enter URL and submit
- Verify mock data loads
- Verify Review page works
- No errors

**2. PDF Upload Path:**
- Navigate to "Upload PDF"
- Upload test PDF
- Verify analysis runs
- Verify packages extracted
- No errors

**3. Old Manual Form Path:**
- Verify old `SponsorshipForm.tsx` still accessible (if needed)
- Or confirm it's fully replaced by questionnaire

### ✅ Success Criteria:
- All three methods work independently
- No conflicts with new questionnaire code
- Each path creates proper database records
- Review page handles all sources

---

## Test 14: Clean-Up & Draft Management (2 min)

### Multiple Draft Scenario:
1. Create draft, fill partially
2. Navigate away (don't submit)
3. Create new draft (start questionnaire again)
4. Check database

### Database Query:
```sql
SELECT id, created_at, updated_at 
FROM sponsorship_offers 
WHERE user_id = '<your-id>' AND status = 'draft' AND source = 'questionnaire'
ORDER BY updated_at DESC;
```

### ✅ Expected Behavior:
Current implementation: Reuses most recent draft
- Only 1 active draft per user
- Older drafts remain but unused
- No orphaned drafts accumulating

Future enhancement: Implement draft cleanup
- Delete old drafts after X days
- Or prompt user to resume or discard

---

## Integration Test: Complete Happy Path (10 min)

### Full End-to-End Scenario:

1. **Start Fresh:**
   - Clear existing drafts
   - Start questionnaire

2. **Step 1 - Fundraising Goal:**
   - Select $25,000 (quick select)
   - Wait for auto-save
   - Verify save indicator
   - Continue

3. **Step 2 - Impact:**
   - Select: Equipment, Travel, Player Development
   - Add custom: "Coaching Workshops"
   - Wait for auto-save
   - Continue

4. **Step 3 - Players:**
   - Enter: 28
   - Wait for auto-save
   - Verify cost per player calculated
   - Continue

5. **Step 4 - Duration:**
   - Select: 1 Year
   - Wait for auto-save
   - Continue

6. **Step 5 - Packages:**
   - Package 1: "Platinum" - $10,000
     - Select 8 placements from various categories
   - Package 2: "Gold" - $5,000
     - Select 5 placements
   - Package 3: "Silver" - $2,500
     - Select 3 placements
   - Create custom placement: "Concession Stand Banner"
   - Select it in Silver package
   - Wait for auto-save
   - Click Continue

7. **Submission:**
   - Loading overlay appears
   - Message: "Creating your sponsorship offer..."
   - Success toast: "Your sponsorship offer has been created"
   - Navigate to Review page

8. **Verify Review:**
   - All data displays correctly
   - Placements show as names
   - Total calculated correctly

9. **Database Final Verification:**

```sql
-- Check offer published
SELECT status, fundraising_goal, impact, duration, supported_players
FROM sponsorship_offers WHERE id = '<offer-id>';
-- Status should be 'published'

-- Check packages
SELECT COUNT(*) FROM sponsorship_packages WHERE sponsorship_offer_id = '<offer-id>';
-- Should be 3

-- Check placements
SELECT COUNT(*) FROM package_placements pp
JOIN sponsorship_packages sp ON pp.package_id = sp.id
WHERE sp.sponsorship_offer_id = '<offer-id>';
-- Should be 16 (8+5+3)

-- Check custom placements
SELECT name FROM placement_options WHERE category = 'custom' 
AND name IN ('Coaching Workshops', 'Concession Stand Banner');
-- Both should exist
```

### ✅ Complete Success Criteria:
- No errors at any point
- All auto-saves worked
- All data persisted correctly
- Database structure correct
- Review page accurate
- User experience smooth

---

## Summary Checklist

After completing all tests:

- [ ] Draft creation works
- [ ] Draft recovery works
- [ ] Auto-save functions correctly
- [ ] Progressive saving across steps
- [ ] Team profile association
- [ ] Network error handling robust
- [ ] Concurrent sessions handled
- [ ] RLS policies enforced
- [ ] Packages created correctly
- [ ] Placements created correctly
- [ ] Custom placements saved
- [ ] Data transformation accurate
- [ ] Error recovery functional
- [ ] Performance acceptable
- [ ] No regressions in existing features
- [ ] Clean-up strategy working
- [ ] Complete happy path successful

## Estimated Testing Time
- Individual tests: ~1 hour
- Integration test: ~10-15 minutes
- Regression testing: ~10-15 minutes
- **Total: ~1.5 - 2 hours**

If all tests pass: ✅ **Phase 4 - Database Integration & State Management is COMPLETE!**
