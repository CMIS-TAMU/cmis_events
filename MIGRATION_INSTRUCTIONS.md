# Step-by-Step Migration Instructions

Follow these steps to run the database migrations in Supabase.

## Prerequisites

- ✅ Supabase project created
- ✅ Access to Supabase SQL Editor
- ✅ Backup of current database (recommended)

---

## Step 1: Open Supabase SQL Editor

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Select your project
3. Click **"SQL Editor"** in the left sidebar
4. Click **"New query"** button (top right)

---

## Step 2: Run Master Migration

1. **Open the master migration file:**
   - File location: `database/migrations/master_migration.sql`
   - Copy the entire contents (Cmd+A / Ctrl+A, then Cmd+C / Ctrl+C)

2. **Paste into SQL Editor:**
   - Paste the copied SQL into the editor

3. **Run the migration:**
   - Click the **"Run"** button (or press `Cmd+Enter` / `Ctrl+Enter`)
   - Wait for execution to complete
   - Check the results panel at the bottom

4. **Verify no errors:**
   - Look for error messages in red
   - If you see "already exists" warnings, that's okay - the migration uses `IF NOT EXISTS`
   - If you see actual errors, stop and check the troubleshooting section

---

## Step 3: Verify Migration

1. **Run verification script:**
   - Open `scripts/verify-migration.sql`
   - Copy and paste into SQL Editor
   - Click "Run"
   - Check that all items show ✅

2. **Manual verification (optional):**
   ```sql
   -- Check QR code columns
   SELECT column_name FROM information_schema.columns 
   WHERE table_name = 'event_registrations' 
   AND column_name IN ('qr_code_token', 'checked_in_at');
   
   -- Check resume columns
   SELECT column_name FROM information_schema.columns 
   WHERE table_name = 'users' 
   AND column_name LIKE 'resume%' OR column_name IN ('major', 'gpa', 'skills', 'graduation_year');
   
   -- Check session_registrations table
   SELECT table_name FROM information_schema.tables 
   WHERE table_name = 'session_registrations';
   ```

---

## Step 4: Set Up Storage Buckets

1. **Go to Storage:**
   - Click **"Storage"** in the left sidebar
   - Click **"Buckets"**

2. **Create Resumes Bucket:**
   - Click **"New bucket"**
   - Name: `resumes`
   - Make it **Private** (uncheck "Public bucket")
   - File size limit: `10485760` (10 MB in bytes)
   - Allowed MIME types: `application/pdf`
   - Click **"Create bucket"**

3. **Create Event Images Bucket (Optional):**
   - Click **"New bucket"**
   - Name: `event-images`
   - Make it **Public** (check "Public bucket")
   - File size limit: `5242880` (5 MB in bytes)
   - Allowed MIME types: `image/*`
   - Click **"Create bucket"**

4. **Set Up Bucket Policies (if needed):**
   - Go to Storage → Policies
   - Ensure resumes bucket is private (only authenticated users)
   - Ensure event-images bucket is public (read access for all)

---

## Step 5: Set Up Row-Level Security (RLS)

Run this SQL in the SQL Editor:

```sql
-- Enable RLS on resume_views
ALTER TABLE resume_views ENABLE ROW LEVEL SECURITY;

-- Enable RLS on session_registrations  
ALTER TABLE session_registrations ENABLE ROW LEVEL SECURITY;

-- Basic policies (adjust based on your needs)
-- Users can view their own resume views
CREATE POLICY "Users can view own resume views"
ON resume_views FOR SELECT
USING (user_id = auth.uid() OR viewed_by = auth.uid());

-- Anyone authenticated can view resume views (for analytics)
CREATE POLICY "Authenticated users can view resume views"
ON resume_views FOR SELECT
USING (auth.role() = 'authenticated');

-- Authenticated users can register for sessions
CREATE POLICY "Authenticated users can register for sessions"
ON session_registrations FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can view their own session registrations
CREATE POLICY "Users can view own session registrations"
ON session_registrations FOR SELECT
USING (auth.uid() = user_id);
```

---

## Step 6: Verify Application Connection

1. **Check environment variables:**
   - Ensure `.env.local` has correct Supabase credentials
   - Verify `NEXT_PUBLIC_SUPABASE_URL` and keys are set

2. **Start development server:**
   ```bash
   pnpm dev
   ```

3. **Test connection:**
   - Visit: `http://localhost:3000/api/health`
   - Should return: `{"status":"ok"}`

4. **Run API tests (optional):**
   ```bash
   ./scripts/test-api-endpoints.sh
   ```

---

## Troubleshooting

### Error: "column already exists"
**Solution:** The migration uses `IF NOT EXISTS`, so this is safe to ignore.

### Error: "permission denied"
**Solution:** 
- Ensure you're using the SQL Editor (not a restricted client)
- Check you're the project owner
- Verify you have admin permissions

### Error: "function already exists"
**Solution:** This is okay - functions will be replaced with `CREATE OR REPLACE`.

### Error: "extension pgcrypto does not exist"
**Solution:** 
```sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

### Tables not appearing after migration
**Solution:**
- Refresh the Supabase dashboard
- Check the SQL Editor results for errors
- Verify you ran the complete migration script

---

## Post-Migration Checklist

- [ ] All migration scripts executed successfully
- [ ] Verification script shows all ✅ checks
- [ ] Storage buckets created
- [ ] RLS policies set up
- [ ] Application connects to database
- [ ] Health check endpoint works
- [ ] Ready to test features

---

## Next Steps

After migration is complete:

1. **Follow Testing Guide:**
   - Use `QUICK_TEST_CHECKLIST.md` for rapid testing
   - Or `TESTING_GUIDE.md` for comprehensive testing

2. **Test Core Features:**
   - Create test users
   - Create an event
   - Register for event
   - Test QR code generation
   - Upload resume
   - Test sponsor search

3. **Verify Everything Works:**
   - All pages load correctly
   - No console errors
   - Database queries succeed
   - File uploads work

---

## Support

If you encounter issues:
1. Check the error message in SQL Editor
2. Review `DATABASE_MIGRATIONS.md` troubleshooting section
3. Check Supabase logs
4. Verify environment variables are correct

---

**Ready to migrate?** Copy `database/migrations/master_migration.sql` and run it in Supabase SQL Editor!

