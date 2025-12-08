-- Add headline column to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS headline TEXT;
