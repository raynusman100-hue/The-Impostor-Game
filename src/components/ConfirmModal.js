import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { useTheme } from '../utils/ThemeContext';
import { playHaptic } from '../utils/haptics';

export default function ConfirmModal({ 
    visible, 
    title = "ARE YOU SURE?", 
    message, 
    confirmText = "YES", 
    cancelText = "NO",
    onConfirm, 
    onCancel,
    variant = "warning" // "warning" | "danger" | "info"
}) {
    const { theme } = useTheme();
    const styles = getStyles(theme, variant);

    const handleConfirm = () => {
        playHaptic('medium');
        onConfirm?.();
    };

    const handleCancel = () => {
        playHaptic('light');
        onCancel?.();
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={handleCancel}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <View style={styles.iconContainer}>
                        <Text style={styles.icon}>
                            {variant === 'danger' ? '⚠️' : variant === 'info' ? 'ℹ️' : '❓'}
                        </Text>
                    </View>
                    
                    <Text style={styles.title}>{title}</Text>
                    
                    {message && (
                        <Text style={styles.message}>{message}</Text>
                    )}
                    
                    <View style={styles.buttonRow}>
                        <TouchableOpacity 
                            style={styles.cancelButton} 
                            onPress={handleCancel}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.cancelText}>{cancelText}</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            style={styles.confirmButton} 
                            onPress={handleConfirm}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.confirmText}>{confirmText}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const getStyles = (theme, variant) => {
    const accentColor = variant === 'danger' 
        ? theme.colors.error 
        : variant === 'info' 
            ? theme.colors.primary 
            : theme.colors.warning || '#f39c12';

    return StyleSheet.create({
        overlay: {
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
        },
        container: {
            backgroundColor: theme.colors.surface,
            borderRadius: 24,
            padding: 24,
            width: '90%',
            maxWidth: 340,
            alignItems: 'center',
            borderWidth: 2,
            borderColor: accentColor,
        },
        iconContainer: {
            marginBottom: 16,
        },
        icon: {
            fontSize: 48,
        },
        title: {
            fontSize: 24,
            fontFamily: theme.fonts.header,
            color: theme.colors.text,
            textAlign: 'center',
            letterSpacing: 2,
            marginBottom: 12,
        },
        message: {
            fontSize: 16,
            fontFamily: theme.fonts.medium,
            color: theme.colors.textSecondary,
            textAlign: 'center',
            lineHeight: 24,
            marginBottom: 24,
        },
        buttonRow: {
            flexDirection: 'row',
            gap: 12,
            width: '100%',
        },
        cancelButton: {
            flex: 1,
            paddingVertical: 14,
            paddingHorizontal: 20,
            borderRadius: 30,
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderColor: theme.colors.textSecondary,
            alignItems: 'center',
        },
        cancelText: {
            fontSize: 16,
            fontFamily: theme.fonts.bold,
            color: theme.colors.textSecondary,
            letterSpacing: 1,
        },
        confirmButton: {
            flex: 1,
            paddingVertical: 14,
            paddingHorizontal: 20,
            borderRadius: 30,
            backgroundColor: accentColor,
            alignItems: 'center',
        },
        confirmText: {
            fontSize: 16,
            fontFamily: theme.fonts.bold,
            color: variant === 'danger' ? '#fff' : theme.colors.background,
            letterSpacing: 1,
        },
    });
};
