-- AI interactions table definition
-- This represents the desired state of the ai_interactions table

CREATE TABLE ai_interactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  interaction_type TEXT CHECK (interaction_type IN ('health_scan', 'assumption_challenge', 'strategy_analysis', 'experiment_generated')) NOT NULL,
  content TEXT NOT NULL,
  ai_response TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_ai_interactions_project_id ON ai_interactions(project_id);
CREATE INDEX idx_ai_interactions_user_id ON ai_interactions(user_id);
CREATE INDEX idx_ai_interactions_type ON ai_interactions(interaction_type);
CREATE INDEX idx_ai_interactions_created_at ON ai_interactions(created_at);

-- Create GIN index for JSONB metadata searches
CREATE INDEX idx_ai_interactions_metadata ON ai_interactions USING gin(metadata);
