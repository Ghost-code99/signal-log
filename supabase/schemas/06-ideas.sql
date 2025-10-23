-- Ideas table definition
-- This represents the desired state of the ideas table

CREATE TABLE ideas (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  suggested_tags TEXT[],
  related_project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  status TEXT CHECK (status IN ('captured', 'processed', 'integrated', 'dismissed')) DEFAULT 'captured',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_ideas_user_id ON ideas(user_id);
CREATE INDEX idx_ideas_status ON ideas(status);
CREATE INDEX idx_ideas_created_at ON ideas(created_at);
CREATE INDEX idx_ideas_related_project ON ideas(related_project_id);

-- Create GIN index for array searches on suggested_tags
CREATE INDEX idx_ideas_suggested_tags ON ideas USING gin(suggested_tags);
