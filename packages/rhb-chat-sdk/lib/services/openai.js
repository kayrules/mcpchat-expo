export class OpenAIService {
    constructor(apiKey) {
        this.baseURL = 'https://api.openai.com/v1/chat/completions';
        this.apiKey = apiKey;
    }
    async convertImageToBase64(imageUri) {
        try {
            const response = await fetch(imageUri);
            const blob = await response.blob();
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64 = reader.result;
                    // Remove data:image/jpeg;base64, prefix if present
                    const base64Data = base64.split(',')[1] || base64;
                    resolve(base64Data);
                };
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        }
        catch (error) {
            console.error('Error converting image to base64:', error);
            throw new Error('Failed to convert image to base64');
        }
    }
    async analyzeImageWithContext(imageUri, ocrResult, userContext) {
        var _a, _b;
        try {
            console.log('🤖 Starting OpenAI analysis...');
            const imageBase64 = await this.convertImageToBase64(imageUri);
            const systemPrompt = `You are a Malaysian banking AI assistant specialized in analyzing financial documents and images. 

Your task is to analyze images and determine the user's banking intent, then extract relevant structured data.

MALAYSIAN CONTEXT:
- Utility bills often have 4-digit biller codes for JomPAY
- Major telcos: Maxis, Celcom, Digi, U Mobile, TM, Unifi, YTL
- Malaysian phone format: +60, 01X-XXXXXXX format
- Banks: Maybank, CIMB, Public Bank, RHB, Hong Leong, AmBank, BSN, etc.

RESPONSE FORMAT: Return valid JSON with this structure:
{
  "documentType": "bill" | "phone_number" | "bank_account" | "receipt" | "statement" | "unknown",
  "billAnalysis": {
    "user_intent": "pay_utility_bill" | "pay_phone_bill" | etc,
    "account_number": "string",
    "biller_id": "4-digit code",
    "amount": "string (optional)",
    "due_date": "string (optional)", 
    "biller_name": "string (optional)",
    "confidence": 0.0-1.0
  },
  "phoneAnalysis": {
    "user_intent": "topup_prepaid" | "postpaid_payment",
    "phone_number": "string",
    "telco_provider": "Maxis" | "Celcom" | etc,
    "amount": "string (optional)",
    "confidence": 0.0-1.0
  },
  "bankAnalysis": {
    "user_intent": "transfer_to_bank" | "transfer_duitnow",
    "bank": "string",
    "account_number": "string", 
    "account_holder": "string (optional)",
    "bank_code": "string (optional)",
    "confidence": 0.0-1.0
  },
  "explanation": "Brief explanation of what was detected and why",
  "actionable": true/false
}

Include only the relevant analysis section based on document type.`;
            const userPrompt = `User's question/context: "${userContext}"

OCR Extracted Text:
"${ocrResult.text}"

Document Classification: ${ocrResult.documentType}
Extracted Data: ${JSON.stringify(ocrResult.extractedData)}

Please analyze this image and the OCR text to determine:
1. What type of document this is
2. The user's banking intent based on their question
3. Extract the relevant structured data for banking operations

Focus on Malaysian banking context and return actionable data.`;
            const response = await fetch(this.baseURL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'gpt-4o',
                    messages: [
                        {
                            role: 'system',
                            content: systemPrompt
                        },
                        {
                            role: 'user',
                            content: [
                                {
                                    type: 'text',
                                    text: userPrompt
                                },
                                {
                                    type: 'image_url',
                                    image_url: {
                                        url: `data:image/jpeg;base64,${imageBase64}`
                                    }
                                }
                            ]
                        }
                    ],
                    max_tokens: 1000,
                    temperature: 0.1 // Low temperature for consistent structured output
                })
            });
            if (!response.ok) {
                throw new Error(`OpenAI API error: ${response.statusText}`);
            }
            const data = await response.json();
            const content = (_b = (_a = data.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content;
            if (!content) {
                throw new Error('No response from OpenAI');
            }
            // Parse JSON response
            try {
                const result = JSON.parse(content);
                console.log('✅ OpenAI analysis completed:', result);
                return result;
            }
            catch (parseError) {
                console.error('Failed to parse OpenAI response:', content);
                // Fallback result
                return {
                    documentType: 'unknown',
                    explanation: 'Could not parse the document structure',
                    actionable: false
                };
            }
        }
        catch (error) {
            console.error('❌ OpenAI analysis failed:', error);
            throw error;
        }
    }
    // Helper method to format the analysis for user display
    formatAnalysisForUser(analysis, userContext) {
        let response = `${analysis.explanation}\n\n`;
        if (analysis.billAnalysis) {
            response += `📄 **Bill Payment Detected**\n`;
            response += `• Account: ${analysis.billAnalysis.account_number}\n`;
            response += `• Biller ID: ${analysis.billAnalysis.biller_id}\n`;
            if (analysis.billAnalysis.amount)
                response += `• Amount: RM ${analysis.billAnalysis.amount}\n`;
            if (analysis.billAnalysis.due_date)
                response += `• Due Date: ${analysis.billAnalysis.due_date}\n`;
            response += `\n🏦 Would you like me to help you pay this bill?`;
        }
        if (analysis.phoneAnalysis) {
            response += `📱 **Mobile ${analysis.phoneAnalysis.user_intent === 'topup_prepaid' ? 'Top-up' : 'Payment'} Detected**\n`;
            response += `• Phone: ${analysis.phoneAnalysis.phone_number}\n`;
            response += `• Provider: ${analysis.phoneAnalysis.telco_provider}\n`;
            if (analysis.phoneAnalysis.amount)
                response += `• Amount: RM ${analysis.phoneAnalysis.amount}\n`;
            response += `\n📞 Ready to process this mobile transaction?`;
        }
        if (analysis.bankAnalysis) {
            response += `🏦 **Bank Transfer Detected**\n`;
            response += `• Bank: ${analysis.bankAnalysis.bank}\n`;
            response += `• Account: ${analysis.bankAnalysis.account_number}\n`;
            if (analysis.bankAnalysis.account_holder)
                response += `• Holder: ${analysis.bankAnalysis.account_holder}\n`;
            response += `\n💸 Shall I help you with this transfer?`;
        }
        if (!analysis.actionable) {
            response += `\n💡 I can help analyze this document, but I couldn't find specific actionable banking information. Feel free to ask me specific questions about what you see in the image.`;
        }
        return response;
    }
}
export default OpenAIService;
