import React, { useState, useRef, useEffect } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { AudioRecorder, AudioPlayer } from 'expo-audio';
import * as MediaLibrary from 'expo-media-library';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';
import { ChatScreenProps, ChatMessage, SuggestedPrompt } from '../types';
import ImagePreviewModal from './ImagePreviewModal';
import WebhookService from '../services/webhook';

const rhbLogo = require('../../assets/rhblogo.png');

const defaultPrompts: SuggestedPrompt[] = [
  {
    title: 'How can you help me?',
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
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [previewImageUri, setPreviewImageUri] = useState<string>('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechPermissionGranted, setSpeechPermissionGranted] = useState(false);
  const [sessionId] = useState(() => new WebhookService().generateSessionId());
  const scrollViewRef = useRef<ScrollView>(null);
  const textInputRef = useRef<TextInput>(null);
  const webhookService = new WebhookService();

  const suggestedPrompts = config.suggestedPrompts || defaultPrompts;
  const theme = config.theme || {};

  // Speech Recognition Event Handlers
  useSpeechRecognitionEvent('result', (event) => {
    console.log('🎤 Speech result:', event.results);
    if (event.results && event.results.length > 0) {
      const transcript = event.results[0].transcript;
      if (transcript) {
        console.log('🎤 Transcript:', transcript);
        setInputText(transcript);
      }
    }
  });

  useSpeechRecognitionEvent('end', () => {
    console.log('🎤 Speech recognition ended');
    setIsListening(false);
  });

  useSpeechRecognitionEvent('start', () => {
    console.log('🎤 Speech recognition started');
    setIsListening(true);
  });

  useSpeechRecognitionEvent('error', (event) => {
    console.error('🎤 Speech recognition error:', event.error);
    setIsListening(false);
    
    let errorMessage = 'Voice input failed. Please try again.';
    if (event.error === 'not-allowed') {
      errorMessage = 'Microphone permission denied. Please enable microphone access in settings.';
    } else if (event.error === 'network') {
      errorMessage = 'Network error during voice input. Please check your internet connection.';
    } else if (event.error === 'no-speech') {
      errorMessage = 'No speech detected. Please try speaking again.';
    }
    
    Alert.alert('Voice Input Error', errorMessage);
  });

  // Initialize speech recognition on component mount
  useEffect(() => {
    const initializeSpeechRecognition = async () => {
      try {
        // Check if ExpoSpeechRecognitionModule is available
        if (!ExpoSpeechRecognitionModule) {
          console.warn('🎤 Speech recognition module not available - native module not built');
          return;
        }

        // Check if getAvailableAsync method exists
        if (typeof ExpoSpeechRecognitionModule.getAvailableAsync !== 'function') {
          console.warn('🎤 Speech recognition methods not available - app needs native rebuild');
          return;
        }

        // Check if speech recognition is available
        const isAvailable = await ExpoSpeechRecognitionModule.getAvailableAsync();
        console.log('🎤 Speech recognition available:', isAvailable);
        
        if (isAvailable) {
          // Check current permissions without requesting
          const permissions = await ExpoSpeechRecognitionModule.getPermissionsAsync();
          if (permissions.granted) {
            setSpeechPermissionGranted(true);
            console.log('🎤 Speech recognition permissions already granted');
          }
        }
      } catch (error) {
        console.error('🎤 Error initializing speech recognition:', error);
        console.warn('🎤 Speech recognition will be disabled - native module may need to be rebuilt');
      }
    };

    initializeSpeechRecognition();
  }, []);

  const sendMessage = async () => {
    if (inputText.trim() === '' || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const messageText = inputText;
    setInputText('');
    setIsLoading(true);

    try {
      // Use webhook service to send text message
      const aiResponse = await webhookService.sendTextMessage(messageText, sessionId);
      const aiMessage: ChatMessage = {
        id: Date.now() + 1,
        text: aiResponse,
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      // Fallback error message
      const errorMessage: ChatMessage = {
        id: Date.now() + 1,
        text: 'Sorry, I encountered an error processing your message. Please try again.',
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
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
          const resizedImage = await manipulateAsync(
            asset.uri,
            [
              { resize: { width: 1024 } }, // Resize to max width of 1024px (maintains aspect ratio)
            ],
            {
              compress: 0.8, // 80% quality
              format: SaveFormat.JPEG,
            }
          );
          
          console.log('📷 Camera asset (resized):', {
            uri: resizedImage.uri,
            width: resizedImage.width,
            height: resizedImage.height,
          });
          
          // Show preview modal with resized image
          setPreviewImageUri(resizedImage.uri);
          setShowImagePreview(true);
          setShowBottomSheet(false); // Close bottom sheet
        } catch (resizeError) {
          console.error('Failed to resize image:', resizeError);
          // Fallback to original image if resize fails
          setPreviewImageUri(asset.uri);
          setShowImagePreview(true);
          setShowBottomSheet(false);
        }
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
    } catch (error) {
      console.error('Photo picker error:', error);
      Alert.alert('Error', 'Failed to select photo');
    }
  };

  const handleImageWithContext = async (imageUri: string, context: string) => {
    try {
      console.log('🚀 handleImageWithContext called with:', { imageUri, context });
      console.log('📷 Processing image with webhook:', context);
      
      // Create message with image and context
      const imageMessage: ChatMessage = {
        id: Date.now(),
        text: context || 'Image uploaded',
        sender: 'user',
        timestamp: new Date(),
        mediaType: 'image',
        mediaUri: imageUri,
        userContext: context,
      };
      
      setMessages(prev => [...prev, imageMessage]);
      setShowImagePreview(false); // Close the preview modal
      setIsLoading(true);

      try {
        // Send image to webhook service
        const aiResponse = await webhookService.sendFileMessage(imageUri, sessionId);
        
        const aiMessage: ChatMessage = {
          id: Date.now() + 1,
          text: aiResponse,
          sender: 'ai',
          timestamp: new Date(),
          metadata: {
            processingType: 'custom'
          }
        };
        
        setMessages(prev => [...prev, aiMessage]);
        
      } catch (error) {
        console.error('Webhook file processing failed:', error);
        // Fallback error message
        const errorMessage: ChatMessage = {
          id: Date.now() + 1,
          text: `I can see your image with the question: "${context}". However, I'm having trouble processing it right now. Please try again or ask me something else.`,
          sender: 'ai',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Image handling failed:', error);
      // Fallback to regular image message if everything fails
      const fallbackMessage: ChatMessage = {
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
      const errorMessage: ChatMessage = {
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
    } catch (error) {
      console.error('File picker error:', error);
      Alert.alert('Error', 'Failed to pick file');
    }
  };

  // Speech Recognition Setup and Functions
  const requestSpeechPermissions = async (): Promise<boolean> => {
    try {
      // Check if module is available
      if (!ExpoSpeechRecognitionModule || typeof ExpoSpeechRecognitionModule.requestPermissionsAsync !== 'function') {
        console.warn('🎤 Speech recognition permissions not available - native module needs rebuild');
        Alert.alert(
          'Speech Recognition Unavailable',
          'Voice input requires the app to be rebuilt with speech recognition support. Please rebuild the app to enable this feature.',
          [{ text: 'OK' }]
        );
        return false;
      }

      console.log('🎤 Requesting speech recognition permissions...');
      const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      
      console.log('🎤 Permission result:', result);
      
      if (result.granted) {
        setSpeechPermissionGranted(true);
        console.log('✅ Speech recognition permissions granted');
        return true;
      } else {
        setSpeechPermissionGranted(false);
        console.warn('❌ Speech recognition permissions denied');
        
        Alert.alert(
          'Microphone Permission Required',
          'Voice input requires microphone access. Please enable microphone permissions in your device settings to use speech-to-text.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Settings', onPress: () => {
              Alert.alert('Enable Microphone', 'Go to Settings > Privacy & Security > Microphone and enable access for this app.');
            }}
          ]
        );
        return false;
      }
    } catch (error) {
      console.error('🎤 Error requesting speech permissions:', error);
      setSpeechPermissionGranted(false);
      return false;
    }
  };

  const startSpeechRecognition = async () => {
    try {
      // Check if module is available
      if (!ExpoSpeechRecognitionModule || typeof ExpoSpeechRecognitionModule.start !== 'function') {
        throw new Error('Speech recognition module not available - app needs native rebuild');
      }

      if (!speechPermissionGranted) {
        const granted = await requestSpeechPermissions();
        if (!granted) return;
      }

      console.log('🎤 Starting speech recognition...');
      setIsListening(true);

      await ExpoSpeechRecognitionModule.start({
        lang: 'en-US',
        interimResults: true,
        continuous: false,
        maxAlternatives: 1,
      });

    } catch (error) {
      console.error('🎤 Failed to start speech recognition:', error);
      setIsListening(false);
      
      if (error.message.includes('native rebuild')) {
        Alert.alert(
          'Speech Recognition Unavailable', 
          'Voice input requires the app to be rebuilt. Please rebuild the app to enable speech recognition.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Speech Recognition Error', 'Failed to start voice input. Please try again.');
      }
    }
  };

  const stopSpeechRecognition = async () => {
    try {
      console.log('🎤 Stopping speech recognition...');
      
      // Check if module is available
      if (!ExpoSpeechRecognitionModule) {
        console.warn('🎤 Speech recognition module not available for stopping');
        setIsListening(false);
        return;
      }
      
      await ExpoSpeechRecognitionModule.stop();
      setIsListening(false);
    } catch (error) {
      console.error('🎤 Failed to stop speech recognition:', error);
      setIsListening(false);
    }
  };

  const handleMicPress = async () => {
    try {
      if (isListening) {
        await stopSpeechRecognition();
      } else {
        await startSpeechRecognition();
      }
    } catch (error) {
      console.error('🎤 Microphone error:', error);
      setIsListening(false);
      Alert.alert(
        'Microphone Error', 
        'Voice input is not available. Please ensure microphone permissions are granted and the app is properly configured.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleVoice = async () => {
    // Use speech-to-text instead of audio recording for better UX
    if (isListening) {
      await stopSpeechRecognition();
    } else {
      await startSpeechRecognition();
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
    console.log('🔄 addMediaMessage called with:', { type, uri, description });
    
    const mediaMessage: ChatMessage = {
      id: Date.now(),
      text: description || `${type} message`,
      sender: 'user',
      timestamp: new Date(),
      mediaType: type as 'image' | 'file' | 'audio',
      mediaUri: uri,
    };

    setMessages(prev => [...prev, mediaMessage]);

    // Send file to webhook service if URI is provided
    if (uri && (type === 'file' || type === 'image')) {
      console.log('📤 addMediaMessage: Sending to webhook service');
      setIsLoading(true);
      try {
        const aiResponse = await webhookService.sendFileMessage(uri, sessionId);
        const aiMessage: ChatMessage = {
          id: Date.now() + 1,
          text: aiResponse,
          sender: 'ai',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiMessage]);
      } catch (error) {
        console.error('Error handling media upload:', error);
        // Fallback response
        const errorMessage: ChatMessage = {
          id: Date.now() + 1,
          text: `I received your ${type} but had trouble processing it. Please try again.`,
          sender: 'ai',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    } else {
      // For audio or when no URI, provide basic response
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
    } else {
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
        textInputRef.current?.focus();
      }, 100);
    }
  };

  const renderBottomSheet = () => {
    if (!showBottomSheet) return null;

    const shortcuts = [
      { icon: 'camera-alt', label: 'Camera', type: 'camera' },
      { icon: 'photo-library', label: 'Photos', type: 'photos' },
      { icon: 'folder', label: 'Files', type: 'files' },
      { icon: isListening ? 'mic-off' : 'mic', label: isListening ? 'Stop' : 'Voice', type: 'voice' },
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
              <View style={[
                styles.shortcutIconContainer,
                shortcut.type === 'voice' && isListening && styles.shortcutIconListening
              ]}>
                <MaterialIcons 
                  name={shortcut.icon as any} 
                  size={24} 
                  color={shortcut.type === 'voice' && isListening ? "#FF4444" : (theme.primaryColor || "#007AFF")} 
                />
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
      {message.sender === 'ai' ? (
        <Text style={[
          styles.messageText,
          styles.aiMessageText,
          theme.textColor && { color: theme.textColor }
        ]}>{message.text}</Text>
      ) : (
        <Text style={[
          styles.messageText,
          message.sender === 'user' ? styles.userMessageText : styles.aiMessageText,
          theme.textColor && { color: theme.textColor }
        ]}>{message.text}</Text>
      )}
    </View>
  );

  const renderLoadingIndicator = () => (
    <View style={[styles.messageContainer, styles.aiMessage]}>
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#0066CC" />
        <Text style={[styles.messageText, styles.loadingText]}>RHB.ai is typing...</Text>
      </View>
    </View>
  );

  const renderListeningIndicator = () => (
    <View style={[styles.messageContainer, styles.aiMessage, styles.listeningMessage]}>
      <View style={styles.loadingContainer}>
        <MaterialIcons name="mic" size={20} color="#0066CC" />
        <Text style={[styles.messageText, styles.loadingText]}>Listening...</Text>
      </View>
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
          {isLoading && renderLoadingIndicator()}
          {isListening && renderListeningIndicator()}
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
                  <TouchableOpacity 
                    style={[styles.micButton, isListening && styles.micButtonActive]} 
                    onPress={handleMicPress}
                    disabled={isLoading}
                  >
                    <MaterialIcons 
                      name={isListening ? "mic-off" : "mic"} 
                      size={20} 
                      color={isListening ? "#FF4444" : "#666666"} 
                    />
                  </TouchableOpacity>
                )}
                
                <TouchableOpacity 
                  style={[styles.sendButton, inputText.trim() && !isLoading ? styles.sendButtonActive : null]}
                  onPress={sendMessage}
                  disabled={!inputText.trim() || isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator size={20} color="#666666" />
                  ) : (
                    <MaterialIcons name="send" size={20} color={inputText.trim() && !isLoading ? "#FFFFFF" : "#666666"} />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
        
        {renderBottomSheet()}
      </KeyboardAvoidingView>

      {/* Image Preview Modal */}
      <ImagePreviewModal
        visible={showImagePreview}
        imageUri={previewImageUri}
        onClose={() => setShowImagePreview(false)}
        onSend={handleImageWithContext}
      />
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
  micButtonActive: {
    backgroundColor: '#FFE5E5',
    borderWidth: 2,
    borderColor: '#FF4444',
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
  shortcutIconListening: {
    backgroundColor: '#FFE5E5',
    borderWidth: 2,
    borderColor: '#FF4444',
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
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: '#666666',
    fontStyle: 'italic',
  },
  listeningMessage: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
  },
});

export default ChatScreen;