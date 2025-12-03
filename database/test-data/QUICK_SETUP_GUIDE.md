# 🚀 Quick Test Data Setup Guide

**Fast setup for testing mentorship features**

---

## 📋 **PREREQUISITES**

1. ✅ All mentorship migrations have been run
2. ✅ You have access to Supabase SQL Editor
3. ✅ You know how to create auth users (for login)

---

## 🎯 **QUICK SETUP (5 minutes)**

### **Step 1: Run Test Data Script**

1. Open **Supabase SQL Editor**
2. Open file: `database/test-data/setup_mentorship_test_data.sql`
3. Copy entire contents
4. Paste into SQL Editor
5. Click **"Run"** button
6. Wait for success message

**Expected Output:**
- ✅ Test Users Created: 5 users
- ✅ Mentor Profiles Created: 3 mentors
- ✅ Active Match Created: 1 match
- ✅ Meeting Logs Created: 2 meetings
- ✅ Quick Questions Created: 3 questions
- ✅ Match Batch Created: 1 pending batch

---

### **Step 2: Create Auth Users (for Login)**

The SQL script creates database users, but you also need auth users to log in.

**Option A: Create via Supabase Auth UI**
1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add user" → "Create new user"
3. Create these users:
   - **Student 1:** `test.student1@tamu.edu`
   - **Student 2:** `test.student2@tamu.edu`
   - **Mentor 1:** `test.mentor1@example.com`
   - **Mentor 2:** `test.mentor2@example.com`
   - **Mentor 3:** `test.mentor3@example.com`

**Option B: Create via SQL (with password)**
```sql
-- Create auth users (run in Supabase SQL Editor)
-- Note: You'll need to set passwords via Supabase Auth UI or use auth.users table directly

-- The setup script already created users in the users table
-- You just need to create corresponding auth.users entries
```

**Recommended:** Use Supabase Auth UI to create users with known passwords

---

### **Step 3: Verify Setup**

Run this query in SQL Editor to verify:

```sql
-- Check mentors are available
SELECT 
  u.email,
  u.full_name,
  mp.industry,
  mp.availability_status,
  mp.in_matching_pool,
  mp.current_mentees,
  mp.max_mentees
FROM users u
JOIN mentorship_profiles mp ON u.id = mp.user_id
WHERE mp.profile_type = 'mentor'
  AND mp.availability_status = 'active'
  AND mp.in_matching_pool = true;
```

**Expected:** Should see 3 mentors

---

## 👥 **TEST ACCOUNTS CREATED**

### **Students:**
- **Email:** `test.student1@tamu.edu`
  - Has active match with Mentor 1
  - Has 2 meeting logs
  - Has posted questions
  
- **Email:** `test.student2@tamu.edu`
  - Has pending match batch
  - No active match yet

### **Mentors:**
- **Email:** `test.mentor1@example.com`
  - Software Engineering mentor
  - Has 1 active mentee (Student 1)
  - Available for new requests

- **Email:** `test.mentor2@example.com`
  - Hardware Engineering mentor
  - Available for requests

- **Email:** `test.mentor3@example.com`
  - General Tech mentor
  - Available for requests

---

## 🧪 **QUICK TEST SCENARIOS**

### **Scenario 1: Test as Student 1 (Has Active Match)**
1. Login as `test.student1@tamu.edu`
2. Go to `/mentorship/dashboard`
3. ✅ Should see active match
4. Click "View Match Details"
5. ✅ Should see match info, meetings, feedback

### **Scenario 2: Test as Student 2 (Has Pending Request)**
1. Login as `test.student2@tamu.edu`
2. Go to `/mentorship/dashboard`
3. ✅ Should see pending recommendations
4. Go to `/mentorship/request`
5. ✅ Should see 3 recommended mentors

### **Scenario 3: Test as Mentor 1 (Has Active Mentee)**
1. Login as `test.mentor1@example.com`
2. Go to `/mentorship/dashboard`
3. ✅ Should see active mentee (Student 1)
4. Go to `/mentorship/mentor/mentees`
5. ✅ Should see Student 1 listed

### **Scenario 4: Test Quick Questions**
1. Login as `test.student2@tamu.edu`
2. Go to `/mentorship/questions`
3. ✅ Should see 1 open question
4. Login as `test.mentor1@example.com`
5. Go to `/mentorship/mentor/questions`
6. ✅ Should see open questions available

---

## 🧹 **CLEANUP (Reset Test Data)**

To remove all test data:

1. Open `database/test-data/cleanup_test_data.sql`
2. Copy contents
3. Run in Supabase SQL Editor
4. ✅ All test data removed

**Note:** This only removes test data, not your real users/data.

---

## 🎯 **WHAT GETS CREATED**

### **Users:**
- 2 Test Students
- 3 Test Mentors

### **Mentorship Data:**
- 3 Mentor Profiles (active, in matching pool)
- 1 Active Match (Student 1 ↔ Mentor 1)
- 1 Pending Match Batch (Student 2 → 3 mentors)
- 2 Meeting Logs (for active match)
- 1 Feedback Entry
- 3 Quick Questions (open, claimed, completed)

---

## ✅ **VERIFICATION CHECKLIST**

After running setup script:

- [ ] 5 test users created in `users` table
- [ ] 3 mentor profiles created and active
- [ ] 1 active match exists
- [ ] 1 pending match batch exists
- [ ] 2 meeting logs exist
- [ ] 3 quick questions exist
- [ ] Can log in as test users (after creating auth users)

---

## 🔧 **TROUBLESHOOTING**

### **Issue: "User already exists"**
- ✅ This is fine - the script uses `ON CONFLICT DO UPDATE`
- ✅ Data will be updated to match test data

### **Issue: "Cannot log in as test user"**
- ✅ Create auth user in Supabase Auth UI
- ✅ Use the email from test data
- ✅ Set a password you can remember

### **Issue: "No mentors available"**
- ✅ Run verification query above
- ✅ Check mentors have `availability_status = 'active'`
- ✅ Check mentors have `in_matching_pool = true`

---

## 📝 **CUSTOMIZING TEST DATA**

To customize test data:

1. Edit `setup_mentorship_test_data.sql`
2. Change user emails, names, skills, etc.
3. Run script again (will update existing data)

---

**Ready to test!** 🚀

Run the setup script and start testing all features!

