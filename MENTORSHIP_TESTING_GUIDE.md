# 🧪 Mentorship System Testing Guide

**Complete step-by-step testing guide for the mentorship matching system**

---

## 📋 **PRE-TESTING CHECKLIST**

Before testing, ensure:

- [ ] **Database migrations are run** (See `database/migrations/MENTORSHIP_MIGRATION_GUIDE.md`)
- [ ] **Development server is running** (`pnpm dev`)
- [ ] **User is logged in** to the application
- [ ] **Environment variables are set** (Supabase keys, etc.)

---

## 🔍 **STEP 1: Verify Database Setup**

### **1.1 Check Tables Exist**

Open Supabase SQL Editor and run:

```sql
-- Check if mentorship tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%mentorship%' OR table_name LIKE 'match%'
ORDER BY table_name;

-- Should return:
-- match_batches
-- matches
-- meeting_logs
-- mentorship_feedback
-- mentorship_profiles
-- mentorship_requests
-- quick_questions
```

### **1.2 Check Functions Exist**

```sql
-- Check if matching functions exist
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%match%'
ORDER BY routine_name;

-- Should return:
-- calculate_match_score
-- create_match_batch
-- find_top_mentors
-- get_at_risk_matches
-- mentor_select_student
```

### **1.3 Check RLS Policies**

```sql
-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND (tablename LIKE '%mentorship%' OR tablename LIKE 'match%')
ORDER BY tablename;

-- All should show rowsecurity = true
```

---

## 🧪 **STEP 2: Test Profile Creation**

### **2.1 Navigate to Profile Page**

1. **Go to:** `http://localhost:3000/mentorship/profile`
2. **Expected:** Should see profile creation form

### **2.2 Create Student Profile**

**Test Case 2.2.1: Valid Student Profile**

1. Select **"Student"** profile type
2. Fill in required fields:
   - **Major:** `Computer Science`
   - **Graduation Year:** `2025`
   - **Research Interests:** `Machine Learning, Data Science`
   - **Technical Skills:** `Python, React, SQL`
   - **Career Goals:** `I want to become a software engineer`
   - **GPA:** `3.5`
3. Fill optional fields:
   - **Bio:** `I am a third-year student interested in AI`
   - **Communication Preferences:** Click `email`, `zoom`
   - **Meeting Frequency:** Select `monthly`
   - **Mentorship Type:** Click `career`, `research`
4. Click **"Save Profile"**
5. **Expected Result:**
   - ✅ Success message appears
   - ✅ Redirects to `/mentorship/dashboard`
   - ✅ Profile is saved in database

**Verify in Database:**
```sql
SELECT * FROM mentorship_profiles 
WHERE profile_type = 'student' 
ORDER BY created_at DESC 
LIMIT 1;
```

**Test Case 2.2.2: Missing Required Field**

1. Select **"Student"** profile type
2. Leave **Major** field empty
3. Click **"Save Profile"**
4. **Expected Result:**
   - ✅ Error message: "Major is required"
   - ✅ Form does not submit

### **2.3 Create Mentor Profile**

**Test Case 2.3.1: Valid Mentor Profile**

1. Navigate to `/mentorship/profile`
2. Select **"Mentor"** profile type
3. Fill in required fields:
   - **Industry:** `Technology`
   - **Organization:** `Microsoft`
   - **Job Designation:** `Senior Software Engineer`
   - **Areas of Expertise:** `Software Engineering, Leadership, Product Management`
   - **Max Mentees:** `3`
4. Fill optional fields:
   - **TAMU Graduation Year:** `2015`
   - **Location:** `Austin, TX`
   - **Bio:** `Experienced software engineer with 10+ years in tech`
   - **Communication Preferences:** Click `email`, `slack`
   - **Meeting Frequency:** Select `biweekly`
   - **Mentorship Type:** Click `career`, `project`
5. Click **"Save Profile"**
6. **Expected Result:**
   - ✅ Success message
   - ✅ Redirects to dashboard
   - ✅ Profile saved

**Verify in Database:**
```sql
SELECT * FROM mentorship_profiles 
WHERE profile_type = 'mentor' 
ORDER BY created_at DESC 
LIMIT 1;
```

### **2.4 Edit Existing Profile**

1. Navigate to `/mentorship/profile` (with existing profile)
2. **Expected:** Form should be pre-filled with existing data
3. Modify some fields (e.g., update bio)
4. Click **"Save Profile"**
5. **Expected Result:**
   - ✅ Success message
   - ✅ Changes saved
   - ✅ Updated data reflected

---

## 🧪 **STEP 3: Test Student Dashboard**

