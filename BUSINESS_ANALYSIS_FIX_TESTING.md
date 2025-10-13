# Business Website Analysis Fix - Testing Guide

## Overview
This document outlines comprehensive testing for the robust website analysis flow with timeout handling, error recovery, and data validation.

---

## Phase 1: Database Schema Validation ✅

**Verify new columns exist:**
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'business_profiles' 
  AND column_name IN ('analysis_status', 'analysis_started_at', 'analysis_error');
```

**Expected columns:**
- `analysis_status` TEXT (nullable)
- `analysis_started_at` TIMESTAMPTZ (nullable)
- `analysis_error` TEXT (nullable)

---

## Phase 2: Happy Path Testing

### Test Case 2.1: Successful Website Analysis (< 30 seconds)

**Steps:**
1. Navigate to `/business/onboarding`
2. Enter a valid website URL (e.g., `applebees.com`)
3. Click "Analyze Website"
4. Observe analysis spinner with progress 0-95%
5. Wait for Make.com to return data
6. Progress should complete to 100%
7. Automatically advance to Review step

**Expected Results:**
- ✅ Toast: "Website Submitted - Analyzing your business website..."
- ✅ `analysis_status` set to `'pending'` in database
- ✅ `analysis_started_at` timestamp recorded
- ✅ Progress animation runs smoothly
- ✅ Upon completion: `analysis_status` → `'completed'`
- ✅ Profile data populated (business_name, industry, city, state)
- ✅ Auto-advance to profile-review step
- ✅ Toast: "Website Analyzed Successfully! Please review your profile information."

**Database Check:**
```sql
SELECT business_name, industry, city, state, analysis_status 
FROM business_profiles 
WHERE user_id = '<current_user_id>';
```

---

## Phase 3: Timeout Handling

### Test Case 3.1: 30-Second Warning

**Steps:**
1. Start website analysis
2. Wait 30 seconds without completion
3. Observe UI changes

**Expected Results:**
- ✅ After 30s: Toast appears: "Still analyzing... This may take up to 2 minutes"
- ✅ Subtitle changes to: "This may take up to 2 minutes"
- ✅ Progress continues (still < 95%)
- ✅ Title changes to: "Still analyzing..."

### Test Case 3.2: 60-Second Timeout

**Steps:**
1. Start website analysis
2. Wait 60 seconds without completion
3. Observe timeout behavior

**Expected Results:**
- ✅ After 60s: Progress stops at 95%
- ✅ Title: "Taking Longer Than Expected"
- ✅ Subtitle: "This is taking longer than expected. You can continue manually."
- ✅ "Continue Manually" button appears
- ✅ Click button → Navigate to manual-form step
- ✅ `analysis_status` updated to `'timeout'` in database

**Database Check:**
```sql
SELECT analysis_status, analysis_error 
FROM business_profiles 
WHERE user_id = '<current_user_id>';
-- Should show: analysis_status = 'timeout'
```

---

## Phase 4: Error Handling

### Test Case 4.1: Make.com Analysis Failure

**Simulate by updating database manually:**
```sql
UPDATE business_profiles 
SET analysis_status = 'failed', 
    analysis_error = 'Website unavailable or blocked'
WHERE user_id = '<current_user_id>';
```

**Expected Results:**
- ✅ Real-time subscription detects status change
- ✅ Navigate to `AnalysisErrorFallback` component
- ✅ Display error message: "Website unavailable or blocked"
- ✅ Show attempted URL
- ✅ Three buttons visible:
  - "Try Again" (retry analysis)
  - "Fill Manually Instead" (go to form)
  - "Try Different Website" (back to create-profile)

### Test Case 4.2: Retry Analysis

**Steps:**
1. From error fallback, click "Try Again"
2. Observe retry behavior

**Expected Results:**
- ✅ `analysis_status` reset to `'pending'`
- ✅ `analysis_started_at` updated to current time
- ✅ `analysis_error` cleared (set to null)
- ✅ Navigate back to website-analysis spinner
- ✅ Toast: "Retrying Analysis - Analyzing your website again..."

### Test Case 4.3: Try Different Website

**Steps:**
1. From error fallback, click "Try Different Website"
2. Verify state reset

**Expected Results:**
- ✅ `seed_url` cleared
- ✅ `domain` cleared
- ✅ `analysis_status` cleared
- ✅ Navigate back to create-profile step
- ✅ Can enter new URL

---

## Phase 5: Zombie Profile Recovery

### Test Case 5.1: Detect Incomplete Completed Profile

**Setup:**
```sql
-- Create zombie profile (completed but missing data)
UPDATE business_profiles 
SET onboarding_completed = true,
    current_onboarding_step = 'completed',
    business_name = '',
    industry = '',
    city = '',
    state = ''
