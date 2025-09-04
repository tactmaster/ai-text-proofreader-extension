# Test Suite Documentation

## Overview

This test suite provides comprehensive coverage for formatting preservation and context recognition in the AI Text Proofreader Chrome Extension. The tests specifically validate the requirements you mentioned:

1. **Not removing formatting** (preserving newlines, bullets, numbers)
2. **Recognizing formatting** (detecting different formatting types)

## Test Structure

### 1. Anti-Pattern Tests (`anti-pattern.test.js`)
**Purpose**: Test what should NOT happen - validates that the extension doesn't break formatting

#### Tests for "Should NOT remove formatting":
- ✅ **Newlines preservation** - Ensures paragraph breaks are maintained
- ✅ **Bullet points preservation** - Tests •, -, * bullet styles
- ✅ **Numbered lists preservation** - Tests 1., 2., 3. numbering
- ✅ **Code block preservation** - Tests ```code``` blocks with indentation
- ✅ **Markdown preservation** - Tests #headers, **bold**, *italic*, >quotes

#### Tests for "Should NOT fail to recognize formatting":
- ✅ **List detection** - Recognizes various list formats
- ✅ **Code detection** - Identifies code blocks and inline code
- ✅ **Markdown detection** - Recognizes markdown syntax
- ✅ **Paragraph breaks** - Detects intentional line spacing

#### Integration scenarios:
- ✅ **Mixed email formatting** - Complex email with bullets, code, quotes
- ✅ **GitHub issue formatting** - Technical content with headers, lists, code

### 2. Formatting Preservation Tests (`formatting-preservation.test.js`)
**Purpose**: Test the `cleanResponse` function behavior

#### Tests for formatting preservation:
- ✅ **Newlines** - Multi-paragraph text stays structured
- ✅ **Bullet points** - All bullet styles (•, -, *) preserved
- ✅ **Numbered lists** - Sequential numbering maintained
- ✅ **Code formatting** - Indentation and code blocks intact
- ✅ **Markdown** - Headers, bold, italic, quotes preserved
- ✅ **Mixed formatting** - Complex combinations work together

#### Tests for wrapper removal:
- ✅ **Conversational text** - Removes "Here's the corrected text" etc.
- ✅ **Various patterns** - Handles different AI response wrappers
- ✅ **Edge cases** - Empty input, whitespace-only, no wrapper

### 3. Context Recognition Tests (`context-recognition.test.js`)
**Purpose**: Test context detection and prompt generation

#### Prompt generation tests:
- ✅ **Email prompts** - Include formatting preservation rules
- ✅ **Development prompts** - Include code/markdown preservation
- ✅ **General prompts** - Include basic formatting preservation

#### Context recognition tests:
- ✅ **Gmail detection** - Recognizes email context
- ✅ **Outlook detection** - Recognizes email context
- ✅ **GitHub detection** - Recognizes development context
- ✅ **Fallback handling** - Unknown sites use general context

#### Custom settings tests:
- ✅ **Custom configurations** - Uses user-defined website categories
- ✅ **Prompt validation** - All prompts include PRESERVE instructions

## Running Tests

### Run all tests:
```bash
npm test
```

### Run specific test categories:
```bash
npm run test:formatting    # Formatting preservation tests
npm run test:context       # Context recognition tests  
npm run test:anti-pattern  # Anti-pattern tests
```

### Run with coverage:
```bash
npm run test:coverage
```

### Watch mode for development:
```bash
npm run test:watch
```

## Test Results Summary

**✅ All 35 tests passing**

The test suite validates:

1. **Formatting is preserved** across all scenarios
2. **Context is recognized** correctly for different websites
3. **AI prompts include** formatting preservation instructions
4. **Response cleaning** removes wrapper text but keeps formatting
5. **Edge cases** are handled properly

## What These Tests Prevent

### ❌ Formatting Removal Issues:
- Converting "Item 1\n• Item 2" → "Item 1 Item 2"
- Converting "Para 1\n\nPara 2" → "Para 1 Para 2"  
- Converting "```code```" → "code"
- Converting "# Header" → "Header"

### ❌ Recognition Failures:
- Not detecting bullet points as formatting
- Not detecting code blocks as special content
- Not detecting numbered lists as structured data
- Not applying appropriate context prompts

### ✅ What Should Happen:
- Grammar/spelling fixes while preserving ALL formatting
- Context-aware prompts with explicit PRESERVE instructions
- Clean AI responses without wrapper text
- Proper website categorization and custom settings support

## Test Coverage

The tests cover both positive and negative scenarios to ensure robust formatting preservation and context recognition throughout the Chrome extension.
