// Browser API abstraction layer tests
// Tests cross-browser compatibility features

describe('Browser API Abstraction Layer Tests', () => {
  let BrowserAPI;

  beforeEach(() => {
    // Reset globals
    delete global.chrome;
    delete global.browser;
    
    // Clear module cache
    jest.resetModules();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Browser Detection', () => {
    test('should detect Chrome API when available', () => {
      // Mock Chrome API
      global.chrome = {
        runtime: { id: 'test-extension' },
        storage: { sync: {}, local: {} },
        tabs: {}
      };

      // Import after setting up globals
      const BrowserAPIClass = require('../shared/browser-api.js').BrowserAPI || eval(`(${require('fs').readFileSync('./shared/browser-api.js', 'utf8').match(/class BrowserAPI \{[\s\S]*?\n\}/)[0]})`);
      const api = new BrowserAPIClass();

      expect(api.api).toBe(global.chrome);
      expect(api.isChromium).toBe(true);
      expect(api.isFirefox).toBe(false);
    });

    test('should detect Firefox API when available', () => {
      // Mock Firefox API
      global.browser = {
        runtime: { id: 'test-extension' },
        storage: { sync: {}, local: {} },
        tabs: {}
      };

      // Import after setting up globals
      const BrowserAPIClass = require('../shared/browser-api.js').BrowserAPI || eval(`(${require('fs').readFileSync('./shared/browser-api.js', 'utf8').match(/class BrowserAPI \{[\s\S]*?\n\}/)[0]})`);
      const api = new BrowserAPIClass();

      expect(api.api).toBe(global.browser);
      expect(api.isChromium).toBe(false);
      expect(api.isFirefox).toBe(true);
    });

    test('should prefer Firefox API when both are available', () => {
      // Mock both APIs
      global.browser = {
        runtime: { id: 'firefox-extension' },
        storage: { sync: {}, local: {} }
      };
      global.chrome = {
        runtime: { id: 'chrome-extension' },
        storage: { sync: {}, local: {} }
      };

      const BrowserAPIClass = require('../shared/browser-api.js').BrowserAPI || eval(`(${require('fs').readFileSync('./shared/browser-api.js', 'utf8').match(/class BrowserAPI \{[\s\S]*?\n\}/)[0]})`);
      const api = new BrowserAPIClass();

      expect(api.api).toBe(global.browser);
      expect(api.isFirefox).toBe(true);
    });

    test('should throw error when no compatible API found', () => {
      // No browser APIs available
      expect(() => {
        const BrowserAPIClass = require('../shared/browser-api.js').BrowserAPI || eval(`(${require('fs').readFileSync('./shared/browser-api.js', 'utf8').match(/class BrowserAPI \{[\s\S]*?\n\}/)[0]})`);
        new BrowserAPIClass();
      }).toThrow('No compatible browser extension API found');
    });
  });

  describe('Storage API Abstraction', () => {
    beforeEach(() => {
      global.chrome = {
        runtime: { id: 'test-extension' },
        storage: {
          sync: {
            get: jest.fn(),
            set: jest.fn(),
            remove: jest.fn(),
            clear: jest.fn()
          },
          local: {
            get: jest.fn(),
            set: jest.fn(),
            remove: jest.fn(),
            clear: jest.fn()
          }
        }
      };
    });

    test('should provide sync storage get method', async () => {
      const BrowserAPIClass = require('../shared/browser-api.js').BrowserAPI || eval(`(${require('fs').readFileSync('./shared/browser-api.js', 'utf8').match(/class BrowserAPI \{[\s\S]*?\n\}/)[0]})`);
      const api = new BrowserAPIClass();

      global.chrome.storage.sync.get.mockImplementation((keys, callback) => {
        callback({ testKey: 'testValue' });
      });

      await api.storage.sync.get(['testKey']);
      expect(global.chrome.storage.sync.get).toHaveBeenCalledWith(['testKey'], expect.any(Function));
    });

    test('should provide sync storage set method', async () => {
      const BrowserAPIClass = require('../shared/browser-api.js').BrowserAPI || eval(`(${require('fs').readFileSync('./shared/browser-api.js', 'utf8').match(/class BrowserAPI \{[\s\S]*?\n\}/)[0]})`);
      const api = new BrowserAPIClass();

      global.chrome.storage.sync.set.mockImplementation((data, callback) => {
        callback();
      });

      await api.storage.sync.set({ testKey: 'testValue' });
      expect(global.chrome.storage.sync.set).toHaveBeenCalledWith({ testKey: 'testValue' }, expect.any(Function));
    });

    test('should provide local storage methods', async () => {
      const BrowserAPIClass = require('../shared/browser-api.js').BrowserAPI || eval(`(${require('fs').readFileSync('./shared/browser-api.js', 'utf8').match(/class BrowserAPI \{[\s\S]*?\n\}/)[0]})`);
      const api = new BrowserAPIClass();

      global.chrome.storage.local.get.mockImplementation((keys, callback) => {
        callback({ localKey: 'localValue' });
      });

      await api.storage.local.get(['localKey']);
      expect(global.chrome.storage.local.get).toHaveBeenCalledWith(['localKey'], expect.any(Function));
    });
  });

  describe('Runtime API Abstraction', () => {
    beforeEach(() => {
      global.chrome = {
        runtime: {
          id: 'test-extension',
          sendMessage: jest.fn(),
          onMessage: {
            addListener: jest.fn(),
            removeListener: jest.fn()
          }
        },
        storage: { sync: {}, local: {} }
      };
    });

    test('should provide runtime sendMessage method', async () => {
      const BrowserAPIClass = require('../shared/browser-api.js').BrowserAPI || eval(`(${require('fs').readFileSync('./shared/browser-api.js', 'utf8').match(/class BrowserAPI \{[\s\S]*?\n\}/)[0]})`);
      const api = new BrowserAPIClass();

      global.chrome.runtime.sendMessage.mockImplementation((message, callback) => {
        callback({ success: true });
      });

      await api.runtime.sendMessage({ action: 'test' });
      expect(global.chrome.runtime.sendMessage).toHaveBeenCalledWith({ action: 'test' }, expect.any(Function));
    });

    test('should provide message listener methods', () => {
      const BrowserAPIClass = require('../shared/browser-api.js').BrowserAPI || eval(`(${require('fs').readFileSync('./shared/browser-api.js', 'utf8').match(/class BrowserAPI \{[\s\S]*?\n\}/)[0]})`);
      const api = new BrowserAPIClass();

      const listener = jest.fn();
      api.runtime.onMessage.addListener(listener);
      expect(global.chrome.runtime.onMessage.addListener).toHaveBeenCalledWith(expect.any(Function));

      api.runtime.onMessage.removeListener(listener);
      expect(global.chrome.runtime.onMessage.removeListener).toHaveBeenCalledWith(listener);
    });
  });

  describe('Tabs API Abstraction', () => {
    beforeEach(() => {
      global.chrome = {
        runtime: { id: 'test-extension' },
        storage: { sync: {}, local: {} },
        tabs: {
          query: jest.fn(),
          sendMessage: jest.fn(),
          create: jest.fn()
        }
      };
    });

    test('should provide tabs query method', async () => {
      const BrowserAPIClass = require('../shared/browser-api.js').BrowserAPI || eval(`(${require('fs').readFileSync('./shared/browser-api.js', 'utf8').match(/class BrowserAPI \{[\s\S]*?\n\}/)[0]})`);
      const api = new BrowserAPIClass();

      global.chrome.tabs.query.mockImplementation((queryInfo, callback) => {
        callback([{ id: 1, url: 'https://example.com' }]);
      });

      await api.tabs.query({ active: true });
      expect(global.chrome.tabs.query).toHaveBeenCalledWith({ active: true }, expect.any(Function));
    });

    test('should provide tabs sendMessage method', async () => {
      const BrowserAPIClass = require('../shared/browser-api.js').BrowserAPI || eval(`(${require('fs').readFileSync('./shared/browser-api.js', 'utf8').match(/class BrowserAPI \{[\s\S]*?\n\}/)[0]})`);
      const api = new BrowserAPIClass();

      global.chrome.tabs.sendMessage.mockImplementation((tabId, message, callback) => {
        callback({ received: true });
      });

      await api.tabs.sendMessage(1, { action: 'test' });
      expect(global.chrome.tabs.sendMessage).toHaveBeenCalledWith(1, { action: 'test' }, expect.any(Function));
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      global.chrome = {
        runtime: {
          id: 'test-extension',
          sendMessage: jest.fn(),
          lastError: null
        },
        storage: { 
          sync: {
            get: jest.fn(),
            set: jest.fn(),
            remove: jest.fn(),
            clear: jest.fn()
          }, 
          local: {
            get: jest.fn(),
            set: jest.fn(),
            remove: jest.fn(),
            clear: jest.fn()
          } 
        }
      };
    });

    test('should handle runtime errors in sendMessage', async () => {
      const BrowserAPIClass = require('../shared/browser-api.js').BrowserAPI || eval(`(${require('fs').readFileSync('./shared/browser-api.js', 'utf8').match(/class BrowserAPI \{[\s\S]*?\n\}/)[0]})`);
      const api = new BrowserAPIClass();

      global.chrome.runtime.sendMessage.mockImplementation((message, callback) => {
        global.chrome.runtime.lastError = { message: 'Extension context invalidated' };
        callback();
      });

      await expect(api.runtime.sendMessage({ action: 'test' })).rejects.toThrow('Extension context invalidated');
    });

    test('should handle storage errors', async () => {
      const BrowserAPIClass = require('../shared/browser-api.js').BrowserAPI || eval(`(${require('fs').readFileSync('./shared/browser-api.js', 'utf8').match(/class BrowserAPI \{[\s\S]*?\n\}/)[0]})`);
      const api = new BrowserAPIClass();

      global.chrome.storage.sync.get.mockImplementation((keys, callback) => {
        global.chrome.runtime.lastError = { message: 'Storage quota exceeded' };
        callback();
      });

      await expect(api.storage.sync.get(['testKey'])).rejects.toThrow('Storage quota exceeded');
    });
  });

  describe('Promise Wrappers', () => {
    beforeEach(() => {
      global.chrome = {
        runtime: {
          id: 'test-extension',
          sendMessage: jest.fn()
        },
        storage: {
          sync: {
            get: jest.fn(),
            set: jest.fn()
          },
          local: {}
        }
      };
    });

    test('should convert callback-based APIs to Promises', async () => {
      const BrowserAPIClass = require('../shared/browser-api.js').BrowserAPI || eval(`(${require('fs').readFileSync('./shared/browser-api.js', 'utf8').match(/class BrowserAPI \{[\s\S]*?\n\}/)[0]})`);
      const api = new BrowserAPIClass();

      global.chrome.storage.sync.get.mockImplementation((keys, callback) => {
        setTimeout(() => callback({ key: 'value' }), 10);
      });

      const result = await api.storage.sync.get(['key']);
      expect(result).toEqual({ key: 'value' });
    });

    test('should handle Promise rejections properly', async () => {
      const BrowserAPIClass = require('../shared/browser-api.js').BrowserAPI || eval(`(${require('fs').readFileSync('./shared/browser-api.js', 'utf8').match(/class BrowserAPI \{[\s\S]*?\n\}/)[0]})`);
      const api = new BrowserAPIClass();

      global.chrome.runtime.sendMessage.mockImplementation((message, callback) => {
        setTimeout(() => {
          global.chrome.runtime.lastError = { message: 'Network error' };
          callback();
        }, 10);
      });

      await expect(api.runtime.sendMessage({ action: 'test' })).rejects.toThrow('Network error');
    });
  });
});
