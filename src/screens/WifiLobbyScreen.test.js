import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import WifiLobbyScreen from './WifiLobbyScreen';
import { useVoiceChat } from '../utils/VoiceChatContext';
import { useTheme } from '../utils/ThemeContext';
import { database } from '../utils/firebase';
import { Alert } from 'react-native';

// Mock dependencies
jest.mock('../utils/VoiceChatContext');
jest.mock('../utils/ThemeContext');
jest.mock('../utils/firebase');
jest.mock('../utils/haptics', () => ({
    playHaptic: jest.fn(),
}));
jest.mock('../utils/VoiceParticipantsTracker', () => ({
    useVoiceParticipantsTracker: jest.fn(),
}));
jest.mock('../components/ChatSystem', () => 'ChatSystem');
jest.mock('../components/VoiceControl', () => 'VoiceControl');
jest.mock('../components/VoiceTab', () => 'VoiceTab');
jest.mock('../components/KodakButton', () => 'KodakButton');
jest.mock('../utils/AvatarGenerator', () => ({
    CustomAvatar: 'CustomAvatar',
}));
jest.mock('../components/CustomAvatarBuilder', () => ({
    CustomBuiltAvatar: 'CustomBuiltAvatar',
}));
jest.mock('expo-linear-gradient', () => ({
    LinearGradient: 'LinearGradient',
}));

const mockTheme = {
    colors: {
        primary: '#FFB800',
        secondary: '#000000',
        text: '#FFFFFF',
        textMuted: '#CCCCCC',
        tertiary: '#FFD700',
        surface: '#1A1A1A',
        error: '#FF3B30',
        background: '#000000',
        backgroundGradient: ['#000000', '#1A1A1A', '#000000'],
    },
    fonts: {
        header: 'Panchang-Bold',
        bold: 'CabinetGrotesk-Bold',
        medium: 'CabinetGrotesk-Medium',
    },
    spacing: {
        xl: 20,
    },
    textShadows: {
        glow: {},
        softDepth: {},
        depth: {},
    },
    shadows: {
        heavy: {},
        soft: {},
    },
};

const mockVoiceChat = {
    isJoined: false,
    joinChannel: jest.fn(),
    leaveChannel: jest.fn(),
    hostHasPremium: true,
    premiumStatusLoading: false,
    setRoomCodeForPremiumMonitoring: jest.fn(),
    error: null,
};

const mockRoute = {
    params: {
        roomCode: '123456',
        playerId: 'player1',
        playerName: 'Test Player',
        stampedAppId: 'test-app-id',
    },
};

const mockNavigation = {
    navigate: jest.fn(),
    replace: jest.fn(),
};

