# Privacy Protection Documentation

## Overview

The AI Text Proofreader extension implements comprehensive privacy protection measures to ensure user data security and transparency. This document outlines all privacy features, protections, and user controls.

## 🔒 Privacy Protection Features

### 1. Data Leakage Prevention

**Protection**: Validates that data is only sent to the user's selected LLM provider.

**Implementation**:
- Provider validation before any API call
- Endpoint verification against selected provider
- Automatic rejection of requests to unauthorized providers

**User Control**: Can be enabled/disabled in Privacy tab

### 2. Explicit Consent Requirements

**Protection**: No data is sent to any LLM provider without explicit user action.

**Implementation**:
- Requires user to click action buttons (Proofread, Suggestions)
- Automatic text detection NEVER triggers API calls
- Consent validation in background script

**User Control**: Strict consent mode can be configured in Privacy tab

### 3. Comprehensive Audit Logging

**Protection**: Complete transparent log of all data transmissions.

**Implementation**:
- Records timestamp, provider, and data preview for each transmission
- Logs stored locally in browser storage
- No data sent to external logging services

**User Control**: Can view, export, or clear audit log in Privacy tab

## 🛡️ Privacy Manager Architecture

### Core Components

1. **PrivacyManager Class** (`shared/privacy-manager.js`)
   - Centralized privacy validation
   - Audit logging functionality
   - Data transmission validation

2. **Background Script Integration** (`background/background.js`)
   - Privacy validation for all LLM API calls
   - Consent verification
   - Provider validation

3. **Content Script Protection** (`content/content.js`)
   - Explicit consent tracking
   - User action validation
   - Secure messaging to background script

4. **Privacy UI Controls** (`popup/popup.html` + `popup.js`)
   - Privacy status display
   - Audit log viewer
   - Privacy settings configuration

### Data Flow Protection

```
User Action → Content Script → Background Script → PrivacyManager → LLM API
                ↓                     ↓                ↓
            Consent Check → Provider Validation → Audit Logging
```

## 🔧 Privacy Controls

### Privacy Tab Features

1. **Privacy Protection Status**
   - Real-time status of all protection features
   - Visual indicators for each protection level
   - Quick overview of current privacy state

2. **Privacy Controls**
   - Enable/disable audit logging
   - Strict consent mode toggle
   - Provider validation toggle

3. **Audit Log Management**
   - View recent data transmissions
   - Export complete audit log
   - Clear audit history
   - Entry count display

4. **Data Protection Information**
   - Local processing benefits
   - Explicit consent explanation
   - Audit trail description
   - Provider isolation details

## 📊 Audit Log Format

Each audit entry contains:
- **Timestamp**: When data was sent
- **Provider**: Which LLM provider received the data
- **Data Preview**: First 50 characters of transmitted text
- **User Agent**: Browser/extension context
- **Consent Status**: Explicit consent verification

Example audit entry:
```json
{
  "timestamp": "2024-01-15T10:30:45.123Z",
  "provider": "local",
  "dataPreview": "Please proofread this text for grammar...",
  "userAgent": "AI-Text-Proofreader/1.0",
  "hasUserConsent": true
}
```

## 🔐 Local vs Cloud Privacy

### Local LLM Providers (Recommended for Maximum Privacy)
- **Ollama**: Data never leaves your computer
- **llama.cpp**: Local processing only
- **Text Generation WebUI**: Self-hosted processing
- **KoboldCpp**: Local model execution
- **TabbyAPI**: Local API server

### Cloud LLM Providers (Privacy Protections Applied)
- **OpenAI**: Data sent with privacy validation
- **Anthropic**: Explicit consent required
- **Google**: Audit logging enabled
- **Other APIs**: Full privacy protection suite

## 🛠️ Privacy Settings Storage

Privacy settings are stored locally in browser storage:

```javascript
{
  "privacySettings": {
    "enableAuditLogging": true,
    "strictConsent": true,
    "providerValidation": true
  }
}
```

## 🔍 Privacy Validation Logic

### 1. Data Transmission Validation
```javascript
// Validates provider selection matches transmission target
validateDataTransmission(data, provider, selectedProvider)
```

### 2. Consent Verification
```javascript
// Ensures explicit user consent for data transmission
validateConsent(hasUserConsent, strictConsentMode)
```

### 3. Provider Selection Validation
```javascript
// Prevents data leakage to non-selected providers
validateProviderSelection(provider, selectedProvider)
```

## 📋 Testing Coverage

Comprehensive Jest test suite covering:
- Privacy manager functionality
- Data validation logic
- Audit logging system
- Consent verification
- Provider validation
- Integration with LLM services

Test files:
- `tests/privacy-protection.test.js`: Complete privacy test suite

## 🔄 Privacy by Design

### Core Principles

1. **Opt-in Privacy**: Privacy protections are available but optional for user convenience
2. **User Control**: Users can enable privacy features based on their needs
3. **Transparency**: Complete audit trail available when enabled
4. **Granular Control**: Individual control over each privacy feature
5. **Local Processing Preference**: Encourages use of local LLMs for maximum privacy

### Default Privacy Configuration

- ❌ Audit logging: **Disabled** (can be enabled in Privacy tab)
- ❌ Strict consent: **Disabled** (can be enabled in Privacy tab)
- ❌ Provider validation: **Disabled** (can be enabled in Privacy tab)
- ✅ Privacy controls available: **Available in Privacy tab**

## 🚀 Best Practices for Users

### For Users Wanting Maximum Privacy
1. Use local LLM providers (Ollama recommended)
2. Enable all privacy protections in Privacy tab
3. Enable audit logging to track data usage
4. Use strict consent mode
5. Enable provider validation

### For General Use (Default Configuration)
1. Privacy controls available but optional
2. Direct connection to selected LLM provider
3. Standard browser extension security
4. Option to enable privacy features anytime
5. Local LLM support for enhanced privacy

## 🔧 Technical Implementation

### Browser Storage Schema
```javascript
// Privacy settings (defaults to false for user convenience)
privacySettings: {
  enableAuditLogging: boolean, // default: false
  strictConsent: boolean,      // default: false  
  providerValidation: boolean  // default: false
}

// Audit log
auditLog: [
  {
    timestamp: string,
    provider: string,
    dataPreview: string,
    userAgent: string,
    hasUserConsent: boolean
  }
]
```

### API Integration Points
- Background script LLM calls
- Content script user actions
- Privacy manager validation
- Audit log storage
- UI status updates

## 📞 Privacy Support

For privacy-related questions or concerns:
1. Review this documentation
2. Check audit log for data transmission history
3. Verify privacy settings in Privacy tab
4. Use local LLM providers for maximum privacy
5. Export audit logs for compliance needs

## 🔄 Privacy Updates

Privacy protection features are continuously enhanced. Check for:
- New privacy controls
- Additional audit log features
- Enhanced provider validation
- Improved consent mechanisms
- Extended local LLM support