#!/bin/bash

# Signal Log Schema Management Script
# This script helps manage your declarative database schema

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

# Function to check if supabase CLI is installed
check_supabase_cli() {
    if ! command -v supabase &> /dev/null; then
        print_error "Supabase CLI is not installed. Please install it first:"
        echo "npm install -g supabase"
        exit 1
    fi
}

# Function to check if project is linked
check_project_linked() {
    if ! supabase status &> /dev/null; then
        print_error "Project is not linked to Supabase. Please run:"
        echo "supabase link --project-ref YOUR_PROJECT_REF"
        exit 1
    fi
}

# Function to generate migration
generate_migration() {
    if [ -z "$1" ]; then
        print_error "Migration name is required"
        echo "Usage: $0 migrate <migration_name>"
        exit 1
    fi
    
    print_status "Generating migration: $1"
    supabase db diff -f "$1"
    print_success "Migration generated successfully"
}

# Function to apply migrations
apply_migrations() {
    print_warning "This will apply migrations to your remote database."
    read -p "Are you sure you want to continue? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Applying migrations..."
        supabase db push
        print_success "Migrations applied successfully"
    else
        print_status "Migration cancelled"
    fi
}

# Function to check database status
check_status() {
    print_status "Checking database status..."
    supabase status
}

# Function to open Supabase dashboard
open_dashboard() {
    print_status "Opening Supabase dashboard..."
    supabase dashboard
}

# Function to show help
show_help() {
    echo "Signal Log Schema Management Script"
    echo ""
    echo "Usage: $0 <command> [options]"
    echo ""
    echo "Commands:"
    echo "  migrate <name>    Generate a new migration with the given name"
    echo "  apply            Apply pending migrations to remote database"
    echo "  status           Check database status"
    echo "  dashboard        Open Supabase dashboard"
    echo "  help             Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 migrate add_user_preferences"
    echo "  $0 apply"
    echo "  $0 status"
}

# Main script logic
main() {
    check_supabase_cli
    
    case "$1" in
        "migrate")
            check_project_linked
            generate_migration "$2"
            ;;
        "apply")
            check_project_linked
            apply_migrations
            ;;
        "status")
            check_project_linked
            check_status
            ;;
        "dashboard")
            open_dashboard
            ;;
        "help"|"--help"|"-h"|"")
            show_help
            ;;
        *)
            print_error "Unknown command: $1"
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
