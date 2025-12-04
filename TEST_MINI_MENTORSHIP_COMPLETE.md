# 🧪 Complete Testing Guide - Mini Mentorship System

## ✅ What's Ready to Test

1. **Student Request System** - Students can create mini session requests
2. **Mentor Browse & Claim** - Mentors can browse and claim student requests

---

## 🎯 Prerequisites

### 1. Database Migration
Ensure the migration has been run:
- Go to Supabase SQL Editor
- Check if `mini_mentorship_requests` table exists
- Check if `mini_mentorship_sessions` table exists

**Quick Check SQL:**
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'mini_mentorship%'
ORDER BY table_name;
```

**Expected:** Should see:
- `mini_mentorship_availability`
- `mini_mentorship_requests`
- `mini_mentorship_sessions`

### 2. Test Users Setup

You need:
- **1 Student account** (or use existing)
- **1 Mentor account** with mentor profile

**Create Mentor Profile (if needed):**
1. Login as faculty/admin user
2. Go to `/mentorship/profile`
3. Create mentor profile
4. Ensure "In Matching Pool" is enabled

Or use SQL:
```sql
-- Find a user to make mentor
SELECT id, email, role FROM users WHERE role IN ('faculty', 'admin') LIMIT 1;

-- Create mentor profile (replace USER_ID with actual ID)
INSERT INTO mentorship_profiles (
  user_id, profile_type, industry, in_matching_pool, max_mentees
) VALUES (
  'USER_ID_HERE', 'mentor', 'Technology', true, 5
) ON CONFLICT (user_id) DO UPDATE SET in_matching_pool = true;
```

---

## 📋 Test Scenario 1: Student Creates Request

### Steps:

1. **Login as Student**
   - Go to `/login`
   - Login with student account

2. **Go to Mentorship Dashboard**
   - Navigate to `/mentorship/dashboard`
   - Should see "Mini Mentorship Sessions" card

3. **Create Mini Session Request**
   - Click "Request Mini Session" button
   - Dialog should open

4. **Fill Out Form:**
   ```
   Title: "Interview prep for Google SWE"
   Session Type: Interview Preparation
   Description: "I need help preparing for technical interviews, especially system design questions. I have an interview next week."
   Duration: 60 minutes
   Urgency: Normal
   Earliest Date: [Today or tomorrow]
   Latest Date: [7 days from now]
   Tags (optional): technical-interview, google, system-design
   Specific Questions: "What should I focus on for system design? Any recommended resources?"
   ```

5. **Submit Request**
   - Click "Create Request"
   - Should see success toast: "Mini session request created!"
   - Dialog should close
   - Request should appear in list below

### ✅ Expected Results:

- ✅ Success toast notification appears
- ✅ Dialog closes automatically
- ✅ Request appears in "Your Mini Session Requests" list
- ✅ Status shows "Open"
- ✅ All details displayed correctly

### 🔍 Verify in Database:

```sql
SELECT 
  id, 
  title, 
  status, 
  session_type, 
  preferred_duration_minutes,
  created_at
FROM mini_mentorship_requests
ORDER BY created_at DESC
LIMIT 5;
```

**Should see:**
- Your request with status = 'open'
- All fields populated correctly

---

## 📋 Test Scenario 2: Mentor Browses Requests

### Steps:

1. **Login as Mentor**
   - Logout from student account
   - Login with mentor account (must have mentor profile)

2. **Go to Mentorship Dashboard**
   - Navigate to `/mentorship/dashboard`
   - Should see "Mini Mentorship Sessions" card with "Browse Requests" button

3. **Browse Requests**
   - Click "Browse Requests" button
   - Should navigate to `/mentorship/mini-sessions/browse`
   - Should see list of open requests (including the one you just created)

4. **View Request Details**
   - Click on a request card
   - Should see:
     - Title
     - Description
     - Session type
     - Duration
     - Student name/email
     - Tags
     - Preferred dates
     - Urgency badge

5. **Test Filters**
   - Try filtering by session type
   - Try searching by keyword
   - Verify results update correctly

### ✅ Expected Results:

- ✅ Can see all open requests
- ✅ Request details display correctly
- ✅ Filters work (session type, search)
- ✅ "Claim Request" button visible on each request

---

## 📋 Test Scenario 3: Mentor Claims Request

### Steps:

1. **Claim a Request**
   - On browse page, find a request
   - Click "Claim Request" button
   - Confirm the dialog

2. **Verify Claim**
   - Should see success toast: "Request claimed!"
   - Should redirect to dashboard
   - Request status should update to "claimed"

3. **Verify in Browse Page**
   - Go back to browse page
   - The claimed request should no longer appear (only "open" requests shown)

### ✅ Expected Results:

- ✅ Success toast appears
- ✅ Request status changes to "claimed"
- ✅ Request disappears from browse page (only open requests shown)
- ✅ Student's dashboard should show status as "Claimed"

### 🔍 Verify in Database:

```sql
SELECT 
  id,
  title,
  status,
  claimed_by_mentor_id,
  claimed_at
