import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Modal } from 'react-native';
import { ChatScreen, FloatingChatButton, ChatConfig } from 'rhb-chat-sdk';

// Sample integration showing how to use the SDK
export default function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const openChat = () => setIsChatOpen(true);
  const closeChat = () => setIsChatOpen(false);

  // Custom message handler
  const handleMessageSend = async (message: string): Promise<string> => {
    // Simulate API call to your backend
    console.log('Sending message to backend:', message);
    
    // Mock AI response
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (message.toLowerCase().includes('rhb')) {
      return "I can help you with RHB banking services. What would you like to know?";
    }
    
    return "Thank you for your message! How can I assist you with your banking needs?";
  };

  // Custom media upload handler
  const handleMediaUpload = async (type: string, uri: string, description: string): Promise<void> => {
    console.log('Uploading media:', { type, uri, description });
    // Handle media upload to your backend
  };

  // SDK Configuration
  const chatConfig: ChatConfig = {
    // logoSource: require('./assets/rhblogo.png'), // Uncomment when logo is available
    onMessageSend: handleMessageSend,
    onMediaUpload: handleMediaUpload,
    theme: {
      primaryColor: '#007AFF',
      userBubbleColor: '#007AFF',
      aiBubbleColor: '#F5F5F5',
    },
    suggestedPrompts: [
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
    ]
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>RHB Agent Demo App</Text>
      <Text style={styles.subtext}>Sample integration of RHB Chat SDK</Text>
      <StatusBar style="auto" />
      
      <FloatingChatButton onPress={openChat} />
      
      <Modal
        visible={isChatOpen}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <ChatScreen onClose={closeChat} config={chatConfig} />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtext: {
    fontSize: 16,
    color: '#666',
  },
});
