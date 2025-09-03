// Context-aware proofreading configurations for different websites
const WEBSITE_CONTEXTS = {
  // Email platforms
  'gmail.com': {
    name: 'Gmail',
    type: 'email',
    prompts: {
      formal: `Please proofread this email for professional communication. Check for:
- Professional tone and clarity
- Proper email etiquette
- Grammar and spelling errors
- Appropriate formality level

Text to proofread:
"{{TEXT}}"

Corrected email:`,
      casual: `Please proofread this email for casual communication. Check for:
- Clear and friendly tone
- Grammar and spelling errors
- Natural flow and readability

Text to proofread:
"{{TEXT}}"

Corrected email:`,
      default: `Please proofread this email for clarity and correctness. Check for:
- Grammar and spelling errors
- Professional but friendly tone
- Clear communication

Text to proofread:
"{{TEXT}}"

Corrected email:`
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
      formal: `Please proofread this Outlook email for business communication. Check for:
- Professional tone and structure
- Clear subject matter
- Grammar and spelling errors
- Business etiquette

Text to proofread:
"{{TEXT}}"

Corrected email:`,
      default: `Please proofread this email for professional communication:

"{{TEXT}}"

Corrected email:`
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
      commit: `Please proofread this commit message for clarity and following conventional commit standards:

"{{TEXT}}"

Improved commit message:`,
      pr: `Please proofread this pull request description for technical clarity and completeness. Check for:
- Clear problem statement
- Technical accuracy
- Proper formatting
- Professional tone

Text to proofread:
"{{TEXT}}"

Improved PR description:`,
      issue: `Please proofread this GitHub issue for clarity and completeness. Check for:
- Clear problem description
- Steps to reproduce (if applicable)
- Technical details
- Professional tone

Text to proofread:
"{{TEXT}}"

Improved issue description:`,
      comment: `Please proofread this code review comment for constructive and professional feedback:

"{{TEXT}}"

Improved comment:`,
      default: `Please proofread this technical content for GitHub. Check for:
- Technical accuracy
- Clear communication
- Professional tone
- Proper formatting

Text to proofread:
"{{TEXT}}"

Corrected text:`
    },
    settings: {
      showToneOptions: true,
      toneOptions: ['commit', 'pr', 'issue', 'comment', 'default'],
      defaultTone: 'default',
      contextHint: 'GitHub detected - Technical content'
    }
  },

  'gitlab.com': {
    name: 'GitLab',
    type: 'development',
    inherits: 'github.com', // Inherit GitHub settings
    settings: {
      contextHint: 'GitLab detected - Technical content'
    }
  },

  // Social media platforms
  'twitter.com': {
    name: 'Twitter/X',
    type: 'social',
    prompts: {
      default: `Please proofread this tweet for clarity and engagement. Check for:
- Clear message within character limits
- Engaging tone
- Grammar and spelling errors
- Appropriate hashtags and mentions

Text to proofread:
"{{TEXT}}"

Improved tweet:`
    },
    settings: {
      contextHint: 'Tweet composition detected',
      maxLength: 280
    }
  },

  'x.com': {
    name: 'X (Twitter)',
    type: 'social',
    inherits: 'twitter.com'
  },

  'linkedin.com': {
    name: 'LinkedIn',
    type: 'professional-social',
    prompts: {
      post: `Please proofread this LinkedIn post for professional networking. Check for:
- Professional yet engaging tone
- Industry-appropriate language
- Clear value proposition
- Grammar and spelling errors

Text to proofread:
"{{TEXT}}"

Improved LinkedIn post:`,
      message: `Please proofread this LinkedIn message for professional communication:

"{{TEXT}}"

Improved message:`,
      default: `Please proofread this LinkedIn content for professional communication:

"{{TEXT}}"

Corrected text:`
    },
    settings: {
      showToneOptions: true,
      toneOptions: ['post', 'message', 'default'],
      defaultTone: 'default',
      contextHint: 'LinkedIn professional content'
    }
  },

  // Documentation platforms
  'notion.so': {
    name: 'Notion',
    type: 'documentation',
    prompts: {
      default: `Please proofread this documentation content for clarity and structure. Check for:
- Clear and organized information
- Proper documentation style
- Grammar and spelling errors
- Logical flow

Text to proofread:
"{{TEXT}}"

Improved documentation:`
    },
    settings: {
      contextHint: 'Documentation editing detected'
    }
  },

  'confluence.atlassian.com': {
    name: 'Confluence',
    type: 'documentation',
    inherits: 'notion.so',
    settings: {
      contextHint: 'Confluence documentation detected'
    }
  },

  // Forums and Q&A
  'stackoverflow.com': {
    name: 'Stack Overflow',
    type: 'qa-forum',
    prompts: {
      question: `Please proofread this Stack Overflow question for clarity and completeness. Check for:
- Clear problem statement
- Relevant technical details
- Proper formatting
- Professional tone

Text to proofread:
"{{TEXT}}"

Improved question:`,
      answer: `Please proofread this Stack Overflow answer for technical accuracy and clarity:

"{{TEXT}}"

Improved answer:`,
      default: `Please proofread this Stack Overflow content for technical clarity:

"{{TEXT}}"

Corrected text:`
    },
    settings: {
      showToneOptions: true,
      toneOptions: ['question', 'answer', 'default'],
      defaultTone: 'default',
      contextHint: 'Stack Overflow - Technical Q&A'
    }
  },

  'reddit.com': {
    name: 'Reddit',
    type: 'forum',
    prompts: {
      default: `Please proofread this Reddit post/comment for clarity and engagement. Check for:
- Clear communication
- Appropriate tone for the platform
- Grammar and spelling errors
- Natural conversational flow

Text to proofread:
"{{TEXT}}"

Improved content:`
    },
    settings: {
      contextHint: 'Reddit community content'
    }
  },

  // Default fallback
  'default': {
    name: 'General',
    type: 'general',
    prompts: {
      default: `Proofread and correct the following text for spelling, grammar, and style errors. Return ONLY the corrected text with no explanations, no introductory phrases, no quotes, and no additional formatting.

Text to correct:
"{{TEXT}}"

Corrected text:`
    },
    settings: {
      contextHint: 'General proofreading'
    }
  }
};

