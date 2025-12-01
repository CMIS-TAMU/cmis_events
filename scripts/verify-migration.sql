-- Verification Script for Database Migrations
-- Run this AFTER running master_migration.sql to verify everything was created correctly

-- ============================================================================
-- QR CODE MIGRATION VERIFICATION
-- ============================================================================
SELECT 'QR Code Migration Check' as check_name;

-- Check QR code columns exist
SELECT 
    CASE 
        WHEN COUNT(*) = 2 THEN '✅ QR code columns exist'
        ELSE '❌ QR code columns missing'
    END as qr_columns_status
FROM information_schema.columns 
WHERE table_name = 'event_registrations' 
AND column_name IN ('qr_code_token', 'checked_in_at');

-- Check QR code indexes
SELECT 
    CASE 
        WHEN COUNT(*) >= 1 THEN '✅ QR code indexes exist'
        ELSE '❌ QR code indexes missing'
    END as qr_indexes_status
FROM pg_indexes 
WHERE tablename = 'event_registrations' 
AND indexname LIKE '%qr_code%';

-- ============================================================================
-- RESUME FIELDS MIGRATION VERIFICATION
-- ============================================================================
SELECT 'Resume Fields Migration Check' as check_name;

-- Check resume columns exist
SELECT 
    CASE 
        WHEN COUNT(*) >= 7 THEN '✅ Resume columns exist'
        ELSE '❌ Resume columns missing (found ' || COUNT(*) || ' columns)'
    END as resume_columns_status
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('resume_url', 'resume_filename', 'resume_uploaded_at', 'major', 'gpa', 'skills', 'graduation_year', 'resume_version');

-- Check resume_views table exists
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'resume_views') 
        THEN '✅ resume_views table exists'
        ELSE '❌ resume_views table missing'
    END as resume_views_table_status;

-- Check resume indexes
SELECT 
    CASE 
        WHEN COUNT(*) >= 2 THEN '✅ Resume indexes exist'
        ELSE '❌ Resume indexes missing'
    END as resume_indexes_status
FROM pg_indexes 
WHERE tablename = 'users' 
AND indexname IN ('idx_users_major', 'idx_users_skills', 'idx_users_graduation_year');

-- ============================================================================
-- SESSION REGISTRATIONS MIGRATION VERIFICATION
-- ============================================================================
SELECT 'Session Registrations Migration Check' as check_name;

-- Check session_registrations table exists
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'session_registrations') 
        THEN '✅ session_registrations table exists'
        ELSE '❌ session_registrations table missing'
    END as session_registrations_table_status;

-- Check session indexes
SELECT 
    CASE 
        WHEN COUNT(*) >= 2 THEN '✅ Session indexes exist'
        ELSE '❌ Session indexes missing'
    END as session_indexes_status
FROM pg_indexes 
WHERE tablename = 'session_registrations';

-- Check functions exist
SELECT 
    CASE 
        WHEN COUNT(*) = 2 THEN '✅ Session functions exist'
        ELSE '❌ Session functions missing (found ' || COUNT(*) || ')'
    END as session_functions_status
FROM information_schema.routines 
WHERE routine_name IN ('check_session_capacity', 'register_for_session')
AND routine_schema = 'public';

-- ============================================================================
-- SUMMARY
-- ============================================================================
SELECT 'Migration Verification Complete!' as summary;

-- Quick count check
SELECT 
    'Tables:' as category,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('event_registrations', 'users', 'resume_views', 'session_registrations')) || ' of 4 expected tables' as status
UNION ALL
SELECT 
    'Functions:',
    (SELECT COUNT(*) FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name IN ('check_session_capacity', 'register_for_session')) || ' of 2 expected functions'
UNION ALL
SELECT 
    'Columns:',
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'event_registrations' AND column_name IN ('qr_code_token', 'checked_in_at')) || ' QR columns, ' ||
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'users' AND column_name IN ('resume_url', 'resume_filename', 'major', 'gpa', 'skills', 'graduation_year', 'resume_version')) || ' resume columns';

