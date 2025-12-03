# 🗄️ Supabase Phase 1 Setup Guide

Complete step-by-step instructions to set up the Technical Missions system in Supabase.

---

## 📋 Prerequisites

- ✅ Supabase account and project created
- ✅ Access to Supabase Dashboard
- ✅ Database migration file ready: `database/migrations/add_technical_missions.sql`

---

## Step 1: Run Database Migration

### 1.1 Open Supabase SQL Editor

1. **Go to Supabase Dashboard:**
   - Navigate to: https://supabase.com/dashboard
   - Select your project: `cmis_events` (or your project name)

2. **Open SQL Editor:**
   - Click on **"SQL Editor"** in the left sidebar
   - Click **"New query"** button (top right)

### 1.2 Copy Migration SQL

1. **Open the migration file:**
   - File location: `database/migrations/add_technical_missions.sql`
   - Copy **ALL** contents of the file

2. **Paste into SQL Editor:**
   - Paste the entire SQL script into the SQL Editor
   - The script includes:
     - Table creation
     - Indexes
     - RLS policies
     - Functions
     - Triggers

### 1.3 Run the Migration

1. **Click "Run" button** (or press `Ctrl+Enter` / `Cmd+Enter`)

2. **Wait for completion:**
   - The migration should complete successfully
   - You should see: "Success. No rows returned"

3. **Verify tables were created:**
   - Go to **"Table Editor"** in left sidebar
   - You should see these new tables:
     - ✅ `missions`
     - ✅ `mission_submissions`
     - ✅ `mission_interactions`
     - ✅ `student_points`
     - ✅ `point_transactions`

### 1.4 Verify Functions Were Created

1. **Go to Database → Functions:**
   - Click **"Database"** → **"Functions"** in left sidebar
   - You should see:
     - ✅ `calculate_mission_points`
     - ✅ `update_student_points`
     - ✅ `update_mission_stats`
     - ✅ `update_updated_at_column`

### 1.5 Verify RLS Policies

1. **Go to Authentication → Policies:**
   - Click **"Authentication"** → **"Policies"** in left sidebar
   - Or check in **"Table Editor"** → Select a table → **"Policies"** tab
   - Verify RLS is enabled on all new tables

---

## Step 2: Create Storage Buckets

### 2.1 Create `mission-starter-files` Bucket

1. **Go to Storage:**
   - Click **"Storage"** in left sidebar
   - Click **"New bucket"** button

2. **Configure Bucket:**
   - **Name:** `mission-starter-files`
   - **Public bucket:** ✅ **Enable** (check this box)
   - **File size limit:** `50 MB` (or leave default)
   - **Allowed MIME types:** Leave empty (allows all) OR add:
     - `application/zip`
     - `application/x-zip-compressed`
     - `application/pdf`
     - `text/plain`
     - `text/markdown`

3. **Click "Create bucket"**

4. **Verify bucket created:**
   - You should see `mission-starter-files` in the buckets list
   - Status should show as **"Public"**

### 2.2 Create `mission-submissions` Bucket

1. **Click "New bucket"** again

2. **Configure Bucket:**
   - **Name:** `mission-submissions`
   - **Public bucket:** ❌ **Disable** (leave unchecked - this is private)
   - **File size limit:** `100 MB` (or leave default)
   - **Allowed MIME types:** Leave empty (allows all)

3. **Click "Create bucket"**

4. **Verify bucket created:**
   - You should see `mission-submissions` in the buckets list
   - Status should show as **"Private"**

### 2.3 Set Up RLS Policies for Storage (Private Bucket)

For the `mission-submissions` bucket (private), we need RLS policies:

1. **Go to Storage → Policies:**
   - Click on `mission-submissions` bucket
   - Click **"Policies"** tab

