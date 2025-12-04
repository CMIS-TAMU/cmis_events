# Phase 4 Testing Guide - Role-Specific Dashboards

## Overview
This guide covers comprehensive testing of the enhanced role-specific dashboard system, including student dashboard, faculty dashboard, and role-based redirects.

---

## Prerequisites

### 1. Test Accounts Setup
Ensure you have test accounts for each role:
```sql
-- Check and update test accounts
SELECT email, role FROM users WHERE email IN (
  'student@test.com',
  'faculty@test.com',
  'admin@test.com',
  'sponsor@test.com'
);

-- Update roles if needed
UPDATE users SET role = 'student' WHERE email = 'student@test.com';
UPDATE users SET role = 'faculty' WHERE email = 'faculty@test.com';
UPDATE users SET role = 'admin' WHERE email = 'admin@test.com';
UPDATE users SET role = 'sponsor' WHERE email = 'sponsor@test.com';
```

### 2. Test Data Setup
For comprehensive testing, ensure:
- At least 1-2 upcoming events exist
- Student has some registrations
- Student has profile data (for completion calculation)
- Faculty has mentor requests (if applicable)

### 3. Application Status
- ✅ Application is running
- ✅ Database connection is working
- ✅ tRPC queries are functional

---

## Testing Checklist

### Part 1: Student Dashboard Testing

**Location**: `/dashboard` (for student role)

#### Test 1.1: Dashboard Access & Loading
- [ ] Login as student
- [ ] Navigate to `/dashboard`
- [ ] Verify page loads without errors
- [ ] Verify "Student Dashboard" title appears
- [ ] Check loading states appear initially

#### Test 1.2: Profile Completion Card
- [ ] Verify profile completion card is visible
- [ ] Check completion percentage displays correctly
- [ ] Verify progress bar shows correct percentage
- [ ] Test with empty profile (0% completion)
- [ ] Test with partial profile (50-99% completion)
- [ ] Test with complete profile (100% completion)
- [ ] Verify badge shows "Complete" when 100%
- [ ] Verify "Complete Profile" button appears when < 100%
- [ ] Click "Complete Profile" → Should navigate to `/profile/edit`

#### Test 1.3: Academic Summary Card
- [ ] Verify academic summary card displays
- [ ] Check major displays (if set)
- [ ] Check graduation year displays (if set)
- [ ] Check GPA displays (if set)
- [ ] Verify formatting is correct
- [ ] Test with empty academic info → Should show helpful message

#### Test 1.4: Resume Status Card
- [ ] Verify resume status card is visible
- [ ] **Without Resume**:
  - [ ] Shows "No Resume Uploaded" with alert icon
  - [ ] Shows "Upload Resume" button
  - [ ] Click button → Should navigate to `/profile/resume`
- [ ] **With Resume**:
  - [ ] Shows "Resume Uploaded" with checkmark
  - [ ] Displays upload date
  - [ ] Displays version number
  - [ ] Shows "Manage Resume" button
  - [ ] Click button → Should navigate to `/profile/resume`

#### Test 1.5: Upcoming Events Card
- [ ] Verify "Upcoming Events" card is visible
- [ ] Check registered events display correctly
- [ ] Verify event title displays
- [ ] Verify event date/time displays correctly formatted
- [ ] Check "Waitlisted" badge appears for waitlisted events
- [ ] Verify "View Event" link works (opens event detail)
- [ ] Verify "View All Registrations" button works
- [ ] Test with no registrations → Should show empty state
- [ ] Test with multiple registrations → Should show up to 3

#### Test 1.6: Mentor Match Status Card
- [ ] Verify mentorship card is visible
- [ ] **Without Active Match**:
  - [ ] Shows "Request a Mentor" button
  - [ ] Click button → Should navigate to `/mentorship/dashboard`
- [ ] **With Active Match**:
  - [ ] Shows "Active Match" with checkmark
  - [ ] Displays mentor name (if available)
  - [ ] Shows "View Match Details" button
  - [ ] Click button → Should navigate to `/mentorship/dashboard`

#### Test 1.7: Discover Events Section
- [ ] Verify "Discover Events" section appears (if events exist)
- [ ] Check up to 3 events display
- [ ] Verify event titles are clickable
- [ ] Check dates display correctly
- [ ] Verify "View All Events" button works
- [ ] Test with no upcoming events → Section should not appear or show empty state

