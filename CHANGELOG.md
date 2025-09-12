# Changelog

All notable changes to the AI Text Proofreader extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2025-09-11

### 🚀 Major Features Added

#### 🌐 Multi-Browser Support
- **Chrome Extension**: Full Manifest V3 support with service worker background
- **Edge Extension**: Full Manifest V3 support (identical to Chrome implementation)
- **Firefox Extension**: Manifest V2 adaptation with full feature parity
- **Shared Backend**: Unified codebase ensuring consistent functionality across all browsers

#### 🔧 Cross-Browser API Abstraction
- Added `shared/browser-api.js` - Unified API layer for chrome.*/browser.* APIs
- Implemented Promise-based wrappers for callback-based browser APIs
- Added automatic browser detection and API selection
- Created seamless runtime messaging, storage, and tabs API compatibility

#### 🏗️ Automated Build System
- **Multi-Browser Build Script**: `scripts/build-multi-browser.sh` creates browser-specific packages
- **Package Generation**: Separate optimized builds for Chrome/Edge and Firefox
- **GitHub Actions Integration**: Automated release workflow with multi-browser artifacts
- **SHA256 Checksums**: Package integrity verification for all releases

#### 🎨 Enhanced User Interface
- **Dual-Button System**: Separate buttons for direct proofreading and advanced options
- **Beautiful AI Icons**: Neural network inspired gradient designs with circuit patterns
- **Smart Button Positioning**: Intelligent placement that adapts to screen edges and viewport
- **Loading State Improvements**: Persistent loading indicators during AI processing
- **Microsoft Word Integration**: Added Word mode toggle in settings panel

### 🔧 Technical Improvements

#### 🧪 Comprehensive Testing Suite
- **50+ Unit Tests**: Complete coverage of core functionality
- **Browser API Tests**: Cross-browser compatibility validation
- **Error Handling Tests**: Chrome runtime and extension context scenarios
- **Integration Tests**: End-to-end multi-browser functionality
- **Coverage Reporting**: Automated test coverage with detailed reports

#### ⚡ Performance & Reliability
- **Enhanced Error Handling**: Graceful degradation when Chrome APIs unavailable
- **Improved Memory Management**: Optimized content script lifecycle and cleanup
- **Robust Initialization**: Comprehensive startup validation and error recovery
- **Better Loading States**: Clear user feedback during AI processing operations

#### 🎯 AI Provider System Enhancements
- **21 AI Providers**: Local (Ollama, llama.cpp), Commercial (OpenAI, Anthropic), Open Source (HuggingFace)
- **Provider-Specific UI**: Dynamic settings interface based on selected provider
- **Custom Endpoint Support**: Enterprise and self-hosted AI service integration
- **Unified Backend Processing**: Same AI logic and prompt handling across all browsers

### 🐛 Bug Fixes

- **Fixed**: Button styling reversion after AI processing completion
- **Fixed**: Chrome runtime errors when extension context becomes unavailable
- **Fixed**: Context detection accuracy for mail.google.com and other Gmail domains
- **Fixed**: Newline and formatting preservation in AI responses
- **Fixed**: Loading state persistence during long AI processing times
- **Fixed**: Settings dialog icon consistency and styling
- **Fixed**: Smart positioning edge cases for small viewports and mobile screens

### 📦 Release Artifacts

This release provides separate, optimized packages for each browser:

#### Chrome/Edge Package (`ai-text-proofreader-chrome-edge-v0.2.0.zip`)
- Manifest V3 optimized for modern Chrome/Edge browsers
- Service worker background script for better performance
- Chrome Web Store submission ready
- Edge Add-ons store submission ready

#### Firefox Package (`ai-text-proofreader-firefox-v0.2.0.zip`)
- Manifest V2 compatible with Firefox WebExtensions
- Traditional background script (non-service worker)
- Firefox Add-ons (AMO) submission ready
- Self-hosted installation support

#### Additional Files
- `checksums.txt` - SHA256 verification hashes for package integrity
- `INSTALLATION.md` - Multi-browser installation guide with troubleshooting
- Browser-specific README files with setup instructions

### 🔄 Migration Notes

#### From v0.1.0
- **Settings Preserved**: All existing settings and configurations maintained
- **Feature Parity**: No loss of functionality during upgrade
- **Enhanced Features**: Additional AI providers and UI improvements
- **Cross-Browser**: Can now install on multiple browsers with synchronized settings

#### Browser Compatibility
- **Chrome**: Version 88+ (Manifest V3 support required)
- **Edge**: Version 88+ (Chromium-based Edge required)
- **Firefox**: Version 109+ (WebExtensions Manifest V2 support)

### 🎯 What's Next (v0.3.0 Preview)

- Chrome Web Store submission and distribution
- Firefox Add-ons (AMO) store submission
- Edge Add-ons store submission
- Enhanced context detection for additional websites
- Advanced AI provider configurations and fine-tuning options
- Real-time collaborative text editing support

---

## [0.1.0] - 2025-08-15

### Added
- Initial Chrome extension release
- Basic AI text proofreading functionality
- OpenAI and Ollama provider support
- Context-aware prompts for Gmail and GitHub
- Dual-button interface for text fields
- Extension popup with manual text correction
- Basic error handling and loading states

### Technical
- Manifest V3 implementation
- Content script for webpage interaction
- Background service worker for AI processing
- Chrome storage API for settings persistence
- Right-click context menu integration

---

**Release Downloads**: [GitHub Releases](https://github.com/tactmaster/ai-text-proofreader-extension/releases)  
**Installation Guide**: [Multi-Browser Setup](./INSTALLATION.md)  
**Documentation**: [README](./README.md)
