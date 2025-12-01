# 🧪 Case Competitions - Complete Testing Guide

## 📋 Prerequisites Checklist

Before testing, ensure:
- [ ] Database migration applied (you confirmed ✅)
- [ ] Storage bucket `competition-submissions` created (see `QUICK_STORAGE_SETUP.md`)
- [ ] Server running (`pnpm dev`)
- [ ] You're logged in as admin user
- [ ] At least one event exists in the system

---

## 🎯 Test Scenarios

### Test 1: Admin - Create Competition

**Steps:**
1. Navigate to `/admin/competitions`
2. Click "New Competition" button
3. Fill in the form:
   - Select an event from dropdown
   - Title: "Test Case Competition"
   - Description: "This is a test competition"
   - Rules: "Test rules here"
   - Submission Instructions: "Upload your solution as PDF"
   - Deadline: Select a future date/time
   - Min Team Size: 2
   - Max Team Size: 4
4. Click "Create Competition"

**Expected Result:**
- ✅ Competition created successfully
- ✅ Redirected to competition management page
- ✅ Competition appears in competitions list

**Test Data:**
```
Event: [Select existing event]
Title: Test Case Competition
Description: Testing case competitions system
Rules: Follow all guidelines
Submission Instructions: Upload PDF document
Deadline: [Future date]
Team Size: 2-4 members
```

---

### Test 2: Admin - View Competition Management

**Steps:**
1. Go to `/admin/competitions`
2. Click "Manage" on any competition
3. Check all tabs:
   - Teams tab
   - Judging Rubrics tab
   - Judging tab
   - Results tab
   - Settings tab

**Expected Result:**
- ✅ All tabs load without errors
- ✅ Teams tab shows empty list (no teams yet)
- ✅ Rubrics tab shows "no rubrics" message
- ✅ Judging tab shows appropriate message

---

### Test 3: Admin - Create Judging Rubrics

**Steps:**
1. Go to competition management page
2. Click "Judging Rubrics" tab
3. Click "Add Rubric" button
4. Fill in:
   - Criterion: "Problem Analysis"
   - Description: "How well the team analyzed the problem"
   - Max Score: 10
   - Weight: 1.0
   - Order: 1
5. Click "Create Rubric"
6. Add 2-3 more rubrics with different criteria

**Expected Result:**
- ✅ Rubric created successfully
- ✅ Rubric appears in the list
- ✅ Multiple rubrics display correctly

**Test Rubrics:**
```
1. Problem Analysis (Max: 10, Weight: 1.0)
2. Solution Quality (Max: 10, Weight: 1.5)
3. Presentation (Max: 10, Weight: 0.8)
4. Innovation (Max: 10, Weight: 1.2)
```

---

### Test 4: User - View Public Competitions

**Steps:**
1. Logout and login as a regular user (or open incognito)
2. Navigate to `/competitions`
3. View the competitions list

**Expected Result:**
- ✅ List of competitions displays
- ✅ Competition cards show:
  - Title
  - Description
  - Deadline
  - Team size requirements
  - Status badge
- ✅ "View Details" button works

---

### Test 5: User - View Competition Details

**Steps:**
1. From `/competitions`, click on a competition
2. View competition details page

**Expected Result:**
- ✅ Competition title and description display
- ✅ Rules section visible
- ✅ Submission instructions visible
- ✅ Deadline displayed
- ✅ Team size requirements shown
- ✅ "Register Team" button visible (if competition is open)

---

### Test 6: User - Register Team

**Steps:**
1. From competition detail page, click "Register Team"
2. Fill in team name: "Team Alpha"
3. Search for team members:
   - Type email or name in search box
   - Click search button
   - Select users from results
4. Add 2-3 team members (including yourself)
5. Click "Register Team"

**Expected Result:**
- ✅ Team name accepted
- ✅ User search works
- ✅ Members can be added
- ✅ Team size validation works
- ✅ Team registered successfully
- ✅ Redirected to competition detail page
- ✅ Team appears in "Your Team" section

**Test Scenarios:**
- ✅ Add minimum team size (2 members)
- ✅ Add maximum team size (4 members)
- ❌ Try to add more than max (should show error)
- ❌ Try to remove yourself (should show error)

---

### Test 7: User - Submit Team Submission

**Steps:**
1. From competition detail page, find "Your Team" section
2. Click "Submit Your Work" button
3. Prepare a test PDF file (or DOC/DOCX/PPT)
4. Click file upload area
5. Select the test file
6. Review submission instructions
7. Click "Submit"

**Expected Result:**
- ✅ File upload interface works
- ✅ File validation works (type and size)
- ✅ Upload progress shown
- ✅ Submission successful
- ✅ "Submission Received" badge appears
- ✅ Submission date/time shown
- ✅ "View Submission" link works

**Test File Requirements:**
- Format: PDF, DOC, DOCX, PPT, or PPTX
- Size: Under 10 MB
- Name: `test_submission.pdf`

**Test Scenarios:**
- ✅ Valid PDF upload
- ❌ Invalid file type (should show error)
- ❌ File over 10MB (should show error)
- ❌ Submit after deadline (should show error)

---

### Test 8: Admin - View Team Submissions

