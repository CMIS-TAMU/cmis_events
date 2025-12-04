# 🔐 Test Accounts - Quick Reference

**Quick reference for test account credentials and what to test**

---

## 👥 **TEST ACCOUNTS**

### **📚 Students**

#### **Student 1** - Has Active Match
- **Email:** `test.student1@tamu.edu`
- **Password:** *(Set in Supabase Auth UI)*
- **Has:**
  - ✅ Active match with Mentor 1
  - ✅ 2 meeting logs
  - ✅ 1 feedback entry
  - ✅ Questions posted

**Test With:**
- View match details
- Log meetings
- View meeting history
- Submit feedback
- Post questions

---

#### **Student 2** - Has Pending Request
- **Email:** `test.student2@tamu.edu`
- **Password:** *(Set in Supabase Auth UI)*
- **Has:**
  - ✅ Pending match batch (3 mentors recommended)
  - ❌ No active match yet

**Test With:**
- View pending recommendations
- Request a new mentor (will show error if batch exists)
- Post questions

---

### **👨‍🏫 Mentors**

#### **Mentor 1** - Software Engineering (Has Active Mentee)
- **Email:** `test.mentor1@example.com`
- **Password:** *(Set in Supabase Auth UI)*
- **Has:**
  - ✅ 1 active mentee (Student 1)
  - ✅ Software Engineering expertise
  - ✅ In matching pool

**Test With:**
- View mentees page
- View match details with Student 1
- Log meetings
- Browse/claim questions

---

#### **Mentor 2** - Hardware Engineering
- **Email:** `test.mentor2@example.com`
- **Password:** *(Set in Supabase Auth UI)*
- **Has:**
  - ✅ Hardware Engineering expertise
  - ✅ In Student 2's match batch (recommended)
  - ✅ Available for requests

**Test With:**
- View student requests
- Accept/decline requests
- Browse/claim questions

---

#### **Mentor 3** - General Tech
- **Email:** `test.mentor3@example.com`
- **Password:** *(Set in Supabase Auth UI)*
- **Has:**
  - ✅ General Tech expertise
  - ✅ In Student 2's match batch (recommended)
  - ✅ Available for requests

**Test With:**
- View student requests
- Accept/decline requests
- Browse/claim questions

---

## 🧪 **QUICK TEST SCENARIOS**

### **Scenario A: Test Active Match**
1. Login: `test.student1@tamu.edu`
2. Go to: `/mentorship/dashboard`
3. Click: "View Match Details"
4. ✅ Should see match with Mentor 1

---

### **Scenario B: Test Pending Request**
1. Login: `test.student2@tamu.edu`
2. Go to: `/mentorship/dashboard`
3. ✅ Should see "Pending Recommendations"
4. Go to: `/mentorship/request`
5. ✅ Should see 3 recommended mentors

---

### **Scenario C: Test Mentor Accept**
1. Login: `test.mentor2@example.com`
2. Go to: `/mentorship/mentor/requests`
3. ✅ Should see Student 2's request
4. Click: "Accept"
5. ✅ Match should be created

---

### **Scenario D: Test Quick Questions**
1. Login: `test.student2@tamu.edu`
2. Go to: `/mentorship/questions`
3. ✅ Should see 1 open question
4. Login: `test.mentor1@example.com`
5. Go to: `/mentorship/mentor/questions`
6. ✅ Should see Student 2's question
7. Click: "Claim Question"

---

## 📝 **SETUP REMINDER**

**Don't forget:**
1. ✅ Run SQL script: `setup_mentorship_test_data.sql`
2. ✅ Create auth users in Supabase Auth UI
3. ✅ Set passwords for all test accounts
4. ✅ Verify mentors are active and in matching pool

---

## 🔍 **QUICK VERIFICATION**

```sql
-- Check if mentors are ready
SELECT 
  u.email,
  mp.availability_status,
  mp.in_matching_pool
FROM users u
JOIN mentorship_profiles mp ON u.id = mp.user_id
WHERE mp.profile_type = 'mentor';
```

**Expected:** 3 mentors with `availability_status = 'active'` and `in_matching_pool = true`

---

**Ready to test!** 🚀

