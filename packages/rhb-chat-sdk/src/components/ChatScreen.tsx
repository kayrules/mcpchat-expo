import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Image,
  Keyboard,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { AudioRecorder, AudioPlayer } from 'expo-audio';
import * as MediaLibrary from 'expo-media-library';
import { ChatScreenProps, ChatMessage, SuggestedPrompt } from '../types';

const rhbLogo = require('../../assets/rhblogo.png');

const defaultPrompts: SuggestedPrompt[] = [
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

const ChatScreen: React.FC<ChatScreenProps> = ({ onClose, config = {} }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [audioRecorder, setAudioRecorder] = useState<AudioRecorder | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const textInputRef = useRef<TextInput>(null);

  const suggestedPrompts = config.suggestedPrompts || defaultPrompts;
  const theme = config.theme || {};

  const sendMessage = async () => {
    if (inputText.trim() === '') return;

    const userMessage: ChatMessage = {
      id: Date.now(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    // Use custom message handler if provided
    if (config.onMessageSend) {
      try {
        const aiResponse = await config.onMessageSend(inputText);
        const aiMessage: ChatMessage = {
          id: Date.now() + 1,
          text: aiResponse,
          sender: 'ai',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiMessage]);
      } catch (error) {
        console.error('Error sending message:', error);
      }
    } else {
      // Default AI response
      setTimeout(() => {
        const aiMessage: ChatMessage = {
          id: Date.now() + 1,
          text: "I'm a demo AI assistant. I can help you with various tasks like creating content, analyzing data, and providing information.",
          sender: 'ai',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiMessage]);
      }, 1000);
    }
  };

  const selectPrompt = (prompt: SuggestedPrompt) => {
    setInputText(prompt.title);
  };

  const toggleBottomSheet = () => {
    if (!showBottomSheet) {
      // Show bottom sheet, hide keyboard
      Keyboard.dismiss();
      setShowBottomSheet(true);
    } else {
      // Hide bottom sheet, show keyboard
      setShowBottomSheet(false);
      setTimeout(() => {
        textInputRef.current?.focus();
      }, 100);
    }
  };

  const handleCamera = async () => {
    try {
      // Request camera permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required', 
          'Camera access is needed to take photos. Please enable camera permissions in your device settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => {
              // For Expo, you can't directly open settings, but provide guidance
              Alert.alert('Enable Permissions', 'Go to Settings > Privacy & Security > Camera and enable access for this app.');
            }}
          ]
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        addMediaMessage('image', asset.uri, 'Photo taken');
      }
    } catch (error) {
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
        addMediaMessage('image', asset.uri, 'Photo selected');
      }
    } catch (error) {
      console.error('Photo picker error:', error);
      Alert.alert('Error', 'Failed to select photo');
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
    } catch (error) {
      console.error('File picker error:', error);
      Alert.alert('Error', 'Failed to pick file');
    }
  };

  const handleVoice = async () => {
    if (isRecording) {
      stopRecording();
    } else {
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
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Error', 'Audio recording requires proper configuration. Please check the installation guide.');
    }
  };

  const stopRecording = async () => {
    if (!audioRecorder) return;

    try {
      await audioRecorder.stop();
      addMediaMessage('audio', undefined, 'Voice message');
      
      setAudioRecorder(null);
      setIsRecording(false);
    } catch (error) {
      console.error('Failed to stop recording:', error);
      Alert.alert('Error', 'Failed to stop recording');
    }
  };

  const addMediaMessage = async (type: string, uri?: string, description?: string) => {
    const mediaMessage: ChatMessage = {
      id: Date.now(),
      text: description || `${type} message`,
      sender: 'user',
      timestamp: new Date(),
      mediaType: type as 'image' | 'file' | 'audio',
      mediaUri: uri,
    };

    setMessages(prev => [...prev, mediaMessage]);

    // Use custom media handler if provided
    if (config.onMediaUpload) {
      try {
        await config.onMediaUpload(type, uri || '', description || '');
      } catch (error) {
        console.error('Error handling media upload:', error);
      }
    } else {
      // Default AI response
      setTimeout(() => {
        const aiMessage: ChatMessage = {
          id: Date.now() + 1,
          text: `I received your ${type}. How can I help you with it?`,
          sender: 'ai',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiMessage]);
      }, 1000);
    }
  };

  const handleShortcut = (type: string) => {
    setShowBottomSheet(false);
    
    // Refocus text input after closing bottom sheet
    setTimeout(() => {
      textInputRef.current?.focus();
    }, 100);

    // Handle each shortcut type
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
      case 'voice':
        handleVoice();
        break;
      default:
        console.log(`${type} selected`);
    }
  };

  const renderBottomSheet = () => {
    if (!showBottomSheet) return null;

    const shortcuts = [
      { icon: 'camera-alt', label: 'Camera', type: 'camera' },
      { icon: 'photo-library', label: 'Photos', type: 'photos' },
      { icon: 'folder', label: 'Files', type: 'files' },
      { icon: isRecording ? 'stop' : 'mic', label: isRecording ? 'Stop' : 'Voice', type: 'voice' },
    ];

    return (
      <View style={styles.bottomSheet}>
        <View style={styles.bottomSheetHandle} />
        <View style={styles.shortcutsContainer}>
          {shortcuts.map((shortcut, index) => (
            <TouchableOpacity
              key={index}
              style={styles.shortcutButton}
              onPress={() => handleShortcut(shortcut.type)}
            >
              <View style={styles.shortcutIconContainer}>
                <MaterialIcons name={shortcut.icon as any} size={24} color={theme.primaryColor || "#007AFF"} />
              </View>
              <Text style={styles.shortcutLabel}>{shortcut.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderMessage = (message: ChatMessage) => (
    <View
      key={message.id}
      style={[
        styles.messageContainer,
        message.sender === 'user' ? styles.userMessage : styles.aiMessage,
        message.sender === 'user' && theme.userBubbleColor && { backgroundColor: theme.userBubbleColor },
        message.sender === 'ai' && theme.aiBubbleColor && { backgroundColor: theme.aiBubbleColor },
      ]}
    >
      {message.mediaType === 'image' && message.mediaUri && (
        <Image 
          source={{ uri: message.mediaUri }} 
          style={styles.messageImage}
          resizeMode="cover"
        />
      )}
      {message.mediaType === 'file' && (
        <View style={styles.fileContainer}>
          <MaterialIcons name="insert-drive-file" size={24} color={message.sender === 'user' ? "#FFFFFF" : theme.primaryColor || "#007AFF"} />
          <Text style={[
            styles.fileName,
            message.sender === 'user' ? styles.userMessageText : styles.aiMessageText
          ]}>{message.text}</Text>
        </View>
      )}
      {message.mediaType === 'audio' && (
        <View style={styles.audioContainer}>
          <MaterialIcons name="audiotrack" size={24} color={message.sender === 'user' ? "#FFFFFF" : theme.primaryColor || "#007AFF"} />
          <Text style={[
            styles.fileName,
            message.sender === 'user' ? styles.userMessageText : styles.aiMessageText
          ]}>{message.text}</Text>
        </View>
      )}
      <Text style={[
        styles.messageText,
        message.sender === 'user' ? styles.userMessageText : styles.aiMessageText,
        theme.textColor && { color: theme.textColor }
      ]}>{message.mediaType ? message.text : message.text}</Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, theme.backgroundColor && { backgroundColor: theme.backgroundColor }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose}>
          <MaterialIcons name="close" size={24} color="#000000" />
        </TouchableOpacity>
        
        <Image 
          source={config.logoSource || rhbLogo} 
          style={styles.rhbLogo}
          resizeMode="contain"
        />
        
        <TouchableOpacity>
          <MaterialIcons name="fullscreen" size={24} color="#000000" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map(renderMessage)}
        </ScrollView>

        {/* Suggested Prompts Slider - Show only when no conversation and input is empty */}
        {!inputText.trim() && messages.length === 0 && (
          <View style={styles.promptsContainer}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.promptsScrollContent}
            >
              {suggestedPrompts.map((prompt, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.promptCard}
                  onPress={() => selectPrompt(prompt)}
                >
                  <Text style={styles.promptTitle}>{prompt.title}</Text>
                  <Text style={styles.promptDescription}>{prompt.description}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TouchableOpacity style={styles.addButton} onPress={toggleBottomSheet}>
              <MaterialIcons name="add" size={20} color="#666666" />
            </TouchableOpacity>
            
            <View style={styles.textInputContainer}>
              <TextInput
                ref={textInputRef}
                style={styles.textInput}
                value={inputText}
                onChangeText={setInputText}
                placeholder="Ask anything"
                placeholderTextColor="#999999"
                multiline
                maxLength={1000}
                onFocus={() => setShowBottomSheet(false)}
              />
              
              <View style={styles.inputActions}>
                {!inputText.trim() && (
                  <TouchableOpacity style={styles.micButton}>
                    <MaterialIcons name="mic" size={20} color="#666666" />
                  </TouchableOpacity>
                )}
                
                <TouchableOpacity 
                  style={[styles.sendButton, inputText.trim() ? styles.sendButtonActive : null]}
                  onPress={sendMessage}
                  disabled={!inputText.trim()}
                >
                  <MaterialIcons name="send" size={20} color={inputText.trim() ? "#FFFFFF" : "#666666"} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
        
        {renderBottomSheet()}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
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