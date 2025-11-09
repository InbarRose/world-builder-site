# Deployment Checklist

## ✅ What's Already Done

- ✅ Frontend pages created (Home, Sessions, Rules, etc.)
- ✅ Vercel configuration (`vercel.json`) with `functions: {}` to disable Python
- ✅ Supabase client library added to package.json
- ✅ Supabase client setup (`frontend/src/lib/supabase.ts`)
- ✅ GitHub Actions CI/CD updated (no deprecated actions)
- ✅ Environment variable examples in README

## 🔧 What You Need to Configure

### 1. Install Frontend Dependencies
```bash
cd frontend
npm install
```
This will install the new `@supabase/supabase-js` package.

### 2. Vercel Project Settings (CRITICAL - Fixes Python Function Errors)

The logs show Vercel is still trying to deploy Python functions. You need to manually disable this:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project → **Settings**
3. Go to **Functions** section
4. **Disable/Remove any Python functions** if they exist
5. Go to **General** section and verify:
   - **Framework Preset**: Vite (or auto-detected)
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `dist` (auto-detected)
   - **Install Command**: `npm ci` (auto-detected)

### 3. Vercel Environment Variables

Add these in **Vercel Project Settings → Environment Variables**:

- `VITE_SUPABASE_URL` = `https://your-project.supabase.co`
- `VITE_SUPABASE_PUBLISHABLE_KEY` = `your-publishable-key-here` (new structure, preferred)
- OR `VITE_SUPABASE_ANON_KEY` = `your-anon-key-here` (legacy structure, still supported)

**Important**: 
- Add these for **Production**, **Preview**, and **Development** environments
- After adding, you'll need to **redeploy** for them to take effect
- The code supports both new (publishable) and legacy (anon) key names for backward compatibility

### 4. Local Development Setup

Create `frontend/.env.local`:
```env
# New API key structure (preferred)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key-here

# OR use legacy structure (still supported)
# VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 5. Get Supabase Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **Publishable Key** (new structure) → `VITE_SUPABASE_PUBLISHABLE_KEY`
   - OR **anon/public key** (legacy) → `VITE_SUPABASE_ANON_KEY`

**Note**: Supabase now uses "Publishable Key" (replaces anon key) and "Secret Key" (replaces service_role key). The code supports both for backward compatibility.

### 6. Commit and Push

```bash
git add .
git commit -m "feat: add Supabase client and fix deployment config"
git push
```

### 7. Verify Deployment

After pushing:
1. **GitHub Actions** should run and pass (check Actions tab)
2. **Vercel** should auto-deploy (check Vercel dashboard)
3. Visit your Vercel URL - should see the static site (no Python errors)
4. Check Vercel logs - should NOT see Python function errors

## 🚨 Troubleshooting

### If Vercel Still Tries to Deploy Python Functions:

1. **Delete and recreate the Vercel project** (if needed):
   - Disconnect the GitHub repo
   - Create a new project
   - Connect the repo again
   - Vercel will use `vercel.json` from the repo

2. **Or manually override in Vercel Settings**:
   - Settings → General → Override build settings
   - Set Root Directory: `frontend`
   - Set Build Command: `npm run build`
   - Set Output Directory: `dist`
   - Disable all functions

### If Environment Variables Don't Work:

- Make sure they start with `VITE_` prefix (required for Vite)
- Redeploy after adding variables
- Check Vercel build logs to see if variables are available

## 📝 Next Steps After Deployment Works

1. Set up Supabase database tables
2. Configure Row Level Security (RLS) policies
3. Test Supabase connection from the frontend
4. Add authentication if needed
5. Build out the actual features

