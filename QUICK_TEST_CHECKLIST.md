# ✅ Quick Testing Checklist - Mentorship System

**Fast checklist for testing the mentorship pages**

---

## 🔧 **PRE-TEST SETUP (5 minutes)**

### **Step 1: Verify Server is Running**
```bash
# Check if server is running on port 3000
curl http://localhost:3000/api/health
# Should return: {"status":"ok",...}
```

**If not running:**
```bash
cd /Users/abhishekpatil/Documents/Projects/CMIS-Cursor
pnpm dev
```

### **Step 2: Check Database Migrations**

**⚠️ IMPORTANT:** Before testing, you MUST run the database migrations!

1. **Open Supabase Dashboard:**
   - Go to your Supabase project
   - Click "SQL Editor" in left sidebar

2. **Run Migrations in Order:**
   ```sql
   -- 1. Run schema migration
   -- Copy/paste entire contents of:
   -- database/migrations/add_mentorship_system.sql
   
   -- 2. Run RLS policies
   -- Copy/paste entire contents of:
   -- database/migrations/add_mentorship_rls_policies.sql
   
   -- 3. Run matching functions
   -- Copy/paste entire contents of:
   -- database/migrations/add_mentorship_matching_functions.sql
   ```

3. **Verify Tables Created:**
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND (table_name LIKE '%mentorship%' OR table_name LIKE 'match%')
   ORDER BY table_name;
   
   -- Should show:
   -- match_batches
   -- matches
   -- meeting_logs
   -- mentorship_feedback
   -- mentorship_profiles
   -- mentorship_requests
   -- quick_questions
   ```

---

## 🧪 **TESTING STEPS (15 minutes)**

### **Test 1: Create Student Profile** ⏱️ 3 minutes

1. **Navigate to:** `http://localhost:3000/mentorship/profile`
2. **Expected:** Profile creation form appears
3. **Actions:**
   - Select "Student"
   - Fill in Major: `Computer Science`
   - Fill in Graduation Year: `2025`
   - Add Research Interests: `Machine Learning, Data Science`
   - Add Technical Skills: `Python, React`
   - Add Career Goals: `Become a software engineer`
   - Select communication preferences (email, zoom)
   - Select meeting frequency: `monthly`
   - Click "Save Profile"

4. **Expected Result:**
   - ✅ Success message appears
   - ✅ Redirects to `/mentorship/dashboard`
   - ✅ Dashboard shows profile info

**✅ Pass / ❌ Fail:** ________________

---

### **Test 2: View Dashboard** ⏱️ 2 minutes

1. **Navigate to:** `http://localhost:3000/mentorship/dashboard`
2. **Expected:**
   - ✅ Shows "Profile Status" card with your info
   - ✅ Shows "Current Match" card (no active match)
   - ✅ Shows "Request a Mentor" button
   - ✅ Shows Quick Actions section

**✅ Pass / ❌ Fail:** ________________

---

### **Test 3: Request a Mentor** ⏱️ 3 minutes

1. **On Dashboard, click:** "Request a Mentor" button
2. **Expected:**
   - ✅ Loading state appears
   - ✅ Redirects to `/mentorship/request`
   - ✅ Shows "Finding Mentors..." message
   - ⚠️ **Note:** If no mentors exist, you'll see an error - this is expected!

**⚠️ Expected Behavior:**
- If mentors exist: Shows up to 3 recommendations
- If no mentors: Shows error message (need to create mentor profiles first)

**✅ Pass / ❌ Fail:** ________________

---

### **Test 4: Edit Profile** ⏱️ 2 minutes

1. **Navigate to:** `http://localhost:3000/mentorship/profile`
2. **Expected:** Form is pre-filled with existing data
3. **Actions:**
   - Update Bio field
   - Click "Save Profile"
4. **Expected Result:**
   - ✅ Success message
   - ✅ Changes saved
   - ✅ Redirects to dashboard

**✅ Pass / ❌ Fail:** ________________

---

### **Test 5: Test Error Handling** ⏱️ 2 minutes

1. **Create Profile Without Required Field:**
   - Go to `/mentorship/profile`
   - Select "Student"
   - Leave Major empty
   - Click "Save Profile"
2. **Expected:**
   - ✅ Error message appears
   - ✅ Form doesn't submit

**✅ Pass / ❌ Fail:** ________________

---

## 🔍 **QUICK VERIFICATION**

### **Check Database After Testing:**

```sql
-- Check if profile was created
SELECT * FROM mentorship_profiles 
WHERE profile_type = 'student' 
ORDER BY created_at DESC 
LIMIT 1;

-- Check if match batch was created (if mentor request worked)
SELECT * FROM match_batches 
ORDER BY created_at DESC 
LIMIT 1;
```

---

## 🐛 **COMMON ISSUES & QUICK FIXES**

### **Issue: "Profile not found" error**
**Fix:** Make sure you're logged in and refresh the page

### **Issue: "Failed to create match batch"**
**Fix:** 
- Check if matching functions exist: `SELECT routine_name FROM information_schema.routines WHERE routine_name LIKE '%match%';`
- Verify mentors exist in matching pool (need to create mentor profiles)

### **Issue: Page shows 404**
**Fix:** 
- Verify server is running
- Check URL is correct: `/mentorship/profile`, `/mentorship/dashboard`, `/mentorship/request`

### **Issue: Build errors**
**Fix:** Already fixed! Build should pass now. If errors persist, run:
```bash
pnpm build
```

---

## 📊 **TEST RESULTS SUMMARY**

| Test | Status | Notes |
|------|--------|-------|
| Create Profile | ⬜ Pass / ⬜ Fail | |
| View Dashboard | ⬜ Pass / ⬜ Fail | |
| Request Mentor | ⬜ Pass / ⬜ Fail | |
| Edit Profile | ⬜ Pass / ⬜ Fail | |
| Error Handling | ⬜ Pass / ⬜ Fail | |

**Overall:** ⬜ **PASS** / ⬜ **FAIL**

**Issues Found:**
- _________________________________
- _________________________________
- _________________________________

---

## ✅ **NEXT STEPS**

If all tests pass:
- ✅ Ready to build mentor UI
- ✅ Ready to build admin dashboard
- ✅ Ready to test matching algorithm

If tests fail:
- ⚠️ Check database migrations are run
- ⚠️ Verify server is running
- ⚠️ Check browser console for errors
- ⚠️ Review error messages carefully

---

**Happy Testing!** 🚀

For detailed testing guide, see: `MENTORSHIP_TESTING_GUIDE.md`