### **3.1 Navigate to Dashboard**

1. **Go to:** `http://localhost:3000/mentorship/dashboard`
2. **Expected:** Should see dashboard with profile status

### **3.2 Test Without Profile**

**Test Case 3.2.1: No Profile Created**

1. Log in as user without mentorship profile
2. Navigate to `/mentorship/dashboard`
3. **Expected Result:**
   - ✅ Shows "Welcome to Mentorship Matching" card
   - ✅ Displays "Create Profile" button
   - ✅ No error messages

### **3.3 Test With Profile (No Match)**

**Test Case 3.3.1: Profile Exists, No Match**

1. Ensure you have a student profile created
2. Navigate to `/mentorship/dashboard`
3. **Expected Result:**
   - ✅ Shows "Current Match" card with "No Active Match"
   - ✅ Shows "Profile Status" card with profile details
   - ✅ Displays "Request a Mentor" button
   - ✅ Shows Quick Actions section

### **3.4 Test With Active Match**

**Test Case 3.4.1: Active Match Display**

1. Ensure you have an active match (will need to create one manually or through matching)
2. Navigate to `/mentorship/dashboard`
3. **Expected Result:**
   - ✅ Shows mentor name and details
   - ✅ Shows match score (if available)
   - ✅ Shows "View Match Details" button
   - ✅ Shows matched date

---

## 🧪 **STEP 4: Test Mentor Request Flow**

### **4.1 Request a Mentor**

**Test Case 4.1.1: Request Mentor from Dashboard**

1. Navigate to `/mentorship/dashboard`
2. Ensure you have a student profile
3. Click **"Request a Mentor"** button
4. **Expected Result:**
   - ✅ Loading state appears
   - ✅ Redirects to `/mentorship/request` page
   - ✅ Shows "Finding Mentors" message
   - ✅ After processing, shows mentor recommendations

**Test Case 4.1.2: Request Without Profile**

1. Log in as user without profile
2. Try to navigate to `/mentorship/request` directly
3. **Expected Result:**
   - ✅ Should redirect or show error
   - ✅ Should prompt to create profile first

### **4.2 View Recommendations**

**Test Case 4.2.1: View Match Batch**

1. After requesting mentor, navigate to `/mentorship/request`
2. **Expected Result:**
   - ✅ Shows up to 3 mentor recommendations
   - ✅ Each mentor card shows:
     - Name/Email
     - Match score
     - Match reasoning (if available)
   - ✅ Shows "Best Match" badge on top match (if score > 80)
   - ✅ Shows pending status indicator

**Test Case 4.2.2: No Recommendations Available**

1. Request mentor when no mentors are in matching pool
2. **Expected Result:**
   - ✅ Shows appropriate message
   - ✅ Handles gracefully (no errors)

### **4.3 Test Pending State**

**Test Case 4.3.1: Pending Batch Status**

1. Request mentor (creates match batch)
2. View `/mentorship/request` page
3. **Expected Result:**
   - ✅ Shows "Waiting for mentors to respond" message
   - ✅ Shows "What Happens Next" section
   - ✅ Displays mentor cards in pending state

---

## 🔧 **STEP 5: Manual Database Testing**

### **5.1 Create Test Data Manually**

For testing without real mentors, create test data:

```sql
-- 1. Create a test student profile
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
  '<YOUR_USER_ID>', -- Replace with actual user ID
  'student',
  'Computer Science',
  2025,
  ARRAY['Machine Learning', 'Data Science'],
  'Become a software engineer',
  ARRAY['Python', 'React', 'SQL'],
  true,
  'active'
);

-- 2. Create a test mentor profile (use different user)
INSERT INTO mentorship_profiles (
  user_id,
  profile_type,
  industry,
  organization,
  areas_of_expertise,
  max_mentees,
  in_matching_pool,
  availability_status
) VALUES (
  '<MENTOR_USER_ID>', -- Replace with mentor user ID
  'mentor',
  'Technology',
  'Microsoft',
  ARRAY['Software Engineering', 'Leadership'],
  3,
  true,
  'active'
);

-- 3. Test matching function
SELECT * FROM find_top_mentors('<STUDENT_USER_ID>', 3, 0);
```

### **5.2 Test Match Batch Creation**

```sql
-- Create a match batch manually
SELECT * FROM create_match_batch('<STUDENT_USER_ID>', NULL);

-- Check created batch
SELECT * FROM match_batches ORDER BY created_at DESC LIMIT 1;
```

---

## 🐛 **STEP 6: Error Testing**

### **6.1 Test Error Scenarios**

