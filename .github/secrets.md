# GitHub Secrets Configuration

## Required Secrets

Add these secrets to your GitHub repository settings:

### Supabase
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key for database access
- `SUPABASE_ANON_KEY`: Anonymous key for client access

### Vercel
- `VERCEL_TOKEN`: Vercel API token for deployment

## How to Add Secrets

1. Go to your GitHub repository
2. Click Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Add each secret with the exact name above

## Local Development

Copy `.env.example` to `.env` and fill in your values for local development.
