import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Modal } from 'react-native';
import FloatingChatButton from './components/FloatingChatButton';
import ChatScreen from './components/ChatScreen';

export default function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const openChat = () => setIsChatOpen(true);
  const closeChat = () => setIsChatOpen(false);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome to UMD Agent</Text>
      <Text style={styles.subtext}>Your AI-powered assistant</Text>
      <StatusBar style="auto" />
      
      <FloatingChatButton onPress={openChat} />
      
      <Modal
        visible={isChatOpen}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <ChatScreen onClose={closeChat} />
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
