-- Migration script to move pg_trgm extension from public schema to extensions schema
-- This script should be run in your Supabase SQL Editor

-- Step 1: Create a dedicated schema for extensions
CREATE SCHEMA IF NOT EXISTS extensions;

-- Step 2: Grant usage on the extensions schema to the public role
GRANT USAGE ON SCHEMA extensions TO public;

-- Step 3: Move the pg_trgm extension to the extensions schema
-- First, drop the extension from the public schema
DROP EXTENSION IF EXISTS pg_trgm;

-- Then create it in the extensions schema
CREATE EXTENSION IF NOT EXISTS pg_trgm SCHEMA extensions;

-- Step 4: Update the search_path to include the extensions schema
-- This ensures that functions from the extension are available without schema qualification
ALTER DATABASE postgres SET search_path TO public, extensions;

-- Step 5: Verify the extension is now in the extensions schema
SELECT 
    extname as extension_name,
    n.nspname as schema_name
FROM pg_extension e
JOIN pg_namespace n ON e.extnamespace = n.oid
WHERE extname = 'pg_trgm';

-- Success message
SELECT 'pg_trgm extension has been successfully moved to the extensions schema!' as status;
