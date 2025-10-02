# Sponsorship Review - Testing & Quality Assurance Checklist

## Phase 5: Comprehensive Testing Guide

This document provides a complete testing checklist for the editable Sponsorship Review screen.

---

## 1. Package Management Tests

### ✅ Edit Existing Package
- [ ] Click the pencil icon on any package
- [ ] Edit package name (try special characters, very long names)
- [ ] Edit package price (try negative, zero, decimal values)
- [ ] Add/remove placements
- [ ] Save changes and verify they persist
- [ ] Cancel editing and verify no changes are saved
- [ ] Verify total potential updates correctly after edit

### ✅ Create New Package
- [ ] Click "Add Package" button
- [ ] Create package with valid data
- [ ] Try to create package with empty name (should show error)
- [ ] Try to create package with price = 0 (should show error)
- [ ] Try to create package with no placements (should show error)
- [ ] Create package with custom placements
- [ ] Verify new package appears in the list
- [ ] Verify total potential updates correctly

### ✅ Delete Package
- [ ] Click delete icon on a package
- [ ] Verify confirmation dialog appears
- [ ] Cancel deletion - package should remain
- [ ] Confirm deletion - package should be removed
- [ ] Verify total potential updates correctly
- [ ] Try deleting when only 1 package exists (should allow, but validate on launch)
- [ ] Refresh page and verify package is still deleted

### ✅ Placement Selection
- [ ] Search for placements by name
- [ ] Expand/collapse placement categories
- [ ] Select multiple placements from different categories
- [ ] Select popular placements
- [ ] Create custom placement
- [ ] Try creating duplicate custom placement (should show error)
- [ ] Verify selected placements show checkmarks

---

## 2. Team Profile Editing Tests

### ✅ Basic Info Tab
- [ ] Click edit icon on Team Overview card
- [ ] Edit team name (required field - try empty)
- [ ] Edit sport (required field - try empty)
- [ ] Edit location (required field - try empty)
- [ ] Edit number of players
- [ ] Edit team bio (try very long text)
- [ ] Add team values (tags)
- [ ] Remove team values
- [ ] Try adding duplicate team value (should show error)
- [ ] Save changes and verify they reflect in Team Overview

### ✅ Competition Tab
- [ ] Change level of play dropdown
- [ ] Change competition scope dropdown
- [ ] Change organization status dropdown
- [ ] Edit email list size (try negative numbers)
- [ ] Select season start date
- [ ] Select season end date
- [ ] Try end date before start date (should allow but show warning)
- [ ] Save and verify all fields persist

### ✅ Social Media Tab
- [ ] Enter Instagram URL (try invalid format)
- [ ] Enter Instagram followers (try negative numbers)
- [ ] Enter Facebook URL (try invalid format)
- [ ] Enter Twitter URL (try invalid format)
- [ ] Enter LinkedIn URL (try invalid format)
- [ ] Enter YouTube URL (try invalid format)
- [ ] Try saving with invalid social media URLs (should show specific error)
- [ ] Clear social media fields (should allow empty)
- [ ] Save and verify total audience reach updates correctly

---

## 3. Campaign Details Editing Tests

### ✅ Fundraising Goal
- [ ] Click pencil icon to edit
- [ ] Change to valid positive number
- [ ] Try changing to 0 (should show error)
- [ ] Try changing to negative number (should show error)
- [ ] Try entering non-numeric value (should prevent or show error)
- [ ] Try very large number (>10M, should show warning)
- [ ] Save and verify value updates
- [ ] Cancel and verify original value remains
- [ ] Verify value persists after page refresh

### ✅ Campaign Duration
- [ ] Click pencil icon to edit
- [ ] Change to valid text (e.g., "1 Season", "6 Months")
- [ ] Try empty duration (should show error on save)
- [ ] Try very long text (>200 characters)
- [ ] Save and verify value updates
- [ ] Cancel and verify original value remains

### ✅ Campaign Description
- [ ] Click pencil icon to edit (even if no description exists)
- [ ] Add new description
- [ ] Edit existing description
- [ ] Try very long description (>1000 characters)
- [ ] Clear description (should allow empty)
- [ ] Save and verify value updates
- [ ] Cancel and verify original value remains

---

## 4. Validation Tests

### ✅ Launch Campaign Validation
- [ ] Try launching with no team profile (should show error)
- [ ] Try launching with incomplete team profile (missing name/sport/location)
- [ ] Try launching with no packages (should show error)
- [ ] Try launching with invalid package (empty name, price=0, no placements)
- [ ] Try launching with fundraising goal = 0 (should show error)
- [ ] Try launching with empty duration (should show error)
- [ ] Launch with all valid data (should succeed)

### ✅ Real-time Validation
- [ ] Observe validation messages appear immediately
- [ ] Verify validation messages are clear and actionable
- [ ] Verify required fields are marked with asterisk (*)
- [ ] Verify error states are visually distinct (red borders, etc.)

---

## 5. Error Handling Tests

