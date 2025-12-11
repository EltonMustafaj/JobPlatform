-- 🔥 NUCLEAR OPTION: Disable Realtime on jobs table temporarily

-- Step 1: Check current realtime settings
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'jobs';

-- Step 2: Check if realtime publication exists
SELECT 
    pubname,
    puballtables,
    pubinsert,
    pubupdate,
    pubdelete
FROM pg_publication
WHERE pubname = 'supabase_realtime';

-- Step 3: Check which tables are in realtime
SELECT 
    schemaname,
    tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
  AND schemaname = 'public';

-- Step 4: Remove jobs table from realtime (THIS MIGHT FIX IT!)
-- Only drop if it exists in the publication
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'jobs'
    ) THEN
        ALTER PUBLICATION supabase_realtime DROP TABLE public.jobs;
        RAISE NOTICE 'Removed jobs table from supabase_realtime publication';
    ELSE
        RAISE NOTICE 'Jobs table is not in supabase_realtime publication (already removed or never added)';
    END IF;
END $$;

-- Step 5: Test insert again
SELECT * FROM public.insert_job(
    (SELECT id FROM auth.users LIMIT 1),
    'Test Without Realtime',
    'Test',
    'Test',
    '1000',
    'full-time',
    CURRENT_DATE + 30,
    false
);

-- Step 6: Check if it worked
SELECT id, title FROM public.jobs WHERE title = 'Test Without Realtime';

-- Step 7: If it worked, you can re-add realtime (optional)
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.jobs;

-- Cleanup
DELETE FROM public.jobs WHERE title LIKE 'Test%';
