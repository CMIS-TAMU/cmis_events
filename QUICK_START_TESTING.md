# Quick Start Testing Guide

## Prerequisites Check

Before testing, ensure:

1. **Development server is running:**
   ```bash
   pnpm dev
   ```
   Server should start on http://localhost:3000

2. **Database migration completed:**
   - ✅ Master migration run in Supabase
   - ✅ Verification passed

3. **Storage buckets created:**
   - ✅ `resumes` bucket (for resume uploads)
   - ✅ `event-images` bucket (optional)

4. **RLS policies set up:**
   - ✅ Run `scripts/setup-rls-policies.sql` in Supabase

---

## Quick Test Sequence (15 minutes)

### 1. Verify Server (1 min)

```bash
# Check if server is running
curl http://localhost:3000/api/health

# Should return: {"status":"ok",...}
```

If not running:
```bash
pnpm dev
```

---

### 2. Create Test Users (5 min)

**User 1: Admin**
1. Go to http://localhost:3000/signup
2. Email: `admin@test.com`
3. Password: `test123456`
4. Role: **Admin**
5. Click "Sign Up"

**User 2: Sponsor**
1. Go to http://localhost:3000/signup
2. Email: `sponsor@test.com`
3. Password: `test123456`
4. Role: **Sponsor**
5. Click "Sign Up"

**User 3: Student**
1. Go to http://localhost:3000/signup
2. Email: `student@test.com`
3. Password: `test123456`
4. Role: **Student** (or User)
5. Click "Sign Up"

---

### 3. Test Event Management (3 min)

**As Admin:**
1. Login as `admin@test.com`
2. Go to `/admin/events/new`
3. Create an event:
   - Title: "Test Event"
   - Description: "Testing event management"
   - Date: Tomorrow
   - Time: 10:00 AM - 12:00 PM
   - Capacity: 10
4. Click "Create Event"
5. ✅ Verify event appears in `/admin/events`
6. ✅ Verify event appears in `/events`

---

### 4. Test Registration & QR Code (3 min)

**As Student:**
1. Login as `student@test.com`
2. Go to `/events`
3. Click on "Test Event"
4. Click "Register"
5. ✅ Verify registration successful
6. Go to `/registrations`
7. ✅ Verify event listed
8. ✅ Verify QR code displayed
9. ✅ Click "Download QR Code"

---

### 5. Test QR Check-In (2 min)

**As Admin:**
1. Login as `admin@test.com`
2. Go to `/admin/checkin`
3. Copy QR code data from student's registration
4. Paste into check-in form
5. Click "Check In"
6. ✅ Verify success message
7. ✅ Verify attendance count updates

---

### 6. Test Resume Upload (2 min)

**As Student:**
1. Login as `student@test.com`
2. Go to `/profile/resume`
3. Click "Upload Resume"
4. Select a PDF file (test file)
5. Fill in optional fields:
   - Major: "Computer Science"
   - GPA: 3.75
   - Skills: "Python, JavaScript"
   - Graduation Year: 2025
6. Click "Upload Resume"
7. ✅ Verify success message
8. ✅ Verify resume displayed
9. ✅ Click "Download" to verify

---

### 7. Test Sponsor Features (2 min)

**As Sponsor:**
1. Login as `sponsor@test.com`
2. Go to `/sponsor/dashboard`
3. ✅ Verify statistics displayed
4. Go to `/sponsor/resumes`
5. ✅ Verify resumes listed
6. Search for "Computer Science"
7. ✅ Verify filtering works
8. Click "View Resume" on a resume
9. ✅ Verify PDF opens
10. Click star icon to add to shortlist
11. Go to `/sponsor/shortlist`
12. ✅ Verify candidate in shortlist

---

### 8. Test Event Sessions (2 min)

**As Admin:**
1. Login as `admin@test.com`
2. Go to `/admin/events`
3. Click "Manage Sessions" on an event
4. Click "Add Session"
5. Create session:
   - Title: "Workshop 1"
   - Time: 11:00 AM - 11:30 AM
   - Capacity: 5
6. ✅ Verify session created

**As Student:**
1. Login as `student@test.com`
2. Go to event detail page
3. Scroll to "Event Sessions"
4. ✅ Verify session displayed
5. Click "Register for Session"
6. ✅ Verify registration successful
7. Go to `/sessions`
8. ✅ Verify session in "My Sessions"

---

## ✅ Success Criteria

All tests pass if:

- [x] Can create and login users
- [x] Can create events (admin)
- [x] Can register for events
- [x] QR codes generate correctly
- [x] Can check in users
- [x] Can upload resumes
- [x] Can search resumes (sponsor)
- [x] Can shortlist candidates
- [x] Can create sessions
- [x] Can register for sessions
- [x] No console errors
- [x] All pages load correctly

---

## 🐛 Troubleshooting

### Server Not Running
```bash
# Start server
pnpm dev

# Verify it's running
curl http://localhost:3000/api/health
```

### Pages Return 404
- Check server is running
- Verify routes exist in `app/` directory
- Check browser console for errors
- Restart development server

### Database Errors
- Verify migration completed
- Check Supabase connection
- Verify environment variables
- Check Supabase logs

### Authentication Issues
- Clear browser cookies
- Try incognito/private mode
- Check Supabase auth is enabled
- Verify user exists in database

---

## 📊 Test Results

**Date:** _______________
**Tester:** _______________

**Tests Passed:** ___ / 8
**Issues Found:** _______________

**Overall Status:** ☐ Pass ☐ Needs Fixes

---

**Ready for production?** All tests must pass! ✅

