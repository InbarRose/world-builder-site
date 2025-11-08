# Supabase Automated Setup Guide

This guide shows you how to set up Supabase with maximum automation - minimal manual work required!

## 🚀 Quick Setup (Most Automated)

### 1. Install Supabase CLI

```bash
# Option 1: Using npm (recommended)
npm install -g supabase

# Option 2: Using Homebrew (macOS)
brew install supabase/tap/supabase

# Option 3: Using Scoop (Windows)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### 2. Run Automated Setup Script

```bash
# From project root
./scripts/setup-supabase.sh
```

This script will:
- ✅ Check if Supabase CLI is installed
- ✅ Initialize Supabase in your project
- ✅ Link to your remote Supabase project (if you provide the project ref)
- ✅ Generate TypeScript types automatically

### 3. One-Time Manual Step: Get Your Project Reference ID

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings** → **General**
4. Copy the **Reference ID** (looks like: `abcdefghijklmnop`)

### 4. Link Your Project (if not done by script)

```bash
cd frontend
supabase link --project-ref YOUR_PROJECT_REF
```

## 🔄 Daily Workflow (Fully Automated)

### Generate TypeScript Types Automatically

After making any database changes:

```bash
cd frontend
npm run supabase:types
```

This automatically:
- ✅ Detects if you're using remote or local Supabase
- ✅ Connects to your Supabase project (remote or local)
- ✅ Generates TypeScript types from your database schema
- ✅ Updates `src/lib/database.types.ts` with full type safety
- ✅ Works on Windows, macOS, and Linux

### Local Development (Optional)

If you want to develop locally with Supabase:

```bash
# Start local Supabase (includes Postgres, Auth, Storage, etc.)
supabase start

# Generate types from local database
npm run supabase:types

# Stop when done
supabase stop
```

## 📝 Database Migrations (Automated)

### Create a Migration

```bash
supabase migration new create_sessions_table
```

This creates a new migration file in `supabase/migrations/`.

### Apply Migrations

```bash
# Push migrations to remote Supabase
supabase db push

# Or reset local database and apply all migrations
supabase db reset
```

## 🎯 TypeScript Integration (Automatic)

Once types are generated, you get full type safety:

```typescript
import { supabase } from './lib/supabase'

// Full TypeScript support!
const { data, error } = await supabase
  .from('sessions')
  .select('*')
  .eq('user_id', userId)

// TypeScript knows the exact shape of 'data'
data.forEach(session => {
  console.log(session.id) // ✅ TypeScript autocomplete!
  console.log(session.name) // ✅ TypeScript knows this exists!
})
```

## 🔧 Available NPM Scripts

All these commands are available in `frontend/`:

- `npm run supabase:types` - Generate types (auto-detects remote/local)
- `npm run supabase:types:local` - Generate types from local Supabase only
- `npm run supabase:link` - Link to remote project
- `npm run supabase:start` - Start local Supabase
- `npm run supabase:stop` - Stop local Supabase
- `npm run supabase:reset` - Reset local database
- `npm run supabase:status` - Check Supabase status

## 🎨 Recommended Workflow

1. **Design your schema** in Supabase Dashboard (or via migrations)
2. **Run** `npm run supabase:types` to get TypeScript types (auto-detects remote/local)
3. **Use types** in your code - full autocomplete and type safety!
4. **Make changes** via migrations for version control
5. **Regenerate types** after each schema change

## 🚨 Troubleshooting

### Types not generating?

1. Make sure you're linked: `supabase link --project-ref YOUR_REF`
2. Check your `.env.local` has `SUPABASE_PROJECT_REF`
3. Try generating from local: `npm run supabase:types`

### Can't link to project?

1. Get your project reference ID from Supabase Dashboard
2. Make sure you have the correct permissions
3. Try: `supabase link --project-ref YOUR_REF`

### Local Supabase not starting?

1. Make sure Docker is running (required for local Supabase)
2. Check ports 54321-54326 are available
3. Try: `supabase stop` then `supabase start`

## 📚 Learn More

- [Supabase CLI Docs](https://supabase.com/docs/guides/cli)
- [Database Migrations](https://supabase.com/docs/guides/cli/local-development#database-migrations)
- [TypeScript Types](https://supabase.com/docs/guides/api/generating-types)

