// Mock implementation of the browser API for testing
class MockBrowserAPI {
  constructor() {
    this.api = this.detectBrowserAPI();
    this.isChromium = this.api === global.chrome;
    this.isFirefox = this.api === global.browser;
  }

  detectBrowserAPI() {
    if (typeof global.chrome !== 'undefined' && global.chrome.runtime && global.chrome.runtime.id) {
      return global.chrome;
    }
    if (typeof global.browser !== 'undefined' && global.browser.runtime) {
      return global.browser;
    }
    throw new Error('No compatible browser extension API found');
  }

  get storage() {
    return {
      sync: {
        get: (keys) => this.promisify(this.api.storage.sync.get, keys),
        set: (items) => this.promisify(this.api.storage.sync.set, items)
      },
      local: {
        get: (keys) => this.promisify(this.api.storage.local.get, keys),
        set: (items) => this.promisify(this.api.storage.local.set, items)
      }
    };
  }

  get runtime() {
    return {
      sendMessage: (message) => this.promisify(this.api.runtime.sendMessage, message),
      onMessage: {
        addListener: (listener) => this.api.runtime.onMessage.addListener(listener),
        removeListener: (listener) => this.api.runtime.onMessage.removeListener(listener)
      }
    };
  }

  get tabs() {
    return {
      query: (queryInfo) => this.promisify(this.api.tabs.query, queryInfo),
      sendMessage: (tabId, message) => this.promisify(this.api.tabs.sendMessage, tabId, message)
    };
  }

  promisify(fn, ...args) {
    return new Promise((resolve, reject) => {
      const callback = (result) => {
        if (this.api.runtime.lastError) {
          reject(new Error(this.api.runtime.lastError.message));
        } else {
          resolve(result);
        }
      };
      
      fn.call(this.api, ...args, callback);
    });
  }
}

module.exports = MockBrowserAPI;
