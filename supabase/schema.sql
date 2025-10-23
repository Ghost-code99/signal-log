-- Signal Log Database Schema (Declarative)
-- This file represents the desired state of the entire database
-- Generated from individual schema files in supabase/schemas/

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Users table
CREATE TABLE users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects table
CREATE TABLE projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('idea', 'active', 'stalled', 'validated', 'abandoned')) DEFAULT 'idea',
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project tags table
CREATE TABLE project_tags (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  tag_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI interactions table
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

-- Ideas table
CREATE TABLE ideas (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  suggested_tags TEXT[],
  related_project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  status TEXT CHECK (status IN ('captured', 'processed', 'integrated', 'dismissed')) DEFAULT 'captured',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project health metrics table
CREATE TABLE project_health_metrics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  health_score INTEGER CHECK (health_score >= 0 AND health_score <= 100),
  health_indicators JSONB,
  last_scan TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_priority ON projects(priority);
CREATE INDEX idx_projects_last_activity ON projects(last_activity);
CREATE INDEX idx_project_tags_project_id ON project_tags(project_id);
CREATE INDEX idx_project_tags_tag_name ON project_tags(tag_name);
CREATE UNIQUE INDEX idx_project_tags_unique ON project_tags(project_id, tag_name);
CREATE INDEX idx_ai_interactions_project_id ON ai_interactions(project_id);
CREATE INDEX idx_ai_interactions_user_id ON ai_interactions(user_id);
CREATE INDEX idx_ai_interactions_type ON ai_interactions(interaction_type);
CREATE INDEX idx_ai_interactions_created_at ON ai_interactions(created_at);
CREATE INDEX idx_ai_interactions_metadata ON ai_interactions USING gin(metadata);
CREATE INDEX idx_ideas_user_id ON ideas(user_id);
CREATE INDEX idx_ideas_status ON ideas(status);
CREATE INDEX idx_ideas_created_at ON ideas(created_at);
CREATE INDEX idx_ideas_related_project ON ideas(related_project_id);
CREATE INDEX idx_ideas_suggested_tags ON ideas USING gin(suggested_tags);
CREATE INDEX idx_project_health_metrics_project_id ON project_health_metrics(project_id);
CREATE INDEX idx_project_health_metrics_health_score ON project_health_metrics(health_score);
CREATE INDEX idx_project_health_metrics_last_scan ON project_health_metrics(last_scan);
CREATE INDEX idx_project_health_metrics_indicators ON project_health_metrics USING gin(health_indicators);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at 
  BEFORE UPDATE ON projects 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_health_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own projects" ON projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" ON projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects" ON projects
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view tags for own projects" ON project_tags
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_tags.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert tags for own projects" ON project_tags
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_tags.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update tags for own projects" ON project_tags
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_tags.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete tags for own projects" ON project_tags
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_tags.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view AI interactions for own projects" ON ai_interactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = ai_interactions.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert AI interactions for own projects" ON ai_interactions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = ai_interactions.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view own ideas" ON ideas
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ideas" ON ideas
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ideas" ON ideas
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own ideas" ON ideas
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view health metrics for own projects" ON project_health_metrics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_health_metrics.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert health metrics for own projects" ON project_health_metrics
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_health_metrics.project_id 
      AND projects.user_id = auth.uid()
    )
  );