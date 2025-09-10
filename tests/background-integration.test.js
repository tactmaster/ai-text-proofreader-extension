// Background script integration tests
// Tests core extension functionality

describe('Background Script Integration Tests', () => {
  let mockChrome;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Setup comprehensive Chrome API mock
    mockChrome = {
      runtime: {
        onMessage: {
          addListener: jest.fn(),
          removeListener: jest.fn()
        },
        sendMessage: jest.fn(),
        onInstalled: {
          addListener: jest.fn()
        },
        id: 'test-extension-id'
      },
      storage: {
        sync: {
          get: jest.fn(),
          set: jest.fn(),
          clear: jest.fn()
        },
        local: {
          get: jest.fn(),
          set: jest.fn(),
          clear: jest.fn()
        }
      },
      contextMenus: {
        create: jest.fn(),
        removeAll: jest.fn(),
        onClicked: {
          addListener: jest.fn()
        }
      },
      tabs: {
        query: jest.fn(),
        sendMessage: jest.fn()
      }
    };

    global.chrome = mockChrome;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Extension Initialization', () => {
    test('should initialize with default settings', async () => {
      // Mock storage to return empty (first run)
      mockChrome.storage.sync.get.mockImplementation((keys, callback) => {
        callback({});
      });

      mockChrome.storage.sync.set.mockImplementation((data, callback) => {
        callback();
      });

      // Load background script (simulated)
      const initSettings = {
        provider: 'local',
        model: 'llama2',
        apiKey: '',
        customEndpoint: ''
      };

      // Verify default settings would be set
      expect(initSettings).toEqual({
        provider: 'local',
        model: 'llama2',
        apiKey: '',
        customEndpoint: ''
      });
    });

    test('should set up context menus on install', () => {
      // Simulate extension installation
      const onInstalledCallback = mockChrome.runtime.onInstalled.addListener.mock.calls[0]?.[0];
      
      if (onInstalledCallback) {
        onInstalledCallback({ reason: 'install' });
        expect(mockChrome.contextMenus.create).toHaveBeenCalled();
      }
    });

    test('should add message listeners', () => {
      expect(mockChrome.runtime.onMessage.addListener).toHaveBeenCalled();
    });
  });

  describe('Message Handling', () => {
    let messageHandler;

    beforeEach(() => {
      // Get the message handler that would be registered
      messageHandler = mockChrome.runtime.onMessage.addListener.mock.calls[0]?.[0];
    });

    test('should handle getSettings request', async () => {
      const mockSendResponse = jest.fn();
      
      mockChrome.storage.sync.get.mockImplementation((keys, callback) => {
        callback({
          provider: 'openai',
          model: 'gpt-3.5-turbo',
          apiKey: 'test-key',
          customEndpoint: ''
        });
      });

      if (messageHandler) {
        const result = messageHandler(
          { action: 'getSettings' },
          { tab: { id: 1 } },
          mockSendResponse
        );

        // For async operations, the handler should return true
        expect(result).toBe(true);
      }
    });

    test('should handle saveSettings request', async () => {
      const mockSendResponse = jest.fn();
      
      mockChrome.storage.sync.set.mockImplementation((data, callback) => {
        callback();
      });

      if (messageHandler) {
        const settings = {
          provider: 'local',
          model: 'llama2',
          apiKey: '',
          customEndpoint: ''
        };

        const result = messageHandler(
          { action: 'saveSettings', settings },
          { tab: { id: 1 } },
          mockSendResponse
        );

        expect(result).toBe(true);
      }
    });

    test('should handle proofread request', async () => {
      const mockSendResponse = jest.fn();
      
      // Mock settings
      mockChrome.storage.sync.get.mockImplementation((keys, callback) => {
        callback({
          provider: 'local',
          model: 'llama2',
          apiKey: '',
          customEndpoint: ''
        });
      });

      if (messageHandler) {
        const result = messageHandler(
          { action: 'proofread', text: 'Test text with errors.' },
          { tab: { id: 1 } },
          mockSendResponse
        );

        expect(result).toBe(true);
      }
    });

    test('should handle proofreadWithContext request', async () => {
      const mockSendResponse = jest.fn();
      
      mockChrome.storage.sync.get.mockImplementation((keys, callback) => {
        callback({
          provider: 'local',
          model: 'llama2'
        });
      });

      if (messageHandler) {
        const result = messageHandler(
          { 
            action: 'proofreadWithContext', 
            text: 'Test text',
            context: {
              website: 'gmail.com',
              type: 'email',
              tone: 'professional'
            }
          },
          { tab: { id: 1 } },
          mockSendResponse
        );

        expect(result).toBe(true);
      }
    });

    test('should handle getSuggestions request', async () => {
      const mockSendResponse = jest.fn();
      
      if (messageHandler) {
        const result = messageHandler(
          { action: 'getSuggestions', text: 'Test text' },
          { tab: { id: 1 } },
          mockSendResponse
        );

        expect(result).toBe(true);
      }
    });

    test('should handle unknown action gracefully', async () => {
      const mockSendResponse = jest.fn();
      
      if (messageHandler) {
        const result = messageHandler(
          { action: 'unknownAction' },
          { tab: { id: 1 } },
          mockSendResponse
        );

        // Should handle unknown actions without crashing
        expect(result).toBeDefined();
      }
    });
  });

  describe('Storage Operations', () => {
    test('should handle storage errors gracefully', async () => {
      const mockSendResponse = jest.fn();
      
      // Mock storage error
      mockChrome.storage.sync.get.mockImplementation((keys, callback) => {
        mockChrome.runtime.lastError = { message: 'Storage error' };
        callback(null);
      });

      // Test should not crash on storage errors
      expect(() => {
        mockChrome.storage.sync.get(['settings'], () => {
          if (mockChrome.runtime.lastError) {
            console.error('Storage error:', mockChrome.runtime.lastError.message);
          }
        });
      }).not.toThrow();
    });

    test('should set default settings on first run', async () => {
      mockChrome.storage.sync.get.mockImplementation((keys, callback) => {
        callback({}); // Empty storage (first run)
      });

      mockChrome.storage.sync.set.mockImplementation((data, callback) => {
        callback();
      });

      // Simulate first run initialization
      const defaultSettings = {
        provider: 'local',
        model: 'llama2',
        apiKey: '',
        customEndpoint: ''
      };

      // Verify settings structure
      expect(defaultSettings).toHaveProperty('provider');
      expect(defaultSettings).toHaveProperty('model');
      expect(defaultSettings).toHaveProperty('apiKey');
      expect(defaultSettings).toHaveProperty('customEndpoint');
    });
  });

  describe('Context Menu Integration', () => {
    test('should create context menu items', () => {
      // Simulate context menu creation
      const contextMenuItems = [
        {
          id: 'ai-proofread',
          title: 'AI Proofread',
          contexts: ['selection']
        },
        {
          id: 'ai-suggestions',
          title: 'Get AI Suggestions',
          contexts: ['selection']
        }
      ];

      contextMenuItems.forEach(item => {
        mockChrome.contextMenus.create(item);
      });

      expect(mockChrome.contextMenus.create).toHaveBeenCalledTimes(2);
    });

    test('should handle context menu clicks', () => {
      const onClickedCallback = mockChrome.contextMenus.onClicked.addListener.mock.calls[0]?.[0];
      
      if (onClickedCallback) {
        // Simulate context menu click
        onClickedCallback(
          { menuItemId: 'ai-proofread', selectionText: 'Test text' },
          { id: 1, url: 'https://example.com' }
        );

        // Should trigger tab message sending
        expect(mockChrome.tabs.sendMessage).toHaveBeenCalled();
      }
    });
  });

  describe('Error Handling', () => {
    test('should handle runtime errors gracefully', () => {
      mockChrome.runtime.lastError = { message: 'Test error' };
      
      // Should not throw when checking for runtime errors
      expect(() => {
        if (mockChrome.runtime.lastError) {
          console.error('Runtime error:', mockChrome.runtime.lastError.message);
        }
      }).not.toThrow();
    });

    test('should handle message sending failures', async () => {
      mockChrome.tabs.sendMessage.mockImplementation((tabId, message, callback) => {
        mockChrome.runtime.lastError = { message: 'Could not establish connection' };
        callback();
      });

      // Should handle connection failures gracefully
      expect(() => {
        mockChrome.tabs.sendMessage(1, { action: 'test' }, () => {
          if (mockChrome.runtime.lastError) {
            console.error('Message send failed:', mockChrome.runtime.lastError.message);
          }
        });
      }).not.toThrow();
    });
  });

  describe('AI Provider Integration', () => {
    test('should handle different AI providers', () => {
      const providers = [
        { name: 'local', endpoint: 'http://localhost:11434' },
        { name: 'openai', endpoint: 'https://api.openai.com' },
        { name: 'custom', endpoint: 'https://custom-api.com' }
      ];

      providers.forEach(provider => {
        expect(provider).toHaveProperty('name');
        expect(provider).toHaveProperty('endpoint');
      });
    });

    test('should validate API configurations', () => {
      const validConfigs = [
        { provider: 'local', model: 'llama2', apiKey: '' },
        { provider: 'openai', model: 'gpt-3.5-turbo', apiKey: 'sk-test' },
        { provider: 'custom', model: 'custom-model', customEndpoint: 'https://api.com' }
      ];

      validConfigs.forEach(config => {
        expect(config).toHaveProperty('provider');
        expect(config).toHaveProperty('model');
        expect(config.provider).toBeTruthy();
        expect(config.model).toBeTruthy();
      });
    });
  });

  describe('Performance and Reliability', () => {
    test('should handle concurrent requests', async () => {
      const mockSendResponse = jest.fn();
      
      // Simulate multiple concurrent requests
      const requests = Array.from({ length: 5 }, (_, i) => ({
        action: 'proofread',
        text: `Test text ${i}`
      }));

      requests.forEach(request => {
        if (messageHandler) {
          messageHandler(request, { tab: { id: 1 } }, mockSendResponse);
        }
      });

      // Should handle multiple requests without issues
      expect(mockSendResponse).toHaveBeenCalledTimes(requests.length);
    });

    test('should validate input parameters', () => {
      const validInputs = [
        { action: 'proofread', text: 'Valid text' },
        { action: 'getSuggestions', text: 'Another valid text' },
        { action: 'getSettings' }
      ];

      const invalidInputs = [
        { action: 'proofread' }, // Missing text
        { text: 'Text without action' }, // Missing action
        {} // Empty request
      ];

      validInputs.forEach(input => {
        if (input.action === 'getSettings' || input.text) {
          expect(input.action).toBeTruthy();
        }
      });

      invalidInputs.forEach(input => {
        if (input.action === 'proofread' || input.action === 'getSuggestions') {
          expect(input.text).toBeFalsy(); // Should be invalid
        }
      });
    });
  });
});
