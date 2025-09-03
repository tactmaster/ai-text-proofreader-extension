// Context-aware proofreading configurations for different websites

// Static contexts for fallback (defined first)
const WEBSITE_CONTEXTS = {
  // Email platforms
  'gmail.com': {
    name: 'Gmail',
    type: 'email',
    prompts: {
      formal: `INSTRUCTION: Fix grammar and spelling in this professional email. Output ONLY the corrected text.

INPUT TEXT:
"{{TEXT}}"

OUTPUT (corrected email only):`,
      casual: `INSTRUCTION: Fix grammar and spelling in this casual email. Output ONLY the corrected text.

INPUT TEXT:
"{{TEXT}}"

OUTPUT (corrected email only):`,
      default: `INSTRUCTION: Fix grammar and spelling in this email. Output ONLY the corrected text.

INPUT TEXT:
"{{TEXT}}"

OUTPUT (corrected email only):`
    },
    settings: {
      showToneOptions: true,
      defaultTone: 'default',
      contextHint: 'Email composition detected'
    }
  },

  'outlook.com': {
    name: 'Outlook',
    type: 'email',
    prompts: {
      formal: `INSTRUCTION: Fix grammar and spelling in this business email. Output ONLY the corrected text.

INPUT TEXT:
"{{TEXT}}"

OUTPUT (corrected email only):`,
      default: `INSTRUCTION: Fix grammar and spelling in this professional email. Output ONLY the corrected text.

INPUT TEXT:
"{{TEXT}}"

OUTPUT (corrected email only):`
    },
    settings: {
      showToneOptions: true,
      defaultTone: 'formal',
      contextHint: 'Business email detected'
    }
  },

  // Development platforms
  'github.com': {
    name: 'GitHub',
    type: 'development',
    prompts: {
      commit: `INSTRUCTION: Fix grammar and spelling in this commit message. Output ONLY the corrected text.

INPUT TEXT:
"{{TEXT}}"

OUTPUT (corrected commit message only):`,
      pr: `INSTRUCTION: Fix grammar and spelling in this pull request description. Output ONLY the corrected text.

INPUT TEXT:
"{{TEXT}}"

OUTPUT (corrected PR description only):`,
      issue: `INSTRUCTION: Fix grammar and spelling in this GitHub issue. Output ONLY the corrected text.

INPUT TEXT:
"{{TEXT}}"

OUTPUT (corrected issue only):`,
      comment: `INSTRUCTION: Fix grammar and spelling in this code review comment. Output ONLY the corrected text.

INPUT TEXT:
"{{TEXT}}"

OUTPUT (corrected comment only):`,
      default: `INSTRUCTION: Fix grammar and spelling in this technical content. Output ONLY the corrected text.

INPUT TEXT:
"{{TEXT}}"

OUTPUT (corrected text only):`
    },
    settings: {
      showToneOptions: true,
      toneOptions: ['commit', 'pr', 'issue', 'comment', 'default'],
      defaultTone: 'default',
      contextHint: 'GitHub detected - Technical content'
    }
  },

  // Default fallback
  'default': {
    name: 'General',
    type: 'general',
    prompts: {
      default: `INSTRUCTION: Correct spelling and grammar errors in the text below. Output ONLY the corrected text. Do NOT include any introductory phrases, explanations, or conversational text.

INPUT TEXT:
"{{TEXT}}"

OUTPUT (corrected text only):`
    },
    settings: {
      showToneOptions: false,
      defaultTone: 'default',
      contextHint: 'General text detected'
    }
  }
};

// Dynamic context detector that uses custom user settings
class ContextDetector {
  constructor() {
    this.customSettings = null;
    this.defaultContexts = WEBSITE_CONTEXTS;
    this.loadCustomSettings();
  }

