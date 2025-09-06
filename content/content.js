// Content script for AI Text Proofreader
class TextBoxProofreader {
  constructor() {
    this.selectedElement = null;
    this.originalText = '';
    this.proofreadButton = null;
    this.suggestionPanel = null;
    this.currentContext = null;
    this.selectedTone = null;
    this.init();
  }

  async init() {
    await this.initializeContext();
    this.createProofreadButton();
    this.attachEventListeners();
    console.log('AI Text Proofreader content script loaded');
    console.log('Detected context:', this.currentContext?.name || 'General');
  }

  async initializeContext() {
    this.currentContext = await getWebsiteContext();
    this.selectedTone = this.currentContext.settings?.defaultTone || 'default';
    console.log(`[Context] Initialized for ${this.currentContext.name} (${this.currentContext.type})`);
  }

  createProofreadButton() {
    this.proofreadButton = document.createElement('div');
    this.proofreadButton.id = 'ai-proofread-button';
    
    // Get context hint for tooltip
    const contextHint = this.currentContext?.settings?.contextHint || 'AI Proofread';
    // Using custom AI icon instead of magnifying glass
    this.proofreadButton.innerHTML = `<svg width="16" height="16" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="15" fill="currentColor"/>
      <text x="16" y="20" font-family="Arial, sans-serif" font-size="12" font-weight="bold" text-anchor="middle" fill="white">AI</text>
      <circle cx="8" cy="8" r="1.5" fill="white" opacity="0.8"/>
      <circle cx="24" cy="8" r="1.5" fill="white" opacity="0.8"/>
      <circle cx="8" cy="24" r="1.5" fill="white" opacity="0.8"/>
      <circle cx="24" cy="24" r="1.5" fill="white" opacity="0.8"/>
    </svg>`;
    this.proofreadButton.title = contextHint; // Tooltip
    
    this.proofreadButton.style.cssText = `
      position: absolute;
      background: #4CAF50;
      color: white;
      border: 2px solid white;
      border-radius: 50%;
      padding: 6px;
      cursor: pointer;
      font-size: 14px;
      font-family: Arial, sans-serif;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 10000;
      display: none;
      user-select: none;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      backdrop-filter: blur(4px);
    `;

    // Add hover effect
    this.proofreadButton.addEventListener('mouseenter', () => {
      this.proofreadButton.style.transform = 'scale(1.1)';
      this.proofreadButton.style.background = '#45a049';
      this.proofreadButton.style.boxShadow = '0 6px 16px rgba(0,0,0,0.4)';
    });

    this.proofreadButton.addEventListener('mouseleave', () => {
      this.proofreadButton.style.transform = 'scale(1)';
      this.proofreadButton.style.background = '#4CAF50';
      this.proofreadButton.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
    });

    this.proofreadButton.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.showContextMenu(e);
    });

    document.body.appendChild(this.proofreadButton);
  }

  attachEventListeners() {
    // Show button when focusing on text inputs
    document.addEventListener('focusin', (e) => {
      const target = e.target;
      if (this.isTextInput(target)) {
        if (this.isSensitiveField(target)) {
          console.log('[AI Proofreader] Skipping sensitive field:', target.type, target.name || target.id || 'unnamed');
          return;
        }
        this.selectedElement = target;
        this.showProofreadButton(target);
      }
    });

    // Hide button when clicking elsewhere
    document.addEventListener('focusout', (e) => {
      setTimeout(() => {
        if (!this.isTextInput(document.activeElement) || this.isSensitiveField(document.activeElement)) {
          this.hideProofreadButton();
        }
      }, 100);
    });

    // Listen for right-click context menu
    document.addEventListener('contextmenu', (e) => {
      const target = e.target;
      if (this.isTextInput(target) && !this.isSensitiveField(target) && target.value) {
        this.selectedElement = target;
        this.showContextMenu(e);
      }
    });

    // Hide context menu when clicking elsewhere
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#ai-suggestion-panel')) {
        this.hideSuggestionPanel();
      }
    });
  }

  isTextInput(element) {
    const tagName = element.tagName.toLowerCase();
    const inputTypes = ['text', 'email', 'search', 'tel', 'url']; // Password explicitly excluded
    
    // Check if it's a basic text input type
    return (
      tagName === 'textarea' ||
      (tagName === 'input' && inputTypes.includes(element.type)) ||
      element.contentEditable === 'true'
    );
  }

  isSensitiveField(element) {
    // Check for password fields explicitly
    if (element.type === 'password') {
      return true;
    }
    
    // Comprehensive patterns for sensitive fields
    const sensitivePatterns = [
      /password/i,
      /passwd/i,
      /pwd/i,
      /user/i,
      /username/i,
      /login/i,
      /signin/i,
      /signup/i,
      /auth/i,
      /credential/i,
      /security/i,
      /token/i,
      /pin/i,
      /ssn/i,
      /social/i,
      /card/i,
      /cvv/i,
      /ccv/i
    ];
    
    // Check element attributes for sensitive field indicators
    const checkAttributes = ['name', 'id', 'placeholder', 'autocomplete', 'class', 'data-testid'];
    for (const attr of checkAttributes) {
      const value = element.getAttribute(attr);
      if (value && sensitivePatterns.some(pattern => pattern.test(value))) {
        return true;
      }
    }
    
    // Check parent form context for login/signup forms
    const form = element.closest('form');
    if (form) {
      const formAttributes = ['action', 'id', 'class', 'name'];
      for (const attr of formAttributes) {
        const value = form.getAttribute(attr);
        if (value && (value.includes('login') || value.includes('signin') || value.includes('auth'))) {
          return true;
        }
      }
    }
    
    return false;
  }

  showProofreadButton(element) {
    const rect = element.getBoundingClientRect();
    const buttonSize = 32; // Button width/height
    const offset = 8; // Spacing from element
    
    this.proofreadButton.style.display = 'flex';
    
    // Calculate horizontal position - prefer right side of element
    let left = rect.right + offset + window.scrollX;
    
    // If button would go off right edge of screen, position on left side
    if (left + buttonSize > window.innerWidth + window.scrollX) {
      left = rect.left - buttonSize - offset + window.scrollX;
    }
    
    // If still off screen (element too wide), position inside element on right
    if (left < window.scrollX) {
      left = rect.right - buttonSize - offset + window.scrollX;
    }
    
    // Calculate vertical position - prefer above element
    let top = rect.top - buttonSize - offset + window.scrollY;
    
    // If button would go above viewport, position below element
    if (top < window.scrollY) {
      top = rect.bottom + offset + window.scrollY;
    }
    
    // If still off screen (viewport too small), position inside element at top
    if (top + buttonSize > window.innerHeight + window.scrollY) {
      top = rect.top + offset + window.scrollY;
    }
    
    this.proofreadButton.style.left = left + 'px';
    this.proofreadButton.style.top = top + 'px';
  }

  hideProofreadButton() {
    this.proofreadButton.style.display = 'none';
  }

  showContextMenu(e) {
    // Show suggestion panel near cursor with smart positioning
    this.createSuggestionPanel();
    
    // Estimate panel size (it gets created but size isn't known until rendered)
    const estimatedWidth = 280;
    const estimatedHeight = 200;
    const offset = 10;
    
    let left = e.pageX + offset;
    let top = e.pageY + offset;
    
    // Adjust horizontal position if panel would go off right edge
    if (left + estimatedWidth > window.innerWidth + window.scrollX) {
      left = e.pageX - estimatedWidth - offset;
    }
    
    // Adjust vertical position if panel would go off bottom edge
    if (top + estimatedHeight > window.innerHeight + window.scrollY) {
      top = e.pageY - estimatedHeight - offset;
    }
    
    // Ensure panel doesn't go off left or top edges
    if (left < window.scrollX) {
      left = window.scrollX + offset;
    }
    if (top < window.scrollY) {
      top = window.scrollY + offset;
    }
    
    this.suggestionPanel.style.left = left + 'px';
    this.suggestionPanel.style.top = top + 'px';
    this.suggestionPanel.style.display = 'block';
  }

  createSuggestionPanel() {
    if (this.suggestionPanel) {
      this.suggestionPanel.remove();
    }

    this.suggestionPanel = document.createElement('div');
    this.suggestionPanel.id = 'ai-suggestion-panel';
    this.suggestionPanel.style.cssText = `
      position: absolute;
      background: white;
      border: 1px solid #ccc;
      border-radius: 6px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      padding: 12px;
      font-family: Arial, sans-serif;
      font-size: 14px;
      max-width: 300px;
      z-index: 10001;
      display: none;
    `;

    const content = document.createElement('div');
    
    // Context info
    const contextInfo = document.createElement('div');
    contextInfo.innerHTML = `
      <div style="margin-bottom: 8px; font-weight: bold; color: #666;">
        📍 ${this.currentContext.name} Context
      </div>
    `;
    content.appendChild(contextInfo);

    // Tone options (if available)
    if (this.currentContext.settings?.showToneOptions) {
      const toneSelector = document.createElement('div');
      toneSelector.style.marginBottom = '8px';
      
      const toneLabel = document.createElement('div');
      toneLabel.textContent = 'Content Type:';
      toneLabel.style.fontSize = '12px';
      toneLabel.style.fontWeight = 'bold';
      toneLabel.style.marginBottom = '4px';
      toneSelector.appendChild(toneLabel);
      
      const toneOptions = this.currentContext.settings.toneOptions || 
                         Object.keys(this.currentContext.prompts);
      
      const toneSelect = document.createElement('select');
      toneSelect.style.cssText = 'width: 100%; padding: 4px; border: 1px solid #ddd; border-radius: 3px; margin-bottom: 8px;';
      
      toneOptions.forEach(tone => {
        const option = document.createElement('option');
        option.value = tone;
        option.textContent = this.formatToneLabel(tone);
        if (tone === this.selectedTone) option.selected = true;
        toneSelect.appendChild(option);
      });
      
      toneSelect.addEventListener('change', (e) => {
        this.selectedTone = e.target.value;
        console.log(`[Context] Tone changed to: ${this.selectedTone}`);
      });
      
      toneSelector.appendChild(toneSelect);
      content.appendChild(toneSelector);
    }

    // Action buttons
    const quickActions = document.createElement('div');
    quickActions.innerHTML = `
      <button id="ai-full-proofread" title="Proofread & Apply" style="display: inline-block; margin-right: 4px; margin-bottom: 4px; padding: 8px; border: 1px solid #ddd; border-radius: 50%; background: #4CAF50; color: white; cursor: pointer; font-size: 16px; width: 36px; height: 36px;">
        <svg width="16" height="16" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="16" r="15" fill="currentColor"/>
          <text x="16" y="20" font-family="Arial, sans-serif" font-size="12" font-weight="bold" text-anchor="middle" fill="white">AI</text>
          <circle cx="8" cy="8" r="1.5" fill="white" opacity="0.8"/>
          <circle cx="24" cy="8" r="1.5" fill="white" opacity="0.8"/>
          <circle cx="8" cy="24" r="1.5" fill="white" opacity="0.8"/>
          <circle cx="24" cy="24" r="1.5" fill="white" opacity="0.8"/>
        </svg>
      </button>
      <button id="ai-get-suggestions" title="Get Suggestions Only" style="display: inline-block; margin-right: 4px; margin-bottom: 4px; padding: 8px; border: 1px solid #ddd; border-radius: 50%; background: #2196F3; color: white; cursor: pointer; font-size: 16px; width: 36px; height: 36px;">
        💡
      </button>
      <button id="ai-settings" title="Extension Settings" style="display: inline-block; margin-bottom: 4px; padding: 8px; border: 1px solid #ddd; border-radius: 50%; background: #f5f5f5; cursor: pointer; font-size: 16px; width: 36px; height: 36px;">
        ⚙️
      </button>
    `;

    content.appendChild(quickActions);
    this.suggestionPanel.appendChild(content);

    // Add event listeners
    quickActions.querySelector('#ai-full-proofread').addEventListener('click', () => {
      this.proofreadSelectedText();
      this.hideSuggestionPanel();
    });

    quickActions.querySelector('#ai-get-suggestions').addEventListener('click', () => {
      this.getSuggestions();
      this.hideSuggestionPanel();
    });

    quickActions.querySelector('#ai-settings').addEventListener('click', () => {
      this.openSettings();
      this.hideSuggestionPanel();
    });

    document.body.appendChild(this.suggestionPanel);
  }

  formatToneLabel(tone) {
    const labels = {
      'default': 'General',
      'formal': 'Formal/Professional',
      'casual': 'Casual/Friendly',
      'commit': 'Commit Message',
      'pr': 'Pull Request',
      'issue': 'Issue/Bug Report',
      'comment': 'Code Review',
      'post': 'Social Post',
      'message': 'Direct Message',
      'question': 'Question',
      'answer': 'Answer/Solution'
    };
    return labels[tone] || tone.charAt(0).toUpperCase() + tone.slice(1);
  }

  hideSuggestionPanel() {
    if (this.suggestionPanel) {
      this.suggestionPanel.style.display = 'none';
    }
  }

  async proofreadSelectedText() {
    if (!this.selectedElement) return;

    const text = this.getElementText(this.selectedElement);
    if (!text.trim()) {
      alert('No text to proofread');
      return;
    }

    this.originalText = text;
    this.showLoadingState();

    try {
      // Auto-detect content type if not manually selected
      if (!this.selectedTone || this.selectedTone === 'default') {
        this.selectedTone = detectContentType();
      }

      // Generate context-aware prompt
      const contextPrompt = await getContextPrompt(text, this.selectedTone);
      
      console.log(`[Context] Using ${this.currentContext.name} context with ${this.selectedTone} tone`);

      const response = await chrome.runtime.sendMessage({
        action: 'proofreadWithContext',
        text: text,
        context: {
          website: this.currentContext.key,
          type: this.currentContext.type,
          tone: this.selectedTone,
          prompt: contextPrompt
        }
      });

      if (response.success) {
        this.setElementText(this.selectedElement, response.correctedText);
        this.showSuccessMessage(`Text proofread for ${this.currentContext.name} (${this.formatToneLabel(this.selectedTone)})!`);
      } else {
        this.showErrorMessage('Proofreading failed: ' + response.error);
      }
    } catch (error) {
      this.showErrorMessage('Extension error: ' + error.message);
    }

    this.hideLoadingState();
  }

  async getSuggestions() {
    if (!this.selectedElement) return;

    const text = this.getElementText(this.selectedElement);
    if (!text.trim()) {
      alert('No text to analyze');
      return;
    }

    this.showLoadingState();

    try {
      // Auto-detect content type if not manually selected
      if (!this.selectedTone || this.selectedTone === 'default') {
        this.selectedTone = detectContentType();
      }

      // Generate context-aware prompt for suggestions
      const contextPrompt = await getContextPrompt(text, this.selectedTone);

      const response = await chrome.runtime.sendMessage({
        action: 'getSuggestionsWithContext',
        text: text,
        context: {
          website: this.currentContext.key,
          type: this.currentContext.type,
          tone: this.selectedTone,
          prompt: contextPrompt
        }
      });

      if (response.success) {
        this.displaySuggestions(response.suggestions, {
          context: this.currentContext.name,
          tone: this.formatToneLabel(this.selectedTone)
        });
      } else {
        this.showErrorMessage('Failed to get suggestions: ' + response.error);
      }
    } catch (error) {
      this.showErrorMessage('Extension error: ' + error.message);
    }

    this.hideLoadingState();
  }

  getElementText(element) {
    if (element.tagName.toLowerCase() === 'textarea' || element.tagName.toLowerCase() === 'input') {
      return element.value;
    } else if (element.contentEditable === 'true') {
      return element.textContent || element.innerText;
    }
    return '';
  }

  setElementText(element, text) {
    if (element.tagName.toLowerCase() === 'textarea' || element.tagName.toLowerCase() === 'input') {
      element.value = text;
      element.dispatchEvent(new Event('input', { bubbles: true }));
    } else if (element.contentEditable === 'true') {
      element.textContent = text;
      element.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  displaySuggestions(suggestions, contextInfo = null) {
    if (!suggestions || suggestions.length === 0) {
      this.showSuccessMessage('No suggestions found - your text looks good!');
      return;
    }

    this.createSuggestionPanel();
    const panel = this.suggestionPanel;
    
    const contextHeader = contextInfo ? 
      `<div style="margin-bottom: 4px; font-size: 12px; color: #666;">
        📍 ${contextInfo.context} • ${contextInfo.tone}
      </div>` : '';
    
    panel.innerHTML = `
      ${contextHeader}
      <div style="margin-bottom: 8px; font-weight: bold;">Suggestions (${suggestions.length})</div>
      <div id="suggestions-list"></div>
      <button id="apply-all-suggestions" style="margin-top: 8px; padding: 6px 12px; background: #4CAF50; color: white; border: none; border-radius: 3px; cursor: pointer;">
        Apply All
      </button>
    `;

    const suggestionsList = panel.querySelector('#suggestions-list');
    suggestions.forEach((suggestion, index) => {
      const suggestionDiv = document.createElement('div');
      suggestionDiv.style.cssText = 'margin-bottom: 6px; padding: 6px; border: 1px solid #eee; border-radius: 3px; background: #f9f9f9;';
      suggestionDiv.innerHTML = `
        <div style="font-size: 12px; color: #666;">${suggestion.type}</div>
        <div><span style="text-decoration: line-through; color: #d32f2f;">${suggestion.original}</span> → <span style="color: #4CAF50;">${suggestion.corrected}</span></div>
        <div style="font-size: 11px; color: #666; margin-top: 2px;">${suggestion.explanation}</div>
        <button onclick="this.closest('#ai-suggestion-panel').dispatchEvent(new CustomEvent('applySuggestion', {detail: ${index}}))" 
                style="margin-top: 4px; padding: 2px 6px; font-size: 11px; background: #2196F3; color: white; border: none; border-radius: 2px; cursor: pointer;">
          Apply
        </button>
      `;
      suggestionsList.appendChild(suggestionDiv);
    });

    // Event listeners for suggestions
    panel.addEventListener('applySuggestion', (e) => {
      const suggestion = suggestions[e.detail];
      this.applySingleSuggestion(suggestion);
    });

    panel.querySelector('#apply-all-suggestions').addEventListener('click', () => {
      this.applyAllSuggestions(suggestions);
    });

    panel.style.display = 'block';
    panel.style.left = '50px';
    panel.style.top = '50px';
  }

  applySingleSuggestion(suggestion) {
    if (!this.selectedElement) return;

    const currentText = this.getElementText(this.selectedElement);
    const newText = currentText.replace(suggestion.original, suggestion.corrected);
    this.setElementText(this.selectedElement, newText);
    this.showSuccessMessage('Suggestion applied!');
  }

  applyAllSuggestions(suggestions) {
    if (!this.selectedElement) return;

    let currentText = this.getElementText(this.selectedElement);
    suggestions.forEach(suggestion => {
      currentText = currentText.replace(suggestion.original, suggestion.corrected);
    });
    this.setElementText(this.selectedElement, currentText);
    this.showSuccessMessage('All suggestions applied!');
    this.hideSuggestionPanel();
  }

  showLoadingState() {
    this.proofreadButton.innerHTML = '⏳';
    this.proofreadButton.title = 'Processing...';
    this.proofreadButton.style.background = '#FF9800';
  }

  hideLoadingState() {
    this.proofreadButton.innerHTML = `<svg width="16" height="16" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="15" fill="currentColor"/>
      <text x="16" y="20" font-family="Arial, sans-serif" font-size="12" font-weight="bold" text-anchor="middle" fill="white">AI</text>
      <circle cx="8" cy="8" r="1.5" fill="white" opacity="0.8"/>
      <circle cx="24" cy="8" r="1.5" fill="white" opacity="0.8"/>
      <circle cx="8" cy="24" r="1.5" fill="white" opacity="0.8"/>
      <circle cx="24" cy="24" r="1.5" fill="white" opacity="0.8"/>
    </svg>`;
    this.proofreadButton.title = this.currentContext?.settings?.contextHint || 'AI Proofread';
    this.proofreadButton.style.background = '#4CAF50';
  }

  showSuccessMessage(message) {
    this.showToast(message, '#4CAF50');
  }

  showErrorMessage(message) {
    this.showToast(message, '#f44336');
  }

  showToast(message, color) {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${color};
      color: white;
      padding: 12px 16px;
      border-radius: 4px;
      font-family: Arial, sans-serif;
      font-size: 14px;
      z-index: 10002;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    `;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  openSettings() {
    // Open extension popup by clicking on the extension icon
    // This is handled by Chrome automatically when user clicks the icon
    console.log('Settings panel - click extension icon in toolbar');
  }
}

// Initialize the proofreader when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new TextBoxProofreader();
  });
} else {
  new TextBoxProofreader();
}
