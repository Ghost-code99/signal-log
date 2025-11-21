-- Migration: Add subscription fields to users table
-- Purpose: Store subscription status and plan information from Clerk Billing
-- Date: January 2025

-- Add clerk_user_id column to link users to Clerk accounts
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS clerk_user_id TEXT;

-- Create index for clerk_user_id lookups
CREATE INDEX IF NOT EXISTS idx_users_clerk_user_id ON users(clerk_user_id);

-- Add subscription fields to users table
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS subscription_status TEXT,
  ADD COLUMN IF NOT EXISTS subscription_plan_id TEXT,
  ADD COLUMN IF NOT EXISTS subscription_id TEXT, -- Clerk subscription ID (e.g., 'sub_xxxxx')
  ADD COLUMN IF NOT EXISTS subscription_features TEXT[], -- Array of feature keys
  ADD COLUMN IF NOT EXISTS subscription_current_period_start TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS subscription_current_period_end TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS subscription_trial_end TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS subscription_cancel_at_period_end BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS subscription_updated_at TIMESTAMPTZ DEFAULT now();

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON users(subscription_status);
CREATE INDEX IF NOT EXISTS idx_users_subscription_plan_id ON users(subscription_plan_id);
CREATE INDEX IF NOT EXISTS idx_users_subscription_id ON users(subscription_id);

-- Add comments for documentation
COMMENT ON COLUMN users.clerk_user_id IS 'Clerk user ID to link users to Clerk accounts';
COMMENT ON COLUMN users.subscription_status IS 'Subscription status: active, trialing, past_due, canceled, incomplete, or NULL';
COMMENT ON COLUMN users.subscription_plan_id IS 'Plan ID: starter, professional, strategic, or NULL';
COMMENT ON COLUMN users.subscription_id IS 'Clerk subscription ID (e.g., sub_xxxxx)';
COMMENT ON COLUMN users.subscription_features IS 'Array of feature keys user has access to';
COMMENT ON COLUMN users.subscription_current_period_start IS 'Start of current billing period';
COMMENT ON COLUMN users.subscription_current_period_end IS 'End of current billing period';
COMMENT ON COLUMN users.subscription_trial_end IS 'End of trial period (if applicable)';
COMMENT ON COLUMN users.subscription_cancel_at_period_end IS 'Will cancel at period end?';
COMMENT ON COLUMN users.subscription_updated_at IS 'Last time subscription was updated';

-- Create function to update subscription_updated_at timestamp
CREATE OR REPLACE FUNCTION update_subscription_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.subscription_updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update subscription_updated_at
CREATE TRIGGER update_users_subscription_updated_at
  BEFORE UPDATE OF subscription_status, subscription_plan_id, subscription_id, subscription_features,
                     subscription_current_period_start, subscription_current_period_end,
                     subscription_trial_end, subscription_cancel_at_period_end
  ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_subscription_updated_at();

