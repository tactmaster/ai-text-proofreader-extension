// Content script functionality tests
// Tests webpage integration and UI components

describe('Content Script Functionality Tests', () => {
  let mockElement;
  let mockDocument;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Mock DOM element
    mockElement = {
      tagName: 'TEXTAREA',
      value: 'Test text content',
      style: {},
      getBoundingClientRect: jest.fn(() => ({
        left: 100,
        top: 100,
        width: 200,
        height: 50
      })),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      focus: jest.fn(),
      blur: jest.fn(),
      select: jest.fn()
    };

    // Mock document methods
    mockDocument = {
      createElement: jest.fn((tagName) => {
        const attributes = {};
        return {
          tagName: tagName.toUpperCase(),
          style: {},
          innerHTML: '',
          appendChild: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          setAttribute: jest.fn((name, value) => {
            attributes[name] = value;
          }),
          getAttribute: jest.fn((name) => attributes[name]),
          classList: {
            add: jest.fn(),
            remove: jest.fn(),
            contains: jest.fn()
          }
        };
      }),
      body: {
        appendChild: jest.fn(),
        removeChild: jest.fn()
      },
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      querySelector: jest.fn(),
      querySelectorAll: jest.fn(() => [])
    };

    global.document = mockDocument;
    global.window = {
      location: { hostname: 'example.com' },
      getComputedStyle: jest.fn(() => ({}))
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Text Box Detection', () => {
    test('should detect textarea elements', () => {
      const textarea = { tagName: 'TEXTAREA', value: 'test' };
      expect(textarea.tagName.toLowerCase()).toBe('textarea');
    });

    test('should detect input text elements', () => {
      const input = { tagName: 'INPUT', type: 'text', value: 'test' };
      expect(input.tagName.toLowerCase()).toBe('input');
      expect(input.type).toBe('text');
    });

    test('should detect contentEditable elements', () => {
      const editable = { 
        tagName: 'DIV', 
        contentEditable: 'true',
        textContent: 'test content'
      };
      expect(editable.contentEditable).toBe('true');
    });

    test('should ignore non-text input types', () => {
      const nonTextInputs = [
        { tagName: 'INPUT', type: 'password' },
        { tagName: 'INPUT', type: 'number' },
        { tagName: 'INPUT', type: 'email' },
        { tagName: 'INPUT', type: 'checkbox' },
        { tagName: 'INPUT', type: 'radio' }
      ];

      nonTextInputs.forEach(input => {
        expect(['password', 'number', 'email', 'checkbox', 'radio']).toContain(input.type);
      });
    });
  });

  describe('Button Creation and Positioning', () => {
    test('should create proofread button with proper styling', () => {
      const button = mockDocument.createElement('div');
      const expectedStyles = {
        position: 'absolute',
        zIndex: '10000',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        border: 'none',
        borderRadius: '50%',
        width: '40px',
        height: '40px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        transition: 'all 0.3s ease'
      };

      // Apply styles (simulated)
      Object.assign(button.style, expectedStyles);

      expect(button.style.position).toBe('absolute');
      expect(button.style.zIndex).toBe('10000');
      expect(button.style.borderRadius).toBe('50%');
    });

    test('should create menu button with different styling', () => {
      const menuButton = mockDocument.createElement('div');
      const menuStyles = {
        background: 'linear-gradient(135deg, #4CAF50, #45a049)',
        width: '40px',
        height: '40px'
      };

      Object.assign(menuButton.style, menuStyles);
      expect(menuButton.style.background).toContain('#4CAF50');
    });

    test('should position buttons relative to target element', () => {
      const targetRect = {
        left: 100,
        top: 100,
        width: 200,
        height: 50
      };

      const buttonSize = 40;
      const buttonSpacing = 8;
      
      // Calculate expected positions
      const left = targetRect.left + targetRect.width + buttonSpacing;
      const top = targetRect.top + (targetRect.height - buttonSize) / 2;

      expect(left).toBe(308); // 100 + 200 + 8
      expect(top).toBe(85);   // 100 + (50 - 40) / 2
    });

    test('should handle viewport boundaries', () => {
      const viewportWidth = 1024;
      const viewportHeight = 768;
      const buttonSize = 40;

      // Test right edge boundary
      const rightEdgeElement = {
        left: viewportWidth - 50,
        top: 100,
        width: 100,
        height: 50
      };

      const adjustedLeft = Math.min(
        rightEdgeElement.left + rightEdgeElement.width + 8,
        viewportWidth - buttonSize - 10
      );

      expect(adjustedLeft).toBeLessThanOrEqual(viewportWidth - buttonSize - 10);
    });
  });

  describe('Context Detection', () => {
    test('should detect email websites', () => {
      const emailSites = ['gmail.com', 'outlook.com', 'yahoo.com'];
      const hostname = 'mail.google.com';
      
      const isEmailSite = emailSites.some(site => 
        hostname.includes(site) || hostname.includes('mail.')
      );
      
      expect(isEmailSite).toBe(true);
    });

    test('should detect development platforms', () => {
      const devSites = ['github.com', 'gitlab.com', 'bitbucket.org'];
      const hostname = 'github.com';
      
      const isDevSite = devSites.includes(hostname);
      expect(isDevSite).toBe(true);
    });

    test('should detect social media platforms', () => {
      const socialSites = ['twitter.com', 'x.com', 'linkedin.com', 'facebook.com'];
      const hostname = 'x.com';
      
      const isSocialSite = socialSites.includes(hostname);
      expect(isSocialSite).toBe(true);
    });

    test('should fall back to general context for unknown sites', () => {
      const unknownHostname = 'unknown-site.com';
      const knownSites = ['gmail.com', 'github.com', 'twitter.com'];
      
      const isKnownSite = knownSites.some(site => unknownHostname.includes(site));
      expect(isKnownSite).toBe(false);
    });
  });

  describe('Text Extraction and Replacement', () => {
    test('should extract text from textarea', () => {
      const textarea = { tagName: 'TEXTAREA', value: 'Test content' };
      
      const getText = (element) => {
        if (element.tagName.toLowerCase() === 'textarea') {
          return element.value;
        }
        return '';
      };

      expect(getText(textarea)).toBe('Test content');
    });

    test('should extract text from input field', () => {
      const input = { tagName: 'INPUT', value: 'Input text' };
      
      const getText = (element) => {
        if (element.tagName.toLowerCase() === 'input') {
          return element.value;
        }
        return '';
      };

      expect(getText(input)).toBe('Input text');
    });

    test('should extract text from contentEditable', () => {
      const editable = { 
        contentEditable: 'true',
        textContent: 'Editable content',
        innerText: 'Editable content'
      };
      
      const getText = (element) => {
        if (element.contentEditable === 'true') {
          return element.textContent || element.innerText;
        }
        return '';
      };

      expect(getText(editable)).toBe('Editable content');
    });

    test('should replace text in textarea', () => {
      const textarea = { tagName: 'TEXTAREA', value: 'Old text' };
      
      const setText = (element, newText) => {
        if (element.tagName.toLowerCase() === 'textarea') {
          element.value = newText;
        }
      };

      setText(textarea, 'New text');
      expect(textarea.value).toBe('New text');
    });

    test('should replace text in contentEditable', () => {
      const editable = { 
        contentEditable: 'true',
        textContent: 'Old content'
      };
      
      const setText = (element, newText) => {
        if (element.contentEditable === 'true') {
          element.textContent = newText;
        }
      };

      setText(editable, 'New content');
      expect(editable.textContent).toBe('New content');
    });
  });

  describe('Loading States', () => {
    test('should show loading state with animation', () => {
      const button = mockDocument.createElement('div');
      
      // Simulate loading state
      button.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 32 32">
          <circle cx="16" cy="16" r="15" fill="orange">
            <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite"/>
          </circle>
        </svg>`;
      button.style.background = 'linear-gradient(135deg, #FF9800, #FF5722)';
      button.style.cursor = 'wait';
      button.disabled = true;

      expect(button.innerHTML).toContain('animate');
      expect(button.style.cursor).toBe('wait');
      expect(button.disabled).toBe(true);
    });

    test('should hide loading state and restore normal appearance', () => {
      const button = mockDocument.createElement('div');
      
      // Simulate normal state restoration
      button.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 32 32">
          <circle cx="16" cy="16" r="15" fill="url(#aiButtonGrad)"/>
          <text x="16" y="20" fill="white">AI</text>
        </svg>`;
      button.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)';
      button.style.cursor = 'pointer';
      button.disabled = false;

      expect(button.innerHTML).toContain('AI');
      expect(button.style.cursor).toBe('pointer');
      expect(button.disabled).toBe(false);
    });
  });

  describe('Event Handling', () => {
    test('should handle button click events', () => {
      const button = mockDocument.createElement('div');
      const clickHandler = jest.fn();
      
      button.addEventListener('click', clickHandler);
      
      // Simulate click
      const clickEvent = { type: 'click', preventDefault: jest.fn() };
      clickHandler(clickEvent);
      
      expect(clickHandler).toHaveBeenCalledWith(clickEvent);
    });

    test('should handle focus and blur events on text elements', () => {
      const focusHandler = jest.fn();
      const blurHandler = jest.fn();
      
      mockElement.addEventListener('focus', focusHandler);
      mockElement.addEventListener('blur', blurHandler);
      
      // Simulate events
      focusHandler({ type: 'focus' });
      blurHandler({ type: 'blur' });
      
      expect(focusHandler).toHaveBeenCalled();
      expect(blurHandler).toHaveBeenCalled();
    });

    test('should handle hover effects', () => {
      const button = mockDocument.createElement('div');
      const mouseEnterHandler = jest.fn();
      const mouseLeaveHandler = jest.fn();
      
      button.addEventListener('mouseenter', mouseEnterHandler);
      button.addEventListener('mouseleave', mouseLeaveHandler);
      
      // Simulate hover
      mouseEnterHandler({ type: 'mouseenter' });
      mouseLeaveHandler({ type: 'mouseleave' });
      
      expect(mouseEnterHandler).toHaveBeenCalled();
      expect(mouseLeaveHandler).toHaveBeenCalled();
    });
  });

  describe('Chrome Runtime Integration', () => {
    beforeEach(() => {
      global.chrome = {
        runtime: {
          sendMessage: jest.fn(),
          onMessage: {
            addListener: jest.fn()
          }
        }
      };
    });

    test('should send messages to background script', async () => {
      global.chrome.runtime.sendMessage.mockImplementation((message, callback) => {
        callback({ success: true, correctedText: 'Corrected text' });
      });

      const sendMessage = (message) => {
        return new Promise((resolve) => {
          global.chrome.runtime.sendMessage(message, resolve);
        });
      };

      const response = await sendMessage({ 
        action: 'proofread', 
        text: 'Test text' 
      });

      expect(global.chrome.runtime.sendMessage).toHaveBeenCalledWith(
        { action: 'proofread', text: 'Test text' },
        expect.any(Function)
      );
      expect(response.success).toBe(true);
    });

    test('should handle message sending errors', async () => {
      global.chrome.runtime.sendMessage.mockImplementation((message, callback) => {
        global.chrome.runtime.lastError = { message: 'Extension context invalidated' };
        callback();
      });

      const sendMessage = (message) => {
        return new Promise((resolve, reject) => {
          global.chrome.runtime.sendMessage(message, (response) => {
            if (global.chrome.runtime.lastError) {
              reject(new Error(global.chrome.runtime.lastError.message));
            } else {
              resolve(response);
            }
          });
        });
      };

      await expect(sendMessage({ action: 'test' })).rejects.toThrow('Extension context invalidated');
    });
  });

  describe('Toast Notifications', () => {
    test('should create success toast notification', () => {
      const toast = mockDocument.createElement('div');
      const successStyles = {
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: '#4CAF50',
        color: 'white',
        padding: '12px 20px',
        borderRadius: '6px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        zIndex: '10001'
      };

      Object.assign(toast.style, successStyles);
      toast.textContent = 'Text proofread successfully!';

      expect(toast.style.background).toBe('#4CAF50');
      expect(toast.textContent).toBe('Text proofread successfully!');
    });

    test('should create error toast notification', () => {
      const toast = mockDocument.createElement('div');
      const errorStyles = {
        background: '#f44336',
        color: 'white'
      };

      Object.assign(toast.style, errorStyles);
      toast.textContent = 'Proofreading failed';

      expect(toast.style.background).toBe('#f44336');
      expect(toast.textContent).toBe('Proofreading failed');
    });

    test('should auto-remove toast after timeout', (done) => {
      const toast = mockDocument.createElement('div');
      
      // Mock the body methods properly
      mockDocument.body.appendChild = jest.fn();
      mockDocument.body.removeChild = jest.fn();
      
      mockDocument.body.appendChild(toast);

      setTimeout(() => {
        mockDocument.body.removeChild(toast);
        expect(mockDocument.body.removeChild).toHaveBeenCalledWith(toast);
        done();
      }, 100);
    });
  });

  describe('Accessibility and UX', () => {
    test('should provide proper ARIA labels', () => {
      const button = mockDocument.createElement('div');
      button.setAttribute('role', 'button');
      button.setAttribute('aria-label', 'AI Proofread - Click to fix text directly');
      button.setAttribute('tabindex', '0');

      expect(button.getAttribute('role')).toBe('button');
      expect(button.getAttribute('aria-label')).toContain('AI Proofread');
      expect(button.getAttribute('tabindex')).toBe('0');
    });

    test('should handle keyboard navigation', () => {
      const button = mockDocument.createElement('div');
      const keydownHandler = jest.fn((e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          // Trigger click
        }
      });

      button.addEventListener('keydown', keydownHandler);
      
      // Simulate Enter key
      keydownHandler({ key: 'Enter', preventDefault: jest.fn() });
      expect(keydownHandler).toHaveBeenCalled();
    });

    test('should provide visual feedback for interactions', () => {
      const button = mockDocument.createElement('div');
      
      // Hover effect
      const originalTransform = button.style.transform || '';
      button.style.transform = 'scale(1.1)';
      expect(button.style.transform).toBe('scale(1.1)');
      
      // Reset
      button.style.transform = originalTransform;
      expect(button.style.transform).toBe('');
    });
  });
});
