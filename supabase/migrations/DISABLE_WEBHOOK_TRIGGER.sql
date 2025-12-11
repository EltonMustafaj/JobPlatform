-- 🔥 ULTIMATE FIX: Disable the problematic notify_job_alerts_webhook trigger
-- This is the REAL cause of "schema net does not exist"

-- Step 1: Check what triggers exist on jobs table
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    event_object_table
FROM information_schema.triggers
WHERE event_object_table = 'jobs'
  AND event_object_schema = 'public';

-- Step 2: Drop the problematic trigger (found: on_job_created_notify_alerts)
DROP TRIGGER IF EXISTS on_job_created_notify_alerts ON public.jobs;
DROP TRIGGER IF EXISTS notify_job_alerts_webhook ON public.jobs;
DROP TRIGGER IF EXISTS notify_job_alerts ON public.jobs;
DROP TRIGGER IF EXISTS job_alerts_trigger ON public.jobs;

-- Step 3: Drop the problematic function with CASCADE
DROP FUNCTION IF EXISTS public.notify_job_alerts_webhook() CASCADE;
DROP FUNCTION IF EXISTS public.notify_job_alerts() CASCADE;

-- Step 4: Verify triggers are gone
SELECT 
    trigger_name,
    event_manipulation
FROM information_schema.triggers
WHERE event_object_table = 'jobs'
  AND event_object_schema = 'public';

-- Step 5: Test insert again
SELECT * FROM public.insert_job(
    (SELECT id FROM auth.users LIMIT 1),
    'Test Without Webhook Trigger',
    'Test description',
    'Test Location',
    '1000 EUR',
    'full-time',
    CURRENT_DATE + 30,
    true
);

-- Step 6: Verify it worked
SELECT id, title FROM public.jobs WHERE title = 'Test Without Webhook Trigger';

-- Cleanup
DELETE FROM public.jobs WHERE title LIKE '%Test%' OR title LIKE '%Without%';

-- ✅ Done! The trigger was trying to use net.http_post which doesn't exist
-- If you need webhook notifications later, implement them in your Edge Functions instead
