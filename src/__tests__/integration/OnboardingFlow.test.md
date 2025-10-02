# Onboarding Flow Integration Tests

## Test Scenarios

### 1. New User Profile Creation Flow

**Scenario**: User creates a team profile for the first time

**Steps**:
1. Navigate to `/team/onboarding`
2. System checks for existing profile
3. Shows "Create Profile" step
4. User enters team information
5. User reviews and approves profile
6. Profile is saved to database
7. User proceeds to offer creation

**Expected Results**:
- ✅ No existing profile found
- ✅ Profile form displays with all fields
- ✅ Validation prevents submission with missing required fields
- ✅ Profile review shows correct data
- ✅ Profile is saved with user_id correctly linked
- ✅ User navigates to method selection

**Error Cases**:
- Missing required fields → Show validation error
- Database connection failure → Show retry option
- Authentication expired → Redirect to login

---

### 2. Returning User Navigation

**Scenario**: User with existing profile visits onboarding

**Steps**:
1. Navigate to `/team/onboarding`
2. System checks for existing profile
3. Profile found
4. User is redirected to dashboard

**Expected Results**:
- ✅ Profile check completes quickly (< 2s)
- ✅ User redirected to `/team/dashboard`
- ✅ No unnecessary steps shown

**Error Cases**:
- Database query timeout → Show error, allow retry
- Profile data corrupted → Handle gracefully

---

### 3. Questionnaire-Based Offer Creation

**Scenario**: User creates sponsorship offer via questionnaire

**Steps**:
1. From profile review, proceed to method selection
2. Select "Fill out form" option
3. Complete multi-step questionnaire:
   - Fundraising goal
   - Impact selection
   - Supported players
   - Duration
   - Package builder
4. Submit questionnaire
5. System loads generated offer
6. Review offer details
7. Approve and publish

**Expected Results**:
- ✅ All questionnaire steps accessible
- ✅ Back button navigates correctly
- ✅ Progress indicator shows current step
- ✅ Form data persists between steps
- ✅ Offer created in database with status 'published'
- ✅ Packages and placements linked correctly
- ✅ User redirected to dashboard

**Validation Tests**:
- Fundraising goal > 0
- At least one package created
- Duration selected
- Impact tags provided

**Error Cases**:
- Incomplete questionnaire → Prevent submission
- Database write failure → Show error, allow retry
- No team profile found → Redirect to profile creation

---

### 4. PDF-Based Offer Creation

**Scenario**: User creates offer by uploading PDF

**Steps**:
1. From method selection, choose "Upload PDF"
2. Upload sponsorship PDF file
3. PDF validation checks:
   - File type is PDF
   - File size < 10MB
   - File not empty
4. PDF uploaded to Supabase storage
5. Analysis function triggered
6. Wait for AI analysis (polling)
7. Review extracted data
8. Approve and publish

**Expected Results**:
- ✅ File validation works correctly
- ✅ Upload progress shown
- ✅ Analysis progress tracked
- ✅ Extracted data formatted correctly
- ✅ Packages and placements created
- ✅ Offer published successfully

**Error Cases**:
- Invalid file type → Show error immediately
- File too large → Prevent upload
- Upload failure → Allow retry
- Analysis timeout → Show message, redirect to dashboard
- Analysis failure → Allow re-upload or alternate method

---

### 5. Profile Editing During Onboarding

**Scenario**: User edits profile information

**Steps**:
1. On profile review page
2. Click edit on any field
3. Modify value
4. Save changes
5. Changes reflected immediately
6. Optimistic UI update
7. Database updated

**Expected Results**:
- ✅ Edit mode activates inline
- ✅ Original value shown in input
- ✅ Validation applied on save
- ✅ UI updates optimistically
- ✅ Success toast shown
- ✅ Edit mode closes after save
- ✅ On error, value reverts

**Validation Tests**:
- Social media URLs validated by platform
- Required fields cannot be empty
- Numeric fields validate positive numbers
- No duplicate values in arrays

---

### 6. Authentication Edge Cases

**Scenario**: Handle authentication issues during flow

**Test Cases**:

**6.1 Session Expires During Profile Creation**
- User fills profile form
- Session expires
- Attempt to save → Auth error
- User redirected to login
- After login, return to onboarding

**6.2 Session Expires During PDF Upload**
- User uploads PDF
- Session expires during analysis
- System detects auth failure
- Show error message
- Redirect to login

**Expected Results**:
- ✅ Auth errors detected early
- ✅ User informed clearly
- ✅ Graceful redirect to login
- ✅ No data corruption

---

### 7. Loading States

**Scenario**: Verify all loading states work correctly

**Test Points**:
- Initial profile check
- Profile verification before method selection
- Offer data loading
- Publishing offer
- PDF analysis progress

**Expected Results**:
- ✅ Loading indicators shown appropriately
- ✅ Messages provide context
- ✅ No infinite loading states
- ✅ Errors break loading state

---

## Performance Benchmarks

- Profile check: < 2 seconds
- Profile save: < 1 second
- Questionnaire submission: < 3 seconds
- PDF upload: Depends on file size
- PDF analysis: 20-60 seconds (expected)
- Offer review load: < 2 seconds

---

## Database Integrity Tests

### Profile Creation
- ✅ `team_profiles.user_id` correctly linked to `auth.users.id`
- ✅ All required fields populated
- ✅ No duplicate profiles per user
- ✅ Timestamps set correctly

### Offer Creation
- ✅ `sponsorship_offers.user_id` correctly linked
- ✅ `sponsorship_offers.team_profile_id` correctly linked
- ✅ Source field accurately reflects creation method
- ✅ Status transitions correctly (draft → published)

### Package & Placement Relationships
- ✅ Packages linked to offers via `sponsorship_offer_id`
- ✅ Placements linked to packages via `package_id`
- ✅ Placement options exist before linking
- ✅ Cascade deletes handled properly

---

## Security Tests

### Row Level Security (RLS)
- ✅ Users can only view their own profiles
- ✅ Users can only create offers for their own profile
- ✅ Users cannot access other users' data
- ✅ Anonymous users redirected to auth

### Input Validation
- ✅ SQL injection prevention
- ✅ XSS prevention in text fields
- ✅ File upload restrictions enforced
- ✅ URL validation for external links

---

## Accessibility Tests

- ✅ Keyboard navigation works throughout flow
- ✅ Focus management during step transitions
- ✅ Screen reader announcements for loading states
- ✅ Error messages are accessible
- ✅ Form labels properly associated

---

## Mobile Responsiveness Tests

- ✅ All steps render correctly on mobile
- ✅ Touch targets adequately sized
- ✅ Forms usable on small screens
- ✅ File upload works on mobile
- ✅ Navigation clear and accessible
