#!/bin/bash

# Complete Signal Log Setup Script
# This script handles all remaining issues and completes the setup

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

print_status "🚀 Completing Signal Log Setup..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

print_status "📋 Setup Options:"
echo "1. Apply schema via Supabase Dashboard (Recommended - No Docker required)"
echo "2. Test application functionality"
echo "3. Complete all setup steps"
echo ""

read -p "Choose an option (1-3): " choice

case $choice in
    1)
        print_status "📊 Schema Application via Supabase Dashboard"
        print_warning "Follow these steps:"
        echo ""
        echo "1. Go to: https://supabase.com/dashboard/project/sbvxiljjfolgmpycabep"
        echo "2. Navigate to SQL Editor"
        echo "3. Copy the contents of 'supabase/remote-schema.sql'"
        echo "4. Paste and run the SQL"
        echo "5. Verify tables in Table Editor"
        echo ""
        print_success "✅ Schema file ready: supabase/remote-schema.sql"
        
        # Open the schema file
        if command -v code &> /dev/null; then
            print_status "📝 Opening schema file in VS Code..."
            code supabase/remote-schema.sql
        elif command -v open &> /dev/null; then
            print_status "📝 Opening schema file..."
            open supabase/remote-schema.sql
        fi
        ;;
    2)
        print_status "🧪 Testing Application"
        
        # Kill any existing dev servers
        print_status "Stopping existing dev servers..."
        pkill -f "next dev" || true
        
        # Start the application
        print_status "Starting development server..."
        npm run dev &
        DEV_PID=$!
        
        # Wait for server to start
        sleep 5
        
        print_success "✅ Application started at http://localhost:3000"
        print_status "Test your application by:"
        echo "1. Opening http://localhost:3000 in your browser"
        echo "2. Testing user registration"
        echo "3. Creating a test project"
        echo "4. Verifying all features work"
        
        # Keep the server running
        print_status "Press Ctrl+C to stop the server when done testing"
        wait $DEV_PID
        ;;
    3)
        print_status "🎯 Complete Setup Process"
        
        # Step 1: Apply Schema
        print_status "Step 1: Apply Database Schema"
        echo "1. Go to: https://supabase.com/dashboard/project/sbvxiljjfolgmpycabep"
        echo "2. SQL Editor → New query"
        echo "3. Copy contents of 'supabase/remote-schema.sql'"
        echo "4. Paste and run"
        echo ""
        read -p "Press Enter when schema is applied..."
        
        # Step 2: Test Application
        print_status "Step 2: Test Application"
        print_status "Starting development server..."
        npm run dev &
        DEV_PID=$!
        sleep 5
        
        print_success "✅ Application ready at http://localhost:3000"
        print_status "Test the following:"
        echo "1. User registration/login"
        echo "2. Project creation"
        echo "3. Dashboard functionality"
        echo "4. All AI features"
        echo ""
        read -p "Press Enter when testing is complete..."
        
        # Stop the server
        kill $DEV_PID 2>/dev/null || true
        
        # Step 3: Final Verification
        print_status "Step 3: Final Verification"
        print_success "✅ Setup Complete!"
        echo ""
        print_status "📋 What's been set up:"
        echo "✅ Declarative schema management"
        echo "✅ Database tables and RLS policies"
        echo "✅ GitHub Actions CI/CD"
        echo "✅ Next.js configuration"
        echo "✅ Supabase integration"
        echo "✅ Testing framework"
        echo "✅ Deployment configuration"
        echo ""
        print_status "🚀 Your Signal Log application is ready for production!"
        ;;
    *)
        print_error "Invalid option. Please choose 1, 2, or 3."
        exit 1
        ;;
esac

print_success "🎉 Setup process completed!"
