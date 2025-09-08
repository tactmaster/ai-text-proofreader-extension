<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# AI Text Proofreader Multi-Browser Extension

This is a **multi-browser extension** that works on Chrome, Edge, and Firefox, using AI/LLM technology to proofread and correct text in web page input fields.

## ✅ Project Requirements
- [x] Create Chrome extension (Manifest V3)
- [x] Create Edge extension (Manifest V3) 
- [x] Create Firefox extension (Manifest V2)
- [x] Multi-browser support with shared backend
- [x] Text box detection and editing functionality
- [x] Spell checking and grammar correction
- [x] LLM integration for proofreading
- [x] Support for local LLMs (Ollama)
- [x] Support for cloud LLMs (OpenAI)
- [x] User-friendly popup interface
- [x] Content script for webpage interaction
- [x] Cross-browser API abstraction layer

## ✅ Multi-Browser Architecture
```
├── manifest.json              # Chrome/Edge (Manifest V3)
├── manifest-firefox.json      # Firefox (Manifest V2)
├── shared/
│   └── browser-api.js         # Cross-browser API abstraction
├── background/
│   └── background.js          # Service worker (shared backend)
├── content/
│   ├── content.js             # Content script (shared)
│   ├── context-detector.js    # Context detection (shared)
│   └── content.css            # Styles (shared)
├── popup/
│   ├── popup.html             # Extension popup (shared)
│   ├── popup.css              # Popup styles (shared)
│   └── popup.js               # Popup functionality (shared)
├── scripts/
│   └── build-multi-browser.sh # Multi-browser build script
└── README.md                  # Documentation
```

## ✅ Browser Compatibility
- **Chrome**: Full support with Manifest V3
- **Edge**: Full support with Manifest V3 (same as Chrome)
- **Firefox**: Full support with Manifest V2 adaptation
- **Shared Backend**: Same codebase and features across all browsers
- **API Abstraction**: Unified chrome.*/browser.* API handling

## ✅ Features Implemented
- AI-powered text proofreading using local or cloud LLMs
- Automatic detection of text input fields
- Right-click context menu for text correction
- Floating button for easy access
- Suggestion mode with detailed explanations
- Settings panel for LLM configuration
- Support for Ollama (local), OpenAI, and custom endpoints
- Privacy-focused design with local processing option
- **Cross-browser compatibility** with shared backend
- **Multi-browser build system** for automated packaging

## ✅ Installation & Usage

### Chrome/Edge
1. Download the Chrome/Edge package from releases
2. Extract and load in chrome://extensions/ or edge://extensions/
3. Enable Developer mode > Load unpacked

### Firefox  
1. Download the Firefox package from releases
2. Go to about:debugging > This Firefox > Load Temporary Add-on
3. Select manifest.json from extracted folder

### Configuration
1. Click extension icon to access settings
2. Configure LLM provider in Settings tab
3. Customize prompts in Context tab
4. Use on any webpage by clicking text fields

## ✅ Build System
- `npm run build` - Build packages for all browsers
- Generates separate packages: Chrome/Edge (.zip) and Firefox (.zip)
- Automated release workflow creates artifacts for each browser
- SHA256 checksums for package verification
- Browser-specific README files and installation instructions

## Development Notes
- Uses cross-browser API abstraction for compatibility
- Shared backend ensures feature parity across browsers
- Manifest V3 for Chrome/Edge, V2 for Firefox
- Background service worker for Chromium, background scripts for Firefox
- Implements content scripts for webpage interaction
- Supports multiple LLM providers for flexibility
- Privacy-conscious design with local LLM support

## Release Artifacts
When releases are created, the following artifacts are automatically generated:
- `ai-text-proofreader-chrome-edge-v{version}.zip` - Chrome/Edge package
- `ai-text-proofreader-firefox-v{version}.zip` - Firefox package  
- `checksums.txt` - SHA256 verification hashes
- `INSTALLATION.md` - Multi-browser installation guide
