// Privacy Protection Tests for AI Text Proofreader Extension
// Tests comprehensive privacy features including data leakage prevention,
// explicit consent requirements, and audit logging

const { PrivacyManager } = require('../shared/privacy-manager.js');

// Mock browser API
const mockBrowserAPI = {
  storage: {
    sync: {
      data: {},
      get: function(keys) {
        return Promise.resolve(
          keys ? { [keys[0]]: this.data[keys[0]] } : this.data
        );
      },
      set: function(data) {
        Object.assign(this.data, data);
        return Promise.resolve();
      },
      remove: function(keys) {
        if (Array.isArray(keys)) {
          keys.forEach(key => delete this.data[key]);
        } else {
          delete this.data[keys];
        }
        return Promise.resolve();
      }
    }
  }
};

describe('Privacy Manager', () => {
  let privacyManager;

  beforeEach(async () => {
    // Reset mock storage
    mockBrowserAPI.storage.sync.data = {};
    privacyManager = new PrivacyManager(mockBrowserAPI);
    await privacyManager.init();
  });

  describe('Data Transmission Validation', () => {
    test('should block transmission without explicit consent when required', () => {
      privacyManager.settings.requireExplicitConsent = true;
      
      const validation = privacyManager.validateDataTransmission(
        'test text',
        'openai',
        'gpt-3.5-turbo',
        false // no consent
      );
      
      expect(validation.allowed).toBe(false);
      expect(validation.reason).toContain('Explicit user consent required');
    });

    test('should allow transmission with explicit consent', () => {
      privacyManager.settings.requireExplicitConsent = true;
      
      const validation = privacyManager.validateDataTransmission(
        'test text',
        'openai',
        'gpt-3.5-turbo',
        true // has consent
      );
      
      expect(validation.allowed).toBe(true);
      expect(validation.reason).toContain('All privacy checks passed');
    });

    test('should block transmission without provider/model when data leakage prevention is enabled', () => {
      privacyManager.settings.preventDataLeakage = true;
      
      const validation = privacyManager.validateDataTransmission(
        'test text',
        null, // no provider
        'gpt-3.5-turbo',
        true
      );
      
      expect(validation.allowed).toBe(false);
      expect(validation.reason).toContain('Provider and model must be specified');
    });

    test('should block transmission with invalid text', () => {
      const validation = privacyManager.validateDataTransmission(
        null, // invalid text
        'openai',
        'gpt-3.5-turbo',
        true
      );
      
      expect(validation.allowed).toBe(false);
      expect(validation.reason).toContain('Invalid text content');
    });

    test('should block transmission when text exceeds length limit', () => {
      const longText = 'a'.repeat(10001); // Exceeds 10,000 character limit
      
      const validation = privacyManager.validateDataTransmission(
        longText,
        'openai',
        'gpt-3.5-turbo',
        true
      );
      
      expect(validation.allowed).toBe(false);
      expect(validation.reason).toContain('exceeds maximum length limit');
    });

    test('should allow transmission with valid parameters', () => {
      const validation = privacyManager.validateDataTransmission(
        'valid test text',
        'openai',
        'gpt-3.5-turbo',
        true
      );
      
      expect(validation.allowed).toBe(true);
      expect(validation.reason).toContain('All privacy checks passed');
    });
  });

  describe('Provider Selection Validation', () => {
    test('should block transmission to non-selected provider when leakage prevention is enabled', () => {
      privacyManager.settings.preventDataLeakage = true;
      
      const isAllowed = privacyManager.validateProviderSelection('openai', 'ollama');
      
      expect(isAllowed).toBe(false);
    });

    test('should allow transmission to selected provider', () => {
      privacyManager.settings.preventDataLeakage = true;
      
      const isAllowed = privacyManager.validateProviderSelection('openai', 'openai');
      
      expect(isAllowed).toBe(true);
    });

    test('should allow any provider when leakage prevention is disabled', () => {
      privacyManager.settings.preventDataLeakage = false;
      
      const isAllowed = privacyManager.validateProviderSelection('openai', 'ollama');
      
      expect(isAllowed).toBe(true);
    });
  });

  describe('Audit Logging', () => {
    test('should not log when audit logging is disabled', async () => {
      privacyManager.settings.enableAuditLogging = false;
      
      await privacyManager.logDataTransmission(
        'test text',
        'openai',
        'gpt-3.5-turbo',
        'proofread'
      );
      
      expect(privacyManager.auditLog.length).toBe(0);
    });

    test('should log when audit logging is enabled', async () => {
      privacyManager.settings.enableAuditLogging = true;
      
      await privacyManager.logDataTransmission(
        'test text',
        'openai',
        'gpt-3.5-turbo',
        'proofread',
        { url: 'https://example.com' }
      );
      
      expect(privacyManager.auditLog.length).toBe(1);
      expect(privacyManager.auditLog[0]).toMatchObject({
        action: 'proofread',
        provider: 'openai',
        model: 'gpt-3.5-turbo',
        textLength: 9,
        metadata: { url: 'https://example.com' }
      });
    });

    test('should limit log size', async () => {
      privacyManager.settings.enableAuditLogging = true;
      privacyManager.settings.maxLogEntries = 2;
      
      // Add 3 entries
      for (let i = 0; i < 3; i++) {
        await privacyManager.logDataTransmission(
          `test text ${i}`,
          'openai',
          'gpt-3.5-turbo',
          'proofread'
        );
      }
      
      expect(privacyManager.auditLog.length).toBe(2);
      expect(privacyManager.auditLog[0]).toMatchObject({
        textLength: 11 // "test text 1"
      });
      expect(privacyManager.auditLog[1]).toMatchObject({
        textLength: 11 // "test text 2"
      });
    });

    test('should generate unique log IDs', async () => {
      privacyManager.settings.enableAuditLogging = true;
      
      await privacyManager.logDataTransmission('text1', 'openai', 'gpt-3.5-turbo', 'proofread');
      await privacyManager.logDataTransmission('text2', 'openai', 'gpt-3.5-turbo', 'proofread');
      
      expect(privacyManager.auditLog[0].id).not.toBe(privacyManager.auditLog[1].id);
    });

    test('should hash text content for privacy', () => {
      const text = 'sensitive text content';
      const hash1 = privacyManager.hashText(text);
      const hash2 = privacyManager.hashText(text);
      const hash3 = privacyManager.hashText('different text');
      
      expect(hash1).toBe(hash2); // Same text produces same hash
      expect(hash1).not.toBe(hash3); // Different text produces different hash
      expect(typeof hash1).toBe('string');
    });

    test('should clear audit log', async () => {
      privacyManager.settings.enableAuditLogging = true;
      
      await privacyManager.logDataTransmission('test', 'openai', 'gpt-3.5-turbo', 'proofread');
      expect(privacyManager.auditLog.length).toBe(1);
      
      await privacyManager.clearAuditLog();
      expect(privacyManager.auditLog.length).toBe(0);
    });

    test('should return filtered audit log for user review', async () => {
      privacyManager.settings.enableAuditLogging = true;
      
      await privacyManager.logDataTransmission(
        'sensitive text',
        'openai',
        'gpt-3.5-turbo',
        'proofread',
        { url: 'https://example.com', secretKey: 'hidden' }
      );
      
      const userLog = privacyManager.getAuditLog();
      
      expect(userLog.length).toBe(1);
      expect(userLog[0]).toHaveProperty('id');
      expect(userLog[0]).toHaveProperty('timestamp');
      expect(userLog[0]).toHaveProperty('action', 'proofread');
      expect(userLog[0]).toHaveProperty('provider', 'openai');
      expect(userLog[0]).toHaveProperty('model', 'gpt-3.5-turbo');
      expect(userLog[0]).toHaveProperty('textLength', 14);
      expect(userLog[0]).toHaveProperty('url', 'https://example.com');
      
      // Should not contain sensitive data
      expect(userLog[0]).not.toHaveProperty('textHash');
      expect(userLog[0]).not.toHaveProperty('metadata');
    });
  });

  describe('Privacy Settings', () => {
    test('should save and load privacy settings', async () => {
      const newSettings = {
        enableAuditLogging: true,
        requireExplicitConsent: false,
        preventDataLeakage: true,
        maxLogEntries: 500
      };
      
      await privacyManager.saveSettings(newSettings);
      
      // Create new instance to test loading
      const newPrivacyManager = new PrivacyManager(mockBrowserAPI);
      await newPrivacyManager.init();
      
      expect(newPrivacyManager.settings).toMatchObject(newSettings);
    });

    test('should determine protection level correctly', () => {
      // Maximum protection
      privacyManager.settings.requireExplicitConsent = true;
      privacyManager.settings.preventDataLeakage = true;
      privacyManager.settings.enableAuditLogging = true;
      expect(privacyManager.getProtectionLevel()).toBe('maximum');
      
      // High protection
      privacyManager.settings.enableAuditLogging = false;
      expect(privacyManager.getProtectionLevel()).toBe('high');
      
      // Medium protection
      privacyManager.settings.preventDataLeakage = false;
      expect(privacyManager.getProtectionLevel()).toBe('medium');
      
      // Basic protection
      privacyManager.settings.requireExplicitConsent = false;
      expect(privacyManager.getProtectionLevel()).toBe('basic');
    });

    test('should provide privacy status summary', () => {
      const status = privacyManager.getPrivacyStatus();
      
      expect(status).toHaveProperty('settings');
      expect(status).toHaveProperty('auditLogCount');
      expect(status).toHaveProperty('protectionLevel');
      expect(status).toHaveProperty('lastLogEntry');
    });
  });

  describe('Log Cleanup', () => {
    test('should clean old logs based on age', async () => {
      privacyManager.settings.enableAuditLogging = true;
      privacyManager.settings.autoDeleteLogsAfterDays = 1;
      
      // Add old log entry
      const oldEntry = {
        id: 'old-entry',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        action: 'proofread',
        provider: 'openai',
        model: 'gpt-3.5-turbo',
        textLength: 10
      };
      
      // Add recent log entry
      const recentEntry = {
        id: 'recent-entry',
        timestamp: new Date().toISOString(),
        action: 'proofread',
        provider: 'openai',
        model: 'gpt-3.5-turbo',
        textLength: 10
      };
      
      privacyManager.auditLog = [oldEntry, recentEntry];
      
      await privacyManager.cleanOldLogs();
      
      expect(privacyManager.auditLog.length).toBe(1);
      expect(privacyManager.auditLog[0].id).toBe('recent-entry');
    });

    test('should not clean logs when auto-delete is disabled', async () => {
      privacyManager.settings.enableAuditLogging = true;
      privacyManager.settings.autoDeleteLogsAfterDays = 0; // Disabled
      
      const oldEntry = {
        id: 'old-entry',
        timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
        action: 'proofread'
      };
      
      privacyManager.auditLog = [oldEntry];
      
      await privacyManager.cleanOldLogs();
      
      expect(privacyManager.auditLog.length).toBe(1);
    });
  });
});

