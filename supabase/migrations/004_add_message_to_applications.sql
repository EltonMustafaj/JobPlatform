-- Add message column to applications table
ALTER TABLE public.applications
ADD COLUMN IF NOT EXISTS message TEXT;
