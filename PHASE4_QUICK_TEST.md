# Phase 4 Quick Test Guide

## ⚡ 10-Minute Smoke Test

### Step 1: Test Student Dashboard (3 minutes)
1. **Login as student**
   - Navigate to `/dashboard`
   - ✅ Verify "Student Dashboard" title appears
   - ✅ Verify no redirect occurs

2. **Check Student Cards**
   - ✅ Profile Completion card shows percentage
   - ✅ Academic Summary card displays (if data exists)
   - ✅ Resume Status card shows (uploaded/not uploaded)
   - ✅ Upcoming Events card displays
   - ✅ Mentor Match card shows status
   - ✅ Quick Actions card is visible

3. **Test Navigation**
   - ✅ Click "Complete Profile" → Goes to `/profile/edit`
   - ✅ Click "View All Registrations" → Goes to `/registrations`
   - ✅ Click "Request a Mentor" → Goes to `/mentorship/dashboard`

### Step 2: Test Faculty Dashboard (3 minutes)
1. **Login as faculty**
   - Navigate to `/dashboard`
   - ✅ Verify redirects to `/faculty/dashboard` automatically
   - ✅ Verify "Faculty Dashboard" title appears

2. **Check Faculty Cards**
   - ✅ Mentor Requests card shows count
   - ✅ Active Mentees card displays
   - ✅ Upcoming Events card shows
   - ✅ Quick Actions card is visible

3. **Test Navigation**
   - ✅ Click "View Requests" → Goes to `/mentorship/mentor/requests`
   - ✅ Click "Manage Mentees" → Goes to `/mentorship/mentor/mentees`

### Step 3: Test Role Redirects (2 minutes)
1. **Test Redirects**
   - [ ] Login as admin → Go to `/dashboard` → ✅ Redirects to `/admin/dashboard`
   - [ ] Login as sponsor → Go to `/dashboard` → ✅ Redirects to `/sponsor/dashboard`
   - [ ] Login as student → Go to `/dashboard` → ✅ Stays on `/dashboard`
   - [ ] Login as faculty → Go to `/dashboard` → ✅ Redirects to `/faculty/dashboard`

### Step 4: Test Role Guards (2 minutes)
1. **Test Access Control**
   - [ ] Login as student → Try `/faculty/dashboard` → ✅ Access denied
   - [ ] Login as student → Try `/admin/dashboard` → ✅ Redirected
   - [ ] Login as student → Try `/sponsor/dashboard` → ✅ Redirected
   - [ ] Login as faculty → `/faculty/dashboard` → ✅ Access granted

---

## ✅ Success Criteria

**All steps complete without errors = PASS** ✅

**Any errors or missing data = FAIL** ❌

---

## 🐛 Quick Fixes

**If dashboard doesn't load:**
- Check browser console for errors
- Verify user is logged in
- Check database connection
- Verify tRPC queries are working

**If redirects don't work:**
- Hard refresh page (Ctrl+Shift+R or Cmd+Shift+R)
- Check role is set correctly in database
- Verify `useUserRole` hook is working
- Check browser console for errors

**If cards don't show data:**
- Check if data exists in database
- Verify tRPC queries are executing (network tab)
- Check user role is correct
- Verify fields match database schema

**If profile completion shows 0%:**
- Verify user has profile data
- Check calculation function
- Verify field names match database
- Check browser console for errors

---

## 📊 Quick Verification

**Student Dashboard Should Show:**
- ✅ Profile completion percentage
- ✅ Academic info (if set)
- ✅ Resume status
- ✅ Upcoming registered events
- ✅ Mentor match status
- ✅ Quick actions

**Faculty Dashboard Should Show:**
- ✅ Mentor requests count
- ✅ Active mentees link
- ✅ Upcoming events
- ✅ Quick actions

**Redirects Should Work:**
- ✅ Admin → `/admin/dashboard`
- ✅ Sponsor → `/sponsor/dashboard`
- ✅ Faculty → `/faculty/dashboard`
- ✅ Student → Stays on `/dashboard`

---

**Total Time**: ~10 minutes  
**Status**: Ready to test! 🚀

