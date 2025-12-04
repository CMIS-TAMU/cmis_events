# 🧪 Mentorship System - Complete Testing Guide

**Status:** Ready for Testing  
**Date:** Today

---

## 📋 **TESTING OVERVIEW**

This guide covers comprehensive testing of all mentorship system features. Test each section systematically to ensure everything works correctly.

---

## 🎯 **PREREQUISITES FOR TESTING**

### **1. Database Setup**
- ✅ All mentorship migrations run in Supabase
- ✅ RLS policies enabled
- ✅ Matching functions created
- ✅ At least one mentor profile exists

### **2. Test Accounts Needed**
- **Student Account:** Regular student user
- **Mentor Account:** User with mentorship profile (mentor type)
- **Admin Account:** User with admin role

### **3. Browser Setup**
- Open Developer Tools (F12 or Cmd+Option+I)
- Keep Console tab open to see errors
- Keep Network tab open to monitor API calls

---

## 📝 **TESTING CHECKLIST**

### **✅ Phase 1: Student Features**

#### **Test 1: Student Dashboard** (`/mentorship/dashboard`)
**Steps:**
1. Log in as a student
2. Navigate to `/mentorship/dashboard`
3. Verify the page loads without errors
4. Check that you see:
   - ✅ "Account Information" section (not profile requirement)
   - ✅ "Request a Mentor" button (if no active match)
   - ✅ Quick Actions section

**Expected Results:**
- ✅ Page loads successfully
- ✅ No console errors
- ✅ Student-specific content displayed
- ✅ No profile creation prompt

**Edge Cases:**
- Test with student who has no data (major, skills, resume)
- Test with student who has active match
- Test with student who has pending batch

---

#### **Test 2: Request a Mentor** (`/mentorship/request`)
**Steps:**
1. Log in as a student
2. Navigate to `/mentorship/request`
3. Fill out the request form:
   - Preferred mentorship type (optional)
   - Preferred industry (optional)
   - Preferred communication method (optional)
   - Student notes (optional)
4. Click "Request a Mentor"
5. Monitor browser console for errors

**Expected Results:**
- ✅ Form submits successfully
- ✅ Loading state shows "Finding Mentors..."
- ✅ Success message appears
- ✅ Redirects to request page or dashboard
- ✅ No errors in console

**Edge Cases:**
- Test without filling any optional fields
- Test with student who already has pending batch (should show error)
- Test with student who has no major/skills/resume (should show error)

**Known Issue:** If "Finding Mentors" hangs, check:
- Are there mentors in the database?
- Are mentors in matching pool?
- Run `DEBUG_MATCHING_ISSUE.sql` to diagnose

---

#### **Test 3: Match Details Page** (`/mentorship/match/[id]`)
**Prerequisites:** Student must have an active match

**Steps:**
1. Log in as a student
2. Navigate to `/mentorship/dashboard`
3. Click "View Match Details" on active match
4. Verify page loads at `/mentorship/match/[match-id]`
5. Check all sections:
   - Match Information card
   - Match Score display
   - Partner Profile (Mentor)
   - Meeting Statistics
   - Quick Actions sidebar
   - Match Health indicator
   - Recent Feedback section

**Expected Results:**
- ✅ Page loads with match information
- ✅ Mentor details displayed correctly
- ✅ Match score shown
- ✅ Match reasoning displayed (if available)
- ✅ Links to meetings work
- ✅ No errors in console

**Edge Cases:**
- Test with match that has no meetings
- Test with match that has at-risk status
- Test with match that has low health score

---

#### **Test 4: Meeting Logs** (`/mentorship/match/[id]/meetings`)
**Steps:**
1. Navigate to match details page
2. Click "View Meeting Logs" or "View Meetings"
3. Verify page loads at `/mentorship/match/[id]/meetings`
4. Check statistics cards (Total Meetings, Total Time, Average)
5. Click "Log Meeting" button
6. Fill out meeting form:
   - Meeting Date (required)
   - Duration (optional)
   - Meeting Type (virtual, in-person, phone, email)
   - Agenda (optional)
   - Student Notes (optional)
7. Submit the form
8. Verify meeting appears in the list

**Expected Results:**
- ✅ Meetings page loads
- ✅ Statistics calculated correctly
- ✅ Dialog opens for logging meeting
- ✅ Form validation works
- ✅ Meeting is saved successfully
- ✅ New meeting appears in list immediately
- ✅ Meeting details display correctly

