# Phase 3 Testing Guide - Enhanced Student Profile

## Overview
This guide covers comprehensive testing of the enhanced student profile features, including the edit page, display page, work experience, and education components.

---

## Prerequisites

### 1. Database Migration
**⚠️ IMPORTANT**: Ensure Phase 1 database migration has been run!

Run this SQL in Supabase:
```sql
-- Check if migration has been applied
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN (
  'phone', 'linkedin_url', 'github_url', 'website_url', 'address',
  'preferred_industry', 'degree_type', 'work_experience', 'education'
);

-- If columns don't exist, run the migration:
-- database/migrations/add_student_profile_fields.sql
```

### 2. Test Account Setup
Ensure you have a student test account:
```sql
-- Update or create test student account
UPDATE users SET role = 'student' WHERE email = 'student@test.com';
```

### 3. Application Status
- ✅ Application is running
- ✅ User can log in
- ✅ Database connection is working

---

## Testing Checklist

### Part 1: Profile Edit Page - Basic Information Tab

**Location**: `/profile/edit` → Basic Info Tab

#### Test 1.1: Load Existing Data
- [ ] Navigate to `/profile/edit` as a student
- [ ] Verify Basic Info tab is selected by default
- [ ] Check if existing major, skills, etc. are loaded correctly
- [ ] Verify all form fields are populated (if data exists)

#### Test 1.2: Academic Fields
- [ ] **Major** (required):
  - [ ] Try to submit without major → Should show validation error
  - [ ] Enter valid major (e.g., "Computer Science")
  - [ ] Save and verify it persists

- [ ] **Degree Type**:
  - [ ] Select different degree types (Bachelor's, Master's, PhD, etc.)
  - [ ] Verify selection saves correctly

- [ ] **Technical Skills**:
  - [ ] Enter skills as comma-separated (e.g., "Python, JavaScript, React")
  - [ ] Save and verify they are stored as array
  - [ ] Try with extra spaces → Should trim correctly

- [ ] **Research Interests**:
  - [ ] Enter interests as comma-separated
  - [ ] Verify they save correctly
  - [ ] Check they appear on display page

- [ ] **Career Goals**:
  - [ ] Enter multi-line text in textarea
  - [ ] Verify it saves and displays correctly
  - [ ] Check formatting is preserved

- [ ] **Graduation Year**:
  - [ ] Enter valid year (2020-2030)
  - [ ] Verify number validation works
  - [ ] Check it saves correctly

- [ ] **GPA**:
  - [ ] Enter valid GPA (0-4.0, e.g., 3.75)
  - [ ] Verify decimal handling
  - [ ] Test with 0 and 4.0 boundary values

#### Test 1.3: Form Submission
- [ ] Fill all Basic Info fields
- [ ] Click "Save All Changes"
- [ ] Verify success message appears
- [ ] Verify redirect to `/profile` after 2 seconds
- [ ] Check all data persists on refresh

---

### Part 2: Profile Edit Page - Contact Details Tab

**Location**: `/profile/edit` → Contact Tab

#### Test 2.1: Contact Fields
- [ ] **Phone Number**:
  - [ ] Enter phone number (e.g., "+1 (555) 123-4567")
  - [ ] Verify tel input type works
  - [ ] Save and verify persistence

- [ ] **Address**:
  - [ ] Enter address (e.g., "Berkeley, CA, USA")
  - [ ] Save and verify

- [ ] **LinkedIn URL**:
  - [ ] Enter valid LinkedIn URL
  - [ ] Try invalid URL → Verify validation (if any)
  - [ ] Leave empty → Should save as null
  - [ ] Verify URL opens correctly on display page

- [ ] **GitHub URL**:
  - [ ] Enter valid GitHub URL
  - [ ] Save and verify
  - [ ] Check it appears as clickable link

- [ ] **Website URL**:
  - [ ] Enter personal website/portfolio URL
  - [ ] Verify it saves
  - [ ] Test empty string handling

#### Test 2.2: Optional Fields
- [ ] Leave all contact fields empty
- [ ] Save profile
- [ ] Verify no errors occur
- [ ] Check empty states on display page

