# 🎯 Test Data Setup - Summary

**Quick reference for setting up test data**

---

## 📁 **FILES CREATED**

### **1. Main Setup Script**
**File:** `database/test-data/setup_mentorship_test_data.sql`

**What it does:**
- Creates 2 test students with profiles
- Creates 3 test mentors with profiles
- Creates 1 active match (Student 1 ↔ Mentor 1)
- Creates 1 pending match batch (Student 2 → 3 mentors)
- Creates 2 sample meeting logs
- Creates 1 feedback entry
- Creates 3 quick questions (open, claimed, completed)

**How to use:**
1. Open Supabase SQL Editor
2. Copy entire script
3. Paste and run
4. ✅ Done!

---

### **2. Cleanup Script**
**File:** `database/test-data/cleanup_test_data.sql`

**What it does:**
- Removes all test data
- Resets mentor mentee counts
- Safe to run (only removes test data)

**How to use:**
- Run when you want to reset test environment

---

### **3. Quick Setup Guide**
**File:** `database/test-data/QUICK_SETUP_GUIDE.md`

**What it contains:**
- Step-by-step instructions
- Test account details
- Quick test scenarios
- Verification queries

---

### **4. Setup Helper Script**
**File:** `database/test-data/SETUP_TEST_DATA.sh`

**What it does:**
- Provides instructions
- Lists what gets created
- Points to documentation

---

## 👥 **TEST ACCOUNTS CREATED**

### **Students:**

**Student 1:** `test.student1@tamu.edu`
- ✅ Has active match
- ✅ Has meeting logs
- ✅ Has questions posted

**Student 2:** `test.student2@tamu.edu`
- ✅ Has pending match batch
- ✅ Ready to test request flow

### **Mentors:**

**Mentor 1:** `test.mentor1@example.com`
- ✅ Software Engineering
- ✅ Has 1 active mentee
- ✅ Available for requests

**Mentor 2:** `test.mentor2@example.com`
- ✅ Hardware Engineering
- ✅ Available for requests

**Mentor 3:** `test.mentor3@example.com`
- ✅ General Tech
- ✅ Available for requests

---

## 🚀 **QUICK START (3 Steps)**

### **Step 1: Run SQL Script**
```sql
-- Copy and run: database/test-data/setup_mentorship_test_data.sql
-- In Supabase SQL Editor
```

### **Step 2: Create Auth Users**
- Go to Supabase → Authentication → Users
- Create users with emails from test accounts
- Set passwords you can remember

### **Step 3: Start Testing!**
- Login as test users
- Test all features
- See `QUICK_SETUP_GUIDE.md` for scenarios

---

## ✅ **VERIFICATION**

After running setup, verify with:

```sql
-- Check mentors are available
SELECT COUNT(*) FROM mentorship_profiles 
WHERE profile_type = 'mentor' 
  AND availability_status = 'active' 
  AND in_matching_pool = true;
-- Expected: 3

-- Check active match exists
SELECT COUNT(*) FROM matches 
WHERE status = 'active';
-- Expected: 1

-- Check pending batch exists
SELECT COUNT(*) FROM match_batches 
WHERE status = 'pending';
-- Expected: 1
```

---

## 🧪 **READY TO TEST!**

With test data set up, you can now:
- ✅ Test student request flow
- ✅ Test mentor acceptance
- ✅ Test match details
- ✅ Test meeting logs
- ✅ Test quick questions
- ✅ Test feedback system
- ✅ Test admin dashboard

**See `MENTORSHIP_TESTING_GUIDE.md` for detailed testing instructions!**

---

## 🧹 **RESET WHEN NEEDED**

To reset test data:
```sql
-- Run: database/test-data/cleanup_test_data.sql
-- Then run setup script again
```

---

**All set! Ready to test!** 🚀