#### Test 1.8: Quick Actions
- [ ] Verify Quick Actions card is visible
- [ ] Check all buttons are present:
  - [ ] Browse Events
  - [ ] Edit Profile
  - [ ] My Registrations
  - [ ] My Sessions
- [ ] Test each button navigates correctly
- [ ] Verify icons display correctly

#### Test 1.9: Data Loading & Refresh
- [ ] Refresh page → All data should reload
- [ ] Check network tab → Verify tRPC queries execute
- [ ] Update profile → Refresh dashboard → Should reflect changes
- [ ] Register for event → Refresh dashboard → Should appear

#### Test 1.10: Responsive Design
- [ ] Test on desktop (full width)
- [ ] Test on tablet (medium width)
- [ ] Test on mobile (narrow width)
- [ ] Verify cards stack correctly on mobile
- [ ] Verify all buttons are clickable on mobile

---

### Part 2: Faculty Dashboard Testing

**Location**: `/faculty/dashboard`

#### Test 2.1: Dashboard Access & Loading
- [ ] Login as faculty
- [ ] Navigate to `/dashboard`
- [ ] Verify redirects to `/faculty/dashboard` automatically
- [ ] Or navigate directly to `/faculty/dashboard`
- [ ] Verify "Faculty Dashboard" title appears
- [ ] Check loading states appear initially

#### Test 2.2: Role Guard Protection
- [ ] Login as student
- [ ] Try to navigate to `/faculty/dashboard`
- [ ] Verify access denied message appears
- [ ] Verify "Go to Dashboard" button works
- [ ] Login as admin
- [ ] Navigate to `/faculty/dashboard`
- [ ] Verify admin can access (if allowed) or redirects

#### Test 2.3: Welcome Card
- [ ] Verify welcome card displays
- [ ] Check email displays correctly
- [ ] Check role displays as "faculty"
- [ ] Verify formatting is clean

#### Test 2.4: Mentor Requests Card
- [ ] Verify mentor requests card is visible
- [ ] **With Pending Requests**:
  - [ ] Shows request count
  - [ ] Displays "Pending" badge
  - [ ] Shows "View Requests" button
  - [ ] Click button → Should navigate to `/mentorship/mentor/requests`
- [ ] **Without Requests**:
  - [ ] Shows "No pending requests" with checkmark
  - [ ] Shows helpful message

#### Test 2.5: Active Mentees Card
- [ ] Verify active mentees card is visible
- [ ] Check "Manage Mentees" button is present
- [ ] Click button → Should navigate to `/mentorship/mentor/mentees`
- [ ] Verify card description is helpful

#### Test 2.6: Upcoming Events Card
- [ ] Verify upcoming events card displays
- [ ] Check events display correctly (if any)
- [ ] Verify event titles are clickable
- [ ] Check dates display correctly
- [ ] Verify "View All Events" button works
- [ ] Test with no events → Should show empty state

#### Test 2.7: Quick Actions
- [ ] Verify Quick Actions card is visible
- [ ] Check all buttons are present:
  - [ ] Mentorship Dashboard
  - [ ] View Requests
  - [ ] Quick Questions
  - [ ] Browse Events
  - [ ] My Profile
- [ ] Test each button navigates correctly
- [ ] Verify icons display correctly

#### Test 2.8: Teaching Resources Card
- [ ] Verify teaching resources card is visible
- [ ] Check description is helpful
- [ ] Verify "Mentorship Portal" button works
- [ ] Verify card styling (blue border/background)

---

### Part 3: Role-Based Redirects Testing

#### Test 3.1: Student Redirect
- [ ] Login as student
- [ ] Navigate to `/dashboard`
- [ ] Verify STAYS on `/dashboard` (no redirect)
- [ ] Verify student dashboard content appears

#### Test 3.2: Faculty Redirect
- [ ] Login as faculty
- [ ] Navigate to `/dashboard`
- [ ] Verify REDIRECTS to `/faculty/dashboard`
- [ ] Verify redirect happens automatically (no manual navigation needed)

#### Test 3.3: Admin Redirect
- [ ] Login as admin
- [ ] Navigate to `/dashboard`
- [ ] Verify REDIRECTS to `/admin/dashboard`
- [ ] Verify redirect happens automatically

#### Test 3.4: Sponsor Redirect
- [ ] Login as sponsor
- [ ] Navigate to `/dashboard`
- [ ] Verify REDIRECTS to `/sponsor/dashboard`
- [ ] Verify redirect happens automatically

