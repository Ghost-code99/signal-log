-- Database Monitoring and Analytics Functions
-- These functions support the monitoring and performance optimization features

-- Function to get query performance metrics
CREATE OR REPLACE FUNCTION get_query_performance()
RETURNS TABLE (
  query TEXT,
  avg_duration NUMERIC,
  call_count BIGINT,
  last_executed TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  -- This would typically query pg_stat_statements
  -- For now, return empty result as pg_stat_statements may not be enabled
  RETURN QUERY
  SELECT 
    'SELECT * FROM projects'::TEXT as query,
    100.0::NUMERIC as avg_duration,
    10::BIGINT as call_count,
    NOW() as last_executed
  WHERE FALSE; -- Return empty result for now
END;
$$ LANGUAGE plpgsql;

-- Function to get table sizes
CREATE OR REPLACE FUNCTION get_table_sizes()
RETURNS TABLE (
  table_name TEXT,
  row_count BIGINT,
  size_bytes BIGINT,
  last_analyzed TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    schemaname||'.'||tablename as table_name,
    n_tup_ins + n_tup_upd + n_tup_del as row_count,
    pg_total_relation_size(schemaname||'.'||tablename) as size_bytes,
    last_analyze as last_analyzed
  FROM pg_stat_user_tables
  WHERE schemaname = 'public'
  ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get index usage statistics
CREATE OR REPLACE FUNCTION get_index_usage()
RETURNS TABLE (
  index_name TEXT,
  table_name TEXT,
  usage_count BIGINT,
  effectiveness NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    indexrelname::TEXT as index_name,
    schemaname||'.'||relname as table_name,
    idx_scan as usage_count,
    CASE 
      WHEN idx_scan = 0 THEN 0.0
      ELSE (idx_scan::NUMERIC / (idx_scan + idx_tup_read + idx_tup_fetch))
    END as effectiveness
  FROM pg_stat_user_indexes
  WHERE schemaname = 'public'
  ORDER BY idx_scan DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get RLS policy effectiveness
CREATE OR REPLACE FUNCTION get_rls_effectiveness()
RETURNS TABLE (
  table_name TEXT,
  policy_name TEXT,
  block_count BIGINT,
  allow_count BIGINT,
  effectiveness NUMERIC
) AS $$
BEGIN
  -- This is a simplified version - in production, you'd need to track RLS policy hits
  RETURN QUERY
  SELECT 
    'projects'::TEXT as table_name,
    'Users can view own projects'::TEXT as policy_name,
    0::BIGINT as block_count,
    100::BIGINT as allow_count,
    1.0::NUMERIC as effectiveness
  WHERE FALSE; -- Return empty result for now
END;
$$ LANGUAGE plpgsql;

-- Function to get connection count
CREATE OR REPLACE FUNCTION get_connection_count()
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT count(*)::INTEGER 
    FROM pg_stat_activity 
    WHERE state = 'active'
  );
END;
$$ LANGUAGE plpgsql;

-- Function to execute SQL with error handling
CREATE OR REPLACE FUNCTION execute_sql(sql_text TEXT)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  -- This is a simplified version - in production, you'd need proper SQL execution
  -- For security reasons, this function should be restricted to specific operations
  RETURN json_build_object(
    'success', true,
    'message', 'SQL execution simulated'
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql;

-- Function to execute validation queries
CREATE OR REPLACE FUNCTION execute_validation(query_text TEXT)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  -- This would execute the validation query and return results
  -- For now, return a mock result
  RETURN json_build_object(
    'valid', true,
    'count', 0
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'valid', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql;

-- Function to explain query execution
CREATE OR REPLACE FUNCTION explain_query(query_text TEXT)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  -- This would return query execution plan
  -- For now, return a mock result
  RETURN json_build_object(
    'plan', 'Mock execution plan',
    'cost', 100.0,
    'rows', 1000
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql;

-- Create security events table for audit logging
CREATE TABLE IF NOT EXISTS security_events (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  severity TEXT NOT NULL,
  user_id UUID REFERENCES users(id),
  ip_address INET,
  user_agent TEXT,
  resource TEXT NOT NULL,
  action TEXT NOT NULL,
  details JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved BOOLEAN DEFAULT FALSE
);

-- Create indexes for security events
CREATE INDEX IF NOT EXISTS idx_security_events_type ON security_events(type);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON security_events(severity);
CREATE INDEX IF NOT EXISTS idx_security_events_user_id ON security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_timestamp ON security_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_security_events_resolved ON security_events(resolved);

-- Enable RLS on security events
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for security events (admin only)
CREATE POLICY "Admin can view security events" ON security_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.email LIKE '%@admin%'
    )
  );

-- Create performance metrics table
CREATE TABLE IF NOT EXISTS performance_metrics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  metric_unit TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB
);

-- Create indexes for performance metrics
CREATE INDEX IF NOT EXISTS idx_performance_metrics_name ON performance_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_timestamp ON performance_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_value ON performance_metrics(metric_value);

-- Enable RLS on performance metrics
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for performance metrics
CREATE POLICY "Users can view performance metrics" ON performance_metrics
  FOR SELECT USING (true);

-- Function to record performance metrics
CREATE OR REPLACE FUNCTION record_performance_metric(
  metric_name TEXT,
  metric_value NUMERIC,
  metric_unit TEXT DEFAULT NULL,
  metadata JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  metric_id UUID;
BEGIN
  INSERT INTO performance_metrics (metric_name, metric_value, metric_unit, metadata)
  VALUES (metric_name, metric_value, metric_unit, metadata)
  RETURNING id INTO metric_id;
  
  RETURN metric_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get performance metrics
CREATE OR REPLACE FUNCTION get_performance_metrics(
  metric_name_filter TEXT DEFAULT NULL,
  hours_back INTEGER DEFAULT 24
)
RETURNS TABLE (
  metric_name TEXT,
  avg_value NUMERIC,
  max_value NUMERIC,
  min_value NUMERIC,
  sample_count BIGINT,
  latest_timestamp TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pm.metric_name,
    AVG(pm.metric_value) as avg_value,
    MAX(pm.metric_value) as max_value,
    MIN(pm.metric_value) as min_value,
    COUNT(*) as sample_count,
    MAX(pm.timestamp) as latest_timestamp
  FROM performance_metrics pm
  WHERE pm.timestamp >= NOW() - INTERVAL '1 hour' * hours_back
    AND (metric_name_filter IS NULL OR pm.metric_name = metric_name_filter)
  GROUP BY pm.metric_name
  ORDER BY pm.metric_name;
END;
$$ LANGUAGE plpgsql;

-- Create migration history table
CREATE TABLE IF NOT EXISTS migration_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  migration_id TEXT NOT NULL,
  migration_name TEXT NOT NULL,
  version TEXT NOT NULL,
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  executed_by UUID REFERENCES users(id),
  status TEXT NOT NULL,
  duration_ms INTEGER,
  error_message TEXT,
  checksum TEXT
);

-- Create indexes for migration history
CREATE INDEX IF NOT EXISTS idx_migration_history_migration_id ON migration_history(migration_id);
CREATE INDEX IF NOT EXISTS idx_migration_history_executed_at ON migration_history(executed_at);
CREATE INDEX IF NOT EXISTS idx_migration_history_status ON migration_history(status);

-- Enable RLS on migration history
ALTER TABLE migration_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for migration history (admin only)
CREATE POLICY "Admin can view migration history" ON migration_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.email LIKE '%@admin%'
    )
  );

-- Function to record migration execution
CREATE OR REPLACE FUNCTION record_migration_execution(
  migration_id TEXT,
  migration_name TEXT,
  version TEXT,
  status TEXT,
  duration_ms INTEGER DEFAULT NULL,
  error_message TEXT DEFAULT NULL,
  checksum TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  history_id UUID;
BEGIN
  INSERT INTO migration_history (
    migration_id, migration_name, version, status, 
    duration_ms, error_message, checksum
  )
  VALUES (
    migration_id, migration_name, version, status,
    duration_ms, error_message, checksum
  )
  RETURNING id INTO history_id;
  
  RETURN history_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get migration history
CREATE OR REPLACE FUNCTION get_migration_history()
RETURNS TABLE (
  migration_id TEXT,
  migration_name TEXT,
  version TEXT,
  executed_at TIMESTAMP WITH TIME ZONE,
  status TEXT,
  duration_ms INTEGER,
  error_message TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    mh.migration_id,
    mh.migration_name,
    mh.version,
    mh.executed_at,
    mh.status,
    mh.duration_ms,
    mh.error_message
  FROM migration_history mh
  ORDER BY mh.executed_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Create backup history table
CREATE TABLE IF NOT EXISTS backup_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  backup_id TEXT NOT NULL,
  backup_name TEXT NOT NULL,
  backup_type TEXT NOT NULL,
  size_bytes BIGINT,
  status TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES users(id),
  metadata JSONB
);

-- Create indexes for backup history
CREATE INDEX IF NOT EXISTS idx_backup_history_backup_id ON backup_history(backup_id);
CREATE INDEX IF NOT EXISTS idx_backup_history_created_at ON backup_history(created_at);
CREATE INDEX IF NOT EXISTS idx_backup_history_status ON backup_history(status);

-- Enable RLS on backup history
ALTER TABLE backup_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for backup history (admin only)
CREATE POLICY "Admin can view backup history" ON backup_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.email LIKE '%@admin%'
    )
  );

-- Function to record backup execution
CREATE OR REPLACE FUNCTION record_backup_execution(
  backup_id TEXT,
  backup_name TEXT,
  backup_type TEXT,
  size_bytes BIGINT,
  status TEXT,
  metadata JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  backup_history_id UUID;
BEGIN
  INSERT INTO backup_history (
    backup_id, backup_name, backup_type, size_bytes, status, metadata
  )
  VALUES (
    backup_id, backup_name, backup_type, size_bytes, status, metadata
  )
  RETURNING id INTO backup_history_id;
  
  RETURN backup_history_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get backup history
CREATE OR REPLACE FUNCTION get_backup_history()
RETURNS TABLE (
  backup_id TEXT,
  backup_name TEXT,
  backup_type TEXT,
  size_bytes BIGINT,
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    bh.backup_id,
    bh.backup_name,
    bh.backup_type,
    bh.size_bytes,
    bh.status,
    bh.created_at,
    bh.completed_at
  FROM backup_history bh
  ORDER BY bh.created_at DESC;
END;
$$ LANGUAGE plpgsql;