2. **Create Policy for Students to Upload:**
   - Click **"New Policy"**
   - **Policy name:** `Students can upload submissions`
   - **Allowed operation:** `INSERT`
   - **Policy definition:**
     ```sql
     (bucket_id = 'mission-submissions'::text) 
     AND (auth.uid()::text = (storage.foldername(name))[2])
     ```
   - This allows students to upload to their own folder: `missions/{missionId}/submissions/{userId}/`

3. **Create Policy for Students to View Own Files:**
   - Click **"New Policy"**
   - **Policy name:** `Students can view own submissions`
   - **Allowed operation:** `SELECT`
   - **Policy definition:**
     ```sql
     (bucket_id = 'mission-submissions'::text) 
     AND (auth.uid()::text = (storage.foldername(name))[2])
     ```

4. **Create Policy for Sponsors to View Submissions:**
   - Click **"New Policy"**
   - **Policy name:** `Sponsors can view submissions`
   - **Allowed operation:** `SELECT`
   - **Policy definition:**
     ```sql
     (bucket_id = 'mission-submissions'::text) 
     AND (
       EXISTS (
         SELECT 1 FROM missions
         WHERE missions.id::text = (storage.foldername(name))[1]
         AND missions.sponsor_id = auth.uid()
       )
     )
     ```
   - This allows sponsors to view submissions for their missions

**Note:** For simpler setup, you can use the admin client (service role key) to bypass RLS when needed, similar to how resume uploads work.

---

## Step 3: Verify Database Setup

### 3.1 Check Tables Structure

1. **Go to Table Editor:**
   - Click **"Table Editor"** in left sidebar

2. **Verify each table has correct columns:**

   **`missions` table should have:**
   - `id` (uuid, primary key)
   - `sponsor_id` (uuid, foreign key to users)
   - `title` (text)
   - `description` (text)
   - `difficulty` (text, check constraint)
   - `category` (text)
   - `tags` (text array)
   - `requirements` (text)
   - `starter_files_url` (text)
   - `submission_instructions` (text)
   - `max_points` (integer)
   - `time_limit_minutes` (integer)
   - `status` (text, check constraint)
   - `published_at` (timestamptz)
   - `deadline` (timestamptz)
   - `total_attempts` (integer)
   - `total_submissions` (integer)
   - `created_at` (timestamptz)
   - `updated_at` (timestamptz)

   **`mission_submissions` table should have:**
   - `id` (uuid, primary key)
   - `mission_id` (uuid, foreign key)
   - `student_id` (uuid, foreign key)
   - `submission_url` (text)
   - `submission_files` (jsonb)
   - `submission_text` (text)
   - `started_at` (timestamptz)
   - `submitted_at` (timestamptz)
   - `time_spent_minutes` (integer)
   - `status` (text, check constraint)
   - `score` (numeric)
   - `points_awarded` (integer)
   - `sponsor_feedback` (text)
   - `sponsor_notes` (text)
   - `reviewed_at` (timestamptz)
   - `reviewed_by` (uuid, foreign key)
   - `created_at` (timestamptz)
   - `updated_at` (timestamptz)

   **`student_points` table should have:**
   - `id` (uuid, primary key)
   - `user_id` (uuid, unique, foreign key)
   - `total_points` (integer)
   - `missions_completed` (integer)
   - `missions_perfect_score` (integer)
   - `average_score` (numeric)
   - `last_updated` (timestamptz)
   - `created_at` (timestamptz)

### 3.2 Test Database Functions

1. **Go to SQL Editor:**
   - Click **"SQL Editor"** → **"New query"**

2. **Test `calculate_mission_points` function:**
   ```sql
   SELECT calculate_mission_points(100, 'expert', 100);
   -- Should return: 300 (100 * 1.5 * 2.0)
   
   SELECT calculate_mission_points(75, 'intermediate', 100);
   -- Should return: 90 (75 * 0.75 * 1.2)
   ```

3. **Verify functions work:**
   - If you see results, functions are working correctly
   - If you get errors, check the migration ran completely

---

## Step 4: Test RLS Policies

### 4.1 Test Mission Access

