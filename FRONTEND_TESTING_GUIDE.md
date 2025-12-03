# 🧪 Frontend Testing Guide - Phase 3 & 4

## ✅ Build Status: Successful

All build errors have been fixed and the application compiles successfully. This guide will help you test all the new Phase 3 & 4 features.

---

## 🚀 Quick Start

1. **Start the development server:**
   ```bash
   pnpm dev
   ```

2. **Open your browser:**
   - Navigate to `http://localhost:3000`
   - Make sure you're logged in as a student user

3. **Prerequisites:**
   - At least one active mission created by a sponsor (for testing)
   - Storage buckets verified in Supabase:
     - `mission-starter-files` (public)
     - `mission-submissions` (private)

---

## 📋 Test Checklist

### 1. Navigation Links ✅

#### Test Header Navigation
- [ ] **Desktop View:**
  - [ ] Click "Missions" link in header → Should navigate to `/missions`
  - [ ] Click "Leaderboard" link in header → Should navigate to `/leaderboard`
  - [ ] Verify links are visible when logged in
  - [ ] Verify links are hidden when logged out

- [ ] **Mobile View:**
  - [ ] Open mobile menu (hamburger icon)
  - [ ] Verify "Missions" and "Leaderboard" links appear
  - [ ] Click links and verify navigation works

#### Test Dashboard Links
- [ ] Navigate to `/dashboard`
- [ ] Verify "Browse Missions" button exists
- [ ] Verify "View Leaderboard" button exists
- [ ] Verify "My Mission Submissions" button exists
- [ ] Click each button and verify navigation

---

### 2. Mission Browse Page (`/missions`) ✅

#### Visual Checks
- [ ] Page loads without errors
- [ ] Header shows "Technical Missions"
- [ ] Description text is visible
- [ ] Search bar is visible
- [ ] Filter dropdowns (Difficulty, Category, Sort) are visible
- [ ] Mission cards are displayed in a grid

#### Search Functionality
- [ ] Type in search bar → Results filter in real-time
- [ ] Search by mission title → Correct results appear
- [ ] Search by description → Correct results appear
- [ ] Clear search → All missions reappear

#### Filter Functionality
- [ ] **Difficulty Filter:**
  - [ ] Select "Beginner" → Only beginner missions show
  - [ ] Select "Intermediate" → Only intermediate missions show
  - [ ] Select "Advanced" → Only advanced missions show
  - [ ] Select "Expert" → Only expert missions show
  - [ ] Select "All Difficulties" → All missions show

- [ ] **Category Filter:**
  - [ ] Select a category → Only missions in that category show
  - [ ] Select "All Categories" → All missions show

- [ ] **Sort Options:**
  - [ ] Select "Newest First" → Missions sorted by publish date
  - [ ] Select "Most Points" → Missions sorted by max points
  - [ ] Select "Difficulty" → Missions sorted by difficulty level

#### Mission Cards
- [ ] Each card displays:
  - [ ] Mission title
  - [ ] Difficulty badge (with correct color)
  - [ ] Category (if available)
  - [ ] Description (truncated with ellipsis)
  - [ ] Tags (first 3 + count if more)
  - [ ] Points (trophy icon)
  - [ ] Time limit (clock icon, if available)
  - [ ] Attempts count (users icon)
  - [ ] Deadline (if available)
  - [ ] "View Mission" button

- [ ] Click "View Mission" → Navigates to mission detail page

#### Empty States
- [ ] Apply filters that return no results → "No missions found" message appears
- [ ] Message suggests adjusting filters

---

### 3. Mission Detail Page (`/missions/[missionId]`) ✅

#### Visual Checks
- [ ] Page loads without errors
- [ ] "Back to Missions" button is visible
- [ ] Mission title is displayed
- [ ] Difficulty badge is visible
- [ ] Status badge is visible (Not Started, In Progress, etc.)
- [ ] Points and time limit are displayed in header

#### Mission Information
- [ ] **Description Section:**
  - [ ] Full mission description is displayed
  - [ ] Text is properly formatted

- [ ] **Requirements Section:**
  - [ ] Requirements are displayed (if available)
  - [ ] Text is properly formatted

- [ ] **Submission Instructions:**
  - [ ] Instructions are displayed (if available)
  - [ ] Text is properly formatted

- [ ] **Starter Files:**
  - [ ] Download link is visible (if starter files exist)
  - [ ] Click download → File downloads successfully

- [ ] **Tags:**
  - [ ] All tags are displayed as badges
  - [ ] Tags are clickable (if implemented)

- [ ] **Mission Stats:**
  - [ ] Deadline is displayed (if available)
  - [ ] Total attempts count is shown
  - [ ] Total submissions count is shown