// Helper function to get context for current website
function getWebsiteContext() {
  const hostname = window.location.hostname.toLowerCase();
  
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
    const inheritedContext = WEBSITE_CONTEXTS[context.inherits];
    return {
      ...inheritedContext,
      ...context,
      prompts: { ...inheritedContext.prompts, ...context.prompts },
      settings: { ...inheritedContext.settings, ...context.settings },
      key: key
    };
  }
  return { ...context, key: key };
}

// Helper function to get context-aware prompt
function getContextPrompt(text, toneOverride = null) {
  const context = getWebsiteContext();
  const tone = toneOverride || context.settings?.defaultTone || 'default';
  const prompt = context.prompts[tone] || context.prompts.default;
  
  return prompt.replace('{{TEXT}}', text);
}

// Helper function to detect content type based on page elements
function detectContentType() {
  const context = getWebsiteContext();
  
  if (context.type === 'development' && context.key === 'github.com') {
    // GitHub-specific detection
    if (window.location.pathname.includes('/pull/')) return 'pr';
    if (window.location.pathname.includes('/issues/')) return 'issue';
    if (window.location.pathname.includes('/commit/')) return 'commit';
    if (document.querySelector('[data-testid="pr-comment-form"]')) return 'comment';
  }
  
  if (context.type === 'professional-social' && context.key === 'linkedin.com') {
    // LinkedIn-specific detection
    if (window.location.pathname.includes('/messaging/')) return 'message';
    if (document.querySelector('[data-testid="share-box"]')) return 'post';
  }
  
  if (context.type === 'qa-forum' && context.key === 'stackoverflow.com') {
    // Stack Overflow-specific detection
    if (window.location.pathname.includes('/questions/ask')) return 'question';
    if (document.querySelector('.answer-form')) return 'answer';
  }
  
  return context.settings?.defaultTone || 'default';
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
