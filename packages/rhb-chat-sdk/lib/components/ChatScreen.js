import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, StatusBar, KeyboardAvoidingView, Platform, Image, Keyboard, Alert, } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { AudioRecorder } from 'expo-audio';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import ImagePreviewModal from './ImagePreviewModal';
import WebhookService from '../services/webhook';
import Markdown from 'react-native-markdown-display';
const rhbLogo = require('../../assets/rhblogo.png');
const defaultPrompts = [
    {
        title: 'What can RHB.ai do?',
        description: 'Smart help at your service'
    },
    {
        title: 'Pay bills with JomPAY',
        description: 'Fast & secure payment'
    },
    {
        title: 'Top up favourite mobile',
        description: 'Reload in just a tap'
    },
    {
        title: 'Pay DuitNow by photo',
        description: 'Snap & transfer easily'
    },
    {
        title: 'Summarize statement',
        description: 'Quick spend overview'
    },
    {
        title: 'Show investment picks',
        description: 'Plans made for you'
    },
];
const ChatScreen = ({ onClose, config = {} }) => {
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [showBottomSheet, setShowBottomSheet] = useState(false);
    const [audioRecorder, setAudioRecorder] = useState(null);
    const [showImagePreview, setShowImagePreview] = useState(false);
    const [previewImageUri, setPreviewImageUri] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [sessionId] = useState(() => new WebhookService().generateSessionId());
    const scrollViewRef = useRef(null);
    const textInputRef = useRef(null);
    const webhookService = new WebhookService();
    const suggestedPrompts = config.suggestedPrompts || defaultPrompts;
    const theme = config.theme || {};
    const sendMessage = async () => {
        if (inputText.trim() === '')
            return;
        const userMessage = {
            id: Date.now(),
            text: inputText,
            sender: 'user',
            timestamp: new Date(),
        };
        setMessages(prev => [...prev, userMessage]);
        const messageText = inputText;
        setInputText('');
        try {
            // Use webhook service to send text message
            const aiResponse = await webhookService.sendTextMessage(messageText, sessionId);
            const aiMessage = {
                id: Date.now() + 1,
                text: aiResponse,
                sender: 'ai',
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, aiMessage]);
        }
        catch (error) {
            console.error('Error sending message:', error);
            // Fallback error message
            const errorMessage = {
                id: Date.now() + 1,
                text: 'Sorry, I encountered an error processing your message. Please try again.',
                sender: 'ai',
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, errorMessage]);
        }
    };
    const selectPrompt = (prompt) => {
        setInputText(prompt.title);
    };
    const toggleBottomSheet = () => {
        if (!showBottomSheet) {
            // Show bottom sheet, hide keyboard
            Keyboard.dismiss();
            setShowBottomSheet(true);
        }
        else {
            // Hide bottom sheet, show keyboard
            setShowBottomSheet(false);
            setTimeout(() => {
                var _a;
                (_a = textInputRef.current) === null || _a === void 0 ? void 0 : _a.focus();
            }, 100);
        }
    };
    const handleCamera = async () => {
        try {
            // Request camera permissions
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Required', 'Camera access is needed to take photos. Please enable camera permissions in your device settings.', [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Open Settings', onPress: () => {
                            // For Expo, you can't directly open settings, but provide guidance
                            Alert.alert('Enable Permissions', 'Go to Settings > Privacy & Security > Camera and enable access for this app.');
                        } }
                ]);
                return;
            }
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
                allowsMultipleSelection: false,
                selectionLimit: 1,
                // Add resize options to reduce file size while maintaining quality
                exif: false, // Remove EXIF data to reduce size
            });
            if (!result.canceled && result.assets[0]) {
                const asset = result.assets[0];
                console.log('📷 Camera asset (original):', {
                    uri: asset.uri,
                    type: asset.type,
                    fileName: asset.fileName,
                    fileSize: asset.fileSize,
                });
                // Resize image to reduce file size while maintaining quality
                try {
                    const resizedImage = await manipulateAsync(asset.uri, [
                        { resize: { width: 1024 } }, // Resize to max width of 1024px (maintains aspect ratio)
                    ], {
                        compress: 0.8, // 80% quality
                        format: SaveFormat.JPEG,
                    });
                    console.log('📷 Camera asset (resized):', {
                        uri: resizedImage.uri,
                        width: resizedImage.width,
                        height: resizedImage.height,
                    });
                    // Show preview modal with resized image
                    setPreviewImageUri(resizedImage.uri);
                    setShowImagePreview(true);
                    setShowBottomSheet(false); // Close bottom sheet
                }
                catch (resizeError) {
                    console.error('Failed to resize image:', resizeError);
                    // Fallback to original image if resize fails
                    setPreviewImageUri(asset.uri);
                    setShowImagePreview(true);
                    setShowBottomSheet(false);
                }
            }
        }
        catch (error) {
            console.error('Camera error:', error);
            Alert.alert('Error', 'Camera feature requires proper configuration. Please check the installation guide.');
        }
    };
    const handlePhotos = async () => {
        try {
            // Request media library permissions
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission required', 'Photo library access is needed to select images');
                return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });
            if (!result.canceled && result.assets[0]) {
                const asset = result.assets[0];
                console.log('🖼️ Gallery asset:', {
                    uri: asset.uri,
                    type: asset.type,
                    fileName: asset.fileName,
                    fileSize: asset.fileSize,
                });
                // Show preview modal instead of immediately adding to chat
                setPreviewImageUri(asset.uri);
                setShowImagePreview(true);
                setShowBottomSheet(false); // Close bottom sheet
            }
        }
        catch (error) {
            console.error('Photo picker error:', error);
            Alert.alert('Error', 'Failed to select photo');
        }
    };
    const handleImageWithContext = async (imageUri, context) => {
        try {
            console.log('🚀 handleImageWithContext called with:', { imageUri, context });
            console.log('📷 Processing image with webhook:', context);
            // Create message with image and context
            const imageMessage = {
                id: Date.now(),
                text: context || 'Image uploaded',
                sender: 'user',
                timestamp: new Date(),
                mediaType: 'image',
                mediaUri: imageUri,
                userContext: context,
            };
            setMessages(prev => [...prev, imageMessage]);
            try {
                // Send image to webhook service
                const aiResponse = await webhookService.sendFileMessage(imageUri, sessionId);
                const aiMessage = {
                    id: Date.now() + 1,
                    text: aiResponse,
                    sender: 'ai',
                    timestamp: new Date(),
                    metadata: {
                        processingType: 'custom'
                    }
                };
                setMessages(prev => [...prev, aiMessage]);
            }
            catch (error) {
                console.error('Webhook file processing failed:', error);
                // Fallback error message
                const errorMessage = {
                    id: Date.now() + 1,
                    text: `I can see your image with the question: "${context}". However, I'm having trouble processing it right now. Please try again or ask me something else.`,
                    sender: 'ai',
                    timestamp: new Date(),
                };
                setMessages(prev => [...prev, errorMessage]);
            }
        }
        catch (error) {
            console.error('Image handling failed:', error);
            // Fallback to regular image message if everything fails
            const fallbackMessage = {
                id: Date.now(),
                text: context || 'Image uploaded',
                sender: 'user',
                timestamp: new Date(),
                mediaType: 'image',
                mediaUri: imageUri,
                userContext: context,
            };
            setMessages(prev => [...prev, fallbackMessage]);
            // Show error message
            const errorMessage = {
                id: Date.now() + 1,
                text: 'Sorry, I encountered an error while processing your image. Please try again.',
                sender: 'ai',
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, errorMessage]);
        }
    };
    const handleFiles = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: '*/*',
                copyToCacheDirectory: true,
            });
            if (!result.canceled && result.assets && result.assets[0]) {
                const file = result.assets[0];
                addMediaMessage('file', file.uri, file.name || 'File');
            }
        }
        catch (error) {
            console.error('File picker error:', error);
            Alert.alert('Error', 'Failed to pick file');
        }
    };
    const handleVoice = async () => {
        if (isRecording) {
            stopRecording();
        }
        else {
            startRecording();
        }
    };
    const startRecording = async () => {
        try {
            const recorder = new AudioRecorder({
                extension: '.m4a',
            });
            await recorder.record();
            setAudioRecorder(recorder);
            setIsRecording(true);
        }
        catch (error) {
            console.error('Failed to start recording:', error);
            Alert.alert('Error', 'Audio recording requires proper configuration. Please check the installation guide.');
        }
    };
    const stopRecording = async () => {
        if (!audioRecorder)
            return;
        try {
            await audioRecorder.stop();
            addMediaMessage('audio', undefined, 'Voice message');
            setAudioRecorder(null);
            setIsRecording(false);
        }
        catch (error) {
            console.error('Failed to stop recording:', error);
            Alert.alert('Error', 'Failed to stop recording');
        }
    };
    const addMediaMessage = async (type, uri, description) => {
        console.log('🔄 addMediaMessage called with:', { type, uri, description });
        const mediaMessage = {
            id: Date.now(),
            text: description || `${type} message`,
            sender: 'user',
            timestamp: new Date(),
            mediaType: type,
            mediaUri: uri,
        };
        setMessages(prev => [...prev, mediaMessage]);
        // Send file to webhook service if URI is provided
        if (uri && (type === 'file' || type === 'image')) {
            console.log('📤 addMediaMessage: Sending to webhook service');
            try {
                const aiResponse = await webhookService.sendFileMessage(uri, sessionId);
                const aiMessage = {
                    id: Date.now() + 1,
                    text: aiResponse,
                    sender: 'ai',
                    timestamp: new Date(),
                };
                setMessages(prev => [...prev, aiMessage]);
            }
            catch (error) {
                console.error('Error handling media upload:', error);
                // Fallback response
                const errorMessage = {
                    id: Date.now() + 1,
                    text: `I received your ${type} but had trouble processing it. Please try again.`,
                    sender: 'ai',
                    timestamp: new Date(),
                };
                setMessages(prev => [...prev, errorMessage]);
            }
        }
        else {
            // For audio or when no URI, provide basic response
            setTimeout(() => {
                const aiMessage = {
                    id: Date.now() + 1,
                    text: `I received your ${type}. How can I help you with it?`,
                    sender: 'ai',
                    timestamp: new Date(),
                };
                setMessages(prev => [...prev, aiMessage]);
            }, 1000);
        }
    };
    const handleShortcut = (type) => {
        setShowBottomSheet(false);
        // Dismiss keyboard first for media-related shortcuts
        if (type === 'camera' || type === 'photos' || type === 'files') {
            Keyboard.dismiss();
        }
        // Handle each shortcut type with slight delay for media options
        if (type === 'camera' || type === 'photos' || type === 'files') {
            setTimeout(() => {
                switch (type) {
                    case 'camera':
                        handleCamera();
                        break;
                    case 'photos':
                        handlePhotos();
                        break;
                    case 'files':
                        handleFiles();
                        break;
                }
            }, 100);
        }
        else {
            // Handle non-media shortcuts immediately
            switch (type) {
                case 'voice':
                    handleVoice();
                    break;
                default:
                    console.log(`${type} selected`);
            }
            // Only refocus for non-media shortcuts
            setTimeout(() => {
                var _a;
                (_a = textInputRef.current) === null || _a === void 0 ? void 0 : _a.focus();
            }, 100);
        }
    };
    const renderBottomSheet = () => {
        if (!showBottomSheet)
            return null;
        const shortcuts = [
            { icon: 'camera-alt', label: 'Camera', type: 'camera' },
            { icon: 'photo-library', label: 'Photos', type: 'photos' },
            { icon: 'folder', label: 'Files', type: 'files' },
            { icon: isRecording ? 'stop' : 'mic', label: isRecording ? 'Stop' : 'Voice', type: 'voice' },
        ];
        return (_jsxs(View, { style: styles.bottomSheet, children: [_jsx(View, { style: styles.bottomSheetHandle }), _jsx(View, { style: styles.shortcutsContainer, children: shortcuts.map((shortcut, index) => (_jsxs(TouchableOpacity, { style: styles.shortcutButton, onPress: () => handleShortcut(shortcut.type), children: [_jsx(View, { style: styles.shortcutIconContainer, children: _jsx(MaterialIcons, { name: shortcut.icon, size: 24, color: theme.primaryColor || "#007AFF" }) }), _jsx(Text, { style: styles.shortcutLabel, children: shortcut.label })] }, index))) })] }));
    };
    const renderMessage = (message) => (_jsxs(View, { style: [
            styles.messageContainer,
            message.sender === 'user' ? styles.userMessage : styles.aiMessage,
            message.sender === 'user' && theme.userBubbleColor && { backgroundColor: theme.userBubbleColor },
            message.sender === 'ai' && theme.aiBubbleColor && { backgroundColor: theme.aiBubbleColor },
        ], children: [message.mediaType === 'image' && message.mediaUri && (_jsx(Image, { source: { uri: message.mediaUri }, style: styles.messageImage, resizeMode: "cover" })), message.mediaType === 'file' && (_jsxs(View, { style: styles.fileContainer, children: [_jsx(MaterialIcons, { name: "insert-drive-file", size: 24, color: message.sender === 'user' ? "#FFFFFF" : theme.primaryColor || "#007AFF" }), _jsx(Text, { style: [
                            styles.fileName,
                            message.sender === 'user' ? styles.userMessageText : styles.aiMessageText
                        ], children: message.text })] })), message.mediaType === 'audio' && (_jsxs(View, { style: styles.audioContainer, children: [_jsx(MaterialIcons, { name: "audiotrack", size: 24, color: message.sender === 'user' ? "#FFFFFF" : theme.primaryColor || "#007AFF" }), _jsx(Text, { style: [
                            styles.fileName,
                            message.sender === 'user' ? styles.userMessageText : styles.aiMessageText
                        ], children: message.text })] })), message.sender === 'ai' ? (_jsx(Markdown, { style: {
                    body: {
                        color: message.sender === 'user' ? '#FFFFFF' : '#333333',
                        fontSize: 16,
                        lineHeight: 20,
                        ...(theme.textColor && { color: theme.textColor })
                    },
                    strong: {
                        fontWeight: 'bold',
                        color: message.sender === 'user' ? '#FFFFFF' : '#333333'
                    },
                    em: {
                        fontStyle: 'italic'
                    },
                    bullet_list: {
                        marginVertical: 4
                    },
                    list_item: {
                        marginVertical: 2
                    },
                    code_inline: {
                        backgroundColor: '#F0F0F0',
                        borderRadius: 4,
                        paddingHorizontal: 4,
                        paddingVertical: 2,
                        fontFamily: 'monospace'
                    },
                    code_block: {
                        backgroundColor: '#F0F0F0',
                        borderRadius: 8,
                        padding: 12,
                        marginVertical: 8,
                        fontFamily: 'monospace'
                    }
                }, children: message.text })) : (_jsx(Text, { style: [
                    styles.messageText,
                    message.sender === 'user' ? styles.userMessageText : styles.aiMessageText,
                    theme.textColor && { color: theme.textColor }
                ], children: message.text }))] }, message.id));
    return (_jsxs(SafeAreaView, { style: [styles.container, theme.backgroundColor && { backgroundColor: theme.backgroundColor }], children: [_jsx(StatusBar, { barStyle: "dark-content", backgroundColor: "#FFFFFF" }), _jsxs(View, { style: styles.header, children: [_jsx(TouchableOpacity, { onPress: onClose, children: _jsx(MaterialIcons, { name: "close", size: 24, color: "#000000" }) }), _jsx(Image, { source: config.logoSource || rhbLogo, style: styles.rhbLogo, resizeMode: "contain" }), _jsx(TouchableOpacity, { children: _jsx(MaterialIcons, { name: "fullscreen", size: 24, color: "#000000" }) })] }), _jsxs(KeyboardAvoidingView, { style: styles.content, behavior: Platform.OS === 'ios' ? 'padding' : 'height', children: [_jsx(ScrollView, { ref: scrollViewRef, style: styles.messagesContainer, onContentSizeChange: () => { var _a; return (_a = scrollViewRef.current) === null || _a === void 0 ? void 0 : _a.scrollToEnd({ animated: true }); }, children: messages.map(renderMessage) }), !inputText.trim() && messages.length === 0 && (_jsx(View, { style: styles.promptsContainer, children: _jsx(ScrollView, { horizontal: true, showsHorizontalScrollIndicator: false, contentContainerStyle: styles.promptsScrollContent, children: suggestedPrompts.map((prompt, index) => (_jsxs(TouchableOpacity, { style: styles.promptCard, onPress: () => selectPrompt(prompt), children: [_jsx(Text, { style: styles.promptTitle, children: prompt.title }), _jsx(Text, { style: styles.promptDescription, children: prompt.description })] }, index))) }) })), _jsx(View, { style: styles.inputContainer, children: _jsxs(View, { style: styles.inputWrapper, children: [_jsx(TouchableOpacity, { style: styles.addButton, onPress: toggleBottomSheet, children: _jsx(MaterialIcons, { name: "add", size: 20, color: "#666666" }) }), _jsxs(View, { style: styles.textInputContainer, children: [_jsx(TextInput, { ref: textInputRef, style: styles.textInput, value: inputText, onChangeText: setInputText, placeholder: "Ask anything", placeholderTextColor: "#999999", multiline: true, maxLength: 1000, onFocus: () => setShowBottomSheet(false) }), _jsxs(View, { style: styles.inputActions, children: [!inputText.trim() && (_jsx(TouchableOpacity, { style: styles.micButton, children: _jsx(MaterialIcons, { name: "mic", size: 20, color: "#666666" }) })), _jsx(TouchableOpacity, { style: [styles.sendButton, inputText.trim() ? styles.sendButtonActive : null], onPress: sendMessage, disabled: !inputText.trim(), children: _jsx(MaterialIcons, { name: "send", size: 20, color: inputText.trim() ? "#FFFFFF" : "#666666" }) })] })] })] }) }), renderBottomSheet()] }), _jsx(ImagePreviewModal, { visible: showImagePreview, imageUri: previewImageUri, onClose: () => setShowImagePreview(false), onSend: handleImageWithContext })] }));
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
        backgroundColor: '#FFFFFF',
    },
    rhbLogo: {
        height: 32,
        width: 80,
    },
    content: {
        flex: 1,
    },
    messagesContainer: {
        flex: 1,
        paddingHorizontal: 16,
    },
    promptsContainer: {
        paddingVertical: 12,
    },
    promptsScrollContent: {
        paddingHorizontal: 16,
        gap: 12,
    },
    promptCard: {
        backgroundColor: '#F5F5F5',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E5E5',
        minWidth: 200,
    },
    promptTitle: {
        color: '#333333',
        fontSize: 16,
        fontWeight: 'bold',
        lineHeight: 22,
        marginBottom: 4,
    },
    promptDescription: {
        color: '#666666',
        fontSize: 14,
        lineHeight: 18,
    },
    messageContainer: {
        marginVertical: 8,
        maxWidth: '80%',
    },
    userMessage: {
        alignSelf: 'flex-end',
        backgroundColor: '#007AFF',
        borderRadius: 16,
        borderBottomRightRadius: 4,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    aiMessage: {
        alignSelf: 'flex-start',
        backgroundColor: '#F5F5F5',
        borderRadius: 16,
        borderBottomLeftRadius: 4,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: '#E5E5E5',
    },
    messageText: {
        fontSize: 16,
        lineHeight: 20,
    },
    userMessageText: {
        color: '#FFFFFF',
    },
    aiMessageText: {
        color: '#333333',
    },
    inputContainer: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E5E5E5',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 12,
    },
    addButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E5E5E5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    textInputContainer: {
        flex: 1,
        backgroundColor: '#F5F5F5',
        borderRadius: 25,
        borderWidth: 1,
        borderColor: '#E5E5E5',
        paddingLeft: 16,
        paddingRight: 4,
        paddingVertical: 4,
        minHeight: 50,
        flexDirection: 'row',
        alignItems: 'flex-end',
    },
    textInput: {
        flex: 1,
        color: '#333333',
        fontSize: 16,
        maxHeight: 120,
        paddingVertical: 8,
        paddingHorizontal: 8,
        textAlignVertical: 'top',
    },
    inputActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingBottom: 4,
    },
    micButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#E5E5E5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#E5E5E5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonActive: {
        backgroundColor: '#007AFF',
    },
    bottomSheet: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderTopWidth: 1,
        borderTopColor: '#E5E5E5',
        paddingBottom: 34,
        paddingTop: 12,
        minHeight: 200,
    },
    bottomSheetHandle: {
        width: 36,
        height: 4,
        backgroundColor: '#E5E5E5',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 20,
    },
    shortcutsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 32,
        paddingVertical: 20,
    },
    shortcutButton: {
        alignItems: 'center',
        minWidth: 60,
    },
    shortcutIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    shortcutLabel: {
        fontSize: 14,
        color: '#333333',
        textAlign: 'center',
    },
    messageImage: {
        width: 200,
        height: 150,
        borderRadius: 8,
        marginBottom: 8,
    },
    fileContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
        gap: 8,
    },
    audioContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
        gap: 8,
    },
    fileName: {
        fontSize: 14,
        fontWeight: '500',
    },
});
export default ChatScreen;