#### Start Mission Flow
- [ ] **Initial State (Not Started):**
  - [ ] "Ready to Start?" card is visible
  - [ ] "Start Mission" button is visible
  - [ ] Submission form is NOT visible

- [ ] **Click "Start Mission":**
  - [ ] Button shows "Starting..." state
  - [ ] Status changes to "In Progress"
  - [ ] Submission form appears
  - [ ] "Start Mission" card disappears

#### Submission Form
- [ ] **Submission URL Field:**
  - [ ] Input field is visible
  - [ ] Placeholder text is helpful
  - [ ] Can type a URL
  - [ ] URL validation works (if implemented)

- [ ] **Submission Notes Field:**
  - [ ] Textarea is visible
  - [ ] Can type multiple lines
  - [ ] Placeholder text is helpful

- [ ] **File Upload:**
  - [ ] File input is visible
  - [ ] Can select multiple files
  - [ ] Selected files appear in a list
  - [ ] Each file shows:
    - [ ] File name
    - [ ] File size
    - [ ] Remove button (X icon)
  - [ ] Click remove → File is removed from list
  - [ ] File size validation (max 100 MB per file):
    - [ ] Upload file > 100 MB → Error message appears
    - [ ] Upload file < 100 MB → File is accepted

- [ ] **Submit Button:**
  - [ ] Button is visible
  - [ ] Button is disabled when:
    - [ ] No submission data provided (URL, text, or files)
    - [ ] Files are uploading
    - [ ] Submission is in progress

#### Submit Solution Flow
- [ ] **Test with URL only:**
  - [ ] Enter a URL (e.g., `https://github.com/user/repo`)
  - [ ] Leave text and files empty
  - [ ] Click "Submit Solution"
  - [ ] Button shows "Submitting..." state
  - [ ] Success message appears (or status updates)
  - [ ] Status changes to "Submitted"
  - [ ] Form shows submitted data

- [ ] **Test with text only:**
  - [ ] Enter submission notes
  - [ ] Leave URL and files empty
  - [ ] Click "Submit Solution"
  - [ ] Submission succeeds
  - [ ] Notes are displayed in submitted view

- [ ] **Test with files only:**
  - [ ] Select one or more files
  - [ ] Leave URL and text empty
  - [ ] Click "Submit Solution"
  - [ ] Upload progress shows (if implemented)
  - [ ] Button shows "Uploading files..." then "Submitting..."
  - [ ] Submission succeeds
  - [ ] Files are uploaded to storage

- [ ] **Test with all fields:**
  - [ ] Enter URL, text, and select files
  - [ ] Click "Submit Solution"
  - [ ] All data is submitted successfully

#### After Submission
- [ ] **Submitted State:**
  - [ ] Status badge shows "Submitted"
  - [ ] Submission form is replaced with submitted data view
  - [ ] Submitted URL is displayed as clickable link
  - [ ] Submitted text is displayed
  - [ ] Submitted files are listed (if applicable)

- [ ] **Reviewed State (after sponsor reviews):**
  - [ ] Status badge shows "Reviewed"
  - [ ] Score is displayed (e.g., "85/100")
  - [ ] Points awarded are displayed (e.g., "+850 points")
  - [ ] Sponsor feedback is displayed (if provided)
  - [ ] All information is properly formatted

#### Error Handling
- [ ] **Network Errors:**
  - [ ] Disconnect internet
  - [ ] Try to submit → Error message appears
  - [ ] Reconnect → Can retry submission

- [ ] **Validation Errors:**
  - [ ] Try to submit with no data → Error message appears
  - [ ] Try to upload file > 100 MB → Error message appears
  - [ ] Try to submit after deadline → Error message appears (if deadline passed)

---

### 4. My Submissions Page (`/profile/missions`) ✅

#### Visual Checks
- [ ] Page loads without errors
- [ ] Header shows "My Mission Submissions"
- [ ] Description text is visible
- [ ] Stats cards are displayed (4 cards)

#### Stats Cards
- [ ] **Total Submissions:**
  - [ ] Correct count is displayed
  - [ ] Updates when new submission is made

- [ ] **Total Points:**
  - [ ] Sum of all points awarded is displayed
  - [ ] Updates when new points are awarded

- [ ] **Average Score:**
  - [ ] Average of all scores is displayed
  - [ ] Shows 1 decimal place (e.g., "85.5")
  - [ ] Shows "0" if no scores yet

- [ ] **Leaderboard Rank:**
  - [ ] Rank is displayed (e.g., "#5")
  - [ ] Shows "N/A" if no rank yet
  - [ ] Updates when points change

#### Leaderboard Rank Card
- [ ] Card is visible (if rank exists)
- [ ] Shows:
  - [ ] Current rank (e.g., "Rank #5")
  - [ ] Total points
  - [ ] "View Leaderboard" button
