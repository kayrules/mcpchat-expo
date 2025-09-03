# OpenAI Integration for Banking Document Analysis

## Overview

The RHB Chat SDK now includes intelligent document analysis powered by OpenAI GPT-4o Vision. This enables automatic detection and extraction of banking-related information from images.

## Features

### Supported Document Types
- 📄 **Bills** - Utility, phone, internet, credit card bills
- 📱 **Phone Numbers** - For mobile top-up and payments  
- 🏦 **Bank Accounts** - For money transfers

### Banking User Intents Supported
- `pay_utility_bill`, `pay_phone_bill`, `pay_internet_bill`, `pay_credit_card`
- `pay_loan`, `pay_insurance`, `pay_government_tax`
- `transfer_to_bank`, `transfer_duitnow`, `transfer_international`
- `topup_prepaid`, `postpaid_payment`
- `check_balance`, `view_statement`, `transaction_history`
- And more...

## Usage

### 1. Basic Setup with OpenAI

```typescript
import { ChatScreen } from 'rhb-chat-sdk';

const config = {
  openAiApiKey: 'your-openai-api-key-here', // Add your OpenAI API key
  theme: {
    primaryColor: '#007AFF',
    backgroundColor: '#FFFFFF',
  }
};

export default function App() {
  return (
    <ChatScreen 
      onClose={() => console.log('Chat closed')}
      config={config}
    />
  );
}
```

### 2. Structured Output Examples

#### Bill Analysis Result
```json
{
  "documentType": "bill",
  "billAnalysis": {
    "user_intent": "pay_utility_bill",
    "account_number": "1234567890",
    "biller_id": "1234",
    "amount": "156.80",
    "due_date": "2024-01-15",
    "biller_name": "Tenaga Nasional Berhad",
    "confidence": 0.95
  },
  "explanation": "This is a TNB electricity bill with account number 1234567890",
  "actionable": true
}
```

#### Phone Top-up Result
```json
{
  "documentType": "phone_number", 
  "phoneAnalysis": {
    "user_intent": "topup_prepaid",
    "phone_number": "012-3456789",
    "telco_provider": "Maxis",
    "amount": "30.00",
    "confidence": 0.90
  },
  "explanation": "Detected Maxis phone number for prepaid top-up",
  "actionable": true
}
```

#### Bank Transfer Result
```json
{
  "documentType": "bank_account",
  "bankAnalysis": {
    "user_intent": "transfer_to_bank", 
    "bank": "Maybank",
    "account_number": "1234567890123",
    "account_holder": "John Doe",
    "bank_code": "MBB",
    "confidence": 0.88
  },
  "explanation": "Maybank account details detected for bank transfer",
  "actionable": true
}
```

## How It Works

1. **Image Capture** - User takes photo or selects from gallery
2. **Context Input** - User provides context/question about the image  
3. **OCR Processing** - Local text extraction using Apple Vision Framework
4. **AI Analysis** - Image + OCR text + context sent to OpenAI GPT-4o
5. **Structured Output** - Banking-specific data extraction and classification
6. **Actionable Response** - User gets formatted analysis with next steps

## Malaysian Banking Context

The system is optimized for Malaysian banking with:
- JomPAY biller codes (4-digit)
- Local telcos: Maxis, Celcom, Digi, U Mobile, TM, Unifi, YTL
- Malaysian phone formats (+60, 01X-XXXXXXX)
- Local banks: Maybank, CIMB, Public Bank, RHB, Hong Leong, etc.

## Error Handling

- Falls back to OCR-only analysis if OpenAI fails
- Graceful degradation without API key
- Comprehensive error logging
- User-friendly error messages

## Privacy & Security

- Images are processed securely via OpenAI API
- Structured data extraction follows banking compliance
- No persistent storage of sensitive information
- OCR processing happens locally first

## Next Steps

When you provide your OpenAI API key, the system will automatically:
1. Analyze bill images for payment processing
2. Detect phone numbers for mobile top-ups  
3. Extract bank account details for transfers
4. Provide actionable insights based on user context

Ready to test with real Malaysian banking documents!