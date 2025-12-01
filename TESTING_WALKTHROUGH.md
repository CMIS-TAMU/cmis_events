# 🚶 Step-by-Step Testing Walkthrough

## 🎬 Ready to Test!

Your server is running at: **http://localhost:3000**

---

## 📝 Quick Start (5 Essential Tests)

### ✅ Test 1: Admin - Create Competition

1. **Open browser:** http://localhost:3000/admin/competitions
2. **Click:** "New Competition" button
3. **Fill in:**
   ```
   Event: [Select any event]
   Title: Test Competition
   Description: Testing case competitions
   Rules: Test rules
   Deadline: [Select future date]
   Min Team Size: 2
   Max Team Size: 4
   ```
4. **Click:** "Create Competition"
5. **Expected:** Redirected to management page ✅

---

### ✅ Test 2: Admin - Add Judging Rubrics

1. **On management page**, click **"Judging Rubrics"** tab
2. **Click:** "Add Rubric" button
3. **Add first rubric:**
   ```
   Criterion: Problem Analysis
   Description: How well the team analyzed the problem
   Max Score: 10
   Weight: 1.0
   ```
4. **Click:** "Create Rubric"
5. **Repeat** to add 2-3 more rubrics
6. **Expected:** Rubrics appear in list ✅

---

### ✅ Test 3: User - Register Team

1. **Open new incognito window** or logout
2. **Navigate to:** http://localhost:3000/competitions
3. **Click** on the competition you created
4. **Click:** "Register Team" button
5. **Fill in:**
   ```
   Team Name: Team Test
   Search for members: [Type email or name]
   Add 2 members (including yourself)
   ```
6. **Click:** "Register Team"
7. **Expected:** Team created, redirected to competition page ✅

---

### ✅ Test 4: User - Submit Work

1. **On competition page**, find "Your Team" section
2. **Click:** "Submit Your Work" button
3. **Upload a test file:**
   - Create a simple PDF or use existing PDF
   - Click upload area
   - Select file
   - File size must be under 10MB
4. **Click:** "Submit"
5. **Expected:** 
   - Upload progress shown
   - "Submission Received" badge appears ✅
   - Submission date shown ✅

**💡 Tip:** Create a simple test PDF file first if you don't have one.

---

### ✅ Test 5: Admin - Judge & View Results

1. **Back as admin**, go to competition management
2. **Click:** "Judging" tab
3. **Score the team:**
   - See the team with submission
   - For each rubric, enter a score (0-10)
   - Add optional comments
   - Click "Save Score" for each
4. **Click:** "Results" tab
5. **Check rankings:**
   - Team should appear with total score
   - Rankings should be correct
6. **Click:** "Publish Results"
7. **Expected:** 
   - Results published ✅
   - "Results Published" badge appears ✅

---

### ✅ Test 6: User - View Results

1. **As user**, go to competition detail page
2. **Click:** "View Results" button
3. **Expected:** 
   - Results page loads ✅
   - Team rankings displayed ✅
   - Scores shown ✅

---

## 🔍 What to Check

### Competition Creation
- ✅ Form submits without errors
- ✅ Competition appears in list
- ✅ All fields saved correctly

### Team Registration
- ✅ User search works
- ✅ Team members can be added
- ✅ Validation works (min/max size)
- ✅ Team appears after registration

### Submission
- ✅ File upload works
- ✅ File validation works
- ✅ Submission saved
- ✅ Can view submission

### Judging
- ✅ Rubrics display correctly
- ✅ Scores can be entered
- ✅ Comments can be added
- ✅ Scores save successfully

### Results
- ✅ Scores calculate correctly
- ✅ Rankings are correct
- ✅ Results can be published
- ✅ Public results page works

---

## 🐛 Common Issues & Fixes

### Issue: "Bucket not found"
**Fix:** Create storage bucket `competition-submissions` in Supabase Dashboard

### Issue: "Not assigned as judge"
**Fix:** Run this SQL in Supabase:
```sql
INSERT INTO competition_judges (competition_id, judge_id)
SELECT 
    (SELECT id FROM case_competitions ORDER BY created_at DESC LIMIT 1),
    (SELECT id FROM auth.users WHERE email = 'your-email@example.com')
ON CONFLICT DO NOTHING;
```

### Issue: Submission upload fails
**Check:**
- File is PDF, DOC, DOCX, PPT, or PPTX
- File size under 10MB
- Storage bucket exists
- Deadline hasn't passed

### Issue: Scores not calculating
**Check:**
- All rubrics have weights
- Scores saved for all rubrics
- Results query working

---

## ✅ Success Criteria

**All tests pass if:**
- ✅ Competition can be created
- ✅ Team can register
- ✅ Submission can be uploaded
- ✅ Judging works
- ✅ Results calculate and display
- ✅ Results can be published

---

## 📊 Test Results

After testing, note any issues:

```
Date: ___________
Tester: ___________

✅ Passed Tests:
- [ ] Competition creation
- [ ] Rubrics creation
- [ ] Team registration
- [ ] Submission upload
- [ ] Judging
- [ ] Results

❌ Issues Found:
1. _________________________________
2. _________________________________

Notes:
_________________________________
```

---

**Ready? Start with Test 1!** 🚀

