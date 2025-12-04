# 🎓 How to Test: Student Requesting a Mentor

**Complete step-by-step guide for testing the mentorship request flow as a student**

---

## ⚠️ **IMPORTANT NOTE**

**The mentorship profile form is currently mentor-only.** Students need to create their profile manually in Supabase or we need to add a student profile form. For testing, I'll show you both methods.

---

## 📋 **METHOD 1: Quick Test (Using Supabase)**

### **Step 1: Create a Student Profile in Supabase**

1. **Open Supabase Dashboard:**
   - Go to your Supabase project
   - Click "Table Editor"
   - Select `mentorship_profiles` table

2. **Create Student Profile:**
   - Click "Insert row" or "New row"
   - Fill in these fields:
     ```sql
     user_id: [Your logged-in user ID from auth.users table]
     profile_type: 'student'
     major: 'Computer Science'
     graduation_year: 2025
     research_interests: ['Machine Learning', 'Data Science']
     career_goals: 'I want to become a software engineer'
     technical_skills: ['Python', 'React', 'SQL']
     gpa: 3.5
     in_matching_pool: true
     availability_status: 'active'
     ```

3. **Get Your User ID:**
   - Go to Supabase → Authentication → Users
   - Find your user email
   - Copy the User UID

4. **Or use SQL:**
   ```sql
   -- Find your user ID
   SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';
   
   -- Create student profile (replace YOUR_USER_ID)
   INSERT INTO mentorship_profiles (
     user_id,
     profile_type,
     major,
     graduation_year,
     research_interests,
     career_goals,
     technical_skills,
     gpa,
     in_matching_pool,
     availability_status
   ) VALUES (
     'YOUR_USER_ID',
     'student',
     'Computer Science',
     2025,
     ARRAY['Machine Learning', 'Data Science'],
     'I want to become a software engineer',
     ARRAY['Python', 'React', 'SQL'],
     3.5,
     true,
     'active'
   );
   ```

---

### **Step 2: Ensure Mentors Exist**

**Before requesting a mentor, you need at least one mentor profile:**

1. **Option A: Use a different account**
   - Log out
   - Sign up/login with a different email
   - Create a mentor profile at `/mentorship/profile`
   - Ensure mentor is in matching pool (`in_matching_pool = true`)

2. **Option B: Create mentor directly in Supabase**
   ```sql
   -- Get another user ID or create a test mentor account first
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
     'Microsoft',
     'Senior Software Engineer',
     ARRAY['Software Engineering', 'Leadership'],
     3,
     true,
     'active'
   );
   ```

---

### **Step 3: Request a Mentor**

1. **Go to Mentorship Dashboard:**
   - Navigate to: `http://localhost:3000/mentorship/dashboard`
   - You should see:
     - "No Active Match" status
     - "Request a Mentor" button

2. **Click "Request a Mentor":**
   - Button redirects to `/mentorship/request`
   - Automatically creates match batch
   - Shows "Finding Mentors..." loading state

3. **View Recommendations:**
   - After loading, you'll see:
     - Page title: "Mentor Recommendations"
     - Up to 3 mentor cards
     - Match scores (0-100)
     - Match reasoning breakdown
     - Status: "Pending Recommendations"

---

### **Step 4: Check the Results**

**What to verify:**

1. **In Database (Supabase SQL Editor):**
   ```sql
   -- Check match batch was created
   SELECT * FROM match_batches 
   WHERE student_id = 'YOUR_USER_ID' 
   ORDER BY created_at DESC 
   LIMIT 1;
   
   -- Should show:
   -- - student_id: your user ID
   -- - mentor_1_id, mentor_2_id, mentor_3_id: mentor IDs
   -- - mentor_1_score, mentor_2_score, mentor_3_score: match scores
   -- - status: 'pending'
   ```

2. **On the Website:**
   - Dashboard shows "Pending Recommendations"
   - Request page shows 3 mentor cards
   - Match scores are visible
   - Status is "pending"

---

## 📋 **METHOD 2: Complete End-to-End Test**

### **Full Flow Test:**

1. **Create Test Accounts:**
   - **Student Account:** Sign up with email `student@test.com`
   - **Mentor Account:** Sign up with email `mentor@test.com`

2. **Create Student Profile (Supabase):**
   ```sql
   -- Get student user ID
   SELECT id FROM auth.users WHERE email = 'student@test.com';
   
   -- Create student profile
   INSERT INTO mentorship_profiles (
     user_id,
     profile_type,
     major,
     graduation_year,
     research_interests,
     career_goals,
     technical_skills,
     in_matching_pool
   ) VALUES (
     (SELECT id FROM auth.users WHERE email = 'student@test.com'),
     'student',
     'Computer Science',
     2025,
     ARRAY['Machine Learning'],
     'Software engineer',
     ARRAY['Python'],
     true
   );
   ```

