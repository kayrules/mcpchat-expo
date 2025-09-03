# RHB Chat SDK Installation Guide

## Installation Methods

### Method 1: Local Path Installation (Development)

For development and testing, install directly from the local path:

```bash
# Install SDK from local path
npm install /path/to/rhb-chat-sdk --legacy-peer-deps

# Or if in monorepo structure:
npm install ./packages/rhb-chat-sdk --legacy-peer-deps
```

### Method 2: npm Registry Installation (Production)

For production use, install from npm registry:

```bash
npm install rhb-chat-sdk
```

## Prerequisites

This SDK requires the following permissions and dependencies to be configured by the host application.

## Required Dependencies

Install the peer dependencies:

```bash
npm install @expo/vector-icons expo-image-picker expo-document-picker expo-audio expo-media-library @react-native-ml-kit/text-recognition
```

## Expo Configuration

### 1. Add to app.json/app.config.js

```json
{
  "expo": {
    "plugins": [
      [
        "expo-image-picker",
        {
          "photosPermission": "The app accesses your photos to let you share images in chat.",
          "cameraPermission": "The app accesses your camera to let you take photos for chat."
        }
      ],
      [
        "expo-document-picker",
        {
          "iCloudContainerEnvironment": "Production"
        }
      ],
      [
        "expo-media-library",
        {
          "photosPermission": "Allow $(PRODUCT_NAME) to access your photos.",
          "savePhotosPermission": "Allow $(PRODUCT_NAME) to save photos."
        }
      ],
      [
        "expo-audio",
        {
          "microphonePermission": "Allow $(PRODUCT_NAME) to access your microphone for voice messages."
        }
      ]
    ]
  }
}
```

### 2. iOS Info.plist (if using bare workflow)

```xml
<key>NSCameraUsageDescription</key>
<string>This app needs access to camera to take photos for chat</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>This app needs access to photo library to share images in chat</string>
<key>NSMicrophoneUsageDescription</key>
<string>This app needs access to microphone for voice messages</string>
```

### 3. Android Manifest (if using bare workflow)

```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
```

## Usage

```typescript
import { ChatScreen, FloatingChatButton } from 'rhb-chat-sdk';

// Basic usage
<ChatScreen onClose={() => {}} />

// With custom configuration
<ChatScreen 
  onClose={() => {}} 
  config={{
    theme: {
      primaryColor: '#007AFF'
    },
    onMessageSend: async (message) => {
      // Handle message sending
      return 'AI response';
    }
  }} 
/>
```

## Development Workflow (Local Installation)

When developing the SDK locally:

1. **Build the SDK** after making changes:
```bash
cd packages/rhb-chat-sdk
npm run build
```

2. **Hot reloading**: Changes will automatically reflect since it's installed via symlink

3. **Update imports** in your host app:
```javascript
// Use package name (not relative path)
import { ChatScreen, FloatingChatButton } from 'rhb-chat-sdk';
```

4. **Version conflicts**: Use `--legacy-peer-deps` flag to resolve dependency conflicts during development

## Troubleshooting

### Permission Issues
If you encounter permission issues:

1. Ensure all peer dependencies are installed
2. Run `expo install` to ensure compatible versions
3. For bare React Native projects, run `cd ios && pod install`
4. Clear cache: `expo start --clear`

### Installation Issues
For local development installation problems:

1. **Dependency conflicts**: Use `--legacy-peer-deps` flag
2. **Build errors**: Ensure SDK is built first with `npm run build`
3. **Import errors**: Verify package is in `node_modules/` and use package name in imports
4. **Permission errors**: Check that all required Expo plugins are configured in `app.json`

### Development Issues
When working on the SDK:

1. **Changes not reflecting**: Restart Metro bundler with `expo start --clear`
2. **TypeScript errors**: Rebuild the SDK with `npm run clean && npm run build`
3. **Symlink issues**: Reinstall with `npm install ./packages/rhb-chat-sdk --legacy-peer-deps`