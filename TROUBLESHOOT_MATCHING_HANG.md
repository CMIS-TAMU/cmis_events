# 🔧 Troubleshoot: Matching Stuck on "Finding Mentors"

**Problem:** Page shows "Finding Mentors" spinner forever, never finishes.

---

## 🚨 **Quick Diagnosis**

### **Step 1: Check Browser Console**
1. Open browser Developer Tools (F12 or Cmd+Option+I)
2. Go to "Console" tab
3. Look for errors (red text)
4. Share any error messages you see

### **Step 2: Check Network Tab**
1. In Developer Tools, go to "Network" tab
2. Refresh the page
3. Look for requests to `/api/trpc/mentorship.requestMentor`
4. Check if request is:
   - Pending (never completes)
   - Failed (red status)
   - Completed but with error

### **Step 3: Check Database Migration**
Run this SQL in Supabase to check if migration was run:

```sql
-- Check if matching functions exist
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('create_match_batch', 'find_top_mentors', 'calculate_match_score');
```

**Expected:** Should return 3 rows (one for each function)

**If missing:** Run the migration: `database/migrations/update_matching_use_user_data.sql`

---

## 🔍 **Common Issues & Fixes**

### **Issue 1: No Mentors Available**

**Check:**
```sql
-- Count available mentors
SELECT COUNT(*) 
FROM mentorship_profiles 
WHERE profile_type = 'mentor'
  AND in_matching_pool = true
  AND availability_status = 'active'
  AND current_mentees < max_mentees;
```

**Expected:** Should be > 0

**Fix:** Create a mentor profile using `QUICK_DEMO_SETUP.sql`

---

### **Issue 2: Database Migration Not Run**

**Check:**
```sql
-- Check if functions exist
SELECT routine_name 
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'create_match_batch';
```

**If empty:** Run the migration file: `database/migrations/update_matching_use_user_data.sql`

---

### **Issue 3: Student Missing Required Data**

**Check:**
```sql
-- Check student data
SELECT 
  email,
  role,
  major,
  skills,
  resume_url
FROM users
WHERE email = 'abhishek.patil@tamu.edu';
```

**Required:** At least ONE of: `major`, `skills` (array with values), or `resume_url`

**Fix:** Add data:
```sql
UPDATE users
SET 
  major = 'Computer Science',
  skills = ARRAY['JavaScript', 'React']
WHERE email = 'abhishek.patil@tamu.edu'
  AND role = 'student';
```

---

### **Issue 4: Function Hanging (Performance Issue)**

The matching function might be slow if:
- Many mentors to process
- Complex matching logic

**Test manually:**
```sql
-- Get student ID first
SELECT id FROM users WHERE email = 'abhishek.patil@tamu.edu';

-- Then test (replace <student_id> with actual UUID)
SELECT * FROM find_top_mentors('<student_id>'::uuid, 3);
```

**If this hangs:** The function might need optimization or there's a database issue.

---

## 🛠️ **Quick Fixes**

### **Fix 1: Clear Pending Batch and Retry**

```sql
-- Delete any pending match batches
DELETE FROM match_batches
WHERE student_id = (SELECT id FROM users WHERE email = 'abhishek.patil@tamu.edu')
  AND status = 'pending';
```

Then refresh the page and try again.

---

### **Fix 2: Check Server Logs**

1. Open terminal where dev server is running
2. Look for error messages
3. Common errors:
   - "Failed to create match batch"
   - "Function not found"
   - "Timeout"

---

### **Fix 3: Verify Mentor Setup**

Run this to ensure mentor is ready:

```sql
-- Verify mentor setup
SELECT 
  u.email,
  mp.in_matching_pool,
  mp.availability_status,
  mp.current_mentees,
  mp.max_mentees
FROM mentorship_profiles mp
JOIN users u ON u.id = mp.user_id
WHERE mp.profile_type = 'mentor'
  AND u.email = 'abhishekp1703@gmail.com';
```

**All should be:**
- `in_matching_pool` = `true`
- `availability_status` = `'active'`
- `current_mentees` < `max_mentees`

---

## 🔬 **Detailed Debugging**

### **Step 1: Test Database Function Directly**

```sql
-- Get student ID
SELECT id, email FROM users WHERE email = 'abhishek.patil@tamu.edu';

-- Test find_top_mentors (replace UUID)
SELECT * FROM find_top_mentors('YOUR-STUDENT-UUID-HERE'::uuid, 3);

-- Test create_match_batch (replace UUID)
SELECT * FROM create_match_batch('YOUR-STUDENT-UUID-HERE'::uuid);
```

**Expected:**
- `find_top_mentors` should return mentor rows
- `create_match_batch` should return JSON with `ok: true` and `batch_id`

---

### **Step 2: Check for Errors in Function**

Look at the Supabase logs:
1. Go to Supabase Dashboard
2. Click "Logs" → "Postgres Logs"
3. Check for errors when matching runs

---

### **Step 3: Verify RLS Policies**

```sql
-- Check if RLS is blocking
SELECT * FROM mentorship_profiles 
WHERE profile_type = 'mentor'
  AND in_matching_pool = true;
```

If this returns empty but mentors exist, RLS might be blocking.

---

## 🎯 **Most Likely Causes (Priority Order)**

1. **No mentors in matching pool** (80% likely)
   - Fix: Run `QUICK_DEMO_SETUP.sql`

2. **Migration not run** (15% likely)
   - Fix: Run `update_matching_use_user_data.sql`

3. **Function timeout** (5% likely)
   - Fix: Check server logs, optimize function

---

## ✅ **Complete Checklist**

Before reporting issue, verify:

- [ ] Mentor profile exists
- [ ] Mentor `in_matching_pool` = true
- [ ] Mentor `availability_status` = 'active'
- [ ] Mentor has capacity (current_mentees < max_mentees)
- [ ] Student has major, skills, or resume
- [ ] Database migration has been run
- [ ] No pending match batches exist
- [ ] Browser console shows no errors
- [ ] Network tab shows request status

---

## 🚀 **Quick Reset & Retry**

Run this complete reset:

```sql
-- 1. Clear pending match batches
DELETE FROM match_batches
WHERE student_id = (SELECT id FROM users WHERE email = 'abhishek.patil@tamu.edu')
  AND status = 'pending';

-- 2. Verify mentor is ready
SELECT 
  u.email as mentor_email,
  mp.in_matching_pool,
  mp.availability_status,
  mp.current_mentees || '/' || mp.max_mentees as capacity
FROM mentorship_profiles mp
JOIN users u ON u.id = mp.user_id
WHERE mp.profile_type = 'mentor'
  AND u.email = 'abhishekp1703@gmail.com';

-- 3. Verify student has data
SELECT 
  email,
  major,
  skills
FROM users
WHERE email = 'abhishek.patil@tamu.edu';
```

Then refresh the page and try again.

---

**If still stuck, check:**
1. Browser console for errors
2. Server terminal for errors
3. Supabase Postgres logs
4. Network tab for failed requests

