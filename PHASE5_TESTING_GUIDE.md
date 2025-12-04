# Phase 5 Testing Guide - Profile Completion Wizard

## Overview
This guide will help you test all Phase 5 features including the Profile Completion Wizard, Profile Completeness Tracking, and Dashboard Integration.

---

## Prerequisites

1. **Ensure you're logged in as a student user**
2. **Have access to Supabase dashboard** (optional, for verifying data)
3. **Clear browser cache** if testing with existing profile

---

## Test 1: Profile Completion Wizard - Basic Flow

### Objective
Test the complete wizard flow from start to finish.

### Steps

1. **Navigate to Wizard**
   - Go to `/profile/wizard` or click "Complete Profile" from dashboard/profile
   - ✅ Wizard page loads
   - ✅ Progress indicator shows "Step 1 of 6"
   - ✅ Step 1 (Basic Information) is displayed

2. **Step 1: Basic Information**
   - Email should be pre-filled (read-only)
   - Enter Full Name (required)
   - Enter Phone Number (required)
   - Click "Next"
   - ✅ Validation works (can't proceed without required fields)
   - ✅ Progress indicator updates

3. **Step 2: Contact Details** (All optional)
   - Enter Address (optional)
   - Enter LinkedIn URL (optional)
   - Enter GitHub URL (optional)
   - Enter Website URL (optional)
   - Click "Next"
   - ✅ Can skip optional fields
   - ✅ URL validation (basic)

4. **Step 3: Academic Information**
   - Enter Major (required)
   - Select Degree Type (required)
   - Enter GPA (optional)
   - Enter Expected Graduation (optional)
   - Click "Next"
   - ✅ Required fields validated
   - ✅ Dropdown for degree type works

5. **Step 4: Professional Information**
   - Enter Preferred Industry (optional)
   - Enter Skills (comma-separated)
   - Enter Research Interests (comma-separated)
   - Click "Next"
   - ✅ Comma-separated values parsed correctly

6. **Step 5: Work Experience** (Optional)
   - Click "Add Work Experience"
   - Fill in form fields
   - Save entry
   - ✅ Entry appears in list
   - ✅ Can edit/delete entries
   - ✅ Can skip this step

7. **Step 6: Career Goals**
   - Enter Career Goals (optional)
   - Click "Complete Profile"
   - ✅ All data saves
   - ✅ Redirects to dashboard
   - ✅ Success message/indicator

### Expected Results
- ✅ All 6 steps complete successfully
- ✅ All data saved to database
- ✅ Profile completeness shows 100%

---

## Test 2: Profile Completeness Calculation

### Objective
Verify completeness calculation is accurate.

### Steps

1. **Check Initial Completeness**
   - View profile page (`/profile`)
   - Note completeness percentage
   - ✅ Percentage displays (0-100%)
   - ✅ Progress bar shows correct percentage

2. **Test Required Fields**
   - Check which fields are required:
     - Full Name ✅
     - Email ✅ (auto-filled)
     - Phone ✅
     - Major ✅
     - Degree Type ✅

3. **Complete One Field**
   - Edit profile and add Phone Number
   - Check completeness percentage
   - ✅ Percentage increases appropriately

4. **Complete All Required Fields**
   - Fill in all required fields
   - Check completeness
   - ✅ Shows 100% when all required fields complete

### Expected Results
- ✅ Completeness calculates correctly
- ✅ Only required fields count toward 100%
- ✅ Percentage updates in real-time

---

## Test 3: Profile Completeness Card on Profile Page

### Objective
Test the completeness card display and functionality.

### Steps

1. **View Profile Page**
   - Navigate to `/profile`
   - ✅ Completeness card appears at top (for students)
   - ✅ Shows completion percentage
   - ✅ Progress bar displays

2. **Test Incomplete Profile** (< 100%)
   - Ensure profile is incomplete
   - ✅ Card has yellow border/background
   - ✅ Shows missing required fields
   - ✅ Shows suggestions
   - ✅ "Complete Profile" button visible
   - ✅ Button links to `/profile/wizard`

3. **Test Complete Profile** (100%)
   - Complete all required fields
   - Refresh profile page
   - ✅ Card has green border/background
   - ✅ Shows "Your profile is complete! 🎉"
   - ✅ No missing fields listed
   - ✅ Button shows "Update Profile" (optional)

4. **Test Non-Student Roles**
   - Log in as faculty/admin
   - View profile page
   - ✅ Completeness card does NOT appear

### Expected Results
- ✅ Card displays correctly for students
- ✅ Visual indicators match completion status
- ✅ Missing fields are listed accurately
- ✅ Link to wizard works

---

## Test 4: Dashboard Completion Prompt

### Objective
Test the dashboard prompt for incomplete profiles.

### Steps

1. **Test Incomplete Profile**
   - Log in as student with incomplete profile
   - Go to dashboard
   - ✅ Completeness card appears at top
   - ✅ Shows completion percentage
   - ✅ Lists missing fields
   - ✅ "Complete Profile" button visible

2. **Click "Complete Profile"**
   - Click the button
   - ✅ Redirects to `/profile/wizard`
   - ✅ Wizard loads correctly

3. **Complete Profile**
   - Complete wizard
   - Return to dashboard
   - ✅ Prompt card disappears
   - ✅ Profile completion card in dashboard shows 100%

4. **Test Complete Profile**
   - Log in as student with complete profile
   - Go to dashboard
   - ✅ Prompt card does NOT appear
   - ✅ Regular dashboard content displays

5. **Test Other Roles**
   - Log in as faculty/admin
   - Go to dashboard
   - ✅ Prompt card does NOT appear

### Expected Results
- ✅ Prompt shows for incomplete student profiles
- ✅ Hidden for complete profiles
- ✅ Hidden for non-student roles
- ✅ Link to wizard works

---

## Test 5: Wizard - Pre-fill Existing Data

### Objective
Test that existing profile data pre-fills in wizard.

### Steps

1. **Edit Existing Profile**
   - Go to profile page
   - Add some profile information (name, phone, major)
   - Save changes

2. **Open Wizard**
   - Navigate to `/profile/wizard`
   - ✅ Step 1: Name and phone pre-filled
   - ✅ Step 2: Contact details pre-filled (if added)
   - ✅ Step 3: Academic info pre-filled (if added)
   - ✅ Step 4: Professional info pre-filled (if added)
   - ✅ Step 5: Work experience shows existing entries
   - ✅ Step 6: Career goals pre-filled (if added)

3. **Update Data**
   - Modify existing fields
   - Complete wizard
   - ✅ Changes save correctly
   - ✅ Old data replaced with new data

### Expected Results
- ✅ All existing data pre-fills correctly
- ✅ Can update existing fields
- ✅ Changes persist after saving

---

## Test 6: Wizard - Form Validation

### Objective
Test form validation in wizard steps.

### Steps

1. **Step 1 Validation**
   - Try to proceed without Full Name
   - ✅ Error message appears
   - ✅ Cannot proceed
   - Try to proceed without Phone
   - ✅ Error message appears
   - ✅ Cannot proceed

2. **Step 3 Validation**
   - Try to proceed without Major
   - ✅ Error message appears
   - Try to proceed without Degree Type
   - ✅ Error message appears

3. **URL Validation** (Step 2)
   - Enter invalid URLs
   - ✅ Basic validation (or graceful handling)

### Expected Results
- ✅ Required field validation works
- ✅ Error messages display clearly
- ✅ Cannot proceed without required fields

---

## Test 7: Wizard - Navigation

### Objective
Test wizard navigation between steps.

### Steps

1. **Forward Navigation**
   - Complete Step 1
   - Click "Next"
   - ✅ Moves to Step 2
   - ✅ Progress indicator updates
   - Repeat for all steps

2. **Backward Navigation**
   - On Step 3, click "Back"
   - ✅ Returns to Step 2
   - ✅ Data is preserved
   - ✅ Can navigate back and forth

3. **Progress Indicator**
   - Navigate through steps
   - ✅ Progress bar updates correctly
   - ✅ Step numbers update
   - ✅ Completed steps show checkmark

4. **Skip Steps** (Optional fields)
   - Skip optional steps
   - ✅ Can proceed without filling
   - ✅ Progress still updates

### Expected Results
- ✅ Navigation works smoothly
- ✅ Data persists when navigating
- ✅ Progress indicator updates correctly

---

## Test 8: Completeness Suggestions

### Objective
Test that suggestions appear correctly.

### Steps

1. **View Incomplete Profile**
   - Check profile completeness card
   - ✅ Suggestions appear for incomplete profiles

2. **Check Suggestions**
   - ✅ Lists missing required fields
   - ✅ Provides helpful guidance
   - ✅ Suggestions are relevant

3. **Complete Profile**
   - Complete all required fields
   - ✅ Suggestions change to optional field suggestions

### Expected Results
- ✅ Suggestions appear appropriately
- ✅ Suggestions are helpful and actionable
- ✅ Updates based on completion status

---

## Test 9: Error Handling

### Objective
Test error handling in wizard.

### Steps

1. **Network Error Simulation**
   - Disconnect internet
   - Try to save profile
   - ✅ Error message displays
   - ✅ User can retry

2. **Invalid Data**
   - Enter invalid data (e.g., very long text)
   - Try to save
   - ✅ Validation catches errors
   - ✅ Clear error messages

3. **Session Expiry**
   - Let session expire
   - Try to complete wizard
   - ✅ Redirects to login
   - ✅ Data can be recovered (or gracefully handled)

### Expected Results
- ✅ Errors are handled gracefully
- ✅ Clear error messages
- ✅ User can recover from errors

---

## Test 10: Mobile Responsiveness

### Objective
Test wizard and cards on mobile devices.

### Steps

1. **Wizard on Mobile**
   - Open wizard on mobile device/browser
   - ✅ Steps display correctly
   - ✅ Forms are usable
   - ✅ Progress indicator fits screen

2. **Completeness Card on Mobile**
   - View profile page on mobile
   - ✅ Card displays correctly
   - ✅ Progress bar visible
   - ✅ Buttons are clickable

3. **Dashboard on Mobile**
   - View dashboard on mobile
   - ✅ Prompt card displays correctly
   - ✅ Responsive layout

### Expected Results
- ✅ All features work on mobile
- ✅ Layout is responsive
- ✅ Touch targets are adequate

---

## Quick Test Checklist

Use this checklist for a quick smoke test:

- [ ] Wizard page loads (`/profile/wizard`)
- [ ] Can complete all 6 steps
- [ ] Data saves correctly
- [ ] Completeness card appears on profile page
- [ ] Dashboard prompt appears for incomplete profiles
- [ ] Dashboard prompt disappears for complete profiles
- [ ] Percentage calculation is accurate
- [ ] Progress bar displays correctly
- [ ] Missing fields are listed
- [ ] Links to wizard work
- [ ] Form validation works
- [ ] Navigation (Next/Back) works
- [ ] Existing data pre-fills

---

## Common Issues & Solutions

### Issue: Completeness shows 0% but profile has data
**Solution:** Check that required fields are filled. Only required fields count toward 100%.

### Issue: Wizard doesn't save data
**Solution:** Check browser console for errors. Verify tRPC mutations are working.

### Issue: Prompt doesn't appear on dashboard
**Solution:** Ensure profile is incomplete (< 100%) and user is a student.

### Issue: Progress bar doesn't update
**Solution:** Check that progress component is receiving correct percentage value.

---

## Test Data Setup

### Create Test Student Profile
```sql
-- Use existing student account or create new one
-- Ensure profile is incomplete for testing
```

### Test Scenarios
1. **Completely Empty Profile** - Test from scratch
2. **Partially Complete** - Test pre-filling
3. **Almost Complete** - Test final steps
4. **Complete Profile** - Test update flow

---

## Success Criteria

✅ All tests pass  
✅ No console errors  
✅ All features work as expected  
✅ User experience is smooth  
✅ Data persists correctly  
✅ Mobile responsive  

---

**Ready to test!** Start with Test 1 and work through each test systematically. 🚀