describe('WifiLobbyScreen - Premium Voice Chat Integration', () => {
    beforeEach(() => {
        useTheme.mockReturnValue({ theme: mockTheme });
        useVoiceChat.mockReturnValue(mockVoiceChat);
        jest.clearAllMocks();
        
        // Mock Firebase
        database.ref = jest.fn();
        Alert.alert = jest.fn();
    });

    describe('Task 6.1: Host Premium Status Monitoring', () => {
        it('passes roomCode to VoiceTab for premium monitoring', () => {
            const { UNSAFE_getByType } = render(
                <WifiLobbyScreen route={mockRoute} navigation={mockNavigation} />
            );

            const voiceTab = UNSAFE_getByType('VoiceTab');
            expect(voiceTab.props.roomCode).toBe('123456');
        });

        it('passes correct player information to VoiceTab', () => {
            const { UNSAFE_getByType } = render(
                <WifiLobbyScreen route={mockRoute} navigation={mockNavigation} />
            );

            const voiceTab = UNSAFE_getByType('VoiceTab');
            expect(voiceTab.props.playerId).toBe('player1');
            expect(voiceTab.props.playerName).toBe('Test Player');
        });

        it('passes isHost=false to VoiceTab for non-host players', () => {
            const { UNSAFE_getByType } = render(
                <WifiLobbyScreen route={mockRoute} navigation={mockNavigation} />
            );

            const voiceTab = UNSAFE_getByType('VoiceTab');
            expect(voiceTab.props.isHost).toBe(false);
        });
    });

    describe('Task 6.2: Voice Tab Premium-Gated Access', () => {
        it('renders VoiceTab component in voice tab', () => {
            const { getByText, UNSAFE_getByType } = render(
                <WifiLobbyScreen route={mockRoute} navigation={mockNavigation} />
            );

            // Switch to voice tab
            fireEvent.press(getByText('VOICE'));

            expect(UNSAFE_getByType('VoiceTab')).toBeTruthy();
        });

        it('passes stampedAppId to VoiceTab for Agora connection', () => {
            const { UNSAFE_getByType } = render(
                <WifiLobbyScreen route={mockRoute} navigation={mockNavigation} />
            );

            const voiceTab = UNSAFE_getByType('VoiceTab');
            expect(voiceTab.props.stampedAppId).toBe('test-app-id');
        });

        it('passes voiceParticipants to VoiceTab', () => {
            const { UNSAFE_getByType } = render(
                <WifiLobbyScreen route={mockRoute} navigation={mockNavigation} />
            );

            const voiceTab = UNSAFE_getByType('VoiceTab');
            expect(voiceTab.props.voiceParticipants).toBeDefined();
            expect(Array.isArray(voiceTab.props.voiceParticipants)).toBe(true);
        });

        it('passes context="lobby" to VoiceTab', () => {
            const { UNSAFE_getByType } = render(
                <WifiLobbyScreen route={mockRoute} navigation={mockNavigation} />
            );

            const voiceTab = UNSAFE_getByType('VoiceTab');
            expect(voiceTab.props.context).toBe('lobby');
        });

        it('provides premium upgrade handler to VoiceTab', () => {
            const { UNSAFE_getByType } = render(
                <WifiLobbyScreen route={mockRoute} navigation={mockNavigation} />
            );

            const voiceTab = UNSAFE_getByType('VoiceTab');
            expect(voiceTab.props.onPremiumRequired).toBeDefined();
            expect(typeof voiceTab.props.onPremiumRequired).toBe('function');
        });

        it('shows alert when non-host tries to upgrade premium', () => {
            const { UNSAFE_getByType } = render(
                <WifiLobbyScreen route={mockRoute} navigation={mockNavigation} />
            );

            const voiceTab = UNSAFE_getByType('VoiceTab');
            
            // Call the premium upgrade handler
            voiceTab.props.onPremiumRequired();

            expect(Alert.alert).toHaveBeenCalledWith(
                'Premium Required',
                'Voice chat requires the host to have premium. Ask the host to upgrade!',
                [{ text: 'OK' }]
            );
        });
    });

    describe('Integration with existing features', () => {
        it('maintains floating VoiceControl when joined', () => {
            useVoiceChat.mockReturnValue({
                ...mockVoiceChat,
                isJoined: true,
            });

            const { UNSAFE_getByType } = render(
                <WifiLobbyScreen route={mockRoute} navigation={mockNavigation} />
            );

            expect(UNSAFE_getByType('VoiceControl')).toBeTruthy();
        });

        it('does not show floating VoiceControl when not joined', () => {
            useVoiceChat.mockReturnValue({
                ...mockVoiceChat,
                isJoined: false,
            });

            const { UNSAFE_queryByType } = render(
                <WifiLobbyScreen route={mockRoute} navigation={mockNavigation} />
            );

            expect(UNSAFE_queryByType('VoiceControl')).toBeNull();
        });

        it('maintains all three tabs: lobby, chat, voice', () => {
            const { getByText } = render(
                <WifiLobbyScreen route={mockRoute} navigation={mockNavigation} />
            );

            expect(getByText('LOBBY')).toBeTruthy();
            expect(getByText('CHAT')).toBeTruthy();
            expect(getByText('VOICE')).toBeTruthy();
        });

        it('switches between tabs correctly', () => {
            const { getByText, UNSAFE_getByType, UNSAFE_queryByType } = render(
                <WifiLobbyScreen route={mockRoute} navigation={mockNavigation} />
            );

            // Initially on lobby tab
            expect(UNSAFE_queryByType('VoiceTab')).toBeNull();

            // Switch to voice tab
            fireEvent.press(getByText('VOICE'));
            expect(UNSAFE_getByType('VoiceTab')).toBeTruthy();

            // Switch to chat tab
            fireEvent.press(getByText('CHAT'));
            expect(UNSAFE_getByType('ChatSystem')).toBeTruthy();
            expect(UNSAFE_queryByType('VoiceTab')).toBeNull();
        });
    });
});