---

### Part 3: Profile Edit Page - Professional Tab

**Location**: `/profile/edit` → Professional Tab

#### Test 3.1: Preferred Industry
- [ ] Enter preferred industry (e.g., "Software", "Finance", "Healthcare")
- [ ] Save and verify it persists
- [ ] Check it appears on display page

#### Test 3.2: Work Experience - Add New Entry
- [ ] Click "Add Experience" button
- [ ] Fill in form:
  - [ ] Company (required)
  - [ ] Position/Title (required)
  - [ ] Location (optional)
  - [ ] Start Date (required)
  - [ ] End Date (optional)
  - [ ] Check "I currently work here" → End date should disable
  - [ ] Description (optional)
- [ ] Click "Save"
- [ ] Verify dialog closes
- [ ] Verify new entry appears in list
- [ ] Check entry displays correctly with card component

#### Test 3.3: Work Experience - Edit Entry
- [ ] Click edit button (pencil icon) on a work experience card
- [ ] Modify fields in the dialog
- [ ] Click "Save"
- [ ] Verify changes are reflected immediately
- [ ] Refresh page → Verify changes persist

#### Test 3.4: Work Experience - Delete Entry
- [ ] Click delete button (trash icon) on a work experience card
- [ ] Confirm deletion in dialog
- [ ] Verify entry is removed from list
- [ ] Refresh page → Verify deletion persists

#### Test 3.5: Work Experience - Multiple Entries
- [ ] Add 3-4 work experience entries
- [ ] Verify all display correctly
- [ ] Test editing different entries
- [ ] Test deleting entries
- [ ] Verify ordering (should maintain order)

#### Test 3.6: Work Experience - Current Job
- [ ] Add entry with "I currently work here" checked
- [ ] Verify end date field is disabled
- [ ] Save and verify "Current" badge appears
- [ ] Verify end date shows as "Present"

---

### Part 4: Profile Edit Page - Education Tab

**Location**: `/profile/edit` → Education Tab

#### Test 4.1: Education - Add New Entry
- [ ] Click "Add Education" button
- [ ] Fill in form:
  - [ ] Institution (required)
  - [ ] Degree (required)
  - [ ] Field of Study (required)
  - [ ] Location (optional)
  - [ ] Start Date (required)
  - [ ] End Date or Expected (optional)
  - [ ] Check "I am currently studying here" → End date should disable
  - [ ] GPA (optional, 0-4.0)
- [ ] Click "Save"
- [ ] Verify dialog closes
- [ ] Verify new entry appears in list

#### Test 4.2: Education - Edit Entry
- [ ] Click edit button on an education card
- [ ] Modify fields
- [ ] Save and verify changes

#### Test 4.3: Education - Delete Entry
- [ ] Delete an education entry
- [ ] Verify it's removed
- [ ] Refresh and verify persistence

#### Test 4.4: Education - Current Education
- [ ] Add entry with "I am currently studying here" checked
- [ ] Verify "Current" badge appears
- [ ] Verify end date shows as "Present"

#### Test 4.5: Education - GPA Display
- [ ] Add education entry with GPA (e.g., 3.75)
- [ ] Verify GPA displays correctly on card
- [ ] Format should be "GPA: 3.75"

---

### Part 5: Profile Display Page

**Location**: `/profile`

#### Test 5.1: Basic Profile Information
- [ ] Navigate to `/profile` as a student
- [ ] Verify email, name, role display correctly
- [ ] Verify "Member Since" date displays
- [ ] Check "Edit Profile" button is visible and works

#### Test 5.2: Overview Tab
- [ ] Check Overview tab shows:
  - [ ] Academic summary (major, degree type, graduation year, GPA)
  - [ ] Technical skills as badges
  - [ ] Preferred industry (if set)
- [ ] Verify all data displays correctly
- [ ] Check formatting is clean

#### Test 5.3: Academic Tab
- [ ] Switch to Academic tab
- [ ] Verify all academic fields display:
  - [ ] Major, Degree Type
  - [ ] Graduation Year, GPA
  - [ ] Technical Skills (as badges)
  - [ ] Research Interests (as badges)
  - [ ] Career Goals (as text)
