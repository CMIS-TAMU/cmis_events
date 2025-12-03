# ✅ Phase 1 Setup Verification Guide

Complete verification steps to ensure Phase 1 is properly configured.

---

## 🔍 Verification Methods

### Method 1: Automated SQL Verification (Recommended)

**Fastest way to verify everything!**

1. **Open Supabase SQL Editor:**
   - Go to Supabase Dashboard → SQL Editor → New query

2. **Run Verification Script:**
   - Open file: `database/verify_phase1_setup.sql`
   - Copy ALL contents
   - Paste into SQL Editor
   - Click "Run"

3. **Check Results:**
   - Look for ✅ (success) or ❌/⚠️ (issues)
   - All checks should show ✅

**Expected Output:**
```
========================================
1. CHECKING TABLES...
========================================
✅ EXISTS: missions
✅ EXISTS: mission_submissions
✅ EXISTS: mission_interactions
✅ EXISTS: student_points
✅ EXISTS: point_transactions
✅ All tables exist!

========================================
2. CHECKING TABLE COLUMNS...
========================================
✅ missions table has required columns
✅ mission_submissions table has required columns
✅ student_points table has required columns

... (more checks)
```

---

### Method 2: Manual Verification

#### Step 1: Verify Tables (2 min)

1. **Go to Table Editor:**
   - Supabase Dashboard → Table Editor

2. **Check for these tables:**
   - [ ] `missions`
   - [ ] `mission_submissions`
   - [ ] `mission_interactions`
   - [ ] `student_points`
   - [ ] `point_transactions`

3. **Verify `missions` table structure:**
   - Click on `missions` table
   - Check for columns:
     - `id` (uuid, primary key)
     - `sponsor_id` (uuid, foreign key)
     - `title` (text)
     - `description` (text)
     - `difficulty` (text, with check constraint)
     - `status` (text, with check constraint)
     - `max_points` (integer)
     - `created_at` (timestamptz)
     - `updated_at` (timestamptz)

#### Step 2: Verify Functions (2 min)

1. **Go to Database → Functions:**
   - Supabase Dashboard → Database → Functions

2. **Check for these functions:**
   - [ ] `calculate_mission_points`
   - [ ] `update_student_points`
   - [ ] `update_mission_stats`
   - [ ] `update_updated_at_column`

3. **Test a function:**
   - Go to SQL Editor
   - Run:
     ```sql
     SELECT calculate_mission_points(100, 'expert', 100);
     ```
   - Should return: `300`

#### Step 3: Verify Storage Buckets (2 min)

1. **Go to Storage:**
   - Supabase Dashboard → Storage

2. **Check for buckets:**
   - [ ] `mission-starter-files` (should show "Public")
   - [ ] `mission-submissions` (should show "Private")

3. **Verify bucket settings:**
   - Click on each bucket
   - Check file size limits are set correctly

#### Step 4: Verify RLS Policies (3 min)

1. **Go to Table Editor:**
   - Select `missions` table
   - Click "Policies" tab

2. **Check for policies:**
   - [ ] "Sponsors can create missions" (INSERT)
   - [ ] "Sponsors can view their missions" (SELECT)
   - [ ] "Students can view active missions" (SELECT)

3. **Check other tables:**
   - Repeat for `mission_submissions`, `student_points`, etc.

#### Step 5: Verify Environment Variables (1 min)

1. **Check `.env.local` file:**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

2. **Verify keys are correct:**
   - Go to Supabase Dashboard → Settings → API
   - Compare with your `.env.local` values

---

## 🧪 Test Database Operations

### Test 1: Create a Test Mission

1. **Go to SQL Editor:**
   ```sql
   -- Get your user ID first
   SELECT id, email FROM auth.users LIMIT 1;
   
   -- Create test mission (replace YOUR_USER_ID)
   INSERT INTO missions (
     sponsor_id,
     title,
     description,
     difficulty,
     category,
     max_points,
     status
   ) VALUES (
     'YOUR_USER_ID',
     'Test Mission',
     'This is a test mission for verification',
     'beginner',
     'Web Development',
     100,
     'draft'
   );
   ```

2. **Verify:**
   - Go to Table Editor → `missions`
   - You should see your test mission

### Test 2: Test Points Calculation

