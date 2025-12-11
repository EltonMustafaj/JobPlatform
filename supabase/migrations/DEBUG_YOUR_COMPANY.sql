-- 🔍 DEBUG: Find YOUR company's URL
-- Run this to see if YOUR company has an invalid URL

-- Replace 'your-email@example.com' with YOUR actual email
SELECT 
    c.id as company_id,
    c.company_name,
    c.company_website,
    c.company_website ~ '^[a-zA-Z][a-zA-Z0-9+\-.]*://' as has_valid_scheme,
    CASE 
        WHEN c.company_website IS NULL THEN '✅ NULL (OK)'
        WHEN c.company_website = '' THEN '✅ EMPTY (OK)'
        WHEN c.company_website ~ '^[a-zA-Z][a-zA-Z0-9+\-.]*://' THEN '✅ VALID (has scheme)'
        ELSE '❌ INVALID (missing https://)'
    END as status,
    u.email as employer_email,
    p.full_name as employer_name
FROM public.companies c
JOIN auth.users u ON c.employer_id = u.id
LEFT JOIN public.profiles p ON c.employer_id = p.id
WHERE u.email = 'YOUR-EMAIL-HERE@example.com';  -- ⚠️ CHANGE THIS!

-- Or find ALL companies with issues:
SELECT 
    c.id,
    c.company_name,
    c.company_website,
    u.email
FROM public.companies c
JOIN auth.users u ON c.employer_id = u.id
WHERE c.company_website IS NOT NULL 
  AND c.company_website <> ''
  AND c.company_website !~ '^[a-zA-Z][a-zA-Z0-9+\-.]*://';

-- If the above query returns YOUR company, run this fix:
-- UPDATE public.companies
-- SET company_website = 'https://' || company_website
-- WHERE id = 'YOUR-COMPANY-ID-HERE'
--   AND company_website !~ '^[a-zA-Z][a-zA-Z0-9+\-.]*://';
