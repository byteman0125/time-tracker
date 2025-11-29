-- Disable Row Level Security (RLS) on all tables
-- WARNING: This disables security features. Only use for development or if you're using direct database connections.
-- For production, use RLS with proper policies instead.

ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE interview_steps DISABLE ROW LEVEL SECURITY;
ALTER TABLE interviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE time_tracking DISABLE ROW LEVEL SECURITY;
ALTER TABLE transcriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE tech_interviews DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled (optional check)
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'interview_steps', 'interviews', 'time_tracking', 'transcriptions', 'tech_interviews')
ORDER BY tablename;

