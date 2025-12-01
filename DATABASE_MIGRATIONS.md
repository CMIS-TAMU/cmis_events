# Database Migrations Guide

## Overview

This guide explains how to run database migrations for the CMIS Event Management System in Supabase.

---

## Quick Start

### Option 1: Master Migration Script (Recommended)

Run the complete migration in one go:

1. **Open Supabase SQL Editor:**
   - Go to your Supabase project dashboard
   - Click "SQL Editor" in the left sidebar
   - Click "New query"

2. **Copy and paste the master migration:**
   - Open `database/migrations/master_migration.sql`
   - Copy entire contents
   - Paste into SQL Editor

3. **Run the migration:**
   - Click "Run" or press `Ctrl+Enter` (Windows/Linux) or `Cmd+Enter` (Mac)
   - Wait for all commands to complete
   - Verify no errors in the results

4. **Verify migration:**
   - Check that all tables/columns exist
   - Run verification queries (included in master script comments)

---

### Option 2: Individual Migrations

Run migrations one at a time in order:

1. **QR Code Migration**
   - File: `database/migrations/add_qr_code.sql`
   - Adds: `qr_code_token`, `checked_in_at` columns
   - Creates: Indexes for QR code lookups

2. **Resume Fields Migration**
   - File: `database/migrations/add_resume_fields.sql`
   - Adds: Resume-related columns to `users` table
   - Creates: `resume_views` table for analytics
   - Creates: Indexes for resume searches

3. **Session Registrations Migration**
   - File: `database/migrations/add_session_registrations.sql`
   - Creates: `session_registrations` table
   - Creates: Session capacity checking functions
   - Creates: Session registration function

---

## Migration Details

### 1. QR Code Migration

**Purpose:** Enable QR code check-in system

**Changes:**
- Adds `qr_code_token` to `event_registrations`
- Adds `checked_in_at` timestamp
- Creates indexes for performance

**Verification:**
```sql
-- Check columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'event_registrations' 
AND column_name IN ('qr_code_token', 'checked_in_at');

-- Check indexes
SELECT indexname 
FROM pg_indexes 
WHERE tablename = 'event_registrations' 
AND indexname LIKE '%qr_code%';
```

---

### 2. Resume Fields Migration

**Purpose:** Enable resume upload and search functionality

**Changes:**
- Adds resume fields to `users` table:
  - `resume_url`
  - `resume_filename`
  - `resume_uploaded_at`
  - `major`
  - `gpa`
  - `skills` (array)
  - `graduation_year`
  - `resume_version`
- Creates `resume_views` table for analytics
- Creates indexes for search performance

**Verification:**
```sql
-- Check columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('resume_url', 'resume_filename', 'major', 'gpa', 'skills');

-- Check resume_views table
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'resume_views';
```

---

### 3. Session Registrations Migration

**Purpose:** Enable event sessions and session registration

**Changes:**
- Creates `session_registrations` table
- Creates `check_session_capacity()` function
- Creates `register_for_session()` function
- Creates indexes for performance

**Verification:**
```sql
-- Check table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'session_registrations';

-- Check functions exist
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name IN ('check_session_capacity', 'register_for_session');
```

---

## Troubleshooting

### Migration Already Applied

If you see errors like "column already exists" or "table already exists":

**Solution:** The migration has already been applied. This is safe to ignore, or you can:
1. Check which migrations are already applied
2. Skip those parts of the migration

### Permission Errors

If you see permission errors:

**Solution:** 
- Ensure you're using the Supabase SQL Editor (not a restricted client)
- Check that you're the project owner or have appropriate permissions
- Contact your Supabase project administrator

### Function Errors

If functions fail to create:

**Solution:**
- Check that `pgcrypto` extension is enabled (should be by default)
- Verify PostgreSQL version is 12+
- Check for syntax errors in the function definitions

---

## Post-Migration Setup

### 1. Set Up Storage Buckets

After migrations, set up Supabase Storage:

