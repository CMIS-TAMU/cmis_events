-- ============================================================================
-- COMPREHENSIVE FIX: Find and Clear Pending Match Batches
-- ============================================================================
-- This script will:
-- 1. Show ALL match batches (any status) with student emails
-- 2. Show which student you're logged in as (check your auth.users table)
-- 3. Delete ALL pending batches
-- 4. Delete ALL expired batches
-- 5. Verify the function exists and shows its definition
-- ============================================================================

-- Step 1: Show ALL match batches with student details
SELECT 
  '=== ALL MATCH BATCHES ===' as info,
  mb.id as batch_id,
  mb.student_id,
  u.email as student_email,
  u.full_name as student_name,
  mb.status,
  mb.created_at,
  mb.expires_at,
  CASE 
    WHEN mb.expires_at < now() THEN '❌ EXPIRED'
    WHEN mb.status = 'pending' THEN '⚠️  PENDING'
    ELSE mb.status
  END as status_check,
  EXTRACT(EPOCH FROM (now() - mb.created_at)) / 86400 as days_old
FROM match_batches mb
LEFT JOIN users u ON mb.student_id = u.id
ORDER BY mb.created_at DESC;

-- Step 2: Show ONLY pending batches (this is what's blocking you)
SELECT 
  '=== PENDING BATCHES (BLOCKING) ===' as info,
  mb.id as batch_id,
  mb.student_id,
  u.email as student_email,
  mb.status,
  mb.created_at,
  mb.expires_at,
  CASE 
    WHEN mb.expires_at < now() THEN 'EXPIRED (but still pending - this is the bug!)'
    ELSE 'ACTIVE'
  END as expiration_status
FROM match_batches mb
LEFT JOIN users u ON mb.student_id = u.id
WHERE mb.status = 'pending'
ORDER BY mb.created_at DESC;

-- Step 3: DELETE ALL pending batches (nuclear option)
DELETE FROM match_batches WHERE status = 'pending';

-- Step 4: DELETE ALL expired batches (regardless of status)
DELETE FROM match_batches WHERE expires_at < now() - interval '1 hour';

-- Step 5: Verify deletion - should show 0
SELECT 
  '=== VERIFICATION ===' as info,
  COUNT(*) as remaining_pending_batches,
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ All pending batches cleared!'
    ELSE '❌ ERROR: Still have ' || COUNT(*) || ' pending batches'
  END as status
FROM match_batches
WHERE status = 'pending';

-- Step 6: Check if create_match_batch function exists
SELECT 
  '=== FUNCTION CHECK ===' as info,
  p.proname as function_name,
  pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname = 'create_match_batch';

-- Step 7: Show function source code (to verify expiration check)
SELECT 
  '=== FUNCTION SOURCE CODE ===' as info,
  pg_get_functiondef(oid) as source_code
FROM pg_proc
WHERE proname = 'create_match_batch';

