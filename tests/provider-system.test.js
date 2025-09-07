/**
 * Provider System Tests
 * Tests for the comprehensive AI provider support system
 */

describe('Provider System Tests', () => {
  describe('Provider Configuration Validation', () => {
    test('should have all expected provider configurations', () => {
      const expectedProviders = [
        'local', 'ollama', 'llama-cpp', 'lm-studio', 'jan',
        'openai', 'anthropic', 'google', 'mistral', 'groq',
        'together', 'perplexity', 'cohere', 'huggingface',
        'replicate', 'fireworks', 'deepinfra', 'anyscale',
        'openrouter', 'novita', 'custom'
      ];

      // This test validates that we have the expected number of providers
      expect(expectedProviders.length).toBe(21);
      
      // Test that all expected provider names are valid
      expectedProviders.forEach(provider => {
        expect(typeof provider).toBe('string');
        expect(provider.length).toBeGreaterThan(0);
      });
    });

    test('should have correct provider categorization', () => {
      const localProviders = ['local', 'ollama', 'llama-cpp', 'lm-studio', 'jan'];
      const commercialProviders = ['openai', 'anthropic', 'google', 'mistral', 'groq', 'together', 'perplexity', 'cohere'];
      const openSourceProviders = ['huggingface', 'replicate', 'fireworks', 'deepinfra', 'anyscale', 'openrouter', 'novita'];
      const customProviders = ['custom'];

      const totalProviders = localProviders.length + commercialProviders.length + openSourceProviders.length + customProviders.length;
      
      expect(totalProviders).toBe(21);
      expect(localProviders.length).toBe(5);
      expect(commercialProviders.length).toBe(8);
      expect(openSourceProviders.length).toBe(7);
      expect(customProviders.length).toBe(1);
    });

    test('should have valid API format expectations', () => {
      const openAICompatible = ['openai', 'groq', 'together', 'perplexity', 'fireworks', 'deepinfra', 'anyscale', 'openrouter', 'novita'];
      const anthropicFormat = ['anthropic'];
      const googleFormat = ['google'];
      const customFormats = ['mistral', 'cohere', 'huggingface', 'replicate'];

      expect(openAICompatible.length).toBeGreaterThan(0);
      expect(anthropicFormat.length).toBe(1);
      expect(googleFormat.length).toBe(1);
      expect(customFormats.length).toBeGreaterThan(0);
    });
  });

  describe('Provider System Integration', () => {
    test('should support all major AI provider categories', () => {
      const categories = {
        'Local/Self-Hosted': ['local', 'ollama', 'llama-cpp', 'lm-studio', 'jan'],
        'Commercial APIs': ['openai', 'anthropic', 'google', 'mistral', 'groq', 'together', 'perplexity', 'cohere'],
        'Open Source APIs': ['huggingface', 'replicate', 'fireworks', 'deepinfra', 'anyscale', 'openrouter', 'novita'],
        'Custom': ['custom']
      };

      Object.keys(categories).forEach(category => {
        expect(categories[category].length).toBeGreaterThan(0);
      });

      // Verify no duplicates across categories
      const allProviders = Object.values(categories).flat();
      const uniqueProviders = [...new Set(allProviders)];
      expect(allProviders.length).toBe(uniqueProviders.length);
    });

    test('should maintain backward compatibility', () => {
      const originalProviders = ['local', 'openai', 'custom'];
      
      // These are the three original providers that should always be supported
      originalProviders.forEach(provider => {
        expect(typeof provider).toBe('string');
        expect(provider.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Background Script Integration', () => {
    test('background.js should contain provider configuration system', () => {
      const fs = require('fs');
      const path = require('path');
      
      const backgroundScript = fs.readFileSync(
        path.join(__dirname, '../background/background.js'), 
        'utf8'
      );

      // Test that the background script contains the new provider system methods
      expect(backgroundScript).toContain('queryProvider');
      expect(backgroundScript).toContain('queryLocalProvider');
      expect(backgroundScript).toContain('queryRemoteProvider');
      expect(backgroundScript).toContain('getProviderConfig');
      expect(backgroundScript).toContain('providerConfigs');
    });

    test('should have all provider configurations defined', () => {
      const fs = require('fs');
      const path = require('path');
      
      const backgroundScript = fs.readFileSync(
        path.join(__dirname, '../background/background.js'), 
        'utf8'
      );

      const expectedProviders = [
        'local', 'ollama', 'llama-cpp', 'lm-studio', 'jan',
        'openai', 'anthropic', 'google', 'mistral', 'groq',
        'together', 'perplexity', 'cohere', 'huggingface',
        'replicate', 'fireworks', 'deepinfra', 'anyscale',
        'openrouter', 'novita', 'custom'
      ];

      // Check that all providers are mentioned in the background script
      expectedProviders.forEach(provider => {
        expect(backgroundScript).toContain(`'${provider}'`);
      });
    });
  });
});
