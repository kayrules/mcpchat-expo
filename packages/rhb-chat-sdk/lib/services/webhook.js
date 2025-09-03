export class WebhookService {
    constructor() {
        this.baseURL = 'https://nodemation.kayrules.com/webhook/mcp-demo';
    }
    async sendTextMessage(text, sessionId) {
        var _a, _b, _c;
        try {
            console.log('📤 Sending text message to webhook:', { text: text.substring(0, 50) + '...', sessionId });
            console.log('🔗 Webhook URL:', this.baseURL);
            const requestBody = {
                text,
                sessionId
            };
            console.log('📦 Request body:', requestBody);
            const response = await fetch(this.baseURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });
            console.log('📊 Response status:', response.status);
            console.log('📊 Response headers:', response.headers);
            if (!response.ok) {
                const errorText = await response.text();
                console.log('❌ Error response body:', errorText);
                throw new Error(`Webhook request failed: ${response.status} ${response.statusText}`);
            }
            const result = await response.json();
            console.log('✅ Webhook text response received:', result);
            // Handle n8n response format - array with output field
            if (Array.isArray(result) && result.length > 0) {
                const firstItem = result[0];
                return firstItem.output || firstItem.message || firstItem.response || JSON.stringify(firstItem);
            }
            // Try different possible response formats
            if (typeof result === 'string') {
                return result;
            }
            // Try common response patterns
            return result.message ||
                ((_a = result.data) === null || _a === void 0 ? void 0 : _a.message) ||
                result.response ||
                ((_b = result.data) === null || _b === void 0 ? void 0 : _b.response) ||
                result.output ||
                ((_c = result.data) === null || _c === void 0 ? void 0 : _c.output) ||
                JSON.stringify(result) ||
                'Message processed successfully';
        }
        catch (error) {
            console.error('❌ Webhook text message error:', error);
            throw new Error(`Failed to send message: ${error.message}`);
        }
    }
    async sendFileMessage(file, sessionId) {
        var _a, _b, _c;
        try {
            console.log('📤 Sending file to webhook:', { file, sessionId });
            console.log('🔗 Webhook URL:', this.baseURL);
            console.log('🔗 File URI format:', file.startsWith('file://') ? 'Local file URI' : file.startsWith('content://') ? 'Content URI' : 'Other URI format');
            // Create FormData for multipart/form-data request
            const formData = new FormData();
            // Convert file URI to blob for React Native
            console.log('🔄 Fetching file from URI...');
            const response = await fetch(file);
            console.log('📊 Fetch response status:', response.status);
            const blob = await response.blob();
            console.log('📁 Blob type:', blob.type);
            console.log('📁 Blob size:', blob.size);
            // Check if file is too large (over 5MB) and warn
            const maxSize = 5 * 1024 * 1024; // 5MB
            if (blob.size > maxSize) {
                console.warn('⚠️ File size is large:', (blob.size / 1024 / 1024).toFixed(1) + 'MB');
                console.warn('⚠️ This might cause upload issues. Consider reducing image quality.');
            }
            // For React Native, we need to append the blob with proper metadata
            const fileName = file.split('/').pop() || 'image.jpg';
            // React Native FormData expects this format for file uploads
            formData.append('file', {
                uri: file,
                type: blob.type || 'image/jpeg',
                name: fileName,
            });
            formData.append('sessionId', sessionId);
            console.log('📦 FormData created with file:', fileName);
            const webhookResponse = await fetch(this.baseURL, {
                method: 'POST',
                // Don't set Content-Type header - let the browser set it with boundary
                body: formData,
            });
            if (!webhookResponse.ok) {
                throw new Error(`Webhook file request failed: ${webhookResponse.status} ${webhookResponse.statusText}`);
            }
            const result = await webhookResponse.json();
            console.log('✅ Webhook file response received:', result);
            // Handle n8n response format - array with output field
            if (Array.isArray(result) && result.length > 0) {
                const firstItem = result[0];
                return firstItem.output || firstItem.message || firstItem.response || JSON.stringify(firstItem);
            }
            // Try different possible response formats
            if (typeof result === 'string') {
                return result;
            }
            // Try common response patterns
            return result.message ||
                ((_a = result.data) === null || _a === void 0 ? void 0 : _a.message) ||
                result.response ||
                ((_b = result.data) === null || _b === void 0 ? void 0 : _b.response) ||
                result.output ||
                ((_c = result.data) === null || _c === void 0 ? void 0 : _c.output) ||
                JSON.stringify(result) ||
                'File processed successfully';
        }
        catch (error) {
            console.error('❌ Webhook file upload error:', error);
            throw new Error(`Failed to upload file: ${error.message}`);
        }
    }
    // Generate session ID for user
    generateSessionId() {
        return `user_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    }
}
export default WebhookService;
