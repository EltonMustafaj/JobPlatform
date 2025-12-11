-- 🔥 FINAL FIX: Handle job_type enum properly

-- Step 1: Check current state
SELECT 
    column_name,
    data_type,
    udt_schema,
    udt_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'jobs'
  AND column_name = 'job_type';

-- Step 2: Check all job_type enums in all schemas
SELECT 
    t.typname as enum_name,
    n.nspname as schema_name,
    array_agg(e.enumlabel ORDER BY e.enumsortorder) as values
FROM pg_type t
JOIN pg_namespace n ON t.typnamespace = n.oid
LEFT JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname = 'job_type'
GROUP BY t.typname, n.nspname;

-- Step 3: FIX - Convert column to text first, then to correct enum
DO $$
BEGIN
    -- First convert to text (this always works)
    ALTER TABLE public.jobs 
        ALTER COLUMN job_type TYPE text;
    
    RAISE NOTICE '✅ Step 1: Converted to text';
    
    -- Ensure public.job_type enum exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_type t
        JOIN pg_namespace n ON t.typnamespace = n.oid
        WHERE t.typname = 'job_type' AND n.nspname = 'public'
    ) THEN
        CREATE TYPE public.job_type AS ENUM ('full-time', 'part-time', 'contract', 'internship');
        RAISE NOTICE '✅ Step 2: Created public.job_type enum';
    ELSE
        RAISE NOTICE 'ℹ️ Step 2: public.job_type already exists';
    END IF;
    
    -- Now convert text to enum (with explicit cast)
    ALTER TABLE public.jobs 
        ALTER COLUMN job_type TYPE public.job_type 
        USING job_type::text::public.job_type;
    
    RAISE NOTICE '✅ Step 3: Converted to public.job_type enum';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ Error: % (Code: %)', SQLERRM, SQLSTATE;
    RAISE;
END $$;

-- Step 4: Update the function to not cast
DROP FUNCTION IF EXISTS public.create_job_simple;
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
        p_job_type::public.job_type,  -- Now this will work
        p_deadline,
        p_is_active
    )
    RETURNING id INTO new_job_id;
    
    result := json_build_object(
        'success', true,
        'job_id', new_job_id,
        'message', 'Job created successfully'
    );
    
    RETURN result;
    
EXCEPTION WHEN OTHERS THEN
    result := json_build_object(
        'success', false,
        'error', SQLERRM,
        'error_code', SQLSTATE
    );
    RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_job_simple TO authenticated;

-- Step 5: Test again
SELECT public.create_job_simple(
    (SELECT id FROM auth.users LIMIT 1),
    'Test Job FINAL',
    'Test description',
    'Test Location',
    '1000 EUR',
    'full-time',
    CURRENT_DATE + 30,
    false
);

-- Cleanup
DELETE FROM public.jobs WHERE title LIKE 'Test Job%';
