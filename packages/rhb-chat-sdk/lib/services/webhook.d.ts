export interface WebhookResponse {
    success: boolean;
    message?: string;
    data?: any;
    error?: string;
}
export interface WebhookTextRequest {
    text: string;
    sessionId: string;
}
export interface WebhookFileRequest {
    file: File | string;
    sessionId: string;
}
export declare class WebhookService {
    private baseURL;
    sendTextMessage(text: string, sessionId: string): Promise<string>;
    sendFileMessage(file: string, sessionId: string): Promise<string>;
    generateSessionId(): string;
}
export default WebhookService;
//# sourceMappingURL=webhook.d.ts.map