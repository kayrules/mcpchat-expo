import { Alert, Linking, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';

export class PermissionManager {
  static async requestCameraPermission(): Promise<boolean> {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        this.showPermissionAlert(
          'Camera Permission Required',
          'This feature requires camera access to take photos.',
          'camera'
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error('Camera permission error:', error);
      return false;
    }
  }

  static async requestMediaLibraryPermission(): Promise<boolean> {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        this.showPermissionAlert(
          'Photo Library Permission Required',
          'This feature requires access to your photo library.',
          'photos'
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error('Media library permission error:', error);
      return false;
    }
  }

  private static showPermissionAlert(title: string, message: string, type: string) {
    Alert.alert(
      title,
      `${message}\n\nTo enable this feature:\n1. Go to Settings\n2. Find this app\n3. Enable ${type} permission`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Open Settings', 
          onPress: () => {
            if (Platform.OS === 'ios') {
              Linking.openURL('app-settings:');
            } else {
              Linking.openSettings();
            }
          }
        }
      ]
    );
  }

  static showConfigurationError(feature: string) {
    Alert.alert(
      'Configuration Required',
      `${feature} feature requires proper SDK configuration.\n\nPlease check the installation guide:\n- Install required dependencies\n- Configure app permissions\n- Add Expo plugins`,
      [
        { text: 'OK', style: 'default' }
      ]
    );
  }
}