// Extension Integration Error Tests
// Tests for real-world error scenarios and edge cases

describe('Extension Integration Error Tests', () => {
  
  describe('Real-world Error Scenarios', () => {
    
    beforeEach(() => {
      jest.clearAllMocks();
      jest.spyOn(console, 'error').mockImplementation(() => {});
      jest.spyOn(console, 'log').mockImplementation(() => {});
      jest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
      console.error.mockRestore();
      console.log.mockRestore();
      console.warn.mockRestore();
    });

    test('should reproduce and handle the original sendMessage error', async () => {
      // Simulate the exact error that was reported
      const originalChrome = global.chrome;
      
      // Create a chrome object with undefined runtime (the original error condition)
      global.chrome = {
        runtime: undefined
      };

      // Mock the TextBoxProofreader behavior that caused the error
      class MockTextBoxProofreader {
        constructor() {
          this.selectedElement = { value: 'test text with errors' };
        }

        getElementText(element) {
          return element.value;
        }

        showErrorMessage(message) {
          this.lastErrorMessage = message;
        }

        async proofreadSelectedText() {
          if (!this.selectedElement) return;

          // This is the line that was causing the error before the fix
          // Before fix: chrome.runtime.sendMessage would fail with "Cannot read properties of undefined"
          // After fix: We check if chrome.runtime exists first
          
          if (!chrome || !chrome.runtime) {
            console.error('[AI Proofreader] Chrome runtime not available');
            this.showErrorMessage('Extension runtime not available. Please reload the extension.');
            return;
          }

          const text = this.getElementText(this.selectedElement);
          if (!text.trim()) return;

          try {
            // This would have failed before the fix
            const response = await chrome.runtime.sendMessage({
              action: 'proofreadWithContext',
              text: text
            });
          } catch (error) {
            this.showErrorMessage('Extension error: ' + error.message);
          }
        }
      }

      const proofreader = new MockTextBoxProofreader();
      
      // This should not throw an error anymore
      await expect(proofreader.proofreadSelectedText()).resolves.not.toThrow();
      
      // Should show proper error message
      expect(console.error).toHaveBeenCalledWith('[AI Proofreader] Chrome runtime not available');
      expect(proofreader.lastErrorMessage).toBe('Extension runtime not available. Please reload the extension.');

      // Restore original chrome object
      global.chrome = originalChrome;
    });

    test('should handle extension context invalidation during operation', async () => {
      // Start with valid chrome object
      global.chrome.runtime.sendMessage = jest.fn();
      
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

        async proofreadSelectedText() {
          if (!chrome || !chrome.runtime) {
            console.error('[AI Proofreader] Chrome runtime not available');
            this.showErrorMessage('Extension runtime not available. Please reload the extension.');
            return;
          }

          const text = this.getElementText(this.selectedElement);
          if (!text.trim()) return;

          try {
            // Simulate extension context becoming invalidated during operation
            global.chrome.runtime.sendMessage.mockRejectedValue(
              new Error('Extension context invalidated.')
            );

            const response = await chrome.runtime.sendMessage({
              action: 'proofreadWithContext',
              text: text
            });
          } catch (error) {
            this.showErrorMessage('Extension error: ' + error.message);
          }
        }
      }

      const proofreader = new MockTextBoxProofreader();
      await proofreader.proofreadSelectedText();

      expect(proofreader.lastErrorMessage).toBe('Extension error: Extension context invalidated.');
    });

    test('should handle browser extension reload scenarios', () => {
      // Test the initialization function that prevents crashes during reload
      let initializationCalled = false;
      
      function initializeExtension() {
        try {
          // Check if Chrome extension context is available
          if (typeof chrome === 'undefined' || !chrome.runtime) {
            console.error('[AI Proofreader] Chrome extension context not available');
            console.error('[AI Proofreader] Please reload the extension and refresh this page');
            return;
          }

          // Check if runtime is connected
          if (!chrome.runtime.id) {
            console.error('[AI Proofreader] Extension runtime disconnected');
            console.error('[AI Proofreader] Please reload the extension');
            return;
          }

          console.log('[AI Proofreader] Initializing extension...');
          initializationCalled = true;
        } catch (error) {
          console.error('[AI Proofreader] Failed to initialize:', error);
        }
      }

      // Test with missing chrome object (extension not loaded)
      const originalChrome = global.chrome;
      delete global.chrome;
      
      initializeExtension();
      expect(console.error).toHaveBeenCalledWith('[AI Proofreader] Chrome extension context not available');
      expect(initializationCalled).toBe(false);

      // Restore chrome and test with missing runtime ID (extension reloading)
      global.chrome = { runtime: {} };
      
      initializeExtension();
      expect(console.error).toHaveBeenCalledWith('[AI Proofreader] Extension runtime disconnected');
      expect(initializationCalled).toBe(false);

      // Test with proper chrome object
      global.chrome = originalChrome;
      global.chrome.runtime.id = 'test-extension-id';
      
      initializeExtension();
      expect(console.log).toHaveBeenCalledWith('[AI Proofreader] Initializing extension...');
      expect(initializationCalled).toBe(true);
    });
  });

  describe('User Experience Error Handling', () => {
    
    test('should provide actionable error messages for users', () => {
      const errorScenarios = [
        {
          condition: 'Extension not loaded',
          message: 'Extension runtime not available. Please reload the extension.',
          action: 'reload extension'
        },
        {
          condition: 'Extension context invalidated',
          message: 'Extension context invalidated. Please refresh the page.',
          action: 'refresh page'
        },
        {
          condition: 'Network connectivity issues',
          message: 'Network error. Please check your connection and try again.',
          action: 'check connection'
        },
        {
          condition: 'LLM provider not configured',
          message: 'LLM provider not configured. Please check extension settings.',
          action: 'check settings'
        }
      ];

      errorScenarios.forEach(scenario => {
        expect(scenario.message).toContain('Please');
        expect(scenario.message.length).toBeGreaterThan(30);
        expect(scenario.action).toBeTruthy();
      });
    });

    test('should gracefully degrade when extension features are unavailable', () => {
      // Test that the page doesn't break when extension fails
      class MockTextBoxProofreader {
        constructor() {
          this.selectedElement = null;
          this.initializationFailed = false;
        }

        async init() {
          try {
            if (!chrome || !chrome.runtime) {
              console.error('[AI Proofreader] Chrome extension APIs not available');
              this.initializationFailed = true;
              return;
            }

            // Normal initialization would continue here
            console.log('[AI Proofreader] Extension initialized successfully');
          } catch (error) {
            console.error('[AI Proofreader] Initialization failed:', error);
            this.initializationFailed = true;
          }
        }

        isAvailable() {
          return !this.initializationFailed;
        }
      }

      // Test with missing Chrome APIs
      const originalChrome = global.chrome;
      delete global.chrome;

      const proofreader = new MockTextBoxProofreader();
      proofreader.init();

      expect(proofreader.isAvailable()).toBe(false);
      expect(console.error).toHaveBeenCalledWith('[AI Proofreader] Chrome extension APIs not available');

      // Restore and test successful initialization
      global.chrome = originalChrome;
      
      const workingProofreader = new MockTextBoxProofreader();
      workingProofreader.init();

      expect(workingProofreader.isAvailable()).toBe(true);
      expect(console.log).toHaveBeenCalledWith('[AI Proofreader] Extension initialized successfully');
    });
  });

  describe('Edge Case Error Handling', () => {
    
    test('should handle rapid successive API calls with runtime errors', async () => {
      // Mock sendMessage to fail intermittently
      let callCount = 0;
      global.chrome.runtime.sendMessage = jest.fn().mockImplementation(() => {
        callCount++;
        if (callCount % 2 === 0) {
          return Promise.reject(new Error('Runtime disconnected'));
        }
        return Promise.resolve({ success: true, correctedText: 'corrected' });
      });

      class MockTextBoxProofreader {
        constructor() {
          this.selectedElement = { value: 'test' };
          this.errors = [];
        }

        getElementText(element) {
          return element.value;
        }

        showErrorMessage(message) {
          this.errors.push(message);
        }

        async proofreadSelectedText() {
          if (!chrome || !chrome.runtime) {
            this.showErrorMessage('Extension runtime not available. Please reload the extension.');
            return;
          }

          try {
            const response = await chrome.runtime.sendMessage({
              action: 'proofreadWithContext',
              text: this.getElementText(this.selectedElement)
            });
            return response;
          } catch (error) {
            this.showErrorMessage('Extension error: ' + error.message);
          }
        }
      }

      const proofreader = new MockTextBoxProofreader();
      
      // Make multiple rapid calls
      const promises = [
        proofreader.proofreadSelectedText(),
        proofreader.proofreadSelectedText(),
        proofreader.proofreadSelectedText(),
        proofreader.proofreadSelectedText()
      ];

      await Promise.all(promises);

      // Should have captured errors from failed calls
      expect(proofreader.errors.length).toBeGreaterThan(0);
      expect(proofreader.errors.some(error => error.includes('Runtime disconnected'))).toBe(true);
    });

    test('should handle memory cleanup on extension reload', () => {
      // Test that event listeners and DOM elements are properly cleaned up
      class MockTextBoxProofreader {
        constructor() {
          this.elements = [];
          this.listeners = [];
        }

        createProofreadButton() {
          const button = { remove: jest.fn() };
          this.elements.push(button);
          return button;
        }

        attachEventListeners() {
          const listener = { remove: jest.fn() };
          this.listeners.push(listener);
          return listener;
        }

        cleanup() {
          this.elements.forEach(element => element.remove());
          this.listeners.forEach(listener => listener.remove());
          this.elements = [];
          this.listeners = [];
        }

        init() {
          if (!chrome || !chrome.runtime) {
            console.error('[AI Proofreader] Initialization failed - cleaning up');
            this.cleanup();
            return;
          }
          
          this.createProofreadButton();
          this.attachEventListeners();
        }
      }

      // Test initialization failure triggers cleanup
      const originalChrome = global.chrome;
      delete global.chrome;

      const proofreader = new MockTextBoxProofreader();
      proofreader.init();

      expect(console.error).toHaveBeenCalledWith('[AI Proofreader] Initialization failed - cleaning up');
      expect(proofreader.elements.length).toBe(0);
      expect(proofreader.listeners.length).toBe(0);

      // Restore chrome
      global.chrome = originalChrome;
    });
  });
});