**Test Case 6.1.1: Network Error**

1. Disconnect from internet
2. Try to save profile
3. **Expected:** Error message displayed gracefully

**Test Case 6.1.2: Invalid Data**

1. Try to submit profile with invalid graduation year (e.g., 2100)
2. **Expected:** Validation error or backend rejection

**Test Case 6.1.3: Duplicate Profile**

1. Try to create profile when one already exists
2. **Expected:** Error message or redirect to edit page

---

## ✅ **STEP 7: UI/UX Testing**

### **7.1 Visual Testing**

Check each page for:
- [ ] Proper spacing and layout
- [ ] All text is readable
- [ ] Buttons are clickable
- [ ] Forms are properly aligned
- [ ] Loading states are visible
- [ ] Error messages are clear
- [ ] Success messages are visible

### **7.2 Responsive Testing**

Test on different screen sizes:
- [ ] Mobile (375px width)
- [ ] Tablet (768px width)
- [ ] Desktop (1024px+ width)

### **7.3 Accessibility Testing**

- [ ] All form fields have labels
- [ ] Buttons have descriptive text
- [ ] Error messages are announced
- [ ] Keyboard navigation works
- [ ] Focus indicators are visible

---

## 📊 **STEP 8: Integration Testing**

### **8.1 Full Flow Test**

**Complete Student Journey:**

1. ✅ User logs in
2. ✅ Creates student profile
3. ✅ Views dashboard
4. ✅ Requests mentor
5. ✅ Views recommendations
6. ✅ (Future) Mentor accepts
7. ✅ (Future) Views active match

### **8.2 API Endpoint Testing**

Test tRPC endpoints directly:

```typescript
// In browser console or React Query DevTools
const { data } = await trpc.mentorship.getProfile.useQuery();
console.log('Profile:', data);

const { data: matches } = await trpc.mentorship.getMatches.useQuery();
console.log('Matches:', matches);
```

---

## 🔍 **STEP 9: Database Verification**

After testing, verify data integrity:

```sql
-- Check all mentorship profiles
SELECT 
  profile_type,
  COUNT(*) as count,
  COUNT(*) FILTER (WHERE in_matching_pool = true) as in_pool,
  COUNT(*) FILTER (WHERE availability_status = 'active') as active
FROM mentorship_profiles
GROUP BY profile_type;

-- Check match batches
SELECT 
  status,
  COUNT(*) as count
FROM match_batches
GROUP BY status;

-- Check matches
SELECT 
  status,
  COUNT(*) as count
FROM matches
GROUP BY status;
```

---

## 🚨 **COMMON ISSUES & SOLUTIONS**

### **Issue 1: "Profile not found" error**

**Solution:**
- Verify user is logged in
- Check if profile exists: `SELECT * FROM mentorship_profiles WHERE user_id = '<USER_ID>';`
- Create profile if missing

### **Issue 2: "Failed to create match batch"**

**Solution:**
- Ensure matching functions exist in database
- Check if mentors exist in matching pool
- Verify student profile has `in_matching_pool = true`

### **Issue 3: "User not authenticated"**

**Solution:**
- Check authentication state
- Refresh page
- Log out and log back in

### **Issue 4: Mentor recommendations not showing**

**Solution:**
- Verify mentors exist with matching criteria
- Check match batch was created: `SELECT * FROM match_batches ORDER BY created_at DESC LIMIT 1;`
- Verify match scores are calculated

### **Issue 5: RLS Policy Errors**

**Solution:**
- Verify RLS policies are created
- Check user has proper permissions
- Use service role key for admin operations

---

## 📝 **TESTING CHECKLIST**

Use this checklist to track your testing:

- [ ] Database migrations run successfully
- [ ] All tables created
- [ ] All functions created
- [ ] RLS policies enabled
- [ ] Student profile creation works
- [ ] Mentor profile creation works
- [ ] Profile editing works
- [ ] Dashboard displays correctly
- [ ] Request mentor button works
- [ ] Recommendations page displays
- [ ] Error handling works
- [ ] Loading states appear
- [ ] Success messages appear
- [ ] Mobile responsive
- [ ] All links work

---

## 🎯 **TESTING PRIORITY**

**High Priority:**
1. Profile creation (Student)
2. Profile creation (Mentor)
3. Dashboard display
4. Request mentor flow

**Medium Priority:**
1. Profile editing
2. Match batch display
3. Error handling
4. Loading states

**Low Priority:**
1. UI polish
2. Accessibility
3. Performance optimization

---

**Ready to start testing!** 🚀

Follow this guide step by step and document any issues you find.

