# Migration Status Tracker

Use this to track your migration progress.

## Pre-Migration Checklist

- [ ] Database backup created (recommended)
- [ ] Supabase project accessible
- [ ] SQL Editor access confirmed
- [ ] Environment variables configured
- [ ] Development server can connect to Supabase

## Migration Execution

### Step 1: Run Master Migration

- [ ] Opened Supabase SQL Editor
- [ ] Copied `database/migrations/master_migration.sql`
- [ ] Pasted into SQL Editor
- [ ] Clicked "Run"
- [ ] No errors reported
- [ ] All commands executed successfully

**Date Completed:** _______________
**Time Taken:** _______________

### Step 2: Verify Migration

- [ ] Ran `scripts/verify-migration.sql`
- [ ] All QR code checks passed ✅
- [ ] All resume checks passed ✅
- [ ] All session checks passed ✅
- [ ] All functions created ✅

**Verification Date:** _______________

### Step 3: Storage Buckets

- [ ] Created `resumes` bucket (Private, 10MB, PDF only)
- [ ] Created `event-images` bucket (Public, 5MB, images)
- [ ] Set bucket policies
- [ ] Tested file upload permissions

**Storage Setup Date:** _______________

### Step 4: Row-Level Security

- [ ] Enabled RLS on `resume_views`
- [ ] Enabled RLS on `session_registrations`
- [ ] Created access policies
- [ ] Tested policy enforcement

**RLS Setup Date:** _______________

## Post-Migration Testing

### Application Connection

- [ ] Development server starts without errors
- [ ] Health check endpoint works: `/api/health`
- [ ] Can connect to Supabase from app
- [ ] No connection errors in console

### Feature Testing

- [ ] QR Code generation works
- [ ] Resume upload works
- [ ] Session registration works
- [ ] Database queries succeed
- [ ] No SQL errors in logs

**Testing Date:** _______________
**Tester:** _______________

## Issues Encountered

List any issues and their resolutions:

1. **Issue:**
   - Description:
   - Resolution:
   
2. **Issue:**
   - Description:
   - Resolution:

## Migration Sign-Off

- [ ] All migrations completed
- [ ] All verifications passed
- [ ] All features tested
- [ ] Ready for production

**Completed By:** _______________
**Date:** _______________
**Signature:** _______________

---

## Quick Verification Commands

```sql
-- Quick check: Count all new columns/tables
SELECT 
    'QR Columns' as type,
    COUNT(*) as count
FROM information_schema.columns 
WHERE table_name = 'event_registrations' 
AND column_name IN ('qr_code_token', 'checked_in_at')
UNION ALL
SELECT 
    'Resume Columns',
    COUNT(*)
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('resume_url', 'resume_filename', 'major', 'gpa', 'skills')
UNION ALL
SELECT 
    'New Tables',
    COUNT(*)
FROM information_schema.tables 
WHERE table_name IN ('resume_views', 'session_registrations')
UNION ALL
SELECT 
    'Functions',
    COUNT(*)
FROM information_schema.routines 
WHERE routine_name IN ('check_session_capacity', 'register_for_session');
```

Expected results:
- QR Columns: 2
- Resume Columns: 5+
- New Tables: 2
- Functions: 2

