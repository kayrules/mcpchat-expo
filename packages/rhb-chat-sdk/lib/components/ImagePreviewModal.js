import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, Modal, StyleSheet, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
const ImagePreviewModal = ({ visible, imageUri, onClose, onSend, }) => {
    const [context, setContext] = useState('');
    const handleSend = () => {
        onSend(imageUri, context);
        setContext(''); // Clear context for next time
        onClose();
    };
    const handleClose = () => {
        setContext(''); // Clear context when closing
        onClose();
    };
    return (_jsx(Modal, { visible: visible, animationType: "slide", presentationStyle: "pageSheet", children: _jsx(SafeAreaView, { style: styles.container, children: _jsxs(KeyboardAvoidingView, { behavior: Platform.OS === 'ios' ? 'padding' : 'height', style: styles.keyboardView, children: [_jsxs(View, { style: styles.header, children: [_jsx(TouchableOpacity, { onPress: handleClose, style: styles.closeButton, children: _jsx(MaterialIcons, { name: "close", size: 24, color: "#333" }) }), _jsx(Text, { style: styles.headerTitle, children: "Add Context" }), _jsx(TouchableOpacity, { onPress: handleSend, style: [styles.sendButton, !context.trim() && styles.sendButtonDisabled], disabled: !context.trim(), children: _jsx(MaterialIcons, { name: "send", size: 24, color: context.trim() ? "#007AFF" : "#ccc" }) })] }), _jsxs(ScrollView, { style: styles.content, children: [_jsx(View, { style: styles.imageContainer, children: _jsx(Image, { source: { uri: imageUri }, style: styles.image, resizeMode: "contain" }) }), _jsxs(View, { style: styles.inputContainer, children: [_jsx(Text, { style: styles.inputLabel, children: "What would you like to know about this image?" }), _jsx(TextInput, { style: styles.textInput, multiline: true, placeholder: "Describe what you want to analyze or ask about this image...", placeholderTextColor: "#999", value: context, onChangeText: setContext, maxLength: 500, autoFocus: true }), _jsxs(Text, { style: styles.charCount, children: [context.length, "/500"] })] }), _jsxs(View, { style: styles.suggestionsContainer, children: [_jsx(Text, { style: styles.suggestionsTitle, children: "Quick suggestions:" }), _jsxs(View, { style: styles.suggestionButtons, children: [_jsx(TouchableOpacity, { style: styles.suggestionButton, onPress: () => setContext("What is this document?"), children: _jsx(Text, { style: styles.suggestionText, children: "What is this document?" }) }), _jsx(TouchableOpacity, { style: styles.suggestionButton, onPress: () => setContext("Extract key information from this"), children: _jsx(Text, { style: styles.suggestionText, children: "Extract key information" }) }), _jsx(TouchableOpacity, { style: styles.suggestionButton, onPress: () => setContext("Help me understand this receipt"), children: _jsx(Text, { style: styles.suggestionText, children: "Help me understand this receipt" }) }), _jsx(TouchableOpacity, { style: styles.suggestionButton, onPress: () => setContext("Is this a legitimate document?"), children: _jsx(Text, { style: styles.suggestionText, children: "Is this legitimate?" }) })] })] })] })] }) }) }));
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    keyboardView: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    closeButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    sendButton: {
        padding: 8,
    },
    sendButtonDisabled: {
        opacity: 0.5,
    },
    content: {
        flex: 1,
    },
    imageContainer: {
        padding: 16,
        alignItems: 'center',
    },
    image: {
        width: '100%',
        height: 300,
        borderRadius: 12,
        backgroundColor: '#f5f5f5',
    },
    inputContainer: {
        padding: 16,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
        marginBottom: 12,
    },
    textInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#333',
        minHeight: 100,
        textAlignVertical: 'top',
        backgroundColor: '#f9f9f9',
    },
    charCount: {
        textAlign: 'right',
        marginTop: 8,
        fontSize: 12,
        color: '#999',
    },
    suggestionsContainer: {
        padding: 16,
        paddingTop: 0,
    },
    suggestionsTitle: {
        fontSize: 14,
        fontWeight: '500',
        color: '#666',
        marginBottom: 12,
    },
    suggestionButtons: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    suggestionButton: {
        backgroundColor: '#f0f8ff',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#007AFF',
    },
    suggestionText: {
        fontSize: 14,
        color: '#007AFF',
        fontWeight: '500',
    },
});
export default ImagePreviewModal;
