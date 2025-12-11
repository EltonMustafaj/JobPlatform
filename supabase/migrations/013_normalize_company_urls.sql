-- Normalize company website URLs to avoid invalid mobile deep links
-- Some existing rows were stored without a URL scheme (e.g. "example.com")
-- Mobile clients require a scheme (https://) or they throw "schema net does not exist" errors.

-- Update company websites missing a scheme
UPDATE public.companies
SET company_website = 'https://' || TRIM(BOTH FROM company_website)
WHERE company_website IS NOT NULL
  AND company_website <> ''
  AND company_website !~* '^[a-z][a-z0-9+\-.]*://';

-- (Optional) normalize other URL-like fields here if needed
-- Example for future use:
-- UPDATE public.profiles SET portfolio_url = 'https://' || portfolio_url WHERE ...;
