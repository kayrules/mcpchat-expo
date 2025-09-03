export interface OCRResult {
    text: string;
    confidence?: number;
    language?: string;
    documentType?: 'receipt' | 'bill' | 'bank_statement' | 'invoice' | 'id_card' | 'credit_card' | 'unknown';
    extractedData?: {
        amounts?: string[];
        dates?: string[];
        phoneNumbers?: string[];
        emails?: string[];
        accountNumbers?: string[];
        merchantName?: string;
        total?: string;
    };
    blocks?: Array<{
        text: string;
        confidence: number;
        frame: {
            x: number;
            y: number;
            width: number;
            height: number;
        };
    }>;
}
export type BankingUserIntent = 'pay_utility_bill' | 'pay_phone_bill' | 'pay_internet_bill' | 'pay_credit_card' | 'pay_loan' | 'pay_insurance' | 'pay_government_tax' | 'transfer_to_bank' | 'transfer_duitnow' | 'transfer_international' | 'topup_prepaid' | 'postpaid_payment' | 'check_balance' | 'view_statement' | 'transaction_history' | 'invest_funds' | 'fixed_deposit' | 'insurance_purchase' | 'document_analysis' | 'fraud_detection' | 'unknown';
export interface BillAnalysisResult {
    user_intent: BankingUserIntent;
    account_number: string;
    biller_id: string;
    amount?: string;
    due_date?: string;
    biller_name?: string;
    confidence: number;
}
export interface PhoneTopupResult {
    user_intent: BankingUserIntent;
    phone_number: string;
    telco_provider: 'Maxis' | 'Celcom' | 'Digi' | 'U Mobile' | 'TM' | 'Unifi' | 'YTL' | 'Other';
    amount?: string;
    confidence: number;
}
export interface BankTransferResult {
    user_intent: BankingUserIntent;
    bank: string;
    account_number: string;
    account_holder?: string;
    bank_code?: string;
    confidence: number;
}
export interface OpenAIAnalysisResult {
    documentType: 'bill' | 'phone_number' | 'bank_account' | 'receipt' | 'statement' | 'unknown';
    billAnalysis?: BillAnalysisResult;
    phoneAnalysis?: PhoneTopupResult;
    bankAnalysis?: BankTransferResult;
    explanation: string;
    actionable: boolean;
}
export declare class OpenAIService {
    private apiKey;
    private baseURL;
    constructor(apiKey: string);
    private convertImageToBase64;
    analyzeImageWithContext(imageUri: string, ocrResult: OCRResult, userContext: string): Promise<OpenAIAnalysisResult>;
    formatAnalysisForUser(analysis: OpenAIAnalysisResult, userContext: string): string;
}
export default OpenAIService;
//# sourceMappingURL=openai.d.ts.map