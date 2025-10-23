-- Test Sample Data for Signal Log
-- Run this in your Supabase SQL Editor after applying the schema

-- Insert a test user
INSERT INTO users (email, full_name) 
VALUES ('test@example.com', 'Test User');

-- Get the user ID for foreign key references
-- (In a real app, this would be done through authentication)

-- Insert a test project
INSERT INTO projects (user_id, title, description, status, priority)
SELECT 
  u.id,
  'My First Project',
  'A test project to validate the schema',
  'active',
  'high'
FROM users u 
WHERE u.email = 'test@example.com';

-- Insert project tags
INSERT INTO project_tags (project_id, tag_name)
SELECT 
  p.id,
  unnest(ARRAY['web-app', 'mvp', 'test'])
FROM projects p
JOIN users u ON p.user_id = u.id
WHERE u.email = 'test@example.com';

-- Insert a test idea
INSERT INTO ideas (user_id, content, suggested_tags, status)
SELECT 
  u.id,
  'This is a test idea captured by the system',
  ARRAY['feature', 'enhancement'],
  'captured'
FROM users u 
WHERE u.email = 'test@example.com';

-- Insert AI interaction
INSERT INTO ai_interactions (project_id, user_id, interaction_type, content, ai_response)
SELECT 
  p.id,
  u.id,
  'health_scan',
  'Please analyze the health of this project',
  '{"health_score": 85, "recommendations": ["Focus on user feedback", "Improve documentation"]}'
FROM projects p
JOIN users u ON p.user_id = u.id
WHERE u.email = 'test@example.com';

-- Insert health metrics
INSERT INTO project_health_metrics (project_id, health_score, health_indicators)
SELECT 
  p.id,
  85,
  '{"user_engagement": "high", "technical_debt": "low", "market_fit": "medium"}'::jsonb
FROM projects p
JOIN users u ON p.user_id = u.id
WHERE u.email = 'test@example.com';

-- Verify the data was inserted
SELECT 'Sample data inserted successfully!' as status;

-- Show the inserted data
SELECT 'Users:' as table_name, count(*) as count FROM users
UNION ALL
SELECT 'Projects:', count(*) FROM projects
UNION ALL
SELECT 'Project Tags:', count(*) FROM project_tags
UNION ALL
SELECT 'Ideas:', count(*) FROM ideas
UNION ALL
SELECT 'AI Interactions:', count(*) FROM ai_interactions
UNION ALL
SELECT 'Health Metrics:', count(*) FROM project_health_metrics;
