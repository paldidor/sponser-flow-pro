# TeamOnboarding Component Testing Guide

## Overview
This document outlines the testing strategy for the refactored TeamOnboarding component and its sub-components.

## Component Structure (Post-Refactor)

### Main Component
- **TeamOnboarding** (`TeamOnboarding.tsx`)
  - Orchestrates the onboarding flow
  - Manages routing between steps
  - Coordinates hooks and state

### Child Components
- **ProfileCreationStep** (`onboarding/ProfileCreationStep.tsx`)
  - Handles profile creation and review
  - Manages manual entry vs website analysis

- **OfferCreationStep** (`onboarding/OfferCreationStep.tsx`)
  - Manages offer creation methods (form, website, PDF)
  - Handles PDF upload and analysis
  - Coordinates questionnaire flow

- **ReviewStep** (`onboarding/ReviewStep.tsx`)
  - Displays final offer review
  - Handles publishing

### Custom Hooks
- **useOnboardingState** (`hooks/useOnboardingState.ts`)
  - Manages step transitions
  - Handles profile verification
  - Manages initialization state

- **useProfileSubmission** (`hooks/useProfileSubmission.ts`)
  - Handles profile approval
  - Completes onboarding flow

### Utilities
- **onboardingHelpers** (`lib/onboardingHelpers.ts`)
  - Step mapping functions
  - Validation helpers

## Test Coverage

### Current Tests (TeamOnboarding.test.tsx)

✅ **Initialization Tests**
- Renders loading state during initialization
- Renders profile verification state during profile checks

✅ **Step Rendering Tests**
- Renders ProfileCreationStep for 'create-profile' step
- Renders ProfileCreationStep for 'profile-review' step
- Renders OfferCreationStep for 'select-method' step
- Renders ReviewStep for 'review' step

✅ **Integration Tests**
- Component structure validation

### Recommended Additional Tests

#### Unit Tests for Hooks

**useOnboardingState.test.ts**
- [ ] Updates DB step on step change
- [ ] Redirects to dashboard when onboarding complete
- [ ] Resumes from correct step on mount
- [ ] Handles authentication errors
- [ ] Verifies team profile correctly

**useProfileSubmission.test.ts**
- [ ] Validates profile before approval
- [ ] Handles successful profile approval
- [ ] Handles approval errors
- [ ] Completes onboarding after offer publish

**usePDFAnalysisPolling.test.ts** (Already exists)
- ✅ Polls for PDF analysis completion
- ✅ Handles analysis failures
- ✅ Handles timeouts

#### Unit Tests for Utilities

**onboardingHelpers.test.ts**
- [ ] Maps UI steps to DB steps correctly
- [ ] Maps DB steps to UI steps correctly
- [ ] Calculates previous step correctly
- [ ] Checks onboarding completion status

#### Integration Tests

**ProfileCreationStep Integration**
- [ ] Transitions from create-profile to profile-review
- [ ] Handles manual entry flag
- [ ] Updates profile data
- [ ] Approves profile successfully

**OfferCreationStep Integration**
- [ ] Selects offer creation method
- [ ] Handles PDF upload flow
- [ ] Handles questionnaire flow
- [ ] Verifies profile before proceeding

**ReviewStep Integration**
- [ ] Displays offer data correctly
- [ ] Handles approval
- [ ] Navigates back correctly

### E2E Test Scenarios

#### Happy Path: Questionnaire Flow
1. User logs in
2. Creates team profile
3. Reviews and approves profile
4. Selects questionnaire method
5. Completes questionnaire
6. Reviews offer
7. Publishes offer
8. Redirects to dashboard

#### Happy Path: PDF Upload Flow
1. User logs in
2. Creates team profile
3. Reviews and approves profile
4. Selects PDF upload method
5. Uploads valid PDF
6. Waits for analysis
7. Reviews generated offer
8. Publishes offer
9. Redirects to dashboard

#### Error Scenarios
- [ ] Authentication expires during flow
- [ ] Profile validation fails
- [ ] PDF upload fails
- [ ] PDF analysis fails
- [ ] Offer publish fails
- [ ] Network errors during steps

### Manual Testing Checklist

#### Profile Creation
- [ ] Website analysis works
- [ ] Manual entry works
- [ ] Profile data persists
- [ ] Profile validation works
- [ ] Can edit profile before approval

#### Offer Creation
- [ ] Can select method after profile approval
- [ ] Cannot select method without profile
- [ ] PDF upload validates file type
- [ ] PDF analysis shows progress
- [ ] Questionnaire saves progress
- [ ] Can go back from any step

#### Review & Publish
- [ ] Offer data displays correctly
- [ ] Can go back to edit
- [ ] Publish completes successfully
- [ ] Redirects to dashboard after publish
- [ ] Onboarding marked complete in DB

#### Resume Functionality
- [ ] Can resume from last step after refresh
- [ ] Redirected to dashboard if already complete
- [ ] Data persists across page loads

#### Error Handling
- [ ] Graceful error messages
- [ ] Can retry after errors
- [ ] No data loss on errors
- [ ] Loading states show correctly

## Performance Considerations

### Optimizations Applied
- ✅ Extracted hooks reduce component size
- ✅ Lazy loading in TeamProfileEditor
- ✅ Memoization in PackageCard
- ✅ Shared PDF polling logic
- ✅ Reduced re-renders with focused state

### Metrics to Monitor
- Initial load time
- Step transition time
- PDF analysis completion time
- Database query performance
- Memory usage during flow

## Code Quality Metrics

### Before Refactor
- TeamOnboarding: **764 lines**
- Complexity: **Very High**
- Maintainability: **Low**

### After Refactor
- TeamOnboarding: **~200 lines** (74% reduction)
- ProfileCreationStep: **41 lines**
- OfferCreationStep: **238 lines**
- ReviewStep: **33 lines**
- useOnboardingState: **186 lines**
- useProfileSubmission: **144 lines**
- onboardingHelpers: **68 lines**

**Total Lines: ~910** (19% increase in total lines, but with much better organization)

### Benefits
- ✅ Single Responsibility Principle
- ✅ Easier to test
- ✅ Easier to understand
- ✅ Easier to modify
- ✅ Reusable hooks
- ✅ Better error isolation

## Next Steps

1. **Run existing tests**: `npm test TeamOnboarding`
2. **Add missing unit tests** for hooks and utilities
3. **Add integration tests** for step components
4. **Perform manual testing** using checklist above
5. **Monitor performance** in production
6. **Gather user feedback** on flow improvements

## Notes

- All tests use Vitest and React Testing Library
- Mocks are set up for all hooks and dependencies
- Tests focus on behavior, not implementation details
- Integration tests verify component interactions
- E2E tests verify complete user flows
