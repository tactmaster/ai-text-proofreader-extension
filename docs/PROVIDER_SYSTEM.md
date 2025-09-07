# AI Text Proofreader - Comprehensive Provider System

## Overview
The AI Text Proofreader extension now supports 21 different AI providers across multiple categories, providing users with extensive flexibility in choosing their preferred AI service.

## Supported Providers

### Local/Self-Hosted (5 providers)
- **Ollama (Local)** - `'local'` - Default local provider
- **Ollama** - `'ollama'` - Direct Ollama access
- **llama.cpp Server** - `'llama-cpp'` - Local llama.cpp server
- **LM Studio** - `'lm-studio'` - Local LM Studio server
- **Jan** - `'jan'` - Local Jan AI server

### Commercial APIs (8 providers)
- **OpenAI** - `'openai'` - GPT-3.5, GPT-4, etc.
- **Anthropic Claude** - `'anthropic'` - Claude-3 models
- **Google Gemini** - `'google'` - Gemini Pro models
- **Mistral AI** - `'mistral'` - Mistral models
- **Groq** - `'groq'` - Fast inference with Llama models
- **Together AI** - `'together'` - Various open source models
- **Perplexity** - `'perplexity'` - Perplexity AI models
- **Cohere** - `'cohere'` - Command models

### Open Source APIs (7 providers)
- **Hugging Face** - `'huggingface'` - HF Inference API
- **Replicate** - `'replicate'` - Cloud model hosting
- **Fireworks AI** - `'fireworks'` - Fast inference platform
- **DeepInfra** - `'deepinfra'` - GPU inference platform
- **Anyscale** - `'anyscale'` - Ray-based inference
- **OpenRouter** - `'openrouter'` - Multi-model router
- **Novita AI** - `'novita'` - GPU cloud platform

### Custom (1 provider)
- **Custom Endpoint** - `'custom'` - User-defined endpoint

## Technical Implementation

### Provider Configuration Structure
Each provider is configured with:
```javascript
{
  name: 'Human-readable name',
  isLocal: true/false,
  defaultEndpoint: 'API endpoint URL',
  defaultModel: 'default model name',
  apiFormat: 'API format type'
}
```

### API Format Support
- **ollama** - Ollama's native API format
- **openai** - OpenAI-compatible format (most providers)
- **anthropic** - Anthropic's specific format
- **google** - Google Gemini API format
- **cohere** - Cohere's native format
- **huggingface** - Hugging Face Inference API
- **replicate** - Replicate's prediction API

### Unified Provider Interface
The system uses a unified `queryProvider()` method that:
1. Gets provider configuration
2. Routes to appropriate handler (local vs remote)
3. Formats requests based on API type
4. Handles responses uniformly

### Key Features
- **Automatic Format Detection** - Each provider uses its optimal API format
- **Fallback Handling** - Unknown providers default to OpenAI format
- **Unified Error Handling** - Consistent error messages across providers
- **Custom Endpoint Support** - Override default endpoints for any provider
- **Model Configuration** - Set custom models per provider

## Usage Examples

### Configuration
Users can select providers from organized dropdown:
- Local/Self-Hosted section for privacy-focused users
- Commercial APIs for high-quality results
- Open Source APIs for cost-effective solutions
- Custom endpoint for proprietary setups

### API Key Requirements
- **Local providers**: No API key needed
- **Commercial providers**: API key required
- **Open source providers**: API key required
- **Custom**: Depends on implementation

## Testing
Comprehensive test suite covers:
- Provider configuration validation (21 providers)
- API format categorization
- Backward compatibility
- Integration with existing codebase

## Version History
- **v1.2.0** - Added comprehensive provider system (21 providers)
- **v1.1.0** - Smart UI positioning and enhanced testing
- **v1.0.0** - Initial release with basic provider support

## Future Enhancements
- Provider-specific model suggestions
- Provider performance metrics
- Auto-detection of available local providers
- Provider-specific optimization settings
