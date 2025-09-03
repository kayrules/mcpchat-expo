import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export interface ImagePreviewModalProps {
  visible: boolean;
  imageUri: string;
  onClose: () => void;
  onSend: (imageUri: string, context: string) => void;
}

const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
  visible,
  imageUri,
  onClose,
  onSend,
}) => {
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

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Add Context</Text>
            <TouchableOpacity 
              onPress={handleSend} 
              style={[styles.sendButton, !context.trim() && styles.sendButtonDisabled]}
              disabled={!context.trim()}
            >
              <MaterialIcons name="send" size={24} color={context.trim() ? "#007AFF" : "#ccc"} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {/* Image Preview */}
            <View style={styles.imageContainer}>
              <Image source={{ uri: imageUri }} style={styles.image} resizeMode="contain" />
            </View>

            {/* Context Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>What would you like to know about this image?</Text>
              <TextInput
                style={styles.textInput}
                multiline
                placeholder="Describe what you want to analyze or ask about this image..."
                placeholderTextColor="#999"
                value={context}
                onChangeText={setContext}
                maxLength={500}
                autoFocus
              />
              <Text style={styles.charCount}>{context.length}/500</Text>
            </View>

            {/* Suggested Contexts */}
            <View style={styles.suggestionsContainer}>
              <Text style={styles.suggestionsTitle}>Quick suggestions:</Text>
              <View style={styles.suggestionButtons}>
                <TouchableOpacity 
                  style={styles.suggestionButton}
                  onPress={() => setContext("What is this document?")}
                >
                  <Text style={styles.suggestionText}>What is this document?</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.suggestionButton}
                  onPress={() => setContext("Extract key information from this")}
                >
                  <Text style={styles.suggestionText}>Extract key information</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.suggestionButton}
                  onPress={() => setContext("Help me understand this receipt")}
                >
                  <Text style={styles.suggestionText}>Help me understand this receipt</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.suggestionButton}
                  onPress={() => setContext("Is this a legitimate document?")}
                >
                  <Text style={styles.suggestionText}>Is this legitimate?</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
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