### ✅ Network Error Simulation
- [ ] Disconnect internet while editing
- [ ] Try saving package (should show error, rollback changes)
- [ ] Try saving team profile (should show error, rollback changes)
- [ ] Try saving campaign details (should show error, rollback changes)
- [ ] Try deleting package (should show error, keep package)
- [ ] Reconnect internet and verify retry works

### ✅ Database Error Simulation
- [ ] Test with invalid offer ID (if possible)
- [ ] Test with deleted package ID
- [ ] Verify error messages are user-friendly
- [ ] Verify rollback works correctly on all operations

### ✅ Permission Errors
- [ ] Test editing another user's offer (should fail with proper error)
- [ ] Verify RLS policies are enforced

---

## 6. Performance Tests

### ✅ Loading States
- [ ] Verify spinner/skeleton shows while loading packages
- [ ] Verify spinner shows while loading team profile
- [ ] Verify "Saving..." state shows during save operations
- [ ] Verify UI doesn't freeze during operations
- [ ] Verify no duplicate API calls

### ✅ Large Data Sets
- [ ] Create 10+ packages and verify performance
- [ ] Add 50+ placements and verify search/filter performance
- [ ] Test with very long team bio (1000+ characters)
- [ ] Test with 20+ team values
- [ ] Verify no memory leaks after multiple edits

### ✅ Responsiveness
- [ ] Test on mobile viewport (320px width)
- [ ] Test on tablet viewport (768px width)
- [ ] Test on desktop viewport (1920px width)
- [ ] Verify modals are scrollable on small screens
- [ ] Verify touch interactions work on mobile
- [ ] Verify keyboard navigation works

---

## 7. UI/UX Tests

### ✅ Visual Feedback
- [ ] Success toasts appear for successful saves
- [ ] Error toasts appear for failures
- [ ] Loading indicators show during async operations
- [ ] Hover states work on all interactive elements
- [ ] Focus states are visible for keyboard navigation
- [ ] Disabled states are visually distinct

### ✅ User Flow
- [ ] Natural tab order through form fields
- [ ] Enter key submits forms where appropriate
- [ ] Escape key cancels edit mode
- [ ] Back button works correctly
- [ ] Confirmation dialogs appear for destructive actions
- [ ] Success messages are clear and celebratory

### ✅ Accessibility
- [ ] Screen reader can read all labels
- [ ] All form fields have associated labels
- [ ] Error messages are announced
- [ ] Keyboard-only navigation works
- [ ] Color contrast meets WCAG AA standards
- [ ] Focus trap works in modals

---

## 8. Data Persistence Tests

### ✅ Refresh After Edit
- [ ] Edit package, save, refresh page (should persist)
- [ ] Edit team profile, save, refresh page (should persist)
- [ ] Edit campaign details, save, refresh page (should persist)
- [ ] Delete package, refresh page (should remain deleted)

### ✅ Browser Back/Forward
- [ ] Navigate to review screen
- [ ] Make edits
- [ ] Click browser back button
- [ ] Click browser forward button
- [ ] Verify state is correct

### ✅ Multiple Browser Tabs
- [ ] Open review screen in two tabs
- [ ] Edit in tab 1, save
- [ ] Refresh tab 2 (should show updated data)
- [ ] Verify no data conflicts

---

## 9. Edge Cases

### ✅ Boundary Conditions
- [ ] Package price at minimum ($1)
- [ ] Package price at maximum ($9,999,999)
- [ ] Zero packages created
- [ ] 100+ packages created
- [ ] Team name with special characters (!@#$%^&*)
- [ ] Team name with emojis (🏆⚽🎯)
- [ ] Very long URLs in social media fields

### ✅ Race Conditions
- [ ] Rapidly click save multiple times
- [ ] Edit multiple fields quickly and save
- [ ] Delete package while editing it
- [ ] Close modal while saving

### ✅ Incomplete States
- [ ] No team profile created yet
- [ ] Team profile partially filled
- [ ] No packages created yet
- [ ] Package partially filled

---

## 10. Integration Tests

### ✅ End-to-End Flow
- [ ] Start from homepage
- [ ] Create team profile
- [ ] Upload PDF or use questionnaire
- [ ] Arrive at review screen
- [ ] Edit team profile
- [ ] Edit campaign details
- [ ] Add new package
- [ ] Edit existing package
- [ ] Delete a package
- [ ] Launch campaign
- [ ] Verify campaign appears in dashboard

### ✅ Cross-Component Communication
- [ ] Verify total potential updates when packages change
- [ ] Verify total reach updates when team profile changes
- [ ] Verify validation works across all sections
- [ ] Verify parent component receives updated data

---

## Testing Notes

### Critical Issues (Must Fix Before Launch)
- Document any critical bugs found during testing
- Note any data loss scenarios
- Note any security vulnerabilities

### Nice-to-Have Improvements
- Document UX improvements
- Note performance optimizations
- Note accessibility enhancements

### Known Limitations
- Document any known limitations
- Note any browser compatibility issues
- Note any device-specific issues

---

## Sign-off

**Tester Name:** _________________  
**Date:** _________________  
**Environment:** _________________  
**Result:** ☐ Pass  ☐ Fail  ☐ Pass with Issues

**Notes:**
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
