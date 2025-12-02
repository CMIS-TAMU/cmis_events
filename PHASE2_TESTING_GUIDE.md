# 🧪 Phase 2 Testing Guide - Enhanced Features

**Status:** ✅ All Phase 2 features are implemented!  
**Purpose:** Step-by-step testing instructions for Phase 2 features

---

## ✅ **PHASE 2 FEATURES CONFIRMED**

1. ✅ **Resume Management** - Upload, View, Delete, Search
2. ✅ **Sponsor Portal** - Dashboard, Resume Search, Shortlist, CSV Export
3. ✅ **QR Code Check-in System** - Generate, Display, Admin Scanner
4. ✅ **Event Sessions** - Create, Register, Capacity Management
5. ✅ **Waitlist System** - Auto-add, Position Display

---

## 📋 **PRE-TESTING CHECKLIST**

Before testing, ensure:
- [ ] Development server is running (`pnpm dev`)
- [ ] You have at least 2 user accounts:
  - 1 Student user
  - 1 Admin user
  - 1 Sponsor user (optional, or use admin)
- [ ] At least 1 event exists in the database
- [ ] Supabase Storage buckets are set up:
  - `resumes` bucket (private)
  - `event-images` bucket (public)
  - `competition-submissions` bucket (private)

---

## 🧪 **TESTING PROCEDURES**

### 1. Resume Management Testing

#### Test 1.1: Upload Resume
1. **Log in as a Student**
   - Go to `/profile/resume`
   - You should see "My Resume" page

2. **Upload a Resume**
   - Click "Upload Resume" button
   - Select a PDF file (test file should be < 10MB)
   - Fill in optional fields:
     - Major (e.g., "Computer Science")
     - GPA (e.g., 3.5)
     - Skills (e.g., "JavaScript, Python")
     - Graduation Year (e.g., 2025)
   - Click "Upload"

3. **Verify Upload**
   - ✅ Resume should appear on the page
   - ✅ PDF viewer should show your resume
   - ✅ Metadata (major, GPA, skills) should display
   - ✅ Upload date should show

**Expected Result:** Resume uploads successfully and displays correctly

---

#### Test 1.2: View Resume
1. **View Uploaded Resume**
   - On `/profile/resume` page
   - Scroll to see the resume viewer
   - ✅ PDF should render in the viewer
   - ✅ Download button should work

**Expected Result:** Resume displays correctly in PDF viewer

---

#### Test 1.3: Replace Resume
1. **Replace Existing Resume**
   - On `/profile/resume` page
   - Click "Upload a new version" button
   - Select a different PDF file
   - Upload

2. **Verify Replacement**
   - ✅ Old resume should be replaced
   - ✅ New resume should display
   - ✅ Version number should increment (if visible)

**Expected Result:** Resume is replaced successfully

---

#### Test 1.4: Delete Resume
1. **Delete Resume**
   - On `/profile/resume` page
   - Click "Delete Resume" button
   - Confirm deletion

2. **Verify Deletion**
   - ✅ Resume should disappear
   - ✅ Upload form should appear again

**Expected Result:** Resume is deleted successfully

---

### 2. Sponsor Portal Testing

#### Test 2.1: Access Sponsor Dashboard
1. **Log in as Sponsor or Admin**
   - Go to `/sponsor/dashboard`
   - You should see the Sponsor Dashboard

2. **Verify Dashboard Stats**
   - ✅ Upcoming Events count
   - ✅ Total Registrations count
   - ✅ Available Resumes count
   - ✅ Total Attendance count

**Expected Result:** Dashboard displays correct statistics

---

#### Test 2.2: Resume Search
1. **Navigate to Resume Search**
   - Click "Search Resumes" button or go to `/sponsor/resumes`

2. **Search for Resumes**
   - Use search bar to search by name/email
   - Apply filters:
     - Major filter
     - GPA range
     - Skills
     - Graduation year
   - ✅ Results should filter correctly

3. **View Resume**
   - Click on a student's resume
   - ✅ Resume should open in viewer
   - ✅ Student info should display

**Expected Result:** Resume search works with all filters

---

#### Test 2.3: Shortlist Candidates
1. **Add to Shortlist**
   - On `/sponsor/resumes` page
   - Find a student resume
   - Click "Add to Shortlist" button
   - ✅ Success message should appear