1. **Run in SQL Editor:**
   ```sql
   -- Test perfect score (expert)
   SELECT calculate_mission_points(100, 'expert', 100) as points;
   -- Expected: 300
   
   -- Test intermediate score
   SELECT calculate_mission_points(75, 'intermediate', 100) as points;
   -- Expected: 90 (75 * 0.75 * 1.2)
   
   -- Test beginner score
   SELECT calculate_mission_points(50, 'beginner', 100) as points;
   -- Expected: 25 (50 * 0.5 * 1.0)
   ```

2. **Verify results match expected values**

### Test 3: Test RLS Policies

1. **As authenticated user, try to view missions:**
   ```sql
   -- This should work (viewing active missions)
   SELECT * FROM missions WHERE status = 'active';
   ```

2. **Try to create mission (should work if you're sponsor/admin):**
   ```sql
   INSERT INTO missions (sponsor_id, title, description, status)
   VALUES (auth.uid(), 'Test', 'Test', 'draft');
   ```

---

## ✅ Verification Checklist

### Database
- [ ] All 5 tables exist
- [ ] All tables have correct columns
- [ ] All 4 functions exist
- [ ] Functions work correctly
- [ ] RLS is enabled on all tables
- [ ] RLS policies exist
- [ ] Indexes are created
- [ ] Constraints are in place

### Storage
- [ ] `mission-starter-files` bucket exists (public)
- [ ] `mission-submissions` bucket exists (private)
- [ ] Bucket file size limits are set

### Environment
- [ ] `NEXT_PUBLIC_SUPABASE_URL` is set
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is set
- [ ] All keys are correct

### Functionality
- [ ] Can create test mission
- [ ] Points calculation works
- [ ] RLS policies work
- [ ] Storage buckets accessible

---

## 🐛 Common Issues & Fixes

### Issue: Tables don't exist

**Fix:**
```sql
-- Re-run the migration
-- Open: database/migrations/add_technical_missions.sql
-- Copy and run in SQL Editor
```

### Issue: Functions not found

**Fix:**
```sql
-- Check if functions exist
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name LIKE '%mission%';

-- If missing, re-run migration
```

### Issue: RLS not enabled

**Fix:**
```sql
-- Enable RLS on each table
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mission_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mission_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_transactions ENABLE ROW LEVEL SECURITY;
```

### Issue: Storage buckets missing

**Fix:**
1. Go to Storage → New bucket
2. Create `mission-starter-files` (public)
3. Create `mission-submissions` (private)

### Issue: Functions return errors

**Fix:**
```sql
-- Check function definition
SELECT pg_get_functiondef(oid) 
FROM pg_proc 
WHERE proname = 'calculate_mission_points';

-- If function is missing, re-run migration
```

---

## 📊 Quick Status Check

Run this in SQL Editor for a quick overview:

```sql
-- Quick status check
SELECT 
  'Tables' as component,
  COUNT(*) as count
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('missions', 'mission_submissions', 'mission_interactions', 'student_points', 'point_transactions')
UNION ALL
SELECT 
  'Functions',
  COUNT(*)
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('calculate_mission_points', 'update_student_points', 'update_mission_stats', 'update_updated_at_column')
UNION ALL
SELECT 
  'RLS Enabled Tables',
  COUNT(*)
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relname IN ('missions', 'mission_submissions', 'mission_interactions', 'student_points', 'point_transactions')
  AND c.relrowsecurity = true;
```

**Expected Results:**
- Tables: 5
- Functions: 4
- RLS Enabled Tables: 5

---

## ✅ Success Criteria

Phase 1 is verified when:

1. ✅ All 5 tables exist with correct structure
2. ✅ All 4 functions exist and work
3. ✅ RLS is enabled on all tables
4. ✅ Storage buckets are created
5. ✅ Environment variables are set
6. ✅ Test operations work

---

## 🚀 Next Steps

Once verification is complete:

1. ✅ **Phase 1 Backend is ready!**
2. 🧪 **Test tRPC endpoints** (optional)
3. 🚀 **Proceed to Phase 2:** Sponsor Flow (UI Components)

---

## 📝 Verification Report Template

After running verification, document results:

```
Phase 1 Verification Report
Date: ___________

Database:
- Tables: ✅ / ❌
- Functions: ✅ / ❌
- RLS: ✅ / ❌

Storage:
- Buckets: ✅ / ❌

Environment:
- Variables: ✅ / ❌

Tests:
- Points calculation: ✅ / ❌
- RLS policies: ✅ / ❌

Status: ✅ READY / ❌ NEEDS FIXES
```

---

**Ready to verify? Run the SQL script first for fastest results!** 🚀

