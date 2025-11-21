-- Migration: Create subscriptions table
-- Purpose: Store subscription data from Clerk Billing webhooks
-- Date: January 2025
-- Branch: payment-implementation

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clerk_subscription_id TEXT UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  clerk_user_id TEXT NOT NULL,
  plan_name TEXT NOT NULL,
  status TEXT NOT NULL,
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_clerk_subscription_id ON subscriptions(clerk_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_clerk_user_id ON subscriptions(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_subscriptions_updated_at();

-- Add comments for documentation
COMMENT ON TABLE subscriptions IS 'Stores subscription data from Clerk Billing webhooks';
COMMENT ON COLUMN subscriptions.clerk_subscription_id IS 'Unique Clerk subscription ID (e.g., sub_xxxxx)';
COMMENT ON COLUMN subscriptions.user_id IS 'Foreign key to users table';
COMMENT ON COLUMN subscriptions.clerk_user_id IS 'Clerk user ID for mapping to users table';
COMMENT ON COLUMN subscriptions.plan_name IS 'Plan name: starter, professional, strategic';
COMMENT ON COLUMN subscriptions.status IS 'Subscription status: active, trialing, past_due, canceled, incomplete';
COMMENT ON COLUMN subscriptions.current_period_start IS 'Start of current billing period';
COMMENT ON COLUMN subscriptions.current_period_end IS 'End of current billing period';
COMMENT ON COLUMN subscriptions.cancel_at_period_end IS 'Will cancel at period end?';
COMMENT ON COLUMN subscriptions.canceled_at IS 'Timestamp when subscription was canceled';

