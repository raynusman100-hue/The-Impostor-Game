import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { database } from '../utils/firebase';
import { ref, push, onValue, off, serverTimestamp } from 'firebase/database';
import { useTheme } from '../utils/ThemeContext';
import { playHaptic } from '../utils/haptics';

export default function ChatSystem({ roomCode, playerId, playerName, onUnreadChange }) {
    const { theme } = useTheme();
    const styles = getStyles(theme);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const flatListRef = useRef(null);
    const initialLoadDone = useRef(false);

    useEffect(() => {
        if (!roomCode) return;

        const messagesRef = ref(database, `rooms/${roomCode}/chat`);
        const unsubscribe = onValue(messagesRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const messageList = Object.entries(data).map(([id, msg]) => ({
                    id,
                    ...msg,
                })).sort((a, b) => a.timestamp - b.timestamp);

                // Calculate unread messages if this is a new update and we aren't at the bottom?
                // For now, simpler: we just pass the total count or let the parent handle "unread" based on its own state
                // Actually, the parent (Lobby) tracks unread based on when content changes if Chat is hidden.
                // We'll just trigger the callback.
                if (initialLoadDone.current && messageList.length > messages.length) {
                    onUnreadChange && onUnreadChange(messageList.length - messages.length);
                }

                setMessages(messageList);
            } else {
                setMessages([]);
            }
            setIsLoading(false);
            initialLoadDone.current = true;
        });

        return () => off(messagesRef);
    }, [roomCode]);

    const sendMessage = async () => {
        if (!inputText.trim()) return;

        playHaptic('light');
        const textToSend = inputText.trim();
        setInputText(''); // Clear early for responsiveness

        try {
            const messagesRef = ref(database, `rooms/${roomCode}/chat`);
            await push(messagesRef, {
                senderId: playerId,
                senderName: playerName,
                text: textToSend,
                timestamp: serverTimestamp(),
            });
            // Scroll to bottom happens automatically via onContentSizeChange usually
        } catch (error) {
            console.error("Failed to send message:", error);
            setInputText(textToSend); // Revert on failure
        }
    };

    const renderMessage = ({ item }) => {
        const isMe = item.senderId === playerId;
        return (
            <View style={[styles.messageBubble, isMe ? styles.myMessage : styles.theirMessage]}>
                {!isMe && (
                    <Text style={[styles.senderName, { color: theme.colors.primary }]}>
                        {item.senderName}
                    </Text>
                )}
                <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.theirMessageText]}>
                    {item.text}
                </Text>
            </View>
        );
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
            style={styles.container}
        >
            <View style={styles.chatContainer}>
                {isLoading ? (
                    <ActivityIndicator color={theme.colors.primary} style={styles.loader} />
                ) : messages.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>
                            No messages yet. Say hello!
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        renderItem={renderMessage}
                        keyExtractor={item => item.id}
                        contentContainerStyle={styles.listContent}
                        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
                        showsVerticalScrollIndicator={false}
                    />
                )}

                {/* Input Area */}
                <View style={[styles.inputContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.primary }]}>
                    <TextInput
                        style={[styles.input, { color: theme.colors.text }]}
                        value={inputText}
                        onChangeText={setInputText}
                        placeholder="Type a message..."
                        placeholderTextColor={theme.colors.textMuted}
                        returnKeyType="send"
                        onSubmitEditing={sendMessage}
                    />
                    <TouchableOpacity
                        style={[styles.sendButton, { backgroundColor: inputText.trim() ? theme.colors.primary : theme.colors.textMuted + '40' }]}
                        onPress={sendMessage}
                        disabled={!inputText.trim()}
                    >
                        <Text style={[styles.sendButtonText, { color: theme.colors.secondary }]}>SEND</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

function getStyles(theme) {
    return StyleSheet.create({
        container: {
            flex: 1,
            width: '100%',
            height: '100%',
        },
        chatContainer: {
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.2)',
            borderRadius: 16,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: theme.colors.textMuted + '30',
        },
        listContent: {
            padding: 16,
            paddingBottom: 8,
        },
        loader: {
            marginTop: 20,
        },
        emptyContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        emptyText: {
            fontSize: 14,
            fontFamily: theme.fonts.medium,
            fontStyle: 'italic',
        },
        messageBubble: {
            maxWidth: '80%',
            padding: 12,
            borderRadius: 16,
            marginBottom: 8,
        },
        myMessage: {
            alignSelf: 'flex-end',
            backgroundColor: theme.colors.primary + '20',
            borderBottomRightRadius: 2,
            borderWidth: 1,
            borderColor: theme.colors.primary + '50',
        },
        theirMessage: {
            alignSelf: 'flex-start',
            backgroundColor: theme.colors.surface,
            borderBottomLeftRadius: 2,
            borderWidth: 1,
            borderColor: theme.colors.textMuted + '30',
        },
        senderName: {
            fontSize: 10,
            fontFamily: theme.fonts.bold,
            marginBottom: 4,
            letterSpacing: 0.5,
        },
        messageText: {
            fontSize: 14,
            fontFamily: theme.fonts.medium,
            lineHeight: 20,
        },
        myMessageText: {
            color: theme.colors.text,
        },
        theirMessageText: {
            color: theme.colors.text,
        },
        inputContainer: {
            flexDirection: 'row',
            padding: 10,
            alignItems: 'center',
            borderTopWidth: 1,
        },
        input: {
            flex: 1,
            height: 40,
            paddingHorizontal: 12,
            fontFamily: theme.fonts.medium,
            fontSize: 14,
        },
        sendButton: {
            height: 36,
            paddingHorizontal: 16,
            borderRadius: 18,
            justifyContent: 'center',
            alignItems: 'center',
            marginLeft: 8,
        },
        sendButtonText: {
            fontSize: 10,
            fontFamily: theme.fonts.bold,
            letterSpacing: 1,
        },
    });
}
