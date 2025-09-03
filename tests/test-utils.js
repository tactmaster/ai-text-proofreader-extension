// Test utilities for Chrome extension testing

// Create a testable version of the cleanResponse function
function createCleanResponseTest() {
  // This is the cleanResponse function from background.js adapted for testing
  function cleanResponse(response) {
    if (!response || typeof response !== 'string') {
      return '';
    }

    let cleaned = response.trim();

    // Remove common AI wrapper phrases but preserve formatting
    const wrapperPatterns = [
      // Remove leading wrapper phrases
      /^(Here's|Here is|Here are|This is|The corrected|Corrected|Fixed|Output|Result|Here you go).*?[:]\s*/i,
      // Remove "The fixed text is:" pattern specifically
      /^The fixed text is:\s*/i,
      // Remove trailing wrapper phrases  
      /\s*(Hope this helps|Let me know|Anything else|Done|All fixed|Perfect|Great|Looks good).*$/i,
      // Remove standalone encouragement
      /^\s*(Great|Perfect|Excellent|Nice|Good)\s*[!.]*\s*$/im,
      // Remove "I hope" phrases
      /\s*I hope this.*$/i,
      // Remove single letter artifacts
      /^\s*[A-Za-z]\s*$/m
    ];

    wrapperPatterns.forEach(pattern => {
      cleaned = cleaned.replace(pattern, '');
    });

    // Clean up extra whitespace but preserve intentional formatting
    cleaned = cleaned.trim();
    
    // Don't collapse multiple newlines - they might be intentional formatting
    // Just remove excessive leading/trailing whitespace
    return cleaned;
  }

  return cleanResponse;
}

// Create testable version of ContextDetector
function createContextDetectorTest() {
  // Static website contexts for testing
  const WEBSITE_CONTEXTS = {
    'mail.google.com': {
      name: 'Gmail',
      type: 'email',
      prompts: {
        formal: `INSTRUCTION: Fix grammar and spelling in this professional email. Output ONLY the corrected text. PRESERVE all original formatting including newlines, bullet points, numbered lists, and paragraph breaks.

INPUT TEXT:
"{{TEXT}}"

OUTPUT (corrected email only):`,
        casual: `INSTRUCTION: Fix grammar and spelling in this casual email. Output ONLY the corrected text. PRESERVE all original formatting including newlines, bullet points, numbered lists, and paragraph breaks.

INPUT TEXT:
"{{TEXT}}"

OUTPUT (corrected email only):`,
        default: `INSTRUCTION: Fix grammar and spelling in this email. Output ONLY the corrected text. PRESERVE all original formatting including newlines, bullet points, numbered lists, and paragraph breaks.

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
    'outlook.live.com': {
      name: 'Outlook',
      type: 'email',
      prompts: {
        formal: `INSTRUCTION: Fix grammar and spelling in this professional email. Output ONLY the corrected text. PRESERVE all original formatting including newlines, bullet points, numbered lists, and paragraph breaks.

INPUT TEXT:
"{{TEXT}}"

OUTPUT (corrected email only):`,
        casual: `INSTRUCTION: Fix grammar and spelling in this casual email. Output ONLY the corrected text. PRESERVE all original formatting including newlines, bullet points, numbered lists, and paragraph breaks.

INPUT TEXT:
"{{TEXT}}"

OUTPUT (corrected email only):`,
        default: `INSTRUCTION: Fix grammar and spelling in this email. Output ONLY the corrected text. PRESERVE all original formatting including newlines, bullet points, numbered lists, and paragraph breaks.

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
    'github.com': {
      name: 'GitHub',
      type: 'development',
      prompts: {
        commit: `INSTRUCTION: Fix grammar and spelling in this commit message. Output ONLY the corrected text. PRESERVE all original formatting including newlines, bullet points, numbered lists, and line breaks.

INPUT TEXT:
"{{TEXT}}"

OUTPUT (corrected commit message only):`,
        pr: `INSTRUCTION: Fix grammar and spelling in this pull request description. Output ONLY the corrected text. PRESERVE all original formatting including newlines, bullet points, numbered lists, code blocks, and markdown formatting.

INPUT TEXT:
"{{TEXT}}"

OUTPUT (corrected PR description only):`,
        default: `INSTRUCTION: Fix grammar and spelling in this technical content. Output ONLY the corrected text. PRESERVE all original formatting including newlines, bullet points, numbered lists, code blocks, and markdown formatting.

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
    'default': {
      name: 'General',
      type: 'general',
      prompts: {
        default: `INSTRUCTION: Correct spelling and grammar errors in the text below. Output ONLY the corrected text. PRESERVE all original formatting including newlines, bullet points, numbered lists, and paragraph breaks. Do NOT include any introductory phrases, explanations, or conversational text.

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

  class ContextDetector {
    constructor() {
      this.customSettings = null;
      this.defaultContexts = WEBSITE_CONTEXTS;
    }

    async loadCustomSettings() {
      return new Promise((resolve) => {
        if (global.chrome && global.chrome.storage && global.chrome.storage.sync) {
          global.chrome.storage.sync.get(['contextSettings'], (result) => {
            if (result.contextSettings) {
              this.customSettings = result.contextSettings;
            }
            resolve();
          });
        } else {
          resolve();
        }
      });
    }

    getWebsiteContext() {
      const hostname = (global.mockLocation && global.mockLocation.hostname) ? 
        global.mockLocation.hostname : 'unknown-site.com';
      
      // Check custom settings first
      if (this.customSettings && this.customSettings.websites) {
        for (const [contextType, websites] of Object.entries(this.customSettings.websites)) {
          if (websites.includes(hostname)) {
            return {
              name: contextType.charAt(0).toUpperCase() + contextType.slice(1),
              type: contextType,
              prompts: this.customSettings.prompts[contextType] || {},
              settings: {
                showToneOptions: true,
                defaultTone: 'default',
                contextHint: `${contextType} context (custom)`
              }
            };
          }
        }
      }

      // Check static contexts
      for (const [domain, context] of Object.entries(this.defaultContexts)) {
        if (hostname.includes(domain) || domain === hostname) {
          return context;
        }
      }

      // Fallback to default
      return this.defaultContexts.default;
    }

    getContextPrompt(context, tone = 'default') {
      if (!context || !context.prompts) {
        return this.defaultContexts.default.prompts.default;
      }

      return context.prompts[tone] || context.prompts.default || this.defaultContexts.default.prompts.default;
    }
  }

  return { ContextDetector, WEBSITE_CONTEXTS };
}

module.exports = {
  createCleanResponseTest,
  createContextDetectorTest
};
