#!/bin/bash

# Build APK Script for Métré Mobile
# This script automates the APK build process

echo "🚀 Métré Mobile - Build APK Script"
echo "===================================="
echo ""

# Check if eas-cli is installed
if ! command -v eas &> /dev/null; then
    echo "❌ EAS CLI is not installed"
    echo "Installing EAS CLI globally..."
    npm install -g eas-cli
fi

echo "✅ EAS CLI found"
echo ""

# Check if npm packages are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing npm packages..."
    npm install
fi

echo "✅ Dependencies installed"
echo ""

# Show build options
echo "📋 Choose build option:"
echo "1. Build locally (faster, requires Android SDK)"
echo "2. Build on cloud (no local setup needed)"
echo "3. Exit"
echo ""
read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        echo ""
        echo "🔨 Building APK locally..."
        eas build --platform android --local
        ;;
    2)
        echo ""
        echo "☁️  Building APK on cloud..."
        eas build --platform android
        ;;
    3)
        echo "Exiting..."
        exit 0
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "✅ Build started!"
echo "⏳ This may take several minutes..."
echo ""
echo "📱 Once complete, you can install the APK on your Android device"
