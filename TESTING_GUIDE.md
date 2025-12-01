# End-to-End Testing Guide

## Overview

This guide provides comprehensive testing procedures for all features of the CMIS Event Management System. Follow these tests to ensure all functionality works correctly.

---

## Pre-Testing Setup

### 1. Database Migrations

Run all migrations in Supabase SQL Editor:

```bash
# Use the master migration script
database/migrations/master_migration.sql
```

**Verification:**
- Check that all tables and columns exist
- Verify indexes are created
- Confirm functions are available

### 2. Environment Variables

Ensure `.env.local` has all required variables:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# Email
RESEND_API_KEY=your_key
RESEND_FROM_EMAIL=your_email
NEXT_PUBLIC_APP_URL=http://localhost:3000

# QR Code
QR_CODE_SECRET=your_secret_key
```

### 3. Supabase Storage Buckets

Create storage buckets:
1. Go to Supabase Dashboard → Storage
2. Create bucket: `resumes` (Private)
3. Create bucket: `event-images` (Public - optional)

---

## Test User Accounts

Create test users with different roles:

1. **Admin User**
   - Email: `admin@test.com`
   - Role: `admin`
   - Password: `test123456`

2. **Sponsor User**
   - Email: `sponsor@test.com`
   - Role: `sponsor`
   - Password: `test123456`

3. **Student User**
   - Email: `student@test.com`
   - Role: `user` (or `student`)
   - Password: `test123456`

---

## Testing Checklist

### ✅ Authentication & Authorization

#### Test 1: User Registration
- [ ] Navigate to `/signup`
- [ ] Fill in registration form
- [ ] Select role (student/faculty/sponsor)
- [ ] Submit form
- [ ] Verify redirect to login or dashboard
- [ ] Check user created in database

#### Test 2: User Login
- [ ] Navigate to `/login`
- [ ] Enter valid credentials
- [ ] Submit form
- [ ] Verify redirect to dashboard
- [ ] Check session persists on page refresh

#### Test 3: Password Reset
- [ ] Navigate to `/reset-password`
- [ ] Enter email address
- [ ] Submit form
- [ ] Check email for reset link
- [ ] Complete password reset
- [ ] Login with new password

#### Test 4: Protected Routes
- [ ] Logout
- [ ] Try accessing `/dashboard` (should redirect to login)
- [ ] Try accessing `/admin/dashboard` (should redirect to login)
- [ ] Login and verify access

#### Test 5: Role-Based Access
- [ ] Login as student
- [ ] Verify cannot access `/admin/*` routes
- [ ] Verify cannot access `/sponsor/*` routes
- [ ] Login as admin
- [ ] Verify can access all routes
- [ ] Login as sponsor
- [ ] Verify can access `/sponsor/*` routes

---

### ✅ Event Management

#### Test 6: Create Event (Admin)
- [ ] Login as admin
- [ ] Navigate to `/admin/events/new`
- [ ] Fill in event form:
  - Title: "Test Event"
  - Description: "Test description"
  - Start date/time
  - End date/time
  - Capacity: 50
  - Upload image (optional)
- [ ] Submit form
- [ ] Verify event appears in `/admin/events`
- [ ] Verify event appears in `/events`

#### Test 7: Edit Event (Admin)
- [ ] Navigate to `/admin/events`
- [ ] Click edit on an event
- [ ] Modify event details
- [ ] Save changes
- [ ] Verify changes reflected on event detail page

#### Test 8: Delete Event (Admin)
- [ ] Navigate to `/admin/events`
- [ ] Click delete on an event
- [ ] Confirm deletion
- [ ] Verify event removed from list
- [ ] Verify event no longer accessible

#### Test 9: View Events (Public)
- [ ] Logout
- [ ] Navigate to `/events`
- [ ] Verify events are displayed
- [ ] Test search functionality
- [ ] Test filters
- [ ] Click on event to view details

---

### ✅ Event Registration

#### Test 10: Register for Event
- [ ] Login as student
- [ ] Navigate to `/events`
- [ ] Click on an event
- [ ] Click "Register" button
- [ ] Confirm registration
- [ ] Verify success message
- [ ] Check email for confirmation (if configured)
- [ ] Verify registration in `/registrations`

#### Test 11: Cancel Registration
- [ ] Navigate to `/registrations`
- [ ] Find an active registration
- [ ] Click "Cancel Registration"
- [ ] Confirm cancellation
- [ ] Verify status changed to "cancelled"
- [ ] Check email for cancellation (if configured)

#### Test 12: Capacity Limits
- [ ] Create event with capacity: 2
- [ ] Register 2 users
- [ ] Try registering 3rd user
- [ ] Verify waitlist message (if implemented)
- [ ] Verify 3rd user added to waitlist

#### Test 13: QR Code Generation
- [ ] Register for an event
- [ ] Navigate to `/registrations`
- [ ] Verify QR code is displayed
- [ ] Download QR code
- [ ] Verify QR code is scannable (test with scanner app)
- [ ] Check confirmation email includes QR code image

---

### ✅ QR Code Check-In

#### Test 14: Admin Check-In
- [ ] Login as admin
- [ ] Navigate to `/admin/checkin`
- [ ] Get QR code from registered user
- [ ] Enter QR code data manually or scan
- [ ] Click "Check In"
- [ ] Verify success message
- [ ] Verify registration status updated to "checked_in"
- [ ] Verify `checked_in_at` timestamp set

#### Test 15: Invalid QR Code
- [ ] Navigate to `/admin/checkin`
- [ ] Enter invalid QR code data
- [ ] Verify error message
- [ ] Try checking in already checked-in user
- [ ] Verify appropriate error message

---

### ✅ Resume Management

#### Test 16: Upload Resume
- [ ] Login as student
- [ ] Navigate to `/profile/resume`
- [ ] Click "Upload Resume"
- [ ] Select PDF file (under 10MB)
- [ ] Fill in optional fields:
  - Major
  - GPA
  - Skills (comma-separated)
  - Graduation year
- [ ] Submit form
- [ ] Verify success message
- [ ] Verify resume appears on page

#### Test 17: View Resume
- [ ] Navigate to `/profile/resume`
- [ ] Verify resume is displayed
- [ ] Click "Download" button
- [ ] Verify PDF downloads correctly
- [ ] Verify metadata displayed correctly

#### Test 18: Replace Resume
- [ ] Navigate to `/profile/resume`
- [ ] Click "Upload a new version"
- [ ] Upload new PDF
- [ ] Verify version number increments
- [ ] Verify old resume replaced

#### Test 19: Delete Resume
- [ ] Navigate to `/profile/resume`
- [ ] Click "Delete" button
- [ ] Confirm deletion
- [ ] Verify resume removed
- [ ] Verify can upload new resume

#### Test 20: File Validation
- [ ] Try uploading non-PDF file
- [ ] Verify error message
- [ ] Try uploading PDF over 10MB
- [ ] Verify error message

---

### ✅ Event Sessions

#### Test 21: Create Session (Admin)
- [ ] Login as admin
- [ ] Navigate to event detail page
- [ ] Click "Manage Sessions" or go to `/admin/events/[id]/sessions`
- [ ] Click "Add Session"
- [ ] Fill in session form:
  - Title
  - Description
  - Start time
  - End time
  - Capacity (optional)
- [ ] Submit form
- [ ] Verify session appears in list

#### Test 22: Session Conflict Detection
- [ ] Create session: 10:00 AM - 11:00 AM
- [ ] Try creating overlapping session: 10:30 AM - 11:30 AM
- [ ] Verify error message about conflict
- [ ] Create non-overlapping session
- [ ] Verify success

#### Test 23: Register for Session
- [ ] Login as student
- [ ] Navigate to event with sessions
- [ ] Scroll to sessions section
- [ ] Click "Register for Session"
- [ ] Confirm registration
- [ ] Verify success message
- [ ] Verify session appears in `/sessions`

#### Test 24: Cancel Session Registration
- [ ] Navigate to `/sessions`
- [ ] Find registered session
- [ ] Click "Cancel Registration"
- [ ] Confirm cancellation
- [ ] Verify removed from my sessions

#### Test 25: Session Capacity
- [ ] Create session with capacity: 1
- [ ] Register 1 user
- [ ] Try registering 2nd user
- [ ] Verify "Full" message
- [ ] Verify 2nd user cannot register

---

### ✅ Sponsor Portal

#### Test 26: Sponsor Dashboard
- [ ] Login as sponsor
- [ ] Navigate to `/sponsor/dashboard`
- [ ] Verify statistics displayed:
  - Upcoming events
  - Total registrations
  - Available resumes
  - Total attendance
- [ ] Verify quick action links work

#### Test 27: Resume Search
- [ ] Navigate to `/sponsor/resumes`
- [ ] Verify resumes are displayed
- [ ] Test search by name
- [ ] Test filter by major
- [ ] Test filter by GPA range
- [ ] Test filter by graduation year
- [ ] Verify results update correctly

#### Test 28: View Resume (Sponsor)
- [ ] Find a resume in search results
- [ ] Click "View Resume"
- [ ] Verify PDF opens in new tab
- [ ] Verify view is tracked in analytics

#### Test 29: Shortlist Management
- [ ] Search for resumes
- [ ] Click star icon to add to shortlist
- [ ] Verify star becomes filled
- [ ] Navigate to `/sponsor/shortlist`
- [ ] Verify candidate appears
- [ ] Click "Remove" from shortlist
- [ ] Verify candidate removed

#### Test 30: CSV Export
- [ ] Navigate to `/sponsor/resumes`
- [ ] Apply filters (optional)
- [ ] Click "Export CSV"
- [ ] Verify CSV file downloads
- [ ] Open CSV and verify data is correct
- [ ] Test export from shortlist page

---

### ✅ Navigation & UI

#### Test 31: Header Navigation
- [ ] Verify all links work:
  - Home
  - Events
  - Dashboard (when logged in)
  - My Registrations (when logged in)
  - My Sessions (when logged in)
  - Sponsor (when sponsor/admin)
  - Admin (when admin)
- [ ] Test mobile menu
- [ ] Test logout functionality

#### Test 32: Responsive Design
- [ ] Test on desktop (1920x1080)
- [ ] Test on tablet (768x1024)
- [ ] Test on mobile (375x667)
- [ ] Verify all pages are responsive
- [ ] Verify navigation menu works on mobile

---

### ✅ Error Handling

#### Test 33: Error Pages
- [ ] Navigate to `/nonexistent-page`
- [ ] Verify 404 page displays
- [ ] Verify navigation links work from 404
- [ ] Trigger an error (e.g., invalid API call)
- [ ] Verify error boundary displays

#### Test 34: Form Validation
- [ ] Try submitting empty forms
- [ ] Verify validation errors display
- [ ] Try invalid email formats
- [ ] Try invalid date ranges
- [ ] Verify appropriate error messages

---

## Automated Testing (Future)

### Unit Tests
- [ ] tRPC router tests
- [ ] Component tests
- [ ] Utility function tests

### Integration Tests
- [ ] API endpoint tests
- [ ] Database function tests
- [ ] Authentication flow tests

### E2E Tests (Playwright/Cypress)
- [ ] User registration flow
- [ ] Event creation and registration
- [ ] Resume upload and search
- [ ] QR code check-in flow

---

## Performance Testing

### Test 35: Page Load Times
- [ ] Measure initial page load
- [ ] Measure navigation between pages
- [ ] Verify all pages load under 2 seconds

### Test 36: Large Datasets
- [ ] Create 100+ events
- [ ] Verify events page loads quickly
- [ ] Create 100+ registrations
- [ ] Verify admin registrations page loads
- [ ] Upload 50+ resumes
- [ ] Verify resume search performs well

---

## Browser Compatibility

### Test 37: Browser Testing
- [ ] Test in Chrome (latest)
- [ ] Test in Firefox (latest)
- [ ] Test in Safari (latest)
- [ ] Test in Edge (latest)
- [ ] Verify all features work in all browsers

---

## Security Testing

### Test 38: Access Control
- [ ] Verify RLS policies work
- [ ] Test unauthorized access attempts
- [ ] Verify API endpoints are protected
- [ ] Test SQL injection protection
- [ ] Test XSS protection

### Test 39: Data Validation
- [ ] Test file upload security
- [ ] Verify file type validation
- [ ] Verify file size limits
- [ ] Test input sanitization

---

## Email Testing

### Test 40: Email Delivery
- [ ] Register for event
- [ ] Verify confirmation email sent
- [ ] Check email formatting
- [ ] Verify QR code in email
- [ ] Cancel registration
- [ ] Verify cancellation email sent

---

## Reporting Issues

If you find any issues during testing:

1. Note the test number
2. Document steps to reproduce
3. Include screenshots (if applicable)
4. Note browser and OS
5. Check browser console for errors
6. Report in GitHub Issues

---

## Test Completion Checklist

- [ ] All authentication tests passed
- [ ] All event management tests passed
- [ ] All registration tests passed
- [ ] All QR code tests passed
- [ ] All resume tests passed
- [ ] All session tests passed
- [ ] All sponsor portal tests passed
- [ ] All navigation tests passed
- [ ] All error handling tests passed
- [ ] All performance tests passed

**Date Tested:** _______________
**Tested By:** _______________
**Overall Status:** ☐ Pass ☐ Fail ☐ Needs Fixes

---

## Quick Test Commands

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Run linter
pnpm lint

# Check types
pnpm type-check  # if configured
```

---

**Remember:** Always test in a development environment first before testing in production!
