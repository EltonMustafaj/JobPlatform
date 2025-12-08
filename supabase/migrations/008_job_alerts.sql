-- Migration 008: Job Alerts System

-- Create job_alerts table
CREATE TABLE IF NOT EXISTS public.job_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  alert_name TEXT NOT NULL,
  search_query TEXT,
  job_type TEXT,
  location TEXT,
  work_mode TEXT,
  experience_level TEXT,
  min_salary INTEGER,
  frequency TEXT CHECK (frequency IN ('instant', 'daily', 'weekly')) DEFAULT 'daily',
  is_active BOOLEAN DEFAULT true,
  last_sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.job_alerts ENABLE ROW LEVEL SECURITY;

-- Job alerts policies
CREATE POLICY "Users can view own alerts"
  ON public.job_alerts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own alerts"
  ON public.job_alerts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own alerts"
  ON public.job_alerts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own alerts"
  ON public.job_alerts FOR DELETE
  USING (auth.uid() = user_id);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_job_alerts_user_id ON public.job_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_job_alerts_active ON public.job_alerts(is_active);
