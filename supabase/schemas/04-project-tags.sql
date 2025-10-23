-- Project tags table definition
-- This represents the desired state of the project_tags table

CREATE TABLE project_tags (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  tag_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_project_tags_project_id ON project_tags(project_id);
CREATE INDEX idx_project_tags_tag_name ON project_tags(tag_name);

-- Ensure unique tag names per project
CREATE UNIQUE INDEX idx_project_tags_unique ON project_tags(project_id, tag_name);
