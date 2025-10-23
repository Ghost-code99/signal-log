#!/bin/bash

# Signal Log Database Setup Script
# This script sets up your Supabase database with the declarative schema

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_status "🚀 Setting up Signal Log Database Schema..."

# Check if we're in the right directory
if [ ! -f "supabase/schema.sql" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

print_status "📋 Database Setup Options:"
echo "1. Apply schema via Supabase Dashboard (Recommended)"
echo "2. Try Supabase CLI (requires access token)"
echo "3. Show manual instructions"
echo ""

read -p "Choose an option (1-3): " choice

case $choice in
    1)
        print_status "📊 Opening Supabase Dashboard..."
        print_warning "Please follow these steps:"
        echo ""
        echo "1. Go to your Supabase project dashboard"
        echo "2. Navigate to SQL Editor"
        echo "3. Copy the contents of 'apply-schema.sql'"
        echo "4. Paste and run the SQL"
        echo ""
        print_success "✅ Schema file created: apply-schema.sql"
        print_success "✅ Ready to apply in Supabase Dashboard!"
        
        # Open the apply-schema.sql file for easy copying
        if command -v code &> /dev/null; then
            print_status "📝 Opening apply-schema.sql in VS Code..."
            code apply-schema.sql
        elif command -v open &> /dev/null; then
            print_status "📝 Opening apply-schema.sql..."
            open apply-schema.sql
        else
            print_status "📝 Please open apply-schema.sql and copy its contents"
        fi
        ;;
    2)
        print_status "🔑 Supabase CLI Setup..."
        print_warning "You need a Supabase access token to use the CLI"
        echo ""
        echo "To get your access token:"
        echo "1. Go to https://supabase.com/dashboard"
        echo "2. Click your profile (top right)"
        echo "3. Go to 'Access Tokens'"
        echo "4. Generate a new token"
        echo "5. Copy the token (starts with 'sbp_')"
        echo ""
        read -p "Enter your Supabase access token: " access_token
        
        if [ -z "$access_token" ]; then
            print_error "Access token is required for CLI setup"
            exit 1
        fi
        
        print_status "🔗 Linking project..."
        export SUPABASE_ACCESS_TOKEN="$access_token"
        npx supabase link --project-ref sbvxiljjfolgmpycabep
        
        print_status "📊 Generating migration..."
        npx supabase db diff -f initial_schema_setup
        
        print_warning "Review the generated migration before applying..."
        read -p "Apply migration to database? (y/N): " apply_migration
        
        if [[ $apply_migration =~ ^[Yy]$ ]]; then
            print_status "🚀 Applying migration..."
            npx supabase db push
            print_success "✅ Database schema applied successfully!"
        else
            print_status "Migration not applied. You can apply it later with: npx supabase db push"
        fi
        ;;
    3)
        print_status "📖 Manual Setup Instructions:"
        echo ""
        echo "1. Go to your Supabase project dashboard:"
        echo "   https://supabase.com/dashboard/project/sbvxiljjfolgmpycabep"
        echo ""
        echo "2. Navigate to SQL Editor"
        echo ""
        echo "3. Copy the contents of 'apply-schema.sql' file"
        echo ""
        echo "4. Paste the SQL into the editor and run it"
        echo ""
        echo "5. Verify the tables were created in the Table Editor"
        echo ""
        print_success "✅ Manual setup instructions provided!"
        ;;
    *)
        print_error "Invalid option. Please choose 1, 2, or 3."
        exit 1
        ;;
esac

print_status "🎯 Next Steps:"
echo "1. Verify your database schema is applied"
echo "2. Test your application with: npm run dev"
echo "3. Check the Supabase dashboard for your tables"
echo ""
print_success "🎉 Database setup process completed!"
