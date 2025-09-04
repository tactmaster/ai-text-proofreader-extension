/**
 * @jest-environment jsdom
 */

// Import test utilities
const { createContextDetectorTest } = require('./test-utils');

// Create testable versions
const { ContextDetector, WEBSITE_CONTEXTS } = createContextDetectorTest();

describe('Context Detection and Formatting Recognition Tests', () => {
  
  let contextDetector;
  
  beforeEach(async () => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock chrome.storage.sync.get to return empty custom settings
    if (global.chrome && global.chrome.storage) {
      global.chrome.storage.sync.get.mockImplementation((keys, callback) => {
        callback({});
      });
    }
    
    contextDetector = new ContextDetector();
    await contextDetector.loadCustomSettings();
  });

  describe('Prompt Generation - Should recognize formatting needs', () => {
    
    test('should include formatting preservation in email prompts', () => {
      // Test Gmail context
      global.mockLocation = { hostname: 'mail.google.com' };
      
      const context = contextDetector.getWebsiteContext();
      const prompt = contextDetector.getContextPrompt(context, 'formal');
      
      expect(prompt).toContain('PRESERVE all original formatting');
      expect(prompt).toContain('newlines');
      expect(prompt).toContain('bullet points');
      expect(prompt).toContain('numbered lists');
      expect(prompt).toContain('paragraph breaks');
    });

    test('should include code formatting preservation in development prompts', () => {
      // Test GitHub context
      global.mockLocation = { hostname: 'github.com' };
      
      const context = contextDetector.getWebsiteContext();
      const prompt = contextDetector.getContextPrompt(context, 'pr');
      
      expect(prompt).toContain('PRESERVE all original formatting');
      expect(prompt).toContain('code blocks');
      expect(prompt).toContain('markdown formatting');
      expect(prompt).toContain('newlines');
      expect(prompt).toContain('bullet points');
      expect(prompt).toContain('numbered lists');
    });

    test('should include general formatting preservation in default prompts', () => {
      // Test unknown website (should use default)
      global.mockLocation = { hostname: 'unknown-site.com' };
      
      const context = contextDetector.getWebsiteContext();
      const prompt = contextDetector.getContextPrompt(context, 'default');
      
      expect(prompt).toContain('PRESERVE all original formatting');
      expect(prompt).toContain('newlines');
      expect(prompt).toContain('bullet points');
      expect(prompt).toContain('numbered lists');
      expect(prompt).toContain('paragraph breaks');
    });
  });

  describe('Context Recognition Tests', () => {
    
    test('should recognize Gmail as email context', () => {
      global.mockLocation = { hostname: 'mail.google.com' };
      
      const context = contextDetector.getWebsiteContext();
      expect(context.type).toBe('email');
      expect(context.name).toBe('Gmail');
    });

    test('should recognize Outlook as email context', () => {
      global.mockLocation = { hostname: 'outlook.live.com' };
      
      const context = contextDetector.getWebsiteContext();
      expect(context.type).toBe('email');
      expect(context.name).toBe('Outlook');
    });

    test('should recognize GitHub as development context', () => {
      global.mockLocation = { hostname: 'github.com' };
      
      const context = contextDetector.getWebsiteContext();
      expect(context.type).toBe('development');
      expect(context.name).toBe('GitHub');
    });

    test('should fallback to general context for unknown sites', () => {
      global.mockLocation = { hostname: 'random-website.com' };
      
      const context = contextDetector.getWebsiteContext();
      expect(context.type).toBe('general');
      expect(context.name).toBe('General');
    });
  });

  describe('Custom Settings Integration', () => {
    
    test('should use custom settings when available', async () => {
      const customSettings = {
        websites: {
          email: ['custom-email.com'],
          development: ['custom-dev.com']
        },
        prompts: {
          email: {
            default: 'Custom email prompt with PRESERVE formatting'
          }
        }
      };
      
      // Mock chrome.storage.sync.get to return custom settings
      chrome.storage.sync.get.mockImplementation((keys, callback) => {
        callback({ contextSettings: customSettings });
      });
      
      // Create new detector with custom settings
      const customDetector = new ContextDetector();
      await customDetector.loadCustomSettings();
      
      // Test custom email site recognition
      global.mockLocation = { hostname: 'custom-email.com' };
      
      const context = customDetector.getWebsiteContext();
      expect(context.type).toBe('email');
    });
  });

  describe('Formatting Detection in Different Contexts', () => {
    
    test('should recognize email formatting needs', () => {
      global.mockLocation = { hostname: 'mail.google.com' };
      
      const testTexts = [
        'Hello,\n\nThis is a test email.\n\nBest regards',
        'To-do list:\n• Item 1\n• Item 2\n• Item 3',
        'Steps:\n1. First step\n2. Second step\n3. Third step'
      ];
      
      testTexts.forEach(text => {
        const context = contextDetector.getWebsiteContext();
        const prompt = contextDetector.getContextPrompt(context, 'default');
        
        // Verify prompt includes formatting preservation
        expect(prompt).toContain('PRESERVE');
        expect(prompt).toContain('newlines');
        expect(prompt).toContain('bullet points');
        expect(prompt).toContain('numbered lists');
      });
    });

    test('should recognize code formatting needs', () => {
      global.mockLocation = { hostname: 'github.com' };
      
      const testTexts = [
        '```javascript\nfunction test() {\n  return true;\n}\n```',
        '# Title\n\n## Subtitle\n\n- List item',
        'Code: `const x = 1;`\n\nMore text here.'
      ];
      
      testTexts.forEach(text => {
        const context = contextDetector.getWebsiteContext();
        const prompt = contextDetector.getContextPrompt(context, 'default');
        
        // Verify prompt includes code formatting preservation
        expect(prompt).toContain('PRESERVE');
        expect(prompt).toContain('code blocks');
        expect(prompt).toContain('markdown formatting');
      });
    });
  });

  describe('Prompt Validation', () => {
    
    test('all prompts should include formatting preservation rules', () => {
      const contexts = ['mail.google.com', 'github.com', 'unknown-site.com'];
      
      contexts.forEach(hostname => {
        global.mockLocation = { hostname };
        
        const context = contextDetector.getWebsiteContext();
        
        // Test all available tones for this context
        if (context.settings && context.settings.toneOptions) {
          context.settings.toneOptions.forEach(tone => {
            const prompt = contextDetector.getContextPrompt(context, tone);
            expect(prompt).toContain('PRESERVE');
            expect(prompt).toContain('formatting');
          });
        } else {
          // Test default tone
          const prompt = contextDetector.getContextPrompt(context, 'default');
          expect(prompt).toContain('PRESERVE');
          expect(prompt).toContain('formatting');
        }
      });
    });

    test('prompts should not accidentally remove formatting instructions', () => {
      global.mockLocation = { hostname: 'mail.google.com' };
      
      const context = contextDetector.getWebsiteContext();
      const prompt = contextDetector.getContextPrompt(context, 'formal');
      
      // Should have clear instructions about what NOT to remove
      expect(prompt).toContain('PRESERVE');
      expect(prompt).not.toContain('remove formatting');
      expect(prompt).not.toContain('strip formatting');
      expect(prompt).not.toContain('clean formatting');
    });
  });
});
