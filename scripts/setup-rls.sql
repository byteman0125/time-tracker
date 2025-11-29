-- ============================================
-- EASY RLS SETUP - Copy & Paste This Entire File
-- ============================================
-- 
-- INSTRUCTIONS:
-- 1. Go to Supabase Dashboard → SQL Editor
-- 2. Copy this ENTIRE file (Ctrl+A, Ctrl+C)
-- 3. Paste into SQL Editor
-- 4. Click "Run" button
-- 5. Done! ✅
--
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tech_interviews ENABLE ROW LEVEL SECURITY;

-- Create policies that allow all operations (unrestricted access)
CREATE POLICY "Allow all on profiles" ON profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on interview_steps" ON interview_steps FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on interviews" ON interviews FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on time_tracking" ON time_tracking FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on transcriptions" ON transcriptions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on tech_interviews" ON tech_interviews FOR ALL USING (true) WITH CHECK (true);

-- ✅ Setup complete! All tables now have unrestricted access.

