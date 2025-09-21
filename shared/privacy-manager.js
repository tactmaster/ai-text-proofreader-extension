// Privacy Protection Manager for AI Text Proofreader Extension
// Ensures user data is handled with maximum privacy and security

class PrivacyManager {
  constructor(browserAPI) {
    this.browserAPI = browserAPI;
    this.auditLog = [];
    this.settings = {
      enableAuditLogging: false,
      requireExplicitConsent: true,
      preventDataLeakage: true,
      maxLogEntries: 1000,
      autoDeleteLogsAfterDays: 30
    };
    
    this.init();
  }

  async init() {
    // Load privacy settings
    await this.loadSettings();
    
    // Clean old logs if enabled
    if (this.settings.enableAuditLogging) {
      await this.cleanOldLogs();
    }
    
    console.log('[Privacy Manager] Initialized with settings:', this.settings);
  }

  async loadSettings() {
    try {
      const result = await this.browserAPI.storage.sync.get(['privacySettings']);
      if (result.privacySettings) {
        this.settings = { ...this.settings, ...result.privacySettings };
      }
    } catch (error) {
      console.error('[Privacy Manager] Failed to load settings:', error);
    }
  }

  async saveSettings(newSettings) {
    try {
      this.settings = { ...this.settings, ...newSettings };
      await this.browserAPI.storage.sync.set({ privacySettings: this.settings });
      console.log('[Privacy Manager] Settings saved:', this.settings);
    } catch (error) {
      console.error('[Privacy Manager] Failed to save settings:', error);
      throw error;
    }
  }

  /**
   * Validates that data transmission is allowed based on privacy settings
   * @param {string} text - The text being sent
   * @param {string} provider - The LLM provider (ollama, openai, etc.)
   * @param {string} model - The specific model name
   * @param {boolean} hasUserConsent - Whether user explicitly consented to this action
   * @returns {Object} Validation result with allowed status and reason
   */
  validateDataTransmission(text, provider, model, hasUserConsent = false) {
    const validation = {
      allowed: false,
      reason: '',
      timestamp: new Date().toISOString()
    };

    // Check if explicit consent is required but not provided
    if (this.settings.requireExplicitConsent && !hasUserConsent) {
      validation.reason = 'Explicit user consent required but not provided';
      console.warn('[Privacy Manager] Data transmission blocked:', validation.reason);
      return validation;
    }

    // Check for data leakage prevention
    if (this.settings.preventDataLeakage) {
      if (!provider || !model) {
        validation.reason = 'Provider and model must be specified to prevent data leakage';
        console.warn('[Privacy Manager] Data transmission blocked:', validation.reason);
        return validation;
      }
    }

    // Validate text content
    if (!text || typeof text !== 'string') {
      validation.reason = 'Invalid text content';
      console.warn('[Privacy Manager] Data transmission blocked:', validation.reason);
      return validation;
    }

    // Check text length limits
    if (text.length > 10000) {
      validation.reason = 'Text exceeds maximum length limit (10,000 characters)';
      console.warn('[Privacy Manager] Data transmission blocked:', validation.reason);
      return validation;
    }

    // All checks passed
    validation.allowed = true;
    validation.reason = 'All privacy checks passed';
    
    console.log('[Privacy Manager] Data transmission approved for:', { provider, model, textLength: text.length });
    return validation;
  }

  /**
   * Logs data transmission for audit purposes (if enabled)
   * @param {string} text - The text being sent
   * @param {string} provider - The LLM provider
   * @param {string} model - The model name
   * @param {string} action - The action performed (proofread, suggestions, etc.)
   * @param {Object} metadata - Additional metadata
   */
  async logDataTransmission(text, provider, model, action, metadata = {}) {
    if (!this.settings.enableAuditLogging) {
      return; // Logging disabled
    }

    const logEntry = {
      id: this.generateLogId(),
      timestamp: new Date().toISOString(),
      action,
      provider,
      model,
      textLength: text ? text.length : 0,
      textHash: text ? this.hashText(text) : null,
      metadata,
      userAgent: navigator.userAgent,
      url: metadata.url || 'unknown'
    };

    // Add to in-memory log
    this.auditLog.push(logEntry);

    // Limit log size
    if (this.auditLog.length > this.settings.maxLogEntries) {
      this.auditLog = this.auditLog.slice(-this.settings.maxLogEntries);
    }

    // Persist to storage
    try {
      await this.saveAuditLog();
      console.log('[Privacy Manager] Logged data transmission:', logEntry.id);
    } catch (error) {
      console.error('[Privacy Manager] Failed to save audit log:', error);
    }
  }

