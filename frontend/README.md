# Frontend (React + TypeScript)

This folder holds the frontend app (Vite + React + TypeScript). It is deployed to Vercel and connects directly to Supabase.

## Quick start

1. `cd frontend`
2. `npm install` (or `pnpm install`)
3. Create `.env.local` file with your Supabase credentials:
   ```
   # New API key structure (preferred)
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key-here
   
   # OR use legacy structure (still supported)
   # VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```
4. `npm run dev`

## Tech stack

- Vite
- React
- TypeScript
- Tailwind CSS
- Supabase (direct client connection)
- React Router

## Supabase Setup

The frontend connects directly to Supabase from the browser. No backend server needed for basic operations!

1. Get your Supabase credentials from [Supabase Dashboard](https://app.supabase.com/project/_/settings/api)
2. Create `frontend/.env.local` with:
   - `VITE_SUPABASE_URL` - Your Supabase project URL
   - `VITE_SUPABASE_PUBLISHABLE_KEY` - Your Supabase publishable key (new structure, preferred)
   - OR `VITE_SUPABASE_ANON_KEY` - Legacy anon key (still supported for backward compatibility)

3. Use the Supabase client in your components:
   ```typescript
   import { supabase } from './lib/supabase'
   
   // Example: Fetch data
   const { data, error } = await supabase
     .from('sessions')
     .select('*')
   ```

## Environment Variables for Vercel

Add these in Vercel Project Settings → Environment Variables:
- `VITE_SUPABASE_URL` (required)
- `VITE_SUPABASE_PUBLISHABLE_KEY` (new structure, preferred)
- OR `VITE_SUPABASE_ANON_KEY` (legacy structure, still supported)

These will be available at build time and in the deployed app.
