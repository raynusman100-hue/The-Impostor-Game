import React, { useRef, useState } from 'react';
import { View, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { CustomBuiltAvatar } from './CustomAvatarBuilder';

const AvatarSlot = ({ 
    index, 
    config, 
    isLocked, 
    isSelected, 
    onTap, 
    onLongPress, 
    onDoubleTab, 
    size, 
    theme 
}) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const [tapCount, setTapCount] = useState(0);
    const tapTimer = useRef(null);

    const handlePress = () => {
        Animated.sequence([
            Animated.timing(scaleAnim, { toValue: 0.9, duration: 100, useNativeDriver: true }),
            Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
        ]).start();

        setTapCount(prev => prev + 1);

        if (tapTimer.current) {
            clearTimeout(tapTimer.current);
        }

        tapTimer.current = setTimeout(() => {
            if (tapCount + 1 >= 2) {
                if (onDoubleTab) onDoubleTab(index);
            } else {
                if (onTap) onTap(index);
            }
            setTapCount(0);
        }, 300);
    };

    const handleLongPress = () => {
        if (onLongPress) {
            onLongPress(index);
        }
    };

    return (
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={handlePress}
                onLongPress={handleLongPress}
                delayLongPress={500}
                style={styles.container}
            >
                <View style={[
                    styles.avatarContainer,
                    {
                        width: size,
                        height: size,
                        borderRadius: size / 2,
                    }
                ]}>
                    <CustomBuiltAvatar config={config} size={size - 8} />
                    
                    {isLocked && (
                        <View style={[styles.lockIndicator, { backgroundColor: theme.colors.primary }]}>
                            <View style={styles.lockIcon}>
                                <View style={[styles.lockBody, { backgroundColor: theme.colors.secondary }]} />
                                <View style={[styles.lockShackle, { borderColor: theme.colors.secondary }]} />
                            </View>
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    lockIndicator: {
        position: 'absolute',
        top: -2,
        right: -2,
        width: 16,
        height: 16,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    lockIcon: {
        width: 10,
        height: 10,
        position: 'relative',
    },
    lockBody: {
        position: 'absolute',
        bottom: 0,
        left: 2,
        width: 6,
        height: 5,
        borderRadius: 1,
    },
    lockShackle: {
        position: 'absolute',
        top: 0,
        left: 3,
        width: 4,
        height: 5,
        borderWidth: 1.5,
        borderBottomWidth: 0,
        borderTopLeftRadius: 2,
        borderTopRightRadius: 2,
    },
});

export default AvatarSlot;
