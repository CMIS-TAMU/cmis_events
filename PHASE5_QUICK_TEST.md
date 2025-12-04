# Phase 5 Quick Test Guide

## 5-Minute Quick Test

Follow these steps for a quick verification of Phase 5 features.

---

## ✅ Quick Test Steps

### 1. Test Profile Completeness Card (1 min)

1. Log in as a student
2. Navigate to `/profile`
3. **Check:**
   - ✅ Completeness card appears at top
   - ✅ Shows percentage (e.g., "40%")
   - ✅ Progress bar displays
   - ✅ Lists missing fields (if incomplete)

---

### 2. Test Dashboard Prompt (1 min)

1. Go to `/dashboard`
2. **If profile is incomplete:**
   - ✅ Completeness card appears at top
   - ✅ Shows missing fields
   - ✅ "Complete Profile" button visible
3. **Click "Complete Profile"**
   - ✅ Redirects to `/profile/wizard`

---

### 3. Test Wizard - Quick Run (3 min)

1. On wizard page, verify:
   - ✅ Progress indicator shows "Step 1 of 6"
   - ✅ Step 1 form displays

2. **Complete Step 1:**
   - Enter Full Name
   - Enter Phone Number
   - Click "Next"
   - ✅ Moves to Step 2

3. **Skip to Step 6:**
   - Click "Back" to return to previous steps
   - Navigate forward to Step 6
   - ✅ All steps accessible

4. **Complete Wizard:**
   - Fill required fields in Step 3 (Major, Degree Type)
   - Click "Next" through remaining steps
   - On Step 6, click "Complete Profile"
   - ✅ Redirects to dashboard
   - ✅ Profile saves

---

### 4. Verify Completion (1 min)

1. Go to `/profile`
2. **Check:**
   - ✅ Completeness shows higher percentage or 100%
   - ✅ Card updates with new status

3. Go to `/dashboard`
4. **Check:**
   - ✅ Prompt card disappears (if now complete)
   - ✅ Or shows updated percentage

---

## 🎯 Success Indicators

- ✅ Completeness card appears and works
- ✅ Dashboard prompt appears/disappears correctly
- ✅ Wizard can be navigated
- ✅ Data saves successfully
- ✅ Completion percentage updates

---

## 🚨 If Something Doesn't Work

1. **Check browser console** for errors
2. **Verify you're logged in** as a student
3. **Check network tab** for failed requests
4. **Try refreshing** the page
5. **Clear cache** and try again

---

**Quick test complete!** If all checks pass, Phase 5 is working correctly. 🎉

For comprehensive testing, see `PHASE5_TESTING_GUIDE.md`

