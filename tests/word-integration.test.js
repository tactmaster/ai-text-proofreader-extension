// Word integration functionality tests
// Tests Microsoft Word Online integration features

describe('Word Integration Functionality Tests', () => {
  let mockDocument;
  let mockWindow;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock DOM elements specific to Word integration
    const editSurfaceElement = {
      get textContent() { return this._textContent || 'Document content in edit mode'; },
      set textContent(value) { this._textContent = value; },
      get innerHTML() { return this._innerHTML || '<div>Document content in edit mode</div>'; },
      set innerHTML(value) { this._innerHTML = value; },
      addEventListener: jest.fn(),
      focus: jest.fn(),
      blur: jest.fn()
    };

    mockDocument = {
      querySelector: jest.fn((selector) => {
        const elements = {
          '.office-office-frame': { 
            contentDocument: {
              querySelector: jest.fn(() => ({
                textContent: 'Sample Word document content',
                innerHTML: '<p>Sample Word document content</p>',
                addEventListener: jest.fn(),
                focus: jest.fn(),
                blur: jest.fn()
              }))
            }
          },
          '.WACViewPanel_EditSurface': editSurfaceElement,
          '.WACViewPanel_ReadingSurface': {
            textContent: 'Document content in reading mode',
            addEventListener: jest.fn()
          },
          '[data-automation-id="DocumentCanvas"]': {
            textContent: 'Canvas document content',
            addEventListener: jest.fn(),
            focus: jest.fn()
          },
          '.EmbeddedOfficeFrame': {
            contentDocument: {
              body: {
                textContent: 'Embedded frame content',
                addEventListener: jest.fn()
              }
            }
          }
        };
        return elements[selector] || null;
      }),
      querySelectorAll: jest.fn((selector) => {
        if (selector.includes('p') || selector.includes('div')) {
          return [
            { textContent: 'Paragraph 1', innerHTML: '<p>Paragraph 1</p>' },
            { textContent: 'Paragraph 2', innerHTML: '<p>Paragraph 2</p>' }
          ];
        }
        return [];
      }),
      getElementById: jest.fn(),
      createElement: jest.fn(() => ({
        style: {},
        innerHTML: '',
        appendChild: jest.fn(),
        addEventListener: jest.fn(),
        click: jest.fn()
      })),
      body: {
        appendChild: jest.fn(),
        removeChild: jest.fn()
      },
      addEventListener: jest.fn()
    };

    mockWindow = {
      location: { 
        href: 'https://office.live.com/start/Word.aspx',
        hostname: 'office.live.com'
      },
      frames: [
        {
          document: {
            querySelector: jest.fn(() => ({
              textContent: 'Frame document content'
            }))
          }
        }
      ],
      parent: {
        frames: []
      },
      setTimeout: jest.fn((fn, delay) => setTimeout(fn, delay)),
      clearTimeout: jest.fn()
    };

    global.document = mockDocument;
    global.window = mockWindow;

    // Mock Chrome APIs
    global.chrome = {
      runtime: {
        sendMessage: jest.fn(),
        onMessage: {
          addListener: jest.fn()
        }
      },
      storage: {
        sync: {
          get: jest.fn(),
          set: jest.fn()
        }
      }
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Word Environment Detection', () => {
    test('should detect Microsoft Word Online environment', () => {
      const detectWordEnvironment = () => {
        const url = mockWindow.location.href;
        const hostname = mockWindow.location.hostname;
        
        const wordDomains = [
          'office.live.com',
          'office.com',
          'officehome.msocdn.com',
          'outlook.live.com',
          'onedrive.live.com'
        ];
        
        const wordPaths = [
          '/start/Word.aspx',
          '/wd/',
          '/we/',
          'Word.aspx'
        ];
        
        const isDomain = wordDomains.some(domain => hostname.includes(domain));
        const isPath = wordPaths.some(path => url.includes(path));
        
        return isDomain || isPath;
      };

      expect(detectWordEnvironment()).toBe(true);

      // Test non-Word environment
      mockWindow.location.href = 'https://google.com';
      mockWindow.location.hostname = 'google.com';
      expect(detectWordEnvironment()).toBe(false);
    });

    test('should detect different Word Online interface versions', () => {
      const detectWordInterface = () => {
        // Modern interface
        if (mockDocument.querySelector('.WACViewPanel_EditSurface')) {
          return 'modern';
        }
        
        // Classic interface
        if (mockDocument.querySelector('.office-office-frame')) {
          return 'classic';
        }
        
        // Canvas interface
        if (mockDocument.querySelector('[data-automation-id="DocumentCanvas"]')) {
          return 'canvas';
        }
        
        return 'unknown';
      };

      expect(detectWordInterface()).toBe('modern');
    });

    test('should handle iframe-based Word interfaces', () => {
      const findWordFrame = () => {
        const frames = [
          '.office-office-frame',
          '.EmbeddedOfficeFrame',
          'iframe[src*="office"]'
        ];
        
        for (const frameSelector of frames) {
          const frame = mockDocument.querySelector(frameSelector);
          if (frame && frame.contentDocument) {
            return frame;
          }
        }
        
        return null;
      };

      const frame = findWordFrame();
      expect(frame).toBeTruthy();
      expect(frame.contentDocument).toBeTruthy();
    });
  });

  describe('Content Extraction', () => {
    test('should extract text content from Word document', () => {
      const extractWordContent = () => {
        let content = '';
        
        // Try modern interface first
        const editSurface = mockDocument.querySelector('.WACViewPanel_EditSurface');
        if (editSurface) {
          content = editSurface.textContent;
        }
        
        // Try reading surface
        if (!content) {
          const readingSurface = mockDocument.querySelector('.WACViewPanel_ReadingSurface');
          if (readingSurface) {
            content = readingSurface.textContent;
          }
        }
        
        // Try canvas interface
        if (!content) {
          const canvas = mockDocument.querySelector('[data-automation-id="DocumentCanvas"]');
          if (canvas) {
            content = canvas.textContent;
          }
        }
        
        // Try iframe content
        if (!content) {
          const frame = mockDocument.querySelector('.office-office-frame');
          if (frame && frame.contentDocument) {
            const frameContent = frame.contentDocument.querySelector('body');
            if (frameContent) {
              content = frameContent.textContent;
            }
          }
        }
        
        return content.trim();
      };

      const content = extractWordContent();
      expect(content).toBe('Document content in edit mode');
    });

    test('should extract structured content with paragraphs', () => {
      const extractStructuredContent = () => {
        const paragraphs = [];
        const elements = mockDocument.querySelectorAll('p, div[data-automation-id*="paragraph"]');
        
        elements.forEach(element => {
          if (element.textContent.trim()) {
            paragraphs.push({
              text: element.textContent.trim(),
              html: element.innerHTML
            });
          }
        });
        
        return paragraphs;
      };

      const structured = extractStructuredContent();
      expect(structured).toHaveLength(2);
      expect(structured[0].text).toBe('Paragraph 1');
      expect(structured[1].text).toBe('Paragraph 2');
    });

    test('should handle empty or loading documents', () => {
      // Mock empty document
      mockDocument.querySelector.mockReturnValue(null);
      mockDocument.querySelectorAll.mockReturnValue([]);

      const extractContentSafely = () => {
        try {
          const surfaces = [
            '.WACViewPanel_EditSurface',
            '.WACViewPanel_ReadingSurface',
            '[data-automation-id="DocumentCanvas"]'
          ];
          
          for (const selector of surfaces) {
            const element = mockDocument.querySelector(selector);
            if (element && element.textContent && element.textContent.trim()) {
              return element.textContent.trim();
            }
          }
          
          return '';
        } catch (error) {
          return '';
        }
      };

      const content = extractContentSafely();
      expect(content).toBe('');
    });
  });

  describe('Content Injection', () => {
    test('should inject corrected text into Word document', () => {
      const injectCorrectedText = (correctedText) => {
        let injected = false;
        
        // Try modern interface
        const editSurface = mockDocument.querySelector('.WACViewPanel_EditSurface');
        if (editSurface) {
          editSurface.innerHTML = `<div>${correctedText}</div>`;
          editSurface.textContent = correctedText;
          injected = true;
        }
        
        return injected;
      };

      const result = injectCorrectedText('This is the corrected text.');
      expect(result).toBe(true);
      
      const editSurface = mockDocument.querySelector('.WACViewPanel_EditSurface');
      expect(editSurface.textContent).toBe('This is the corrected text.');
    });

    test('should preserve formatting when injecting text', () => {
      const injectWithFormatting = (html) => {
        const editSurface = mockDocument.querySelector('.WACViewPanel_EditSurface');
        if (editSurface) {
          editSurface.innerHTML = html;
          return true;
        }
        return false;
      };

      const formattedHtml = '<p><strong>Bold text</strong> and <em>italic text</em></p>';
      const result = injectWithFormatting(formattedHtml);
      expect(result).toBe(true);
      
      const editSurface = mockDocument.querySelector('.WACViewPanel_EditSurface');
      expect(editSurface.innerHTML).toBe(formattedHtml);
    });

    test('should handle injection failures gracefully', () => {
      // Mock read-only or protected document
      mockDocument.querySelector.mockReturnValue({
        textContent: 'Protected content',
        readOnly: true
      });

      const safeInject = (text) => {
        try {
          const target = mockDocument.querySelector('.WACViewPanel_EditSurface');
          if (target && !target.readOnly) {
            target.textContent = text;
            return { success: true };
          }
          return { success: false, reason: 'Target not editable' };
        } catch (error) {
          return { success: false, reason: error.message };
        }
      };

      const result = safeInject('New text');
      expect(result.success).toBe(false);
      expect(result.reason).toBe('Target not editable');
    });
  });

  describe('User Interaction Simulation', () => {
    test('should simulate focus and blur events', () => {
      const simulateUserInteraction = () => {
        const editSurface = mockDocument.querySelector('.WACViewPanel_EditSurface');
        if (editSurface) {
          // Simulate focus
          editSurface.focus();
          
          // Simulate content change
          editSurface.textContent = 'Modified content';
          
          // Simulate blur (mock function)
          if (editSurface.blur) {
            editSurface.blur();
          }
          
          return true;
        }
        return false;
      };

      const result = simulateUserInteraction();
      expect(result).toBe(true);
      
      const editSurface = mockDocument.querySelector('.WACViewPanel_EditSurface');
      expect(editSurface.focus).toHaveBeenCalled();
    });

    test('should trigger document save events', () => {
      global.chrome.runtime.sendMessage.mockImplementation((message, callback) => {
        if (message.action === 'triggerSave') {
          callback({ success: true });
        }
      });

      const triggerSave = async () => {
        // Simulate Ctrl+S
        const saveEvent = new KeyboardEvent('keydown', {
          key: 's',
          ctrlKey: true,
          bubbles: true
        });
        
        return new Promise((resolve) => {
          global.chrome.runtime.sendMessage(
            { action: 'triggerSave' },
            resolve
          );
        });
      };

      return triggerSave().then(result => {
        expect(result.success).toBe(true);
      });
    });
  });

  describe('Word Mode State Management', () => {
    test('should manage Word mode enable/disable state', async () => {
      global.chrome.storage.sync.get.mockImplementation((keys, callback) => {
        callback({ wordModeEnabled: false });
      });

      global.chrome.storage.sync.set.mockImplementation((data, callback) => {
        callback();
      });

      const toggleWordMode = async () => {
        const currentState = await new Promise((resolve) => {
          global.chrome.storage.sync.get(['wordModeEnabled'], resolve);
        });
        
        const newState = !currentState.wordModeEnabled;
        
        await new Promise((resolve) => {
          global.chrome.storage.sync.set({ wordModeEnabled: newState }, resolve);
        });
        
        return newState;
      };

      const enabled = await toggleWordMode();
      expect(enabled).toBe(true);
      expect(global.chrome.storage.sync.set).toHaveBeenCalledWith(
        { wordModeEnabled: true }, 
        expect.any(Function)
      );
    });

    test('should persist Word mode settings across sessions', async () => {
      const settings = {
        wordModeEnabled: true,
        autoCorrect: true,
        realTimeChecking: false
      };

      global.chrome.storage.sync.set.mockImplementation((data, callback) => {
        callback();
      });

      global.chrome.storage.sync.get.mockImplementation((keys, callback) => {
        callback(settings);
      });

      // Save settings
      await new Promise((resolve) => {
        global.chrome.storage.sync.set(settings, resolve);
      });

      // Retrieve settings
      const retrieved = await new Promise((resolve) => {
        global.chrome.storage.sync.get(Object.keys(settings), resolve);
      });

      expect(retrieved).toEqual(settings);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle Word document access permissions', () => {
      const checkDocumentAccess = () => {
        try {
          const editSurface = mockDocument.querySelector('.WACViewPanel_EditSurface');
          if (!editSurface) {
            return { accessible: false, reason: 'No edit surface found' };
          }
          
          // Simulate permission check
          if (editSurface.textContent === undefined) {
            return { accessible: false, reason: 'No read access' };
          }
          
          return { accessible: true };
        } catch (error) {
          return { accessible: false, reason: error.message };
        }
      };

      const access = checkDocumentAccess();
      expect(access.accessible).toBe(true);
    });

    test('should handle network connectivity issues', async () => {
      global.chrome.runtime.sendMessage.mockImplementation((message, callback) => {
        // Simulate network error
        setTimeout(() => {
          callback({ success: false, error: 'Network error' });
        }, 100);
      });

      const processWithRetry = async (text, maxRetries = 3) => {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          try {
            const result = await new Promise((resolve) => {
              global.chrome.runtime.sendMessage(
                { action: 'proofread', text },
                resolve
              );
            });
            
            if (result.success) {
              return result;
            }
            
            if (attempt === maxRetries) {
              return result;
            }
            
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          } catch (error) {
            if (attempt === maxRetries) {
              return { success: false, error: error.message };
            }
          }
        }
      };

      const result = await processWithRetry('Test text');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });

    test('should handle Word Online version changes', () => {
      const adaptToWordVersion = () => {
        const selectors = [
          '.WACViewPanel_EditSurface',
          '.office-editor-surface',
          '.WACViewPanel_ReadingSurface',
          '[data-automation-id="DocumentCanvas"]',
          '.EmbeddedOfficeFrame'
        ];
        
        for (const selector of selectors) {
          const element = mockDocument.querySelector(selector);
          if (element) {
            return {
              version: selector.includes('WACViewPanel') ? 'modern' : 'classic',
              selector: selector,
              element: element
            };
          }
        }
        
        return { version: 'unknown', selector: null, element: null };
      };

      const adaptation = adaptToWordVersion();
      expect(adaptation.version).toBe('modern');
      expect(adaptation.selector).toBe('.WACViewPanel_EditSurface');
    });
  });

  describe('Integration with Extension Core', () => {
    test('should communicate with background script for Word operations', async () => {
      global.chrome.runtime.sendMessage.mockImplementation((message, callback) => {
        if (message.action === 'wordModeProofread') {
          callback({
            success: true,
            correctedText: 'Corrected Word document text',
            suggestions: []
          });
        }
      });

      const sendWordContent = async (content) => {
        return new Promise((resolve) => {
          global.chrome.runtime.sendMessage({
            action: 'wordModeProofread',
            text: content,
            context: 'word-online'
          }, resolve);
        });
      };

      const result = await sendWordContent('Original document text');
      expect(result.success).toBe(true);
      expect(result.correctedText).toBe('Corrected Word document text');
    });

    test('should handle Word-specific AI prompts', () => {
      const generateWordPrompt = (text, context) => {
        const basePrompt = `Proofread and correct the following text from a Microsoft Word document:`;
        const contextPrompt = context === 'professional' 
          ? 'Use professional tone and formal language.'
          : 'Maintain the original tone and style.';
        
        return `${basePrompt}\n\n${contextPrompt}\n\nText: ${text}`;
      };

      const prompt = generateWordPrompt('Document text', 'professional');
      expect(prompt).toContain('Microsoft Word document');
      expect(prompt).toContain('professional tone');
    });
  });
});
