// Cross-browser API abstraction layer
// Provides consistent API access for Chrome, Edge, and Firefox

class BrowserAPI {
  constructor() {
    // Detect browser and API availability
    this.api = this.detectBrowserAPI();
    this.isChromium = this.api === (typeof chrome !== 'undefined' ? chrome : null);
    this.isFirefox = this.api === (typeof browser !== 'undefined' ? browser : null);
  }

  detectBrowserAPI() {
    // Firefox uses browser.* API
    if (typeof browser !== 'undefined' && browser.runtime) {
      return browser;
    }
    
    // Chrome/Edge uses chrome.* API
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      return chrome;
    }
    
    // Fallback - throw error if no compatible API found
    throw new Error('No compatible browser extension API found');
  }

  // Storage API abstraction
  get storage() {
    return {
      sync: {
        get: (keys) => {
          if (this.isFirefox) {
            return this.api.storage.sync.get(keys);
          }
          return new Promise((resolve, reject) => {
            this.api.storage.sync.get(keys, (result) => {
              if (this.api.runtime.lastError) {
                reject(new Error(this.api.runtime.lastError.message));
              } else {
                resolve(result);
              }
            });
          });
        },
        
        set: (items) => {
          if (this.isFirefox) {
            return this.api.storage.sync.set(items);
          }
          return new Promise((resolve, reject) => {
            this.api.storage.sync.set(items, () => {
              if (this.api.runtime.lastError) {
                reject(new Error(this.api.runtime.lastError.message));
              } else {
                resolve();
              }
            });
          });
        },

        remove: (keys) => {
          if (this.isFirefox) {
            return this.api.storage.sync.remove(keys);
          }
          return new Promise((resolve) => {
            this.api.storage.sync.remove(keys, resolve);
          });
        },

        clear: () => {
          if (this.isFirefox) {
            return this.api.storage.sync.clear();
          }
          return new Promise((resolve) => {
            this.api.storage.sync.clear(resolve);
          });
        }
      },

      local: {
        get: (keys) => {
          if (this.isFirefox) {
            return this.api.storage.local.get(keys);
          }
          return new Promise((resolve) => {
            this.api.storage.local.get(keys, resolve);
          });
        },
        
        set: (items) => {
          if (this.isFirefox) {
            return this.api.storage.local.set(items);
          }
          return new Promise((resolve) => {
            this.api.storage.local.set(items, resolve);
          });
        },

        remove: (keys) => {
          if (this.isFirefox) {
            return this.api.storage.local.remove(keys);
          }
          return new Promise((resolve) => {
            this.api.storage.local.remove(keys, resolve);
          });
        },

        clear: () => {
          if (this.isFirefox) {
            return this.api.storage.local.clear();
          }
          return new Promise((resolve) => {
            this.api.storage.local.clear(resolve);
          });
        }
      }
    };
  }

  // Runtime API abstraction
  get runtime() {
    return {
      sendMessage: (message) => {
        if (this.isFirefox) {
          return this.api.runtime.sendMessage(message);
        }
        return new Promise((resolve, reject) => {
          this.api.runtime.sendMessage(message, (response) => {
            if (this.api.runtime.lastError) {
              reject(new Error(this.api.runtime.lastError.message));
            } else {
              resolve(response);
            }
          });
        });
      },

      onMessage: {
        addListener: (callback) => {
          if (this.isFirefox) {
            this.api.runtime.onMessage.addListener((request, sender) => {
              // Firefox expects a promise return for async responses
              const result = callback(request, sender, () => {});
              if (result instanceof Promise) {
                return result;
              }
              return Promise.resolve(result);
            });
          } else {
            this.api.runtime.onMessage.addListener((request, sender, sendResponse) => {
              const result = callback(request, sender, sendResponse);
              // Chrome needs explicit async handling
              if (result instanceof Promise) {
                result.then(sendResponse);
                return true; // Keep message channel open
              }
            });
          }
        },

        removeListener: (callback) => {
          this.api.runtime.onMessage.removeListener(callback);
        }
      },

      onInstalled: {
        addListener: (callback) => {
          this.api.runtime.onInstalled.addListener(callback);
        }
      },

      get id() {
        return this.api.runtime.id;
      }
    };
  }

  // Tabs API abstraction
  get tabs() {
    return {
      create: (createProperties) => {
        if (this.isFirefox) {
          return this.api.tabs.create(createProperties);
        }
        return new Promise((resolve, reject) => {
          this.api.tabs.create(createProperties, (tab) => {
            if (this.api.runtime.lastError) {
              reject(new Error(this.api.runtime.lastError.message));
            } else {
              resolve(tab);
            }
          });
        });
      },

      query: (queryInfo) => {
        if (this.isFirefox) {
          return this.api.tabs.query(queryInfo);
        }
        return new Promise((resolve) => {
          this.api.tabs.query(queryInfo, resolve);
        });
      },

      sendMessage: (tabId, message) => {
        if (this.isFirefox) {
          return this.api.tabs.sendMessage(tabId, message);
        }
        return new Promise((resolve, reject) => {
          this.api.tabs.sendMessage(tabId, message, (response) => {
            if (this.api.runtime.lastError) {
              reject(new Error(this.api.runtime.lastError.message));
            } else {
              resolve(response);
            }
          });
        });
      }
    };
  }

  // Utility methods
  isExtensionContext() {
    try {
      return !!(this.api && this.api.runtime && this.api.runtime.id);
    } catch (error) {
      return false;
    }
  }

  getBrowserInfo() {
    return {
      isChromium: this.isChromium,
      isFirefox: this.isFirefox,
      api: this.isFirefox ? 'browser' : 'chrome'
    };
  }
}

// Create global instance
let browserAPI;
try {
  browserAPI = new BrowserAPI();
  console.log('[AI Proofreader] Browser API initialized successfully');
} catch (error) {
  console.warn('[AI Proofreader] Browser API not available:', error.message);
  console.warn('[AI Proofreader] This may be normal during extension initialization');
  browserAPI = null;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { BrowserAPI, browserAPI };
} else {
  // Global assignment for browser environment
  window.browserAPI = browserAPI;
  window.BrowserAPI = BrowserAPI;
  
  // If browserAPI failed to initialize, try again after a short delay
  if (!browserAPI) {
    setTimeout(() => {
      try {
        browserAPI = new BrowserAPI();
        window.browserAPI = browserAPI;
        console.log('[AI Proofreader] Browser API initialized on retry');
      } catch (retryError) {
        console.error('[AI Proofreader] Browser API failed to initialize on retry:', retryError.message);
      }
    }, 50);
  }
}