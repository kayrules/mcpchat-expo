# Development Setup for Hot Reloading

## Current Setup: Direct Source Import

For development hot reloading, the host app imports directly from source files:

```typescript
// In App.tsx (development mode)
import { ChatScreen, FloatingChatButton } from './packages/rhb-chat-sdk/src';
```

## Development Workflow:

### 1. Start Development
```bash
cd /Users/kayrules/Projects/AI/umd-agent/umd-agent
npx expo start
```

### 2. Edit SDK Files
- Make changes to any file in `packages/rhb-chat-sdk/src/`
- Save the file
- Metro will automatically detect changes and reload

### 3. Test Hot Reloading
Try changing the FloatingChatButton styles:
- Edit `packages/rhb-chat-sdk/src/components/FloatingChatButton.tsx`
- Change colors, positions, or sizes
- Save and watch the simulator update

### 4. Production Import
When ready to publish, switch back to package import:
```typescript
// In App.tsx (production mode)
import { ChatScreen, FloatingChatButton } from 'rhb-chat-sdk';
```

## Benefits of Direct Import for Development:
- ✅ **Instant Hot Reloading** - No build step required
- ✅ **TypeScript Support** - Metro transpiles .tsx files on-the-fly
- ✅ **Full Source Access** - Debug directly in source files
- ✅ **Fast Iteration** - Save and see changes immediately

## Switching Between Modes:

### Development Mode:
```typescript
import { ChatScreen } from './packages/rhb-chat-sdk/src';
```

### Production Mode:
```typescript  
import { ChatScreen } from 'rhb-chat-sdk';
```

## Troubleshooting:

- **Changes not reflecting**: Try `r` in Metro terminal or restart with `expo start --clear`
- **TypeScript errors**: Check imports and types in source files
- **Import errors**: Verify the path `./packages/rhb-chat-sdk/src` exists