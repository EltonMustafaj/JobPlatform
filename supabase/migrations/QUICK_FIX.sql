-- ⚡ ONE-CLICK FIX: Copy entire file and run in Supabase SQL Editor
-- This fixes ALL invalid URLs immediately

-- Step 1: Fix companies (add https:// to URLs without scheme)
UPDATE public.companies
SET company_website = 
    CASE 
        WHEN company_website IS NULL THEN NULL
        WHEN TRIM(BOTH FROM company_website) = '' THEN NULL
        WHEN company_website ~ '^[a-zA-Z][a-zA-Z0-9+\-.]*://' THEN company_website
        ELSE 'https://' || TRIM(BOTH FROM company_website)
    END;

-- Step 2: Fix profiles (add https:// to CV URLs without scheme)
UPDATE public.profiles
SET cv_url = 
    CASE 
        WHEN cv_url IS NULL THEN NULL
        WHEN TRIM(BOTH FROM cv_url) = '' THEN NULL
        WHEN cv_url ~ '^[a-zA-Z][a-zA-Z0-9+\-.]*://' THEN cv_url
        ELSE 'https://' || TRIM(BOTH FROM cv_url)
    END;

-- Verify: This should return 0 invalid URLs
SELECT 
    'Invalid Companies' as check_type,
    COUNT(*) as count
FROM public.companies 
WHERE company_website IS NOT NULL 
  AND company_website <> ''
  AND company_website !~ '^[a-zA-Z][a-zA-Z0-9+\-.]*://'

UNION ALL

SELECT 
    'Invalid Profiles',
    COUNT(*)
FROM public.profiles 
WHERE cv_url IS NOT NULL 
  AND cv_url <> ''
  AND cv_url !~ '^[a-zA-Z][a-zA-Z0-9+\-.]*://';

-- Success message
DO $$ 
BEGIN
    RAISE NOTICE '✅ All URLs fixed! Run "npm start" and test again.';
END $$;