2. **View Shortlist**
   - Go to `/sponsor/shortlist`
   - ✅ Shortlisted candidates should appear
   - ✅ Resume should be accessible

3. **Remove from Shortlist**
   - Click "Remove from Shortlist"
   - ✅ Candidate should be removed

**Expected Result:** Shortlist functionality works correctly

---

#### Test 2.4: CSV Export
1. **Export Resumes to CSV**
   - On `/sponsor/resumes` page
   - Apply any filters you want
   - Click "Export to CSV" button
   - ✅ CSV file should download
   - ✅ File should contain correct data

**Expected Result:** CSV export works correctly

---

### 3. QR Code Check-in System Testing

#### Test 3.1: Generate QR Code
1. **Register for an Event**
   - Log in as a Student
   - Go to an event page
   - Click "Register" button
   - ✅ Registration should succeed

2. **View QR Code**
   - Go to `/registrations` page
   - Find your registration
   - ✅ QR code should display
   - ✅ QR code should be scannable
   - ✅ Download button should work

**Expected Result:** QR code generates and displays correctly

---

#### Test 3.2: QR Code in Email
1. **Check Email**
   - After registering, check your email
   - ✅ Registration confirmation email should contain QR code image

**Expected Result:** QR code appears in confirmation email

---

#### Test 3.3: Admin Check-in Scanner
1. **Access Check-in Page**
   - Log in as Admin
   - Go to `/admin/checkin`
   - ✅ Check-in scanner page should load

2. **Manual Check-in**
   - Copy the QR code data from a registration
   - Paste into the input field
   - Click "Check In"
   - ✅ Success message should appear
   - ✅ Attendee info should display
   - ✅ Status should show "Checked In"

3. **Verify Check-in Status**
   - Go to `/admin/registrations`
   - Find the checked-in user
   - ✅ Status should be "checked_in"

**Expected Result:** Check-in scanner works correctly

---

#### Test 3.4: Check-in Validation
1. **Try Invalid QR Code**
   - Go to `/admin/checkin`
   - Enter invalid QR code data
   - Click "Check In"
   - ✅ Error message should appear

2. **Try Already Checked-in**
   - Try checking in the same person twice
   - ✅ Error message should indicate already checked in

**Expected Result:** Validation works correctly

---

### 4. Event Sessions Testing

#### Test 4.1: Create Session (Admin)
1. **Access Session Management**
   - Log in as Admin
   - Go to an event page
   - Click "Manage Sessions" button
   - Or go to `/admin/events/[eventId]/sessions`

2. **Create a Session**
   - Click "Create Session" button
   - Fill in:
     - Title (e.g., "Networking Workshop")
     - Description
     - Start Date/Time
     - End Date/Time
     - Capacity (e.g., 20)
   - Click "Create"

3. **Verify Session Created**
   - ✅ Session should appear in the list
   - ✅ Session details should be correct

**Expected Result:** Session is created successfully

---

#### Test 4.2: Register for Session (Student)
1. **View Session on Event Page**
   - Log in as Student
   - Go to an event page that has sessions
   - ✅ Sessions should be listed

2. **Register for Session**
   - Find a session
   - Click "Register" button
   - ✅ Registration should succeed
   - ✅ Status should update to "Registered"

3. **Check Capacity**
   - If session is at capacity:
     - ✅ Should show "Full" status
     - ✅ Register button should be disabled

**Expected Result:** Session registration works correctly

---

#### Test 4.3: View My Sessions
1. **Access My Sessions**
   - Log in as Student
   - Go to `/sessions`
   - ✅ Your registered sessions should appear

2. **Verify Session Details**
   - ✅ Event name should show
   - ✅ Session title should show
   - ✅ Date/time should be correct
   - ✅ Status should be "Registered"

3. **Cancel Session Registration**
   - Click "Cancel Registration" button
   - Confirm cancellation
   - ✅ Session should be removed from list

**Expected Result:** My Sessions page works correctly

---

#### Test 4.4: Session Conflict Detection
1. **Create Overlapping Sessions**
   - As Admin, create two sessions with overlapping times
   - Try to register for both as a Student
   - ✅ System should prevent double booking
   - ✅ Error message should indicate conflict

**Expected Result:** Conflict detection works correctly

---

### 5. Waitlist System Testing

