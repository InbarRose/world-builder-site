#!/usr/bin/env bash
set -e

echo "🔧 Setting up Supabase for world-builder-site"
echo "=============================================="
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Installing..."
    echo ""
    echo "Please install Supabase CLI:"
    echo "  npm install -g supabase"
    echo "  OR"
    echo "  brew install supabase/tap/supabase"
    echo ""
    echo "Visit: https://supabase.com/docs/guides/cli"
    exit 1
fi

echo "✅ Supabase CLI found: $(supabase --version)"
echo ""

# Check if we're in the project root
if [ ! -f "vercel.json" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

# Initialize Supabase if not already done
if [ ! -d "supabase" ]; then
    echo "📦 Initializing Supabase..."
    supabase init
    echo "✅ Supabase initialized"
else
    echo "✅ Supabase already initialized"
fi

echo ""
echo "🔗 Linking to your Supabase project..."
echo ""
echo "You'll need your Supabase project reference ID."
echo "Find it in: https://app.supabase.com/project/_/settings/general"
echo ""

read -p "Enter your Supabase project reference ID (or press Enter to skip): " PROJECT_REF

if [ -n "$PROJECT_REF" ]; then
    supabase link --project-ref "$PROJECT_REF"
    echo "✅ Linked to Supabase project"
else
    echo "⏭️  Skipping project link. Run 'supabase link' manually later."
fi

echo ""
echo "📝 Generating TypeScript types..."
cd frontend

# Check if .env.local exists
if [ -f ".env.local" ]; then
    # Try to generate types from remote
    if npm run supabase:types:remote 2>/dev/null; then
        echo "✅ Types generated from remote database"
    else
        echo "⚠️  Could not generate types from remote. Using local instead..."
        if npm run supabase:types 2>/dev/null; then
            echo "✅ Types generated from local database"
        else
            echo "⚠️  Could not generate types. Make sure Supabase is running locally or linked to remote."
        fi
    fi
else
    echo "⚠️  No .env.local found. Create it with your Supabase credentials first."
    echo "   Then run: npm run supabase:types:remote"
fi

cd ..

echo ""
echo "🎉 Supabase setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Create database tables in Supabase Dashboard or via migrations"
echo "2. Run 'npm run supabase:types' in frontend/ to generate types"
echo "3. Use the types in your code for full TypeScript support"
echo ""
echo "🛠️  Useful commands:"
echo "  supabase start          # Start local Supabase"
echo "  supabase stop           # Stop local Supabase"
echo "  supabase db reset       # Reset local database"
echo "  supabase migration new  # Create new migration"
echo "  supabase db push        # Push migrations to remote"
echo "  npm run supabase:types  # Generate TypeScript types"

