export interface ChatMessage {
    id: number;
    text: string;
    sender: 'user' | 'ai';
    timestamp: Date;
    mediaType?: 'image' | 'file' | 'audio';
    mediaUri?: string;
    userContext?: string;
    metadata?: {
        openAiAnalysis?: any;
        processingType?: 'ocr_only' | 'openai_vision' | 'custom';
        [key: string]: any;
    };
    ocrData?: {
        extractedText: string;
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
    };
}
export interface SuggestedPrompt {
    title: string;
    description: string;
}
export interface ChatConfig {
    logoSource?: any;
    suggestedPrompts?: SuggestedPrompt[];
    onMessage?: (message: ChatMessage) => Promise<string>;
    onMessageSend?: (message: string) => Promise<string>;
    onMediaUpload?: (type: string, uri: string, description: string) => Promise<void>;
    openAiApiKey?: string;
    theme?: {
        primaryColor?: string;
        backgroundColor?: string;
        textColor?: string;
        userBubbleColor?: string;
        aiBubbleColor?: string;
    };
}
export interface FloatingChatButtonProps {
    onPress: () => void;
    style?: any;
}
export interface ChatScreenProps {
    onClose: () => void;
    config?: ChatConfig;
}
//# sourceMappingURL=index.d.ts.map