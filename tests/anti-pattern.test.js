/**
 * @jest-environment jsdom
 */

// Specific tests for formatting issues that should NOT happen
describe('Anti-Pattern Tests - What Should NOT Happen', () => {
  
  // Mock the cleanResponse function from background.js
  const mockCleanResponse = (response) => {
    // This simulates what our cleanResponse function should do
    // Remove wrapper text but preserve formatting
    let cleaned = response;
    
    // Remove common wrapper patterns but preserve the core content
    const wrapperPatterns = [
      /^.*(?:Here's|Here is|Corrected|Fixed|Output).*?:\s*/i,
      /\s*(?:Hope this helps|Let me know|Anything else|Done|All fixed).*$/i
    ];
    
    wrapperPatterns.forEach(pattern => {
      cleaned = cleaned.replace(pattern, '');
    });
    
    return cleaned.trim();
  };

  describe('Should NOT remove formatting', () => {
    
    test('should NOT remove newlines from text', () => {
      const originalText = `First paragraph.

Second paragraph.

Third paragraph.`;
      
      const aiResponse = `Here's the corrected text:

${originalText}

Hope this helps!`;
      
      const result = mockCleanResponse(aiResponse);
      
      // FAILURE CASE: If this fails, it means formatting is being removed
      expect(result).toContain('\n\n');
      expect(result.split('\n').length).toBeGreaterThanOrEqual(5); // Should have multiple lines
      
      // These should NOT happen:
      expect(result).not.toBe('First paragraph. Second paragraph. Third paragraph.');
      expect(result).not.toBe(originalText.replace(/\n/g, ' '));
    });

    test('should NOT remove bullet points', () => {
      const originalText = `Shopping list:
• Apples
• Bananas
- Milk
- Bread
* Cheese`;
      
      const aiResponse = `Corrected list:

${originalText}

All good!`;
      
      const result = mockCleanResponse(aiResponse);
      
      // FAILURE CASE: If these fail, bullet points are being stripped
      expect(result).toContain('• Apples');
      expect(result).toContain('• Bananas');
      expect(result).toContain('- Milk');
      expect(result).toContain('- Bread');
      expect(result).toContain('* Cheese');
      
      // These should NOT happen:
      expect(result).not.toBe('Shopping list: Apples Bananas Milk Bread Cheese');
      expect(result).not.toContain('Apples Bananas'); // Should not be merged
    });

    test('should NOT remove numbered lists', () => {
      const originalText = `Steps:
1. First step
2. Second step
3. Third step`;
      
      const aiResponse = `Here are the steps:

${originalText}

Follow these carefully.`;
      
      const result = mockCleanResponse(aiResponse);
      
      // FAILURE CASE: If these fail, numbered lists are being stripped
      expect(result).toContain('1. First step');
      expect(result).toContain('2. Second step');
      expect(result).toContain('3. Third step');
      
      // These should NOT happen:
      expect(result).not.toBe('Steps: First step Second step Third step');
      expect(result).not.toContain('First step Second step'); // Should not be merged
    });

    test('should NOT remove code block formatting', () => {
      const originalText = `Code example:
\`\`\`javascript
function test() {
    return true;
}
\`\`\``;
      
      const aiResponse = `Here's the code:

${originalText}

Looks good!`;
      
      const result = mockCleanResponse(aiResponse);
      
      // FAILURE CASE: If these fail, code formatting is being destroyed
      expect(result).toContain('```javascript');
      expect(result).toContain('function test() {');
      expect(result).toContain('    return true;'); // Indentation preserved
      expect(result).toContain('```');
      
      // These should NOT happen:
      expect(result).not.toBe('Code example: function test() { return true; }');
      expect(result).not.toContain('javascriptfunction test()'); // Code blocks merged
    });

    test('should NOT remove markdown formatting', () => {
      const originalText = `# Title

## Subtitle

**Bold text** and *italic*

> Quote block`;
      
      const aiResponse = `Fixed markdown:

${originalText}

Perfect formatting!`;
      
      const result = mockCleanResponse(aiResponse);
      
      // FAILURE CASE: If these fail, markdown is being stripped
      expect(result).toContain('# Title');
      expect(result).toContain('## Subtitle');
      expect(result).toContain('**Bold text**');
      expect(result).toContain('*italic*');
      expect(result).toContain('> Quote block');
      
      // These should NOT happen:
      expect(result).not.toBe('Title Subtitle Bold text and italic Quote block');
      expect(result).not.toContain('TitleSubtitle'); // Headers merged
    });
  });

  describe('Should NOT fail to recognize formatting', () => {
    
    test('should recognize when text contains lists', () => {
      const testTexts = [
        '• Bullet list',
        '- Dash list', 
        '* Asterisk list',
        '1. Numbered list',
        '2. Second item',
        'a. Letter list',
        'i. Roman numeral'
      ];
      
      testTexts.forEach(text => {
        // Simulate context detection
        const hasListFormatting = /^[\s]*[•\-\*\d+\w+][\.\)]?\s/.test(text);
        
        // FAILURE CASE: If this fails, list formatting is not being detected
        expect(hasListFormatting).toBe(true);
      });
    });

    test('should recognize when text contains code', () => {
      const testTexts = [
        '```javascript\ncode\n```',
        '`inline code`',
        '    indented code',
        'function test() {',
        'const x = 1;'
      ];
      
      testTexts.forEach(text => {
        // Simulate code detection
        const hasCodeFormatting = /```|`|^    |\{|\}|function|const|let|var/.test(text);
        
        // FAILURE CASE: If this fails, code formatting is not being detected
        expect(hasCodeFormatting).toBe(true);
      });
    });

    test('should recognize when text contains markdown', () => {
      const testTexts = [
        '# Header',
        '## Subheader',
        '**bold**',
        '*italic*',
        '> blockquote',
        '[link](url)',
        '![image](url)'
      ];
      
      testTexts.forEach(text => {
        // Simulate markdown detection
        const hasMarkdownFormatting = /^#+\s|^\>\s|\*\*.*\*\*|\*.*\*|\[.*\]\(.*\)|!\[.*\]\(.*\)/.test(text);
        
        // FAILURE CASE: If this fails, markdown formatting is not being detected
        expect(hasMarkdownFormatting).toBe(true);
      });
    });

    test('should recognize paragraph breaks', () => {
      const testTexts = [
        'Para 1\n\nPara 2',
        'Line 1\n\n\nLine 2', 
        'Text\n\n\n\nMore text'
      ];
      
      testTexts.forEach(text => {
        // Simulate paragraph break detection
        const hasParagraphBreaks = /\n\s*\n/.test(text);
        
        // FAILURE CASE: If this fails, paragraph breaks are not being detected
        expect(hasParagraphBreaks).toBe(true);
      });
    });
  });

  describe('Integration Test - Real-world Scenarios', () => {
    
    test('email with mixed formatting should be preserved completely', () => {
      const emailText = `Dear Team,

Please review the following items:

**High Priority:**
• Bug fix for login issue
• Update security patches

**Medium Priority:**  
1. Documentation updates
2. Code review for PR #123

**Code to review:**
\`\`\`javascript
if (user.isValid) {
    return user.profile;
}
\`\`\`

> **Note:** All changes must be tested before deployment.

Best regards,
John`;

      const aiResponse = `Here's the corrected email:

${emailText}

The email looks great!`;
      
      const result = mockCleanResponse(aiResponse);
      
      // Should preserve ALL formatting elements
      expect(result).toContain('**High Priority:**');
      expect(result).toContain('• Bug fix');
      expect(result).toContain('1. Documentation');
      expect(result).toContain('```javascript');
      expect(result).toContain('> **Note:**');
      expect(result).toContain('\n\n'); // Paragraph breaks
      
      // Count lines to ensure structure is intact
      const lineCount = result.split('\n').length;
      expect(lineCount).toBeGreaterThan(15); // Should have many lines
    });

    test('GitHub issue with complex formatting should be preserved', () => {
      const issueText = `# Bug Report

## Description
The login function fails under certain conditions.

## Steps to Reproduce
1. Navigate to login page
2. Enter invalid credentials
3. Wait for timeout
4. Try valid credentials

## Expected Behavior
- Should show error message
- Should allow retry
- Should not crash

## Actual Behavior
- Application crashes
- No error message
- Requires restart

## Code Analysis
\`\`\`javascript
// Problem function
async function login(user, pass) {
    if (!user || !pass) {
        throw new Error("Missing credentials");
    }
    return await authenticate(user, pass);
}
\`\`\`

## Environment
- **OS:** Windows 11
- **Browser:** Chrome 120
- **Version:** 2.1.3

> **Priority:** High - affects all users`;

      const aiResponse = `Here's the corrected issue:

${issueText}

Issue is well formatted!`;
      
      const result = mockCleanResponse(aiResponse);
      
      // Should preserve ALL markdown and formatting
      expect(result).toContain('# Bug Report');
      expect(result).toContain('## Description');
      expect(result).toContain('1. Navigate to');
      expect(result).toContain('- Should show');
      expect(result).toContain('```javascript');
      expect(result).toContain('- **OS:**');
      expect(result).toContain('> **Priority:**');
      
      // Verify structure integrity
      const headerCount = (result.match(/^#+/gm) || []).length;
      expect(headerCount).toBeGreaterThan(3); // Multiple headers
    });
  });
});
