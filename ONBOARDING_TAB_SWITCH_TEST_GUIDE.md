# Onboarding Tab Switch Fix - Testing Guide

## Overview
This guide helps verify that the onboarding tab-switching bug is fixed. Users should remain in the onboarding flow regardless of tab switches, session refreshes, or focus events until they complete all steps.

## What Was Fixed

### Core Changes
1. **Database Schema**: Added `current_onboarding_step` enum column to track exact progress
2. **useSmartAuth Hook**: Now checks `current_onboarding_step === 'completed'` before allowing dashboard access
3. **ProtectedRoute**: Enhanced to require both `onboarding_completed = true` AND `step = 'completed'`
4. **TeamOnboarding**: Removed all early redirects; sets completion only on final approval
5. **TeamDashboard**: Added defensive verification as safety net

### Step Tracking
```
UI Step              → DB Enum Value
----------------------------------------
create-profile       → account_created
profile-review       → team_profile
select-method        → team_profile
website-analysis     → website_analyzed
pdf-upload           → website_analyzed
questionnaire        → packages
review               → review
[Final Approval]     → completed (+ onboarding_completed = true)
```

## Test Scenarios

### Scenario 1: Tab Switch During Profile Creation
**Steps:**
1. Log in and start onboarding
2. Fill out team profile form (don't submit)
3. Switch to another tab or minimize browser
4. Wait 10 seconds
5. Return to Lovable tab

**Expected:**
- ✅ User remains on profile creation step
- ✅ Form data preserved
- ✅ Console shows: `[TeamOnboarding] Updating DB step: create-profile → account_created`
- ❌ Does NOT redirect to dashboard

### Scenario 2: Tab Switch During Package Builder
**Steps:**
1. Complete profile and reach package builder (questionnaire)
2. Add 1-2 packages
3. Switch tabs for 15+ seconds
4. Return to onboarding

**Expected:**
- ✅ User remains on package builder
- ✅ Packages preserved
- ✅ Console shows: `[TeamOnboarding] Updating DB step: questionnaire → packages`
- ❌ Does NOT redirect to dashboard

### Scenario 3: Session Refresh During Review
**Steps:**
1. Complete all steps up to review
2. Open browser DevTools → Application → Storage → Clear all
3. Refresh page
4. Log back in

**Expected:**
- ✅ User returns to review step (resume from DB)
- ✅ Console shows: `[TeamOnboarding] Resuming from step: review → review`
- ✅ Offer data loads correctly
- ❌ Does NOT redirect to dashboard prematurely

### Scenario 4: Direct URL Manipulation
**Steps:**
1. Start onboarding (on profile step)
2. Manually navigate to `/team/dashboard` in URL bar
3. Press Enter

**Expected:**
- ✅ Immediately redirected back to `/team/onboarding`
- ✅ Console shows: `[ProtectedRoute] Blocking dashboard, redirecting to onboarding`
- ✅ Toast appears: "Complete Onboarding First"

### Scenario 5: Successful Completion Flow
**Steps:**
1. Complete entire onboarding flow
2. Approve final review
3. Wait for redirect to dashboard
4. Refresh page
5. Try navigating to `/team/onboarding`

**Expected:**
- ✅ After approval: Console shows `[TeamOnboarding] Onboarding completed successfully`
- ✅ Redirects to dashboard after 1 second
- ✅ Dashboard loads successfully
- ✅ Refreshing dashboard keeps you on dashboard
- ✅ Trying to access `/team/onboarding` redirects to dashboard
- ✅ Console shows: `[ProtectedRoute] Onboarding fully complete, allowing dashboard access`

### Scenario 6: Browser Focus/Visibility Events
**Steps:**
1. Start onboarding at any step
2. Alt+Tab away from browser for 30 seconds
3. Alt+Tab back to browser
4. Repeat 2-3 times

**Expected:**
- ✅ User stays on same step
- ✅ No unwanted navigation occurs
- ✅ State preserved throughout

### Scenario 7: Network Interruption Recovery
**Steps:**
1. Reach package builder step
2. Open DevTools → Network → Offline
3. Try to progress (will fail)
4. Go back online
5. Try again

**Expected:**
- ✅ Graceful error handling
- ✅ User can retry after reconnection
- ✅ Still on correct step (not redirected away)

## Console Debugging

### Expected Console Output

**During Onboarding Progression:**
```
[TeamOnboarding] Updating DB step: create-profile → account_created
[TeamOnboarding] Updating DB step: profile-review → team_profile
[TeamOnboarding] Updating DB step: questionnaire → packages
[TeamOnboarding] Updating DB step: review → review
```

**On Completion:**
```
[TeamOnboarding] Onboarding completed successfully
```

**On Dashboard Protection:**
```
[ProtectedRoute] Blocking dashboard, redirecting to onboarding
  hasTeamProfile: true
  onboardingCompleted: false
  currentOnboardingStep: 'packages'
```

**On Dashboard Verification:**
```
[TeamDashboard] Onboarding incomplete, redirecting
  onboarding_completed: false
  current_onboarding_step: 'packages'
```

**On Resume:**
```
[TeamOnboarding] Resuming from step: packages → questionnaire
```

## Database Verification

### Check Current Step in Database
```sql
SELECT 
  user_id,
  onboarding_completed,
  current_onboarding_step,
  team_name
FROM team_profiles
WHERE user_id = 'your-user-id';
```

**Expected values during onboarding:**
- `onboarding_completed` = `false`
- `current_onboarding_step` = one of: `account_created`, `team_profile`, `website_analyzed`, `packages`, `review`

**Expected values after completion:**
- `onboarding_completed` = `true`
- `current_onboarding_step` = `completed`

## Rollback Plan

If issues arise:
1. Check console for error messages
2. Verify database enum was created correctly
3. Check that `current_onboarding_step` column exists
4. Ensure all route guards are checking `currentOnboardingStep === 'completed'`
5. Review any custom code that might bypass guards

## Common Issues & Solutions

### Issue: User stuck in onboarding loop
**Check:** Database shows `onboarding_completed = true` but `current_onboarding_step ≠ 'completed'`
**Fix:** Manually update DB:
```sql
UPDATE team_profiles 
SET current_onboarding_step = 'completed'
WHERE user_id = 'affected-user-id' AND onboarding_completed = true;
```

### Issue: User redirected to dashboard prematurely
**Check:** Search code for `navigate('/team/dashboard')` without proper guards
**Fix:** Ensure all dashboard navigations check both conditions:
```typescript
if (onboardingCompleted && currentOnboardingStep === 'completed') {
  navigate('/team/dashboard');
}
```

### Issue: Tab switch still causes redirect
**Check:** Console logs to see which component is triggering redirect
**Fix:** Ensure no focus/visibility event handlers are causing navigation

## Success Criteria ✓

- [ ] User can switch tabs at any onboarding step without being redirected
- [ ] User can close/reopen browser and resume from last step
- [ ] User cannot access dashboard until final approval
- [ ] Manual URL navigation to `/team/dashboard` is blocked during onboarding
- [ ] After completion, user can freely access dashboard
- [ ] After completion, trying to access `/team/onboarding` redirects to dashboard
- [ ] Console logs show proper step tracking throughout flow
- [ ] Database reflects correct step at all times

## Testing Checklist

```
Test Environment: [  ] Local   [  ] Staging   [  ] Production

Scenario 1 - Tab Switch (Profile):        [  ] Pass  [  ] Fail
Scenario 2 - Tab Switch (Packages):       [  ] Pass  [  ] Fail
Scenario 3 - Session Refresh:             [  ] Pass  [  ] Fail
Scenario 4 - URL Manipulation:            [  ] Pass  [  ] Fail
Scenario 5 - Complete Flow:               [  ] Pass  [  ] Fail
Scenario 6 - Focus Events:                [  ] Pass  [  ] Fail
Scenario 7 - Network Recovery:            [  ] Pass  [  ] Fail

Database Verification:                     [  ] Pass  [  ] Fail
Console Logs Correct:                      [  ] Pass  [  ] Fail

Notes:
_______________________________________________
_______________________________________________
_______________________________________________
```

## Monitoring in Production

After deployment, monitor for:
1. Users completing onboarding successfully (check `current_onboarding_step = 'completed'`)
2. No errors in console related to onboarding guards
3. No user reports of being stuck in onboarding
4. No user reports of premature dashboard access

## Additional Notes

- All console logs are prefixed with component name for easy filtering
- Toast notifications provide user-friendly feedback on redirect reasons
- Database is the single source of truth for onboarding progress
- Multiple guards (useSmartAuth, ProtectedRoute, TeamDashboard) provide defense in depth