- [ ] Click "View Leaderboard" → Navigates to leaderboard page

#### Filter Dropdown
- [ ] Filter dropdown is visible
- [ ] Options include:
  - [ ] All Statuses
  - [ ] Submitted
  - [ ] Under Review
  - [ ] Reviewed
  - [ ] Rejected
- [ ] Select filter → List updates accordingly

#### Submissions List
- [ ] **Empty State:**
  - [ ] If no submissions → "No submissions yet" message appears
  - [ ] "Browse Missions" button is visible
  - [ ] Click button → Navigates to missions page

- [ ] **With Submissions:**
  - [ ] Each submission card displays:
    - [ ] Mission title
    - [ ] Difficulty badge
    - [ ] Category badge
    - [ ] Status badge (with correct color)
    - [ ] Score (if reviewed)
    - [ ] Points awarded (if reviewed)
    - [ ] Submission date
    - [ ] Time spent (if available)
    - [ ] Review date (if reviewed)
    - [ ] Max points for mission
    - [ ] Sponsor feedback (if available)
    - [ ] "View Mission Details" button

- [ ] **Click "View Mission Details":**
  - [ ] Navigates to mission detail page
  - [ ] Mission details are displayed
  - [ ] Submission status is correct

---

### 5. Leaderboard Page (`/leaderboard`) ✅

#### Visual Checks
- [ ] Page loads without errors
- [ ] Header shows "Mission Leaderboard"
- [ ] Description text is visible
- [ ] My Rank card is visible (if user has submissions)

#### My Rank Card
- [ ] Card is visible (if rank exists)
- [ ] Shows:
  - [ ] Rank number (e.g., "#5")
  - [ ] Total points
  - [ ] Average score
  - [ ] Missions completed
- [ ] All values are correct

#### Leaderboard Table
- [ ] **Table Headers:**
  - [ ] Rank column
  - [ ] Student column
  - [ ] Total Points column
  - [ ] Avg Score column
  - [ ] Missions column

- [ ] **Top 3 Special Badges:**
  - [ ] Rank #1 → Gold trophy icon (🥇)
  - [ ] Rank #2 → Silver medal icon (🥈)
  - [ ] Rank #3 → Bronze award icon (🥉)
  - [ ] Other ranks → Number badge

- [ ] **Table Rows:**
  - [ ] Each row displays:
    - [ ] Rank (with icon or badge)
    - [ ] Student name (or email if no name)
    - [ ] Student avatar/icon
    - [ ] Major (if available)
    - [ ] Graduation year (if available)
    - [ ] Total points (with trophy icon)
    - [ ] Average score (with trending icon)
    - [ ] Missions completed count
  - [ ] Current user's row is highlighted (yellow background)

- [ ] **Empty State:**
  - [ ] If no rankings → "No rankings yet" message appears
  - [ ] Message suggests completing missions

#### Pagination
- [ ] **Pagination Controls:**
  - [ ] "Previous" button is visible
  - [ ] "Next" button is visible
  - [ ] Results count is displayed (e.g., "Showing 1 to 50 of 100")
  - [ ] "Previous" is disabled on first page
  - [ ] "Next" is disabled on last page

- [ ] **Navigation:**
  - [ ] Click "Next" → Next page loads
  - [ ] Click "Previous" → Previous page loads
  - [ ] Results update correctly

---

### 6. File Upload Testing ✅

#### Starter Files Download
- [ ] Navigate to mission detail page
- [ ] If starter files exist:
  - [ ] "Download Starter Files" link is visible
  - [ ] Click link → File downloads
  - [ ] File is accessible

#### Submission Files Upload
- [ ] Navigate to mission detail page
- [ ] Start mission
- [ ] **Single File Upload:**
  - [ ] Select one file (< 100 MB)
  - [ ] File appears in list
  - [ ] Submit solution
  - [ ] File uploads successfully
  - [ ] Submission is saved

- [ ] **Multiple Files Upload:**
  - [ ] Select multiple files
  - [ ] All files appear in list
  - [ ] Submit solution
  - [ ] All files upload successfully
  - [ ] Submission is saved

- [ ] **File Size Validation:**
  - [ ] Try to upload file > 100 MB
  - [ ] Error message appears
  - [ ] File is not added to list

- [ ] **File Removal:**
  - [ ] Select files
  - [ ] Click remove (X) on a file
  - [ ] File is removed from list
  - [ ] Can add new files

---

### 7. Integration Testing ✅

#### Complete Mission Flow
1. [ ] **Browse Missions:**
   - [ ] Navigate to `/missions`
   - [ ] Search for a mission
   - [ ] Click on a mission card

2. [ ] **View Mission Details:**
   - [ ] Mission details load correctly
   - [ ] Download starter files (if available)

