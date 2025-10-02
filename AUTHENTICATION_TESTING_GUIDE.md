# Authentication System - Testing Guide

## Implementation Summary

### ✅ Completed Phases

1. **Database - User Roles System**
   - Created `app_role` enum (team, business, admin)
   - Created `user_roles` table with RLS policies
   - Created `has_role()` security definer function
   - Updated `handle_new_user()` trigger to assign default 'team' role

2. **Enhanced useSmartAuth Hook**
   - Fetches user role from `user_roles` table
   - Determines redirect based on role AND profile existence
   - Returns role information to components

3. **Enhanced AuthFlow Component**
   - Better error handling for specific scenarios
   - Password validation (minimum 6 characters)
   - "Forgot Password" link (placeholder)
   - Enter key support for form submission
   - Improved sign-up/sign-in toggle UX

4. **Protected Route Enhancements**
   - Role-based access control
   - Team routes restricted to team users
   - Proper redirect logic for unauthorized access

5. **Header Component Updates**
   - Role-specific dashboard links
   - User dropdown menu with email and role display
   - Sign out functionality
   - Mobile-responsive navigation

## Testing Checklist

### 🔐 Phase 1: Authentication Flow

#### Sign Up Flow
- [ ] Navigate to `/auth`
- [ ] Click "Sign up" tab
- [ ] Test email validation:
  - [ ] Enter invalid email → Should show "Invalid email" error
  - [ ] Enter valid email → Should proceed
- [ ] Test password validation:
  - [ ] Enter password < 6 chars → Should show "Password must be at least 6 characters"
  - [ ] Enter password ≥ 6 chars → Should proceed
- [ ] Click "Create Account"
  - [ ] Should show "Account created!" toast
  - [ ] Should redirect to `/team/onboarding` (for new team user)
  - [ ] Check database: `user_roles` table should have entry with role='team'
- [ ] Try signing up with same email
  - [ ] Should show "Account exists" error
  - [ ] Should switch to sign-in mode

#### Sign In Flow
- [ ] Navigate to `/auth`
- [ ] Click "Sign in" link
- [ ] Test invalid credentials:
  - [ ] Enter wrong email/password → Should show "Invalid credentials"
- [ ] Test valid credentials:
  - [ ] Enter correct email/password
  - [ ] Should show "Welcome back!" toast
  - [ ] **Team user without profile** → Redirect to `/team/onboarding`
  - [ ] **Team user with profile** → Redirect to `/team/dashboard`

#### Google OAuth Flow
- [ ] Click "Continue with Google"
- [ ] Complete Google authentication
- [ ] Should create user + profile + role='team'
- [ ] Should redirect appropriately based on profile existence

#### Forgot Password
- [ ] In sign-in mode, click "Forgot password?"
- [ ] Should show placeholder message (feature coming soon)

### 👤 Phase 2: User Type Handling

#### Team User Journey
- [ ] Sign up as new user
- [ ] Verify role in database: `SELECT * FROM user_roles WHERE user_id = '<user_id>'`
  - [ ] Should show `role = 'team'`
- [ ] Should be redirected to `/team/onboarding`
- [ ] Complete onboarding to create team profile
- [ ] Sign out and sign back in
- [ ] Should be redirected to `/team/dashboard`

#### Business User Journey (Manual Setup Required)
- [ ] Manually update user role in database:
  ```sql
  UPDATE user_roles SET role = 'business' WHERE user_id = '<user_id>';
  ```
- [ ] Sign in
- [ ] Should redirect to `/marketplace` (future: /business/dashboard)
- [ ] Header should show "Marketplace" link instead of "Team Dashboard"

### 🔒 Phase 3: Protected Routes

#### Unauthenticated Access
- [ ] Sign out (if signed in)
- [ ] Try to access `/team/onboarding` → Should redirect to `/auth`
- [ ] Try to access `/team/dashboard` → Should redirect to `/auth`
- [ ] Try to access `/team/create-offer` → Should redirect to `/auth`

#### Team User Access Control
- [ ] Sign in as team user without profile
- [ ] Try to access `/team/dashboard` → Should redirect to `/team/onboarding`
- [ ] Complete profile creation
- [ ] Try to access `/team/onboarding` → Should redirect to `/team/dashboard`
- [ ] Access `/team/dashboard` → Should work ✅
- [ ] Access `/team/create-offer` → Should work ✅

#### Business User Access Control (Manual Setup)
- [ ] Sign in as business user (manually set role)
- [ ] Try to access `/team/dashboard` → Should redirect to `/marketplace`
- [ ] Try to access `/team/onboarding` → Should redirect to `/marketplace`

### 🎨 Phase 4: UI/UX Validation

#### Header Component
**Desktop View:**
- [ ] When signed out:
  - [ ] Shows "Sign In" and "Get Started" buttons
