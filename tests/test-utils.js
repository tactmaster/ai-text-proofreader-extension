// Test utilities for Chrome extension testing

// Create a testable version of the cleanResponse function
function createCleanResponseTest() {
  // This is the cleanResponse function from background.js adapted for testing
  function cleanResponse(response) {
    if (!response || typeof response !== 'string') {
      return response;
    }

    let cleaned = response.trim();
    
    // Remove common wrapper phrases (case insensitive)
    const wrapperPhrases = [
      /^here\s+is\s+the\s+corrected?\s+text:?\s*/i,
      /^here\s+is\s+the\s+improved\s+text:?\s*/i,
      /^here\s+is\s+an?\s+improved\s+version:?\s*/i,
      /^corrected\s+text:?\s*/i,
      /^improved\s+text:?\s*/i,
      /^fixed\s+text:?\s*/i,
      /^revised\s+text:?\s*/i,
      /^the\s+corrected?\s+text\s+is:?\s*/i,
      /^the\s+improved\s+text\s+is:?\s*/i,
      /^the\s+fixed\s+text\s+is:?\s*/i,
      /^here\s+you\s+go:?\s*/i,
      /^here\s+it\s+is:?\s*/i,
      /^sure[,!]?\s+here\s+is\s+the\s+corrected?\s+text:?\s*/i,
      /^certainly[,!]?\s+here\s+is\s+the\s+corrected?\s+text:?\s*/i,
      /^sure[,!]?\s+i'?d\s+be\s+happy\s+to\s+help.*?here'?s.*?:?\s*/i,
      /^i'?d\s+be\s+happy\s+to\s+help.*?here'?s.*?:?\s*/i,
      /^of\s+course[,!]?\s+here'?s.*?:?\s*/i,
      /^absolutely[,!]?\s+here'?s.*?:?\s*/i,
      /^here'?s\s+the\s+corrected?\s+version:?\s*/i,
      /^here'?s\s+an?\s+improved\s+version:?\s*/i,
      /^here'?s\s+the\s+proofread\s+text:?\s*/i,
      /^let\s+me\s+help.*?:?\s*/i,
      /^i\s+can\s+help.*?:?\s*/i,
      // Additional patterns for specific reported issues
      /^sure[,!]?\s+here\s+is\s+the\s+corrected?\s+email:?\s*/i,
      /^here\s+is\s+the\s+corrected?\s+email:?\s*/i,
      /^corrected?\s+email:?\s*/i,
      /^here\s+is\s+your\s+corrected?\s+(?:text|email|message):?\s*/i,
      /^your\s+corrected?\s+(?:text|email|message):?\s*/i,
      /^corrected?\s+version:?\s*/i,
      /^improved?\s+version:?\s*/i,
      /^output:?\s*/i,
      /^result:?\s*/i
    ];

    // Remove wrapper phrases from the beginning
    for (const phrase of wrapperPhrases) {
      cleaned = cleaned.replace(phrase, '');
    }

    // Additional aggressive cleaning for conversational responses
    // Look for patterns like "Sure, I'd be happy to help... Here's..."
    const conversationalPatterns = [
      /^[^.!?]*?(here'?s\s+(?:the\s+)?(?:corrected?|improved?|proofread|revised)\s+(?:version|text)(?:\s+of\s+(?:the\s+)?text)?):?\s*/i,
      /^[^.!?]*?(here'?s\s+an?\s+(?:corrected?|improved?|better)\s+version):?\s*/i,
      /^[^.!?]*?(?:here'?s\s+what\s+i\s+suggest|here\s+are\s+the\s+corrections?):?\s*/i
    ];

    for (const pattern of conversationalPatterns) {
      const match = cleaned.match(pattern);
      if (match) {
        cleaned = cleaned.substring(match[0].length);
        break;
      }
    }

    // Remove quotes if the entire response is wrapped in quotes
    if ((cleaned.startsWith('"') && cleaned.endsWith('"')) ||
        (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
      cleaned = cleaned.slice(1, -1);
    }

    // Remove markdown code blocks if present
    cleaned = cleaned.replace(/^```[\w]*\s*\n?/, '').replace(/\n?```\s*$/, '');

    // Remove trailing wrapper phrases
    const trailingPhrases = [
      /\s*(?:hope this helps|let me know|anything else|done|all fixed|perfect|great|looks good|i hope this.*?)(?:[!.?]*)?[\s\n]*$/i,
      /\s*(?:hope that helps|is that better|how does that look|does this work|is this what you wanted)(?:[!.?]*)?[\s\n]*$/i
    ];

    for (const phrase of trailingPhrases) {
      cleaned = cleaned.replace(phrase, '');
    }

    // Preserve formatting by only removing excessive leading/trailing whitespace
    // Remove only excessive leading/trailing blank lines, but preserve intentional newlines
    cleaned = cleaned.replace(/^\n{3,}/, '\n\n').replace(/\n{3,}$/, '\n\n');
    
    // Trim only space/tab characters from start and end, but preserve newlines
    cleaned = cleaned.replace(/^[ \t]+/, '').replace(/[ \t]+$/, '');
    
    // If result is just whitespace, return empty string
    if (!cleaned.trim()) {
      return '';
    }
    
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
