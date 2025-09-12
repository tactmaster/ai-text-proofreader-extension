#!/bin/bash

# GitHub Release Creation Guide for AI Text Proofreader v0.2.0
# This script documents how to create a release with multi-browser artifacts

echo "🚀 AI Text Proofreader v0.2.0 - Release Creation Guide"
echo "=================================================="
echo ""

echo "📋 Release Summary:"
echo "- Version: v0.2.0"
echo "- Type: Major release with multi-browser support"
echo "- Artifacts: Chrome/Edge package, Firefox package, checksums"
echo ""

echo "📦 Built Artifacts Ready:"
echo "- ai-text-proofreader-chrome-edge-v0.2.0.zip (Chrome & Edge - Manifest V3)"
echo "- ai-text-proofreader-firefox-v0.2.0.zip (Firefox - Manifest V2)"
echo "- checksums.txt (SHA256 verification hashes)"
echo "- INSTALLATION.md (Multi-browser installation guide)"
echo "- RELEASE_NOTES_v0.2.0.md (Comprehensive release notes)"
echo ""

echo "🔍 Package Verification:"
echo "SHA256 Checksums:"
cat dist/checksums.txt
echo ""

echo "📁 Artifact Sizes:"
ls -lh dist/*.zip
echo ""

echo "🎯 Next Steps to Create GitHub Release:"
echo ""
echo "1. Go to: https://github.com/tactmaster/ai-text-proofreader-extension/releases/new"
echo ""
echo "2. Fill in release form:"
echo "   - Tag version: v0.2.0"
echo "   - Release title: AI Text Proofreader v0.2.0"
echo "   - Description: Copy content from RELEASE_NOTES_v0.2.0.md"
echo ""
echo "3. Upload release assets:"
echo "   - dist/ai-text-proofreader-chrome-edge-v0.2.0.zip"
echo "   - dist/ai-text-proofreader-firefox-v0.2.0.zip"
echo "   - dist/checksums.txt"
echo "   - INSTALLATION.md"
echo ""
echo "4. Publish the release"
echo ""

echo "🤖 Alternative: Use GitHub Actions (Automated)"
echo ""
echo "If you have repository access, you can trigger the automated release workflow:"
echo "1. Go to: https://github.com/tactmaster/ai-text-proofreader-extension/actions"
echo "2. Select 'Automated Release' workflow"
echo "3. Click 'Run workflow'"
echo "4. Choose release type: 'patch' (0.2.0 -> 0.2.1) or 'minor' (0.2.0 -> 0.3.0)"
echo ""

echo "✅ All files are ready for release creation!"
echo ""

echo "📋 Release Checklist:"
echo "- [x] Multi-browser packages built and tested"
echo "- [x] Chrome/Edge package (Manifest V3) ready"
echo "- [x] Firefox package (Manifest V2) ready"
echo "- [x] SHA256 checksums generated"
echo "- [x] Installation guide created"
echo "- [x] Comprehensive release notes prepared"
echo "- [ ] GitHub release created with all artifacts"
echo "- [ ] Release published and verified"
echo ""