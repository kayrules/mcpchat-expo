import React from 'react';
import { TouchableOpacity, StyleSheet, Animated, Image } from 'react-native';
import { FloatingChatButtonProps } from '../types';

const FloatingChatButton: React.FC<FloatingChatButtonProps> = ({ onPress, style }) => {
  return (
    <TouchableOpacity style={[styles.container, style]} onPress={onPress} activeOpacity={0.8}>
      <Animated.View style={styles.button}>
        <Image 
          source={require('../../../../assets/ai-stars.png')} 
          style={styles.icon}
          resizeMode="contain"
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 61,
    right: 65,
    zIndex: 999,
  },
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffffff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  icon: {
    width: 24,
    height: 24,
  },
});

export default FloatingChatButton;