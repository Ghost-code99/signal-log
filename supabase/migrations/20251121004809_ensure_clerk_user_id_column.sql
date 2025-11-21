-- Migration: Ensure clerk_user_id column exists in users table
-- Purpose: Add clerk_user_id column if it doesn't exist (for mapping Clerk users to database users)
-- Date: January 2025
-- Branch: payment-implementation

-- Add clerk_user_id column if it doesn't exist
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS clerk_user_id TEXT;

-- Create index for clerk_user_id lookups if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_users_clerk_user_id ON users(clerk_user_id);

-- Add comment for documentation
COMMENT ON COLUMN users.clerk_user_id IS 'Clerk user ID to link users to Clerk accounts for subscription mapping';