3. **Create Mentor Profile:**
   - Log in as `mentor@test.com`
   - Go to `/mentorship/profile`
   - Fill in mentor details:
     - Industry: "Technology"
     - Organization: "Test Company"
     - Job Designation: "Engineer"
     - Areas of Expertise: "Software Engineering"
     - Max Mentees: 3
   - Save profile
   - Verify `in_matching_pool = true`

4. **Request Mentor:**
   - Log in as `student@test.com`
   - Go to `/mentorship/dashboard`
   - Click "Request a Mentor"
   - Should see mentor recommendations

5. **Mentor Accepts:**
   - Log in as `mentor@test.com`
   - Go to `/mentorship/mentor/requests`
   - See student request
   - Click "Select Student"
   - Match is created

6. **Verify Match:**
   - Student dashboard shows active match
   - Mentor dashboard shows active mentee
   - Both can view match details

---

## 🔍 **TROUBLESHOOTING**

### **Issue: "Request a Mentor" button doesn't show**

**Check:**
1. Do you have a student profile?
   ```sql
   SELECT * FROM mentorship_profiles 
   WHERE user_id = 'YOUR_USER_ID' 
   AND profile_type = 'student';
   ```

2. Is your profile in the matching pool?
   ```sql
   SELECT in_matching_pool FROM mentorship_profiles 
   WHERE user_id = 'YOUR_USER_ID';
   -- Should be: true
   ```

3. Do you already have an active match?
   ```sql
   SELECT * FROM matches 
   WHERE student_id = 'YOUR_USER_ID' 
   AND status = 'active';
   ```

---

### **Issue: "No mentors found" or Empty recommendations**

**Check:**
1. **Do mentors exist?**
   ```sql
   SELECT COUNT(*) FROM mentorship_profiles 
   WHERE profile_type = 'mentor' 
   AND in_matching_pool = true;
   -- Should be > 0
   ```

2. **Are mentors at capacity?**
   ```sql
   SELECT 
     mp.user_id,
     mp.current_mentees,
     mp.max_mentees
   FROM mentorship_profiles mp
   WHERE mp.profile_type = 'mentor'
   AND mp.in_matching_pool = true;
   ```

3. **Check matching algorithm ran:**
   ```sql
   -- Check if match batch has mentors
   SELECT 
     mentor_1_id,
     mentor_2_id,
     mentor_3_id
   FROM match_batches
   WHERE student_id = 'YOUR_USER_ID'
   ORDER BY created_at DESC
   LIMIT 1;
   ```

---

### **Issue: Error when clicking "Request a Mentor"**

**Check browser console (F12):**
- Look for error messages
- Check Network tab for failed API calls
- Verify you're logged in

**Common errors:**
- "Student profile not found" → Create student profile
- "You are not in the matching pool" → Update `in_matching_pool = true`
- "No mentors available" → Create mentor profiles

---

## ✅ **QUICK TEST CHECKLIST**

- [ ] Student account logged in
- [ ] Student profile created in Supabase
- [ ] Student profile `in_matching_pool = true`
- [ ] At least 1 mentor profile exists
- [ ] Mentor profile `in_matching_pool = true`
- [ ] Go to `/mentorship/dashboard`
- [ ] Click "Request a Mentor"
- [ ] See loading: "Finding Mentors..."
- [ ] See mentor recommendations (up to 3)
- [ ] Match scores displayed
- [ ] Status shows "Pending"

---

## 🚀 **FASTEST WAY TO TEST**

**Quick SQL Script (Run in Supabase SQL Editor):**

```sql
-- 1. Get your user ID
SET student_email = 'your-email@example.com';

-- 2. Create student profile (run once)
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
) 
SELECT 
  id,
  'student',
  'Computer Science',
  2025,
  ARRAY['Machine Learning'],
  'Software engineer',
  ARRAY['Python'],
  true,
  'active'
FROM auth.users
WHERE email = student_email
ON CONFLICT (user_id, profile_type) DO NOTHING;

-- 3. Verify it was created
SELECT * FROM mentorship_profiles 
WHERE user_id = (SELECT id FROM auth.users WHERE email = student_email)
AND profile_type = 'student';
```

Then:
1. Go to `/mentorship/dashboard`
2. Click "Request a Mentor"
3. Done! ✅

---

**Ready to test!** Follow the steps above. If you get stuck, check the troubleshooting section! 🎯