// Integration tests for LLMProofreader privacy features
describe('LLMProofreader Privacy Integration', () => {
  // Mock LLMProofreader with privacy manager
  class MockLLMProofreader {
    constructor() {
      this.settings = {
        provider: 'openai',
        model: 'gpt-3.5-turbo',
        apiKey: 'test-key'
      };
      this.privacyManager = new PrivacyManager(mockBrowserAPI);
    }

    async validatePrivacyAndLog(text, action, hasConsent = false, metadata = {}) {
      if (this.privacyManager) {
        const validation = this.privacyManager.validateDataTransmission(
          text, 
          this.settings.provider, 
          this.settings.model, 
          hasConsent
        );
        
        if (!validation.allowed) {
          throw new Error(`Privacy protection: ${validation.reason}`);
        }
        
        await this.privacyManager.logDataTransmission(
          text, 
          this.settings.provider, 
          this.settings.model, 
          action,
          metadata
        );
      }
    }
  }

  let proofreader;

  beforeEach(async () => {
    mockBrowserAPI.storage.sync.data = {};
    proofreader = new MockLLMProofreader();
    await proofreader.privacyManager.init();
  });

  test('should prevent data transmission without consent', async () => {
    proofreader.privacyManager.settings.requireExplicitConsent = true;
    
    await expect(
      proofreader.validatePrivacyAndLog('test text', 'proofread', false)
    ).rejects.toThrow('Privacy protection: Explicit user consent required');
  });

  test('should allow data transmission with consent and log it', async () => {
    proofreader.privacyManager.settings.requireExplicitConsent = true;
    proofreader.privacyManager.settings.enableAuditLogging = true;
    
    await expect(
      proofreader.validatePrivacyAndLog('test text', 'proofread', true, { url: 'test.com' })
    ).resolves.not.toThrow();
    
    expect(proofreader.privacyManager.auditLog.length).toBe(1);
    expect(proofreader.privacyManager.auditLog[0]).toMatchObject({
      action: 'proofread',
      provider: 'openai',
      model: 'gpt-3.5-turbo',
      textLength: 9
    });
  });

  test('should prevent data leakage to wrong provider', async () => {
    proofreader.privacyManager.settings.preventDataLeakage = true;
    
    // Simulate trying to send to different provider
    const isAllowed = proofreader.privacyManager.validateProviderSelection('ollama', 'openai');
    
    expect(isAllowed).toBe(false);
  });
});

// Mock console methods to avoid spam during tests
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};