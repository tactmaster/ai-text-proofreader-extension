# AI Text Proofreader v0.2.0 - Multi-Browser Release

🎉 **Major Release**: First multi-browser version with full Chrome, Edge, and Firefox support!

## 🌐 What's New

### Multi-Browser Support
- **Chrome Extension**: Full Manifest V3 support with service worker background
- **Edge Extension**: Full Manifest V3 support (identical to Chrome implementation) 
- **Firefox Extension**: Manifest V2 adaptation with full feature parity
- **Shared Backend**: Unified codebase ensuring consistent functionality across all browsers

### Cross-Browser API Abstraction
- Added `shared/browser-api.js` - Unified API layer for chrome.*/browser.* APIs
- Implemented Promise-based wrappers for callback-based browser APIs
- Added automatic browser detection and API selection
- Created seamless runtime messaging, storage, and tabs API compatibility

### Automated Build System
- **Multi-Browser Build Script**: Creates browser-specific packages automatically
- **Package Generation**: Separate optimized builds for Chrome/Edge and Firefox
- **SHA256 Checksums**: Package integrity verification for all releases

## 📦 Release Artifacts

This release provides separate, optimized packages for each browser:

### Chrome/Edge Package (`ai-text-proofreader-chrome-edge-v0.2.0.zip`)
- Manifest V3 optimized for modern Chrome/Edge browsers
- Service worker background script for better performance
- Chrome Web Store submission ready
- Edge Add-ons store submission ready

### Firefox Package (`ai-text-proofreader-firefox-v0.2.0.zip`)
- Manifest V2 compatible with Firefox WebExtensions
- Traditional background script (non-service worker)
- Firefox Add-ons (AMO) submission ready
- Self-hosted installation support

### Additional Files
- `checksums.txt` - SHA256 verification hashes for package integrity
- Browser-specific README files with setup instructions

## 🚀 Features

### AI-Powered Text Processing
- **21 AI Providers**: Support for local (Ollama, llama.cpp, LM Studio, Jan) and cloud providers (OpenAI, Anthropic, Google, Mistral, Groq, and more)
- **Context-Aware Proofreading**: Automatically adapts suggestions based on website context (Email, GitHub, etc.)
- **Formatting Preservation**: Maintains newlines, bullet points, code blocks, and other formatting
- **Smart UI Positioning**: Intelligent button placement that adapts to screen edges

### Privacy & Security
- **Privacy First**: Option to use local AI models for complete privacy
- **Secure API Calls**: Encrypted connections for cloud providers
- **No Data Collection**: Text never leaves your computer with local models

### User Experience
- **Customizable Settings**: Configure AI providers, models, and context-specific prompts
- **Cross-Browser Compatibility**: Same features and settings across Chrome, Edge, and Firefox
- **Comprehensive Testing**: 50+ unit tests ensuring reliability

## 🔧 Installation Instructions

### Chrome/Edge Installation (Developer Mode)

1. **Download**: Get `ai-text-proofreader-chrome-edge-v0.2.0.zip` from the release assets below
2. **Extract**: Unzip the file to a folder on your computer
3. **Open Extensions**: Go to:
   - Chrome: `chrome://extensions/`
   - Edge: `edge://extensions/`
4. **Enable Developer Mode**: Toggle the switch in the top-right corner
5. **Load Extension**: Click "Load unpacked" and select the extracted folder
6. **Verify**: The extension should appear in your extensions list

### Firefox Installation

#### Temporary Installation (for testing)
1. **Download**: Get `ai-text-proofreader-firefox-v0.2.0.zip` from the release assets below
2. **Extract**: Unzip the file to a folder on your computer  
3. **Open Debugging**: Go to `about:debugging` in Firefox
4. **Select This Firefox**: Click "This Firefox" tab
5. **Load Add-on**: Click "Load Temporary Add-on"
6. **Select Manifest**: Choose the `manifest.json` file from the extracted folder

#### Permanent Installation
For permanent installation in Firefox, the extension needs to be signed by Mozilla or installed via Firefox Add-ons (AMO). Submission to AMO is planned for future releases.

## ⚙️ Configuration

1. **Access Settings**: Click the extension icon in your browser toolbar
2. **Configure Provider**: Go to **Settings** tab to set up your AI provider:
   - **Ollama (Local)**: For privacy-focused local processing
   - **OpenAI**: For cloud-based GPT models
   - **Custom Endpoint**: For your own AI service
3. **Customize Context**: Go to **Context** tab to adjust website categories and prompts

## 🔐 Security & Verification

**Package Integrity**: All packages include SHA256 checksums for verification:

```
c299001fbafb0ce03dfc69f7ffecdc4dbfe6c85b7011fa35ab1a32380e694c19  ai-text-proofreader-chrome-edge-v0.2.0.zip
83679b205300d4f12a292dfc819feebb2d2edf1d9d0e4a5cd6d2f3cb14e3949b  ai-text-proofreader-firefox-v0.2.0.zip
```

To verify: Download the `checksums.txt` file and compare the SHA256 hash of your downloaded package.

## 🎯 Supported AI Providers

### Local/Self-Hosted (5 providers)
- Ollama (default local provider)
- llama.cpp Server  
- LM Studio
- Jan AI
- Custom Ollama instances

### Commercial APIs (8 providers) 
- OpenAI (GPT-3.5, GPT-4)
- Anthropic Claude
- Google Gemini
- Mistral AI
- Groq (fast inference)
- Together AI
- Perplexity
- Cohere

### Open Source APIs (7 providers)
- Hugging Face
- Replicate
- Fireworks AI
- DeepInfra
- Anyscale
- OpenRouter
- Novita AI

### Custom
- User-defined endpoints

## 🐛 Bug Fixes & Improvements

- Enhanced error handling for Chrome runtime and extension context scenarios
- Improved memory management and content script lifecycle
- Robust initialization with comprehensive startup validation
- Better loading states with clear user feedback
- Cross-browser API compatibility fixes

## 🔄 Migration from v0.1.x

No action required! Settings and preferences will be automatically migrated when upgrading from previous versions.

## 🆘 Support

For issues, questions, or feature requests:
- **GitHub Repository**: https://github.com/tactmaster/ai-text-proofreader-extension
- **Issues**: https://github.com/tactmaster/ai-text-proofreader-extension/issues
- **Documentation**: See README.md in the repository

---

**Multi-Browser Extension** | **v0.2.0** | **Built with ❤️ for Chrome, Edge & Firefox**