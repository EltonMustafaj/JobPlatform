-- Add new columns to companies table
ALTER TABLE public.companies
ADD COLUMN IF NOT EXISTS industry TEXT,
ADD COLUMN IF NOT EXISTS employee_count TEXT,
ADD COLUMN IF NOT EXISTS founded_year TEXT;
