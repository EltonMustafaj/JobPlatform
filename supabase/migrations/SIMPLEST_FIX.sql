-- 🎯 SIMPLEST FIX: Keep job_type as TEXT (no enum needed!)
-- This avoids all enum casting issues

-- Step 1: Convert job_type column to TEXT permanently
ALTER TABLE public.jobs 
    ALTER COLUMN job_type TYPE text;

-- Step 2: Add a check constraint to ensure valid values
ALTER TABLE public.jobs
    DROP CONSTRAINT IF EXISTS job_type_valid_values;

ALTER TABLE public.jobs
    ADD CONSTRAINT job_type_valid_values 
    CHECK (job_type IN ('full-time', 'part-time', 'contract', 'internship'));

-- Step 3: Create simplified insert function (no casting needed!)
DROP FUNCTION IF EXISTS public.create_job_simple;
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
        p_job_type,  -- No casting needed!
        p_deadline,
        p_is_active
    )
    RETURNING jobs.id, jobs.created_at;
END;
$$;

GRANT EXECUTE ON FUNCTION public.insert_job TO authenticated;

-- Step 4: Test the function
SELECT * FROM public.insert_job(
    (SELECT id FROM auth.users LIMIT 1),
    'Test Job SIMPLE',
    'Test description',
    'Test Location',
    '1000 EUR',
    'full-time',
    CURRENT_DATE + 30,
    false
);

-- Step 5: Verify it worked
SELECT id, title, job_type FROM public.jobs WHERE title = 'Test Job SIMPLE';

-- Cleanup
DELETE FROM public.jobs WHERE title LIKE 'Test Job%';

-- Done! Now try from your app
