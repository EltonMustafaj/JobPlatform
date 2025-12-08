-- Migration 007: Advanced Filters - Work Mode, Salary, Experience Level

-- Add new columns to jobs table for advanced filtering
ALTER TABLE public.jobs
ADD COLUMN IF NOT EXISTS work_mode TEXT CHECK (work_mode IN ('remote', 'hybrid', 'onsite')) DEFAULT 'onsite',
ADD COLUMN IF NOT EXISTS experience_level TEXT CHECK (experience_level IN ('entry', 'mid', 'senior', 'executive')) DEFAULT 'mid',
ADD COLUMN IF NOT EXISTS min_salary INTEGER,
ADD COLUMN IF NOT EXISTS max_salary INTEGER,
ADD COLUMN IF NOT EXISTS salary_currency TEXT DEFAULT 'EUR';

-- Add indexes for filter performance
CREATE INDEX IF NOT EXISTS idx_jobs_work_mode ON public.jobs(work_mode);
CREATE INDEX IF NOT EXISTS idx_jobs_experience_level ON public.jobs(experience_level);
CREATE INDEX IF NOT EXISTS idx_jobs_salary ON public.jobs(min_salary, max_salary);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON public.jobs(created_at DESC);

-- Add job_type index if not exists
CREATE INDEX IF NOT EXISTS idx_jobs_job_type ON public.jobs(job_type);
CREATE INDEX IF NOT EXISTS idx_jobs_location ON public.jobs(location);
