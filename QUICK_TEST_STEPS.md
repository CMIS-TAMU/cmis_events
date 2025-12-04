# Quick Testing Steps - Phase 6 Changes

## 🚀 Start Testing

### Step 1: Start the Server (if not running)
```bash
pnpm dev
```

### Step 2: Open Browser
- Navigate to: `http://localhost:3000`
- Log in with your account

---

## 🎯 Quick Test Scenarios

### Test 1: Toast Notifications (2 minutes)
1. **Profile Wizard Toast:**
   - Go to `/profile/wizard` or click "Complete Profile"
   - Try to complete without filling required fields
   - ✅ **You should see:** Toast warning (NOT an alert popup)

2. **Feedback Form Toast:**
   - Go to any event → Click "Give Feedback"
   - Try to submit without rating
   - ✅ **You should see:** Toast warning "Rating Required" (NOT alert)

3. **Competition Registration Toast:**
   - Go to a competition → Click "Register"
   - Try to submit without team name
   - ✅ **You should see:** Toast warning (NOT alert)

### Test 2: Loading States (2 minutes)
1. **Profile Edit:**
   - Go to `/profile/edit`
   - Make a change and click "Save All Changes"
   - ✅ **You should see:** Button shows spinner + "Saving..."

2. **Form Submission:**
   - Submit any form (profile, competition, etc.)
   - ✅ **You should see:** Button disabled + loading spinner
   - ✅ **You should see:** Form fields disabled during submission

### Test 3: Success Messages (1 minute)
1. **Complete any action successfully:**
   - Save profile changes
   - Submit feedback
   - Register for event
   - ✅ **You should see:** Toast success message (green)

---

## ✅ What to Look For

### ✅ GOOD (What You Should See)
- Toast notifications (small popups at top-right)
- Loading spinners on buttons
- Disabled buttons during loading
- Success/error messages as toasts

### ❌ BAD (What You Should NOT See)
- Alert popup dialogs
- Buttons that don't show loading state
- Forms that allow double-submission
- No feedback during async operations

---

## 🔍 Key Pages to Test

1. **Profile Wizard:** `/profile/wizard`
2. **Profile Edit:** `/profile/edit`
3. **Feedback:** `/feedback/[eventId]`
4. **Competition Register:** `/competitions/[id]/register`
5. **Competition Submit:** `/competitions/[id]/submit`
6. **Mission Submit:** `/missions/[missionId]`
7. **Sessions:** `/sessions`
8. **Mentorship:** `/mentorship/request`

---

## 📝 Test Checklist

- [ ] No alert() popups anywhere
- [ ] All toasts appear and auto-dismiss
- [ ] Loading states show on all buttons
- [ ] Forms disable during submission
- [ ] Success messages are clear
- [ ] Error messages are helpful

---

**Quick test should take ~5 minutes!** ⏱️

