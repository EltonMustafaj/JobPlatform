-- 🔥 FIX: Check and create job_type enum properly

-- Step 1: Check if job_type exists
SELECT 
    t.typname as enum_name,
    n.nspname as schema_name,
    array_agg(e.enumlabel ORDER BY e.enumsortorder) as enum_values
FROM pg_type t
JOIN pg_namespace n ON t.typnamespace = n.oid
LEFT JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname = 'job_type'
GROUP BY t.typname, n.nspname;

-- Step 2: Check jobs table column type
SELECT 
    column_name,
    data_type,
    udt_schema,
    udt_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'jobs'
  AND column_name = 'job_type';

-- Step 3: Create the enum if it doesn't exist in public schema
DO $$ 
BEGIN
    -- Drop if exists (in wrong schema)
    IF EXISTS (
        SELECT 1 FROM pg_type t
        JOIN pg_namespace n ON t.typnamespace = n.oid
        WHERE t.typname = 'job_type' AND n.nspname != 'public'
    ) THEN
        EXECUTE 'DROP TYPE IF EXISTS ' || 
            (SELECT n.nspname || '.job_type' 
             FROM pg_type t
             JOIN pg_namespace n ON t.typnamespace = n.oid
             WHERE t.typname = 'job_type' AND n.nspname != 'public'
             LIMIT 1) || ' CASCADE';
        RAISE NOTICE 'Dropped job_type from wrong schema';
    END IF;
    
    -- Create in public schema if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_type t
        JOIN pg_namespace n ON t.typnamespace = n.oid
        WHERE t.typname = 'job_type' AND n.nspname = 'public'
    ) THEN
        CREATE TYPE public.job_type AS ENUM ('full-time', 'part-time', 'contract', 'internship');
        RAISE NOTICE '✅ Created job_type enum in public schema';
    ELSE
        RAISE NOTICE 'ℹ️ job_type already exists in public schema';
    END IF;
END $$;

-- Step 4: Fix the jobs table column if needed
DO $$
DECLARE
    current_type text;
BEGIN
    SELECT udt_name INTO current_type
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'jobs'
      AND column_name = 'job_type';
    
    IF current_type = 'text' OR current_type = 'varchar' THEN
        -- Column is text, need to convert to enum
        ALTER TABLE public.jobs 
            ALTER COLUMN job_type TYPE public.job_type 
            USING job_type::public.job_type;
        RAISE NOTICE '✅ Converted job_type column to enum';
    ELSE
        RAISE NOTICE 'ℹ️ job_type column is already correct type';
    END IF;
END $$;

-- Step 5: Verify the fix
SELECT 
    t.typname as enum_name,
    n.nspname as schema_name,
    array_agg(e.enumlabel ORDER BY e.enumsortorder) as values
FROM pg_type t
JOIN pg_namespace n ON t.typnamespace = n.oid
LEFT JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname = 'job_type' AND n.nspname = 'public'
GROUP BY t.typname, n.nspname;