1. **Go to SQL Editor:**
   - Create a test query

2. **Test as authenticated user:**
   ```sql
   -- This will use your current auth context
   SELECT * FROM missions WHERE status = 'active';
   ```
   - Should return empty (no missions yet) or missions if any exist

3. **Test sponsor access:**
   ```sql
   -- Check if you can insert a mission (if you're a sponsor)
   INSERT INTO missions (sponsor_id, title, description, status)
   VALUES (auth.uid(), 'Test Mission', 'Test Description', 'draft');
   ```
   - Should work if you're a sponsor/admin
   - Should fail if you're a regular user

---

## Step 5: Verify Environment Variables

### 5.1 Check Your `.env.local` File

Make sure these variables are set:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
RESEND_API_KEY=your-resend-key (optional for now)
```

### 5.2 Get Keys from Supabase

1. **Go to Settings → API:**
   - Click **"Settings"** → **"API"** in left sidebar
   - Copy:
     - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
     - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)

---

## Step 6: Quick Test (Optional)

### 6.1 Create a Test Mission (via SQL)

1. **Go to SQL Editor:**
   - Create a test mission manually

2. **Insert test data:**
   ```sql
   -- First, get your user ID
   SELECT id FROM auth.users WHERE email = 'your-email@example.com';
   
   -- Then create a test mission (replace YOUR_USER_ID)
   INSERT INTO missions (
     sponsor_id,
     title,
     description,
     difficulty,
     category,
     max_points,
     status,
     published_at
   ) VALUES (
     'YOUR_USER_ID',
     'Test Mission',
     'This is a test mission',
     'beginner',
     'Web Development',
     100,
     'active',
     now()
   );
   ```

3. **Verify it appears:**
   - Go to **Table Editor** → `missions`
   - You should see your test mission

---

## ✅ Verification Checklist

Before moving to Phase 2, verify:

- [ ] All 5 tables created (`missions`, `mission_submissions`, `mission_interactions`, `student_points`, `point_transactions`)
- [ ] All indexes created (check in Table Editor → Indexes tab)
- [ ] RLS enabled on all tables (check in Table Editor → Policies tab)
- [ ] All 4 functions created (check in Database → Functions)
- [ ] Storage bucket `mission-starter-files` created (public)
- [ ] Storage bucket `mission-submissions` created (private)
- [ ] RLS policies set on `mission-submissions` bucket (optional, can use admin client)
- [ ] Environment variables configured in `.env.local`
- [ ] Test mission can be created (optional test)

---

## 🐛 Troubleshooting

### Issue: Migration fails with "relation already exists"

**Solution:**
- Some tables might already exist
- The migration uses `CREATE TABLE IF NOT EXISTS`, so it should be safe
- If errors persist, drop existing tables first (be careful!)

### Issue: RLS policies not working

**Solution:**
- Check that RLS is enabled: `ALTER TABLE missions ENABLE ROW LEVEL SECURITY;`
- Verify policies were created in Authentication → Policies
- Test with a user account (not service role)

### Issue: Storage bucket upload fails

**Solution:**
- Check bucket exists and is accessible
- Verify RLS policies on bucket
- For private bucket, use signed URLs or admin client
- Check file size limits

### Issue: Functions not found

**Solution:**
- Re-run the migration SQL
- Check Database → Functions to see if they exist
- Functions are in the `public` schema

---

## 📝 Next Steps

Once all steps are complete:

1. ✅ **Phase 1 Backend is ready!**
2. 🚀 **Proceed to Phase 2:** Sponsor Flow (UI Components)
3. 🧪 **Test the backend:** Use tRPC client to test endpoints

---

## 📞 Need Help?

If you encounter issues:
1. Check Supabase logs: **Logs** → **Postgres Logs**
2. Check browser console for errors
3. Verify all environment variables are set
4. Ensure you're using the correct Supabase project

---

**Status:** ✅ Ready to test backend endpoints!

