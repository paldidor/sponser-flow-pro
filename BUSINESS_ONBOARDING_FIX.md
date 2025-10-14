# Business Onboarding Flow Fix

## Issue
Business users were being redirected to the Marketplace instead of the proper onboarding flow:
- **Current (Broken)**: Get-Started → I'm a business → Auth → **Marketplace**
- **Expected**: Get-Started → I'm a business → Auth → Create Profile → Social Media → Business Dashboard → AI Preferences Modal

## Root Cause
The `useSmartAuth` hook had a critical flaw on line 94:
```typescript
const userRole = (roleData?.role as UserRole) || 'team'; // Default to team
```

When a new business user signed up:
1. Role assignment happened in `AuthFlow`
2. `useSmartAuth` immediately re-checked auth state
3. Due to timing/race condition, the role wasn't found yet
4. Hook **defaulted to 'team'** instead of waiting
5. User was redirected using team logic instead of business logic

## Solution

### 1. Fixed useSmartAuth.ts
- Changed default role from `'team'` to `null` to prevent incorrect defaults
- Added explicit handling for users without roles yet
- Redirects to `/select-user-type` if no role is found instead of making assumptions

**Before:**
```typescript
const userRole = (roleData?.role as UserRole) || 'team'; // Default to team
```

**After:**
```typescript
// Don't default to 'team' - wait for role to be assigned
const userRole = (roleData?.role as UserRole) || null;
```

### 2. Added Delay in AuthFlow.tsx
Added 500ms delay after role assignment to ensure database has time to register the role before redirect:

```typescript
await assignUserRole(data.user.id, userType);

// Small delay to ensure role is registered before redirect
await new Promise(resolve => setTimeout(resolve, 500));

toast({ ... });
```

## Expected Flow Now

1. **User selects "I'm a business"** → `/auth?type=business`
2. **User signs up** → Role assigned in database
3. **500ms delay** → Ensures role is committed
4. **Auth state changes** → `useSmartAuth` re-checks
5. **Role found: 'business'** → No profile exists
6. **Redirect to** `/business/onboarding`
7. **ProfileCreationStep** → User fills in business info
8. **SocialsStep** → User adds social links (optional)
9. **Onboarding completion** → Sets `onboarding_completed=true`, `current_onboarding_step='completed'`
10. **Redirect to** `/business/dashboard`
11. **AI Preferences Modal** → Shows if preferences not completed

## Testing Checklist

✅ New business user signup flows to onboarding (not marketplace)
✅ Profile creation step saves all required fields
✅ Social media step allows skip
✅ Onboarding completion redirects to dashboard
✅ AI Preferences modal shows on first dashboard visit
✅ Returning business users go directly to dashboard
