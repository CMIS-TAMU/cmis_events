# 🚀 Quick Guide: Test Student Mentor Request

**Fastest way to test the student → mentor request flow**

---

## ⚠️ **Important Note**

The profile form is currently **mentor-only**. Students need to create their profile manually in Supabase first.

---

## 📝 **Step 1: Create Student Profile in Supabase**

### **Option A: Using SQL Editor (Fastest)**

1. **Open Supabase SQL Editor**
2. **Get your User ID:**
   ```sql
   SELECT id, email FROM auth.users 
   WHERE email = 'your-student-email@example.com';
   ```
   Copy the `id` (UUID)

3. **Create Student Profile:**
   ```sql
   INSERT INTO mentorship_profiles (
     user_id,
     profile_type,
     major,
     graduation_year,
     research_interests,
     career_goals,
     technical_skills,
     in_matching_pool,
     availability_status
   ) VALUES (
     'PASTE_YOUR_USER_ID_HERE',  -- Replace with your user ID from step 2
     'student',
     'Computer Science',
     2025,
     ARRAY['Machine Learning', 'Data Science'],
     'I want to become a software engineer',
     ARRAY['Python', 'React', 'SQL'],
     true,  -- Important: must be true to be in matching pool
     'active'
   );
   ```

### **Option B: Using Table Editor**

1. Go to Supabase → Table Editor → `mentorship_profiles`
2. Click "Insert row"
3. Fill in:
   - `user_id`: Your user UUID from auth.users
   - `profile_type`: `student`
   - `major`: `Computer Science`
   - `graduation_year`: `2025`
   - `research_interests`: `["Machine Learning"]`
   - `career_goals`: `Software engineer`
   - `technical_skills`: `["Python"]`
   - `in_matching_pool`: `true` ✅
   - `availability_status`: `active`
4. Click "Save"

---

## 👨‍🏫 **Step 2: Create at Least One Mentor Profile**

**You need mentors to match with!**

### **Quick Mentor Setup:**

1. **Use a different account** (or create one)
2. **Log in as mentor**
3. **Go to:** `/mentorship/profile`
4. **Fill in mentor form:**
   - Industry: "Technology"
   - Organization: "Test Company"
   - Job Designation: "Engineer"
   - Areas of Expertise: "Software Engineering"
   - Max Mentees: 3
5. **Save profile**

**OR create directly in Supabase:**
```sql
-- Get mentor user ID first
SELECT id FROM auth.users WHERE email = 'mentor-email@example.com';

-- Create mentor profile
INSERT INTO mentorship_profiles (
  user_id,
  profile_type,
  industry,
  organization,
  job_designation,
  areas_of_expertise,
  max_mentees,
  in_matching_pool,
  availability_status
) VALUES (
  'MENTOR_USER_ID',
  'mentor',
  'Technology',
  'Test Company',
  'Engineer',
  ARRAY['Software Engineering'],
  3,
  true,  -- Must be true
  'active'
);
```

---

## 🎯 **Step 3: Request a Mentor (Student View)**

1. **Log in as student**
2. **Go to Dashboard:**
   - Navigate to: `http://localhost:3000/mentorship/dashboard`
   
3. **Check Profile Status:**
   - Should see "Profile Type: Student"
   - Should see "Matching Pool: Active"

4. **Click "Request a Mentor" button**
   - Located in the "Current Match" card

5. **What Happens:**
   - Page redirects to `/mentorship/request`
   - Shows "Finding Mentors..." loading
   - Automatically creates match batch
   - Shows your top 3 mentor recommendations

6. **View Recommendations:**
   - See up to 3 mentor cards
   - Each shows match score (0-100)
   - Shows match reasoning
   - Status: "Pending Recommendations"

---

## ✅ **Step 4: Verify It Worked**

### **Check in Supabase:**

```sql
-- 1. Verify your student profile exists
SELECT * FROM mentorship_profiles 
WHERE user_id = 'YOUR_USER_ID' 
AND profile_type = 'student';

-- 2. Check match batch was created
SELECT * FROM match_batches 
WHERE student_id = 'YOUR_USER_ID' 
ORDER BY created_at DESC 
LIMIT 1;

-- Should show:
-- - student_id: your ID
-- - mentor_1_id, mentor_2_id, mentor_3_id: mentor IDs
-- - mentor_1_score, mentor_2_score, mentor_3_score: scores
-- - status: 'pending'
```

---

## 🔍 **Troubleshooting**

### **"Request a Mentor" button doesn't appear:**

**Check:**
1. Do you have a student profile?
   ```sql
   SELECT * FROM mentorship_profiles 
   WHERE user_id = (SELECT id FROM auth.users WHERE email = 'your-email@example.com')
   AND profile_type = 'student';
   ```

2. Is `in_matching_pool = true`?
   ```sql
   SELECT in_matching_pool FROM mentorship_profiles 
   WHERE user_id = (SELECT id FROM auth.users WHERE email = 'your-email@example.com');
   ```

3. Do you already have an active match?
   ```sql
   SELECT * FROM matches 
   WHERE student_id = (SELECT id FROM auth.users WHERE email = 'your-email@example.com')
   AND status = 'active';
   ```

---

### **"No mentors found" or empty recommendations:**

**Check mentors exist:**
```sql
SELECT COUNT(*) FROM mentorship_profiles 
WHERE profile_type = 'mentor' 
AND in_matching_pool = true;
-- Should be > 0
```

**If 0 mentors:**
- Create at least one mentor profile (see Step 2)

---

### **Error: "Student profile not found"**

**Solution:**
- Create student profile in Supabase (see Step 1)
- Verify `profile_type = 'student'`
- Verify `in_matching_pool = true`

---

## 🎯 **Complete Test Flow**

```
1. Student logs in
   ↓
2. Student profile exists (created in Supabase)
   ↓
3. At least 1 mentor profile exists
   ↓
4. Go to /mentorship/dashboard
   ↓
5. Click "Request a Mentor"
   ↓
6. See loading: "Finding Mentors..."
   ↓
7. See 3 mentor recommendations
   ↓
8. Status: "Pending"
   ↓
9. Mentor accepts → Match created ✅
```

---

## 📋 **Quick Checklist**

- [ ] Student account logged in
- [ ] Student profile created in Supabase
- [ ] `in_matching_pool = true`
- [ ] At least 1 mentor profile exists
- [ ] Go to `/mentorship/dashboard`
- [ ] See "Request a Mentor" button
- [ ] Click button → See recommendations

---

**Ready to test!** 🚀

