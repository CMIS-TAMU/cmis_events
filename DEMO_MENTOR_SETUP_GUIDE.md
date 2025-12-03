# 📘 Demo Mentor Setup Guide

**Purpose:** Create a mentor profile for demonstration purposes so students can be matched with mentors during your demo.

---

## 🎯 **Quick Overview**

To demonstrate the mentorship matching system, you need:
1. A mentor account (faculty/admin user)
2. A mentor profile created in the system
3. Mentor added to the matching pool
4. Student account ready to request mentor

---

## 📋 **Step-by-Step Guide**

### **Step 1: Create or Use an Existing Mentor Account**

You can either:
- **Option A:** Use an existing faculty/admin account
- **Option B:** Create a new faculty account for demo

**If creating new account:**
1. Go to `/signup`
2. Fill in details:
   - Email: `demo-mentor@example.com` (or your test email)
   - Password: (choose a secure password)
   - Full Name: `Demo Mentor`
   - Role: **Select "Faculty"** (this becomes the mentor)
3. Click "Sign Up"
4. Verify email if required
5. Log in to the account

---

### **Step 2: Ensure User Role is Set Correctly**

**Check in Supabase:**
1. Go to Supabase Dashboard → Table Editor → `users` table
2. Find the mentor user by email
3. Verify `role` column is set to `faculty` (or you can set it to any role that's not "student")

**Or set via SQL:**
```sql
-- Update user role to faculty
UPDATE users 
SET role = 'faculty' 
WHERE email = 'demo-mentor@example.com';
```

**Note:** Any user with role != 'student' can become a mentor after creating a mentor profile.

---

### **Step 3: Create Mentor Profile**

**Via UI:**
1. Log in as the mentor account
2. Go to `/mentorship/dashboard`
3. You should see a prompt to create a mentor profile
4. Click "Create Mentor Profile"
5. Fill in the mentor profile form:

   **Required Fields:**
   - **Industry:** (e.g., "Software Engineering", "Data Science", "Business")
   - **Areas of Expertise:** Add multiple tags (e.g., "JavaScript", "React", "Machine Learning")
   - **Max Mentees:** (e.g., 3-5)

   **Recommended Fields:**
   - **Organization:** (e.g., "Tech Company", "TAMU")
   - **Job Designation:** (e.g., "Senior Engineer", "Professor")
   - **Location:** (e.g., "College Station, TX")
   - **Bio:** Brief description of experience
   - **TAMU Graduation Year:** (if applicable)
   - **Contact Details:**
     - Preferred Name
     - Phone Number
     - LinkedIn URL
     - Contact Email

   **Matching Settings:**
   - **In Matching Pool:** ✅ Check this box (IMPORTANT!)
   - **Availability Status:** Select "active"
   - **Meeting Frequency:** Choose preference
   - **Communication Preferences:** Select options

6. Click "Save Profile"

---

### **Step 4: Verify Mentor Profile is Active**

**Check in Supabase:**
1. Go to Supabase Dashboard → Table Editor → `mentorship_profiles` table
2. Find the mentor profile by user_id
3. Verify these fields:
   - `profile_type` = `'mentor'`
   - `in_matching_pool` = `true` ✅
   - `availability_status` = `'active'` ✅
   - `current_mentees` < `max_mentees`

**Or check via SQL:**
```sql
-- Check mentor profile status
SELECT 
  u.email,
  u.full_name,
  mp.profile_type,
  mp.in_matching_pool,
  mp.availability_status,
  mp.current_mentees,
  mp.max_mentees,
  mp.industry,
  mp.areas_of_expertise
FROM mentorship_profiles mp
JOIN users u ON u.id = mp.user_id
WHERE mp.profile_type = 'mentor'
AND u.email = 'demo-mentor@example.com';
```

---

### **Step 5: Prepare Student Account**

**For demo, ensure you have a student account:**
1. Create or use existing student account (role = 'student')
2. Add student data to improve matching:
   - **Major:** (should align with mentor's industry/expertise)
   - **Skills:** (should overlap with mentor's areas_of_expertise)
   - **Graduation Year:** (optional)
   - **Resume:** (optional but helpful)

**Update student data in Supabase:**
```sql
-- Update student profile with matching data
UPDATE users 
SET 
  major = 'Computer Science',  -- Should match mentor's industry
  skills = ARRAY['JavaScript', 'React', 'Node.js'],  -- Should overlap with mentor expertise
  graduation_year = 2025
WHERE email = 'student@example.com'
AND role = 'student';
```

---

### **Step 6: Test the Matching**

**As Student:**
1. Log in as student
2. Go to `/mentorship/dashboard`
3. Click "Request a Mentor"
4. System should:
   - Find the mentor
   - Create match batch with mentor
   - Send email to mentor (if configured)
   - Show recommendations to student

**Verify Match Batch:**
```sql
-- Check if match batch was created
SELECT 
  mb.id,
  mb.student_id,
  mb.status,
  mb.mentor_1_id,
  mb.mentor_1_score,
  u_student.email as student_email,
  u_mentor.email as mentor_email
FROM match_batches mb
JOIN users u_student ON u_student.id = mb.student_id
LEFT JOIN users u_mentor ON u_mentor.id = mb.mentor_1_id
ORDER BY mb.created_at DESC
LIMIT 1;
```

---

## 🎭 **Demo Preparation Checklist**

Before your demo, ensure:

- [ ] **Mentor Account Created**
  - [ ] Email: ________________
  - [ ] Role is set to 'faculty' (or non-student)

- [ ] **Mentor Profile Created**
  - [ ] Industry set
  - [ ] Areas of expertise added
  - [ ] In matching pool = true ✅
  - [ ] Availability status = 'active' ✅
  - [ ] Has capacity (current_mentees < max_mentees)

- [ ] **Student Account Ready**
  - [ ] Email: ________________
  - [ ] Role is 'student'
  - [ ] Has major/skills for matching

- [ ] **Database Migration Run**
  - [ ] `update_matching_use_user_data.sql` has been executed

- [ ] **Email Configuration** (Optional)
  - [ ] RESEND_API_KEY is set
  - [ ] Test emails are working

---

## 🚀 **Quick Demo Script**

**1. Show Student Dashboard:**
- "Here's the student dashboard. Students can request a mentor directly."

**2. Click "Request a Mentor":**
- "When the student clicks this button, the system uses their existing profile data (major, skills, resume) to find the best matches."

**3. Show Recommendations:**
- "The system found 3 mentor recommendations based on matching criteria."

**4. Show Mentor Email (Optional):**
- "The mentor receives an email notification about this request."

**5. Show Mentor Dashboard:**
- "Mentors can view pending requests and accept students."

---

## 🛠️ **Troubleshooting**

### **No Mentors Found**

**Problem:** Student requests mentor but gets "No mentors found"

**Solutions:**
1. Check mentor profile exists:
   ```sql
   SELECT COUNT(*) FROM mentorship_profiles 
   WHERE profile_type = 'mentor' 
   AND in_matching_pool = true 
   AND availability_status = 'active';
   ```

2. Verify mentor has capacity:
   ```sql
   SELECT * FROM mentorship_profiles 
   WHERE profile_type = 'mentor' 
   AND current_mentees < max_mentees;
   ```

3. Check matching criteria overlap:
   - Student major should relate to mentor industry
   - Student skills should overlap with mentor expertise

---

### **Mentor Not Showing in Recommendations**

**Problem:** Mentor exists but doesn't appear in match batch

**Solutions:**
1. Ensure mentor is in matching pool:
   ```sql
   UPDATE mentorship_profiles 
   SET in_matching_pool = true 
   WHERE user_id = '<mentor-user-id>';
   ```

2. Check mentor availability:
   ```sql
   UPDATE mentorship_profiles 
   SET availability_status = 'active' 
   WHERE user_id = '<mentor-user-id>';
   ```

3. Verify mentor has capacity:
   ```sql
   UPDATE mentorship_profiles 
   SET current_mentees = 0,
       max_mentees = 5
   WHERE user_id = '<mentor-user-id>';
   ```

---

### **Match Score is Low**

**Problem:** Mentor appears but with very low match score

**Solutions:**
1. Improve student profile:
   - Add more skills that match mentor expertise
   - Set major that aligns with mentor industry

2. Improve mentor profile:
   - Add more areas of expertise
   - Set clear industry alignment

---

## 📝 **Quick SQL Commands for Demo Setup**

**Create/Update Mentor Profile:**
```sql
-- First, ensure user exists and has correct role
UPDATE users 
SET role = 'faculty', 
    full_name = 'Demo Mentor'
WHERE email = 'demo-mentor@example.com';

-- Then create or update mentor profile
INSERT INTO mentorship_profiles (
  user_id,
  profile_type,
  industry,
  areas_of_expertise,
  max_mentees,
  current_mentees,
  in_matching_pool,
  availability_status,
  organization,
  job_designation,
  location,
  bio
) VALUES (
  (SELECT id FROM users WHERE email = 'demo-mentor@example.com'),
  'mentor',
  'Software Engineering',
  ARRAY['JavaScript', 'React', 'Node.js', 'TypeScript', 'Python'],
  5,
  0,
  true,  -- ✅ In matching pool
  'active',  -- ✅ Active status
  'Tech Company',
  'Senior Software Engineer',
  'College Station, TX',
  'Experienced software engineer with 10+ years in web development'
)
ON CONFLICT (user_id, profile_type) 
DO UPDATE SET
  in_matching_pool = true,
  availability_status = 'active',
  current_mentees = 0;
```

**Verify Setup:**
```sql
-- Check mentor is ready for matching
SELECT 
  u.email,
  u.full_name,
  mp.industry,
  mp.areas_of_expertise,
  mp.in_matching_pool,
  mp.availability_status,
  mp.current_mentees || '/' || mp.max_mentees as capacity
FROM mentorship_profiles mp
JOIN users u ON u.id = mp.user_id
WHERE mp.profile_type = 'mentor'
AND u.email = 'demo-mentor@example.com';
```

---

## 🎬 **Demo Flow**

1. **Start:** Student logged in
2. **Navigate:** Go to `/mentorship/dashboard`
3. **Action:** Click "Request a Mentor"
4. **Result:** See match batch with 1-3 mentors
5. **Show:** Match scores and recommendations
6. **Switch:** Log in as mentor
7. **Show:** Mentor sees pending request in dashboard
8. **Action:** Mentor accepts request
9. **Result:** Match created, student notified

---

## 📧 **Optional: Email Testing**

If you want to test email notifications:

1. Set environment variables:
   ```bash
   RESEND_API_KEY=your_key_here
   RESEND_FROM_EMAIL=noreply@cmis.tamu.edu
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

2. When student requests mentor, mentor should receive email

3. Check email in mentor's inbox (or Resend dashboard)

---

**✅ You're ready for the demo!** 🚀

