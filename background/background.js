// Background service worker for AI Text Proofreader
class LLMProofreader {
  constructor() {
    this.localEndpoint = 'http://127.0.0.1:11434/api/generate'; // Use 127.0.0.1 instead of localhost for better Chrome extension compatibility
    this.openAIEndpoint = 'https://api.openai.com/v1/chat/completions';
    
    // Comprehensive provider configurations
    this.providerConfigs = {
      // Local/Self-hosted providers
      'local': {
        name: 'Ollama (Local)',
        isLocal: true,
        defaultEndpoint: 'http://127.0.0.1:11434/api/generate',
        defaultModel: 'llama2',
        apiFormat: 'ollama'
      },
      'ollama': {
        name: 'Ollama',
        isLocal: true,
        defaultEndpoint: 'http://127.0.0.1:11434/api/generate',
        defaultModel: 'llama2',
        apiFormat: 'ollama'
      },
      'llama-cpp': {
        name: 'llama.cpp Server',
        isLocal: true,
        defaultEndpoint: 'http://localhost:8080/v1/chat/completions',
        defaultModel: 'model',
        apiFormat: 'openai'
      },
      'lm-studio': {
        name: 'LM Studio',
        isLocal: true,
        defaultEndpoint: 'http://localhost:1234/v1/chat/completions',
        defaultModel: 'local-model',
        apiFormat: 'openai'
      },
      'jan': {
        name: 'Jan',
        isLocal: true,
        defaultEndpoint: 'http://localhost:1337/v1/chat/completions',
        defaultModel: 'trinity-v1',
        apiFormat: 'openai'
      },

      // Commercial API providers
      'openai': {
        name: 'OpenAI',
        isLocal: false,
        defaultEndpoint: 'https://api.openai.com/v1/chat/completions',
        defaultModel: 'gpt-3.5-turbo',
        apiFormat: 'openai'
      },
      'anthropic': {
        name: 'Anthropic Claude',
        isLocal: false,
        defaultEndpoint: 'https://api.anthropic.com/v1/messages',
        defaultModel: 'claude-3-haiku-20240307',
        apiFormat: 'anthropic'
      },
      'google': {
        name: 'Google Gemini',
        isLocal: false,
        defaultEndpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
        defaultModel: 'gemini-pro',
        apiFormat: 'google'
      },
      'mistral': {
        name: 'Mistral AI',
        isLocal: false,
        defaultEndpoint: 'https://api.mistral.ai/v1/chat/completions',
        defaultModel: 'mistral-tiny',
        apiFormat: 'openai'
      },
      'groq': {
        name: 'Groq',
        isLocal: false,
        defaultEndpoint: 'https://api.groq.com/openai/v1/chat/completions',
        defaultModel: 'llama2-70b-4096',
        apiFormat: 'openai'
      },
      'together': {
        name: 'Together AI',
        isLocal: false,
        defaultEndpoint: 'https://api.together.xyz/v1/chat/completions',
        defaultModel: 'meta-llama/Llama-2-7b-chat-hf',
        apiFormat: 'openai'
      },
      'perplexity': {
        name: 'Perplexity',
        isLocal: false,
        defaultEndpoint: 'https://api.perplexity.ai/chat/completions',
        defaultModel: 'llama-2-70b-chat',
        apiFormat: 'openai'
      },
      'cohere': {
        name: 'Cohere',
        isLocal: false,
        defaultEndpoint: 'https://api.cohere.ai/v1/generate',
        defaultModel: 'command',
        apiFormat: 'cohere'
      },

      // Open Source API providers
      'huggingface': {
        name: 'Hugging Face',
        isLocal: false,
        defaultEndpoint: 'https://api-inference.huggingface.co/models',
        defaultModel: 'microsoft/DialoGPT-medium',
        apiFormat: 'huggingface'
      },
      'replicate': {
        name: 'Replicate',
        isLocal: false,
        defaultEndpoint: 'https://api.replicate.com/v1/predictions',
        defaultModel: 'meta/llama-2-7b-chat',
        apiFormat: 'replicate'
      },
      'fireworks': {
        name: 'Fireworks AI',
        isLocal: false,
        defaultEndpoint: 'https://api.fireworks.ai/inference/v1/chat/completions',
        defaultModel: 'accounts/fireworks/models/llama-v2-7b-chat',
        apiFormat: 'openai'
      },
      'deepinfra': {
        name: 'DeepInfra',
        isLocal: false,
        defaultEndpoint: 'https://api.deepinfra.com/v1/openai/chat/completions',
        defaultModel: 'meta-llama/Llama-2-7b-chat-hf',
        apiFormat: 'openai'
      },
      'anyscale': {
        name: 'Anyscale',
        isLocal: false,
        defaultEndpoint: 'https://api.endpoints.anyscale.com/v1/chat/completions',
        defaultModel: 'meta-llama/Llama-2-7b-chat-hf',
        apiFormat: 'openai'
      },
      'openrouter': {
        name: 'OpenRouter',
        isLocal: false,
        defaultEndpoint: 'https://openrouter.ai/api/v1/chat/completions',
        defaultModel: 'openai/gpt-3.5-turbo',
        apiFormat: 'openai'
      },
      'novita': {
        name: 'Novita AI',
        isLocal: false,
        defaultEndpoint: 'https://api.novita.ai/v3/openai/chat/completions',
        defaultModel: 'gryphe/mythomax-l2-13b',
        apiFormat: 'openai'
      },

      // Custom endpoint
      'custom': {
        name: 'Custom Endpoint',
        isLocal: false,
        defaultEndpoint: '',
        defaultModel: '',
        apiFormat: 'openai'
      }
    };
    
    this.settings = {
      provider: 'local', // Provider key from providerConfigs
      model: 'llama2', // default local model
      apiKey: '',
      customEndpoint: ''
    };
    this.loadSettings();
  }