1. Go to Storage → Buckets
2. Create bucket: `resumes`
   - Make it **Private**
   - Set file size limit: 10 MB
   - Allowed MIME types: `application/pdf`

3. Create bucket: `event-images` (optional)
   - Make it **Public**
   - Set file size limit: 5 MB
   - Allowed MIME types: `image/*`

### 2. Set Up Row-Level Security (RLS)

Enable RLS on new tables:

```sql
-- Enable RLS on resume_views
ALTER TABLE resume_views ENABLE ROW LEVEL SECURITY;

-- Enable RLS on session_registrations
ALTER TABLE session_registrations ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust based on your security requirements)
-- Example: Users can view their own resume views
CREATE POLICY "Users can view own resume views"
ON resume_views FOR SELECT
USING (user_id = auth.uid());

-- Example: Anyone can view sessions, but only authenticated users can register
CREATE POLICY "Authenticated users can register for sessions"
ON session_registrations FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

### 3. Test Migration

Run verification queries:

```sql
-- Test QR code column
SELECT COUNT(*) FROM event_registrations WHERE qr_code_token IS NOT NULL;

-- Test resume columns
SELECT COUNT(*) FROM users WHERE resume_filename IS NOT NULL;

-- Test session registrations
SELECT COUNT(*) FROM session_registrations;

-- Test functions
SELECT check_session_capacity('some-session-id'::uuid); -- Replace with actual ID
```

---

## Rollback (If Needed)

If you need to rollback a migration:

### Rollback QR Code Migration

```sql
ALTER TABLE event_registrations 
DROP COLUMN IF EXISTS qr_code_token,
DROP COLUMN IF EXISTS checked_in_at;

DROP INDEX IF EXISTS idx_event_registrations_qr_code_token;
DROP INDEX IF EXISTS idx_event_registrations_status;
```

### Rollback Resume Fields Migration

```sql
ALTER TABLE users
DROP COLUMN IF EXISTS resume_url,
DROP COLUMN IF EXISTS resume_filename,
DROP COLUMN IF EXISTS resume_uploaded_at,
DROP COLUMN IF EXISTS major,
DROP COLUMN IF EXISTS gpa,
DROP COLUMN IF EXISTS skills,
DROP COLUMN IF EXISTS graduation_year,
DROP COLUMN IF EXISTS resume_version;

DROP TABLE IF EXISTS resume_views CASCADE;

DROP INDEX IF EXISTS idx_users_major;
DROP INDEX IF EXISTS idx_users_skills;
DROP INDEX IF EXISTS idx_users_graduation_year;
DROP INDEX IF EXISTS idx_resume_views_user_id;
DROP INDEX IF EXISTS idx_resume_views_viewed_by;
```

### Rollback Session Registrations Migration

```sql
DROP TABLE IF EXISTS session_registrations CASCADE;

DROP FUNCTION IF EXISTS check_session_capacity(uuid);
DROP FUNCTION IF EXISTS register_for_session(uuid, uuid);

DROP INDEX IF EXISTS idx_session_registrations_session_id;
DROP INDEX IF EXISTS idx_session_registrations_user_id;
```

**⚠️ Warning:** Rollback will delete data. Only use if absolutely necessary and after backing up data.

---

## Migration Checklist

Before running migrations:
- [ ] Backup your database
- [ ] Test in development environment first
- [ ] Verify all environment variables are set
- [ ] Ensure Supabase project is accessible

During migration:
- [ ] Run master migration script
- [ ] Monitor for errors
- [ ] Verify all objects created

After migration:
- [ ] Run verification queries
- [ ] Set up storage buckets
- [ ] Configure RLS policies
- [ ] Test application functionality
- [ ] Update environment variables if needed

---

## Support

If you encounter issues:

1. Check Supabase logs for errors
2. Verify SQL syntax is correct
3. Check PostgreSQL version compatibility
4. Review Supabase documentation
5. Contact support if needed

---

**Last Updated:** 2024
**Version:** 1.0

