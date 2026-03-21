import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import VoiceTab from './VoiceTab';
import { useVoiceChat } from '../utils/VoiceChatContext';
import { useTheme } from '../utils/ThemeContext';

// Mock dependencies
jest.mock('../utils/VoiceChatContext');
jest.mock('../utils/ThemeContext');
jest.mock('../utils/haptics', () => ({
    playHaptic: jest.fn(),
}));
jest.mock('./VoiceControl', () => 'VoiceControl');
jest.mock('./PremiumRequiredMessage', () => 'PremiumRequiredMessage');
jest.mock('../utils/AvatarGenerator', () => ({
    CustomAvatar: 'CustomAvatar',
}));
jest.mock('./CustomAvatarBuilder', () => ({
    CustomBuiltAvatar: 'CustomBuiltAvatar',
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
    },
    fonts: {
        header: 'Panchang-Bold',
        bold: 'CabinetGrotesk-Bold',
        medium: 'CabinetGrotesk-Medium',
    },
    textShadows: {
        glow: {},
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

describe('VoiceTab', () => {
    beforeEach(() => {
        useTheme.mockReturnValue({ theme: mockTheme });
        useVoiceChat.mockReturnValue(mockVoiceChat);
        jest.clearAllMocks();
    });

    it('renders loading state when premium status is loading', () => {
        useVoiceChat.mockReturnValue({
            ...mockVoiceChat,
            premiumStatusLoading: true,
        });

        const { getByText } = render(
            <VoiceTab roomCode="123456" playerId="player1" />
        );

        expect(getByText('Checking voice chat availability...')).toBeTruthy();
    });

    it('renders premium required message when host lacks premium', () => {
        useVoiceChat.mockReturnValue({
            ...mockVoiceChat,
            hostHasPremium: false,
        });

        const { UNSAFE_getByType } = render(
            <VoiceTab roomCode="123456" playerId="player1" isHost={false} />
        );

        expect(UNSAFE_getByType('PremiumRequiredMessage')).toBeTruthy();
    });

    it('renders voice controls when host has premium and not joined', () => {
        const { getByText } = render(
            <VoiceTab 
                roomCode="123456" 
                playerId="player1" 
                voiceParticipants={[]}
            />
        );

        expect(getByText('VOICE CHAT')).toBeTruthy();
        expect(getByText('No one in voice chat yet')).toBeTruthy();
        expect(getByText('JOIN CALL')).toBeTruthy();
    });

    it('renders participant count when others are in voice chat', () => {
        const participants = [
            { id: 'player2', name: 'Player 2', avatarId: 1 },
            { id: 'player3', name: 'Player 3', avatarId: 2 },
        ];

        const { getByText } = render(
            <VoiceTab 
                roomCode="123456" 
                playerId="player1" 
                voiceParticipants={participants}
            />
        );

        expect(getByText('2 MEMBERS IN CALL')).toBeTruthy();
    });

    it('renders joined state with participants list', () => {
        useVoiceChat.mockReturnValue({
            ...mockVoiceChat,
            isJoined: true,
        });

        const participants = [
            { id: 'player1', name: 'Player 1', avatarId: 1 },
            { id: 'player2', name: 'Player 2', avatarId: 2 },
        ];

        const { getByText } = render(
            <VoiceTab 
                roomCode="123456" 
                playerId="player1" 
                voiceParticipants={participants}
            />
        );

        expect(getByText('IN VOICE CHAT')).toBeTruthy();
        expect(getByText('You')).toBeTruthy();
        expect(getByText('Player 2')).toBeTruthy();
        expect(getByText('LEAVE CALL')).toBeTruthy();
    });

    it('calls joinChannel when join button is pressed', async () => {
        const { getByText } = render(
            <VoiceTab roomCode="123456" playerId="player1" />
        );

        fireEvent.press(getByText('JOIN CALL'));

        await waitFor(() => {
            expect(mockVoiceChat.joinChannel).toHaveBeenCalledWith('123456', 0, '123456');
        });
    });

    it('calls joinChannel with stamped app ID when provided', async () => {
        const { getByText } = render(
            <VoiceTab 
                roomCode="123456" 
                playerId="player1" 
                stampedAppId="stamped-app-id"
            />
        );

        fireEvent.press(getByText('JOIN CALL'));

        await waitFor(() => {
            expect(mockVoiceChat.joinChannel).toHaveBeenCalledWith('123456', 0, '123456', 'stamped-app-id');
        });
    });

    it('calls leaveChannel when leave button is pressed', async () => {
        useVoiceChat.mockReturnValue({
            ...mockVoiceChat,
            isJoined: true,
        });

        const { getByText } = render(
            <VoiceTab roomCode="123456" playerId="player1" />
        );

        fireEvent.press(getByText('LEAVE CALL'));

        await waitFor(() => {
            expect(mockVoiceChat.leaveChannel).toHaveBeenCalled();
        });
    });

    it('sets up premium monitoring for the room', () => {
        render(<VoiceTab roomCode="123456" playerId="player1" />);

        expect(mockVoiceChat.setRoomCodeForPremiumMonitoring).toHaveBeenCalledWith('123456');
    });

    it('shows error state when voice chat has errors', () => {
        useVoiceChat.mockReturnValue({
            ...mockVoiceChat,
            error: 'Connection failed',
        });

        const { getByText } = render(
            <VoiceTab roomCode="123456" playerId="player1" />
        );

        expect(getByText('Voice chat temporarily unavailable')).toBeTruthy();
    });
});