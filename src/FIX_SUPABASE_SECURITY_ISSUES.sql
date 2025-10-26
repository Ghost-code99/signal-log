-- ========================================
-- 🔒 FIX SUPABASE SECURITY ISSUES
-- ========================================
-- This script addresses the 4 security issues found in Supabase dashboard
-- ========================================

-- 1. Fix Extension Schema Issues
-- Move extensions from public schema to dedicated extensions schema

-- Create extensions schema
CREATE SCHEMA IF NOT EXISTS extensions;

-- Move pg_trgm extension to extensions schema
ALTER EXTENSION IF EXISTS pg_trgm SET SCHEMA extensions;

-- Move btree_gin extension to extensions schema  
ALTER EXTENSION IF EXISTS btree_gin SET SCHEMA extensions;

-- Revoke CREATE and USAGE on public schema from PUBLIC
-- This prevents unprivileged users from creating objects in public
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
REVOKE USAGE ON SCHEMA public FROM PUBLIC;

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;

-- 2. Enable Multi-Factor Authentication (MFA)
-- This requires dashboard configuration, but we can prepare the database

-- Create a table to track MFA settings (if not exists)
CREATE TABLE IF NOT EXISTS auth.mfa_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  mfa_enabled BOOLEAN DEFAULT false,
  backup_codes TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on MFA settings table
ALTER TABLE auth.mfa_settings ENABLE ROW LEVEL SECURITY;

-- Create policy for MFA settings
CREATE POLICY "Users can manage own MFA settings" ON auth.mfa_settings
  FOR ALL USING (auth.uid() = user_id);

-- 3. Strengthen Password Policies
-- Create a function to validate password complexity
CREATE OR REPLACE FUNCTION auth.validate_password_strength(password TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check minimum length (8 characters)
  IF LENGTH(password) < 8 THEN
    RETURN FALSE;
  END IF;
  
  -- Check for at least one uppercase letter
  IF NOT password ~ '[A-Z]' THEN
    RETURN FALSE;
  END IF;
  
  -- Check for at least one lowercase letter
  IF NOT password ~ '[a-z]' THEN
    RETURN FALSE;
  END IF;
  
  -- Check for at least one number
  IF NOT password ~ '[0-9]' THEN
    RETURN FALSE;
  END IF;
  
  -- Check for at least one special character
  IF NOT password ~ '[!@#$%^&*(),.?":{}|<>]' THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Additional Security Hardening
-- Create a table to track security events
CREATE TABLE IF NOT EXISTS security_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  ip_address INET,
  user_agent TEXT,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on security events
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;

-- Create policy for security events (admin only)
CREATE POLICY "Only service role can access security events" ON security_events
  FOR ALL USING (auth.role() = 'service_role');

-- Create function to log security events
CREATE OR REPLACE FUNCTION log_security_event(
  event_type TEXT,
  user_id UUID DEFAULT NULL,
  ip_address INET DEFAULT NULL,
  user_agent TEXT DEFAULT NULL,
  details JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO security_events (event_type, user_id, ip_address, user_agent, details)
  VALUES (event_type, user_id, ip_address, user_agent, details);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Performance Optimization
-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON security_events(created_at);
CREATE INDEX IF NOT EXISTS idx_security_events_event_type ON security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_user_id ON security_events(user_id);

-- 6. Update existing RLS policies to be more secure
-- Ensure all existing policies are properly configured
-- (This assumes your existing RLS policies are already in place)

-- Add audit logging for sensitive operations
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
  -- Log the operation
  PERFORM log_security_event(
    'table_' || TG_OP,
    COALESCE(NEW.user_id, OLD.user_id),
    inet_client_addr(),
    current_setting('request.headers', true)::json->>'user-agent',
    jsonb_build_object(
      'table', TG_TABLE_NAME,
      'operation', TG_OP,
      'old_data', row_to_json(OLD),
      'new_data', row_to_json(NEW)
    )
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit trigger to sensitive tables
CREATE TRIGGER audit_users_trigger
  AFTER INSERT OR UPDATE OR DELETE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();

-- 7. Additional Security Headers and CORS
-- These are handled by your middleware.ts file, but we can add database-level security

-- Create a function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if user has admin role (you can customize this logic)
  RETURN EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = user_id 
    AND raw_user_meta_data->>'role' = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA extensions TO authenticated;
GRANT USAGE ON SCHEMA extensions TO service_role;

-- ========================================
-- ✅ SECURITY FIXES COMPLETE
-- ========================================
-- Run this script in your Supabase SQL Editor
-- Then configure MFA and password policies in the dashboard
-- ========================================