#### Test 5.1: Auto-Add to Waitlist
1. **Create Full Event**
   - As Admin, create an event with capacity = 2
   - Register 2 students (fill the event)
   - Try to register a 3rd student
   - ✅ Should automatically add to waitlist
   - ✅ Waitlist position should be shown (e.g., "Position #1")

**Expected Result:** Waitlist auto-adds when event is full

---

#### Test 5.2: View Waitlist Position
1. **Check Waitlist Status**
   - As a waitlisted student
   - Go to `/registrations` page
   - ✅ Waitlist section should show
   - ✅ Position number should display

2. **Check Event Page**
   - Go to the event page
   - ✅ Should show "You're on the waitlist"
   - ✅ Position number should display

**Expected Result:** Waitlist position displays correctly

---

#### Test 5.3: Promote from Waitlist
1. **Cancel Registration**
   - As one of the registered students
   - Cancel your registration

2. **Verify Promotion**
   - Check waitlisted student's status
   - ✅ Should automatically be promoted to registered
   - ✅ Waitlist position should be cleared
   - ✅ Registration confirmation should be sent

**Expected Result:** Waitlist promotion works automatically

---

#### Test 5.4: Waitlist Position Updates
1. **Multiple Cancellations**
   - Have 5 people on waitlist (positions 1-5)
   - Cancel registration for person #1
   - ✅ Person #2 should become #1
   - ✅ Person #3 should become #2
   - ✅ All positions should shift correctly

**Expected Result:** Waitlist positions update correctly

---

## 🐛 **COMMON ISSUES & SOLUTIONS**

### Issue: Resume upload fails
**Solution:**
- Check file size (must be < 10MB)
- Check file type (must be PDF)
- Verify `resumes` bucket exists in Supabase Storage
- Check RLS policies allow uploads

### Issue: QR code not displaying
**Solution:**
- Check that registration has `qr_code_token` field
- Verify QR code generation in registration router
- Check browser console for errors

### Issue: Sponsor dashboard shows 0 resumes
**Solution:**
- Verify students have uploaded resumes
- Check RLS policies for sponsor access
- Verify sponsor role is set correctly

### Issue: Session registration fails
**Solution:**
- Check session capacity hasn't been reached
- Verify session times are correct
- Check for time conflicts with other sessions

### Issue: Waitlist not auto-adding
**Solution:**
- Verify event has a capacity limit set
- Check `register_for_event` database function
- Ensure registration count matches capacity check

---

## ✅ **SUCCESS CRITERIA**

All Phase 2 features are working correctly if:

- ✅ Students can upload, view, replace, and delete resumes
- ✅ Sponsors can search, filter, and export resumes
- ✅ Shortlist functionality works
- ✅ QR codes generate on registration
- ✅ QR codes appear in confirmation emails
- ✅ Admin can scan QR codes to check in attendees
- ✅ Admins can create sessions within events
- ✅ Students can register for sessions
- ✅ "My Sessions" page shows registered sessions
- ✅ Waitlist auto-adds when event is full
- ✅ Waitlist position displays correctly
- ✅ Waitlist promotes automatically on cancellation

---

## 📝 **TESTING CHECKLIST**

Print this checklist and check off each test:

### Resume Management
- [ ] Upload resume
- [ ] View resume
- [ ] Replace resume
- [ ] Delete resume

### Sponsor Portal
- [ ] Access dashboard
- [ ] Search resumes
- [ ] Filter resumes
- [ ] Add to shortlist
- [ ] View shortlist
- [ ] Remove from shortlist
- [ ] Export CSV

### QR Code System
- [ ] QR code generates on registration
- [ ] QR code displays on registrations page
- [ ] QR code in email
- [ ] Admin can check in manually
- [ ] Check-in status updates
- [ ] Invalid QR code rejected

### Event Sessions
- [ ] Admin can create session
- [ ] Session appears on event page
- [ ] Student can register for session
- [ ] Capacity limit enforced
- [ ] "My Sessions" page works
- [ ] Can cancel session registration
- [ ] Conflict detection works

### Waitlist System
- [ ] Auto-adds when full
- [ ] Position displays correctly
- [ ] Auto-promotes on cancellation
- [ ] Positions update correctly

---

## 🚀 **NEXT STEPS**

After completing all tests:

1. **Document any bugs found**
2. **Fix critical issues**
3. **Re-test fixed features**
4. **Move to Phase 3 testing** (if applicable)

---

**Happy Testing!** 🎉

If you find any issues, document them and we'll fix them together!

