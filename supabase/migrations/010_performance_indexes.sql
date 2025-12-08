-- Performance Indexes for 30-100 concurrent users optimization
-- Run this migration to improve query performance significantly

-- Job alerts optimization - faster user queries
CREATE INDEX IF NOT EXISTS idx_job_alerts_user_created 
  ON job_alerts(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_job_alerts_user_active 
  ON job_alerts(user_id, is_active) 
  WHERE is_active = true;

-- Notifications optimization - faster unread queries
CREATE INDEX IF NOT EXISTS idx_job_notifications_user_created 
  ON job_notifications(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_job_notifications_unread 
  ON job_notifications(user_id, is_read, created_at DESC) 
  WHERE is_read = false;

-- Jobs feed optimization - faster listing and filtering
CREATE INDEX IF NOT EXISTS idx_jobs_active_created 
  ON jobs(is_active, created_at DESC) 
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_jobs_employer_active 
  ON jobs(employer_id, is_active);

CREATE INDEX IF NOT EXISTS idx_jobs_employer_created 
  ON jobs(employer_id, created_at DESC) 
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_jobs_type_location 
  ON jobs(job_type, location) 
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_jobs_work_mode 
  ON jobs(work_mode, created_at DESC) 
  WHERE is_active = true AND work_mode IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_jobs_experience_level 
  ON jobs(experience_level, created_at DESC) 
  WHERE is_active = true AND experience_level IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_jobs_salary_range 
  ON jobs(min_salary, max_salary) 
  WHERE is_active = true AND min_salary IS NOT NULL;

-- Applications optimization - faster lookup for employers and job seekers
CREATE INDEX IF NOT EXISTS idx_applications_job_applicant 
  ON applications(job_id, applicant_id);

CREATE INDEX IF NOT EXISTS idx_applications_applicant_status 
  ON applications(applicant_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_applications_job_status 
  ON applications(job_id, status, created_at DESC);

-- Profiles optimization - faster role-based queries
CREATE INDEX IF NOT EXISTS idx_profiles_role 
  ON profiles(role);

CREATE INDEX IF NOT EXISTS idx_profiles_email 
  ON profiles(email);

-- Full-text search optimization - significantly improves search performance
CREATE INDEX IF NOT EXISTS idx_jobs_title_search 
  ON jobs USING gin(to_tsvector('english', title));

CREATE INDEX IF NOT EXISTS idx_jobs_description_search 
  ON jobs USING gin(to_tsvector('english', description));
-- Full-text search optimization (optional - for future search improvements)
-- Uncomment if you want to enable full-text search on job titles/descriptions
-- CREATE INDEX IF NOT EXISTS idx_jobs_title_search 
--   ON jobs USING gin(to_tsvector('english', title));
-- 
-- CREATE INDEX IF NOT EXISTS idx_jobs_description_search 
--   ON jobs USING gin(to_tsvector('english', description));

-- Add statistics for query planner optimization
-- Add statistics for query planner optimization
ANALYZE job_alerts;
ANALYZE job_notifications;
ANALYZE jobs;
ANALYZE applications;
ANALYZE profiles;
ANALYZE saved_jobs;