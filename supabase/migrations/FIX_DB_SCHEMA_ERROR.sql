-- 🔥 CRITICAL FIX: Resolve "schema net does not exist" error in Supabase
-- This error (code 3F000) happens when inserting jobs due to triggers/functions

-- ========================================
-- STEP 1: Check what's using "net" schema
-- ========================================

-- Check for triggers that might reference net schema
SELECT 
    t.trigger_name,
    t.event_manipulation,
    t.event_object_table,
    t.action_statement
FROM information_schema.triggers t
WHERE t.event_object_schema = 'public'
  AND t.event_object_table IN ('jobs', 'job_notifications', 'job_alerts')
ORDER BY t.event_object_table, t.trigger_name;

-- Check for functions that might use net schema
SELECT 
    n.nspname as schema_name,
    p.proname as function_name
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname NOT IN ('pg_catalog', 'information_schema')
  AND p.proname NOT LIKE 'array_%'
  AND p.prokind = 'f'  -- only functions, not aggregates
LIMIT 50;

-- ========================================
-- STEP 2: Drop problematic triggers/functions
-- ========================================

-- Drop any webhook triggers (these might use pg_net)
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT trigger_name, event_object_table
        FROM information_schema.triggers
        WHERE event_object_schema = 'public'
          AND (trigger_name ILIKE '%webhook%' 
               OR trigger_name ILIKE '%http%'
               OR trigger_name ILIKE '%net%')
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.%I CASCADE', 
                      r.trigger_name, r.event_object_table);
        RAISE NOTICE 'Dropped trigger % on table %', r.trigger_name, r.event_object_table;
    END LOOP;
END $$;

-- ========================================
-- STEP 3: Check and disable pg_net extension
-- ========================================

-- Check if pg_net is enabled
SELECT 
    extname as extension_name,
    extversion as version,
    n.nspname as schema_name
FROM pg_extension e
LEFT JOIN pg_namespace n ON e.extnamespace = n.oid
WHERE extname IN ('pg_net', 'http', 'pgsodium');

-- Disable pg_net if it exists (safe - it recreates automatically if needed)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_net') THEN
        DROP EXTENSION pg_net CASCADE;
        RAISE NOTICE '✅ pg_net extension dropped';
    ELSE
        RAISE NOTICE 'ℹ️ pg_net extension not found';
    END IF;
END $$;

-- ========================================
-- STEP 4: Check for realtime publications
-- ========================================

-- Check realtime configuration (might be trying to use webhooks)
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('jobs', 'job_notifications', 'job_alerts')
ORDER BY tablename;

-- ========================================
-- STEP 5: Verify the fix
-- ========================================

-- Try inserting a test job (comment this out after testing)
-- INSERT INTO public.jobs (
--     employer_id,
--     title,
--     description,
--     location,
--     salary,
--     job_type,
--     deadline,
--     is_active
-- ) VALUES (
--     (SELECT id FROM auth.users LIMIT 1),
--     'TEST JOB - DELETE ME',
--     'This is a test',
--     'Test Location',
--     '1000',
--     'full-time',
--     CURRENT_DATE + INTERVAL '30 days',
--     false
-- );

-- If the above works, delete the test job:
-- DELETE FROM public.jobs WHERE title = 'TEST JOB - DELETE ME';

-- ========================================
-- SUCCESS MESSAGE
-- ========================================

DO $$ 
BEGIN
    RAISE NOTICE '✅ Diagnostic complete. Check the results above.';
    RAISE NOTICE 'ℹ️ If you see any triggers or functions using "net" schema, they have been dropped.';
    RAISE NOTICE '🔄 Restart your app: npm start';
END $$;
