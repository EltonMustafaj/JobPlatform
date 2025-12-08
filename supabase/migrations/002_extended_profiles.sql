-- Add new columns to profiles table for job seekers
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS experience TEXT,
ADD COLUMN IF NOT EXISTS education TEXT,
ADD COLUMN IF NOT EXISTS skills TEXT,
ADD COLUMN IF NOT EXISTS cv_url TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS address TEXT;

-- Create companies table for employers
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  company_name TEXT NOT NULL,
  company_location TEXT,
  company_phone TEXT,
  company_description TEXT,
  company_website TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security for companies
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Companies policies
CREATE POLICY "Anyone can view companies"
  ON public.companies FOR SELECT
  USING (true);

CREATE POLICY "Employers can create own company"
  ON public.companies FOR INSERT
  WITH CHECK (
    auth.uid() = employer_id AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'employer'
    )
  );

CREATE POLICY "Employers can update own company"
  ON public.companies FOR UPDATE
  USING (auth.uid() = employer_id);

CREATE POLICY "Employers can delete own company"
  ON public.companies FOR DELETE
  USING (auth.uid() = employer_id);

-- Make cv_url optional in applications table
ALTER TABLE public.applications
ALTER COLUMN cv_url DROP NOT NULL;