3. [ ] **Start Mission:**
   - [ ] Click "Start Mission"
   - [ ] Status updates to "In Progress"
   - [ ] Submission form appears

4. [ ] **Submit Solution:**
   - [ ] Fill in submission form (URL, text, or files)
   - [ ] Click "Submit Solution"
   - [ ] Submission succeeds
   - [ ] Status updates to "Submitted"

5. [ ] **View Submission:**
   - [ ] Navigate to `/profile/missions`
   - [ ] Verify submission appears in list
   - [ ] Verify stats are updated

6. [ ] **Check Leaderboard:**
   - [ ] Navigate to `/leaderboard`
   - [ ] Verify rank is updated (if points awarded)
   - [ ] Verify points are displayed

#### Sponsor Review Flow (Requires Sponsor Account)
1. [ ] **Sponsor Reviews Submission:**
   - [ ] Log in as sponsor
   - [ ] Navigate to mission submissions
   - [ ] Review and score submission
   - [ ] Add feedback

2. [ ] **Student Sees Review:**
   - [ ] Log in as student
   - [ ] Navigate to `/profile/missions`
   - [ ] Verify score is displayed
   - [ ] Verify points are displayed
   - [ ] Verify feedback is displayed

3. [ ] **Leaderboard Updates:**
   - [ ] Navigate to `/leaderboard`
   - [ ] Verify rank is updated
   - [ ] Verify points are updated

---

### 8. Error Scenarios ✅

#### Authentication Errors
- [ ] **Not Logged In:**
  - [ ] Log out
  - [ ] Try to access `/missions` → Redirects to login
  - [ ] Try to access `/leaderboard` → Redirects to login
  - [ ] Try to access `/profile/missions` → Redirects to login

#### Mission Not Found
- [ ] Navigate to `/missions/invalid-id`
- [ ] "Mission not found" message appears
- [ ] "Back to Missions" button works

#### Network Errors
- [ ] Disconnect internet
- [ ] Try to load missions → Error handling works
- [ ] Try to submit solution → Error message appears
- [ ] Reconnect → Can retry operations

#### Validation Errors
- [ ] Try to submit with no data → Error message
- [ ] Try to upload file > 100 MB → Error message
- [ ] Try to submit after deadline → Error message (if applicable)

---

### 9. Mobile Responsiveness ✅

#### Mission Browse Page
- [ ] Page is responsive on mobile
- [ ] Search bar is usable
- [ ] Filters stack vertically
- [ ] Mission cards stack vertically
- [ ] All text is readable

#### Mission Detail Page
- [ ] Page is responsive on mobile
- [ ] All sections stack properly
- [ ] Submission form is usable
- [ ] File upload works on mobile
- [ ] Buttons are tappable

#### My Submissions Page
- [ ] Page is responsive on mobile
- [ ] Stats cards stack vertically
- [ ] Submission cards are readable
- [ ] All buttons are tappable

#### Leaderboard Page
- [ ] Page is responsive on mobile
- [ ] Table scrolls horizontally (if needed)
- [ ] All data is readable
- [ ] Pagination works on mobile

---

### 10. Performance Testing ✅

#### Page Load Times
- [ ] Mission browse page loads in < 2 seconds
- [ ] Mission detail page loads in < 2 seconds
- [ ] My submissions page loads in < 2 seconds
- [ ] Leaderboard page loads in < 3 seconds

#### File Upload Performance
- [ ] Small files (< 1 MB) upload quickly
- [ ] Medium files (1-10 MB) upload in reasonable time
- [ ] Large files (10-100 MB) show progress indicator

---

## 🐛 Common Issues & Solutions

### Issue: "Mission not found" error
**Solution:** Verify mission exists and is in "active" status

### Issue: File upload fails
**Solution:** 
- Check storage bucket exists (`mission-submissions`)
- Verify file size < 100 MB
- Check browser console for errors

### Issue: Leaderboard not updating
**Solution:**
- Verify points were awarded after review
- Check database for `student_points` table updates
- Refresh page

### Issue: Navigation links not visible
**Solution:**
- Verify you're logged in
- Check user role in database
- Clear browser cache

---

## ✅ Testing Complete

Once all items are checked, the frontend is ready for production!

**Next Steps:**
1. Fix any issues found during testing
2. Run build again to verify: `pnpm build`
3. Deploy to staging environment
4. Perform user acceptance testing (UAT)
5. Deploy to production

---

## 📝 Notes

- **Test Data:** Create test missions with different difficulties, categories, and statuses
- **Test Users:** Create multiple test student accounts to test leaderboard
- **Test Files:** Prepare test files of various sizes for upload testing
- **Browser Testing:** Test in Chrome, Firefox, Safari, and Edge
- **Device Testing:** Test on desktop, tablet, and mobile devices

---

**Happy Testing! 🚀**

