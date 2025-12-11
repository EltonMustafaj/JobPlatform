-- ============================================
-- DIAGNOSTIC: Find ALL invalid URLs
-- ============================================
-- Run these queries first to see what's broken

-- 1. Check companies with invalid URLs
SELECT 
    id, 
    company_name, 
    company_website,
    LENGTH(company_website) as url_length,
    CASE 
        WHEN company_website IS NULL THEN 'NULL'
        WHEN company_website = '' THEN 'EMPTY STRING'
        WHEN company_website ~ '^[a-zA-Z][a-zA-Z0-9+\-.]*://' THEN 'VALID (has scheme)'
        ELSE 'INVALID (missing scheme)'
    END as status
FROM public.companies 
WHERE company_website IS NOT NULL
ORDER BY status DESC, id;

-- 2. Check profiles with invalid CV URLs
SELECT 
    id, 
    full_name, 
    cv_url,
    LENGTH(cv_url) as url_length,
    CASE 
        WHEN cv_url IS NULL THEN 'NULL'
        WHEN cv_url = '' THEN 'EMPTY STRING'
        WHEN cv_url ~ '^[a-zA-Z][a-zA-Z0-9+\-.]*://' THEN 'VALID (has scheme)'
        ELSE 'INVALID (missing scheme)'
    END as status
FROM public.profiles 
WHERE cv_url IS NOT NULL
ORDER BY status DESC, id;

-- 3. Count problematic URLs
SELECT 
    'Companies with invalid URLs' as issue,
    COUNT(*) as count
FROM public.companies 
WHERE company_website IS NOT NULL 
  AND company_website <> ''
  AND company_website !~ '^[a-zA-Z][a-zA-Z0-9+\-.]*://'

UNION ALL

SELECT 
    'Profiles with invalid CV URLs' as issue,
    COUNT(*) as count
FROM public.profiles 
WHERE cv_url IS NOT NULL 
  AND cv_url <> ''
  AND cv_url !~ '^[a-zA-Z][a-zA-Z0-9+\-.]*://';

-- ============================================
-- FIX: Apply immediately (run after diagnosis)
-- ============================================

-- Fix companies table
UPDATE public.companies
SET company_website = 'https://' || TRIM(BOTH FROM company_website)
WHERE company_website IS NOT NULL
  AND company_website <> ''
  AND company_website !~ '^[a-zA-Z][a-zA-Z0-9+\-.]*://';

-- Fix profiles table
UPDATE public.profiles
SET cv_url = 'https://' || TRIM(BOTH FROM cv_url)
WHERE cv_url IS NOT NULL
  AND cv_url <> ''
  AND cv_url !~ '^[a-zA-Z][a-zA-Z0-9+\-.]*://';

-- Clean empty strings
UPDATE public.companies
SET company_website = NULL
WHERE company_website IS NOT NULL 
  AND TRIM(BOTH FROM company_website) = '';

UPDATE public.profiles
SET cv_url = NULL
WHERE cv_url IS NOT NULL 
  AND TRIM(BOTH FROM cv_url) = '';

-- ============================================
-- VERIFY FIX: Run this to confirm all fixed
-- ============================================

-- Should return 0 rows
SELECT 
    'COMPANIES' as table_name,
    id, 
    company_name, 
    company_website
FROM public.companies 
WHERE company_website IS NOT NULL 
  AND company_website <> ''
  AND company_website !~ '^[a-zA-Z][a-zA-Z0-9+\-.]*://'

UNION ALL

SELECT 
    'PROFILES' as table_name,
    id::text, 
    full_name, 
    cv_url
FROM public.profiles 
WHERE cv_url IS NOT NULL 
  AND cv_url <> ''
  AND cv_url !~ '^[a-zA-Z][a-zA-Z0-9+\-.]*://';

-- ============================================
-- FINAL STEP: Add constraints (run only once)
-- ============================================

-- Drop if exists (safe to run multiple times)
DO $$ 
BEGIN
    ALTER TABLE public.companies DROP CONSTRAINT IF EXISTS company_website_valid_url;
    ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS cv_url_valid_url;
EXCEPTION
    WHEN others THEN NULL;
END $$;

-- Add constraints
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

-- Success message
DO $$ 
BEGIN
    RAISE NOTICE '✅ All URLs have been fixed and validated!';
    RAISE NOTICE '✅ Constraints added to prevent future issues';
END $$;
