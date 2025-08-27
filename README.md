# RHB Agent Demo App

This is a sample React Native Expo application demonstrating the integration of the **RHB Chat SDK**.

## Project Structure

```
umd-agent/
├── App.js                          # Main demo application
├── packages/
│   └── rhb-chat-sdk/              # Standalone SDK package
│       ├── src/
│       │   ├── components/
│       │   │   ├── ChatScreen.tsx
│       │   │   └── FloatingChatButton.tsx
│       │   ├── types/
│       │   │   └── index.ts
│       │   └── index.ts
│       ├── package.json
│       ├── tsconfig.json
│       └── README.md
└── ...other expo files
```

## Features Demonstrated

### 🚀 SDK Integration
- How to import and configure the RHB Chat SDK
- Custom message handlers for backend integration
- Custom media upload handlers
- Theme customization
- Custom suggested prompts

### 💬 Chat Features
- **Real-time Messaging**: Interactive chat interface
- **Rich Media Support**: 
  - 📷 Camera capture
  - 🖼️ Photo library selection
  - 📁 File attachments
  - 🎤 Voice messages
- **Smart Suggestions**: Contextual prompt cards
- **Responsive Design**: Works on all screen sizes

### 🎨 Customization
- **Theming**: Custom colors and styling
- **Branding**: Logo integration (when available)
- **Prompts**: Banking-specific suggested actions

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- Bun package manager
- iOS Simulator or Android Emulator
- Expo CLI

### Installation

1. **Clone and install dependencies:**
   ```bash
   cd umd-agent
   bun install
   ```

2. **Build the SDK (optional for development):**
   ```bash
   cd packages/rhb-chat-sdk
   bun run build
   ```

3. **Start the development server:**
   ```bash
   bun run ios    # for iOS
   bun run android # for Android
   ```

## SDK Usage Example

The demo app shows how to integrate the SDK in your own application:

```tsx
import { ChatScreen, FloatingChatButton, ChatConfig } from './packages/rhb-chat-sdk/src';

// Custom configuration
const chatConfig: ChatConfig = {
  onMessageSend: async (message: string) => {
    // Your backend integration
    return await sendMessageToAPI(message);
  },
  onMediaUpload: async (type, uri, description) => {
    // Your media handling
    await uploadMediaToAPI(type, uri, description);
  },
  theme: {
    primaryColor: '#007AFF',
    userBubbleColor: '#007AFF',
  }
};

// Usage in component
<ChatScreen onClose={closeChat} config={chatConfig} />
```

## Available Scripts

- `bun run ios` - Start iOS development build
- `bun run android` - Start Android development build
- `bun run web` - Start web development build
- `bun run start` - Start development server

## SDK Development

To work on the SDK itself:

1. **Navigate to SDK directory:**
   ```bash
   cd packages/rhb-chat-sdk
   ```

2. **Install dependencies:**
   ```bash
   bun install
   ```

3. **Watch for changes:**
   ```bash
   bun run watch
   ```

4. **Build for production:**
   ```bash
   bun run build
   ```

## Backend Integration

The demo app includes examples of how to integrate with your backend:

### Message Handling
```tsx
const handleMessageSend = async (message: string): Promise<string> => {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message })
  });
  return response.json();
};
```

### Media Upload
```tsx
const handleMediaUpload = async (type: string, uri: string, description: string) => {
  const formData = new FormData();
  formData.append('file', { uri, type, name: description });
  
  await fetch('/api/upload', {
    method: 'POST',
    body: formData
  });
};
```

## Permissions

The app requires the following permissions:

### iOS
- Camera usage
- Photo library access
- Microphone access

### Android
- Camera permission
- External storage read
- Audio recording

These are handled automatically by the SDK.

## Testing

Test the following functionality in the demo app:

1. **Floating Button**: Tap the blue chat button
2. **Suggested Prompts**: Try the banking-specific prompts
3. **Text Messages**: Send and receive messages
4. **Media Attachments**:
   - Take a photo with camera
   - Select from photo library
   - Upload files
   - Record voice messages
5. **UI Interactions**:
   - Keyboard handling
   - Bottom sheet for attachments
   - Message bubbles and styling

## Production Deployment

To use the SDK in production:

1. **Extract the SDK**: Copy `packages/rhb-chat-sdk` to your package repository
2. **Publish to NPM**: `npm publish` (if making it public)
3. **Install in your app**: `npm install rhb-chat-sdk`
4. **Configure for your backend**: Update message and media handlers

## Troubleshooting

### Common Issues

1. **Metro bundler issues**: Clear cache with `npx expo start -c`
2. **iOS build errors**: Run `cd ios && pod install`
3. **Permission errors**: Check device settings for camera/microphone access
4. **SDK import errors**: Ensure TypeScript compilation completed

### Debug Mode

Enable debug mode in the demo app to see console logs for:
- Message sending
- Media uploads  
- SDK lifecycle events

## Architecture

The SDK is designed as a standalone package that can be:

- **Imported locally** (as shown in demo)
- **Published to NPM** for wider distribution
- **Integrated into any React Native/Expo app**
- **Customized per application needs**

## License

MIT License - see LICENSE file for details.

---

**Happy coding!** 🚀