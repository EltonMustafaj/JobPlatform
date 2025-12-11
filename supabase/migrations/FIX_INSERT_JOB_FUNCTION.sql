-- 🔥 FIX: Remove problematic casting from insert_job function
-- This fixes the "schema net does not exist" error

-- Step 1: Check if job_type enum exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'job_type') THEN
        RAISE NOTICE '✅ job_type enum exists';
    ELSE
        RAISE NOTICE '⚠️ job_type enum does NOT exist';
    END IF;
END $$;

-- Step 2: Drop and recreate insert_job function WITHOUT enum casting
DROP FUNCTION IF EXISTS public.insert_job(uuid, text, text, text, text, text, date, boolean);

CREATE OR REPLACE FUNCTION public.insert_job(
    p_employer_id uuid,
    p_title text,
    p_description text,
    p_location text,
    p_salary text,
    p_job_type text,
    p_deadline date,
    p_is_active boolean DEFAULT true
)
RETURNS TABLE (
    id uuid,
    created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Validate job_type before insert
    IF p_job_type NOT IN ('full-time', 'part-time', 'contract', 'internship') THEN
        RAISE EXCEPTION 'Invalid job_type: %. Must be one of: full-time, part-time, contract, internship', p_job_type;
    END IF;
    
    -- Insert without casting (jobs.job_type is TEXT with CHECK constraint)
    RETURN QUERY
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
        p_employer_id,
        p_title,
        p_description,
        p_location,
        p_salary,
        p_job_type,  -- NO CASTING - just plain TEXT
        p_deadline,
        p_is_active
    )
    RETURNING jobs.id, jobs.created_at;
END;
$$;

-- Step 3: Grant execute permission
GRANT EXECUTE ON FUNCTION public.insert_job TO authenticated;

-- Step 4: Also fix create_job_simple if it exists
DROP FUNCTION IF EXISTS public.create_job_simple(uuid, text, text, text, text, text, date, boolean);

CREATE OR REPLACE FUNCTION public.create_job_simple(
    p_employer_id uuid,
    p_title text,
    p_description text,
    p_location text,
    p_salary text,
    p_job_type text,
    p_deadline date,
    p_is_active boolean DEFAULT true
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_job_id uuid;
    result json;
BEGIN
    -- Validate job_type
    IF p_job_type NOT IN ('full-time', 'part-time', 'contract', 'internship') THEN
        RAISE EXCEPTION 'Invalid job_type: %', p_job_type;
    END IF;
    
    -- Insert the job WITHOUT casting
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
        p_employer_id,
        p_title,
        p_description,
        p_location,
        p_salary,
        p_job_type,  -- NO CASTING
        p_deadline,
        p_is_active
    )
    RETURNING id INTO new_job_id;
    
    -- Return success
    result := json_build_object(
        'success', true,
        'job_id', new_job_id,
        'message', 'Job created successfully'
    );
    
    RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_job_simple TO authenticated;

-- Step 5: Test the fixed function
SELECT * FROM public.insert_job(
    (SELECT id FROM auth.users LIMIT 1),
    'Test After Fix',
    'Test description',
    'Test Location',
    '1000 EUR',
    'full-time',
    CURRENT_DATE + 30,
    true
);

-- Step 6: Verify
SELECT id, title, job_type FROM public.jobs WHERE title = 'Test After Fix';

-- Cleanup
DELETE FROM public.jobs WHERE title = 'Test After Fix';

-- ✅ Done! Now try from your React Native app