- [ ] When signed in as team user:
  - [ ] Shows "Team Dashboard" link
  - [ ] Shows "Account" dropdown with:
    - [ ] User email displayed
    - [ ] "Team Account" label
    - [ ] "Sign Out" option
- [ ] When signed in as business user:
  - [ ] Shows "Marketplace" link instead of "Team Dashboard"
  - [ ] Account dropdown shows "Business Account" label

**Mobile View:**
- [ ] Toggle mobile menu
- [ ] When signed out:
  - [ ] Shows "Sign In" and "Get Started" buttons
- [ ] When signed in:
  - [ ] Shows appropriate dashboard link
  - [ ] Shows user email and role label
  - [ ] Shows "Sign Out" button
  - [ ] Clicking any link closes the menu

#### Auth Page
- [ ] Loading spinner shows while checking auth
- [ ] Form inputs have proper icons (Mail, Lock)
- [ ] Enter key submits form from either input
- [ ] Toggle between sign-up and sign-in works smoothly
- [ ] All error messages are user-friendly and clear

### ⚠️ Phase 5: Error Handling

#### Network Errors
- [ ] Disable network in DevTools
- [ ] Try to sign in → Should show generic error message
- [ ] Re-enable network
- [ ] Should work normally

#### Common Auth Errors
- [ ] **Already registered:**
  - [ ] Sign up with existing email → Should suggest signing in instead
- [ ] **Invalid credentials:**
  - [ ] Sign in with wrong password → Should show clear error
- [ ] **Email not confirmed** (if enabled):
  - [ ] Sign in before confirming email → Should show appropriate message

#### Google OAuth Errors
- [ ] Block popups in browser
- [ ] Try Google sign-in → Should show "Popup blocked" error
- [ ] Allow popups and retry → Should work

#### Session Expiration
- [ ] Wait for session to expire (or manually clear storage)
- [ ] Try to access protected route → Should redirect to `/auth`

### 🔐 Phase 6: Security Validation

#### Database Security
- [ ] Verify RLS policies are enabled:
  ```sql
  SELECT tablename, rowsecurity 
  FROM pg_tables 
  WHERE schemaname = 'public' AND tablename = 'user_roles';
  ```
  - [ ] `rowsecurity` should be `true`

- [ ] Test user can only view their own role:
  ```sql
  -- Should return only current user's roles
  SELECT * FROM user_roles;
  ```

- [ ] Verify `has_role()` function works:
  ```sql
  SELECT has_role(auth.uid(), 'team');
  ```

#### Client-Side Security
- [ ] User role is fetched from database (not localStorage)
- [ ] Protected routes verify authentication on server side
- [ ] No sensitive data logged to console

## Known Issues / Future Enhancements

### Current Limitations
1. **Password Reset:** Placeholder only - needs full implementation
2. **Business Dashboard:** Currently redirects to marketplace
3. **Admin Role:** No dedicated admin interface yet
4. **Email Confirmation:** May need to be disabled in Supabase for testing

### Future Features
- [ ] Implement password reset flow
- [ ] Create business user dashboard
- [ ] Add admin panel
- [ ] Add profile settings page
- [ ] Implement "Remember Me" functionality
- [ ] Add 2FA support

## Quick Test Script

To quickly test the complete flow:

1. **Create new account:**
   - Go to `/auth` → Sign up → Use `test@example.com` / `password123`
   - Should redirect to `/team/onboarding`

2. **Complete onboarding:**
   - Fill in team profile
   - Should redirect to `/team/dashboard`

3. **Test session persistence:**
   - Refresh page → Should stay on dashboard
   - Navigate to `/` → Should show user dropdown in header

4. **Sign out and back in:**
   - Click Sign Out → Should go to `/`
   - Click Sign In → Enter credentials → Should go to `/team/dashboard`

## Database Queries for Debugging

```sql
-- Check user's role
SELECT ur.role, p.email 
FROM user_roles ur 
JOIN profiles p ON p.user_id = ur.user_id 
WHERE ur.user_id = auth.uid();

-- Check all users and their roles (admin only)
SELECT 
  p.email,
  ur.role,
  CASE WHEN tp.id IS NOT NULL THEN 'Yes' ELSE 'No' END as has_team_profile
FROM profiles p
LEFT JOIN user_roles ur ON ur.user_id = p.user_id
LEFT JOIN team_profiles tp ON tp.user_id = p.user_id
ORDER BY p.created_at DESC;

-- Manually change a user's role (for testing)
UPDATE user_roles 
SET role = 'business' 
WHERE user_id = '<user_id>';
```

## Support Resources

- **Supabase Auth Docs:** https://supabase.com/docs/guides/auth
- **RLS Guide:** https://supabase.com/docs/guides/auth/row-level-security
- **User Management:** https://supabase.com/dashboard/project/gtlxdbokhtdtfmziacai/auth/users
