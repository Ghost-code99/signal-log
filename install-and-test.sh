#!/bin/bash

# Installation and Testing Script for Multi-Project Dashboard
# Run this script to install Node.js and run tests

set -e  # Exit on error

echo "🚀 Signal Log Dashboard - Installation & Testing"
echo "================================================"
echo ""

# Check if Homebrew is installed
if ! command -v brew &> /dev/null; then
    echo "📦 Installing Homebrew..."
    echo "   (This will prompt for your password)"
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    
    # Add Homebrew to PATH for Apple Silicon
    if [[ $(uname -m) == 'arm64' ]]; then
        echo "📝 Adding Homebrew to PATH..."
        echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
        eval "$(/opt/homebrew/bin/brew shellenv)"
    fi
    
    echo "✅ Homebrew installed!"
else
    echo "✅ Homebrew already installed"
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo ""
    echo "📦 Installing Node.js..."
    brew install node
    echo "✅ Node.js installed!"
else
    echo "✅ Node.js already installed ($(node --version))"
fi

echo ""
echo "================================================"
echo "📦 Installing Project Dependencies..."
echo "================================================"
echo ""

cd "$(dirname "$0")"

# Install main dependencies
npm install

echo ""
echo "📦 Installing Test Dependencies..."
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event

echo ""
echo "================================================"
echo "✅ Installation Complete!"
echo "================================================"
echo ""

# Add test scripts to package.json if not present
echo "📝 Updating package.json with test scripts..."
node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
if (!pkg.scripts.test) {
  pkg.scripts.test = 'vitest run';
  pkg.scripts['test:watch'] = 'vitest';
  pkg.scripts['test:coverage'] = 'vitest run --coverage';
  fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
  console.log('✅ Test scripts added to package.json');
} else {
  console.log('✅ Test scripts already exist');
}
"

echo ""
echo "================================================"
echo "🧪 Running Tests..."
echo "================================================"
echo ""

npm run test

echo ""
echo "================================================"
echo "✅ All Tests Passed!"
echo "================================================"
echo ""
echo "🎉 Everything is ready!"
echo ""
echo "Next steps:"
echo "  1. Start dev server:  npm run dev"
echo "  2. Open browser:      http://localhost:3000/dashboard"
echo "  3. Run tests again:   npm run test"
echo "  4. Watch mode:        npm run test:watch"
echo ""
echo "📚 Documentation:"
echo "  - TESTING_AND_DEBUGGING_REPORT.md"
echo "  - QUICK_START_TESTING.md"
echo "  - STAGE_2_IMPLEMENTATION_SUMMARY.md"
echo ""

