-- ============================================================================
-- PHASE 1 SETUP VERIFICATION SCRIPT
-- Run this in Supabase SQL Editor to verify all Phase 1 components
-- ============================================================================

-- ============================================================================
-- 1. VERIFY TABLES EXIST
-- ============================================================================
DO $$
DECLARE
  table_count integer;
  missing_tables text[] := ARRAY[]::text[];
  required_tables text[] := ARRAY[
    'missions',
    'mission_submissions',
    'mission_interactions',
    'student_points',
    'point_transactions'
  ];
  table_name text;
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '1. CHECKING TABLES...';
  RAISE NOTICE '========================================';
  
  FOREACH table_name IN ARRAY required_tables
  LOOP
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = table_name;
    
    IF table_count = 0 THEN
      missing_tables := array_append(missing_tables, table_name);
      RAISE NOTICE '❌ MISSING: %', table_name;
    ELSE
      RAISE NOTICE '✅ EXISTS: %', table_name;
    END IF;
  END LOOP;
  
  IF array_length(missing_tables, 1) > 0 THEN
    RAISE EXCEPTION 'Missing tables: %', array_to_string(missing_tables, ', ');
  ELSE
    RAISE NOTICE '✅ All tables exist!';
  END IF;
END $$;

-- ============================================================================
-- 2. VERIFY COLUMNS IN KEY TABLES
-- ============================================================================
DO $$
DECLARE
  col_count integer;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '2. CHECKING TABLE COLUMNS...';
  RAISE NOTICE '========================================';
  
  -- Check missions table
  SELECT COUNT(*) INTO col_count
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'missions'
    AND column_name IN ('id', 'sponsor_id', 'title', 'description', 'difficulty', 'status', 'max_points');
  
  IF col_count = 7 THEN
    RAISE NOTICE '✅ missions table has required columns';
  ELSE
    RAISE WARNING '⚠️  missions table missing columns (expected 7, found %)', col_count;
  END IF;
  
  -- Check mission_submissions table
  SELECT COUNT(*) INTO col_count
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'mission_submissions'
    AND column_name IN ('id', 'mission_id', 'student_id', 'score', 'points_awarded', 'status');
  
  IF col_count = 6 THEN
    RAISE NOTICE '✅ mission_submissions table has required columns';
  ELSE
    RAISE WARNING '⚠️  mission_submissions table missing columns (expected 6, found %)', col_count;
  END IF;
  
  -- Check student_points table
  SELECT COUNT(*) INTO col_count
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'student_points'
    AND column_name IN ('id', 'user_id', 'total_points', 'missions_completed', 'average_score');
  
  IF col_count = 5 THEN
    RAISE NOTICE '✅ student_points table has required columns';
  ELSE
    RAISE WARNING '⚠️  student_points table missing columns (expected 5, found %)', col_count;
  END IF;
END $$;

-- ============================================================================
-- 3. VERIFY FUNCTIONS EXIST
-- ============================================================================
DO $$
DECLARE
  func_count integer;
  missing_funcs text[] := ARRAY[]::text[];
  required_funcs text[] := ARRAY[
    'calculate_mission_points',
    'update_student_points',
    'update_mission_stats',
    'update_updated_at_column'
  ];
  func_name text;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '3. CHECKING FUNCTIONS...';
  RAISE NOTICE '========================================';
  
  FOREACH func_name IN ARRAY required_funcs
  LOOP
    SELECT COUNT(*) INTO func_count
    FROM information_schema.routines
    WHERE routine_schema = 'public'
      AND routine_name = func_name;
    
    IF func_count = 0 THEN
      missing_funcs := array_append(missing_funcs, func_name);
      RAISE NOTICE '❌ MISSING: %', func_name;
    ELSE
      RAISE NOTICE '✅ EXISTS: %', func_name;
    END IF;
  END LOOP;
  
  IF array_length(missing_funcs, 1) > 0 THEN
    RAISE WARNING 'Missing functions: %', array_to_string(missing_funcs, ', ');
  ELSE
    RAISE NOTICE '✅ All functions exist!';
  END IF;
END $$;

-- ============================================================================
-- 4. VERIFY RLS IS ENABLED
-- ============================================================================
DO $$
DECLARE
  rls_enabled boolean;
  missing_rls text[] := ARRAY[]::text[];
  required_tables text[] := ARRAY[
    'missions',
    'mission_submissions',
    'mission_interactions',
    'student_points',
    'point_transactions'
  ];
  table_name text;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '4. CHECKING RLS POLICIES...';
  RAISE NOTICE '========================================';
  
  FOREACH table_name IN ARRAY required_tables
  LOOP
    SELECT relrowsecurity INTO rls_enabled
    FROM pg_class
    WHERE relname = table_name
      AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
    
    IF rls_enabled THEN
      RAISE NOTICE '✅ RLS ENABLED: %', table_name;
    ELSE
      missing_rls := array_append(missing_rls, table_name);
      RAISE WARNING '⚠️  RLS NOT ENABLED: %', table_name;
    END IF;
  END LOOP;
  
  IF array_length(missing_rls, 1) > 0 THEN
    RAISE WARNING 'Tables without RLS: %', array_to_string(missing_rls, ', ');
  ELSE
    RAISE NOTICE '✅ RLS enabled on all tables!';
  END IF;
