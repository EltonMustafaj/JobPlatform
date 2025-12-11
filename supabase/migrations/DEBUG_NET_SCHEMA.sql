-- 🔍 DEBUG: Gjej saktësisht ku është problemi me schema "net"

-- Test 1: Kontrollo të gjitha trigger-at në jobs table
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    event_object_table
FROM information_schema.triggers
WHERE event_object_table = 'jobs'
  AND event_object_schema = 'public'
ORDER BY trigger_name;

-- Test 2: Kontrollo të gjitha constraint-et në jobs table
SELECT 
    constraint_name,
    constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'jobs'
  AND table_schema = 'public'
ORDER BY constraint_name;

-- Test 3: Shiko strukturën e jobs table
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'jobs'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Test 4: Shiko të gjitha job-et
SELECT 
    id,
    title,
    description,
    location,
    employer_id,
    is_active
FROM public.jobs
LIMIT 5;

-- Test 5: Provo të përditësosh një job (kjo mund të shkaktojë error)
DO $$
DECLARE
    test_job_id uuid;
BEGIN
    -- Merr një job ekzistues
    SELECT id INTO test_job_id FROM public.jobs LIMIT 1;
    
    IF test_job_id IS NOT NULL THEN
        -- Provo update (zakonisht këtu del error "net schema")
        UPDATE public.jobs 
        SET title = 'Test Update - ' || title
        WHERE id = test_job_id;
        
        RAISE NOTICE '✅ Update u krye me sukses për job: %', test_job_id;
    ELSE
        RAISE NOTICE '⚠️ Nuk ka jobs në tabelë';
    END IF;
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ ERROR: %', SQLERRM;
    RAISE NOTICE 'SQLSTATE: %', SQLSTATE;
END $$;

-- Test 6: Kontrollo nëse ka extensions aktive që përdorin "net"
SELECT 
    extname,
    extversion,
    nspname as schema
FROM pg_extension e
JOIN pg_namespace n ON e.extnamespace = n.oid
WHERE extname LIKE '%net%'
   OR extname LIKE '%http%';
