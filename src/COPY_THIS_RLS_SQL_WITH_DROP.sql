-- ========================================
-- 🔒 FIX FOR "policy already exists" ERROR
-- ========================================
-- This version drops existing policies first
-- ========================================

-- STEP 1: Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

DROP POLICY IF EXISTS "Users can view own projects" ON projects;
DROP POLICY IF EXISTS "Users can insert own projects" ON projects;
DROP POLICY IF EXISTS "Users can update own projects" ON projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON projects;

DROP POLICY IF EXISTS "Users can view tags for own projects" ON project_tags;
DROP POLICY IF EXISTS "Users can insert tags for own projects" ON project_tags;
DROP POLICY IF EXISTS "Users can update tags for own projects" ON project_tags;
DROP POLICY IF EXISTS "Users can delete tags for own projects" ON project_tags;

DROP POLICY IF EXISTS "Users can view AI interactions for own projects" ON ai_interactions;
DROP POLICY IF EXISTS "Users can insert AI interactions for own projects" ON ai_interactions;

DROP POLICY IF EXISTS "Users can view own ideas" ON ideas;
DROP POLICY IF EXISTS "Users can insert own ideas" ON ideas;
DROP POLICY IF EXISTS "Users can update own ideas" ON ideas;
DROP POLICY IF EXISTS "Users can delete own ideas" ON ideas;

DROP POLICY IF EXISTS "Users can view health metrics for own projects" ON project_health_metrics;
DROP POLICY IF EXISTS "Users can insert health metrics for own projects" ON project_health_metrics;

-- STEP 2: Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_health_metrics ENABLE ROW LEVEL SECURITY;

-- STEP 3: Create RLS Policies
-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Projects policies
CREATE POLICY "Users can view own projects" ON projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" ON projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects" ON projects
  FOR DELETE USING (auth.uid() = user_id);

-- Project tags policies
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

-- AI interactions policies
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

-- Ideas policies
CREATE POLICY "Users can view own ideas" ON ideas
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ideas" ON ideas
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ideas" ON ideas
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own ideas" ON ideas
  FOR DELETE USING (auth.uid() = user_id);

-- Project health metrics policies
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

-- Success message
SELECT 'RLS policies successfully created!' as status;

-- ========================================
-- ✅ DONE! Check Security Advisor now
-- ========================================