  async loadCustomSettings() {
    try {
      const result = await chrome.storage.sync.get(['contextSettings']);
      this.customSettings = result.contextSettings;
      console.log('[DEBUG] Loaded custom context settings:', this.customSettings);
    } catch (error) {
      console.warn('[DEBUG] Failed to load custom context settings:', error);
      this.customSettings = null;
    }
  }

  async getWebsiteContext(hostname) {
    // Ensure settings are loaded
    if (!this.customSettings) {
      await this.loadCustomSettings();
    }

    // First try to find in custom settings
    if (this.customSettings && this.customSettings.websites) {
      const context = this.findContextInCustomSettings(hostname);
      if (context) {
        return context;
      }
    }

    // Fall back to default contexts
    return this.defaultContexts[hostname] || this.defaultContexts['default'];
  }

  findContextInCustomSettings(hostname) {
    const { websites, prompts } = this.customSettings;
    
    // Check each category for the hostname
    for (const [category, websiteList] of Object.entries(websites)) {
      if (websiteList.some(website => hostname.includes(website) || website.includes(hostname))) {
        return {
          name: this.getCategoryDisplayName(category),
          type: category,
          prompts: prompts[category] || {},
          settings: {
            showToneOptions: true,
            defaultTone: 'default',
            contextHint: `${this.getCategoryDisplayName(category)} detected`
          },
          isCustom: true
        };
      }
    }
    
    return null;
  }

  getCategoryDisplayName(category) {
    const displayNames = {
      email: 'Email',
      development: 'Development',
      social: 'Social Media',
      documentation: 'Documentation',
      general: 'General'
    };
    return displayNames[category] || category;
  }

  getContextPrompt(context, text, tone = 'default') {
    if (!context || !context.prompts) {
      return this.getDefaultPrompt(text);
    }

    const prompt = context.prompts[tone] || context.prompts.default || this.getDefaultPrompt(text);
    return prompt.replace(/\{\{TEXT\}\}/g, text);
  }

  getDefaultPrompt(text) {
    return `INSTRUCTION: Correct spelling and grammar errors in the text below. Output ONLY the corrected text. Do NOT include any introductory phrases, explanations, or conversational text.

INPUT TEXT:
"${text}"

OUTPUT (corrected text only):`;
  }
}

// Initialize the context detector after the class is defined
const contextDetector = new ContextDetector();

// Helper function to get context for current website
async function getWebsiteContext() {
  const hostname = window.location.hostname.toLowerCase();
  
  // Use the dynamic context detector first
  const context = await contextDetector.getWebsiteContext(hostname);
  if (context) {
    return context;
  }
  
  // Fall back to legacy static contexts
  // Check for exact match first
  if (WEBSITE_CONTEXTS[hostname]) {
    return resolveContext(WEBSITE_CONTEXTS[hostname], hostname);
  }
  
  // Check for subdomain matches
  for (const domain in WEBSITE_CONTEXTS) {
    if (hostname.includes(domain)) {
      return resolveContext(WEBSITE_CONTEXTS[domain], domain);
    }
  }
  
  // Return default context
  return resolveContext(WEBSITE_CONTEXTS['default'], 'default');
}

// Helper function to resolve inherited contexts
function resolveContext(context, key) {
  if (context.inherits) {
    const parentContext = WEBSITE_CONTEXTS[context.inherits];
    if (parentContext) {
      return { ...parentContext, ...context, key: key };
    }
  }
  return { ...context, key: key };
}

// Helper function to get context-aware prompt
async function getContextPrompt(text, toneOverride = null) {
  const context = await getWebsiteContext();
  const tone = toneOverride || context.settings?.defaultTone || 'default';
  
  // Use the dynamic context detector for prompt generation
  return contextDetector.getContextPrompt(context, text, tone);
}

// Helper function to detect content type based on page elements
function detectContentType() {
  // This function can be enhanced with more specific detection logic
  // For now, return default
  return 'default';
}

// Export for use in content script
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    WEBSITE_CONTEXTS,
    getWebsiteContext,
    getContextPrompt,
    detectContentType
  };
}