#### Test 3.5: Redirect Timing
- [ ] Login as any role
- [ ] Navigate to `/dashboard`
- [ ] Verify redirect happens after role loads (not before)
- [ ] Check no flash of wrong content
- [ ] Verify smooth transition

---

### Part 4: Role Guard Testing

#### Test 4.1: Student Dashboard Guards
- [ ] Login as student
- [ ] Navigate to `/dashboard`
- [ ] Verify only student-specific cards appear:
  - [ ] Profile Completion (student only)
  - [ ] Academic Summary (student only)
  - [ ] Resume Status (student only)
  - [ ] Mentor Match (student only)
- [ ] Verify faculty/admin/sponsor cards do NOT appear

#### Test 4.2: Faculty Dashboard Guards
- [ ] Login as faculty
- [ ] Navigate to `/faculty/dashboard`
- [ ] Verify only faculty can access
- [ ] Login as student → Try to access → Should be denied
- [ ] Login as admin → Should be able to access (or redirected)

#### Test 4.3: Admin Dashboard Guards
- [ ] Login as student
- [ ] Try to navigate to `/admin/dashboard`
- [ ] Verify redirects to `/dashboard`
- [ ] Login as admin → Should access successfully

#### Test 4.4: Sponsor Dashboard Guards
- [ ] Login as student
- [ ] Try to navigate to `/sponsor/dashboard`
- [ ] Verify redirects to `/dashboard`
- [ ] Login as sponsor → Should access successfully

---

### Part 5: Data Integration Testing

#### Test 5.1: Profile Data Integration
- [ ] Login as student with complete profile
- [ ] Navigate to `/dashboard`
- [ ] Verify profile completion shows 100%
- [ ] Verify academic summary shows all data
- [ ] Update profile → Refresh → Verify updates reflect

#### Test 5.2: Events Data Integration
- [ ] Ensure events exist in database
- [ ] Login as student
- [ ] Navigate to `/dashboard`
- [ ] Verify upcoming events load correctly
- [ ] Verify registered events show in "Upcoming Events"
- [ ] Register for new event → Refresh → Verify appears

#### Test 5.3: Resume Data Integration
- [ ] Login as student
- [ ] Upload resume via `/profile/resume`
- [ ] Navigate to `/dashboard`
- [ ] Verify resume status updates to "Uploaded"
- [ ] Delete resume → Refresh → Verify status updates

#### Test 5.4: Mentorship Data Integration
- [ ] Login as student
- [ ] Request a mentor (if not already matched)
- [ ] Navigate to `/dashboard`
- [ ] Verify mentor match status updates
- [ ] If matched → Verify mentor name appears
- [ ] If not matched → Verify "Request a Mentor" button

#### Test 5.5: Faculty Mentor Requests Integration
- [ ] Login as student
- [ ] Request a mentor
- [ ] Login as faculty (who was matched)
- [ ] Navigate to `/faculty/dashboard`
- [ ] Verify mentor requests count updates
- [ ] Verify request appears in list

---

### Part 6: Error Handling & Edge Cases

#### Test 6.1: Network Errors
- [ ] Disconnect internet
- [ ] Navigate to dashboard
- [ ] Verify graceful error handling
- [ ] Check error messages are user-friendly
- [ ] Reconnect → Verify data loads

#### Test 6.2: Missing Data
- [ ] Create student account with no profile data
- [ ] Navigate to `/dashboard`
- [ ] Verify dashboard still loads
- [ ] Verify empty states display correctly
- [ ] Verify no errors occur

#### Test 6.3: Large Data Sets
- [ ] Create student with many registrations
- [ ] Navigate to `/dashboard`
- [ ] Verify dashboard handles large data
- [ ] Check performance is acceptable

#### Test 6.4: Concurrent Updates
- [ ] Open dashboard in two browser tabs
- [ ] Update profile in one tab
- [ ] Refresh other tab
- [ ] Verify both tabs show updated data

---

### Part 7: UI/UX Testing

#### Test 7.1: Loading States
- [ ] Navigate to dashboard
- [ ] Verify loading spinners appear
- [ ] Check loading states are clear
- [ ] Verify no layout shift when data loads

#### Test 7.2: Empty States
- [ ] Test dashboard with no data
- [ ] Verify helpful empty state messages
- [ ] Verify action buttons are prominent
- [ ] Check empty states are visually clear

#### Test 7.3: Card Styling
- [ ] Verify all cards have consistent styling
- [ ] Check borders and backgrounds are correct
- [ ] Verify icons display properly
- [ ] Check hover states work

