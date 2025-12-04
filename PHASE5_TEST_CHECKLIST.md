# Phase 5 Test Checklist

## ✅ Quick Test Checklist

Use this checklist to verify all Phase 5 features are working.

---

## Test 1: Profile Completeness Card

**Location:** `/profile`

- [ ] Completeness card appears at top (for students only)
- [ ] Shows completion percentage (e.g., "40%")
- [ ] Progress bar displays correctly
- [ ] Lists missing required fields (if incomplete)
- [ ] Shows suggestions box
- [ ] "Complete Profile" button visible (if incomplete)
- [ ] Button links to `/profile/wizard`

---

## Test 2: Dashboard Prompt

**Location:** `/dashboard`

**For Incomplete Profile:**
- [ ] Completeness card appears at top
- [ ] Shows completion percentage
- [ ] Lists missing fields
- [ ] "Complete Profile" button visible
- [ ] Clicking button redirects to wizard

**For Complete Profile:**
- [ ] Prompt card does NOT appear
- [ ] Regular dashboard displays

---

## Test 3: Wizard - Step 1 (Basic Info)

**Location:** `/profile/wizard`

- [ ] Wizard page loads
- [ ] Progress indicator shows "Step 1 of 6"
- [ ] Email is pre-filled (read-only)
- [ ] Can enter Full Name
- [ ] Can enter Phone Number
- [ ] Validation prevents proceeding without required fields
- [ ] Error messages display
- [ ] "Next" button works

---

## Test 4: Wizard - Steps 2-6

**Step 2: Contact Details**
- [ ] All fields optional
- [ ] Can skip and proceed
- [ ] URLs accepted

**Step 3: Academic Information**
- [ ] Major field required
- [ ] Degree Type dropdown works
- [ ] GPA and Graduation optional
- [ ] Validation works

**Step 4: Professional Information**
- [ ] All fields optional
- [ ] Comma-separated values work (skills, interests)
- [ ] Can skip and proceed

**Step 5: Work Experience**
- [ ] Can add work experience
- [ ] Form opens in dialog
- [ ] Can save entry
- [ ] Entry appears in list
- [ ] Can edit/delete entries
- [ ] Can skip this step

**Step 6: Career Goals**
- [ ] Textarea for career goals
- [ ] Optional field
- [ ] "Complete Profile" button works
- [ ] Shows completion message

---

## Test 5: Wizard Navigation

- [ ] "Next" button moves forward
- [ ] "Back" button moves backward
- [ ] Progress indicator updates
- [ ] Step numbers update
- [ ] Completed steps show checkmark
- [ ] Data persists when navigating back/forth

---

## Test 6: Data Saving

- [ ] Complete wizard successfully
- [ ] Redirects to dashboard after completion
- [ ] Profile data saved to database
- [ ] Can view saved data on profile page
- [ ] Completeness percentage updates

---

## Test 7: Pre-fill Existing Data

- [ ] Go to profile page
- [ ] Add some profile information
- [ ] Save changes
- [ ] Open wizard (`/profile/wizard`)
- [ ] Existing data pre-fills in wizard
- [ ] Can update existing fields
- [ ] Changes save correctly

---

## Test 8: Completion Calculation

- [ ] Empty profile shows 0% or low percentage
- [ ] Adding required fields increases percentage
- [ ] Completing all required fields shows 100%
- [ ] Percentage updates immediately
- [ ] Calculation is accurate

---

## Test 9: Error Handling

- [ ] Form validation errors display
- [ ] Required field errors show
- [ ] Network errors handled gracefully
- [ ] Clear error messages

---

## Test 10: Mobile Responsiveness

- [ ] Wizard works on mobile
- [ ] Completeness card displays correctly
- [ ] Dashboard prompt works on mobile
- [ ] Forms are usable on small screens

---

## ✅ Success Criteria

All tests pass when:
- ✅ Wizard completes successfully
- ✅ Data saves correctly
- ✅ Completeness card appears and works
- ✅ Dashboard prompt appears/disappears correctly
- ✅ No console errors
- ✅ All features accessible and functional

---

## 🚨 Common Issues

**Issue:** Completeness shows 0% but profile has data
- **Fix:** Check required fields are filled (name, email, phone, major, degree_type)

**Issue:** Wizard doesn't save
- **Fix:** Check browser console for errors, verify tRPC working

**Issue:** Prompt doesn't appear
- **Fix:** Ensure profile is incomplete and user is student

---

## 📝 Notes

- Test as a **student** user
- Profile must be **incomplete** to see prompts
- Required fields: Full Name, Email, Phone, Major, Degree Type

---

**Ready to test!** Check off each item as you verify it. ✅

