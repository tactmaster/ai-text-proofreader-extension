# AI Text Proofreader Multi-Browser Extension

[![Test Extension](https://github.com/tactmaster/ai-text-proofreader-extension/actions/workflows/test.yml/badge.svg)](https://github.com/tactmaster/ai-text-proofreader-extension/actions/workflows/test.yml)
[![Code Quality & Security](https://github.com/tactmaster/ai-text-proofreader-extension/actions/workflows/quality.yml/badge.svg)](https://github.com/tactmaster/ai-text-proofreader-extension/actions/workflows/quality.yml)
[![Multi-Browser Build](https://github.com/tactmaster/ai-text-proofreader-extension/actions/workflows/release.yml/badge.svg)](https://github.com/tactmaster/ai-text-proofreader-extension/actions/workflows/release.yml)

A powerful **multi-browser extension** that works on **Chrome**, **Edge**, and **Firefox**, using AI/LLM technology to proofread and correct text in any text input field on web pages. Supports both local LLMs (via Ollama) and cloud-based services like OpenAI.

> **📖 Why This Project Exists**: This extension was created to address the gaps in existing proofreading tools, especially for users with dyslexia. Most tools assume users can spot their own mistakes and focus only on minor errors. This project leverages AI's contextual understanding to provide comprehensive text improvements while respecting privacy through local processing options. [Read the full story →](PROJECT_PURPOSE.md)

## 🌐 Browser Support

| Browser | Support | Manifest | Status |
|---------|---------|----------|---------|
| **Chrome** | ✅ Full | V3 | Ready |
| **Edge** | ✅ Full | V3 | Ready |
| **Firefox** | ✅ Full | V2 | Ready |

## Features

- 🌍 **Multi-Browser Compatible**: Works seamlessly on Chrome, Edge, and Firefox
- 🤖 **Dual-Button Interface**: Separate buttons for direct proofreading and advanced options
- 🎨 **Beautiful AI Icons**: Neural network inspired designs with modern gradients
- ⚡ **One-Click Proofreading**: Instant text correction with the dedicated AI button
- 🎛️ **Advanced Menu**: Separate menu button for suggestions, settings, and options
- 🏠 **Local LLM Support**: Use Ollama for privacy-focused, offline text correction
- ☁️ **Cloud LLM Integration**: Support for OpenAI and custom API endpoints
- 🎯 **Smart Text Detection**: Automatically detects text inputs and content-editable fields
- 💡 **Suggestion Mode**: Get detailed suggestions with explanations before applying changes
- 🖱️ **Easy Access**: Right-click context menu and floating buttons for quick access
- ⚙️ **Flexible Configuration**: Multiple LLM providers with customizable settings
- 🔄 **Shared Backend**: Same features and settings across all browsers
- 🧪 **Automated Testing**: Comprehensive test suite with 35+ tests ensuring reliability

## Installation

### 📦 Pre-built Packages (Recommended)

Download the latest release for your browser:

- **Chrome/Edge**: Download `ai-text-proofreader-chrome-edge-v{version}.zip`
- **Firefox**: Download `ai-text-proofreader-firefox-v{version}.zip`

#### Chrome/Edge Installation
1. Download and extract the Chrome/Edge package
2. Open Chrome/Edge and go to `chrome://extensions/` or `edge://extensions/`
3. Enable "Developer mode" in the top-right corner
4. Click "Load unpacked" and select the extracted folder

#### Firefox Installation
1. Download and extract the Firefox package
2. Open Firefox and go to `about:debugging`
3. Click "This Firefox"
4. Click "Load Temporary Add-on"
5. Select the `manifest.json` file from the extracted folder

### 🛠️ From Source (Development)

1. Clone or download this repository
2. Run `npm install` to install dependencies
3. Run `npm run build` to create browser packages
4. Follow the installation steps above for your browser

### Setting Up Local LLM (Recommended)

For privacy and offline usage, set up Ollama:

1. **Install Ollama**: Download from [ollama.ai](https://ollama.ai)
2. **Download a model**: Run `ollama pull llama2` or `ollama pull mistral`
3. **Enable CORS for browser access**: Set environment variable `$env:OLLAMA_ORIGINS="*"` (Windows) or `export OLLAMA_ORIGINS="*"` (Mac/Linux)
4. **Start the service**: Run `ollama serve`
5. **Configure the extension**: Set provider to "Local LLM" in extension settings

### Alternative: OpenAI Setup

1. Get an API key from [OpenAI](https://platform.openai.com/api-keys)
2. Open the extension popup
3. Go to Settings tab
4. Select "OpenAI" as provider
5. Enter your API key
6. Choose your preferred model (e.g., gpt-3.5-turbo)

## Usage

### Dual-Button System on Web Pages

1. **Click on any text input** (textarea, input field, or content-editable element)
2. **Two buttons will appear** with beautiful AI-themed icons:

#### 🤖 **AI Button** (Left - Purple Gradient)
- **One-click proofreading**: Instantly fixes text in place
- **Neural network icon**: Beautiful AI logo with circuit patterns
- **Direct action**: No menus, just immediate correction

#### ⚙️ **Menu Button** (Right - Blue Gradient)  
- **Advanced options**: Opens menu with additional features
- **Settings gear icon**: Professional gear with AI badge
- **Access to**: Suggestions mode, tone selection, extension settings

### Alternative Access Methods

- **Right-click** on any text field for quick menu access
- **Extension popup**: Click toolbar icon for manual text correction

### From Extension Popup

1. **Click the extension icon** in your browser toolbar
2. **Paste your text** in the text area
3. **Choose an action**:
   - **Proofread Text**: Get corrected version
   - **Get Suggestions**: Review individual corrections
4. **Copy or accept** the results

## Configuration

### Local LLM (Ollama)
- **Provider**: Local LLM (Ollama)
- **Model**: llama2, mistral, codellama, etc.
- **Endpoint**: http://localhost:11434 (default)

### OpenAI
- **Provider**: OpenAI
- **Model**: gpt-3.5-turbo, gpt-4, etc.
- **API Key**: Your OpenAI API key

### Custom Endpoint
- **Provider**: Custom Endpoint
- **Endpoint URL**: Your custom LLM API endpoint
- **Model**: Depends on your service

## 🧠 Designed for Everyone, Especially Dyslexic Users

This extension takes a fundamentally different approach to proofreading:

### 🎯 **Holistic Understanding**
- Analyzes **entire sentences** and **context**, not just individual errors
- Preserves your **original intent and voice** while improving clarity
- Handles complex **dyslexic writing patterns** that traditional tools miss

### 🤝 **User-Centered Design**
- **Doesn't assume you can spot mistakes** - provides complete, corrected text
- **No judgment of tone or style** - enhances what you wrote, doesn't change it
- **Clear before/after** - shows exactly what was improved and why

### 🔬 **AI-Powered Context**
- Uses advanced language models that understand **meaning and intent**
- **Better than grammar checkers** - fixes flow, readability, and comprehension
- **Learns your style** - adapts to your writing patterns over time

### 🏠 **Privacy by Design**
- **Local processing option** - your text never leaves your computer
- **No cloud dependency** - works offline with Ollama
- **Your data stays yours** - no storage, no tracking, no sharing

## Supported LLM Models

### Local Models (Ollama)
- **llama2**: General purpose, good for proofreading
- **mistral**: Fast and accurate
- **codellama**: Good for technical writing
- **neural-chat**: Optimized for chat and text correction

### OpenAI Models
- **gpt-3.5-turbo**: Fast and cost-effective
- **gpt-4**: Higher accuracy, more expensive
- **gpt-4-turbo**: Latest model with better performance

## Privacy & Security

- 🔒 **Local Processing**: When using Ollama, text never leaves your device
- 🔐 **Secure Storage**: API keys stored locally in Chrome's secure storage
- 🚫 **No Tracking**: Extension doesn't collect or transmit usage data
- 📝 **Minimal Permissions**: Only requests necessary permissions for functionality

## Troubleshooting

### Local LLM Issues
- **403 Error (CORS)**: Most common issue! Stop Ollama, set `$env:OLLAMA_ORIGINS="*"`, then restart `ollama serve`
- **Connection Failed**: Ensure Ollama is running and CORS is enabled (see setup instructions)
- **Model Not Found**: Download the model (`ollama pull llama2`)
- **Port Issues**: Check if port 11434 is available

#### 🚨 Quick Fix for 403 Error:
```powershell
# Stop Ollama
taskkill /f /im ollama.exe

# Set CORS environment variable
$env:OLLAMA_ORIGINS="*"

# Start Ollama with CORS enabled
ollama serve
```

### OpenAI Issues
- **API Key Invalid**: Verify your API key in OpenAI dashboard
- **Rate Limits**: You may have exceeded your API quota
- **Network Issues**: Check internet connection

### General Issues
- **Extension Not Working**: Reload the webpage and try again
- **Button Not Appearing**: Check if the text field is focusable
- **Settings Not Saving**: Check browser storage permissions

## Development

### Project Structure
```
├── manifest.json              # Chrome/Edge manifest (Manifest V3)
├── manifest-firefox.json      # Firefox manifest (Manifest V2)
├── shared/
│   └── browser-api.js         # Cross-browser API abstraction
├── background/
│   └── background.js          # Service worker/background script
├── content/
│   ├── content.js         # Content script for webpage interaction
│   └── content.css        # Styles for injected elements
├── popup/
│   ├── popup.html         # Extension popup interface
│   ├── popup.css          # Popup styles
│   └── popup.js           # Popup functionality
└── README.md              # This file
```

### Building
The extension is ready to use as-is. No build process required.

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Development & Testing

### Running Tests

The extension includes a comprehensive test suite with 35+ tests covering formatting preservation, context recognition, and anti-patterns.

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test categories
npm run test:formatting
npm run test:context
npm run test:anti-pattern

# Watch mode for development
npm run test:watch
```

### Automated Testing

GitHub Actions automatically run tests on:
- Every push to main and feature branches
- All pull requests
- Code quality and security checks
- Extension validation

### Test Categories

- **Formatting Preservation Tests**: Ensure AI responses preserve newlines, bullets, code blocks
- **Context Recognition Tests**: Validate website detection and context-aware prompts
- **Anti-Pattern Tests**: Verify formatting is NOT removed when it shouldn't be
- **Integration Tests**: Test real-world scenarios with complex formatting

## License

MIT License - see LICENSE file for details.

## Changelog

### v1.1.0
- Context-aware proofreading for different websites
- Smart button positioning to handle screen edges
- Comprehensive test suite with automated CI/CD
- Enhanced formatting preservation
- Custom prompt editor

### v1.0.0
- Initial release
- Local LLM support via Ollama
- OpenAI integration
- Custom endpoint support
- Context menu integration
- Popup interface
- Suggestion mode

## Support

For issues, questions, or feature requests, please open an issue on the GitHub repository.

---

**Note**: This extension requires either a local LLM setup (Ollama) or an API key for cloud services. The extension respects your privacy and can work entirely offline with local models.
