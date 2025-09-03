// Content script for AI Text Proofreader
class TextBoxProofreader {
  constructor() {
    this.selectedElement = null;
    this.originalText = '';
    this.proofreadButton = null;
    this.suggestionPanel = null;
    this.init();
  }

  init() {
    this.createProofreadButton();
    this.attachEventListeners();
    console.log('AI Text Proofreader content script loaded');
  }

  createProofreadButton() {
    this.proofreadButton = document.createElement('div');
    this.proofreadButton.id = 'ai-proofread-button';
    this.proofreadButton.innerHTML = '🔍 AI Proofread';
    this.proofreadButton.style.cssText = `
      position: absolute;
      background: #4CAF50;
      color: white;
      border: none;
      border-radius: 4px;
      padding: 8px 12px;
      cursor: pointer;
      font-size: 12px;
      font-family: Arial, sans-serif;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      z-index: 10000;
      display: none;
      user-select: none;
    `;

    this.proofreadButton.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.proofreadSelectedText();
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
    this.proofreadButton.style.display = 'block';
    this.proofreadButton.style.left = (rect.right - 120 + window.scrollX) + 'px';
    this.proofreadButton.style.top = (rect.top - 35 + window.scrollY) + 'px';
  }

  hideProofreadButton() {
    this.proofreadButton.style.display = 'none';
  }

  showContextMenu(e) {
    // Show suggestion panel near cursor
    this.createSuggestionPanel();
    this.suggestionPanel.style.left = (e.pageX + 10) + 'px';
    this.suggestionPanel.style.top = (e.pageY + 10) + 'px';
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

    const quickActions = document.createElement('div');
    quickActions.innerHTML = `
      <div style="margin-bottom: 8px; font-weight: bold;">AI Text Tools</div>
      <button id="ai-full-proofread" style="display: block; width: 100%; margin-bottom: 4px; padding: 6px; border: 1px solid #ddd; border-radius: 3px; background: #f5f5f5; cursor: pointer;">
        🔍 Full Proofread
      </button>
      <button id="ai-get-suggestions" style="display: block; width: 100%; margin-bottom: 4px; padding: 6px; border: 1px solid #ddd; border-radius: 3px; background: #f5f5f5; cursor: pointer;">
        💡 Get Suggestions
      </button>
      <button id="ai-settings" style="display: block; width: 100%; padding: 6px; border: 1px solid #ddd; border-radius: 3px; background: #f5f5f5; cursor: pointer;">
        ⚙️ Settings
      </button>
    `;

    this.suggestionPanel.appendChild(quickActions);

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
      const response = await chrome.runtime.sendMessage({
        action: 'proofread',
        text: text
      });

      if (response.success) {
        this.setElementText(this.selectedElement, response.correctedText);
        this.showSuccessMessage('Text proofread and corrected!');
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
      const response = await chrome.runtime.sendMessage({
        action: 'getSuggestions',
        text: text
      });

      if (response.success) {
        this.displaySuggestions(response.suggestions);
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

  displaySuggestions(suggestions) {
    if (!suggestions || suggestions.length === 0) {
      this.showSuccessMessage('No suggestions found - your text looks good!');
      return;
    }

    this.createSuggestionPanel();
    const panel = this.suggestionPanel;
    panel.innerHTML = `
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
    this.proofreadButton.innerHTML = '⏳ Processing...';
    this.proofreadButton.style.background = '#FF9800';
  }

  hideLoadingState() {
    this.proofreadButton.innerHTML = '🔍 AI Proofread';
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