  async loadSettings() {
    try {
      console.log('[DEBUG] Loading settings from chrome.storage.sync');
      const result = await chrome.storage.sync.get(['llmSettings']);
      if (result.llmSettings) {
        this.settings = { ...this.settings, ...result.llmSettings };
        console.log('[DEBUG] Settings loaded:', { 
          provider: this.settings.provider, 
          model: this.settings.model,
          hasApiKey: !!this.settings.apiKey,
          hasCustomEndpoint: !!this.settings.customEndpoint
        });
      } else {
        console.log('[DEBUG] No saved settings found, using defaults');
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }

  async testConnection() {
    console.log('[DEBUG] Testing connection...');
    
    if (this.settings.provider === 'local') {
      try {
        // Step 1: Check if Ollama is reachable
        console.log('[DEBUG] Step 1: Checking if Ollama server is reachable...');
        const healthResponse = await fetch('http://127.0.0.1:11434/api/version', {
          method: 'GET',
          mode: 'cors',
          credentials: 'omit',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          signal: AbortSignal.timeout(5000) // 5 second timeout
        });
        
        if (!healthResponse.ok) {
          throw new Error(`Ollama server responded with ${healthResponse.status}: ${healthResponse.statusText}`);
        }
        
        const versionData = await healthResponse.json();
        console.log('[DEBUG] Ollama version info:', versionData);
        
        // Step 2: Check available models
        console.log('[DEBUG] Step 2: Checking available models...');
        const modelsResponse = await fetch('http://127.0.0.1:11434/api/tags', {
          method: 'GET',
          mode: 'cors',
          credentials: 'omit',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          signal: AbortSignal.timeout(10000) // 10 second timeout for models
        });
        
        if (!modelsResponse.ok) {
          throw new Error(`Failed to fetch models: ${modelsResponse.status} ${modelsResponse.statusText}`);
        }
        
        const modelsData = await modelsResponse.json();
        const availableModels = modelsData.models?.map(m => m.name) || [];
        console.log('[DEBUG] Available models:', availableModels);
        
        // Step 3: Check if configured model exists
        const currentModel = this.settings.model;
        const modelExists = availableModels.some(name => 
          name === currentModel || 
          name === `${currentModel}:latest` || 
          name.startsWith(`${currentModel}:`)
        );
        
        // Determine the actual model name to use
        let actualModelName = currentModel;
        if (!modelExists) {
          // Try with :latest suffix
          const withLatest = availableModels.find(name => name === `${currentModel}:latest`);
          if (withLatest) {
            actualModelName = withLatest;
          } else {
            // Try finding any model that starts with the configured name
            const partialMatch = availableModels.find(name => name.startsWith(`${currentModel}:`));
            if (partialMatch) {
              actualModelName = partialMatch;
            }
          }
        }
        
        console.log(`[DEBUG] Model resolution: "${currentModel}" -> "${actualModelName}"`);
        
        if (availableModels.length === 0) {
          return {
            success: false,
            error: 'No models found in Ollama',
            suggestion: 'Download a model first: ollama pull llama2',
            details: {
              version: versionData,
              availableModels: [],
              configuredModel: currentModel
            }
          };
        }
        
        if (!modelExists && !availableModels.find(name => name.startsWith(`${currentModel}:`))) {
          return {
            success: false,
            error: `Model "${currentModel}" not found`,
            suggestion: `Available models: ${availableModels.join(', ')}. Download with: ollama pull ${currentModel}`,
            details: {
              version: versionData,
              availableModels: availableModels,
              configuredModel: currentModel
            }
          };
        }
        
        // Step 4: Test actual model inference (optional quick test)
        console.log('[DEBUG] Step 3: Testing model inference...');
        try {
          const testResponse = await fetch('http://127.0.0.1:11434/api/generate', {
            method: 'POST',
            mode: 'cors',
            credentials: 'omit',
            headers: { 
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({
              model: actualModelName, // Use the resolved model name
              prompt: 'Hello',
              stream: false,
              options: { max_tokens: 5 }
            }),
            signal: AbortSignal.timeout(15000) // 15 second timeout for inference
          });
          
          if (testResponse.ok) {
            const testData = await testResponse.json();
            console.log('[DEBUG] Model inference test successful');
            
            return {
              success: true,
              info: `Ollama v${versionData.version} - Model "${actualModelName}" working correctly`,
              details: {
                version: versionData,
                availableModels: availableModels,
                configuredModel: currentModel,
                actualModel: actualModelName,
                inferenceTest: 'passed'
              }
            };
          } else {
            const errorText = await testResponse.text();
            console.warn('[DEBUG] Model inference test failed:', testResponse.status, errorText);
            return {
              success: true, // Server is working, just inference failed
              info: `Ollama v${versionData.version} - Server OK, but model test failed`,
              warning: `Model "${actualModelName}" test failed: ${testResponse.status} ${errorText}`,
              details: {
                version: versionData,
                availableModels: availableModels,
                configuredModel: currentModel,
                actualModel: actualModelName,
                inferenceTest: 'failed',
                error: errorText
              }
            };
          }
        } catch (inferenceError) {
          console.warn('[DEBUG] Model inference test error:', inferenceError);
          return {
            success: true, // Server is working, just inference timed out
            info: `Ollama v${versionData.version} - Server OK, model test timed out`,
            warning: 'Model may be loading (first request can be slow)',
            details: {
              version: versionData,
              availableModels: availableModels,
              configuredModel: currentModel,
              actualModel: actualModelName,
              inferenceTest: 'timeout'
            }
          };
        }
        
      } catch (error) {
        console.error('[ERROR] Ollama connection test failed:', error);
        
        if (error.name === 'AbortError' || error.message.includes('timeout')) {
          return {
            success: false,
            error: 'Connection timeout',
            suggestion: 'Ollama may be starting up or under heavy load. Wait a moment and try again.',
            details: { error: error.message }
          };
        }
        
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
          return {
            success: false,
            error: 'Cannot connect to Ollama server',
            suggestion: 'Make sure Ollama is running: ollama serve',
            details: { 
              error: error.message,
              endpoint: 'http://localhost:11434',
              quickTest: 'Try visiting http://localhost:11434 in your browser'
            }
          };
        }
        
        return { 
          success: false, 
          error: error.message,
          suggestion: 'Check Ollama status and restart if needed',
          details: { error: error.message }
        };
      }
    } else if (this.settings.provider === 'openai') {
      if (!this.settings.apiKey) {
        return { success: false, error: 'No API key configured' };
      }
      
      try {
        // Test OpenAI API with a minimal request
        const response = await fetch('https://api.openai.com/v1/models', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.settings.apiKey}`,
            'Content-Type': 'application/json'
          },
          signal: AbortSignal.timeout(10000)
        });
        
        if (response.ok) {
          return { success: true, info: 'OpenAI API key is valid' };
        } else {
          const errorData = await response.text();
          return { success: false, error: `API key invalid: ${response.status} ${errorData}` };
        }
      } catch (error) {
        return { success: false, error: 'OpenAI API connection failed: ' + error.message };
      }
    } else if (this.settings.provider === 'custom') {
      if (!this.settings.customEndpoint) {
        return { success: false, error: 'No custom endpoint configured' };
      }
      
      try {
        // Basic connectivity test for custom endpoint
        const response = await fetch(this.settings.customEndpoint, {
          method: 'HEAD',
          signal: AbortSignal.timeout(10000)
        });
        
        return { 
          success: response.ok, 
          info: response.ok ? 'Custom endpoint is reachable' : `Endpoint returned ${response.status}`
        };
      } catch (error) {
        return { success: false, error: 'Custom endpoint unreachable: ' + error.message };
      }
    }
    
    return { success: false, error: 'Unknown provider configuration' };
  }

  async saveSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    await chrome.storage.sync.set({ llmSettings: this.settings });
  }

  async queryProvider(prompt) {
    const config = this.getProviderConfig(this.settings.provider);
    if (!config) {
      throw new Error(`Unknown provider: ${this.settings.provider}`);
    }

    console.log(`[DEBUG] Using ${config.name} provider`);

    if (config.isLocal) {
      return await this.queryLocalProvider(prompt, config);
    } else {
      return await this.queryRemoteProvider(prompt, config);
    }
  }

  async queryLocalProvider(prompt, config) {
    const endpoint = this.settings.customEndpoint || config.defaultEndpoint;
    const model = this.settings.model || config.defaultModel;
    
    console.log(`[DEBUG] Local provider endpoint: ${endpoint}, model: ${model}`);
    
    let requestBody, response;
    
    if (config.apiFormat === 'ollama') {
      // Ollama format
      requestBody = {
        model: model,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.1
        }
      };
    } else {
      // OpenAI-compatible format for other local providers
      requestBody = {
        model: model,
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: 0.1,
        max_tokens: 2000
      };
    }

    response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Local LLM request failed: ${response.status} ${response.statusText}. ${errorBody}`);
    }

    const data = await response.json();
    
    if (config.apiFormat === 'ollama') {
      return data.response || '';
    } else {
      return data.choices?.[0]?.message?.content || data.text || '';
    }
  }

  async queryRemoteProvider(prompt, config) {
    if (!this.settings.apiKey) {
      throw new Error(`API key required for ${config.name}`);
    }

    const endpoint = this.settings.customEndpoint || config.defaultEndpoint;
    const model = this.settings.model || config.defaultModel;
    
    console.log(`[DEBUG] Remote provider: ${config.name}, endpoint: ${endpoint}, model: ${model}`);

    let requestBody, headers;

    if (config.apiFormat === 'openai') {
      headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.settings.apiKey}`
      };
      requestBody = {
        model: model,
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: 0.1,
        max_tokens: 2000
      };
    } else if (config.apiFormat === 'anthropic') {
      headers = {
        'Content-Type': 'application/json',
        'x-api-key': this.settings.apiKey,
        'anthropic-version': '2023-06-01'
      };
      requestBody = {
        model: model,
        max_tokens: 2000,
        messages: [
          { role: 'user', content: prompt }
        ]
      };
    } else if (config.apiFormat === 'google') {
      const url = `${endpoint}?key=${this.settings.apiKey}`;
      headers = {
        'Content-Type': 'application/json'
      };
      requestBody = {
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 2000
        }
      };
      
      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`${config.name} request failed: ${response.status} ${response.statusText}. ${errorBody}`);
      }
      
      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } else if (config.apiFormat === 'cohere') {
      headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.settings.apiKey}`
      };
      requestBody = {
        model: model,
        prompt: prompt,
        max_tokens: 2000,
        temperature: 0.1
      };
    } else if (config.apiFormat === 'huggingface') {
      headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.settings.apiKey}`
      };
      requestBody = {
        inputs: prompt,
        parameters: {
          max_new_tokens: 2000,
          temperature: 0.1
        }
      };
    } else if (config.apiFormat === 'replicate') {
      headers = {
        'Content-Type': 'application/json',
        'Authorization': `Token ${this.settings.apiKey}`
      };
      requestBody = {
        version: model,
        input: {
          prompt: prompt,
          max_length: 2000,
          temperature: 0.1
        }
      };
    } else {
      // Default to OpenAI format for unknown providers
      headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.settings.apiKey}`
      };
      requestBody = {
        model: model,
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: 0.1,
        max_tokens: 2000
      };
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`${config.name} request failed: ${response.status} ${response.statusText}. ${errorBody}`);
    }

    const data = await response.json();
    
    if (config.apiFormat === 'anthropic') {
      return data.content?.[0]?.text || '';
    } else if (config.apiFormat === 'cohere') {
      return data.generations?.[0]?.text || '';
    } else if (config.apiFormat === 'huggingface') {
      return Array.isArray(data) ? data[0]?.generated_text || '' : data.generated_text || '';
    } else if (config.apiFormat === 'replicate') {
      return data.output?.join('') || '';
    } else {
      // OpenAI and OpenAI-compatible formats
      return data.choices?.[0]?.message?.content || data.response || data.text || '';
    }
  }

  getProviderConfig(provider) {
    return this.providerConfigs[provider] || null;
  }

  async proofreadText(text) {
    console.log(`[DEBUG] Starting proofreading with provider: ${this.settings.provider}`);
    console.log(`[DEBUG] Settings:`, { 
      provider: this.settings.provider, 
      model: this.settings.model, 
      hasApiKey: !!this.settings.apiKey,
      customEndpoint: this.settings.customEndpoint 
    });
    
    const prompt = `INSTRUCTION: Correct spelling and grammar errors in the text below. Output ONLY the corrected text. Do NOT include any introductory phrases, explanations, or conversational text.

INPUT TEXT:
"${text}"

OUTPUT (corrected text only):`;

    try {
      const response = await this.queryProvider(prompt);
      console.log(`[DEBUG] Successfully received response, length: ${response?.length || 0}`);
      return this.cleanResponse(response);
    } catch (error) {
      console.error('LLM query failed:', error);
      
      // Enhanced error message with debugging info
      const debugInfo = {
        provider: this.settings.provider,
        model: this.settings.model,
        endpoint: this.settings.provider === 'local' ? this.localEndpoint : 
                 this.settings.provider === 'custom' ? this.settings.customEndpoint : 'OpenAI',
        textLength: text.length,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      };
      
      throw new Error(`Failed to proofread text: ${error.message}

Debug Information:
${JSON.stringify(debugInfo, null, 2)}

If using Ollama:
1. Check if running: visit http://localhost:11434
2. Check CORS: $env:OLLAMA_ORIGINS="chrome-extension://*,*"
3. Check model: ollama list
4. Restart: ollama serve`);
    }
  }

  async queryLocalLLM(prompt) {
    console.log(`[DEBUG] Attempting to connect to Ollama at ${this.localEndpoint}`);
    console.log(`[DEBUG] Using model: ${this.settings.model}`);
    console.log(`[DEBUG] Prompt length: ${prompt.length} characters`);
    
    try {
      // Quick health check first
      console.log(`[DEBUG] Performing health check...`);
      const healthCheck = await fetch('http://127.0.0.1:11434/api/version', {
        method: 'GET',
        mode: 'cors',
        credentials: 'omit',
        headers: {
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(3000) // Quick 3 second timeout
      });
      
      if (!healthCheck.ok) {
        throw new Error(`Ollama server not responding: ${healthCheck.status} ${healthCheck.statusText}`);
      }
      
      console.log(`[DEBUG] Health check passed, resolving model name...`);
      
      // Resolve the actual model name
      let actualModelName = this.settings.model;
      try {
        const modelsResponse = await fetch('http://127.0.0.1:11434/api/tags', {
          method: 'GET',
          mode: 'cors',
          credentials: 'omit',
          headers: {
            'Accept': 'application/json',
          },
          signal: AbortSignal.timeout(5000)
        });
        
        if (modelsResponse.ok) {
          const modelsData = await modelsResponse.json();
          const availableModels = modelsData.models || [];
          console.log('[DEBUG] Available models for resolution:', availableModels.map(m => m.name));
          
          // Try to find the actual model name
          const foundModel = availableModels.find(model => {
            const modelName = model.name.toLowerCase();
            const configName = this.settings.model.toLowerCase();
            
            return modelName === configName || 
                   modelName === `${configName}:latest` ||
                   modelName.startsWith(`${configName}:`);
          });
          
          if (foundModel) {
            actualModelName = foundModel.name;
            console.log('[DEBUG] Resolved model name:', actualModelName);
          } else {
            console.warn('[DEBUG] Could not resolve model name, using configured:', this.settings.model);
          }
        }
      } catch (modelResolutionError) {
        console.warn('[DEBUG] Model resolution failed, using configured name:', modelResolutionError);
      }
      
      console.log(`[DEBUG] Proceeding with model: ${actualModelName}`);
      
      const requestBody = {
        model: actualModelName, // Use resolved model name
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.1,
          top_p: 0.9,
          max_tokens: 500
        }
      };
      
      console.log(`[DEBUG] Request body:`, requestBody);
      console.log(`[DEBUG] Fetch URL: ${this.localEndpoint}`);
      console.log(`[DEBUG] Fetch headers: Content-Type: application/json, Accept: application/json`);
      console.log(`[DEBUG] CORS mode: cors, credentials: omit`);
      
      const response = await fetch(this.localEndpoint, {
        method: 'POST',
        mode: 'cors', // Explicitly set CORS mode
        credentials: 'omit', // Don't send credentials for CORS
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(30000) // 30 second timeout for generation
      });

      console.log(`[DEBUG] Response status: ${response.status} ${response.statusText}`);
      console.log(`[DEBUG] Response headers:`, Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[ERROR] Ollama request failed:`, {
          status: response.status,
          statusText: response.statusText,
          errorText: errorText,
          url: this.localEndpoint,
          model: this.settings.model
        });
        
        if (response.status === 403) {
          throw new Error(`CORS Error: Ollama needs CORS configuration. 
            
Current endpoint: ${this.localEndpoint}
Model: ${this.settings.model}
Response: ${errorText}

Fix steps:
1. Stop Ollama: taskkill /f /im ollama.exe
2. Set CORS: $env:OLLAMA_ORIGINS="chrome-extension://*,*"
3. Restart: ollama serve
4. Reload extension in Chrome

Debug info: Status ${response.status}, Headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()))}`);
        }
        
        if (response.status === 404) {
          // Check if it's a model not found error
          if (errorText.includes('model') || errorText.includes('not found')) {
            throw new Error(`Model "${actualModelName}" not found. 

