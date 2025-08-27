# RHB Chat SDK

A comprehensive React Native and Expo SDK for implementing AI-powered chat functionality with rich media support, specifically designed for RHB Banking Group applications.

## Features

- 💬 **Full-featured Chat Interface** - Complete chat UI with message bubbles, timestamps, and typing indicators
- 🎥 **Rich Media Support** - Camera capture, photo selection, file uploads, and voice messages
- 🎨 **Customizable Theming** - Configurable colors, styles, and branding
- 📱 **Cross-platform** - Works on iOS and Android via React Native and Expo
- 🔧 **Easy Integration** - Simple API with sensible defaults
- ♿ **Accessibility** - Built with accessibility best practices
- 🚀 **TypeScript Support** - Fully typed for better development experience

## Installation

```bash
npm install rhb-chat-sdk
# or
yarn add rhb-chat-sdk
```

### Peer Dependencies

Make sure you have these peer dependencies installed:

```bash
npm install @expo/vector-icons expo-image-picker expo-document-picker expo-audio expo-media-library
```

✅ **Zero Native Setup Required** - All dependencies are Expo managed modules!

## Quick Start

```tsx
import React, { useState } from 'react';
import { Modal } from 'react-native';
import { ChatScreen, FloatingChatButton, ChatConfig } from 'rhb-chat-sdk';

export default function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const chatConfig: ChatConfig = {
    onMessageSend: async (message: string) => {
      // Handle message sending to your backend
      return "Thanks for your message!";
    },
    theme: {
      primaryColor: '#007AFF',
      userBubbleColor: '#007AFF',
    }
  };

  return (
    <>
      <FloatingChatButton onPress={() => setIsChatOpen(true)} />
      
      <Modal visible={isChatOpen} presentationStyle="fullScreen">
        <ChatScreen 
          onClose={() => setIsChatOpen(false)} 
          config={chatConfig} 
        />
      </Modal>
    </>
  );
}
```

## API Reference

### Components

#### `<ChatScreen />`

The main chat interface component.

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `onClose` | `() => void` | ✅ | Callback when chat should be closed |
| `config` | `ChatConfig` | ❌ | Configuration object for customization |

#### `<FloatingChatButton />`

A floating action button to open the chat.

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `onPress` | `() => void` | ✅ | Callback when button is pressed |
| `style` | `ViewStyle` | ❌ | Additional styling for the button |

### Configuration

#### `ChatConfig`

Configuration object for customizing the chat experience.

```tsx
interface ChatConfig {
  logoSource?: any;
  suggestedPrompts?: SuggestedPrompt[];
  onMessageSend?: (message: string) => Promise<string>;
  onMediaUpload?: (type: string, uri: string, description: string) => Promise<void>;
  theme?: ChatTheme;
}
```

#### `ChatTheme`

Theme configuration for styling the chat interface.

```tsx
interface ChatTheme {
  primaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
  userBubbleColor?: string;
  aiBubbleColor?: string;
}
```

#### `SuggestedPrompt`

Pre-defined prompts shown when the chat is empty.

```tsx
interface SuggestedPrompt {
  title: string;
  description: string;
}
```

## Advanced Usage

### Custom Message Handling

```tsx
const handleMessageSend = async (message: string): Promise<string> => {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
    
    const data = await response.json();
    return data.reply;
  } catch (error) {
    console.error('Chat error:', error);
    return "Sorry, I'm having trouble connecting right now.";
  }
};
```

### Custom Media Handling

```tsx
const handleMediaUpload = async (type: string, uri: string, description: string) => {
  const formData = new FormData();
  formData.append('file', {
    uri,
    type: type === 'image' ? 'image/jpeg' : 'application/octet-stream',
    name: description
  } as any);

  await fetch('/api/upload', {
    method: 'POST',
    body: formData,
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};
```

### Custom Theming

```tsx
const customTheme = {
  primaryColor: '#FF6B35',
  backgroundColor: '#F8F9FA',
  textColor: '#212529',
  userBubbleColor: '#FF6B35',
  aiBubbleColor: '#E9ECEF'
};
```

### Custom Suggested Prompts

```tsx
const customPrompts = [
  {
    title: 'Check Account Balance',
    description: 'View your current balance'
  },
  {
    title: 'Transfer Money',
    description: 'Send money to contacts'
  },
  {
    title: 'Pay Bills',
    description: 'Pay utilities and services'
  }
];
```

## Media Features

The SDK supports four types of media attachments:

### 📷 Camera
- Captures photos directly from device camera
- Configurable image quality and size limits
- Automatic permission handling

### 🖼️ Photos
- Selects images from device photo library
- Support for multiple image formats
- Image compression and optimization

### 📁 Files
- Universal file picker for any document type
- Secure file handling and storage
- File type validation and size limits

### 🎤 Voice Messages
- High-quality audio recording
- Real-time recording indicator
- Configurable audio formats and quality

## Permissions

The SDK handles all permissions automatically through Expo managed workflow! 🎉

- **Camera**: Automatically requested when taking photos
- **Photo Library**: Automatically requested when selecting images
- **Microphone**: Automatically requested when recording voice messages
- **File System**: Automatically handled by Expo

### For Expo Managed Projects
No additional configuration required! Permissions are handled automatically.

### For Bare React Native Projects
If using in a bare React Native project, you may need to add these permissions:

#### iOS (`ios/Info.plist`)
```xml
<key>NSCameraUsageDescription</key>
<string>This app needs camera access to take photos for chat</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>This app needs photo library access to select images for chat</string>
<key>NSMicrophoneUsageDescription</key>
<string>This app needs microphone access to record voice messages</string>
```

#### Android (`android/app/src/main/AndroidManifest.xml`)
```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
```

## TypeScript Support

The SDK is written in TypeScript and provides full type definitions:

```tsx
import { 
  ChatScreen, 
  FloatingChatButton, 
  ChatConfig, 
  ChatMessage,
  SuggestedPrompt 
} from 'rhb-chat-sdk';
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:

- 📧 Email: developer-support@rhbgroup.com
- 🐛 Issues: [GitHub Issues](https://github.com/rhb-banking/rhb-chat-sdk/issues)
- 📖 Documentation: [Full Documentation](https://rhb-banking.github.io/rhb-chat-sdk)

---

Made with ❤️ by RHB Banking Group