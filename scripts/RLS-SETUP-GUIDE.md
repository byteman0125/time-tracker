# Easy RLS Setup Guide

## Quick Setup (2 minutes)

### Step 1: Open Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your project
3. Click **"SQL Editor"** in the left sidebar

### Step 2: Run the Setup Script
1. Open the file `scripts/setup-rls.sql` in this project
2. Copy **ALL** the contents (Ctrl+A, Ctrl+C)
3. Paste into the SQL Editor in Supabase
4. Click **"Run"** button (or press Ctrl+Enter)

### Step 3: Verify (Optional)
You should see a success message. The script will:
- ✅ Enable RLS on all 6 tables
- ✅ Create policies that allow all operations
- ✅ Show a verification table at the end

## That's it! 🎉

Your tables are now configured. You can use both:
- Direct database connections (via DATABASE_URL) ✅
- Supabase client (via anon key) ✅

## Need to Disable RLS?

If you want to disable RLS instead (not recommended for production):
1. Open `scripts/disable-rls.sql`
2. Copy and paste into Supabase SQL Editor
3. Run it

---

## What This Does

The setup script:
- Enables Row Level Security (RLS) on all tables
- Creates permissive policies that allow all operations
- Works with both direct database connections and Supabase client

## Tables Configured

- ✅ profiles
- ✅ interview_steps
- ✅ interviews
- ✅ time_tracking
- ✅ transcriptions
- ✅ tech_interviews

