export interface ChatMessage {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  mediaType?: 'image' | 'file' | 'audio';
  mediaUri?: string;
}

export interface SuggestedPrompt {
  title: string;
  description: string;
}

export interface ChatConfig {
  logoSource?: any;
  suggestedPrompts?: SuggestedPrompt[];
  onMessageSend?: (message: string) => Promise<string>;
  onMediaUpload?: (type: string, uri: string, description: string) => Promise<void>;
  theme?: {
    primaryColor?: string;
    backgroundColor?: string;
    textColor?: string;
    userBubbleColor?: string;
    aiBubbleColor?: string;
  };
}

export interface FloatingChatButtonProps {
  onPress: () => void;
  style?: any;
}

export interface ChatScreenProps {
  onClose: () => void;
  config?: ChatConfig;
}