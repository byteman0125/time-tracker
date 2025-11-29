# Deployment Guide

## Vercel Deployment Setup

### Required Environment Variables

You **must** set these environment variables in your Vercel project settings:

1. **Go to Vercel Dashboard** → Your Project → Settings → Environment Variables

2. **Add these variables:**

   ```
   DATABASE_URL=postgresql://user:password@host:port/database
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

### How to Get These Values

#### DATABASE_URL
1. Go to Supabase Dashboard → Your Project
2. Settings → Database
3. Connection string → URI
4. Copy the connection string (it looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`)

#### NEXT_PUBLIC_SUPABASE_URL
1. Supabase Dashboard → Settings → API
2. Copy "Project URL"

#### NEXT_PUBLIC_SUPABASE_ANON_KEY
1. Supabase Dashboard → Settings → API
2. Copy "anon public" key

### After Setting Environment Variables

1. **Redeploy your application** in Vercel (or it will auto-deploy on next push)

2. **Set up RLS (Row Level Security)**:
   - Option 1 (Recommended): Run `npm run db:setup-rls` locally (requires DATABASE_URL)
   - Option 2: Use Supabase Dashboard SQL Editor with `scripts/setup-rls.sql`

### Verify Deployment

After deployment, check:
- ✅ `/api/interviews` returns 200 (not 500)
- ✅ `/metrics` page loads without 404
- ✅ Dashboard loads without errors

### Common Issues

#### 500 Error on `/api/interviews`
- **Cause**: `DATABASE_URL` not set or incorrect
- **Fix**: Add `DATABASE_URL` in Vercel environment variables and redeploy

#### 404 Error on `/metrics`
- **Cause**: Route not found (should be fixed in latest code)
- **Fix**: Redeploy after latest changes

#### TypeError: Cannot convert undefined or null to object
- **Cause**: API returning error, data is null
- **Fix**: Ensure `DATABASE_URL` is set correctly and database is accessible

### Database Setup Checklist

- [ ] `DATABASE_URL` set in Vercel
- [ ] `NEXT_PUBLIC_SUPABASE_URL` set in Vercel
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` set in Vercel
- [ ] Database schema pushed (`npm run db:push`)
- [ ] RLS policies set up (`npm run db:setup-rls` or SQL script)
- [ ] Application redeployed

### Quick Setup Script

After setting environment variables in Vercel:

```bash
# 1. Set up RLS (run locally with DATABASE_URL)
npm run db:setup-rls

# 2. Push to trigger Vercel deployment
git push
```

---

## Local Development Setup

1. Create `.env.local` file:
   ```env
   DATABASE_URL=postgresql://user:password@host:port/database
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Push database schema:
   ```bash
   npm run db:push
   ```

4. Set up RLS:
   ```bash
   npm run db:setup-rls
   ```

5. Run development server:
   ```bash
   npm run dev
   ```

