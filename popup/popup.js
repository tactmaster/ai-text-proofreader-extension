// Popup script for AI Text Proofreader
class PopupController {
  constructor() {
    this.currentText = '';
    this.suggestions = [];
    this.init();
  }

  init() {
    this.setupTabs();
    this.setupEventListeners();
    this.loadSettings();
    this.loadContextSettings();
    console.log('AI Text Proofreader popup loaded');
  }

  setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        const tabName = button.dataset.tab;
        
        // Remove active class from all tabs
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        // Add active class to clicked tab
        button.classList.add('active');
        document.getElementById(`${tabName}-tab`).classList.add('active');
      });
    });
  }

  setupEventListeners() {
    // Proofread tab
    document.getElementById('proofread-btn').addEventListener('click', () => {
      this.proofreadText();
    });

    document.getElementById('suggestions-btn').addEventListener('click', () => {
      this.getSuggestions();
    });

    document.getElementById('copy-result').addEventListener('click', () => {
      this.copyResult();
    });

    document.getElementById('accept-changes').addEventListener('click', () => {
      this.acceptChanges();
    });

    // Settings tab
    document.getElementById('provider-select').addEventListener('change', () => {
      this.updateProviderSettings();
    });

    document.getElementById('save-settings').addEventListener('click', () => {
      this.saveSettings();
    });

    document.getElementById('reset-settings').addEventListener('click', () => {
      this.resetSettings();
    });

    document.getElementById('test-connection').addEventListener('click', () => {
      this.testConnection();
    });

    document.getElementById('show-debug').addEventListener('click', () => {
      this.toggleDebugInfo();
    });

    document.getElementById('copy-debug').addEventListener('click', () => {
      this.copyDebugInfo();
    });

    // Context tab event listeners
    this.setupContextEventListeners();
  }

  setupContextEventListeners() {
    // Website management
    ['email', 'dev', 'social', 'docs'].forEach(category => {
      document.getElementById(`add-${category}-website`).addEventListener('click', () => {
        this.addWebsite(category);
      });
    });

    // Prompt editing
    document.getElementById('category-select').addEventListener('change', () => {
      this.loadPromptForCategory();
    });

    document.getElementById('tone-select').addEventListener('change', () => {
      this.loadPromptForCategory();
    });

    document.getElementById('save-prompt').addEventListener('click', () => {
      this.savePrompt();
    });

    document.getElementById('reset-prompt').addEventListener('click', () => {
      this.resetPrompt();
    });

    document.getElementById('preview-prompt').addEventListener('click', () => {
      this.previewPrompt();
    });

    // Context settings management
    document.getElementById('save-context-settings').addEventListener('click', () => {
      this.saveContextSettings();
    });

    document.getElementById('reset-context-settings').addEventListener('click', () => {
      this.resetContextSettings();
    });

    document.getElementById('export-settings').addEventListener('click', () => {
      this.exportSettings();
    });

    document.getElementById('import-settings').addEventListener('click', () => {
      this.importSettings();
    });
  }

  async loadSettings() {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'getSettings' });
      const settings = response.settings;

      document.getElementById('provider-select').value = settings.provider;
      document.getElementById('model-input').value = settings.model;
      document.getElementById('api-key-input').value = settings.apiKey;
      document.getElementById('custom-endpoint-input').value = settings.customEndpoint;

      this.updateProviderSettings();
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }

  updateProviderSettings() {
    const provider = document.getElementById('provider-select').value;
    
    // Hide all provider-specific settings
    document.getElementById('openai-settings').classList.add('hidden');
    document.getElementById('custom-settings').classList.add('hidden');

    // Show relevant settings
    if (provider === 'openai') {
      document.getElementById('openai-settings').classList.remove('hidden');
    } else if (provider === 'custom') {
      document.getElementById('custom-settings').classList.remove('hidden');
    }
  }

  async proofreadText() {
    const inputText = document.getElementById('input-text').value.trim();
    if (!inputText) {
      this.showStatus('Please enter some text to proofread', 'error');
      return;
    }

    this.currentText = inputText;
    this.showLoading(true);
    this.hideResults();

    try {
      const response = await chrome.runtime.sendMessage({
        action: 'proofread',
        text: inputText
      });

      if (response.success) {
        document.getElementById('output-text').value = response.correctedText;
        this.showResults();
        this.showStatus('Text proofread successfully!', 'success');
      } else {
        this.showStatus('Proofreading failed: ' + response.error, 'error');
      }
    } catch (error) {
      this.showStatus('Extension error: ' + error.message, 'error');
    }

    this.showLoading(false);
  }

  async getSuggestions() {
    const inputText = document.getElementById('input-text').value.trim();
    if (!inputText) {
      this.showStatus('Please enter some text to analyze', 'error');
      return;
    }

    this.showLoading(true);
    this.hideSuggestions();

    try {
      const response = await chrome.runtime.sendMessage({
        action: 'getSuggestions',
        text: inputText
      });

      if (response.success) {
        this.suggestions = response.suggestions;
        this.displaySuggestions(response.suggestions);
        this.showStatus(`Found ${response.suggestions.length} suggestions`, 'success');
      } else {
        this.showStatus('Failed to get suggestions: ' + response.error, 'error');
      }
    } catch (error) {
      this.showStatus('Extension error: ' + error.message, 'error');
    }

    this.showLoading(false);
  }

  displaySuggestions(suggestions) {
    const container = document.getElementById('suggestions-list');
    
    if (!suggestions || suggestions.length === 0) {
      container.innerHTML = '<p>No suggestions found. Your text looks good!</p>';
      document.getElementById('suggestions-section').classList.remove('hidden');
      return;
    }

    container.innerHTML = '';
    
    suggestions.forEach((suggestion, index) => {
      const suggestionDiv = document.createElement('div');
      suggestionDiv.className = 'suggestion-item';
      suggestionDiv.innerHTML = `
        <div class="suggestion-type">${suggestion.type}</div>
        <div class="suggestion-text">
          <span class="suggestion-original">${suggestion.original}</span> → 
          <span class="suggestion-corrected">${suggestion.corrected}</span>
        </div>
        <div class="suggestion-explanation">${suggestion.explanation}</div>
        <button class="suggestion-apply" onclick="popup.applySuggestion(${index})">Apply</button>
      `;
      container.appendChild(suggestionDiv);
    });

    document.getElementById('suggestions-section').classList.remove('hidden');
  }

  applySuggestion(index) {
    const suggestion = this.suggestions[index];
    const inputTextarea = document.getElementById('input-text');
    const currentText = inputTextarea.value;
    const newText = currentText.replace(suggestion.original, suggestion.corrected);
    inputTextarea.value = newText;
    this.showStatus('Suggestion applied!', 'success');
  }

  async saveSettings() {
    const settings = {
      provider: document.getElementById('provider-select').value,
      model: document.getElementById('model-input').value,
      apiKey: document.getElementById('api-key-input').value,
      customEndpoint: document.getElementById('custom-endpoint-input').value
    };

    try {
      const response = await chrome.runtime.sendMessage({
        action: 'saveSettings',
        settings: settings
      });

      if (response.success) {
        this.showStatus('Settings saved successfully!', 'success');
      } else {
        this.showStatus('Failed to save settings: ' + response.error, 'error');
      }
    } catch (error) {
      this.showStatus('Extension error: ' + error.message, 'error');
    }
  }

  resetSettings() {
    document.getElementById('provider-select').value = 'local';
    document.getElementById('model-input').value = 'llama2';
    document.getElementById('api-key-input').value = '';
    document.getElementById('custom-endpoint-input').value = '';
    this.updateProviderSettings();
    this.showStatus('Settings reset to defaults', 'warning');
  }

  async testConnection() {
    const provider = document.getElementById('provider-select').value;
    this.showStatus('Testing connection...', 'warning');

    try {
      // First test the new testConnection endpoint
      const testResponse = await chrome.runtime.sendMessage({
        action: 'testConnection'
      });

      console.log('[DEBUG] Full test response:', testResponse);

      if (testResponse.success) {
        let message = `✅ ${testResponse.info}`;
        
        if (testResponse.details) {
          const details = testResponse.details;
          if (details.availableModels) {
            message += `\n\nAvailable models: ${details.availableModels.length}`;
            if (details.configuredModel) {
              message += `\nUsing: ${details.configuredModel}`;
            }
            if (details.inferenceTest === 'passed') {
              message += '\nModel test: ✅ Passed';
            } else if (details.inferenceTest === 'failed') {
              message += '\nModel test: ⚠️ Failed';
            } else if (details.inferenceTest === 'timeout') {
              message += '\nModel test: ⏳ Timeout (normal for first request)';
            }
          }
        }
        
        if (testResponse.warning) {
          message += `\n\n⚠️ ${testResponse.warning}`;
        }
        
        this.showStatus(message, 'success');
        
        // If basic test passed, try a real proofreading test
        if (!testResponse.warning) {
          this.showStatus('Running proofreading test...', 'warning');
          
          const proofResponse = await chrome.runtime.sendMessage({
            action: 'proofread',
            text: 'Test connection with a speling mistake.'
          });

          if (proofResponse.success) {
            this.showStatus(`✅ Full test passed!\n\nOriginal: "Test connection with a speling mistake."\nCorrected: "${proofResponse.correctedText}"`, 'success');
          } else {
            this.showStatus(`⚠️ Basic connection OK, but proofreading failed:\n${proofResponse.error}`, 'warning');
          }
        }
        
      } else {
        let errorMessage = `❌ ${testResponse.error}`;
        
        if (testResponse.suggestion) {
          errorMessage += `\n\n💡 ${testResponse.suggestion}`;
        }
        
        if (testResponse.details) {
          if (testResponse.details.availableModels) {
            errorMessage += `\n\nAvailable models: ${testResponse.details.availableModels.join(', ') || 'None'}`;
          }
          if (testResponse.details.configuredModel) {
            errorMessage += `\nConfigured model: ${testResponse.details.configuredModel}`;
          }
          if (testResponse.details.quickTest) {
            errorMessage += `\n\n🔧 ${testResponse.details.quickTest}`;
          }
        }
        
        this.showStatus(errorMessage, 'error');
      }
    } catch (error) {
      console.error('[DEBUG] Test connection error:', error);
      this.showStatus(`Connection test failed: ${error.message}`, 'error');
    }
  }

  copyResult() {
    const outputText = document.getElementById('output-text').value;
    navigator.clipboard.writeText(outputText).then(() => {
      this.showStatus('Result copied to clipboard!', 'success');
    }).catch(err => {
      this.showStatus('Failed to copy: ' + err.message, 'error');
    });
  }

  acceptChanges() {
    const outputText = document.getElementById('output-text').value;
    document.getElementById('input-text').value = outputText;
    this.hideResults();
    this.showStatus('Changes accepted!', 'success');
  }

  showLoading(show) {
    const loading = document.getElementById('loading');
    if (show) {
      loading.classList.remove('hidden');
    } else {
      loading.classList.add('hidden');
    }
  }

  showResults() {
    document.getElementById('result-section').classList.remove('hidden');
  }

  hideResults() {
    document.getElementById('result-section').classList.add('hidden');
  }

  showSuggestions() {
    document.getElementById('suggestions-section').classList.remove('hidden');
  }

  hideSuggestions() {
    document.getElementById('suggestions-section').classList.add('hidden');
  }

  showStatus(message, type = 'success') {
    // Remove existing status
    const existingStatus = document.querySelector('.status');
    if (existingStatus) {
      existingStatus.remove();
    }

    // Create new status
    const status = document.createElement('div');
    status.className = `status ${type}`;
    
    // Handle multi-line messages
    if (message.includes('\n')) {
      const lines = message.split('\n');
      lines.forEach((line, index) => {
        if (index > 0) {
          status.appendChild(document.createElement('br'));
        }
        const textNode = document.createTextNode(line);
        status.appendChild(textNode);
      });
    } else {
      status.textContent = message;
    }

    // Insert after the current active tab content
    const activeTab = document.querySelector('.tab-content.active');
    activeTab.appendChild(status);

    // Auto remove after longer time for detailed messages
    const timeout = message.length > 100 ? 8000 : 3000;
    setTimeout(() => {
      if (status.parentNode) {
        status.remove();
      }
    }, timeout);
  }

  async toggleDebugInfo() {
    const debugContainer = document.getElementById('debug-info');
    const debugOutput = document.getElementById('debug-output');
    
    if (debugContainer.classList.contains('hidden')) {
      // Show debug info
      debugContainer.classList.remove('hidden');
      
      try {
        const debugInfo = await this.gatherDebugInfo();
        debugOutput.value = debugInfo;
      } catch (error) {
        debugOutput.value = 'Error gathering debug info: ' + error.message;
      }
    } else {
      // Hide debug info
      debugContainer.classList.add('hidden');
    }
  }

  async gatherDebugInfo() {
    const timestamp = new Date().toISOString();
    
    try {
      // Get current settings
      const settingsResponse = await chrome.runtime.sendMessage({ action: 'getSettings' });
      const settings = settingsResponse.settings;
      
      // Test connection
      const testResponse = await chrome.runtime.sendMessage({ action: 'testConnection' });
      
      const debugInfo = {
        timestamp: timestamp,
        extension: {
          name: 'AI Text Proofreader',
          version: '1.0.0'
        },
        settings: {
          provider: settings.provider,
          model: settings.model,
          hasApiKey: !!settings.apiKey,
          customEndpoint: settings.customEndpoint || 'Not set'
        },
        environment: {
          userAgent: navigator.userAgent,
          language: navigator.language,
          platform: navigator.platform
        },
        connectionTest: testResponse,
        urls: {
          ollamaDefault: 'http://localhost:11434',
          testUrl: 'http://localhost:11434/api/version'
        },
        troubleshooting: {
          steps: [
            '1. Check if Ollama is running: visit http://localhost:11434',
            '2. Set CORS: $env:OLLAMA_ORIGINS="chrome-extension://*,*"',
            '3. Restart Ollama: ollama serve',
            '4. Check models: ollama list',
            '5. Reload extension in Chrome'
          ]
        }
      };
      
      return JSON.stringify(debugInfo, null, 2);
    } catch (error) {
      return `Error gathering debug info: ${error.message}\n\nBasic info:\nTimestamp: ${timestamp}\nUser Agent: ${navigator.userAgent}`;
    }
  }

  copyDebugInfo() {
    const debugOutput = document.getElementById('debug-output');
    navigator.clipboard.writeText(debugOutput.value).then(() => {
      this.showStatus('Debug info copied to clipboard!', 'success');
    }).catch(err => {
      this.showStatus('Failed to copy: ' + err.message, 'error');
    });
  }

  // Context Management Methods
  async loadContextSettings() {
    try {
      const result = await chrome.storage.sync.get(['contextSettings']);
      this.contextSettings = result.contextSettings || this.getDefaultContextSettings();
      this.renderWebsiteLists();
      this.loadPromptForCategory();
    } catch (error) {
      console.error('Failed to load context settings:', error);
      this.contextSettings = this.getDefaultContextSettings();
    }
  }

  getDefaultContextSettings() {
    return {
      websites: {
        email: ['gmail.com', 'outlook.com', 'outlook.live.com', 'mail.yahoo.com', 'mail.google.com'],
        development: ['github.com', 'gitlab.com', 'bitbucket.org', 'dev.azure.com'],
        social: ['twitter.com', 'x.com', 'linkedin.com', 'facebook.com'],
        documentation: ['notion.so', 'confluence.atlassian.com', 'gitbook.io', 'docs.google.com']
      },
      prompts: {
        email: {
          default: `INSTRUCTION: Fix grammar and spelling in this email. Output ONLY the corrected text. PRESERVE all original formatting including newlines, bullet points, numbered lists, and paragraph breaks.\n\nINPUT TEXT:\n"{{TEXT}}"\n\nOUTPUT (corrected email only):`,
          formal: `INSTRUCTION: Fix grammar and spelling in this professional email. Output ONLY the corrected text. PRESERVE all original formatting including newlines, bullet points, numbered lists, and paragraph breaks.\n\nINPUT TEXT:\n"{{TEXT}}"\n\nOUTPUT (corrected email only):`,
          casual: `INSTRUCTION: Fix grammar and spelling in this casual email. Output ONLY the corrected text. PRESERVE all original formatting including newlines, bullet points, numbered lists, and paragraph breaks.\n\nINPUT TEXT:\n"{{TEXT}}"\n\nOUTPUT (corrected email only):`
        },
        development: {
          default: `INSTRUCTION: Fix grammar and spelling in this technical content. Output ONLY the corrected text. PRESERVE all original formatting including newlines, bullet points, numbered lists, code blocks, and markdown formatting.\n\nINPUT TEXT:\n"{{TEXT}}"\n\nOUTPUT (corrected text only):`,
          commit: `INSTRUCTION: Fix grammar and spelling in this commit message. Output ONLY the corrected text. PRESERVE all original formatting including newlines, bullet points, numbered lists, and line breaks.\n\nINPUT TEXT:\n"{{TEXT}}"\n\nOUTPUT (corrected commit message only):`,
          pr: `INSTRUCTION: Fix grammar and spelling in this pull request description. Output ONLY the corrected text. PRESERVE all original formatting including newlines, bullet points, numbered lists, code blocks, and markdown formatting.\n\nINPUT TEXT:\n"{{TEXT}}"\n\nOUTPUT (corrected PR description only):`
        },
        social: {
          default: `INSTRUCTION: Fix grammar and spelling in this social media post. Output ONLY the corrected text. PRESERVE all original formatting including newlines, bullet points, numbered lists, and paragraph breaks.\n\nINPUT TEXT:\n"{{TEXT}}"\n\nOUTPUT (corrected post only):`,
          formal: `INSTRUCTION: Fix grammar and spelling in this professional social media post. Output ONLY the corrected text. PRESERVE all original formatting including newlines, bullet points, numbered lists, and paragraph breaks.\n\nINPUT TEXT:\n"{{TEXT}}"\n\nOUTPUT (corrected post only):`
        },
        documentation: {
          default: `INSTRUCTION: Fix grammar and spelling in this documentation. Output ONLY the corrected text. PRESERVE all original formatting including newlines, bullet points, numbered lists, code blocks, and markdown formatting.\n\nINPUT TEXT:\n"{{TEXT}}"\n\nOUTPUT (corrected documentation only):`
        },
        general: {
          default: `INSTRUCTION: Correct spelling and grammar errors in the text below. Output ONLY the corrected text. PRESERVE all original formatting including newlines, bullet points, numbered lists, and paragraph breaks. Do NOT include any introductory phrases, explanations, or conversational text.\n\nINPUT TEXT:\n"{{TEXT}}"\n\nOUTPUT (corrected text only):`
        }
      }
    };
  }

  renderWebsiteLists() {
    const categories = ['email', 'dev', 'social', 'docs'];
    const categoryMap = {
      email: 'email',
      dev: 'development', 
      social: 'social',
      docs: 'documentation'
    };

    categories.forEach(category => {
      const container = document.getElementById(`${category}-websites`);
      const websites = this.contextSettings.websites[categoryMap[category]] || [];
      
      container.innerHTML = websites.map(website => `
        <div class="website-item">
          <span class="domain">${website}</span>
          <button class="remove-btn" onclick="popup.removeWebsite('${categoryMap[category]}', '${website}')">✕</button>
        </div>
      `).join('');
    });
  }

  addWebsite(category) {
    const categoryMap = {
      email: 'email',
      dev: 'development',
      social: 'social', 
      docs: 'documentation'
    };
    
    const input = document.getElementById(`new-${category}-website`);
    const website = input.value.trim().toLowerCase();
    
    if (!website) {
      this.showStatus('Please enter a website URL', 'error');
      return;
    }

    // Clean up the website URL
    const cleanWebsite = website.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    const categoryKey = categoryMap[category];
    
    if (!this.contextSettings.websites[categoryKey].includes(cleanWebsite)) {
      this.contextSettings.websites[categoryKey].push(cleanWebsite);
      this.renderWebsiteLists();
      input.value = '';
      this.showStatus(`Added ${cleanWebsite} to ${categoryKey} category`, 'success');
    } else {
      this.showStatus('Website already exists in this category', 'warning');
    }
  }

  removeWebsite(category, website) {
    const websites = this.contextSettings.websites[category];
    const index = websites.indexOf(website);
    if (index > -1) {
      websites.splice(index, 1);
      this.renderWebsiteLists();
      this.showStatus(`Removed ${website} from ${category} category`, 'success');
    }
  }

  loadPromptForCategory() {
    const category = document.getElementById('category-select').value;
    const tone = document.getElementById('tone-select').value;
    
    // Update tone options based on category
    const toneSelect = document.getElementById('tone-select');
    toneSelect.innerHTML = this.getToneOptionsForCategory(category);
    
    // Load the prompt
    const prompts = this.contextSettings.prompts[category] || {};
    const prompt = prompts[tone] || prompts.default || '';
    
    document.getElementById('prompt-text').value = prompt;
  }

  getToneOptionsForCategory(category) {
    const toneOptions = {
      email: [
        { value: 'default', label: 'Default' },
        { value: 'formal', label: 'Formal' },
        { value: 'casual', label: 'Casual' }
      ],
      development: [
        { value: 'default', label: 'Default' },
        { value: 'commit', label: 'Commit Message' },
        { value: 'pr', label: 'Pull Request' },
        { value: 'issue', label: 'Issue/Bug Report' }
      ],
      social: [
        { value: 'default', label: 'Default' },
        { value: 'formal', label: 'Professional' }
      ],
      documentation: [
        { value: 'default', label: 'Default' }
      ],
      general: [
        { value: 'default', label: 'Default' }
      ]
    };

    const options = toneOptions[category] || [{ value: 'default', label: 'Default' }];
    return options.map(opt => `<option value="${opt.value}">${opt.label}</option>`).join('');
  }

  savePrompt() {
    const category = document.getElementById('category-select').value;
    const tone = document.getElementById('tone-select').value;
    const prompt = document.getElementById('prompt-text').value.trim();

    if (!prompt) {
      this.showStatus('Please enter a prompt', 'error');
      return;
    }

    if (!this.contextSettings.prompts[category]) {
      this.contextSettings.prompts[category] = {};
    }

    this.contextSettings.prompts[category][tone] = prompt;
    this.showStatus(`Saved ${category} ${tone} prompt`, 'success');
  }

  resetPrompt() {
    const category = document.getElementById('category-select').value;
    const tone = document.getElementById('tone-select').value;
    
    const defaultSettings = this.getDefaultContextSettings();
    const defaultPrompt = defaultSettings.prompts[category]?.[tone] || 
                         defaultSettings.prompts[category]?.default || 
                         defaultSettings.prompts.general.default;
    
    document.getElementById('prompt-text').value = defaultPrompt;
    this.showStatus(`Reset ${category} ${tone} prompt to default`, 'success');
  }

  previewPrompt() {
    const prompt = document.getElementById('prompt-text').value;
    const sampleText = "This is an example text with a small mistake to demonstarte the proofreading.";
    const preview = prompt.replace('{{TEXT}}', sampleText);
    
    document.getElementById('preview-text').textContent = preview;
    document.getElementById('prompt-preview').classList.remove('hidden');
  }

  async saveContextSettings() {
    try {
      await chrome.storage.sync.set({ contextSettings: this.contextSettings });
      this.showStatus('Context settings saved successfully!', 'success');
    } catch (error) {
      console.error('Failed to save context settings:', error);
      this.showStatus('Failed to save context settings: ' + error.message, 'error');
    }
  }

  async resetContextSettings() {
    if (confirm('Are you sure you want to reset all context settings to defaults? This cannot be undone.')) {
      this.contextSettings = this.getDefaultContextSettings();
      await this.saveContextSettings();
      this.renderWebsiteLists();
      this.loadPromptForCategory();
      this.showStatus('Context settings reset to defaults', 'success');
    }
  }

  exportSettings() {
    const settings = JSON.stringify(this.contextSettings, null, 2);
    const blob = new Blob([settings], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ai-proofreader-context-settings.json';
    a.click();
    
    URL.revokeObjectURL(url);
    this.showStatus('Settings exported successfully!', 'success');
  }

  importSettings() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async (event) => {
      const file = event.target.files[0];
      if (file) {
        try {
          const text = await file.text();
          const importedSettings = JSON.parse(text);
          
          // Validate the imported settings structure
          if (this.validateContextSettings(importedSettings)) {
            this.contextSettings = importedSettings;
            await this.saveContextSettings();
            this.renderWebsiteLists();
            this.loadPromptForCategory();
            this.showStatus('Settings imported successfully!', 'success');
          } else {
            this.showStatus('Invalid settings file format', 'error');
          }
        } catch (error) {
          this.showStatus('Failed to import settings: ' + error.message, 'error');
        }
      }
    };
    
    input.click();
  }

  validateContextSettings(settings) {
    return settings && 
           settings.websites && 
           settings.prompts &&
           typeof settings.websites === 'object' &&
           typeof settings.prompts === 'object';
  }
}

// Initialize popup when DOM is ready
let popup;
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    popup = new PopupController();
  });
} else {
  popup = new PopupController();
}
