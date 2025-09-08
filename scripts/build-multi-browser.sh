#!/bin/bash

# Multi-browser extension build script
# Generates packages for Chrome, Edge, and Firefox

set -e

echo "🚀 Building AI Text Proofreader for multiple browsers..."

# Clean previous builds
rm -rf dist/
mkdir -p dist

# Create directories for each browser
mkdir -p dist/chrome-edge
mkdir -p dist/firefox

echo "📦 Building Chrome/Edge package..."

# Copy common files to Chrome/Edge build
cp -r background dist/chrome-edge/
cp -r content dist/chrome-edge/
cp -r popup dist/chrome-edge/
cp -r shared dist/chrome-edge/
cp -r icons dist/chrome-edge/
cp manifest.json dist/chrome-edge/
cp README.md dist/chrome-edge/

# Create Chrome/Edge specific files
cat > dist/chrome-edge/README.md << 'EOF'
# AI Text Proofreader for Chrome/Edge

This extension provides AI-powered text proofreading and correction for web page input fields.

## Installation

1. Download and extract this package
2. Open Chrome/Edge and go to `chrome://extensions/` or `edge://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select this folder

## Features

- AI-powered text proofreading using local or cloud LLMs
- Support for multiple AI providers (Ollama, OpenAI, custom endpoints)
- Context-aware suggestions for different websites
- Privacy-focused with local LLM support

## Configuration

Click the extension icon to access settings and configure your AI provider.
EOF

echo "🦊 Building Firefox package..."

# Copy common files to Firefox build
cp -r background dist/firefox/
cp -r content dist/firefox/
cp -r popup dist/firefox/
cp -r shared dist/firefox/
cp -r icons dist/firefox/
cp manifest-firefox.json dist/firefox/manifest.json
cp README.md dist/firefox/

# Create Firefox specific files
cat > dist/firefox/README.md << 'EOF'
# AI Text Proofreader for Firefox

This extension provides AI-powered text proofreading and correction for web page input fields.

## Installation

### Temporary Installation (for testing)
1. Download and extract this package
2. Open Firefox and go to `about:debugging`
3. Click "This Firefox"
4. Click "Load Temporary Add-on"
5. Select the manifest.json file from this folder

### Permanent Installation
This extension needs to be signed by Mozilla for permanent installation.

## Features

- AI-powered text proofreading using local or cloud LLMs
- Support for multiple AI providers (Ollama, OpenAI, custom endpoints)
- Context-aware suggestions for different websites
- Privacy-focused with local LLM support

## Configuration

Click the extension icon to access settings and configure your AI provider.
EOF

# Get version from manifest
VERSION=$(node -e "console.log(require('./manifest.json').version)")

echo "📝 Creating ZIP packages..."

# Create ZIP packages
cd dist
zip -r "ai-text-proofreader-chrome-edge-v${VERSION}.zip" chrome-edge/
zip -r "ai-text-proofreader-firefox-v${VERSION}.zip" firefox/

# Generate checksums
sha256sum *.zip > checksums.txt

echo "✅ Build complete!"
echo "📁 Packages created in dist/:"
echo "   - ai-text-proofreader-chrome-edge-v${VERSION}.zip"
echo "   - ai-text-proofreader-firefox-v${VERSION}.zip"
echo "   - checksums.txt"

ls -la *.zip
echo ""
echo "🔍 Checksums:"
cat checksums.txt