**Steps:**
1. As admin, go to competition management
2. Click "Teams" tab
3. View teams with submissions

**Expected Result:**
- ✅ Teams list displays
- ✅ Teams with submissions show "Submitted" badge
- ✅ Submission date shown
- ✅ "View Submission" button works
- ✅ Can download/view submission file

---

### Test 9: Admin - Judge Teams

**Steps:**
1. Go to competition management
2. Click "Judging" tab
3. For each team with submission:
   - View submission file
   - Score each rubric:
     - Problem Analysis: 8/10
     - Solution Quality: 9/10
     - Presentation: 7/10
     - Innovation: 8/10
   - Add comments for each score
   - Click "Save Score" for each rubric

**Expected Result:**
- ✅ All teams with submissions display
- ✅ Rubrics list correctly
- ✅ Score inputs accept values
- ✅ Comments can be added
- ✅ Scores save successfully
- ✅ Progress tracked per team

**Note:** If you get "You are not assigned as a judge" error, you need to assign yourself as a judge first (see Test 10).

---

### Test 10: Admin - Assign Judges (If Needed)

**Steps:**
1. Run this SQL in Supabase SQL Editor to assign yourself as judge:
```sql
-- Replace YOUR_USER_ID with your actual user ID from auth.users table
INSERT INTO competition_judges (competition_id, judge_id)
SELECT 
    (SELECT id FROM case_competitions ORDER BY created_at DESC LIMIT 1),
    'YOUR_USER_ID'
ON CONFLICT (competition_id, judge_id) DO NOTHING;
```

**Or create a simple admin interface for this in the future.**

**Expected Result:**
- ✅ You can now judge teams without errors

---

### Test 11: Admin - View Results

**Steps:**
1. Go to competition management
2. Click "Results" tab
3. View aggregated scores

**Expected Result:**
- ✅ Teams ranked by total score
- ✅ Total scores calculated correctly (weighted)
- ✅ Rankings display (1st, 2nd, 3rd highlighted)
- ✅ Score details shown

**Expected Rankings:**
- Teams should be sorted by total score (descending)
- Scores should be calculated as: sum(score × weight) for each rubric

---

### Test 12: Admin - Publish Results

**Steps:**
1. From Results tab, click "Publish Results" button
2. Confirm publication
3. Verify results are now public

**Expected Result:**
- ✅ Results published successfully
- ✅ "Results Published" badge appears
- ✅ Results are now viewable publicly

---

### Test 13: User - View Published Results

**Steps:**
1. As regular user, go to competition detail page
2. Click "View Results" button (or navigate to `/competitions/{id}/results`)
3. View results page

**Expected Result:**
- ✅ Results page loads
- ✅ Teams ranked correctly
- ✅ Top 3 teams highlighted
- ✅ Scores displayed
- ✅ Rankings clear

**If results not published:**
- ✅ Should show "Results Not Yet Published" message

---

### Test 14: Edge Cases & Error Handling

**Test Scenarios:**

1. **Team Registration:**
   - ❌ Try to register team when already registered (should prevent)
   - ❌ Try to register after deadline (should prevent)
   - ❌ Try to register with invalid team size

2. **Submissions:**
   - ❌ Try to submit without being on a team
   - ❌ Try to submit after deadline
   - ❌ Try to submit invalid file type
   - ❌ Try to submit oversized file

3. **Judging:**
   - ❌ Try to judge without being assigned
   - ❌ Try to score above max score
   - ❌ Try to score negative values

4. **Results:**
   - ✅ View results before any judging done
   - ✅ View results with partial scores

---

## 🐛 Troubleshooting

### "Bucket not found" error
**Fix:** Create storage bucket `competition-submissions` in Supabase (see `QUICK_STORAGE_SETUP.md`)

### "You are not assigned as a judge" error
**Fix:** Run SQL to assign yourself as judge (see Test 10)

### "Team size validation" error
**Fix:** Check min/max team size in competition settings

### Submission upload fails
**Check:**
- File size under 10MB
- File type is PDF, DOC, DOCX, PPT, or PPTX
- Storage bucket exists and is accessible
- Deadline hasn't passed

### Scores not calculating correctly
**Check:**
- All rubrics have weights set
- Scores are saved for all rubrics
- Results query is using correct aggregation

---

## ✅ Test Completion Checklist

- [ ] Competition created successfully
- [ ] Competition management page works
- [ ] Rubrics created successfully
- [ ] Public competitions list works
- [ ] Competition detail page works
- [ ] Team registration works
- [ ] User search works
- [ ] Submission upload works
- [ ] Admin can view submissions
- [ ] Judging interface works
- [ ] Scores save correctly
- [ ] Results calculate correctly
- [ ] Results can be published
- [ ] Public results page works
- [ ] All error handling works

---

## 📊 Test Results Template

```
Test Date: ___________
Tester: ___________

Feature Tests:
- Competition Creation: ✅ / ❌
- Team Registration: ✅ / ❌
- Submission Upload: ✅ / ❌
- Judging System: ✅ / ❌
- Results Display: ✅ / ❌

Issues Found:
1. _________________________________
2. _________________________________
3. _________________________________

Notes:
_________________________________
_________________________________
```

---

**Ready to test!** Start with Test 1 and work through systematically. 🚀