**Edge Cases:**
- Test logging meeting without duration
- Test logging meeting with all fields filled
- Test viewing meetings with no meetings logged
- Test meeting type badges display correctly

---

#### **Test 5: Quick Questions - Student** (`/mentorship/questions`)
**Steps:**
1. Log in as a student
2. Navigate to `/mentorship/questions`
3. Verify statistics cards show correct counts
4. Click "Ask a Question" button
5. Fill out question form:
   - Question Title (required, 5-200 chars)
   - Description (required, 10-2000 chars)
   - Preferred Response Time (24-hours, 48-hours, 1-week)
   - Tags (optional, can add multiple)
6. Submit the question
7. Verify question appears in your questions list
8. Check question status (should be "Open")

**Expected Results:**
- ✅ Questions page loads
- ✅ Statistics display correctly
- ✅ Form dialog opens
- ✅ Validation works (min/max lengths)
- ✅ Tags can be added/removed
- ✅ Question is posted successfully
- ✅ Question appears in list with correct status

**Edge Cases:**
- Test posting question with minimum required fields
- Test posting question with all fields filled
- Test adding/removing tags
- Test viewing questions that are claimed
- Test viewing questions that are completed

---

#### **Test 6: Feedback Submission**
**Steps:**
1. Navigate to match details page (`/mentorship/match/[id]`)
2. Click "Submit Feedback" in Quick Actions
3. Fill out feedback form:
   - Feedback Type (general, match-quality, session, final)
   - Rating (1-5 stars)
   - Comment (optional)
4. Submit feedback
5. Verify feedback appears in "Recent Feedback" sidebar

**Expected Results:**
- ✅ Feedback dialog opens
- ✅ Star rating can be selected (1-5)
- ✅ Form submission works
- ✅ Feedback appears in recent feedback section
- ✅ No errors in console

**Edge Cases:**
- Test submitting feedback with only rating (no comment)
- Test submitting feedback with rating and comment
- Test submitting feedback twice (should show error about already submitted)
- Test different feedback types

---

### **✅ Phase 2: Mentor Features**

#### **Test 7: Mentor Dashboard** (`/mentorship/dashboard`)
**Prerequisites:** Mentor account with mentorship profile

**Steps:**
1. Log in as a mentor
2. Navigate to `/mentorship/dashboard`
3. Verify mentor-specific content:
   - Profile Status section
   - Current Mentees section (if any)
   - Pending Requests section (if any)
   - Quick Actions

