# Database Setup Scripts

## 🚀 Automated RLS Setup (Easiest - Recommended)

**One command to set up everything:**

```bash
npm run db:setup-rls
```

That's it! ✅ The script will:
- Enable RLS on all tables
- Create unrestricted policies
- Verify the setup
- Show you the status

**Time: ~5 seconds**

### Prerequisites
- Make sure `DATABASE_URL` is set in your `.env.local` file
- Tables must exist (run `npm run db:push` first if needed)

---

## 📋 Manual SQL Setup (Alternative)

If you prefer using Supabase Dashboard:

1. Open `setup-rls.sql` file
2. Copy the entire contents (Ctrl+A, Ctrl+C)
3. Go to [Supabase Dashboard](https://supabase.com/dashboard) → Your Project → SQL Editor
4. Paste and click "Run"
5. Done! ✅

---

## What is RLS?

Row Level Security (RLS) is a Supabase security feature. If you're using:
- ✅ Direct database connections (`DATABASE_URL`) → RLS doesn't matter
- ✅ Supabase client (anon key) → You need RLS policies

This script sets up **unrestricted access** for all tables, so everything works.

---

## Available Commands

### Automated (TypeScript)
- `npm run db:setup-rls` - Enable RLS with unrestricted policies (✅ Recommended)
- `npm run db:disable-rls` - Disable RLS completely (⚠️ Development only)
- `npm run db:seed` - Seed initial data

### Manual (SQL)
- `setup-rls.sql` - SQL script for Supabase Dashboard
- `disable-rls.sql` - SQL script to disable RLS

---

## Workflow

**First time setup:**
```bash
# 1. Push database schema
npm run db:push

# 2. Set up RLS (automated)
npm run db:setup-rls

# 3. Seed initial data (optional)
npm run db:seed
```

---

## Need Help?

If you get errors, make sure:
1. Your tables exist (run `npm run db:push` first)
2. `DATABASE_URL` is set correctly in `.env.local`
3. You have admin access to the database
4. The connection string uses the correct credentials

