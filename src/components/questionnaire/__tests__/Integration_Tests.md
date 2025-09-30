# Phase 6: Integration & Testing Documentation

## Overview
This document provides comprehensive integration testing procedures to ensure all components of the multi-step questionnaire work together seamlessly with the database, authentication, and state management.

---

## Table of Contents
1. [Pre-Integration Checklist](#pre-integration-checklist)
2. [Database Integration Tests](#database-integration-tests)
3. [End-to-End Flow Tests](#end-to-end-flow-tests)
4. [Cross-Component Integration](#cross-component-integration)
5. [Error Handling Tests](#error-handling-tests)
6. [Data Integrity Tests](#data-integrity-tests)
7. [Automated Test Runner](#automated-test-runner)
8. [Test Sign-Off](#test-sign-off)

---

## Pre-Integration Checklist

### Environment Setup
```
✅ Supabase project connected
✅ Database migrations applied
✅ RLS policies in place
✅ User authentication enabled
✅ Test user account created
✅ Placement options seeded
✅ Development environment running
```

### Database Verification
```sql
-- Verify tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'sponsorship_offers',
  'sponsorship_packages',
  'package_placements',
  'placement_options',
  'team_profiles'
);

-- Verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
  'sponsorship_offers',
  'sponsorship_packages',
  'package_placements',
  'placement_options',
  'team_profiles'
);

-- Verify placement options exist
SELECT category, COUNT(*) 
FROM placement_options 
GROUP BY category;
```

---

## Database Integration Tests

### Test 1: Draft Offer Creation

**Objective**: Verify draft offer is created on questionnaire start

**Steps**:
1. Sign in with test user
2. Navigate to questionnaire
3. Wait for initialization
4. Open browser console
5. Run:
```javascript
import { testDb } from '@/lib/testUtils';
const draft = await testDb.getDraftOffer();
console.log('Draft offer:', draft);
```

**Expected Results**:
- ✅ Draft offer exists in database
- ✅ `status` = 'draft'
- ✅ `user_id` matches authenticated user
- ✅ `source` = 'questionnaire'
- ✅ `draft_data` column exists (may be empty initially)
- ✅ `created_at` and `updated_at` timestamps set

**Actual Results**: 
- [ ] Pass
- [ ] Fail: ________________

---

### Test 2: Progressive Saving (Auto-Save)

**Objective**: Verify data is auto-saved as user progresses

**Steps**:
1. Start questionnaire
2. Enter fundraising goal: $10,000
3. Wait 3 seconds
4. Check database:
```javascript
import { testDb } from '@/lib/testUtils';
const draft = await testDb.getDraftOffer();
console.log('Draft data after Step 1:', draft.draft_data);
```
5. Continue to Step 2, select 2 impact areas
6. Wait 3 seconds
7. Check database again
8. Continue to Step 3, enter 15 players
9. Wait 3 seconds
10. Check database again

**Expected Results**:
- ✅ Draft data updates after each step
- ✅ Previous step data is preserved
- ✅ `updated_at` timestamp changes
- ✅ Auto-save indicator shows "Saved HH:MM"
- ✅ No save requests during typing (debounced)

**Verify Draft Data Structure**:
```javascript
// After completing Step 3, draft_data should contain:
{
  "currentStep": 3,
  "fundraisingGoal": "10000",
  "impactTags": ["Scholarships", "Equipment"],
  "supportedPlayers": "15"
}
```

**Actual Results**: 
- [ ] Pass
- [ ] Fail: ________________

---

### Test 3: Final Offer Creation

**Objective**: Verify complete offer with packages is created on submission

**Steps**:
1. Complete all 5 steps of questionnaire
2. Create 2 packages:
   - **Bronze**: $2,500 with 2 placements
   - **Gold**: $5,000 with 4 placements
3. Click Continue on final step
4. Wait for submission to complete
5. Check database:
```javascript
import { testDb } from '@/lib/testUtils';

// Check published offer
const offers = await testDb.getPublishedOffers();
console.log('Published offers:', offers);

// Check packages
const packages = await testDb.getPackages(offers[0].id);
console.log('Packages:', packages);

// Check placements for each package
for (const pkg of packages) {
  const placements = await testDb.getPlacements(pkg.id);
  console.log(`Placements for ${pkg.name}:`, placements);
}
```

**Expected Results**:

**Sponsorship Offer**:
- ✅ Status changed from 'draft' to 'published'
- ✅ All fields populated correctly:
  - `fundraising_goal` = 10000
  - `impact` = "Scholarships, Equipment"
  - `supported_players` = 15
  - `duration` = "1-year" (or selected value)
  - `team_profile_id` = linked if profile exists

**Packages**:
- ✅ 2 packages created
- ✅ Linked to sponsorship offer via `sponsorship_offer_id`
- ✅ Names, prices correct
- ✅ `package_order` set (1, 2)

**Placements**:
- ✅ Package 1 has 2 placements
- ✅ Package 2 has 4 placements
- ✅ All linked correctly via `package_placements` table
- ✅ Placement details retrieved from `placement_options`

**Actual Results**: 
- [ ] Pass
- [ ] Fail: ________________

---

### Test 4: Custom Placement Creation

**Objective**: Verify users can create custom placements

**Steps**:
1. Navigate to Package Builder (Step 5)
2. Click "Add Custom Placement"
3. Enter name: "Custom Stadium Banner"
4. Click Add
5. Verify placement appears in list
6. Check database:
```javascript
import { supabase } from '@/integrations/supabase/client';

const { data, error } = await supabase
  .from('placement_options')
  .select('*')
  .eq('name', 'Custom Stadium Banner')
  .single();

console.log('Custom placement:', data);
```

**Expected Results**:
- ✅ Custom placement created in database
- ✅ Category set to 'custom'
- ✅ `created_at` timestamp set
- ✅ Placement appears in selection list immediately
- ✅ Can be selected for packages

**Actual Results**: 
- [ ] Pass
- [ ] Fail: ________________

---

### Test 5: Team Profile Linking

**Objective**: Verify team profile is linked to sponsorship offer

**Pre-requisite**: User must have completed team profile creation

**Steps**:
1. Complete questionnaire
2. Submit final offer
3. Check database:
```javascript
import { testDb } from '@/lib/testUtils';

const offer = (await testDb.getPublishedOffers())[0];
const teamProfile = await testDb.getTeamProfile();

console.log('Offer team_profile_id:', offer.team_profile_id);
console.log('Team profile id:', teamProfile?.id);
console.log('Match:', offer.team_profile_id === teamProfile?.id);
```

**Expected Results**:
- ✅ `team_profile_id` in offer matches user's team profile
- ✅ If no team profile exists, `team_profile_id` is NULL (acceptable)

**Actual Results**: 
- [ ] Pass
- [ ] Fail: ________________

---

### Test 6: RLS Policy Verification

**Objective**: Verify Row Level Security prevents unauthorized access

**Steps**:

**Test 6a: User can only see their own data**
1. Sign in as User A
2. Create and publish an offer
3. Note the offer ID
4. Sign out
5. Sign in as User B
6. Try to fetch User A's offer:
```javascript
import { supabase } from '@/integrations/supabase/client';

const { data, error } = await supabase
  .from('sponsorship_offers')
  .select('*')
  .eq('id', '<User A offer ID>')
  .single();

console.log('Data:', data);
console.log('Error:', error);
```

**Expected Results**:
- ✅ User B cannot see User A's offer
- ✅ Returns no data or permission error

**Test 6b: Unauthenticated users cannot access data**
1. Sign out
2. Try to fetch offers:
```javascript
import { supabase } from '@/integrations/supabase/client';

const { data, error } = await supabase
  .from('sponsorship_offers')
  .select('*');

console.log('Data:', data);
console.log('Error:', error);
```

**Expected Results**:
- ✅ Returns empty array or auth error
- ✅ No data leaked

**Test 6c: Placement options are publicly readable**
```javascript
// Sign out, then:
import { supabase } from '@/integrations/supabase/client';

const { data, error } = await supabase
  .from('placement_options')
  .select('*');

console.log('Placement options:', data);
```

**Expected Results**:
- ✅ Placement options are returned even without auth
- ✅ This is expected behavior (public catalog)

**Actual Results**: 
- [ ] Pass
- [ ] Fail: ________________

---

## End-to-End Flow Tests

### Test 7: Complete User Journey (Happy Path)

**Objective**: Verify entire flow from start to finish works flawlessly

**Test Steps**:

**Phase 1: Authentication**
1. Navigate to app
2. Click "Sign In"
3. Enter test credentials
4. Verify redirect to dashboard

**Phase 2: Questionnaire Start**
1. Click "Create New Offer" or "Start Questionnaire"
2. Verify initialization loading state
3. Verify draft created in database

**Phase 3: Step 1 - Fundraising Goal**
1. Enter $15,000
2. Verify quick select highlights
3. Verify validation (try $400, should error)
4. Enter valid amount
5. Click Continue
6. Verify progress to 20%

**Phase 4: Step 2 - Impact Areas**
1. Select 3 predefined tags
2. Add 1 custom tag
3. Verify selected tags display
4. Click Continue
5. Verify progress to 40%

**Phase 5: Step 3 - Supported Players**
1. Enter 20 players
2. Verify cost per player calculation
3. Verify reach estimation
4. Click Continue
5. Verify progress to 60%

**Phase 6: Step 4 - Duration**
1. Select "1 Year"
2. Verify details expand
3. Click Continue
4. Verify progress to 80%

**Phase 7: Step 5 - Package Builder**
1. Create Package 1:
   - Name: "Bronze Sponsor"
   - Price: $3,000
   - Select 2 placements
2. Create Package 2:
   - Name: "Silver Sponsor"
   - Price: $7,500
   - Select 4 placements
3. Create Package 3:
   - Name: "Gold Sponsor"
   - Price: $15,000
   - Select 6 placements
4. Click Continue/Complete
5. Verify submission overlay

**Phase 8: Verification**
1. Verify success message
2. Verify redirect to review page
3. Check all data displays correctly
4. Verify database records created

**Expected Results**:
- ✅ All steps complete smoothly
- ✅ No errors or warnings
- ✅ Data saved progressively
- ✅ Final submission successful
- ✅ Database records correct
- ✅ User sees confirmation

**Completion Time**: _______ minutes

**Actual Results**: 
- [ ] Pass
- [ ] Fail: ________________

---

### Test 8: Resume Draft Flow

**Objective**: Verify users can resume incomplete questionnaires

**Steps**:
1. Start questionnaire
2. Complete Steps 1-3
3. Close browser tab (or navigate away)
4. Sign back in
5. Navigate to questionnaire
6. Verify draft loads with previous data

**Expected Results**:
- ✅ Draft data loaded from database
- ✅ User starts at Step 1 (or last completed step)
- ✅ All previous answers pre-filled
- ✅ Can continue from where left off
- ✅ Can modify previous answers

**Actual Results**: 
- [ ] Pass
- [ ] Fail: ________________

---

### Test 9: Multiple Offers Flow

**Objective**: Verify users can create multiple offers

**Steps**:
1. Complete and publish Offer 1
2. Start new questionnaire
3. Verify new draft created (not overwriting Offer 1)
4. Complete and publish Offer 2
5. Check database for both offers

**Expected Results**:
- ✅ Two published offers exist
- ✅ Each has its own packages
- ✅ Draft is separate from published offers
- ✅ Can create unlimited offers

**Actual Results**: 
- [ ] Pass
- [ ] Fail: ________________

---

## Cross-Component Integration

### Test 10: QuestionnaireFlow + MultiStepContainer Integration

**Objective**: Verify container and flow communicate correctly

**Steps**:
1. Monitor step changes
2. Verify progress bar updates
3. Verify step labels update
4. Verify back button behavior
5. Test keyboard navigation (Enter key)
6. Test mobile swipe gestures

**Expected Results**:
- ✅ Progress updates smoothly
- ✅ Step labels match content
- ✅ Back button navigates correctly
- ✅ Enter key advances when enabled
- ✅ Swipe gestures work on mobile
- ✅ Focus management works

**Actual Results**: 
- [ ] Pass
- [ ] Fail: ________________

---

### Test 11: QuestionnaireFlow + Database Service Integration

**Objective**: Verify service layer correctly interfaces with database

**Steps**:
1. Review `questionnaireService.ts` functions
2. Test each function independently:

```javascript
import { 
  getOrCreateDraftOffer,
  updateDraftStep,
  getUserTeamProfile,
  finalizeOffer 
} from '@/lib/questionnaireService';

// Test 1: Get or create draft
const { offerId, data, error } = await getOrCreateDraftOffer('user-id');
console.log('Draft:', { offerId, data, error });

// Test 2: Update draft
const updateResult = await updateDraftStep(offerId, {
  currentStep: 2,
  fundraisingGoal: "10000",
  impactTags: ["Scholarships"]
});
console.log('Update result:', updateResult);

// Test 3: Get team profile
const { teamProfileId } = await getUserTeamProfile('user-id');
console.log('Team profile ID:', teamProfileId);

// Test 4: Finalize offer
const finalResult = await finalizeOffer(offerId, teamProfileId, packages);
console.log('Final result:', finalResult);
```

**Expected Results**:
- ✅ All functions return correct shape
- ✅ Error handling works (network errors, validation errors)
- ✅ Success states return data
- ✅ Failure states return error messages

**Actual Results**: 
- [ ] Pass
- [ ] Fail: ________________

---

### Test 12: PackageBuilderStep + Placement Options Integration

**Objective**: Verify placement selection works with database

**Steps**:
1. Navigate to Package Builder
2. Verify placement options load
3. Test search functionality
4. Test category filtering
5. Test selection/deselection
6. Test custom placement creation
7. Verify placements save with packages

**Expected Results**:
- ✅ All placement options load from database
- ✅ Categories render correctly
- ✅ Search filters instantly
- ✅ Selection persists
- ✅ Custom placements save to database
- ✅ Placements link to packages on submit

**Actual Results**: 
- [ ] Pass
- [ ] Fail: ________________

---

## Error Handling Tests

### Test 13: Network Error Handling

**Objective**: Verify graceful degradation when network fails

**Test 13a: Offline During Auto-Save**
1. Start questionnaire
2. Complete Step 1
3. Open DevTools → Network → Set to "Offline"
4. Continue to Step 2
5. Complete Step 2
6. Wait 3 seconds (auto-save attempt)
7. Go back online
8. Observe behavior

**Expected Results**:
- ✅ No error thrown to user
- ✅ Data kept in memory
- ✅ Graceful retry when online
- ✅ User can continue working

**Test 13b: Offline During Final Submission**
1. Complete questionnaire
2. Go offline
3. Click Continue on final step
4. Observe behavior

**Expected Results**:
- ✅ Error message shown: "Network error"
- ✅ User can retry when online
- ✅ Data not lost
- ✅ Can submit successfully after going online

**Actual Results**: 
- [ ] Pass
- [ ] Fail: ________________

---

### Test 14: Validation Error Handling

**Objective**: Verify validation errors are clear and helpful

**Test Scenarios**:

**14a: Invalid Fundraising Goal**
- Enter "abc" → Should show error
- Enter "$100" → Should show "Minimum $500" error
- Enter "500" → Should accept

**14b: No Impact Tags Selected**
- Try to continue without selecting → Should be blocked
- Validation message should appear

**14c: Invalid Players**
- Enter "0" → Should show error
- Enter "-5" → Should show error
- Enter "abc" → Should show error

**14d: No Duration Selected**
- Try to continue without selecting → Should be blocked

**14e: Package Without Placements**
- Create package without selecting placements
- Should show validation error
- Should not allow continuing

**Expected Results**:
- ✅ All validation errors caught
- ✅ Error messages are clear and actionable
- ✅ Users can easily correct mistakes
- ✅ Continue button disabled when invalid

**Actual Results**: 
- [ ] Pass
- [ ] Fail: ________________

---

### Test 15: Authentication Error Handling

**Objective**: Verify behavior when authentication fails

**Steps**:
1. Start questionnaire without signing in
2. Observe redirect behavior
3. Sign in
4. Try to submit without authentication (simulate auth expiration)

**Expected Results**:
- ✅ Redirected to sign-in if not authenticated
- ✅ Error message shown
- ✅ After sign-in, can resume
- ✅ Data not lost during auth flow

**Actual Results**: 
- [ ] Pass
- [ ] Fail: ________________

---

### Test 16: Database Constraint Error Handling

**Objective**: Verify graceful handling of database errors

**Test Scenarios**:

**16a: Duplicate Custom Placement**
1. Create custom placement "Test Placement"
2. Try to create another "Test Placement"
3. Verify behavior

**Expected**: Either prevents duplicate or shows error

**16b: Invalid Data Types**
1. Try to submit package with negative price (if validation missed)
2. Verify database rejects it
3. Verify user sees meaningful error

**Actual Results**: 
- [ ] Pass
- [ ] Fail: ________________

---

## Data Integrity Tests

### Test 17: Data Consistency Across Navigation

**Objective**: Verify data remains consistent when navigating back/forward

**Steps**:
1. Complete Step 1: $10,000
2. Complete Step 2: ["Scholarships", "Equipment"]
3. Complete Step 3: 20 players
4. Go back to Step 2
5. Add another tag: "Travel"
6. Go forward to Step 3
7. Verify data intact: 20 players
8. Go back to Step 1
9. Change to $15,000
10. Navigate forward through all steps
11. Verify all data correct

**Expected Results**:
- ✅ Data persists correctly
- ✅ Changes saved
- ✅ No data loss
- ✅ State consistent

**Actual Results**: 
- [ ] Pass
- [ ] Fail: ________________

---

### Test 18: Concurrent Session Handling

**Objective**: Verify behavior with multiple browser tabs

**Steps**:
1. Open questionnaire in Tab 1
2. Complete Step 1
3. Open same URL in Tab 2
4. Complete Step 2 in Tab 2
5. Return to Tab 1
6. Try to continue

**Expected Results**:
- ⚠️ Last-write-wins (documented behavior)
- ✅ No data corruption
- ✅ Either warning shown or smooth sync

**Actual Results**: 
- [ ] Pass
- [ ] Fail: ________________

---

### Test 19: Database Transaction Integrity

**Objective**: Verify all related records created atomically

**Steps**:
1. Complete questionnaire
2. Submit
3. If error occurs mid-submission, check database
4. Verify no orphaned records

**Expected Results**:
- ✅ All packages created OR none created
- ✅ All placements created OR none created
- ✅ No orphaned package_placements
- ✅ Offer status reflects completion accurately

**Test Scenario**: Simulate database error during package creation
```sql
-- Check for orphaned package_placements
SELECT pp.* 
FROM package_placements pp
LEFT JOIN sponsorship_packages sp ON pp.package_id = sp.id
WHERE sp.id IS NULL;

-- Should return no results
```

**Actual Results**: 
- [ ] Pass
- [ ] Fail: ________________

---

## Automated Test Runner

### Using the Test Utility Functions

**Installation**:
All test utilities are available in `src/lib/testUtils.ts`

**Running Tests in Browser Console**:
```javascript
// Import test runner
import { runIntegrationTests } from '@/lib/testUtils';

// Run all integration tests
await runIntegrationTests();
```

**Individual Test Functions**:
```javascript
import { testAuth, testDb, testValidators, testPerformance } from '@/lib/testUtils';

// Authentication tests
await testAuth.isAuthenticated();
await testAuth.getCurrentUserId();

// Database tests
await testDb.hasDraftOffer();
await testDb.getDraftOffer();
await testDb.getPublishedOffers();
await testDb.getAllPlacementOptions();

// Validation tests
testValidators.validateFundraisingGoal("10000");
testValidators.validatePackage(packageData);

// Performance tests
await testPerformance.testAutoSave(offerId, data);
await testPerformance.testPlacementFetch();
```

**Cleanup After Tests**:
```javascript
import { testDb } from '@/lib/testUtils';

// Warning: This deletes draft data!
await testDb.cleanupTestData();
```

---

## Performance Benchmarks

### Expected Performance Metrics

| Operation | Target | Warning | Failure |
|-----------|--------|---------|---------|
| Draft creation | < 300ms | < 500ms | > 1s |
| Auto-save | < 500ms | < 1s | > 2s |
| Placement fetch | < 200ms | < 500ms | > 1s |
| Step transition | < 100ms | < 300ms | > 500ms |
| Final submission | < 2s | < 5s | > 10s |

**Run Performance Tests**:
```javascript
import { testPerformance } from '@/lib/testUtils';

// Test auto-save performance
const saveTime = await testPerformance.testAutoSave(offerId, data);
console.log(`Auto-save: ${saveTime}ms`);

// Test placement fetch
const fetchTime = await testPerformance.testPlacementFetch();
console.log(`Placement fetch: ${fetchTime}ms`);
```

---

## Test Sign-Off

### Integration Test Results

| Test # | Test Name | Status | Tested By | Date | Notes |
|--------|-----------|--------|-----------|------|-------|
| 1 | Draft Offer Creation | ☐ | | | |
| 2 | Progressive Saving | ☐ | | | |
| 3 | Final Offer Creation | ☐ | | | |
| 4 | Custom Placement Creation | ☐ | | | |
| 5 | Team Profile Linking | ☐ | | | |
| 6 | RLS Policy Verification | ☐ | | | |
| 7 | Complete User Journey | ☐ | | | |
| 8 | Resume Draft Flow | ☐ | | | |
| 9 | Multiple Offers Flow | ☐ | | | |
| 10 | QuestionnaireFlow Integration | ☐ | | | |
| 11 | Database Service Integration | ☐ | | | |
| 12 | PackageBuilder Integration | ☐ | | | |
| 13 | Network Error Handling | ☐ | | | |
| 14 | Validation Error Handling | ☐ | | | |
| 15 | Authentication Errors | ☐ | | | |
| 16 | Database Constraint Errors | ☐ | | | |
| 17 | Data Consistency | ☐ | | | |
| 18 | Concurrent Sessions | ☐ | | | |
| 19 | Transaction Integrity | ☐ | | | |

### Critical Issues Found

| Issue # | Description | Severity | Status | Resolution |
|---------|-------------|----------|--------|------------|
| | | | | |

### Performance Test Results

| Metric | Target | Actual | Pass/Fail |
|--------|--------|--------|-----------|
| Draft creation | < 300ms | | ☐ |
| Auto-save | < 500ms | | ☐ |
| Placement fetch | < 200ms | | ☐ |
| Step transition | < 100ms | | ☐ |
| Final submission | < 2s | | ☐ |

---

## Regression Testing

### Previous Phase Functionality

Verify these features still work after Phase 6 changes:

**Phase 1-2: Individual Steps**
- ✅ All step components render correctly
- ✅ Validation works on each step
- ✅ Visual feedback appropriate

**Phase 3: Placement Selection**
- ✅ Search and filter work
- ✅ Categories render correctly
- ✅ Selection persists

**Phase 4: Database Integration**
- ✅ Draft saving works
- ✅ Progressive saving works
- ✅ Final submission works

**Phase 5: UX Enhancements**
- ✅ Mobile gestures work
- ✅ Keyboard navigation works
- ✅ Accessibility features work
- ✅ Animations smooth

---

## Deployment Readiness Checklist

Before deploying to production:

### Code Quality
- ✅ All TypeScript errors resolved
- ✅ No console.error in production code
- ✅ Proper error handling everywhere
- ✅ Loading states implemented
- ✅ Success feedback implemented

### Database
- ✅ All migrations applied
- ✅ RLS policies verified secure
- ✅ Indexes created for performance
- ✅ No data leaks (tested)
- ✅ Backup strategy in place

### Testing
- ✅ All integration tests pass
- ✅ Manual testing complete
- ✅ Performance benchmarks met
- ✅ Cross-browser tested
- ✅ Mobile tested

### Documentation
- ✅ README updated
- ✅ API documentation complete
- ✅ User guide created (if needed)
- ✅ Known issues documented

### Monitoring
- ✅ Error tracking configured
- ✅ Analytics configured
- ✅ Performance monitoring setup
- ✅ User feedback mechanism in place

---

## Conclusion

Phase 6 integration testing ensures:
- ✅ All components work together seamlessly
- ✅ Database operations are secure and correct
- ✅ User experience is smooth end-to-end
- ✅ Error handling is robust
- ✅ Performance meets targets
- ✅ Data integrity is maintained

**Project Status**: Ready for deployment after all tests pass.

---

## Support Resources

- [Database Schema Documentation](../../../PHASE_4_IMPLEMENTATION_SUMMARY.md)
- [Test Utilities](../../../lib/testUtils.ts)
- [Supabase Dashboard](https://supabase.com/dashboard/project/gtlxdbokhtdtfmziacai)
- [Edge Function Logs](https://supabase.com/dashboard/project/gtlxdbokhtdtfmziacai/functions)
