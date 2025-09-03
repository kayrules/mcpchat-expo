import { jsx as _jsx } from "react/jsx-runtime";
import { TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
const FloatingChatButton = ({ onPress, style }) => {
    return (_jsx(TouchableOpacity, { style: [styles.container, style], onPress: onPress, activeOpacity: 0.8, children: _jsx(Animated.View, { style: styles.button, children: _jsx(MaterialCommunityIcons, { name: "chat", size: 34, color: "#FFFFFF" }) }) }));
};
const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 60,
        right: 35,
        zIndex: 999,
    },
    button: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#007AFF',
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
});
export default FloatingChatButton;