END $$;

-- ============================================================================
-- 5. VERIFY INDEXES EXIST
-- ============================================================================
DO $$
DECLARE
  idx_count integer;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '5. CHECKING INDEXES...';
  RAISE NOTICE '========================================';
  
  -- Check key indexes
  SELECT COUNT(*) INTO idx_count
  FROM pg_indexes
  WHERE schemaname = 'public'
    AND (
      indexname LIKE 'idx_missions%' OR
      indexname LIKE 'idx_mission_submissions%' OR
      indexname LIKE 'idx_student_points%'
    );
  
  IF idx_count >= 10 THEN
    RAISE NOTICE '✅ Found % indexes (expected at least 10)', idx_count;
  ELSE
    RAISE WARNING '⚠️  Found only % indexes (expected at least 10)', idx_count;
  END IF;
END $$;

-- ============================================================================
-- 6. TEST FUNCTIONS
-- ============================================================================
DO $$
DECLARE
  test_result integer;
  test_score numeric;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '6. TESTING FUNCTIONS...';
  RAISE NOTICE '========================================';
  
  -- Test calculate_mission_points
  BEGIN
    SELECT calculate_mission_points(100, 'expert', 100) INTO test_result;
    IF test_result = 300 THEN
      RAISE NOTICE '✅ calculate_mission_points works (perfect score, expert)';
    ELSE
      RAISE WARNING '⚠️  calculate_mission_points returned % (expected 300)', test_result;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING '❌ calculate_mission_points failed: %', SQLERRM;
  END;
  
  -- Test calculate_mission_points with different values
  BEGIN
    SELECT calculate_mission_points(75, 'intermediate', 100) INTO test_result;
    IF test_result BETWEEN 67 AND 68 THEN -- 75 * 0.75 * 1.2 = 67.5
      RAISE NOTICE '✅ calculate_mission_points works (75 score, intermediate)';
    ELSE
      RAISE WARNING '⚠️  calculate_mission_points returned % (expected ~68)', test_result;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING '❌ calculate_mission_points failed: %', SQLERRM;
  END;
END $$;

-- ============================================================================
-- 7. VERIFY CONSTRAINTS
-- ============================================================================
DO $$
DECLARE
  constraint_count integer;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '7. CHECKING CONSTRAINTS...';
  RAISE NOTICE '========================================';
  
  -- Check missions table constraints
  SELECT COUNT(*) INTO constraint_count
  FROM information_schema.table_constraints
  WHERE table_schema = 'public'
    AND table_name = 'missions'
    AND constraint_type IN ('CHECK', 'UNIQUE', 'PRIMARY KEY', 'FOREIGN KEY');
  
  IF constraint_count >= 3 THEN
    RAISE NOTICE '✅ missions table has constraints (found %)', constraint_count;
  ELSE
    RAISE WARNING '⚠️  missions table missing constraints (found %)', constraint_count;
  END IF;
  
  -- Check mission_submissions unique constraint
  SELECT COUNT(*) INTO constraint_count
  FROM information_schema.table_constraints
  WHERE table_schema = 'public'
    AND table_name = 'mission_submissions'
    AND constraint_type = 'UNIQUE';
  
  IF constraint_count >= 1 THEN
    RAISE NOTICE '✅ mission_submissions has unique constraint';
  ELSE
    RAISE WARNING '⚠️  mission_submissions missing unique constraint';
  END IF;
END $$;

-- ============================================================================
-- 8. SUMMARY
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'VERIFICATION COMPLETE!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Check Storage buckets manually in Supabase Dashboard';
  RAISE NOTICE '2. Verify environment variables in .env.local';
  RAISE NOTICE '3. Test tRPC endpoints';
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- QUICK TABLE COUNTS (Optional - to see if data exists)
-- ============================================================================
SELECT 
  'missions' as table_name,
  COUNT(*) as row_count
FROM missions
UNION ALL
SELECT 
  'mission_submissions',
  COUNT(*)
FROM mission_submissions
UNION ALL
SELECT 
  'mission_interactions',
  COUNT(*)
FROM mission_interactions
UNION ALL
SELECT 
  'student_points',
  COUNT(*)
FROM student_points
UNION ALL
SELECT 
  'point_transactions',
  COUNT(*)
FROM point_transactions;

