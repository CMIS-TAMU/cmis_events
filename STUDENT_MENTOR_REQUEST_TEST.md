# 🧪 Student Mentor Request - Step-by-Step Testing Guide

**Complete guide for testing the mentorship matching system as a student**

---

## 📋 **PRE-TESTING CHECKLIST**

Before testing, ensure:
- [ ] **You're logged in** as a student account
- [ ] **Development server is running** (`pnpm dev`)
- [ ] **Database migrations are complete** (all mentorship tables created)
- [ ] **At least one mentor profile exists** in the database

---

## 🎯 **TESTING FLOW: Student Requests a Mentor**

### **STEP 1: Create/Verify Student Profile**

1. **Navigate to Mentorship Profile:**
   - Go to: `http://localhost:3000/mentorship/profile`
   - Or click "Mentorship" in the navigation (if available)

2. **Create Student Profile:**
   - **Note:** Currently the profile form is mentor-only
   - **For testing:** You may need to manually create a student profile in Supabase or use a different account

   **Alternatively - Check if profile exists:**
   - Go to Supabase Dashboard → Table Editor → `mentorship_profiles`
   - Check if you have a student profile with `profile_type = 'student'`

3. **Verify Profile Settings:**
   - Ensure `in_matching_pool = true` (you're active in matching pool)
   - Fill in student details:
     - Major
     - Graduation year
     - Research interests
     - Career goals
     - Technical skills
     - GPA (optional)

---

### **STEP 2: Access Mentor Request Page**

1. **Option A: From Dashboard**
   - Go to: `http://localhost:3000/mentorship/dashboard`
   - If no active match, you should see "Request a Mentor" button
   - Click the button

2. **Option B: Direct URL**
   - Go directly to: `http://localhost:3000/mentorship/request`

3. **What Should Happen:**
   - If no match batch exists, it will automatically create one
   - You'll see a loading state: "Finding Mentors..."
   - Then you'll see your top 3 mentor recommendations

---

### **STEP 3: View Mentor Recommendations**

**Expected Screen:**
- Page title: "Mentor Recommendations"
- Subtitle: "We've found 3 potential mentors for you..."
- **3 Mentor Cards** showing:
  - Mentor name/email
  - Match score (0-100)
  - Match reasoning breakdown
  - "Best Match" badge on highest score mentor

**Verify:**
- [ ] All 3 mentors are displayed (or fewer if not enough mentors exist)
- [ ] Match scores are shown for each
- [ ] Match reasoning is visible (why each mentor matches)

---

### **STEP 4: Wait for Mentor Response**

**Current Status:**
- Status badge shows: "Pending Recommendations"
- Message: "We've sent your profile to 3 potential mentors..."
- Info: "You'll be notified when one accepts"

**What Happens in Background:**
1. System creates a `match_batch` record
2. Top 3 mentors are selected based on matching algorithm
3. Mentors are notified (email notification - if configured)
4. Mentors can view the request on their dashboard

**Next Steps:**
- Go to: `/mentorship/dashboard`
- You should see: "Pending Recommendations" status
- You'll need a mentor to accept the request to proceed

---

### **STEP 5: Mentor Accepts Request**

**As a Mentor:**
1. Mentor logs in
2. Goes to `/mentorship/mentor/requests` or dashboard
3. Sees the student request
4. Clicks "Select Student" button
5. Match is confirmed

**As a Student:**
- Status changes to "Matched with Mentor"
- Dashboard shows mentor details
- Match score displayed
- "View Match Details" button available

---

## 🔍 **VERIFICATION CHECKS**

### **Check Database Records**

**In Supabase SQL Editor, run:**

```sql
-- Check your student profile
SELECT * FROM mentorship_profiles 
WHERE profile_type = 'student' 
ORDER BY created_at DESC 
LIMIT 5;

-- Check match batch (replace YOUR_USER_ID)
SELECT * FROM match_batches 
WHERE student_id = 'YOUR_USER_ID' 
ORDER BY created_at DESC 
LIMIT 1;

-- Check if mentors are assigned
SELECT 
  mb.id,
  mb.status,
  mb.mentor_1_id,
  mb.mentor_2_id,
  mb.mentor_3_id,
  mb.mentor_1_score,
  mb.mentor_2_score,
  mb.mentor_3_score
FROM match_batches mb
WHERE mb.student_id = 'YOUR_USER_ID'
ORDER BY created_at DESC
LIMIT 1;
```

---

## 🐛 **TROUBLESHOOTING**

### **Issue: "Request a Mentor" button doesn't appear**

**Possible Causes:**
1. You already have an active match
2. Your profile `in_matching_pool = false`
3. You don't have a student profile created

**Solutions:**
- Check dashboard - do you see an active match?
- Update profile to join matching pool
- Create student profile if missing

---

### **Issue: No mentors found / Empty recommendations**

**Possible Causes:**
1. No mentor profiles exist in database
2. All mentors have reached capacity
3. No mentors match your criteria
4. Mentors not in matching pool

**Solutions:**
1. **Create a mentor profile:**
   - Use a different account or create one in Supabase
   - Go to `/mentorship/profile` as mentor
   - Fill in mentor details
   - Ensure `in_matching_pool = true`

2. **Check mentor availability:**
   ```sql
   SELECT * FROM mentorship_profiles 
   WHERE profile_type = 'mentor' 
   AND in_matching_pool = true;
   ```

---

### **Issue: Match batch not created**

**Check:**
1. Open browser console (F12) for errors
2. Check network tab for failed API calls
3. Verify you're logged in
4. Check backend logs

**SQL Check:**
```sql
-- Verify match batch was created
SELECT COUNT(*) FROM match_batches 
WHERE student_id = 'YOUR_USER_ID';
```

---

### **Issue: Profile type shows as "mentor" instead of "student"**

**Problem:** The profile form is currently mentor-only

**Solution:** 
- Manually update in Supabase:
  ```sql
  UPDATE mentorship_profiles 
  SET profile_type = 'student' 
  WHERE user_id = 'YOUR_USER_ID';
  ```
- Or create student profile directly in database

---

## 📝 **QUICK TEST CHECKLIST**

- [ ] Login as student
- [ ] Go to `/mentorship/dashboard`
- [ ] See "Request a Mentor" button
- [ ] Click button → redirects to `/mentorship/request`
- [ ] See loading: "Finding Mentors..."
- [ ] See 3 mentor recommendations
- [ ] Match scores displayed
- [ ] Status shows "Pending"
- [ ] Dashboard updates to show pending status

---

## 🎓 **COMPLETE FLOW SUMMARY**

```
1. Student logs in
   ↓
2. Creates/updates mentorship profile (student type)
   ↓
3. Goes to dashboard → clicks "Request a Mentor"
   ↓
4. System creates match batch with top 3 mentors
   ↓
5. Student sees recommendations page
   ↓
6. Mentors receive notification (can view in their dashboard)
   ↓
7. Mentor selects student
   ↓
8. Match is created → Status: "active"
   ↓
9. Both student and mentor see match on dashboard
```

---

## 🔗 **RELEVANT PAGES**

- **Dashboard:** `/mentorship/dashboard`
- **Request Mentors:** `/mentorship/request`
- **Profile:** `/mentorship/profile`
- **Mentor Requests (for mentors):** `/mentorship/mentor/requests`

---

**Ready to test!** Follow the steps above and let me know if you encounter any issues. 🚀

