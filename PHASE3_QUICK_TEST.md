# Phase 3 Quick Test Guide

## ⚡ 5-Minute Smoke Test

### Step 1: Access Profile Edit (1 minute)
1. Login as student account
2. Navigate to `/profile/edit`
3. ✅ Verify page loads with 4 tabs visible

### Step 2: Test Basic Info Tab (1 minute)
1. Go to "Basic Info" tab
2. Fill in:
   - Major: "Computer Science"
   - Skills: "Python, JavaScript"
   - Research Interests: "Machine Learning"
   - Career Goals: "Software Engineer"
   - Graduation Year: "2025"
3. Click "Save All Changes"
4. ✅ Verify success message appears
5. ✅ Wait for redirect to `/profile`

### Step 3: Test Contact Tab (1 minute)
1. Navigate back to `/profile/edit`
2. Click "Contact" tab
3. Fill in:
   - Phone: "+1 (555) 123-4567"
   - LinkedIn: "https://linkedin.com/in/test"
4. Click "Save All Changes"
5. ✅ Verify success message

### Step 4: Test Work Experience (1 minute)
1. Click "Professional" tab
2. Click "Add Experience"
3. Fill in:
   - Company: "Test Company"
   - Position: "Software Engineer Intern"
   - Start Date: Select a date
   - Check "I currently work here"
4. Click "Save"
5. ✅ Verify entry appears in list with "Current" badge

### Step 5: Test Education (1 minute)
1. Click "Education" tab
2. Click "Add Education"
3. Fill in:
   - Institution: "Test University"
   - Degree: "Bachelor of Science"
   - Field of Study: "Computer Science"
   - Start Date: Select a date
   - Check "I am currently studying here"
4. Click "Save"
5. ✅ Verify entry appears in list

### Step 6: Verify Display Page (1 minute)
1. Navigate to `/profile`
2. ✅ Verify all 4 tabs are visible
3. Click through tabs:
   - Overview: Should show summary
   - Academic: Should show all academic info
   - Professional: Should show industry and work experience
   - Contact: Should show contact details with clickable links
4. ✅ Verify all data from edit page appears correctly

---

## ✅ Success Criteria

All steps complete without errors = **PASS** ✅

Any errors or missing data = **FAIL** ❌

---

## 🐛 Quick Fixes

**If fields don't save:**
- Check browser console for errors
- Verify database migration was run
- Check user role is "student"

**If tabs don't work:**
- Hard refresh page (Ctrl+Shift+R or Cmd+Shift+R)
- Check JavaScript is enabled
- Clear browser cache

**If work experience/education doesn't show:**
- Refresh page
- Check database for JSONB arrays
- Verify entries have all required fields

---

**Total Time**: ~5 minutes  
**Status**: Ready to test! 🚀

