-- Project health metrics table definition
-- This represents the desired state of the project_health_metrics table

CREATE TABLE project_health_metrics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  health_score INTEGER CHECK (health_score >= 0 AND health_score <= 100),
  health_indicators JSONB,
  last_scan TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_project_health_metrics_project_id ON project_health_metrics(project_id);
CREATE INDEX idx_project_health_metrics_health_score ON project_health_metrics(health_score);
CREATE INDEX idx_project_health_metrics_last_scan ON project_health_metrics(last_scan);

-- Create GIN index for JSONB health_indicators searches
CREATE INDEX idx_project_health_metrics_indicators ON project_health_metrics USING gin(health_indicators);