Available models: run 'ollama list' in terminal
Download model: ollama pull ${this.settings.model}

Response: ${errorText}`);
          } else {
            throw new Error(`API endpoint not found. Make sure Ollama is running the correct version. Response: ${errorText}`);
          }
        }
        
        if (response.status === 500) {
          throw new Error(`Ollama server error. This might be a model loading issue or server overload.

Try:
1. Wait a moment and try again (model might be loading)
2. Restart Ollama: ollama serve
3. Check available models: ollama list

Response: ${errorText}`);
        }
        
        throw new Error(`Local LLM request failed: ${response.status} - ${response.statusText}. 
        
Debug info:
- Endpoint: ${this.localEndpoint}
- Configured Model: ${this.settings.model}
- Resolved Model: ${actualModelName}
- Response: ${errorText}
- Headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()))}

Check if Ollama is running: visit http://localhost:11434 in browser`);
      }

      const data = await response.json();
      console.log(`[DEBUG] Response data structure:`, Object.keys(data));
      console.log(`[DEBUG] Response length: ${data.response?.length || 0} characters`);
      
      if (!data.response) {
        console.warn(`[WARNING] No response field in Ollama response:`, data);
        throw new Error(`Ollama returned invalid response format. Expected 'response' field but got: ${JSON.stringify(Object.keys(data))}`);
      }
      
      // Clean up the response by removing common wrapper phrases
      let cleanedResponse = data.response?.trim() || prompt;
      cleanedResponse = this.cleanResponse(cleanedResponse);
      return cleanedResponse;
    } catch (error) {
      console.error(`[ERROR] Ollama connection error:`, error);
      
      if (error.name === 'AbortError') {
        if (error.message.includes('3000')) {
          throw new Error(`Ollama health check timed out. 
          
This usually means:
1. Ollama is not running - Start with: ollama serve
2. Ollama is starting up - Wait a moment and try again
3. Port 11434 is blocked by firewall

Quick test: Visit http://localhost:11434 in your browser`);
        } else {
          throw new Error(`Request to Ollama timed out after 30 seconds. 
          
This could mean:
1. Model is loading for the first time (can take a few minutes)
2. System is under heavy load
3. Model is too large for available memory

Try again in a moment, or try a smaller model like 'llama2:7b'`);
        }
      }
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        // This could be a CORS issue or network issue
        if (error.message.includes('CORS') || error.message.includes('cors')) {
          throw new Error(`CORS Error: Cannot connect to Ollama due to CORS policy.

This means Ollama's CORS configuration is not working properly.

Fix steps:
1. Stop Ollama: taskkill /f /im ollama.exe
2. Set CORS environment variable: $env:OLLAMA_ORIGINS="chrome-extension://*,*"
3. Restart Ollama: ollama serve
4. Reload this extension in Chrome

Current error: ${error.message}`);
        }
        
        throw new Error(`Cannot connect to Ollama server at ${this.localEndpoint}
        
Possible causes:
1. Ollama is not running - Start with: ollama serve
2. Wrong port - Ollama default is 11434
3. CORS not enabled - Set: $env:OLLAMA_ORIGINS="chrome-extension://*,*"
4. Firewall blocking connection

Debug: ${error.message}

Quick test: Visit http://127.0.0.1:11434 in your browser`);
      }
      
      throw error;
    }
  }

  // Clean response by removing common wrapper phrases that AI models add
  cleanResponse(response) {
    if (!response || typeof response !== 'string') {
      return response;
    }

    let cleaned = response.trim();
    
    // Remove common wrapper phrases (case insensitive)
    const wrapperPhrases = [
      /^here\s+is\s+the\s+corrected?\s+text:?\s*/i,
      /^here\s+is\s+the\s+improved\s+text:?\s*/i,
      /^here\s+is\s+an?\s+improved\s+version:?\s*/i,
      /^corrected\s+text:?\s*/i,
      /^improved\s+text:?\s*/i,
      /^fixed\s+text:?\s*/i,
      /^revised\s+text:?\s*/i,
      /^the\s+corrected?\s+text\s+is:?\s*/i,
      /^the\s+improved\s+text\s+is:?\s*/i,
      /^here\s+you\s+go:?\s*/i,
      /^here\s+it\s+is:?\s*/i,
      /^sure[,!]?\s+here\s+is\s+the\s+corrected?\s+text:?\s*/i,
      /^certainly[,!]?\s+here\s+is\s+the\s+corrected?\s+text:?\s*/i,
      /^sure[,!]?\s+i'?d\s+be\s+happy\s+to\s+help.*?here'?s.*?:?\s*/i,
      /^i'?d\s+be\s+happy\s+to\s+help.*?here'?s.*?:?\s*/i,
      /^of\s+course[,!]?\s+here'?s.*?:?\s*/i,
      /^absolutely[,!]?\s+here'?s.*?:?\s*/i,
      /^here'?s\s+the\s+corrected?\s+version:?\s*/i,
      /^here'?s\s+an?\s+improved\s+version:?\s*/i,
      /^here'?s\s+the\s+proofread\s+text:?\s*/i,
      /^let\s+me\s+help.*?:?\s*/i,
      /^i\s+can\s+help.*?:?\s*/i
    ];

    // Remove wrapper phrases from the beginning
    for (const phrase of wrapperPhrases) {
      cleaned = cleaned.replace(phrase, '');
    }

    // Additional aggressive cleaning for conversational responses
    // Look for patterns like "Sure, I'd be happy to help... Here's..."
    const conversationalPatterns = [
      /^[^.!?]*?(here'?s\s+(?:the\s+)?(?:corrected?|improved?|proofread|revised)\s+(?:version|text)(?:\s+of\s+(?:the\s+)?text)?):?\s*/i,
      /^[^.!?]*?(here'?s\s+an?\s+(?:corrected?|improved?|better)\s+version):?\s*/i,
      /^[^.!?]*?(?:here'?s\s+what\s+i\s+suggest|here\s+are\s+the\s+corrections?):?\s*/i
    ];

    for (const pattern of conversationalPatterns) {
      const match = cleaned.match(pattern);
      if (match) {
        cleaned = cleaned.substring(match[0].length);
        break;
      }
    }

    // Remove quotes if the entire response is wrapped in quotes
    if ((cleaned.startsWith('"') && cleaned.endsWith('"')) ||
        (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
      cleaned = cleaned.slice(1, -1);
    }

    // Remove markdown code blocks if present
    cleaned = cleaned.replace(/^```[\w]*\s*\n?/, '').replace(/\n?```\s*$/, '');

    // Preserve formatting by only removing excessive leading/trailing whitespace
    // Remove only excessive leading/trailing blank lines, but preserve intentional newlines
    cleaned = cleaned.replace(/^\n{3,}/, '\n\n').replace(/\n{3,}$/, '\n\n');
    
    // Trim only space/tab characters from start and end, but preserve newlines
    cleaned = cleaned.replace(/^[ \t]+/, '').replace(/[ \t]+$/, '');
    
    // If result is just whitespace, return empty string
    if (!cleaned.trim()) {
      return '';
    }
    
    return cleaned;
  }

  async proofreadTextWithContext(text, context) {
    console.log(`[DEBUG] Starting context-aware proofreading`);
    console.log(`[DEBUG] Context:`, context);
    
    try {
      const response = await this.queryProvider(context.prompt);
      
      console.log(`[DEBUG] Context-aware proofreading completed`);
      return this.cleanResponse(response);
    } catch (error) {
      console.error('Context-aware proofreading failed:', error);
      throw new Error(`Failed to proofread text with context: ${error.message}`);
    }
  }

  async getSuggestionsWithContext(text, context) {
    console.log(`[DEBUG] Getting context-aware suggestions`);
    console.log(`[DEBUG] Context:`, context);
    
    // Modify the prompt to get suggestions instead of corrections
    const suggestionPrompt = context.prompt.replace(
      /Return only the corrected text.*?:/gi,
      'Provide specific suggestions for improvement:'
    ).replace(
      /Corrected.*?:/gi,
      'Suggestions:'
    );
    
    try {
      const response = await this.queryProvider(suggestionPrompt);
      
      // Parse suggestions from response
      const suggestions = this.parseSuggestions(response, text);
      console.log(`[DEBUG] Generated ${suggestions.length} context-aware suggestions`);
      return suggestions;
    } catch (error) {
      console.error('Context-aware suggestions failed:', error);
      throw new Error(`Failed to get suggestions with context: ${error.message}`);
    }
  }

  parseSuggestions(responseText, originalText) {
    // Simple suggestion parsing - in a real implementation, this would be more sophisticated
    const suggestions = [];
    
    // Split response into lines and look for suggestion patterns
    const lines = responseText.split('\n').filter(line => line.trim());
    
    lines.forEach((line, index) => {
      if (line.includes('→') || line.includes('->')) {
        // Format: "original → corrected"
        const parts = line.split(/→|->/).map(p => p.trim());
        if (parts.length === 2) {
          suggestions.push({
            type: 'Correction',
            original: parts[0].replace(/['"]/g, ''),
            corrected: parts[1].replace(/['"]/g, ''),
            explanation: `Context-aware improvement for ${originalText.slice(0, 20)}...`
          });
        }
      } else if (line.toLowerCase().includes('suggest') || line.toLowerCase().includes('improve')) {
        // General suggestion
        suggestions.push({
          type: 'Suggestion',
          original: originalText.slice(0, 50) + '...',
          corrected: line.trim(),
          explanation: 'General improvement suggestion'
        });
      }
    });
    
    // If no specific suggestions found, create a general one
    if (suggestions.length === 0 && responseText.trim()) {
      suggestions.push({
        type: 'General',
        original: originalText,
        corrected: responseText.trim(),
        explanation: 'AI-generated improvement'
      });
    }
    
    return suggestions.slice(0, 5); // Limit to 5 suggestions
  }

  async queryOpenAI(prompt) {
    if (!this.settings.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch(this.openAIEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.settings.apiKey}`
      },
      body: JSON.stringify({
        model: this.settings.model || 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.1
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI request failed: ${response.status}`);
    }

    const data = await response.json();
    let cleanedResponse = data.choices?.[0]?.message?.content?.trim() || prompt;
    cleanedResponse = this.cleanResponse(cleanedResponse);
    return cleanedResponse;
  }

  async queryCustomEndpoint(prompt) {
    if (!this.settings.customEndpoint) {
      throw new Error('Custom endpoint not configured');
    }

    const response = await fetch(this.settings.customEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt,
        max_tokens: 500,
        temperature: 0.1
      })
    });

    if (!response.ok) {
      throw new Error(`Custom endpoint request failed: ${response.status}`);
    }

    const data = await response.json();
    let cleanedResponse = data.response || data.text || data.output || text;
    cleanedResponse = this.cleanResponse(cleanedResponse);
    return cleanedResponse;
  }

  async getSuggestions(text) {
    const prompt = `Analyze the following text and provide specific spelling and grammar corrections. Return a JSON array of suggestions with the format: [{"original": "mistake", "corrected": "correction", "type": "spelling|grammar", "explanation": "brief explanation"}].

Text to analyze:
"${text}"

Suggestions:`;

    try {
      let response;
      
      if (this.settings.provider === 'local') {
        response = await this.queryLocalLLM(prompt);
      } else if (this.settings.provider === 'openai') {
        response = await this.queryOpenAI(prompt);
      } else if (this.settings.provider === 'custom') {
        response = await this.queryCustomEndpoint(prompt);
      }
      
      // Try to parse JSON response
      try {
        return JSON.parse(response);
      } catch (e) {
        // If not valid JSON, return empty array
        return [];
      }
    } catch (error) {
      console.error('Failed to get suggestions:', error);
      return [];
    }
  }
}

// Initialize the proofreader
const proofreader = new LLMProofreader();

// Handle messages from content script and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log(`[DEBUG] Received message:`, request);
  
  switch (request.action) {
    case 'proofread':
      proofreader.proofreadText(request.text)
        .then(correctedText => {
          sendResponse({ success: true, correctedText });
        })
        .catch(error => {
          sendResponse({ success: false, error: error.message });
        });
      return true; // Will respond asynchronously

    case 'proofreadWithContext':
      proofreader.proofreadTextWithContext(request.text, request.context)
        .then(correctedText => {
          sendResponse({ success: true, correctedText });
        })
        .catch(error => {
          sendResponse({ success: false, error: error.message });
        });
      return true; // Will respond asynchronously

    case 'getSuggestions':
      proofreader.getSuggestions(request.text)
        .then(suggestions => {
          sendResponse({ success: true, suggestions });
        })
        .catch(error => {
          sendResponse({ success: false, error: error.message });
        });
      return true; // Will respond asynchronously

    case 'getSuggestionsWithContext':
      proofreader.getSuggestionsWithContext(request.text, request.context)
        .then(suggestions => {
          sendResponse({ success: true, suggestions });
        })
        .catch(error => {
          sendResponse({ success: false, error: error.message });
        });
      return true; // Will respond asynchronously

    case 'getSettings':
      sendResponse({ settings: proofreader.settings });
      break;

    case 'saveSettings':
      proofreader.saveSettings(request.settings)
        .then(() => {
          sendResponse({ success: true });
        })
        .catch(error => {
          sendResponse({ success: false, error: error.message });
        });
      return true; // Will respond asynchronously

    case 'testConnection':
      proofreader.testConnection()
        .then(result => {
          sendResponse(result);
        })
        .catch(error => {
          sendResponse({ success: false, error: error.message });
        });
      return true; // Will respond asynchronously

    default:
      console.warn(`[WARNING] Unknown action: ${request.action}`);
      sendResponse({ success: false, error: 'Unknown action' });
  }
});

// Handle extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('AI Text Proofreader extension installed');
});
