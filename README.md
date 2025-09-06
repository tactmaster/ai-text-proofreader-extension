# AI Text Proofreader Chrome Extension

[![Test Chrome Extension](https://github.com/tactmaster/ai-text-proofreader-extension/actions/workflows/test.yml/badge.svg)](https://github.com/tactmaster/ai-text-proofreader-extension/actions/workflows/test.yml)
[![Code Quality & Security](https://github.com/tactmaster/ai-text-proofreader-extension/actions/workflows/quality.yml/badge.svg)](https://github.com/tactmaster/ai-text-proofreader-extension/actions/workflows/quality.yml)

A powerful Chrome extension that uses AI/LLM technology to proofread and correct text in any text input field on web pages. Supports both local LLMs (via Ollama) and cloud-based services like OpenAI.

## Features

- 🤖 **AI-Powered Proofreading**: Automatic spelling and grammar correction using advanced LLMs
- 🏠 **Local LLM Support**: Use Ollama for privacy-focused, offline text correction
- ☁️ **Cloud LLM Integration**: Support for OpenAI and custom API endpoints
- 🎯 **Smart Text Detection**: Automatically detects text inputs and content-editable fields
- 💡 **Suggestion Mode**: Get detailed suggestions with explanations before applying changes
- 🖱️ **Easy Access**: Right-click context menu and floating button for quick access
- ⚙️ **Flexible Configuration**: Multiple LLM providers with customizable settings
- 🧪 **Automated Testing**: Comprehensive test suite with 35+ tests ensuring reliability

## Installation

### From Source (Development)

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top-right corner
4. Click "Load unpacked" and select the extension directory
5. The extension will appear in your Chrome toolbar

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

### On Web Pages

1. **Click on any text input** (textarea, input field, or content-editable element)
2. **Click the "AI" button** that appears
3. **Or right-click** on the text field for more options:
   - Full Proofread: Automatically correct all text
   - Get Suggestions: Review suggestions before applying
   - Settings: Configure LLM provider

### From Extension Popup

1. **Click the extension icon** in Chrome toolbar
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
- **Settings Not Saving**: Check Chrome storage permissions

## Development

### Project Structure
```
├── manifest.json          # Extension manifest (Manifest V3)
├── background/
│   └── background.js      # Service worker for LLM integration
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