WHERE user_id = '<current_user_id>';
```

**Steps:**
1. Navigate to `/business/onboarding`
2. Observe automatic recovery

**Expected Results:**
- ✅ Console log: "Detected zombie profile (incomplete but marked complete), resetting..."
- ✅ Toast: "Profile Reset Required - Your previous profile was incomplete. Let's complete your setup."
- ✅ Database updated:
  - `onboarding_completed` → `false`
  - `current_onboarding_step` → `'business_profile'`
  - `analysis_status` → `'failed'`
  - `analysis_error` → "Profile was incomplete, requires re-onboarding"
- ✅ User taken to create-profile step

### Test Case 5.2: Stale Pending Analysis

**Setup:**
```sql
-- Create stale analysis (pending for >2 minutes)
UPDATE business_profiles 
SET analysis_status = 'pending',
    analysis_started_at = NOW() - INTERVAL '3 minutes'
WHERE user_id = '<current_user_id>';
```

**Steps:**
1. Navigate to `/business/onboarding`
2. Observe timeout recovery

**Expected Results:**
- ✅ Console log: "Stale analysis detected, marking as timeout"
- ✅ Toast: "Previous Analysis Timeout - Your previous analysis didn't complete. Let's try again or fill manually."
- ✅ `analysis_status` updated to `'timeout'`
- ✅ User shown analysis-error step

---

## Phase 6: Validation Tests

### Test Case 6.1: Prevent Completion with Missing Fields

**Steps:**
1. Complete onboarding to review step
2. In database, manually clear a required field:
```sql
UPDATE business_profiles 
SET business_name = ''
WHERE user_id = '<current_user_id>';
```
3. Refresh page to reload profile
4. Click "Approve & Complete"

**Expected Results:**
- ✅ Toast: "Incomplete Profile - Please fill in: business_name"
- ✅ Onboarding does NOT complete
- ✅ User redirected to edit form
- ✅ `onboarding_completed` remains `false`

### Test Case 6.2: Server-Side Validation

**Steps:**
1. Intercept `completeOnboarding` call
2. Verify server checks required fields

**Expected Results:**
- ✅ Function queries current profile data
- ✅ Validates: `business_name`, `industry`, `city`, `state`
- ✅ If any missing, throws error: "Cannot complete onboarding with missing required fields"
- ✅ Toast shows error
- ✅ User cannot proceed

### Test Case 6.3: Button Disabled on Missing Data

**Steps:**
1. Navigate to profile review
2. Inspect "Approve & Complete" button

**Expected Results:**
- ✅ Button disabled if any required field is empty
- ✅ Button enabled only when all fields present:
  - `business_name` ✓
  - `industry` ✓
  - `city` ✓
  - `state` ✓

---

## Phase 7: Real-time Subscription Tests

### Test Case 7.1: Status Polling

**Steps:**
1. Start website analysis
2. Open browser DevTools → Network tab
3. Monitor Supabase queries

**Expected Results:**
- ✅ Every 5 seconds: Query to `business_profiles` table
- ✅ Selects: `analysis_status`, `analysis_error`
- ✅ Filtered by `profile.id`

### Test Case 7.2: Status Change Detection

**Steps:**
1. Start website analysis (stays on spinner)
2. In separate tab, manually update database:
```sql
UPDATE business_profiles 
SET analysis_status = 'completed'
WHERE user_id = '<current_user_id>';
```
3. Wait up to 5 seconds

**Expected Results:**
- ✅ Real-time subscription OR polling detects change
- ✅ Progress jumps to 100%
- ✅ (In real scenario with data) Auto-advance to review

---

## Phase 8: Edge Cases

### Test Case 8.1: Network Interruption During Analysis

**Steps:**
1. Start website analysis
2. Disconnect internet mid-analysis
3. Reconnect after 30 seconds

**Expected Results:**
- ✅ Polling fails gracefully (no crashes)
- ✅ Once reconnected, polling resumes
- ✅ If timeout reached (60s), show timeout UI

### Test Case 8.2: Multiple Tab Behavior

**Steps:**
1. Open onboarding in Tab A
2. Start website analysis
3. Open same onboarding URL in Tab B

**Expected Results:**
- ✅ Both tabs show analysis spinner
- ✅ Both tabs poll for status
- ✅ Upon completion, both tabs advance to review (or first tab to interact)

### Test Case 8.3: Browser Refresh During Analysis

**Steps:**
1. Start website analysis
2. Refresh page (F5)

**Expected Results:**
- ✅ On mount, checks `analysis_status`
- ✅ If still `'pending'`: Resumes website-analysis step
- ✅ Continues polling
- ✅ If completed meanwhile: Advance to review

---

## Phase 9: Make.com Integration (External Team)

### Required Webhook Response Format

**On Success:**
```json
{
  "profile_id": "uuid",
  "status": "completed",
  "business_name": "Applebee's",
  "industry": "Restaurant",
  "city": "Kansas City",
  "state": "MO",
  "company_bio": "...",
  "main_values": ["Community", "Quality"],
  "website": "https://applebees.com"
}
```

**Database Update SQL:**
```sql
UPDATE business_profiles 
SET 
  analysis_status = 'completed',
  business_name = 'Applebee\'s',
  industry = 'Restaurant',
  city = 'Kansas City',
  state = 'MO',
  company_bio = '...',
  main_values = '["Community", "Quality"]',
  website = 'https://applebees.com',
  analysis_error = NULL