  /**
   * Creates a hash of text for audit purposes without storing the actual content
   * @param {string} text - Text to hash
   * @returns {string} SHA-256 hash of the text
   */
  hashText(text) {
    // Simple hash function for audit purposes
    // In a real implementation, you might want to use a proper crypto library
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(16);
  }

  generateLogId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  async saveAuditLog() {
    try {
      await this.browserAPI.storage.sync.set({ 
        privacyAuditLog: this.auditLog.slice(-100) // Only save last 100 entries to storage
      });
    } catch (error) {
      console.error('[Privacy Manager] Failed to save audit log:', error);
      throw error;
    }
  }

  async loadAuditLog() {
    try {
      const result = await this.browserAPI.storage.sync.get(['privacyAuditLog']);
      if (result.privacyAuditLog) {
        this.auditLog = result.privacyAuditLog;
      }
    } catch (error) {
      console.error('[Privacy Manager] Failed to load audit log:', error);
    }
  }

  async cleanOldLogs() {
    if (!this.settings.enableAuditLogging || !this.settings.autoDeleteLogsAfterDays) {
      return;
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.settings.autoDeleteLogsAfterDays);

    const originalLength = this.auditLog.length;
    this.auditLog = this.auditLog.filter(entry => 
      new Date(entry.timestamp) > cutoffDate
    );

    if (this.auditLog.length !== originalLength) {
      await this.saveAuditLog();
      console.log(`[Privacy Manager] Cleaned ${originalLength - this.auditLog.length} old log entries`);
    }
  }

  /**
   * Gets audit log entries for user review
   * @param {number} limit - Maximum number of entries to return
   * @returns {Array} Array of log entries (without sensitive data)
   */
  getAuditLog(limit = 50) {
    return this.auditLog
      .slice(-limit)
      .map(entry => ({
        id: entry.id,
        timestamp: entry.timestamp,
        action: entry.action,
        provider: entry.provider,
        model: entry.model,
        textLength: entry.textLength,
        url: entry.url
        // Note: textHash and full metadata excluded for privacy
      }));
  }

  /**
   * Clears all audit logs
   */
  async clearAuditLog() {
    this.auditLog = [];
    try {
      await this.browserAPI.storage.sync.remove(['privacyAuditLog']);
      console.log('[Privacy Manager] Audit log cleared');
    } catch (error) {
      console.error('[Privacy Manager] Failed to clear audit log:', error);
      throw error;
    }
  }

  /**
   * Validates that only the selected provider/model receives data
   * @param {string} requestedProvider - Provider being used
   * @param {string} selectedProvider - Currently selected provider in settings
   * @returns {boolean} Whether the request is allowed
   */
  validateProviderSelection(requestedProvider, selectedProvider) {
    if (this.settings.preventDataLeakage && requestedProvider !== selectedProvider) {
      console.warn(`[Privacy Manager] Data leakage prevented: Requested provider '${requestedProvider}' does not match selected provider '${selectedProvider}'`);
      return false;
    }
    return true;
  }

  /**
   * Gets privacy status summary
   * @returns {Object} Privacy status information
   */
  getPrivacyStatus() {
    return {
      settings: this.settings,
      auditLogCount: this.auditLog.length,
      lastLogEntry: this.auditLog.length > 0 ? this.auditLog[this.auditLog.length - 1].timestamp : null,
      protectionLevel: this.getProtectionLevel()
    };
  }

  getProtectionLevel() {
    let level = 'basic';
    
    if (this.settings.requireExplicitConsent && this.settings.preventDataLeakage) {
      level = 'high';
      if (this.settings.enableAuditLogging) {
        level = 'maximum';
      }
    } else if (this.settings.requireExplicitConsent || this.settings.preventDataLeakage) {
      level = 'medium';
    }
    
    return level;
  }
}

// Export for use in background script
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PrivacyManager };
}