FROM mini_mentorship_requests
WHERE status = 'claimed'
ORDER BY claimed_at DESC;
```

**Should see:**
- Your request with status = 'claimed'
- `claimed_by_mentor_id` = mentor's user ID
- `claimed_at` timestamp populated

---

## 📋 Test Scenario 4: Student Views Claimed Request

### Steps:

1. **Login as Student**
   - Go back to student account
   - Navigate to `/mentorship/dashboard`

2. **Check Mini Sessions Card**
   - Look at "Your Mini Session Requests" list
   - Find your request

3. **Verify Status**
   - Status badge should show "Claimed"
   - Should show "Claimed by: [Mentor Name]"

### ✅ Expected Results:

- ✅ Status updated to "Claimed"
- ✅ Mentor information displayed
- ✅ Request still visible to student

---

## 🐛 Troubleshooting

### Issue 1: "Mini mentorship feature is not available yet"

**Problem:** Migration not run or tables don't exist

**Solution:**
1. Go to Supabase SQL Editor
2. Run `database/migrations/add_mini_mentorship_system_fixed.sql`
3. Refresh the page

### Issue 2: "You must be a mentor in the matching pool"

**Problem:** User doesn't have mentor profile or not in matching pool

**Solution:**
1. Create mentor profile at `/mentorship/profile`
2. Enable "In Matching Pool" option
3. Or use SQL:
```sql
UPDATE mentorship_profiles 
SET in_matching_pool = true 
WHERE user_id = 'MENTOR_USER_ID';
```

### Issue 3: No requests showing in browse page

**Possible causes:**
- No open requests exist
- User is not a mentor
- Mentor not in matching pool

**Check:**
```sql
-- Check if requests exist
SELECT COUNT(*) FROM mini_mentorship_requests WHERE status = 'open';

-- Check mentor profile
SELECT user_id, profile_type, in_matching_pool 
FROM mentorship_profiles 
WHERE user_id = 'MENTOR_USER_ID';
```

### Issue 4: Error when creating request

**Check browser console:**
- Open DevTools (F12)
- Check Console tab for errors
- Check Network tab for failed API calls

**Common fixes:**
- Restart dev server
- Clear browser cache
- Check database connection

---

## ✅ Test Checklist

### Student Side:
- [ ] Can access mentorship dashboard
- [ ] Mini Sessions card appears
- [ ] "Request Mini Session" button works
- [ ] Dialog opens correctly
- [ ] Can fill out all form fields
- [ ] Form validation works (title min 5 chars, description min 10 chars)
- [ ] Success toast appears on submit
- [ ] Request appears in list
- [ ] Request details display correctly
- [ ] Status shows correctly

### Mentor Side:
- [ ] Can access mentorship dashboard
- [ ] Mini Sessions card appears (if mentor)
- [ ] "Browse Requests" button works
- [ ] Browse page loads
- [ ] Can see open requests
- [ ] Request details display correctly
- [ ] Filters work (session type)
- [ ] Search works
- [ ] Can claim requests
- [ ] Success toast appears
- [ ] Request disappears from browse after claim

### Database:
- [ ] Request created in `mini_mentorship_requests` table
- [ ] Status updates correctly (open → claimed)
- [ ] `claimed_by_mentor_id` populated
- [ ] `claimed_at` timestamp set

---

## 📊 Expected Database State After Tests

```sql
-- Should see at least one request
SELECT 
  id,
  title,
  status,
  session_type,
  student_id,
  claimed_by_mentor_id,
  created_at,
  claimed_at
FROM mini_mentorship_requests
ORDER BY created_at DESC;
```

**Expected:**
- At least 1 request with status = 'open' or 'claimed'
- If claimed: `claimed_by_mentor_id` and `claimed_at` populated

---

## 🎯 Next Steps After Testing

If all tests pass:
1. ✅ System is working correctly!
2. ⏭️ Ready to build Session Scheduling feature
3. ⏭️ Then Email Notifications

If issues found:
1. Note the specific error/behavior
2. Check troubleshooting section
3. Verify database state
4. Check browser console for errors

---

## 🚀 Quick Test (5 minutes)

**Minimal test to verify it works:**

1. Login as student → Create one request
2. Logout → Login as mentor → Browse → Claim request
3. Verify status updates

**If this works, the core system is functional!** ✅

---

**Ready to test! Let me know what happens or if you encounter any issues.** 🧪

