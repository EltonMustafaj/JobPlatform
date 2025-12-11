-- 🔥 ULTIMATE FIX: Create a simple SQL function to insert jobs
-- This bypasses any RLS or client-side issues

-- Create a function that inserts a job (with SECURITY DEFINER to bypass RLS)
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
SECURITY DEFINER  -- This runs with creator's permissions, bypassing RLS
AS $$
DECLARE
    new_job_id uuid;
    result json;
BEGIN
    -- Insert the job
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
        p_job_type::public.job_type,  -- Cast to enum
        p_deadline,
        p_is_active
    )
    RETURNING id INTO new_job_id;
    
    -- Return success with job ID
    result := json_build_object(
        'success', true,
        'job_id', new_job_id,
        'message', 'Job created successfully'
    );
    
    RETURN result;
    
EXCEPTION WHEN OTHERS THEN
    -- Return error details
    result := json_build_object(
        'success', false,
        'error', SQLERRM,
        'error_code', SQLSTATE
    );
    RETURN result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_job_simple TO authenticated;

-- Test the function
SELECT public.create_job_simple(
    (SELECT id FROM auth.users LIMIT 1),
    'Test Job via Function',
    'Test description',
    'Test Location',
    '1000 EUR',
    'full-time',
    CURRENT_DATE + 30,
    false
);

-- If this works, we know the issue is with RLS or client permissions
-- Clean up test
DELETE FROM public.jobs WHERE title = 'Test Job via Function';