- [ ] Verify Education History section shows all entries
- [ ] Check education cards display correctly

#### Test 5.4: Professional Tab
- [ ] Switch to Professional tab
- [ ] Verify Preferred Industry displays
- [ ] Verify Work Experience section shows all entries
- [ ] Check work experience cards display correctly:
  - [ ] Company and position
  - [ ] Dates formatted correctly
  - [ ] "Current" badge if applicable
  - [ ] Location and description

#### Test 5.5: Contact Tab
- [ ] Switch to Contact tab
- [ ] Verify all contact fields display:
  - [ ] Phone number
  - [ ] Address
  - [ ] LinkedIn (as clickable link, opens in new tab)
  - [ ] GitHub (as clickable link, opens in new tab)
  - [ ] Website (as clickable link, opens in new tab)
- [ ] Test clicking links → Should open in new tab
- [ ] Verify empty states show helpful messages

#### Test 5.6: Empty States
- [ ] Create a new student account with no profile data
- [ ] Navigate to `/profile`
- [ ] Verify appropriate empty state messages appear
- [ ] Check "Edit Profile" button is prominent
- [ ] Verify tabs still work even with empty data

---

### Part 6: Data Persistence & Integration

#### Test 6.1: Data Persistence
- [ ] Fill out complete profile (all tabs)
- [ ] Save profile
- [ ] Log out and log back in
- [ ] Navigate to `/profile`
- [ ] Verify ALL data is still present:
  - [ ] Basic info fields
  - [ ] Contact details
  - [ ] Professional info
  - [ ] All work experience entries
  - [ ] All education entries

#### Test 6.2: Database Verification
- [ ] After saving profile, check Supabase database:
```sql
-- Check user profile
SELECT 
  email, major, degree_type, graduation_year, gpa,
  phone, linkedin_url, github_url, website_url, address,
  preferred_industry, skills, work_experience, education,
  metadata
FROM users 
WHERE email = 'your-test-email@example.com';
```
- [ ] Verify all fields are saved correctly
- [ ] Check JSONB arrays (skills, work_experience, education)
- [ ] Verify metadata contains research_interests and career_goals

#### Test 6.3: Cross-Tab Navigation
- [ ] On edit page, switch between tabs
- [ ] Verify form data is preserved when switching tabs
- [ ] Add work experience, switch tabs, come back → Should still be there
- [ ] Verify tab state persists

---

### Part 7: Error Handling & Edge Cases

#### Test 7.1: Validation Errors
- [ ] Try to submit without required fields (major)
- [ ] Verify error message appears
- [ ] Verify form doesn't submit

#### Test 7.2: Network Errors
- [ ] Disconnect internet
- [ ] Try to save profile
- [ ] Verify error message appears
- [ ] Reconnect and verify recovery

#### Test 7.3: Invalid Data
- [ ] Try to enter graduation year outside range (2020-2030)
- [ ] Try to enter GPA > 4.0
- [ ] Try to enter GPA < 0
- [ ] Verify validation prevents invalid data

#### Test 7.4: Large Data Sets
- [ ] Add 10+ work experience entries
- [ ] Add 10+ education entries
- [ ] Verify page handles gracefully
- [ ] Check performance is acceptable

#### Test 7.5: Special Characters
- [ ] Enter special characters in text fields
- [ ] Enter URLs with special characters
- [ ] Enter dates in different formats
- [ ] Verify all save and display correctly

---

### Part 8: Role-Based Access

#### Test 8.1: Student Access
- [ ] Login as student
- [ ] Navigate to `/profile/edit`
- [ ] Verify all tabs and fields are accessible
- [ ] Verify can save changes