#### Test 7.4: Navigation
- [ ] Test all navigation links work
- [ ] Verify browser back button works
- [ ] Check deep linking (direct URL access)
- [ ] Test navigation within dashboard

---

## Quick Test Checklist

**Quick Smoke Test** (10 minutes):
- [ ] Login as student → Go to `/dashboard`
- [ ] Verify all student cards appear
- [ ] Check profile completion displays
- [ ] Verify events load
- [ ] Login as faculty → Verify redirects to `/faculty/dashboard`
- [ ] Check faculty cards appear
- [ ] Test role guards work

**Full Test** (45-60 minutes):
- Complete all sections above
- Test all edge cases
- Verify all data integrations
- Test on different devices

---

## Expected Behaviors

### Student Dashboard Cards
1. **Profile Completion**: Shows 0-100%, progress bar, badge
2. **Academic Summary**: Major, graduation year, GPA
3. **Resume Status**: Uploaded/Not uploaded with action button
4. **Upcoming Events**: Registered events with dates
5. **Mentor Match**: Active match or request button
6. **Discover Events**: Up to 3 upcoming events
7. **Quick Actions**: Navigation buttons

### Faculty Dashboard Cards
1. **Mentor Requests**: Count and "View Requests" button
2. **Active Mentees**: "Manage Mentees" link
3. **Upcoming Events**: List of events
4. **Quick Actions**: Faculty-specific navigation
5. **Teaching Resources**: Mentorship portal link

### Redirect Behavior
| Role | Navigate to `/dashboard` | Result |
|------|-------------------------|--------|
| Student | `/dashboard` | Stays on `/dashboard` (student dashboard) |
| Faculty | `/dashboard` | Redirects to `/faculty/dashboard` |
| Admin | `/dashboard` | Redirects to `/admin/dashboard` |
| Sponsor | `/dashboard` | Redirects to `/sponsor/dashboard` |

---

## Troubleshooting

### Issue: Dashboard doesn't redirect
**Solution**: 
- Check browser console for errors
- Verify role is loaded correctly
- Check `useUserRole` hook is working
- Verify redirect logic in dashboard page

### Issue: Cards not showing data
**Solution**:
- Check tRPC queries are executing (network tab)
- Verify data exists in database
- Check error messages in console
- Verify user role is correct

### Issue: Profile completion shows 0%
**Solution**:
- Check calculation function is correct
- Verify profile fields exist in database
- Check field names match schema
- Verify user has profile data

### Issue: Role guard not working
**Solution**:
- Verify role is set correctly in database
- Check `useUserRole` hook returns correct role
- Verify role guard components are imported correctly
- Check role matches expected values

---

## SQL Verification Queries

```sql
-- Check user roles
SELECT email, role FROM users WHERE role IN ('student', 'faculty', 'admin', 'sponsor');

-- Check student profile data
SELECT 
  email, 
  major, 
  graduation_year, 
  gpa, 
  resume_url,
  skills,
  work_experience,
  education
FROM users 
WHERE role = 'student' 
LIMIT 5;

-- Check upcoming events
SELECT id, title, starts_at 
FROM events 
WHERE starts_at > NOW() 
ORDER BY starts_at 
LIMIT 10;

-- Check student registrations
SELECT 
  u.email,
  e.title,
  er.status,
  e.starts_at
FROM event_registrations er
JOIN users u ON er.user_id = u.id
JOIN events e ON er.event_id = e.id
WHERE u.role = 'student'
AND e.starts_at > NOW()
ORDER BY e.starts_at;
```

---

## Test Results Template

```
Date: _______________
Tester: _______________

Student Dashboard:
  [ ] All cards display correctly
  [ ] Profile completion works
  [ ] Events load correctly
  [ ] Resume status works
  [ ] Mentor match works
  [ ] Navigation works

Faculty Dashboard:
  [ ] Dashboard loads correctly
  [ ] Mentor requests display
  [ ] Events load correctly
  [ ] Navigation works
  [ ] Role guard works

Redirects:
  [ ] Student stays on /dashboard
  [ ] Faculty redirects to /faculty/dashboard
  [ ] Admin redirects to /admin/dashboard
  [ ] Sponsor redirects to /sponsor/dashboard

Issues Found:
  1. _______________
  2. _______________

Overall Status: [ ] PASS [ ] FAIL [ ] NEEDS FIXES
```

---

**Testing Time Estimate**: 45-60 minutes for comprehensive testing

**Ready to test!** ✅

