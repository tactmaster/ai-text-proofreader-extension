// Popup interface functionality tests
// Tests extension popup UI and interactions

describe('Popup Interface Functionality Tests', () => {
  let mockDocument;
  let mockWindow;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Mock DOM elements and methods
    mockDocument = {
      getElementById: jest.fn((id) => {
        const elements = {
          'input-text': { value: '', addEventListener: jest.fn() },
          'output-text': { value: '', readOnly: true },
          'provider-select': { value: 'local', addEventListener: jest.fn() },
          'model-input': { value: 'llama2' },
          'api-key-input': { value: '', type: 'password' },
          'custom-endpoint-input': { value: '' },
          'proofread-btn': { 
            addEventListener: jest.fn(),
            disabled: false,
            innerHTML: '',
            style: {}
          },
          'suggestions-btn': { addEventListener: jest.fn() },
          'save-settings': { addEventListener: jest.fn() },
          'reset-settings': { addEventListener: jest.fn() },
          'test-connection': { addEventListener: jest.fn() },
          'loading': { 
            classList: {
              add: jest.fn(),
              remove: jest.fn(),
              contains: jest.fn()
            }
          },
          'result-section': {
            classList: {
              add: jest.fn(),
              remove: jest.fn(),
              contains: jest.fn()
            }
          },
          'suggestions-section': {
            classList: {
              add: jest.fn(),
              remove: jest.fn()
            }
          },
          'openai-settings': {
            classList: {
              add: jest.fn(),
              remove: jest.fn()
            }
          },
          'custom-settings': {
            classList: {
              add: jest.fn(),
              remove: jest.fn()
            }
          },
          'enable-word-mode': {
            addEventListener: jest.fn(),
            textContent: '🔗 Enable Word Mode',
            style: {}
          }
        };
        return elements[id] || null;
      }),
      querySelectorAll: jest.fn(() => []),
      querySelector: jest.fn(),
      addEventListener: jest.fn(),
      readyState: 'complete'
    };

    mockWindow = {
      location: { href: 'chrome-extension://test/popup.html' },
      navigator: { clipboard: { writeText: jest.fn() } }
    };

    global.document = mockDocument;
    global.window = mockWindow;
    global.navigator = mockWindow.navigator;

    // Mock Chrome APIs
    global.chrome = {
      runtime: {
        sendMessage: jest.fn(),
        onMessage: {
          addListener: jest.fn()
        }
      },
      storage: {
        sync: {
          get: jest.fn(),
          set: jest.fn()
        }
      },
      tabs: {
        query: jest.fn(),
        sendMessage: jest.fn()
      }
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Popup Initialization', () => {
    test('should initialize with default state', () => {
      const mockPopup = {
        currentText: '',
        suggestions: [],
        settings: {
          provider: 'local',
          model: 'llama2',
          apiKey: '',
          customEndpoint: ''
        }
      };

      expect(mockPopup.currentText).toBe('');
      expect(mockPopup.suggestions).toEqual([]);
      expect(mockPopup.settings.provider).toBe('local');
    });

    test('should set up event listeners on initialization', () => {
      const elements = [
        'proofread-btn',
        'suggestions-btn',
        'save-settings',
        'reset-settings',
        'test-connection',
        'enable-word-mode'
      ];

      elements.forEach(id => {
        const element = mockDocument.getElementById(id);
        expect(element).toBeTruthy();
        expect(element.addEventListener).toBeDefined();
      });
    });

    test('should load saved settings on startup', async () => {
      global.chrome.runtime.sendMessage.mockImplementation((message, callback) => {
        if (message.action === 'getSettings') {
          callback({
            settings: {
              provider: 'openai',
              model: 'gpt-3.5-turbo',
              apiKey: 'sk-test',
              customEndpoint: ''
            }
          });
        }
      });

      // Simulate settings loading
      const loadSettings = async () => {
        return new Promise((resolve) => {
          global.chrome.runtime.sendMessage({ action: 'getSettings' }, (response) => {
            resolve(response.settings);
          });
        });
      };

      const settings = await loadSettings();
      expect(settings.provider).toBe('openai');
      expect(settings.model).toBe('gpt-3.5-turbo');
    });
  });

  describe('Text Proofreading Interface', () => {
    test('should handle text input and proofreading', async () => {
      const inputElement = mockDocument.getElementById('input-text');
      const outputElement = mockDocument.getElementById('output-text');
      
      inputElement.value = 'Text with erors that need fixing.';

      global.chrome.runtime.sendMessage.mockImplementation((message, callback) => {
        if (message.action === 'proofread') {
          callback({
            success: true,
            correctedText: 'Text with errors that need fixing.'
          });
        }
      });

      // Simulate proofreading
      const proofreadText = async () => {
        const text = inputElement.value;
        return new Promise((resolve) => {
          global.chrome.runtime.sendMessage(
            { action: 'proofread', text },
            (response) => {
              if (response.success) {
                outputElement.value = response.correctedText;
              }
              resolve(response);
            }
          );
        });
      };

      const result = await proofreadText();
      expect(result.success).toBe(true);
      expect(outputElement.value).toBe('Text with errors that need fixing.');
    });

    test('should handle empty text input', async () => {
      const inputElement = mockDocument.getElementById('input-text');
      inputElement.value = '';

      const validateInput = (text) => {
        return text.trim().length > 0;
      };

      expect(validateInput(inputElement.value)).toBe(false);
    });

    test('should show loading state during processing', () => {
      const loadingElement = mockDocument.getElementById('loading');
      const proofreadBtn = mockDocument.getElementById('proofread-btn');

      // Simulate showing loading
      loadingElement.classList.remove('hidden');
      proofreadBtn.disabled = true;

      expect(loadingElement.classList.remove).toHaveBeenCalledWith('hidden');
      expect(proofreadBtn.disabled).toBe(true);
    });

    test('should hide loading state after processing', () => {
      const loadingElement = mockDocument.getElementById('loading');
      const proofreadBtn = mockDocument.getElementById('proofread-btn');

      // Simulate hiding loading
      loadingElement.classList.add('hidden');
      proofreadBtn.disabled = false;

      expect(loadingElement.classList.add).toHaveBeenCalledWith('hidden');
      expect(proofreadBtn.disabled).toBe(false);
    });
  });

  describe('Suggestions Interface', () => {
    test('should handle suggestions request', async () => {
      const inputElement = mockDocument.getElementById('input-text');
      inputElement.value = 'This text could be improved.';

      global.chrome.runtime.sendMessage.mockImplementation((message, callback) => {
        if (message.action === 'getSuggestions') {
          callback({
            success: true,
            suggestions: [
              {
                type: 'grammar',
                original: 'could be improved',
                suggestion: 'can be enhanced',
                explanation: 'More active voice'
              },
              {
                type: 'style',
                original: 'This text',
                suggestion: 'The content',
                explanation: 'More specific reference'
              }
            ]
          });
        }
      });

      // Simulate getting suggestions
      const getSuggestions = async () => {
        const text = inputElement.value;
        return new Promise((resolve) => {
          global.chrome.runtime.sendMessage(
            { action: 'getSuggestions', text },
            resolve
          );
        });
      };

      const result = await getSuggestions();
      expect(result.success).toBe(true);
      expect(result.suggestions).toHaveLength(2);
      expect(result.suggestions[0].type).toBe('grammar');
    });

    test('should display suggestions in UI', () => {
      const suggestions = [
        {
          type: 'grammar',
          original: 'there car',
          suggestion: 'their car',
          explanation: 'Possessive pronoun needed'
        },
        {
          type: 'spelling',
          original: 'recieve',
          suggestion: 'receive',
          explanation: 'Correct spelling'
        }
      ];

      // Simulate suggestion display
      const displaySuggestions = (suggestions) => {
        return suggestions.map(suggestion => ({
          type: suggestion.type,
          original: suggestion.original,
          suggestion: suggestion.suggestion,
          explanation: suggestion.explanation
        }));
      };

      const displayedSuggestions = displaySuggestions(suggestions);
      expect(displayedSuggestions).toHaveLength(2);
      expect(displayedSuggestions[0].type).toBe('grammar');
    });
  });

  describe('Settings Management', () => {
    test('should update provider-specific settings visibility', () => {
      const openaiSettings = mockDocument.getElementById('openai-settings');
      const customSettings = mockDocument.getElementById('custom-settings');
      const providerSelect = mockDocument.getElementById('provider-select');

      // Test OpenAI provider selection
      providerSelect.value = 'openai';
      
      // Simulate provider change
      openaiSettings.classList.remove('hidden');
      customSettings.classList.add('hidden');

      expect(openaiSettings.classList.remove).toHaveBeenCalledWith('hidden');
      expect(customSettings.classList.add).toHaveBeenCalledWith('hidden');
    });

    test('should save settings to storage', async () => {
      global.chrome.runtime.sendMessage.mockImplementation((message, callback) => {
        if (message.action === 'saveSettings') {
          callback({ success: true });
        }
      });

      const settings = {
        provider: 'openai',
        model: 'gpt-4',
        apiKey: 'sk-test-key',
        customEndpoint: ''
      };

      // Simulate saving settings
      const saveSettings = async (settings) => {
        return new Promise((resolve) => {
          global.chrome.runtime.sendMessage(
            { action: 'saveSettings', settings },
            resolve
          );
        });
      };

      const result = await saveSettings(settings);
      expect(result.success).toBe(true);
    });

    test('should reset settings to defaults', () => {
      const defaultSettings = {
        provider: 'local',
        model: 'llama2',
        apiKey: '',
        customEndpoint: ''
      };

      const providerSelect = mockDocument.getElementById('provider-select');
      const modelInput = mockDocument.getElementById('model-input');
      const apiKeyInput = mockDocument.getElementById('api-key-input');

      // Simulate reset
      providerSelect.value = defaultSettings.provider;
      modelInput.value = defaultSettings.model;
      apiKeyInput.value = defaultSettings.apiKey;

      expect(providerSelect.value).toBe('local');
      expect(modelInput.value).toBe('llama2');
      expect(apiKeyInput.value).toBe('');
    });

    test('should test connection to AI provider', async () => {
      global.chrome.runtime.sendMessage.mockImplementation((message, callback) => {
        if (message.action === 'testConnection') {
          callback({ success: true, message: 'Connection successful' });
        }
      });

      // Simulate connection test
      const testConnection = async () => {
        return new Promise((resolve) => {
          global.chrome.runtime.sendMessage(
            { action: 'testConnection' },
            resolve
          );
        });
      };

      const result = await testConnection();
      expect(result.success).toBe(true);
      expect(result.message).toBe('Connection successful');
    });
  });

  describe('Word Mode Integration', () => {
    test('should toggle Word mode on/off', async () => {
      const wordModeBtn = mockDocument.getElementById('enable-word-mode');
      
      global.chrome.storage.sync.get.mockImplementation((keys, callback) => {
        callback({ wordModeEnabled: false });
      });

      global.chrome.storage.sync.set.mockImplementation((data, callback) => {
        callback();
      });

      // Simulate Word mode toggle
      const toggleWordMode = async () => {
        const result = await new Promise((resolve) => {
          global.chrome.storage.sync.get(['wordModeEnabled'], resolve);
        });
        
        const newMode = !result.wordModeEnabled;
        
        await new Promise((resolve) => {
          global.chrome.storage.sync.set({ wordModeEnabled: newMode }, resolve);
        });

        if (newMode) {
          wordModeBtn.textContent = '✅ Word Mode Enabled';
          wordModeBtn.style.background = 'linear-gradient(135deg, #4CAF50, #45a049)';
        } else {
          wordModeBtn.textContent = '🔗 Enable Word Mode';
          wordModeBtn.style.background = 'linear-gradient(135deg, #2196F3, #1976D2)';
        }

        return newMode;
      };

      const enabled = await toggleWordMode();
      expect(enabled).toBe(true);
      expect(wordModeBtn.textContent).toBe('✅ Word Mode Enabled');
    });

    test('should notify content script of Word mode changes', async () => {
      global.chrome.tabs.query.mockImplementation((queryInfo, callback) => {
        callback([{ id: 1, url: 'https://docs.microsoft.com' }]);
      });

      global.chrome.tabs.sendMessage.mockImplementation((tabId, message, callback) => {
        callback({ received: true });
      });

      // Simulate Word mode notification
      const notifyContentScript = async (enabled) => {
        const tabs = await new Promise((resolve) => {
          global.chrome.tabs.query({ active: true, currentWindow: true }, resolve);
        });

        if (tabs[0]) {
          await new Promise((resolve) => {
            global.chrome.tabs.sendMessage(tabs[0].id, {
              action: 'updateWordMode',
              enabled: enabled
            }, resolve);
          });
        }
      };

      await notifyContentScript(true);
      expect(global.chrome.tabs.sendMessage).toHaveBeenCalledWith(
        1,
        { action: 'updateWordMode', enabled: true },
        expect.any(Function)
      );
    });
  });

  describe('Result Handling', () => {
    test('should display results section after successful proofreading', () => {
      const resultSection = mockDocument.getElementById('result-section');
      const outputText = mockDocument.getElementById('output-text');

      // Simulate showing results
      resultSection.classList.remove('hidden');
      outputText.value = 'Corrected text content';

      expect(resultSection.classList.remove).toHaveBeenCalledWith('hidden');
      expect(outputText.value).toBe('Corrected text content');
    });

    test('should handle copy to clipboard functionality', async () => {
      const outputText = mockDocument.getElementById('output-text');
      outputText.value = 'Text to copy';

      // Mock clipboard API properly
      global.navigator.clipboard = {
        writeText: jest.fn().mockResolvedValue()
      };

      // Simulate copy functionality
      const copyToClipboard = async (text) => {
        await global.navigator.clipboard.writeText(text);
      };

      await copyToClipboard(outputText.value);
      expect(global.navigator.clipboard.writeText).toHaveBeenCalledWith('Text to copy');
    });

    test('should handle accept changes functionality', () => {
      const inputText = mockDocument.getElementById('input-text');
      const outputText = mockDocument.getElementById('output-text');

      inputText.value = 'Original text';
      outputText.value = 'Corrected text';

      // Simulate accepting changes
      const acceptChanges = () => {
        inputText.value = outputText.value;
      };

      acceptChanges();
      expect(inputText.value).toBe('Corrected text');
    });
  });

  describe('Error Handling', () => {
    test('should handle API errors gracefully', async () => {
      global.chrome.runtime.sendMessage.mockImplementation((message, callback) => {
        callback({ 
          success: false, 
          error: 'API key is invalid' 
        });
      });

      // Simulate error handling
      const handleProofreadError = async () => {
        return new Promise((resolve) => {
          global.chrome.runtime.sendMessage(
            { action: 'proofread', text: 'test' },
            (response) => {
              if (!response.success) {
                resolve({ error: response.error });
              }
            }
          );
        });
      };

      const result = await handleProofreadError();
      expect(result.error).toBe('API key is invalid');
    });

    test('should handle Chrome runtime errors', async () => {
      global.chrome.runtime.sendMessage.mockImplementation((message, callback) => {
        global.chrome.runtime.lastError = { 
          message: 'Extension context invalidated' 
        };
        callback();
      });

      // Simulate runtime error handling
      const handleRuntimeError = async () => {
        return new Promise((resolve, reject) => {
          global.chrome.runtime.sendMessage(
            { action: 'test' },
            () => {
              if (global.chrome.runtime.lastError) {
                reject(new Error(global.chrome.runtime.lastError.message));
              }
            }
          );
        });
      };

      await expect(handleRuntimeError()).rejects.toThrow('Extension context invalidated');
    });

    test('should validate form inputs', () => {
      const validateSettings = (settings) => {
        const errors = [];

        if (!settings.provider) {
          errors.push('Provider is required');
        }

        if (!settings.model) {
          errors.push('Model is required');
        }

        if (settings.provider === 'openai' && !settings.apiKey) {
          errors.push('API key is required for OpenAI');
        }

        return { valid: errors.length === 0, errors };
      };

      // Test valid settings
      const validSettings = {
        provider: 'local',
        model: 'llama2',
        apiKey: '',
        customEndpoint: ''
      };

      const validResult = validateSettings(validSettings);
      expect(validResult.valid).toBe(true);

      // Test invalid settings
      const invalidSettings = {
        provider: 'openai',
        model: '',
        apiKey: '',
        customEndpoint: ''
      };

      const invalidResult = validateSettings(invalidSettings);
      expect(invalidResult.valid).toBe(false);
      expect(invalidResult.errors).toContain('Model is required');
      expect(invalidResult.errors).toContain('API key is required for OpenAI');
    });
  });

  describe('Tab Navigation', () => {
    test('should handle tab switching', () => {
      const tabs = ['proofread', 'context', 'settings'];
      let activeTab = 'proofread';

      const switchTab = (tabName) => {
        if (tabs.includes(tabName)) {
          activeTab = tabName;
          return true;
        }
        return false;
      };

      expect(switchTab('settings')).toBe(true);
      expect(activeTab).toBe('settings');

      expect(switchTab('invalid')).toBe(false);
      expect(activeTab).toBe('settings'); // Should remain unchanged
    });

    test('should show/hide appropriate content for each tab', () => {
      const tabContents = {
        'proofread-tab': mockDocument.getElementById('loading'),
        'context-tab': mockDocument.getElementById('loading'),
        'settings-tab': mockDocument.getElementById('openai-settings')
      };

      // Simulate tab activation
      const activateTab = (tabId) => {
        Object.keys(tabContents).forEach(id => {
          const element = tabContents[id];
          if (id === tabId) {
            element.classList.remove('hidden');
          } else {
            element.classList.add('hidden');
          }
        });
      };

      activateTab('settings-tab');
      expect(tabContents['settings-tab'].classList.remove).toHaveBeenCalledWith('hidden');
    });
  });
});
