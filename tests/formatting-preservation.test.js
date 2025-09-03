/**
 * @jest-environment jsdom
 */

// Import test utilities
const { createCleanResponseTest } = require('./test-utils');

// Create testable version of cleanResponse
const cleanResponse = createCleanResponseTest();

describe('Formatting Preservation Tests', () => {
  
  describe('Response Cleaning - Should NOT remove formatting', () => {
    
    test('should preserve newlines', () => {
      const inputWithNewlines = `Here is some text with newlines.

This is a second paragraph.

And a third paragraph.`;
      
      const aiResponse = `Here's the corrected text:

${inputWithNewlines}

I hope this helps!`;
      
      const cleaned = cleanResponse(aiResponse);
      
      // Should preserve the newlines between paragraphs
      expect(cleaned).toContain('\n\n');
      expect(cleaned.split('\n').length).toBeGreaterThan(1);
      expect(cleaned).toContain('This is a second paragraph.');
      expect(cleaned).toContain('And a third paragraph.');
    });

    test('should preserve bullet points', () => {
      const inputWithBullets = `Shopping list:
• Apples
• Bananas  
• Oranges
- Milk
- Bread
* Cheese
* Yogurt`;

      const aiResponse = `Here's your corrected shopping list:

${inputWithBullets}

All items look good!`;
      
      const cleaned = cleanResponse(aiResponse);
      
      // Should preserve all bullet point types
      expect(cleaned).toContain('• Apples');
      expect(cleaned).toContain('• Bananas');
      expect(cleaned).toContain('- Milk');
      expect(cleaned).toContain('- Bread');
      expect(cleaned).toContain('* Cheese');
      expect(cleaned).toContain('* Yogurt');
    });

    test('should preserve numbered lists', () => {
      const inputWithNumbers = `Steps to follow:
1. First step
2. Second step
3. Third step
   a. Sub-step A
   b. Sub-step B
4. Final step`;

      const aiResponse = `Here are the corrected steps:

${inputWithNumbers}

These steps look perfect!`;
      
      const cleaned = cleanResponse(aiResponse);
      
      // Should preserve numbered list structure
      expect(cleaned).toContain('1. First step');
      expect(cleaned).toContain('2. Second step');
      expect(cleaned).toContain('3. Third step');
      expect(cleaned).toContain('   a. Sub-step A');
      expect(cleaned).toContain('   b. Sub-step B');
      expect(cleaned).toContain('4. Final step');
    });

    test('should preserve code formatting and indentation', () => {
      const inputWithCode = `Function example:
\`\`\`javascript
function test() {
    if (condition) {
        return true;
    }
    return false;
}
\`\`\``;

      const aiResponse = `Here's the corrected code:

${inputWithCode}

The code looks good!`;
      
      const cleaned = cleanResponse(aiResponse);
      
      // Should preserve code blocks and indentation
      expect(cleaned).toContain('```javascript');
      expect(cleaned).toContain('function test() {');
      expect(cleaned).toContain('    if (condition) {');
      expect(cleaned).toContain('        return true;');
      expect(cleaned).toContain('    }');
      expect(cleaned).toContain('```');
    });

    test('should preserve markdown formatting', () => {
      const inputWithMarkdown = `# Main Title

## Subtitle

**Bold text** and *italic text*

> This is a blockquote
> with multiple lines

[Link text](https://example.com)`;

      const aiResponse = `Here's your corrected markdown:

${inputWithMarkdown}

Formatting looks great!`;
      
      const cleaned = cleanResponse(aiResponse);
      
      // Should preserve markdown elements
      expect(cleaned).toContain('# Main Title');
      expect(cleaned).toContain('## Subtitle');
      expect(cleaned).toContain('**Bold text**');
      expect(cleaned).toContain('*italic text*');
      expect(cleaned).toContain('> This is a blockquote');
      expect(cleaned).toContain('[Link text](https://example.com)');
    });

    test('should preserve mixed formatting types', () => {
      const complexInput = `# Project Status

## Current Tasks:
1. **Bug fixes**
   • Fix login issue
   • Update error messages
   
2. **New features**
   • Add user dashboard
   • Implement notifications

## Code Review:
\`\`\`javascript
// TODO: Review this function
function validateUser(user) {
    return user.isValid;
}
\`\`\`

> **Note:** All changes need approval before deployment.`;

      const aiResponse = `Here's the corrected project status:

${complexInput}

Everything looks organized!`;
      
      const cleaned = cleanResponse(aiResponse);
      
      // Should preserve all formatting types in combination
      expect(cleaned).toContain('# Project Status');
      expect(cleaned).toContain('1. **Bug fixes**');
      expect(cleaned).toContain('   • Fix login issue');
      expect(cleaned).toContain('```javascript');
      expect(cleaned).toContain('> **Note:**');
      expect(cleaned.split('\n').length).toBeGreaterThan(10);
    });
  });

  describe('Response Cleaning - Should remove wrapper text', () => {
    
    test('should remove conversational wrapper text', () => {
      const inputText = "This is the actual content.";
      const aiResponse = `Here's the corrected text:

${inputText}

I hope this helps! Let me know if you need anything else.`;
      
      const cleaned = cleanResponse(aiResponse);
      
      // Should remove wrapper but keep content
      expect(cleaned).toBe(inputText);
      expect(cleaned).not.toContain("Here's the corrected text:");
      expect(cleaned).not.toContain("I hope this helps!");
    });

    test('should remove various wrapper patterns', () => {
      const inputText = "Content to keep.";
      
      const wrappers = [
        `Here is the corrected text:\n\n${inputText}\n\nDone!`,
        `Corrected version:\n${inputText}\nAll fixed.`,
        `OUTPUT:\n${inputText}`,
        `Here you go:\n\n${inputText}\n\nAnything else?`,
        `The fixed text is:\n${inputText}\nHope this helps!`
      ];
      
      wrappers.forEach(wrappedResponse => {
        const cleaned = cleanResponse(wrappedResponse);
        expect(cleaned).toBe(inputText);
      });
    });
  });

  describe('Edge Cases', () => {
    
    test('should handle empty input', () => {
      const cleaned = cleanResponse('');
      expect(cleaned).toBe('');
    });

    test('should handle input with only whitespace', () => {
      const cleaned = cleanResponse('   \n\n   ');
      expect(cleaned).toBe('');
    });

    test('should handle input without wrapper text', () => {
      const directInput = "Direct text without wrapper.";
      const cleaned = cleanResponse(directInput);
      expect(cleaned).toBe(directInput);
    });

    test('should preserve intentional leading/trailing spaces in formatted content', () => {
      const inputWithSpaces = `Code with spaces:
    function test() {
        return "spaced content";  
    }`;
      
      const aiResponse = `Here's the code:

${inputWithSpaces}

Looks good!`;
      
      const cleaned = cleanResponse(aiResponse);
      
      // Should preserve intentional spacing in code
      expect(cleaned).toContain('    function test() {');
      expect(cleaned).toContain('        return "spaced content";  ');
    });
  });
});
