<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# AI Text Proofreader Chrome Extension

This is a Chrome extension that uses AI/LLM technology to proofread and correct text in web page input fields.

## ✅ Project Requirements
- [x] Create Chrome extension (Manifest V3)
- [x] Text box detection and editing functionality
- [x] Spell checking and grammar correction
- [x] LLM integration for proofreading
- [x] Support for local LLMs (Ollama)
- [x] Support for cloud LLMs (OpenAI)
- [x] User-friendly popup interface
- [x] Content script for webpage interaction

## ✅ Project Structure
```
├── manifest.json          # Extension manifest
├── background/
│   └── background.js      # Service worker for LLM integration
├── content/
│   ├── content.js         # Content script for webpage interaction
│   └── content.css        # Styles for injected elements
├── popup/
│   ├── popup.html         # Extension popup interface
│   ├── popup.css          # Popup styles
│   └── popup.js           # Popup functionality
└── README.md              # Documentation
```

## ✅ Features Implemented
- AI-powered text proofreading using local or cloud LLMs
- Automatic detection of text input fields
- Right-click context menu for text correction
- Floating button for easy access
- Suggestion mode with detailed explanations
- Settings panel for LLM configuration
- Support for Ollama (local), OpenAI, and custom endpoints
- Privacy-focused design with local processing option

## ✅ Installation & Usage
1. Load the extension in Chrome (chrome://extensions/ > Developer mode > Load unpacked)
2. Configure LLM provider in extension popup settings
3. Click on any text input field to see the proofread button
4. Right-click on text fields for more options
5. Use the extension popup for manual text correction

## Development Notes
- Uses Manifest V3 for modern Chrome extension standards
- Implements content scripts for webpage interaction
- Background service worker handles LLM API calls
- Supports multiple LLM providers for flexibility
- Privacy-conscious design with local LLM support
