-- 🔍 SIMPLE TEST: Find the exact cause of "schema net does not exist"

-- Test 1: Try a simple insert (this will show the exact error)
DO $$
DECLARE
    test_user_id uuid;
BEGIN
    -- Get first user
    SELECT id INTO test_user_id FROM auth.users LIMIT 1;
    
    -- Try to insert a test job
    INSERT INTO public.jobs (
        employer_id,
        title,
        description,
        location,
        salary,
        job_type,
        deadline,
        is_active
    ) VALUES (
        test_user_id,
        'TEST - DELETE',
        'Test',
        'Test',
        '1000',
        'full-time',
        CURRENT_DATE + 30,
        false
    );
    
    RAISE NOTICE '✅ Insert successful!';
    
    -- Delete the test job
    DELETE FROM public.jobs WHERE title = 'TEST - DELETE';
    RAISE NOTICE '✅ Test job deleted';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ Error: % - %', SQLERRM, SQLSTATE;
END $$;

-- Test 2: Check ALL triggers on jobs table
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'jobs'
  AND event_object_schema = 'public';

-- Test 3: Check if net schema exists (it shouldn't)
SELECT schema_name 
FROM information_schema.schemata 
WHERE schema_name = 'net';

-- Test 4: Check ALL schemas (to see what exists)
SELECT schema_name 
FROM information_schema.schemata 
ORDER BY schema_name;

-- Test 5: Check pg_net extension specifically
SELECT * FROM pg_extension WHERE extname = 'pg_net';
