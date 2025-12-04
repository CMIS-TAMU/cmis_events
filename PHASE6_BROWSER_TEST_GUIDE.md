# Phase 6: Browser Testing Guide

## 🧪 Testing Toast Notifications & Loading States

---

## 🚀 Quick Start

1. **Start the development server:**
   ```bash
   pnpm dev
   ```

2. **Open your browser:**
   - Navigate to: `http://localhost:3000`
   - Make sure you're logged in

---

## ✅ Test Checklist

### 1. Toast Notifications (Replaced Alerts)

#### Profile Wizard
- [ ] **Navigate to:** `/profile/wizard` (or complete profile prompt)
- [ ] **Test:** Complete all wizard steps
- [ ] **Expected:** Toast success message when completed (not alert)
- [ ] **Test:** Try submitting with missing fields
- [ ] **Expected:** Toast error/warning (not alert)

#### Feedback Form
- [ ] **Navigate to:** `/feedback/[eventId]` (any event)
- [ ] **Test:** Submit feedback without rating
- [ ] **Expected:** Toast warning "Rating Required" (not alert)
- [ ] **Test:** Submit valid feedback
- [ ] **Expected:** Success toast or redirect

#### Profile Edit
- [ ] **Navigate to:** `/profile/edit`
- [ ] **Test:** Update profile information
- [ ] **Expected:** Toast success message when saved
- [ ] **Test:** Try invalid input
- [ ] **Expected:** Toast error message (not alert)

#### Competition Registration
- [ ] **Navigate to:** `/competitions/[id]/register`
- [ ] **Test:** Try to add team members beyond limit
- [ ] **Expected:** Toast warning about team size (not alert)
- [ ] **Test:** Submit without team name
- [ ] **Expected:** Toast warning (not alert)
- [ ] **Test:** Submit valid registration
- [ ] **Expected:** Toast success message

#### Competition Submission
- [ ] **Navigate to:** `/competitions/[id]/submit`
- [ ] **Test:** Upload invalid file type
- [ ] **Expected:** Toast error about file type (not alert)
- [ ] **Test:** Upload file > 10MB
- [ ] **Expected:** Toast error about file size (not alert)
- [ ] **Test:** Submit after deadline
- [ ] **Expected:** Toast error about deadline (not alert)

#### Mission Submission
- [ ] **Navigate to:** `/missions/[missionId]`
- [ ] **Test:** Start a mission
- [ ] **Expected:** Toast success message
- [ ] **Test:** Submit without any content
- [ ] **Expected:** Toast warning (not alert)
- [ ] **Test:** Upload file > 100MB
- [ ] **Expected:** Toast error (not alert)

#### Sessions
- [ ] **Navigate to:** `/sessions`
- [ ] **Test:** Cancel a session registration
- [ ] **Expected:** Toast success/error (not alert)
- [ ] **Test:** Register for a session
- [ ] **Expected:** Toast success/error in dialog

#### Mentorship
- [ ] **Navigate to:** `/mentorship/request`
- [ ] **Test:** Request a mentor
- [ ] **Expected:** Toast error if fails (not alert)
- [ ] **Navigate to:** `/mentorship/mentor/requests` (as mentor)
- [ ] **Test:** Select a student
- [ ] **Expected:** Toast error if fails (not alert)

---

### 2. Loading States

#### Forms
- [ ] **Profile Edit:** Save button shows spinner when saving
- [ ] **Profile Wizard:** Complete button shows spinner
- [ ] **Competition Registration:** Submit button shows loading
- [ ] **Mission Submission:** Submit button shows loading
- [ ] **Feedback Form:** Submit button shows loading

#### Buttons
- [ ] **Registration Buttons:** Show spinner during registration
- [ ] **Session Buttons:** Show spinner during registration
- [ ] **All Submit Buttons:** Disable and show loading state

#### Verification
- [ ] Forms are disabled during submission
- [ ] Buttons show spinner (Loader2 icon)
- [ ] Loading text appears (e.g., "Saving...", "Submitting...")
- [ ] Buttons are disabled during loading

---

### 3. Error Handling

#### Test Error Scenarios
- [ ] **Network Error:** Disconnect internet, try action
- [ ] **Expected:** Toast error message (not alert)
- [ ] **Validation Error:** Submit invalid form data
- [ ] **Expected:** Toast error/warning (not alert)
- [ ] **Permission Error:** Try accessing admin page as student
- [ ] **Expected:** Appropriate error handling

---

## 🎯 Specific Test Cases

### Test Case 1: Profile Wizard Completion
1. Go to `/profile/wizard` or click "Complete Profile" on dashboard
2. Fill out all steps
3. Click "Complete Profile" on step 6
4. **Expected Result:**
   - Button shows loading spinner
   - Toast success message appears (not alert)
   - Redirect to profile page

### Test Case 2: Competition Team Registration
1. Go to a competition registration page
2. Try to add more team members than allowed
3. **Expected Result:**
   - Toast warning appears (not alert)
   - Message: "Team size limit reached"
4. Try to submit without team name
5. **Expected Result:**
   - Toast warning appears (not alert)
   - Message: "Team name required"

### Test Case 3: File Upload Validation
1. Go to competition submission page
2. Try to upload a .txt file
3. **Expected Result:**
   - Toast error appears (not alert)
   - Message: "Invalid file type"
4. Try to upload a file > 10MB
5. **Expected Result:**
   - Toast error appears (not alert)
   - Message: "File too large"

---

## 🔍 Visual Verification

### Toast Notifications
- [ ] Toasts appear at the correct position (usually top-right)
- [ ] Success toasts are green
- [ ] Error toasts are red
- [ ] Warning toasts are yellow/orange
- [ ] Info toasts are blue
- [ ] Toasts auto-dismiss after appropriate time
- [ ] Toasts are dismissible with X button

### Loading States
- [ ] Spinner appears during async operations
- [ ] Button text changes to loading message
- [ ] Forms are disabled during submission
- [ ] No double-submission possible

---

## 📝 Notes

- **No Alerts:** You should NOT see any `alert()` dialogs
- **Toast Position:** Check if toasts appear in the right place
- **Timing:** Toasts should auto-dismiss appropriately
- **Loading Feedback:** All async operations should show loading state

---

## 🐛 Common Issues to Check

1. **Toast Not Showing:**
   - Check browser console for errors
   - Verify `sonner` is installed
   - Check if Toaster component is in layout

2. **Loading State Not Working:**
   - Check if button is disabled
   - Verify spinner is showing
   - Check network tab for request status

3. **Still Seeing Alerts:**
   - Some admin pages might still have alerts (low priority)
   - Check if it's a critical user flow

---

## ✅ Success Criteria

- [ ] All critical user flows use toasts (not alerts)
- [ ] All forms show loading states
- [ ] All buttons show spinners during async operations
- [ ] Error messages are user-friendly
- [ ] No console errors related to toasts/loading

---

**Happy Testing!** 🎉

