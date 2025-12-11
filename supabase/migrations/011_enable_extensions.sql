-- Enable required extensions for Supabase Realtime
-- Note: This migration should be run manually in Supabase Dashboard SQL Editor
-- Reason: pg_net extension requires elevated permissions and can cause issues with Realtime

-- WARNING: Do NOT run this migration automatically
-- Instead, enable extensions manually via Dashboard:
-- 1. Go to Supabase Dashboard > Database > Extensions
-- 2. Search for "pg_net" and click Enable (only if needed for edge functions)
-- 3. Search for "http" and click Enable (only if needed for HTTP requests)

-- If you must run via SQL, use these commands with caution:
/*
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS http WITH SCHEMA extensions;

GRANT USAGE ON SCHEMA extensions TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA extensions TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA extensions TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA extensions TO postgres, anon, authenticated, service_role;
*/

-- Note: For this project, pg_net is NOT required since:
-- 1. We use client-side Realtime subscriptions (via supabase-js)
-- 2. We don't have any edge functions that make HTTP requests
-- 3. Enabling pg_net can cause "null value in column url" errors

-- If you're getting realtime errors, the issue is elsewhere, not missing pg_net