#### Test 8.2: Non-Student Access
- [ ] Login as admin/faculty/sponsor
- [ ] Navigate to `/profile/edit`
- [ ] Verify appropriate message shows (non-students can't edit)
- [ ] Verify "Back to Profile" button works

#### Test 8.3: Unauthenticated Access
- [ ] Logout
- [ ] Navigate to `/profile/edit`
- [ ] Verify redirect to login page

---

### Part 9: UI/UX Testing

#### Test 9.1: Responsive Design
- [ ] Test on mobile device/browser resize
- [ ] Verify tabs work on mobile
- [ ] Check form dialogs are mobile-friendly
- [ ] Verify cards stack correctly
- [ ] Test touch interactions

#### Test 9.2: Loading States
- [ ] Check loading spinner appears on page load
- [ ] Verify no flash of unstyled content
- [ ] Check loading state during save operations

#### Test 9.3: Success Messages
- [ ] Save profile successfully
- [ ] Verify success message appears
- [ ] Verify auto-redirect after 2 seconds
- [ ] Check message is dismissible

#### Test 9.4: Navigation
- [ ] Click "Back to Profile" → Should navigate to `/profile`
- [ ] Click "Cancel" → Should navigate to `/profile`
- [ ] Use browser back button → Should work correctly
- [ ] Test deep linking (direct URL access)

---

## Quick Test Checklist

**Quick Smoke Test** (5 minutes):
- [ ] Login as student
- [ ] Navigate to `/profile/edit`
- [ ] Add major and save
- [ ] Switch to Contact tab, add phone number, save
- [ ] Switch to Professional tab, add work experience, save
- [ ] Switch to Education tab, add education, save
- [ ] Navigate to `/profile`
- [ ] Verify all data displays correctly in all tabs

**Full Test** (30-45 minutes):
- Complete all sections above
- Test all edge cases
- Verify database persistence
- Test on different devices

---

## Common Issues & Troubleshooting

### Issue: "Only students can edit student profile"
**Solution**: Check user role in database:
```sql
SELECT email, role FROM users WHERE email = 'your-email@example.com';
UPDATE users SET role = 'student' WHERE email = 'your-email@example.com';
```

### Issue: Fields not saving
**Solution**: 
1. Check browser console for errors
2. Verify database migration was run
3. Check tRPC mutation is working
4. Verify RLS policies allow updates

### Issue: Work experience/education not displaying
**Solution**:
1. Check JSONB array format in database
2. Verify entries have required fields
3. Check browser console for parsing errors

### Issue: Dates not formatting correctly
**Solution**: Verify date strings are ISO format (YYYY-MM-DD)

---

## SQL Verification Queries

```sql
-- Check all student profile fields
SELECT 
  email,
  role,
  major,
  degree_type,
  graduation_year,
  gpa,
  phone,
  linkedin_url,
  github_url,
  website_url,
  address,
  preferred_industry,
  skills,
  work_experience,
  education,
  metadata
FROM users
WHERE role = 'student'
LIMIT 5;

-- Check work experience structure
SELECT 
  email,
  jsonb_array_length(work_experience) as work_exp_count,
  work_experience
FROM users
WHERE work_experience IS NOT NULL 
AND jsonb_array_length(work_experience) > 0;

-- Check education structure
SELECT 
  email,
  jsonb_array_length(education) as education_count,
  education
FROM users
WHERE education IS NOT NULL 
AND jsonb_array_length(education) > 0;
```

---

## Test Results Template

```
Date: _______________
Tester: _______________
Student Account: _______________

Basic Info Tab:
  [ ] All fields save correctly
  [ ] Validation works
  [ ] Data displays on profile page

Contact Tab:
  [ ] All fields save correctly
  [ ] URLs work as links
  [ ] Empty states work

Professional Tab:
  [ ] Preferred industry saves
  [ ] Work experience CRUD works
  [ ] Multiple entries work

Education Tab:
  [ ] Education CRUD works
  [ ] GPA displays correctly
  [ ] Current education badge works

Display Page:
  [ ] All tabs show correct data
  [ ] Links work
  [ ] Empty states work

Issues Found:
  1. _______________
  2. _______________

Overall Status: [ ] PASS [ ] FAIL [ ] NEEDS FIXES
```

---

**Testing Time Estimate**: 30-45 minutes for comprehensive testing

**Ready to test!** ✅

