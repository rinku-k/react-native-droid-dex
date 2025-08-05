#!/bin/bash

# Setup script for react-native-droid-dex development

set -e

echo "🚀 Setting up react-native-droid-dex development environment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the react-native-droid-dex root directory"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the module
echo "🔨 Building the module..."
npm run prepack

# Setup example app
echo "📱 Setting up example app..."
cd example

# Install example dependencies
npm install

# Check if Android SDK is available
if ! command -v adb &> /dev/null; then
    echo "⚠️  Warning: Android SDK not found. Make sure you have Android development environment set up."
    echo "   - Install Android Studio"
    echo "   - Set up Android SDK"
    echo "   - Add adb to your PATH"
fi

echo "✅ Setup complete!"
echo ""
echo "🎯 Next steps:"
echo "   1. Connect an Android device or start an emulator"
echo "   2. Run: cd example && npx react-native run-android"
echo "   3. Test the performance monitoring features"
echo ""
echo "📖 For more information, see README.md"