-- Feedback table for storing user feedback with AI analysis
-- Created: 2025-01-28
-- Stage 2: User Feedback System

-- Create feedback table
CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  message TEXT NOT NULL,
  browser TEXT,
  url TEXT,
  sentiment TEXT,
  category TEXT,
  priority TEXT,
  summary TEXT,
  actionable BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  processed_at TIMESTAMPTZ
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_category ON feedback(category);
CREATE INDEX IF NOT EXISTS idx_feedback_priority ON feedback(priority);

-- Enable Row Level Security
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policy 1: Users can INSERT their own feedback
-- This allows users to insert feedback where user_id matches their Clerk user ID
CREATE POLICY "Users can insert their own feedback"
ON feedback FOR INSERT
WITH CHECK ((auth.jwt()->>'sub') = user_id);

-- RLS Policy 2: Admins can SELECT all feedback
-- This allows users with admin role to view all feedback
CREATE POLICY "Admins can view all feedback"
ON feedback FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = (auth.jwt()->>'sub')::uuid
    AND auth.users.raw_user_meta_data->>'role' = 'admin'
  )
);

-- RLS Policy 3: Users can SELECT their own feedback
-- This allows users to view their own feedback
CREATE POLICY "Users can view their own feedback"
ON feedback FOR SELECT
USING ((auth.jwt()->>'sub') = user_id);

-- Note: No UPDATE or DELETE policies - feedback is immutable once submitted

-- Add comments for documentation
COMMENT ON TABLE feedback IS 'Stores user feedback with AI analysis from n8n workflow';
COMMENT ON COLUMN feedback.user_id IS 'Clerk user ID (text, not UUID)';
COMMENT ON COLUMN feedback.sentiment IS 'AI-determined sentiment: positive, negative, or neutral';
COMMENT ON COLUMN feedback.category IS 'AI-determined category: bug, feature_request, question, or other';
COMMENT ON COLUMN feedback.priority IS 'AI-determined priority: low, medium, or high';
COMMENT ON COLUMN feedback.actionable IS 'Whether feedback requires action (true/false)';
COMMENT ON COLUMN feedback.created_at IS 'Timestamp when feedback was submitted';
COMMENT ON COLUMN feedback.processed_at IS 'Timestamp when AI processing completed';