**Expected Results:**
- ✅ Mentor-specific dashboard loads
- ✅ Profile information displayed
- ✅ Active mentees listed (if any)
- ✅ Pending requests shown (if any)
- ✅ No "Request a Mentor" button (mentors don't need it)

---

#### **Test 8: Mentor Requests** (`/mentorship/mentor/requests`)
**Prerequisites:** At least one student request where mentor is recommended

**Steps:**
1. Log in as a mentor
2. Navigate to `/mentorship/mentor/requests`
3. Verify student requests are displayed
4. For each request, check:
   - Student name and email
   - Match score
   - Match reasoning
   - Student notes (if any)
5. Click "Accept" or "Decline" on a request
6. Verify the action completes

**Expected Results:**
- ✅ Requests page loads
- ✅ Student requests displayed correctly
- ✅ Match scores shown
- ✅ Accept/Decline buttons work
- ✅ Status updates after action
- ✅ No errors in console

**Edge Cases:**
- Test accepting a request (should create match)
- Test declining a request
- Test with no pending requests (should show empty state)
- Test with multiple requests

---

#### **Test 9: Mentor Mentees** (`/mentorship/mentor/mentees`)
**Prerequisites:** Mentor with at least one active mentee

**Steps:**
1. Log in as a mentor
2. Navigate to `/mentorship/mentor/mentees`
3. Verify statistics cards:
   - Active Mentees count
   - Healthy Matches count
   - Needs Attention count
4. Check mentee cards:
   - Student name and email
   - Match score
   - Matched date
   - Last meeting date
   - Health score
5. Click "View Details" on a mentee
6. Click "Meetings" button

**Expected Results:**
- ✅ Mentees page loads
- ✅ Statistics calculated correctly
- ✅ All active mentees listed
- ✅ At-risk matches highlighted
- ✅ Links to match details work
- ✅ Links to meetings work

**Edge Cases:**
- Test with no active mentees (should show empty state)
- Test with at-risk match (should show warning)
- Test with healthy matches only

---

#### **Test 10: Quick Questions - Mentor** (`/mentorship/mentor/questions`)
**Steps:**
1. Log in as a mentor
2. Navigate to `/mentorship/mentor/questions`
3. Verify statistics cards:
   - Open Questions count
   - Urgent (24h) count
   - Available Now count
4. Test search functionality:
   - Type in search box
   - Verify questions filter
5. Test tag filtering:
   - Click on tags to filter
   - Click "Clear filters" to reset
6. Click "Claim Question" on an open question
7. Verify question status changes to "Claimed"

**Expected Results:**
- ✅ Questions marketplace loads
- ✅ Open questions displayed
- ✅ Search filters questions correctly
- ✅ Tag filtering works
- ✅ Urgent questions highlighted
- ✅ Claim button works
- ✅ Question status updates after claiming

**Edge Cases:**
- Test with no open questions (should show empty state)
- Test search with no results
- Test claiming already claimed question (should show error)
- Test filtering by multiple tags

---

#### **Test 11: Mentor - Match Details**
**Steps:**
1. Log in as a mentor
2. Navigate to a mentee's match details (`/mentorship/match/[id]`)
3. Verify mentor view:
   - Student profile displayed (not mentor)
   - Match information shown
   - Meeting statistics visible
   - Can submit feedback

**Expected Results:**
- ✅ Match details page loads
- ✅ Student profile shown (not mentor)
- ✅ All features work as expected
- ✅ Can log meetings
- ✅ Can submit feedback

---

#### **Test 12: Mentor - Meeting Logs**
**Steps:**
1. As a mentor, navigate to `/mentorship/match/[id]/meetings`
2. Click "Log Meeting"
3. Fill out meeting form (mentor can add mentor notes)
4. Submit meeting
5. Verify meeting appears with both student and mentor notes

**Expected Results:**
- ✅ Can log meetings as mentor
- ✅ Mentor notes field available
- ✅ Student notes visible (if student added any)
- ✅ Meeting displays correctly for both parties

---

### **✅ Phase 3: Admin Features**

#### **Test 13: Admin Dashboard** (`/admin/mentorship`)
**Prerequisites:** Admin account

**Steps:**
1. Log in as admin
2. Navigate to `/admin/mentorship`
3. Verify all statistics cards:
   - Total Matches
   - Active Matches
   - At-Risk Matches
   - Average Match Score
   - Pending Batches
   - Unmatched Students
   - Recent Matches (30 days)
4. Check At-Risk Matches section (if any)
5. Test status filter:
   - Select "Active" - verify table updates
   - Select "Pending" - verify table updates
   - Select "All Status" - verify all matches shown
6. Test manual match creation:
   - Click "Create Manual Match"
   - Fill out form (Student ID, Mentor ID, optional score/notes)
   - Submit
   - Verify match appears in table

**Expected Results:**
- ✅ Dashboard loads with all statistics
- ✅ Statistics calculated correctly
- ✅ At-risk matches highlighted
- ✅ Filter dropdown works
- ✅ Matches table displays correctly
- ✅ Manual match creation works
- ✅ Links to match details work

**Edge Cases:**
- Test filtering by different statuses
- Test creating manual match with invalid IDs (should show error)
- Test with no matches (should show empty state)
- Test with no at-risk matches

---

### **✅ Phase 4: Integration Tests**

#### **Test 14: Complete Student Flow**
**End-to-End Test:**

1. **Request Mentor:**
   - Student logs in
   - Navigates to `/mentorship/request`
   - Fills form and submits
   - Waits for match batch creation

2. **View Recommendations:**
   - Student checks `/mentorship/request` or dashboard
   - Sees 3 recommended mentors
   - Views mentor details

3. **Mentor Accepts:**
   - Mentor logs in
   - Sees student request
   - Accepts the request
   - Match is created

4. **View Match:**
   - Student navigates to match details
   - Sees mentor information
   - Checks match score

5. **Log Meeting:**
   - Student logs a meeting
   - Mentor logs a meeting
   - Both can see each other's meetings

6. **Submit Feedback:**
   - Student submits feedback
   - Mentor submits feedback
   - Both can see feedback in match details

**Expected Results:**
- ✅ Complete flow works end-to-end
- ✅ No errors at any step
- ✅ Data persists correctly
- ✅ Both parties can interact

---

#### **Test 15: Quick Questions Flow**
**End-to-End Test:**

1. **Student Posts Question:**
   - Student posts a question
   - Question appears as "Open"

2. **Mentor Claims Question:**
   - Mentor browses questions
   - Finds student's question
   - Claims the question
   - Question status changes to "Claimed"

3. **Question Completion:**
   - Mentor/Student marks question as completed
   - Question status changes to "Completed"

**Expected Results:**
- ✅ Question lifecycle works correctly
- ✅ Status updates properly
- ✅ Both parties can see updates

---

## 🐛 **ERROR SCENARIOS TO TEST**

### **1. Authentication Errors**
- Test accessing mentorship pages without logging in (should redirect)
- Test accessing admin pages as non-admin (should show error)

### **2. Data Validation Errors**
- Submit forms with invalid data
- Submit required fields empty
- Test character limits on text fields

### **3. Edge Cases**
- Access match details for match you don't belong to (should show access denied)
- Submit duplicate feedback (should show error)
- Claim already claimed question (should show error)

### **4. Empty States**
- View pages with no data (should show helpful empty states)
- Test with no mentors available
- Test with no matches

---

## 📊 **TESTING RESULTS TEMPLATE**

### **Feature:** [Feature Name]
**Date Tested:** [Date]
**Tester:** [Your Name]

**Test Results:**
- [ ] Passed
- [ ] Failed
- [ ] Needs Fix

**Issues Found:**
1. [Issue description]
2. [Issue description]

**Browser/Device:**
- Browser: [Chrome/Firefox/Safari]
- Device: [Desktop/Mobile]
- OS: [macOS/Windows/Linux]

**Screenshots:** [Attach if issues found]

---

## 🔧 **TROUBLESHOOTING COMMON ISSUES**

### **Issue: "Finding Mentors" Hangs**
**Solution:**
1. Check browser console for errors
2. Run `DEBUG_MATCHING_ISSUE.sql` in Supabase
3. Verify mentors exist in database
4. Check if mentors are in matching pool
5. Verify matching functions exist

### **Issue: "Access Denied" Error**
**Solution:**
1. Verify you're logged in
2. Check user role in database
3. Verify you have access to the resource
4. Check RLS policies

### **Issue: Page 404 Error**
**Solution:**
1. Verify URL is correct
2. Check if page file exists
3. Verify route structure matches URL
4. Restart development server

### **Issue: Data Not Showing**
**Solution:**
1. Check browser console for errors
2. Check Network tab for failed API calls
3. Verify database has data
4. Check RLS policies allow access
5. Verify tRPC endpoints are working

---

## ✅ **TESTING COMPLETION CHECKLIST**

### **Student Features:**
- [ ] Dashboard loads correctly
- [ ] Can request mentor
- [ ] Match details page works
- [ ] Can log meetings
- [ ] Can post questions
- [ ] Can submit feedback

### **Mentor Features:**
- [ ] Dashboard loads correctly
- [ ] Can view/accept requests
- [ ] Mentees page works
- [ ] Can browse/claim questions
- [ ] Can log meetings
- [ ] Can submit feedback

### **Admin Features:**
- [ ] Dashboard loads with statistics
- [ ] Can filter matches
- [ ] Can create manual matches
- [ ] At-risk matches visible

### **Integration:**
- [ ] Complete student flow works
- [ ] Complete mentor flow works
- [ ] Quick questions flow works

---

## 📝 **REPORTING ISSUES**

When reporting issues, include:
1. **Feature/Page:** Which feature or page has the issue
2. **Steps to Reproduce:** Exact steps to trigger the issue
3. **Expected Behavior:** What should happen
4. **Actual Behavior:** What actually happens
5. **Browser/Console Errors:** Any error messages
6. **Screenshots:** Visual proof of the issue

---

## 🎯 **PRIORITY TESTING ORDER**

1. **High Priority:**
   - Student mentor request flow
   - Match creation and viewing
   - Meeting logs

2. **Medium Priority:**
   - Quick Questions
   - Feedback system
   - Mentor requests

3. **Low Priority:**
   - Admin dashboard
   - Statistics and analytics
   - Edge cases

---

**Ready to start testing!** 🚀

Follow this guide systematically to ensure all features work correctly.
