#!/bin/bash

# Clerk Setup Automation Script
# This script helps automate the Clerk setup process

set -e

echo "🔧 Clerk Setup Automation"
echo "=========================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo -e "${YELLOW}⚠️  .env.local not found. Creating from template...${NC}"
    touch .env.local
fi

# Check if Clerk keys already exist
if grep -q "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" .env.local && ! grep -q "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE" .env.local; then
    echo -e "${GREEN}✅ Clerk keys already configured!${NC}"
    echo ""
    echo "Current Clerk configuration:"
    grep "CLERK" .env.local | sed 's/=.*/=***HIDDEN***/'
    echo ""
    read -p "Do you want to update them? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Keeping existing configuration."
        exit 0
    fi
fi

echo "📋 Clerk Setup Steps"
echo ""
echo "This script will help you set up Clerk. You'll need to:"
echo "1. Create a Clerk account (if you don't have one)"
echo "2. Create an application in Clerk Dashboard"
echo "3. Get your API keys"
echo "4. Configure the session token"
echo ""
read -p "Press Enter to continue or Ctrl+C to cancel..."

echo ""
echo "🌐 Opening Clerk Dashboard..."
echo ""

# Try to open Clerk Dashboard in browser
if command -v open &> /dev/null; then
    open "https://dashboard.clerk.com/"
elif command -v xdg-open &> /dev/null; then
    xdg-open "https://dashboard.clerk.com/"
else
    echo "Please open: https://dashboard.clerk.com/"
fi

echo ""
echo "📝 Step 1: Get your API keys from Clerk Dashboard"
echo "   - Go to Settings > API Keys"
echo "   - Copy your Publishable Key (starts with pk_test_...)"
echo "   - Copy your Secret Key (starts with sk_test_...)"
echo ""

read -p "Enter your Publishable Key: " PUBLISHABLE_KEY
read -p "Enter your Secret Key: " SECRET_KEY

# Validate key formats
if [[ ! $PUBLISHABLE_KEY =~ ^pk_(test|live)_ ]]; then
    echo -e "${RED}❌ Invalid publishable key format. Should start with pk_test_ or pk_live_${NC}"
    exit 1
fi

if [[ ! $SECRET_KEY =~ ^sk_(test|live)_ ]]; then
    echo -e "${RED}❌ Invalid secret key format. Should start with sk_test_ or sk_live_${NC}"
    exit 1
fi

echo ""
echo "📝 Step 2: Adding keys to .env.local..."
echo ""

# Remove existing Clerk keys if they exist
sed -i.bak '/^NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=/d' .env.local
sed -i.bak '/^CLERK_SECRET_KEY=/d' .env.local
sed -i.bak '/^NEXT_PUBLIC_CLERK_SIGN_IN_URL=/d' .env.local
sed -i.bak '/^NEXT_PUBLIC_CLERK_SIGN_UP_URL=/d' .env.local
sed -i.bak '/^NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/d' .env.local
sed -i.bak '/^NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/d' .env.local

# Add new keys
cat >> .env.local << EOF

# Clerk Authentication Configuration
# Added by setup-clerk.sh on $(date)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$PUBLISHABLE_KEY
CLERK_SECRET_KEY=$SECRET_KEY

# Clerk Redirect URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/onboarding
EOF

echo -e "${GREEN}✅ Keys added to .env.local${NC}"
echo ""

echo "📝 Step 3: Configure Session Token in Clerk Dashboard"
echo ""
echo "⚠️  CRITICAL: You must configure the session token manually!"
echo ""
echo "1. Go to: https://dashboard.clerk.com/"
echo "2. Navigate to: Sessions > Customize session token"
echo "3. Add this JSON (copy exactly):"
echo ""
echo '   {'
echo '     "role": "authenticated",'
echo '     "metadata": "{{user.public_metadata}}"'
echo '   }'
echo ""
echo "4. Click Save"
echo ""
read -p "Have you configured the session token? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}⚠️  Please configure the session token before proceeding!${NC}"
    echo "Without it, onboarding will cause infinite redirect loops."
    exit 1
fi

echo ""
echo "📝 Step 4: Enable Supabase Integration (if not done)"
echo ""
echo "1. Go to: Integrations > Supabase"
echo "2. Connect your Supabase project"
echo "3. Enter project URL: https://sbvxiljjfolgmpycabep.supabase.co"
echo ""
read -p "Have you enabled Supabase integration? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}⚠️  Supabase integration is recommended for data isolation!${NC}"
fi

echo ""
echo "🧹 Cleaning Next.js cache..."
rm -rf .next

echo ""
echo -e "${GREEN}✅ Clerk setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Restart your dev server: npm run dev"
echo "2. Test signup at: http://localhost:3000/sign-up"
echo "3. Verify onboarding flow works"
echo ""
echo "To verify setup, run: npm run check:clerk"

