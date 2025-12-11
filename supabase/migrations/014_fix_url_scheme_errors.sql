-- Fix "schema net does not exist" errors caused by invalid URL schemes
-- This migration ensures all URL fields in the database have proper schemes (https://)
-- and adds database-level validation to prevent future invalid URLs

-- ========================================
-- PART 1: Clean up existing URLs
-- ========================================

-- 1. Fix company_website URLs without schemes
UPDATE public.companies
SET company_website = 'https://' || TRIM(BOTH FROM company_website)
WHERE company_website IS NOT NULL
  AND company_website <> ''
  AND company_website !~ '^[a-zA-Z][a-zA-Z0-9+\-.]*://';

-- 2. Fix profile CV URLs without schemes (if any exist)
UPDATE public.profiles
SET cv_url = 'https://' || TRIM(BOTH FROM cv_url)
WHERE cv_url IS NOT NULL
  AND cv_url <> ''
  AND cv_url !~ '^[a-zA-Z][a-zA-Z0-9+\-.]*://';

-- 3. Remove any completely invalid URLs (empty strings, whitespace-only)
UPDATE public.companies
SET company_website = NULL
WHERE company_website IS NOT NULL 
  AND TRIM(BOTH FROM company_website) = '';

UPDATE public.profiles
SET cv_url = NULL
WHERE cv_url IS NOT NULL 
  AND TRIM(BOTH FROM cv_url) = '';

-- ========================================
-- PART 2: Add validation constraints
-- ========================================

-- Drop existing constraints if they exist (idempotent)
DO $$ 
BEGIN
    ALTER TABLE public.companies 
        DROP CONSTRAINT IF EXISTS company_website_valid_url;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

DO $$ 
BEGIN
    ALTER TABLE public.profiles 
        DROP CONSTRAINT IF EXISTS cv_url_valid_url;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

-- Add check constraints to ensure URLs have valid schemes
-- This prevents saving URLs without schemes that would cause "schema net does not exist" errors
ALTER TABLE public.companies
ADD CONSTRAINT company_website_valid_url 
CHECK (
    company_website IS NULL 
    OR company_website = '' 
    OR company_website ~ '^[a-zA-Z][a-zA-Z0-9+\-.]*://'
);

ALTER TABLE public.profiles
ADD CONSTRAINT cv_url_valid_url 
CHECK (
    cv_url IS NULL 
    OR cv_url = '' 
    OR cv_url ~ '^[a-zA-Z][a-zA-Z0-9+\-.]*://'
);

-- ========================================
-- PART 3: Create helper function (optional)
-- ========================================

-- Create a reusable function to normalize URLs at the database level
-- This can be used in triggers if needed in the future
CREATE OR REPLACE FUNCTION public.normalize_url(input_url TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
    -- Return NULL for empty/null input
    IF input_url IS NULL OR TRIM(input_url) = '' THEN
        RETURN NULL;
    END IF;
    
    -- If URL already has a scheme, return as-is
    IF input_url ~ '^[a-zA-Z][a-zA-Z0-9+\-.]*://' THEN
        RETURN input_url;
    END IF;
    
    -- Otherwise, prepend https://
    RETURN 'https://' || TRIM(input_url);
END;
$$;

-- Add comment for documentation
COMMENT ON FUNCTION public.normalize_url(TEXT) IS 
'Normalizes URLs by ensuring they have a valid scheme (adds https:// if missing). 
Prevents "schema net does not exist" errors in React Native Linking API.';

-- ========================================
-- VERIFICATION QUERIES (run these manually to check)
-- ========================================

-- Check for any remaining invalid URLs in companies table:
-- SELECT id, company_name, company_website 
-- FROM public.companies 
-- WHERE company_website IS NOT NULL 
--   AND company_website <> ''
--   AND company_website !~ '^[a-zA-Z][a-zA-Z0-9+\-.]*://';

-- Check for any remaining invalid URLs in profiles table:
-- SELECT id, full_name, cv_url 
-- FROM public.profiles 
-- WHERE cv_url IS NOT NULL 
--   AND cv_url <> ''
--   AND cv_url !~ '^[a-zA-Z][a-zA-Z0-9+\-.]*://';

-- Test the normalize_url function:
-- SELECT 
--   normalize_url('example.com') as test1,          -- Should return 'https://example.com'
--   normalize_url('http://example.com') as test2,   -- Should return 'http://example.com'
--   normalize_url('https://example.com') as test3,  -- Should return 'https://example.com'
--   normalize_url('') as test4,                     -- Should return NULL
--   normalize_url(NULL) as test5;                   -- Should return NULL
