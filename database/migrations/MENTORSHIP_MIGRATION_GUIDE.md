# 🗄️ Mentorship System Database Migration Guide

**Quick Guide:** Step-by-step instructions to set up the mentorship database schema

---

## 📋 **PREREQUISITES**

Before running migrations:
- ✅ Supabase project is set up
- ✅ You have access to Supabase SQL Editor
- ✅ Existing schema is deployed (users, events, etc.)

---

## 🚀 **STEP-BY-STEP MIGRATION**

### **Step 1: Open Supabase SQL Editor**

1. Go to your Supabase project dashboard
2. Click **"SQL Editor"** in the left sidebar
3. Click **"New Query"** button

---

### **Step 2: Run Schema Migration**

1. **Open the schema file:**
   - Open: `database/migrations/add_mentorship_system.sql`
   - Copy **ALL** contents

2. **Paste into SQL Editor:**
   - Paste the entire SQL script into the editor
   - Review to ensure it copied correctly

3. **Run the migration:**
   - Click **"Run"** button (or press Cmd/Ctrl + Enter)
   - Wait for completion (should take 5-10 seconds)

4. **Verify success:**
   - Look for "Success. No rows returned" message
   - Check that no errors appeared

5. **Verify tables created:**
   - Go to **"Table Editor"** in Supabase
   - You should see these new tables:
     - ✅ `mentorship_profiles`
     - ✅ `match_batches`
     - ✅ `matches`
     - ✅ `mentorship_feedback`
     - ✅ `quick_questions`
     - ✅ `meeting_logs`
     - ✅ `mentorship_requests`

---

### **Step 3: Run RLS Policies Migration**

1. **Open the RLS file:**
   - Open: `database/migrations/add_mentorship_rls_policies.sql`
   - Copy **ALL** contents

2. **Paste into SQL Editor:**
   - Create a new query in SQL Editor
   - Paste the entire SQL script

3. **Run the migration:**
   - Click **"Run"** button
   - Wait for completion

4. **Verify RLS enabled:**
   - Go to **"Authentication" → "Policies"** in Supabase
   - Or check in Table Editor → Each table should show "RLS enabled"

---

### **Step 4: Run Matching Functions Migration**

1. **Open the functions file:**
   - Open: `database/migrations/add_mentorship_matching_functions.sql`
   - Copy **ALL** contents

2. **Paste into SQL Editor:**
   - Create a new query
   - Paste the entire SQL script

3. **Run the migration:**
   - Click **"Run"** button
   - Wait for completion

4. **Verify functions created:**
   - Go to **"Database" → "Functions"** in Supabase
   - You should see these functions:
     - ✅ `calculate_match_score`
     - ✅ `find_top_mentors`
     - ✅ `create_match_batch`
     - ✅ `mentor_select_student`
     - ✅ `get_at_risk_matches`

---

## ✅ **VERIFICATION CHECKLIST**

After all migrations:

- [ ] All 7 tables exist in Table Editor
- [ ] RLS is enabled on all tables
- [ ] All 5 functions exist in Functions section
- [ ] No errors in SQL Editor
- [ ] Tables show correct columns and relationships

---

## 🧪 **QUICK TEST**

Run this test query in SQL Editor to verify:

```sql
-- Test 1: Check tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'mentorship%'
ORDER BY table_name;

-- Should return:
-- match_batches
-- matches
-- meeting_logs
-- mentorship_feedback
-- mentorship_profiles
-- mentorship_requests
-- quick_questions

-- Test 2: Check functions exist
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

---

## 🐛 **TROUBLESHOOTING**

### **Error: "relation already exists"**
**Solution:** Tables already exist. You can:
- Drop and recreate (if testing): `DROP TABLE IF EXISTS mentorship_profiles CASCADE;`
- Or skip this migration

### **Error: "permission denied"**
**Solution:** Ensure you're using the SQL Editor with proper permissions, or use service role key

### **Error: "function already exists"**
**Solution:** Functions already exist. You can:
- Drop and recreate: `DROP FUNCTION IF EXISTS calculate_match_score CASCADE;`
- Or the migration will replace them automatically

### **RLS Policies Error**
**Solution:** If policies already exist, drop them first:
```sql
-- Drop all existing policies (be careful!)
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename LIKE 'mentorship%') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "Users can read own mentorship profile" ON ' || quote_ident(r.tablename);
        -- Add other policy names as needed
    END LOOP;
END $$;
```

---

## 📝 **POST-MIGRATION STEPS**

After successful migration:

1. **Verify data access:**
   - Try creating a test profile via API
   - Check RLS policies are working

2. **Test matching algorithm:**
   - Create test student and mentor profiles
   - Run matching function
   - Verify scores are calculated

3. **Check indexes:**
   - Verify indexes were created
   - Performance should be good for queries

---

## 🎯 **READY FOR NEXT STEP**

Once migrations are complete:
- ✅ Database is ready
- ✅ Backend API is ready
- ✅ Ready to build UI!

**Next:** Start building student mentorship pages!

---

**Migration Time:** ~5-10 minutes total

**Need Help?** Check the troubleshooting section or review SQL errors in Supabase logs.

