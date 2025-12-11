-- 🔍 Find ALL triggers and what they do

-- Check ALL triggers on jobs table
SELECT 
    tgname as trigger_name,
    tgtype,
    tgenabled,
    pg_get_triggerdef(oid) as trigger_definition
FROM pg_trigger
WHERE tgrelid = 'public.jobs'::regclass
  AND tgisinternal = false;

-- Check if there are any rules on jobs table
SELECT 
    rulename,
    ev_type,
    pg_get_ruledef(oid) as rule_definition
FROM pg_rewrite
WHERE ev_class = 'public.jobs'::regclass
  AND rulename != '_RETURN';

-- Check for policies that might cause issues
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'jobs';

-- DISABLE ALL TRIGGERS temporarily to test
ALTER TABLE public.jobs DISABLE TRIGGER ALL;

-- Try inserting again with RPC
SELECT * FROM public.insert_job(
    (SELECT id FROM auth.users LIMIT 1),
    'Test After Disable Triggers',
    'Test',
    'Test',
    '1000',
    'full-time',
    CURRENT_DATE + 30,
    false
);

-- Check if it worked
SELECT id, title FROM public.jobs WHERE title = 'Test After Disable Triggers';

-- RE-ENABLE triggers
ALTER TABLE public.jobs ENABLE TRIGGER ALL;

-- Cleanup
DELETE FROM public.jobs WHERE title LIKE 'Test%';
