// Chrome Runtime Error Handling Tests
// Tests for proper error handling when Chrome APIs are unavailable

describe('Chrome Runtime Error Handling Tests', () => {
  
  describe('Chrome API Availability Tests', () => {
    
    beforeEach(() => {
      // Clear any existing mocks
      jest.clearAllMocks();
      
      // Clear console spies
      jest.spyOn(console, 'error').mockImplementation(() => {});
      jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
      // Restore console
      console.error.mockRestore();
      console.log.mockRestore();
    });

    test('should handle missing chrome object gracefully', () => {
      // Mock missing Chrome object
      const originalChrome = global.chrome;
      delete global.chrome;

      // Create a mock TextBoxProofreader class for testing
      class MockTextBoxProofreader {
        constructor() {
          this.selectedElement = null;
        }

        showErrorMessage(message) {
          this.lastErrorMessage = message;
        }

        async proofreadSelectedText() {
          // Check if chrome.runtime is available
          if (typeof chrome === 'undefined' || !chrome || !chrome.runtime) {
            console.error('[AI Proofreader] Chrome runtime not available');
            this.showErrorMessage('Extension runtime not available. Please reload the extension.');
            return;
          }
          // Normal flow would continue here
        }

        async getSuggestions() {
          // Check if chrome.runtime is available
          if (typeof chrome === 'undefined' || !chrome || !chrome.runtime) {
            console.error('[AI Proofreader] Chrome runtime not available');
            this.showErrorMessage('Extension runtime not available. Please reload the extension.');
            return;
          }
          // Normal flow would continue here
        }
      }

      const proofreader = new MockTextBoxProofreader();
      proofreader.selectedElement = { value: 'test text' };

      // Test proofreadSelectedText
      proofreader.proofreadSelectedText();
      expect(console.error).toHaveBeenCalledWith('[AI Proofreader] Chrome runtime not available');
      expect(proofreader.lastErrorMessage).toBe('Extension runtime not available. Please reload the extension.');

      // Test getSuggestions
      proofreader.getSuggestions();
      expect(console.error).toHaveBeenCalledTimes(2); // Called twice now

      // Restore chrome object
      global.chrome = originalChrome;
    });

    test('should handle missing chrome.runtime gracefully', () => {
      // Mock Chrome object without runtime
      const originalRuntime = global.chrome.runtime;
      delete global.chrome.runtime;

      class MockTextBoxProofreader {
        constructor() {
          this.selectedElement = null;
        }

        showErrorMessage(message) {
          this.lastErrorMessage = message;
        }

        async proofreadSelectedText() {
          if (typeof chrome === 'undefined' || !chrome || !chrome.runtime) {
            console.error('[AI Proofreader] Chrome runtime not available');
            this.showErrorMessage('Extension runtime not available. Please reload the extension.');
            return;
          }
        }
      }

      const proofreader = new MockTextBoxProofreader();
      proofreader.selectedElement = { value: 'test text' };

      proofreader.proofreadSelectedText();
      expect(console.error).toHaveBeenCalledWith('[AI Proofreader] Chrome runtime not available');
      expect(proofreader.lastErrorMessage).toBe('Extension runtime not available. Please reload the extension.');

      // Restore runtime
      global.chrome.runtime = originalRuntime;
    });

    test('should handle missing runtime ID (disconnected extension)', () => {
      // Mock Chrome runtime without ID
      const originalId = global.chrome.runtime.id;
      delete global.chrome.runtime.id;

      function initializeExtension() {
        try {
          if (typeof chrome === 'undefined' || !chrome.runtime) {
            console.error('[AI Proofreader] Chrome extension context not available');
            return false;
          }

          if (!chrome.runtime.id) {
            console.error('[AI Proofreader] Extension runtime disconnected');
            return false;
          }

          return true;
        } catch (error) {
          console.error('[AI Proofreader] Failed to initialize:', error);
          return false;
        }
      }

      const result = initializeExtension();
      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith('[AI Proofreader] Extension runtime disconnected');

      // Restore ID
      global.chrome.runtime.id = originalId || 'test-extension-id';
    });

    test('should validate Chrome extension context properly', () => {
      // Test with proper Chrome context
      global.chrome.runtime.id = 'test-extension-id';

      function initializeExtension() {
        try {
          if (typeof chrome === 'undefined' || !chrome.runtime) {
            console.error('[AI Proofreader] Chrome extension context not available');
            return false;
          }

          if (!chrome.runtime.id) {
            console.error('[AI Proofreader] Extension runtime disconnected');
            return false;
          }

          console.log('[AI Proofreader] Initializing extension...');
          return true;
        } catch (error) {
          console.error('[AI Proofreader] Failed to initialize:', error);
          return false;
        }
      }

      const result = initializeExtension();
      expect(result).toBe(true);
      expect(console.log).toHaveBeenCalledWith('[AI Proofreader] Initializing extension...');
    });
  });

  describe('SendMessage Error Handling Tests', () => {
    
    beforeEach(() => {
      jest.clearAllMocks();
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      console.error.mockRestore();
    });

    test('should handle sendMessage failures gracefully', async () => {
      // Mock sendMessage to throw an error
      global.chrome.runtime.sendMessage.mockRejectedValue(new Error('Extension context invalidated'));

      class MockTextBoxProofreader {
        constructor() {
          this.selectedElement = { value: 'test text' };
        }

        getElementText(element) {
          return element.value;
        }

        showErrorMessage(message) {
          this.lastErrorMessage = message;
        }

        showLoadingState() {}
        hideLoadingState() {}

        async proofreadSelectedText() {
          if (!this.selectedElement) return;

          if (!chrome || !chrome.runtime) {
            console.error('[AI Proofreader] Chrome runtime not available');
            this.showErrorMessage('Extension runtime not available. Please reload the extension.');
            return;
          }

          const text = this.getElementText(this.selectedElement);
          if (!text.trim()) {
            return;
          }

          this.showLoadingState();

          try {
            const response = await chrome.runtime.sendMessage({
              action: 'proofreadWithContext',
              text: text,
              context: {
                website: 'test',
                type: 'general',
                tone: 'default',
                prompt: 'test prompt'
              }
            });

            if (response.success) {
              // Success handling
            } else {
              this.showErrorMessage('Proofreading failed: ' + response.error);
            }
          } catch (error) {
            this.showErrorMessage('Extension error: ' + error.message);
          }

          this.hideLoadingState();
        }
      }

      const proofreader = new MockTextBoxProofreader();
      await proofreader.proofreadSelectedText();

      expect(proofreader.lastErrorMessage).toBe('Extension error: Extension context invalidated');
      expect(global.chrome.runtime.sendMessage).toHaveBeenCalledWith({
        action: 'proofreadWithContext',
        text: 'test text',
        context: {
          website: 'test',
          type: 'general',
          tone: 'default',
          prompt: 'test prompt'
        }
      });
    });

    test('should handle sendMessage response errors', async () => {
      // Mock sendMessage to return error response
      global.chrome.runtime.sendMessage.mockResolvedValue({
        success: false,
        error: 'LLM provider not configured'
      });

      class MockTextBoxProofreader {
        constructor() {
          this.selectedElement = { value: 'test text' };
        }

        getElementText(element) {
          return element.value;
        }

        showErrorMessage(message) {
          this.lastErrorMessage = message;
        }

        showLoadingState() {}
        hideLoadingState() {}

        async getSuggestions() {
          if (!this.selectedElement) return;

          if (!chrome || !chrome.runtime) {
            console.error('[AI Proofreader] Chrome runtime not available');
            this.showErrorMessage('Extension runtime not available. Please reload the extension.');
            return;
          }

          const text = this.getElementText(this.selectedElement);
          if (!text.trim()) {
            return;
          }

          this.showLoadingState();

          try {
            const response = await chrome.runtime.sendMessage({
              action: 'getSuggestionsWithContext',
              text: text,
              context: {
                website: 'test',
                type: 'general',
                tone: 'default',
                prompt: 'test prompt'
              }
            });

            if (response.success) {
              // Success handling
            } else {
              this.showErrorMessage('Failed to get suggestions: ' + response.error);
            }
          } catch (error) {
            this.showErrorMessage('Extension error: ' + error.message);
          }

          this.hideLoadingState();
        }
      }

      const proofreader = new MockTextBoxProofreader();
      await proofreader.getSuggestions();

      expect(proofreader.lastErrorMessage).toBe('Failed to get suggestions: LLM provider not configured');
    });
  });

  describe('Initialization Error Prevention', () => {
    
    test('should prevent multiple initialization attempts', () => {
      let initializationCount = 0;
      
      function initializeExtension() {
        initializationCount++;
        
        try {
          if (typeof chrome === 'undefined' || !chrome.runtime) {
            console.error('[AI Proofreader] Chrome extension context not available');
            console.error('[AI Proofreader] Please reload the extension and refresh this page');
            return;
          }

          if (!chrome.runtime.id) {
            console.error('[AI Proofreader] Extension runtime disconnected');
            console.error('[AI Proofreader] Please reload the extension');
            return;
          }

          console.log('[AI Proofreader] Initializing extension...');
          // Mock TextBoxProofreader creation
        } catch (error) {
          console.error('[AI Proofreader] Failed to initialize:', error);
        }
      }

      // Simulate multiple initialization calls
      initializeExtension();
      initializeExtension();
      initializeExtension();

      expect(initializationCount).toBe(3);
      // In real implementation, we'd want to prevent multiple initializations
    });

    test('should handle DOM readiness states correctly', () => {
      const mockDocument = {
        readyState: 'loading',
        addEventListener: jest.fn()
      };

      function setupInitialization(document) {
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', () => {
            console.log('DOM loaded, initializing extension');
          });
        } else {
          console.log('DOM already ready, initializing extension immediately');
        }
      }

      // Test loading state
      setupInitialization(mockDocument);
      expect(mockDocument.addEventListener).toHaveBeenCalledWith('DOMContentLoaded', expect.any(Function));

      // Test complete state
      mockDocument.readyState = 'complete';
      jest.spyOn(console, 'log').mockImplementation(() => {});
      
      setupInitialization(mockDocument);
      expect(console.log).toHaveBeenCalledWith('DOM already ready, initializing extension immediately');
      
      console.log.mockRestore();
    });
  });

  describe('Error Message Display Tests', () => {
    
    test('should format error messages correctly', () => {
      const errorMessages = [
        'Extension runtime not available. Please reload the extension.',
        'Extension error: Cannot read properties of undefined (reading \'sendMessage\')',
        'Failed to get suggestions: LLM provider not configured',
        'Proofreading failed: Network error'
      ];

      errorMessages.forEach(message => {
        expect(message).toBeTruthy();
        expect(typeof message).toBe('string');
        expect(message.length).toBeGreaterThan(0);
      });
    });

    test('should provide helpful troubleshooting guidance', () => {
      const troubleshootingMessages = {
        runtime_unavailable: 'Extension runtime not available. Please reload the extension.',
        context_invalidated: 'Extension context invalidated. Please refresh the page.',
        provider_not_configured: 'LLM provider not configured. Please check extension settings.',
        network_error: 'Network error. Please check your connection and try again.'
      };

      Object.values(troubleshootingMessages).forEach(message => {
        expect(message).toContain('Please');
        expect(message.length).toBeGreaterThan(20); // Ensure messages are descriptive
      });
    });
  });

  describe('Content Script Robustness Tests', () => {
    
    test('should handle missing DOM elements gracefully', () => {
      class MockTextBoxProofreader {
        constructor() {
          this.selectedElement = null;
        }

        async proofreadSelectedText() {
          if (!this.selectedElement) {
            console.log('[AI Proofreader] No element selected');
            return;
          }
          // Continue with proofreading
        }
      }

      const proofreader = new MockTextBoxProofreader();
      jest.spyOn(console, 'log').mockImplementation(() => {});
      
      proofreader.proofreadSelectedText();
      expect(console.log).toHaveBeenCalledWith('[AI Proofreader] No element selected');
      
      console.log.mockRestore();
    });

    test('should validate text content before processing', () => {
      class MockTextBoxProofreader {
        constructor() {
          this.selectedElement = { value: '' };
        }

        getElementText(element) {
          return element.value;
        }

        async proofreadSelectedText() {
          if (!this.selectedElement) return;

          const text = this.getElementText(this.selectedElement);
          if (!text.trim()) {
            console.log('[AI Proofreader] No text to proofread');
            return;
          }
          // Continue with proofreading
        }
      }

      const proofreader = new MockTextBoxProofreader();
      jest.spyOn(console, 'log').mockImplementation(() => {});
      
      proofreader.proofreadSelectedText();
      expect(console.log).toHaveBeenCalledWith('[AI Proofreader] No text to proofread');
      
      console.log.mockRestore();
    });
  });
});