WHERE id = '<profile_id>';
```

**On Failure:**
```json
{
  "profile_id": "uuid",
  "status": "failed",
  "error": "Website is not accessible or behind firewall"
}
```

**Database Update SQL:**
```sql
UPDATE business_profiles 
SET 
  analysis_status = 'failed',
  analysis_error = 'Website is not accessible or behind firewall'
WHERE id = '<profile_id>';
```

---

## Phase 10: User Flow Scenarios

### Scenario A: Fast Success (Ideal)
1. Enter URL → Analysis (10s) → Review → Complete
2. **Total time:** ~30 seconds

### Scenario B: Slow Success (Acceptable)
1. Enter URL → Warning (30s) → Complete (45s) → Review → Complete
2. **Total time:** ~90 seconds

### Scenario C: Timeout (Fallback)
1. Enter URL → Warning (30s) → Timeout (60s) → Manual Entry → Review → Complete
2. **Total time:** ~3 minutes

### Scenario D: Failure → Retry Success
1. Enter URL → Failure → Try Again → Success → Review → Complete
2. **Total time:** ~2 minutes

### Scenario E: Failure → Manual Entry
1. Enter URL → Failure → Fill Manually → Review → Complete
2. **Total time:** ~2 minutes

---

## Acceptance Criteria Summary

- ✅ **No infinite waiting**: 60-second timeout enforced
- ✅ **Clear user communication**: Toasts at every stage
- ✅ **Graceful failure handling**: Error fallback with retry options
- ✅ **Data validation**: Cannot complete with missing fields
- ✅ **Zombie profile recovery**: Auto-reset incomplete profiles
- ✅ **Stale analysis detection**: Mark as timeout if >2 minutes old
- ✅ **Real-time updates**: Detect status changes without refresh
- ✅ **Multiple fallback paths**: Retry, Manual Entry, Different URL

---

## Next Steps

1. ✅ **Database Migration Applied**
2. ✅ **Code Implementation Complete**
3. 🔄 **Testing in Progress** (use this guide)
4. ⏳ **Make.com Team**: Update webhook to use new status fields
5. ⏳ **Production Deployment**: Once all tests pass

---

## Troubleshooting

### Issue: Analysis stuck at 95%
- **Check:** Database `analysis_status` - is it still `'pending'`?
- **Fix:** Make.com needs to update status to `'completed'` or `'failed'`

### Issue: Timeout not triggering
- **Check:** Console logs for timeout timers
- **Fix:** Verify `timeoutMs` prop passed to `AnalysisSpinner`

### Issue: Zombie profile not resetting
- **Check:** Database fields - are all required fields actually empty?
- **Fix:** Run manual SQL to reset if needed

### Issue: Real-time updates not working
- **Check:** Browser console for Supabase channel subscription
- **Check:** Supabase dashboard → Database → Replication settings
- **Fix:** Ensure `REPLICA IDENTITY FULL` and publication enabled

---

**Document Version:** 1.0  
**Last Updated:** 2025-10-13  
**Status:** Ready for Testing
