-- Fix for http_request_queue errors
-- This migration checks and cleans up pg_net/http extensions if they exist

-- Note: If you get "schema 'net' does not exist" error, that's GOOD - it means
-- the extensions are already not installed and you don't need to do anything.

-- Only run these if the extensions actually exist:
DO $$ 
BEGIN
    -- Drop pg_net extension if it exists
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_net') THEN
        DROP EXTENSION pg_net CASCADE;
        RAISE NOTICE 'pg_net extension removed';
    ELSE
        RAISE NOTICE 'pg_net extension not found - nothing to remove';
    END IF;

    -- Drop http extension if it exists
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'http') THEN
        DROP EXTENSION http CASCADE;
        RAISE NOTICE 'http extension removed';
    ELSE
        RAISE NOTICE 'http extension not found - nothing to remove';
    END IF;
END $$;

-- This is safe to run - it won't cause errors if extensions don't exist
