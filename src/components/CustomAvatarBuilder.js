import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Alert, ScrollView } from 'react-native';
import { playHaptic } from '../utils/haptics';
import { Ionicons } from '@expo/vector-icons'; // Assuming Expo icons are available

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ============ CONFIGURATION DATA ============
// Converted to objects to support 'premium' flag

const FACE_SHAPES = [
    { id: 'round', premium: false },
    { id: 'oval', premium: false },
    { id: 'square', premium: false },
    { id: 'heart', premium: false },
    { id: 'long', premium: false }
];

const SKIN_COLORS = [
    { color: '#FFDBB4', id: 'light', premium: false },
    { color: '#EDB98A', id: 'medium-light', premium: false },
    { color: '#D08B5B', id: 'medium', premium: false },
    { color: '#AE5D29', id: 'medium-dark', premium: false },
    { color: '#614335', id: 'dark', premium: false },
    { color: '#F5D0C5', id: 'pale', premium: false },
    // Premium Skins
    { color: '#7bed9f', id: 'alien', premium: true }, // Neon Green
    { color: '#a4b0be', id: 'metal', premium: true }, // Silver
    { color: '#70a1ff', id: 'spirit', premium: true }, // Ice Blue
    { color: '#2f3542', id: 'void', premium: true }, // Dark Grey
];

const EYE_STYLES = [
    { id: 'normal', premium: false },
    { id: 'happy', premium: false },
    { id: 'sleepy', premium: false },
    { id: 'wink', premium: false },
    { id: 'big', premium: false },
    { id: 'small', premium: false },
    { id: 'angry', premium: false },
    { id: 'cute', premium: false },
    // Premium Eyes
    { id: 'laser', premium: true },
    { id: 'cyborg', premium: true },
    { id: 'hearts', premium: true },
    { id: 'money', premium: true },
];

const MOUTH_STYLES = [
    { id: 'smile', premium: false },
    { id: 'grin', premium: false },
    { id: 'neutral', premium: false },
    { id: 'open', premium: false },
    { id: 'smirk', premium: false },
    { id: 'sad', premium: false },
    { id: 'kiss', premium: false },
    { id: 'teeth', premium: false },
    // Premium Mouths
    { id: 'vampire', premium: true },
    { id: 'zipper', premium: true },
    { id: 'mask', premium: true },
    { id: 'goldGrill', premium: true },
];

const HAIR_STYLES = [
    { id: 'none', premium: false },
    { id: 'short', premium: false },
    { id: 'spiky', premium: false },
    { id: 'curly', premium: false },
    { id: 'wavy', premium: false },
    { id: 'long', premium: false },
    { id: 'ponytail', premium: false },
    { id: 'mohawk', premium: false },
    { id: 'buzz', premium: false },
    { id: 'cap', premium: false },
    { id: 'beanie', premium: false },
    // Premium Hair
    { id: 'afro', premium: true },
    { id: 'flame', premium: true },
];

const HAIR_COLORS = [
    { color: '#1a1a1a', id: 'black', premium: false },
    { color: '#4A3728', id: 'dark-brown', premium: false },
    { color: '#8B4513', id: 'brown', premium: false },
    { color: '#D4A574', id: 'blonde', premium: false },
    { color: '#FFD700', id: 'gold', premium: false }, // Yellow-ish
    { color: '#FF6B6B', id: 'red', premium: false },
    { color: '#9B59B6', id: 'purple', premium: false },
    { color: '#3498DB', id: 'blue', premium: false },
    // Premium Colors
    { color: '#00ff00', id: 'neonGreen', premium: true },
    { color: '#ff00ff', id: 'neonPink', premium: true },
    { color: '#00ffff', id: 'cyan', premium: true },
];

const ACCESSORIES = [
    { id: 'none', premium: false },
    { id: 'glasses', premium: false },
    { id: 'sunglasses', premium: false },
    { id: 'roundGlasses', premium: false },
    { id: 'eyepatch', premium: false }, // Moved to generic list or keep free? User said "existing free". Let's assume eyepatch was existing.
    { id: 'bandana', premium: false },
    { id: 'earrings', premium: false },
    { id: 'headphones', premium: false },
    // Premium Accessories
    { id: 'halo', premium: true },
    { id: 'crown', premium: true },
    { id: 'gamingHeadset', premium: true },
    { id: 'goldChain', premium: true },
    { id: 'cyberVisor', premium: true },
];

const ACCESSORY_COLORS = {
    halo: ['#FFD700', '#FFFFFF', '#00FFFF', '#FF0000', '#9B59B6'], // Gold, White, Cyan, Red, Purple
    crown: ['#FFD700', '#C0C0C0', '#1a1a1a', '#cd7f32', '#e5e4e2'], // Gold, Silver, Black, Bronze, Platinum
    gamingHeadset: ['#00ff00', '#0000ff', '#ff00ff', '#ff0000', '#ffff00'], // Green, Blue, Pink, Red, Yellow
    cyberVisor: ['#00ffff', '#ff0000', '#00ff00', '#ff00ff', '#ffffff'], // Cyan, Red, Green, Pink, White
    glasses: ['#2d2d2d', '#8B4513', '#1a1a1a', '#fff'],
    sunglasses: ['#1a1a1a', '#555', '#2d2d2d'],
};

const BG_COLORS = [
    { color: '#FFB800', id: 'amber', premium: false },
    { color: '#FF6B6B', id: 'red', premium: false },
    { color: '#4ECDC4', id: 'teal', premium: false },
    { color: '#9B59B6', id: 'purple', premium: false },
    { color: '#3498DB', id: 'blue', premium: false },
    { color: '#2ECC71', id: 'green', premium: false },
    { color: '#E74C3C', id: 'crimson', premium: false },
    { color: '#1a1a1a', id: 'dark', premium: false },
];

// Helper to find raw color string from ID or color value
const getSkinColor = (val) => SKIN_COLORS.find(c => c.color === val || c.id === val)?.color || '#FFDBB4';
const getHairColor = (val) => HAIR_COLORS.find(c => c.color === val || c.id === val)?.color || '#1a1a1a';
const getBgColor = (val) => BG_COLORS.find(c => c.color === val || c.id === val)?.color || '#FFB800';

// ============ AVATAR DISPLAY COMPONENT ============
export const CustomBuiltAvatar = ({ config, size = 100 }) => {
    // Scaled down to fit accessories (Halo, Crown, etc.) within the circle
    const S = size / 135;
    const { faceShape = 'round', skinColor = '#FFDBB4', eyeStyle = 'normal', mouthStyle = 'smile', hairStyle = 'none', hairColor = '#1a1a1a', accessory = 'none', accessoryColor = null, bgColor = '#FFB800' } = config || {};

    // Normalize colors if they are passed as IDs (though builder passes values usually, let's be safe)
    const finalSkinColor = getSkinColor(skinColor);
    const finalHairColor = getHairColor(hairColor);
    const finalBgColor = getBgColor(bgColor);

    const FACE = { round: { w: 64, h: 64, r: 32 }, oval: { w: 56, h: 68, r: 28 }, square: { w: 60, h: 60, r: 12 }, heart: { w: 58, h: 62, r: 29 }, long: { w: 52, h: 70, r: 26 } }[faceShape] || { w: 64, h: 64, r: 32 };
    const FW = FACE.w * S, FH = FACE.h * S, FR = FACE.r * S;
    const EYE_Y = FH * 0.38, EYE_LEFT_X = FW * 0.28, EYE_RIGHT_X = FW * 0.72, MOUTH_Y = FH * 0.68, FACE_CENTER_X = FW / 2;

    const SingleEye = ({ x, isRight, style }) => {
        const baseW = 8 * S, baseH = 9 * S, pupil = 4 * S;
        // Basic Styles
        if (style === 'closed') return <View style={{ position: 'absolute', left: x - 5 * S, top: EYE_Y - 1.5 * S, width: 10 * S, height: 3 * S, backgroundColor: '#2d2d2d', borderRadius: 2 * S }} />;
        if (style === 'happy') return <View style={{ position: 'absolute', left: x - 5 * S, top: EYE_Y - 2.5 * S, width: 10 * S, height: 5 * S, borderBottomWidth: 2.5 * S, borderColor: '#2d2d2d', borderBottomLeftRadius: 8 * S, borderBottomRightRadius: 8 * S, backgroundColor: 'transparent' }} />;
        if (style === 'angry') { const rot = isRight ? '-12deg' : '12deg'; return <View style={{ position: 'absolute', left: x - baseW / 2, top: EYE_Y - baseH / 2 - 4 * S }}><View style={{ width: 9 * S, height: 2 * S, backgroundColor: '#2d2d2d', marginBottom: 2 * S, transform: [{ rotate: rot }], alignSelf: 'center' }} /><View style={{ width: baseW, height: baseH, backgroundColor: '#fff', borderRadius: baseW / 2, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#e0e0e0' }}><View style={{ width: pupil, height: pupil, backgroundColor: '#2d2d2d', borderRadius: pupil / 2 }} /></View></View>; }

        // Premium Styles
        if (style === 'laser') return <View style={{ position: 'absolute', left: isRight ? x - 12 * S : x - 4 * S, top: EYE_Y - 2 * S, width: 16 * S, height: 4 * S, backgroundColor: '#ff0000', borderRadius: 2 * S, shadowColor: '#ff0000', shadowRadius: 5, shadowOpacity: 1 }} />;
        if (style === 'cyborg' && isRight) return <View style={{ position: 'absolute', left: x - 6 * S, top: EYE_Y - 6 * S, width: 12 * S, height: 12 * S, backgroundColor: '#333', borderRadius: 6 * S, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#555' }}><View style={{ width: 6 * S, height: 6 * S, backgroundColor: '#ff0000', borderRadius: 3 * S }} /></View>;
        if (style === 'hearts') return <Text style={{ position: 'absolute', left: x - 6 * S, top: EYE_Y - 6 * S, fontSize: 10 * S }}>❤️</Text>;
        if (style === 'money') return <Text style={{ position: 'absolute', left: x - 5 * S, top: EYE_Y - 6 * S, fontSize: 10 * S, color: '#2ecc71', fontWeight: 'bold' }}>$</Text>;

        // Standard
        let w = baseW, h = baseH; if (style === 'big') { w = 11 * S; h = 12 * S; } if (style === 'small') { w = 6 * S; h = 7 * S; }
        const isCute = style === 'cute';
        return <View style={{ position: 'absolute', left: x - w / 2, top: EYE_Y - h / 2, width: w, height: h, backgroundColor: '#fff', borderRadius: w / 2, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#e0e0e0' }}><View style={{ width: pupil, height: pupil, backgroundColor: '#2d2d2d', borderRadius: pupil / 2, marginTop: isCute ? -2 * S : 0 }} />{isCute && <View style={{ position: 'absolute', top: 2 * S, right: 2 * S, width: 2.5 * S, height: 2.5 * S, backgroundColor: '#fff', borderRadius: 1.5 * S }} />}</View>;
    };

    const Eyes = () => {
        const map = { happy: 'happy', sleepy: 'closed', angry: 'angry', big: 'big', small: 'small', cute: 'cute', normal: 'normal' };
        // Pass through premium IDs directly
        const getStyle = (s) => (['laser', 'cyborg', 'hearts', 'money'].includes(s) ? s : (map[s] || 'normal'));

        const left = eyeStyle === 'wink' ? 'normal' : getStyle(eyeStyle);
        const right = eyeStyle === 'wink' ? 'closed' : getStyle(eyeStyle);

        // Laser override - single bar
        if (eyeStyle === 'laser') return <View style={{ position: 'absolute', left: EYE_LEFT_X - 6 * S, top: EYE_Y - 2 * S, width: (EYE_RIGHT_X - EYE_LEFT_X) + 12 * S, height: 4 * S, backgroundColor: '#ff0000', borderRadius: 2 * S, shadowColor: '#f00', shadowRadius: 8, shadowOpacity: 0.8, elevation: 5 }} />;

        return <><SingleEye x={EYE_LEFT_X} style={left} /><SingleEye x={EYE_RIGHT_X} style={right} isRight /></>;
    };

    const Mouth = () => {
        const cx = FACE_CENTER_X;
        switch (mouthStyle) {
            case 'grin': return <View style={{ position: 'absolute', left: cx - 9 * S, top: MOUTH_Y - 4.5 * S, width: 18 * S, height: 9 * S, backgroundColor: '#2d2d2d', borderBottomLeftRadius: 9 * S, borderBottomRightRadius: 9 * S, overflow: 'hidden' }}><View style={{ position: 'absolute', bottom: 0, width: '100%', height: 4 * S, backgroundColor: '#e85a5a' }} /></View>;
            case 'neutral': return <View style={{ position: 'absolute', left: cx - 6 * S, top: MOUTH_Y - 1.25 * S, width: 12 * S, height: 2.5 * S, backgroundColor: '#2d2d2d', borderRadius: 1.5 * S }} />;
            case 'open': return <View style={{ position: 'absolute', left: cx - 5 * S, top: MOUTH_Y - 5 * S, width: 10 * S, height: 10 * S, backgroundColor: '#2d2d2d', borderRadius: 5 * S, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 2 * S }}><View style={{ width: 5 * S, height: 3 * S, backgroundColor: '#e85a5a', borderBottomLeftRadius: 3 * S, borderBottomRightRadius: 3 * S }} /></View>;
            case 'smirk': return <View style={{ position: 'absolute', left: cx - 5 * S, top: MOUTH_Y - 2.5 * S, width: 10 * S, height: 5 * S, borderBottomWidth: 2.5 * S, borderRightWidth: 2 * S, borderColor: '#2d2d2d', borderBottomRightRadius: 8 * S, backgroundColor: 'transparent' }} />;
            case 'sad': return <View style={{ position: 'absolute', left: cx - 6 * S, top: MOUTH_Y - 2.5 * S, width: 12 * S, height: 5 * S, borderTopWidth: 2.5 * S, borderColor: '#2d2d2d', borderTopLeftRadius: 8 * S, borderTopRightRadius: 8 * S, backgroundColor: 'transparent' }} />;
            case 'kiss': return <View style={{ position: 'absolute', left: cx - 3.5 * S, top: MOUTH_Y - 3.5 * S, width: 7 * S, height: 7 * S, backgroundColor: '#e85a5a', borderRadius: 3.5 * S }} />;
            case 'teeth': return <View style={{ position: 'absolute', left: cx - 8 * S, top: MOUTH_Y - 4.5 * S, width: 16 * S, height: 9 * S, backgroundColor: '#2d2d2d', borderRadius: 4 * S, alignItems: 'center', justifyContent: 'center' }}><View style={{ width: 12 * S, height: 4 * S, backgroundColor: '#fff', borderRadius: 1 * S }} /></View>;
            // Premium
            case 'vampire': return <View style={{ position: 'absolute', left: cx - 7 * S, top: MOUTH_Y - 3.5 * S, width: 14 * S, height: 6 * S, borderBottomWidth: 2 * S, borderColor: '#2d2d2d', borderBottomLeftRadius: 7 * S, borderBottomRightRadius: 7 * S }}><View style={{ position: 'absolute', left: 2 * S, top: 0, width: 3 * S, height: 5 * S, backgroundColor: '#fff', borderBottomLeftRadius: 1.5 * S, borderBottomRightRadius: 1.5 * S }} /><View style={{ position: 'absolute', right: 2 * S, top: 0, width: 3 * S, height: 5 * S, backgroundColor: '#fff', borderBottomLeftRadius: 1.5 * S, borderBottomRightRadius: 1.5 * S }} /></View>;
            case 'zipper': return <View style={{ position: 'absolute', left: cx - 8 * S, top: MOUTH_Y - 1 * S, width: 16 * S, height: 2 * S, backgroundColor: '#333' }}><View style={{ position: 'absolute', left: 7 * S, top: -2 * S, width: 2 * S, height: 6 * S, backgroundColor: '#999' }} /></View>;
            case 'mask': return <View style={{ position: 'absolute', left: cx - 12 * S, top: MOUTH_Y - 8 * S, width: 24 * S, height: 16 * S, backgroundColor: '#fff', borderRadius: 6 * S, borderWidth: 1, borderColor: '#ddd' }}><View style={{ position: 'absolute', left: -2 * S, top: 4 * S, width: 28 * S, height: 1 * S, backgroundColor: '#fff' }} /></View>;
            case 'goldGrill': return <View style={{ position: 'absolute', left: cx - 8 * S, top: MOUTH_Y - 4.5 * S, width: 16 * S, height: 8 * S, backgroundColor: '#FFD700', borderRadius: 4 * S, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#B8860B' }} />;
            default: return <View style={{ position: 'absolute', left: cx - 7 * S, top: MOUTH_Y - 3.5 * S, width: 14 * S, height: 7 * S, borderBottomWidth: 2.5 * S, borderColor: '#2d2d2d', borderBottomLeftRadius: 9 * S, borderBottomRightRadius: 9 * S, backgroundColor: 'transparent' }} />;
        }
    };

    const Hair = () => {
        if (hairStyle === 'none') return null;
        const isSquare = faceShape === 'square';
        const hairTop = isSquare ? -FH * 0.12 : -FH * 0.18;
        const sideExtend = FW * 0.08;
        const topRadius = isSquare ? FW * 0.15 : FW * 0.45;

        switch (hairStyle) {
            case 'short':
                return <View style={{ position: 'absolute', left: FW * 0.05, top: hairTop, width: FW * 0.9, height: FH * 0.38, backgroundColor: finalHairColor, borderTopLeftRadius: topRadius, borderTopRightRadius: topRadius, borderBottomLeftRadius: isSquare ? FW * 0.05 : FW * 0.1, borderBottomRightRadius: isSquare ? FW * 0.05 : FW * 0.1 }} />;
            case 'spiky':
                const spikeW = FW * 0.12, spikeH = isSquare ? FH * 0.28 : FH * 0.32, spikeTop = isSquare ? hairTop - FH * 0.05 : hairTop - FH * 0.08;
                return <View style={{ position: 'absolute', left: 0, top: spikeTop, width: FW, height: FH * 0.5 }}>{[-2, -1, 0, 1, 2].map(i => <View key={i} style={{ position: 'absolute', left: FACE_CENTER_X + (i * FW * 0.14) - spikeW / 2, top: Math.abs(i) * FH * 0.04, width: spikeW, height: spikeH, backgroundColor: finalHairColor, borderRadius: spikeW / 2, transform: [{ rotate: `${i * 10}deg` }] }} />)}</View>;
            case 'curly':
                // BUG FIX: Adjustment to top constraint
                const curlSize = FW * 0.18;
                // Move it up significantly. Was causing "not on head" issue.
                const curlTopNew = hairTop - FH * 0.15;
                const curlSpacing = FW * 0.14;
                const totalCurls = 6;
                const totalWidth = totalCurls * curlSpacing;
                const startX = (FW - totalWidth) / 2;
                return <View style={{ position: 'absolute', left: 0, top: curlTopNew, width: FW, height: FH * 0.5 }}>{[0, 1, 2, 3, 4, 5].map(i => <View key={i} style={{ position: 'absolute', left: startX + (i * curlSpacing) + (curlSize * 0.5), top: (i % 2) * FH * 0.05, width: curlSize, height: curlSize, backgroundColor: finalHairColor, borderRadius: curlSize / 2 }} />)}</View>;
            case 'wavy':
                return <View style={{ position: 'absolute', left: -sideExtend, top: hairTop, width: FW + sideExtend * 2, height: FH * 0.6, backgroundColor: finalHairColor, borderTopLeftRadius: isSquare ? FW * 0.2 : FW * 0.5, borderTopRightRadius: isSquare ? FW * 0.2 : FW * 0.5, borderBottomLeftRadius: FW * 0.15, borderBottomRightRadius: FW * 0.15 }} />;
            case 'long':
                const strandW = FW * 0.18;
                return <><View style={{ position: 'absolute', left: -sideExtend, top: hairTop, width: FW + sideExtend * 2, height: FH * 0.45, backgroundColor: finalHairColor, borderTopLeftRadius: isSquare ? FW * 0.2 : FW * 0.5, borderTopRightRadius: isSquare ? FW * 0.2 : FW * 0.5 }} /><View style={{ position: 'absolute', left: -sideExtend - strandW * 0.3, top: FH * 0.1, width: strandW, height: FH * 0.75, backgroundColor: finalHairColor, borderBottomLeftRadius: strandW / 2, borderBottomRightRadius: strandW / 2 }} /><View style={{ position: 'absolute', left: FW + sideExtend - strandW * 0.7, top: FH * 0.1, width: strandW, height: FH * 0.75, backgroundColor: finalHairColor, borderBottomLeftRadius: strandW / 2, borderBottomRightRadius: strandW / 2 }} /></>;
            case 'ponytail':
                const tailW = FW * 0.16, tailH = FH * 0.4;
                return <><View style={{ position: 'absolute', left: FW * 0.05, top: hairTop, width: FW * 0.9, height: FH * 0.38, backgroundColor: finalHairColor, borderTopLeftRadius: topRadius, borderTopRightRadius: topRadius }} /><View style={{ position: 'absolute', left: FW * 0.75, top: hairTop - FH * 0.05, width: tailW, height: tailH, backgroundColor: finalHairColor, borderRadius: tailW / 2, transform: [{ rotate: '35deg' }] }} /></>;
            case 'mohawk':
                const mohawkW = FW * 0.2, mohawkH = isSquare ? FH * 0.45 : FH * 0.5;
                return <View style={{ position: 'absolute', left: FACE_CENTER_X - mohawkW / 2, top: hairTop - (isSquare ? FH * 0.1 : FH * 0.15), width: mohawkW, height: mohawkH, backgroundColor: finalHairColor, borderTopLeftRadius: mohawkW / 2, borderTopRightRadius: mohawkW / 2, borderBottomLeftRadius: mohawkW / 4, borderBottomRightRadius: mohawkW / 4 }} />;
            case 'buzz':
                return <View style={{ position: 'absolute', left: FW * 0.08, top: hairTop + (isSquare ? FH * 0.05 : FH * 0.08), width: FW * 0.84, height: FH * 0.28, backgroundColor: finalHairColor, borderTopLeftRadius: isSquare ? FW * 0.15 : FW * 0.42, borderTopRightRadius: isSquare ? FW * 0.15 : FW * 0.42, opacity: 0.75 }} />;
            case 'cap':
                const brimH = FH * 0.12;
                return <><View style={{ position: 'absolute', left: -sideExtend * 0.5, top: hairTop + FH * 0.02, width: FW + sideExtend, height: FH * 0.35, backgroundColor: finalHairColor, borderTopLeftRadius: isSquare ? FW * 0.2 : FW * 0.5, borderTopRightRadius: isSquare ? FW * 0.2 : FW * 0.5 }} /><View style={{ position: 'absolute', left: -sideExtend * 1.5, top: isSquare ? FH * 0.15 : FH * 0.12, width: FW * 0.55, height: brimH, backgroundColor: finalHairColor, borderRadius: brimH / 2 }} /></>;
            case 'beanie':
                return <><View style={{ position: 'absolute', left: -sideExtend * 0.5, top: hairTop, width: FW + sideExtend, height: FH * 0.42, backgroundColor: finalHairColor, borderTopLeftRadius: isSquare ? FW * 0.2 : FW * 0.5, borderTopRightRadius: isSquare ? FW * 0.2 : FW * 0.5 }} /><View style={{ position: 'absolute', left: -sideExtend, top: isSquare ? FH * 0.18 : FH * 0.15, width: FW + sideExtend * 2, height: FH * 0.1, backgroundColor: finalHairColor, opacity: 0.7 }} /></>;
            // Premium
            case 'afro':
                return <View style={{ position: 'absolute', left: -FW * 0.15, top: -FH * 0.2, width: FW * 1.3, height: FH * 0.6, backgroundColor: finalHairColor, borderRadius: FW * 0.65 }} />;
            case 'flame':
                return <View style={{ position: 'absolute', left: 0, top: -FH * 0.3, width: FW, height: FH * 0.6, alignItems: 'center' }}><View style={{ width: FW * 0.8, height: FH * 0.6, backgroundColor: finalHairColor, borderTopLeftRadius: 100, borderTopRightRadius: 0, borderBottomLeftRadius: 30, transform: [{ rotate: '45deg' }] }} /></View>;

            default: return null;
        }
    };

    const Accessory = () => {
        if (accessory === 'none') return null;
        const glassesWidth = (EYE_RIGHT_X - EYE_LEFT_X) + 20 * S, glassesLeft = EYE_LEFT_X - 10 * S, lensSize = 14 * S, bridgeWidth = EYE_RIGHT_X - EYE_LEFT_X - lensSize;

        // Use custom color if available, otherwise default
        const accColor = accessoryColor || (ACCESSORY_COLORS[accessory] ? ACCESSORY_COLORS[accessory][0] : null);

        switch (accessory) {
            case 'glasses':
                const gColor = accColor || '#2d2d2d';
                return <View style={{ position: 'absolute', left: glassesLeft, top: EYE_Y - 7 * S, width: glassesWidth, height: 14 * S }}><View style={{ position: 'absolute', left: 10 * S - lensSize / 2, top: 0, width: lensSize, height: lensSize, borderWidth: 2 * S, borderColor: gColor, borderRadius: 2 * S, backgroundColor: 'transparent' }} /><View style={{ position: 'absolute', left: 10 * S + (EYE_RIGHT_X - EYE_LEFT_X) - lensSize / 2, top: 0, width: lensSize, height: lensSize, borderWidth: 2 * S, borderColor: gColor, borderRadius: 2 * S, backgroundColor: 'transparent' }} /><View style={{ position: 'absolute', left: 10 * S + lensSize / 2, top: 5 * S, width: bridgeWidth, height: 2 * S, backgroundColor: gColor }} /><View style={{ position: 'absolute', left: 0, top: 3 * S, width: 10 * S - lensSize / 2, height: 2 * S, backgroundColor: gColor }} /><View style={{ position: 'absolute', right: 0, top: 3 * S, width: 10 * S - lensSize / 2, height: 2 * S, backgroundColor: gColor }} /></View>;
            case 'sunglasses': return <View style={{ position: 'absolute', left: glassesLeft, top: EYE_Y - 7 * S, width: glassesWidth, height: 14 * S }}><View style={{ position: 'absolute', left: 10 * S - lensSize / 2, top: 0, width: lensSize, height: lensSize, backgroundColor: '#1a1a1a', borderRadius: 2 * S }} /><View style={{ position: 'absolute', left: 10 * S + (EYE_RIGHT_X - EYE_LEFT_X) - lensSize / 2, top: 0, width: lensSize, height: lensSize, backgroundColor: '#1a1a1a', borderRadius: 2 * S }} /><View style={{ position: 'absolute', left: 10 * S + lensSize / 2, top: 5 * S, width: bridgeWidth, height: 2.5 * S, backgroundColor: '#1a1a1a' }} /><View style={{ position: 'absolute', left: 0, top: 3 * S, width: 10 * S - lensSize / 2, height: 2.5 * S, backgroundColor: '#1a1a1a' }} /><View style={{ position: 'absolute', right: 0, top: 3 * S, width: 10 * S - lensSize / 2, height: 2.5 * S, backgroundColor: '#1a1a1a' }} /></View>;
            case 'roundGlasses': const rs = 13 * S; return <View style={{ position: 'absolute', left: glassesLeft, top: EYE_Y - 6.5 * S, width: glassesWidth, height: 14 * S }}><View style={{ position: 'absolute', left: 10 * S - rs / 2, top: 0, width: rs, height: rs, borderWidth: 1.5 * S, borderColor: '#8B4513', borderRadius: rs / 2, backgroundColor: 'transparent' }} /><View style={{ position: 'absolute', left: 10 * S + (EYE_RIGHT_X - EYE_LEFT_X) - rs / 2, top: 0, width: rs, height: rs, borderWidth: 1.5 * S, borderColor: '#8B4513', borderRadius: rs / 2, backgroundColor: 'transparent' }} /><View style={{ position: 'absolute', left: 10 * S + rs / 2, top: 5 * S, width: (EYE_RIGHT_X - EYE_LEFT_X) - rs, height: 1.5 * S, backgroundColor: '#8B4513' }} /></View>;
            case 'eyepatch': return <><View style={{ position: 'absolute', left: EYE_RIGHT_X - 8 * S, top: EYE_Y - 8 * S, width: 16 * S, height: 16 * S, backgroundColor: '#1a1a1a', borderRadius: 3 * S }} /><View style={{ position: 'absolute', left: EYE_RIGHT_X + 6 * S, top: EYE_Y - 1 * S, width: FW - EYE_RIGHT_X, height: 2 * S, backgroundColor: '#1a1a1a' }} /><View style={{ position: 'absolute', left: 0, top: EYE_Y - 1 * S, width: EYE_RIGHT_X - 8 * S, height: 2 * S, backgroundColor: '#1a1a1a' }} /></>;
            case 'bandana': return <View style={{ position: 'absolute', left: -3 * S, top: -FH * 0.08, width: FW + 6 * S, height: 12 * S, backgroundColor: '#E74C3C', borderRadius: 2 * S }}><View style={{ position: 'absolute', left: FW * 0.7, top: 8 * S, width: 8 * S, height: 15 * S, backgroundColor: '#E74C3C', borderRadius: 4 * S, transform: [{ rotate: '20deg' }] }} /></View>;
            case 'earrings': return <><View style={{ position: 'absolute', left: -4 * S, top: EYE_Y + 8 * S, width: 6 * S, height: 6 * S, backgroundColor: '#FFD700', borderRadius: 3 * S }} /><View style={{ position: 'absolute', left: FW - 2 * S, top: EYE_Y + 8 * S, width: 6 * S, height: 6 * S, backgroundColor: '#FFD700', borderRadius: 3 * S }} /></>;
            case 'headphones': return <><View style={{ position: 'absolute', left: -2 * S, top: -FH * 0.12, width: FW + 4 * S, height: FH * 0.25, borderWidth: 4 * S, borderColor: '#2d2d2d', borderTopLeftRadius: FW * 0.5, borderTopRightRadius: FW * 0.5, borderBottomWidth: 0, backgroundColor: 'transparent' }} /><View style={{ position: 'absolute', left: -10 * S, top: EYE_Y - 5 * S, width: 14 * S, height: 18 * S, backgroundColor: '#2d2d2d', borderRadius: 4 * S }} /><View style={{ position: 'absolute', left: FW - 4 * S, top: EYE_Y - 5 * S, width: 14 * S, height: 18 * S, backgroundColor: '#2d2d2d', borderRadius: 4 * S }} /></>;
            // Premium (with Color Support)
            case 'gamingHeadset':
                const hsColor = accColor || '#00ff00';
                return <><View style={{ position: 'absolute', left: -2 * S, top: -FH * 0.12, width: FW + 4 * S, height: FH * 0.25, borderWidth: 5 * S, borderColor: '#333', borderTopLeftRadius: FW * 0.5, borderTopRightRadius: FW * 0.5, borderBottomWidth: 0, backgroundColor: 'transparent' }} /><View style={{ position: 'absolute', left: -12 * S, top: EYE_Y - 7 * S, width: 16 * S, height: 22 * S, backgroundColor: '#111', borderRadius: 4 * S, borderWidth: 2 * S, borderColor: hsColor }} /><View style={{ position: 'absolute', left: FW - 6 * S, top: EYE_Y - 7 * S, width: 16 * S, height: 22 * S, backgroundColor: '#111', borderRadius: 4 * S, borderWidth: 2 * S, borderColor: hsColor }} /></>;
            case 'halo':
                const hColor = accColor || '#FFD700';
                return <View style={{ position: 'absolute', left: FW * 0.1, top: -FH * 0.35, width: FW * 0.8, height: 6 * S, borderRadius: 3 * S, borderWidth: 2 * S, borderColor: hColor, backgroundColor: 'transparent', shadowColor: hColor, shadowRadius: 5, shadowOpacity: 0.8 }} />;
            case 'crown':
                const cColor = accColor || '#FFD700';
                return <View style={{ position: 'absolute', left: FW * 0.1, top: -FH * 0.25, width: FW * 0.8, height: FH * 0.2, backgroundColor: cColor, borderBottomLeftRadius: 5 * S, borderBottomRightRadius: 5 * S }}><View style={{ position: 'absolute', top: -10 * S, left: 0, width: 10 * S, height: 15 * S, backgroundColor: cColor }} /><View style={{ position: 'absolute', top: -15 * S, left: '40%', width: 12 * S, height: 20 * S, backgroundColor: cColor }} /><View style={{ position: 'absolute', top: -10 * S, right: 0, width: 10 * S, height: 15 * S, backgroundColor: cColor }} /></View>;
            case 'goldChain': return <View style={{ position: 'absolute', left: FW * 0.15, top: MOUTH_Y + 15 * S, width: FW * 0.7, height: 20 * S, borderBottomWidth: 4 * S, borderColor: '#FFD700', borderRadius: FW * 0.35 }} />;
            case 'cyberVisor':
                const vColor = accColor || '#00ffff';
                return <View style={{ position: 'absolute', left: 0, top: EYE_Y - 5 * S, width: FW, height: 10 * S, backgroundColor: '#333', opacity: 0.9 }}><View style={{ width: '100%', height: 2 * S, backgroundColor: vColor, marginTop: 4 * S, shadowColor: vColor, shadowRadius: 4, shadowOpacity: 1 }} /></View>;
            default: return null;
        }
    };

    return (
        <View style={{ width: size, height: size, backgroundColor: finalBgColor, borderRadius: size / 2, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            <View style={{ width: FW, height: FH, position: 'relative' }}>
                {(hairStyle === 'long' || hairStyle === 'wavy' || hairStyle === 'afro' || hairStyle === 'flame') && <Hair />}
                <View style={{ position: 'absolute', left: 0, top: 0, width: FW, height: FH, backgroundColor: finalSkinColor, borderRadius: FR }} />
                {hairStyle !== 'long' && hairStyle !== 'wavy' && hairStyle !== 'afro' && hairStyle !== 'flame' && <Hair />}
                <Eyes /><Mouth /><Accessory />
            </View>
        </View>
    );
};


// ============ BUILDER UI ============
const CustomAvatarBuilder = ({ initialConfig, onSave, onCancel, theme, hasPremium = false, navigation }) => {
    const colors = theme?.colors || { primary: '#FFB800', secondary: '#000', background: '#0a0a0a', surface: '#1a1a1a', text: '#fff', textMuted: '#888' };

    // Ensure initial config has valid values, defaulting to free options
    const [config, setConfig] = useState(initialConfig || {
        faceShape: 'round', skinColor: '#FFDBB4', eyeStyle: 'normal', mouthStyle: 'smile',
        hairStyle: 'none', hairColor: '#1a1a1a', accessory: 'none', accessoryColor: null, bgColor: '#FFB800',
    });
    const [activeTab, setActiveTab] = useState('face');

    const handleSelect = (key, item) => {
        if (item.premium && !hasPremium) {
            playHaptic('warning');
            Alert.alert(
                'Premium Item',
                'This exclusive item is available in the Pro version.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Get Premium',
                        onPress: () => {
                            if (navigation) {
                                onCancel(); // Close builder first
                                navigation.navigate('Premium', { returnToHome: false });
                            }
                        }
                    }
                ]
            );
            return;
        }
        // If color object, take color value. If ID object, take ID.
        const value = item.color || item.id;

        // Color Cycling Logic for Accessories
        if (key === 'accessory' && config.accessory === value && ACCESSORY_COLORS[value]) {
            const palette = ACCESSORY_COLORS[value];
            const currentColor = config.accessoryColor || palette[0];
            const currentIndex = palette.indexOf(currentColor);
            const nextColor = palette[(currentIndex + 1) % palette.length];

            setConfig(p => ({ ...p, accessory: value, accessoryColor: nextColor }));
            playHaptic('medium'); // Distinct haptic for color change
        } else {
            // Normal Selection
            setConfig(p => ({
                ...p,
                [key]: value,
                // Reset accessory color when switching accessories
                ...(key === 'accessory' ? { accessoryColor: ACCESSORY_COLORS[value] ? ACCESSORY_COLORS[value][0] : null } : {})
            }));
            playHaptic('light');
        }
    };

    const randomize = () => {
        playHaptic('medium');
        // Filter randomizer to only include accessible items
        const pick = (arr) => {
            const available = hasPremium ? arr : arr.filter(i => !i.premium);
            return available[Math.floor(Math.random() * available.length)];
        };

        setConfig({
            faceShape: pick(FACE_SHAPES).id,
            skinColor: pick(SKIN_COLORS).color,
            eyeStyle: pick(EYE_STYLES).id,
            mouthStyle: pick(MOUTH_STYLES).id,
            hairStyle: pick(HAIR_STYLES).id,
            hairColor: pick(HAIR_COLORS).color,
            accessory: pick(ACCESSORIES).id,
            bgColor: pick(BG_COLORS).color,
        });
    };

    // Render Option Component
    const OptionItem = ({ item, isSelected, onPress, type = 'text' }) => {
        const isLocked = item.premium && !hasPremium;

        if (type === 'color') {
            return (
                <TouchableOpacity
                    onPress={onPress}
                    style={[
                        styles.colorBtn,
                        { backgroundColor: item.color },
                        isSelected && { borderColor: colors.primary, borderWidth: 3 },
                        isLocked && { opacity: 0.5 }
                    ]}
                >
                    {isLocked && (
                        <View style={styles.lockOverlay}>
                            <Ionicons name="lock-closed" size={12} color="#fff" />
                        </View>
                    )}
                </TouchableOpacity>
            );
        }

        return (
            <TouchableOpacity
                onPress={onPress}
                style={[
                    styles.textBtn,
                    { borderColor: isSelected ? colors.primary : colors.textMuted + '40' },
                    isSelected && { backgroundColor: colors.primary + '20' },
                    isLocked && { borderColor: colors.textMuted + '20', opacity: 0.6 }
                ]}
            >
                <Text style={[styles.textBtnLabel, { color: isSelected ? colors.primary : colors.textMuted }]}>
                    {item.id.toUpperCase()}
                </Text>
                {isLocked && (
                    <View style={styles.textLockOverlay}>
                        <Ionicons name="lock-closed" size={10} color={colors.text} />
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    const TABS = [
        { id: 'face', label: 'FACE' },
        { id: 'eyes', label: 'EYES' },
        { id: 'mouth', label: 'MOUTH' },
        { id: 'hair', label: 'HAIR' },
        { id: 'extras', label: 'MORE' },
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'face':
                return (
                    <View style={styles.tabContent}>
                        <Text style={[styles.sectionTitle, { color: colors.primary }]}>SHAPE</Text>
                        <View style={styles.optionGrid}>
                            {FACE_SHAPES.map(item => (
                                <OptionItem key={item.id} item={item} isSelected={config.faceShape === item.id} onPress={() => handleSelect('faceShape', item)} />
                            ))}
                        </View>

                        <View style={styles.colorSection}>
                            <View style={styles.colorGroup}>
                                <Text style={[styles.sectionTitleSmall, { color: colors.primary }]}>SKIN</Text>
                                <View style={styles.colorRowCompact}>
                                    {SKIN_COLORS.map(item => (
                                        <OptionItem key={item.id} item={item} type="color" isSelected={config.skinColor === item.color} onPress={() => handleSelect('skinColor', item)} />
                                    ))}
                                </View>
                            </View>

                            <View style={styles.colorGroup}>
                                <Text style={[styles.sectionTitleSmall, { color: colors.primary }]}>BACKGROUND</Text>
                                <View style={styles.colorRowCompact}>
                                    {BG_COLORS.map(item => (
                                        <OptionItem key={item.id} item={item} type="color" isSelected={config.bgColor === item.color} onPress={() => handleSelect('bgColor', item)} />
                                    ))}
                                </View>
                            </View>
                        </View>
                    </View>
                );
            case 'eyes':
                return (
                    <View style={styles.tabContent}>
                        <Text style={[styles.sectionTitle, { color: colors.primary }]}>EYE STYLE</Text>
                        <View style={styles.optionGrid}>
                            {EYE_STYLES.map(item => (
                                <OptionItem key={item.id} item={item} isSelected={config.eyeStyle === item.id} onPress={() => handleSelect('eyeStyle', item)} />
                            ))}
                        </View>
                    </View>
                );
            case 'mouth':
                return (
                    <View style={styles.tabContent}>
                        <Text style={[styles.sectionTitle, { color: colors.primary }]}>MOUTH STYLE</Text>
                        <View style={styles.optionGrid}>
                            {MOUTH_STYLES.map(item => (
                                <OptionItem key={item.id} item={item} isSelected={config.mouthStyle === item.id} onPress={() => handleSelect('mouthStyle', item)} />
                            ))}
                        </View>
                    </View>
                );
            case 'hair':
                return (
                    <View style={styles.tabContent}>
                        <Text style={[styles.sectionTitle, { color: colors.primary }]}>HAIR STYLE</Text>
                        <View style={styles.optionGrid}>
                            {HAIR_STYLES.map(item => (
                                <OptionItem key={item.id} item={item} isSelected={config.hairStyle === item.id} onPress={() => handleSelect('hairStyle', item)} />
                            ))}
                        </View>

                        <Text style={[styles.sectionTitle, { color: colors.primary }]}>HAIR COLOR</Text>
                        <View style={styles.colorRow}>
                            {HAIR_COLORS.map(item => (
                                <OptionItem key={item.id} item={item} type="color" isSelected={config.hairColor === item.color} onPress={() => handleSelect('hairColor', item)} />
                            ))}
                        </View>
                    </View>
                );
            case 'extras':
                return (
                    <View style={styles.tabContent}>
                        <Text style={[styles.sectionTitle, { color: colors.primary }]}>ACCESSORIES</Text>
                        <View style={styles.optionGrid}>
                            {ACCESSORIES.map(item => (
                                <OptionItem key={item.id} item={item} isSelected={config.accessory === item.id} onPress={() => handleSelect('accessory', item)} />
                            ))}
                        </View>
                    </View>
                );
            default: return null;
        }
    };

    return (
        <View style={styles.container}>
            {/* Preview Header */}
            <View style={styles.previewSection}>
                <CustomBuiltAvatar config={config} size={80} />
                <TouchableOpacity
                    onPress={randomize}
                    style={[styles.randomBtn, { backgroundColor: colors.primary }]}
                >
                    <Text style={styles.randomText}>🎲</Text>
                </TouchableOpacity>
            </View>

            {/* Tab Navigation */}
            <View style={[styles.tabBar, { borderBottomColor: colors.primary + '30' }]}>
                {TABS.map(tab => (
                    <TouchableOpacity
                        key={tab.id}
                        onPress={() => { playHaptic('light'); setActiveTab(tab.id); }}
                        style={[
                            styles.tabItem,
                            activeTab === tab.id && { borderBottomColor: colors.primary, borderBottomWidth: 3 }
                        ]}
                    >
                        <Text style={[
                            styles.tabText,
                            { color: activeTab === tab.id ? colors.primary : colors.textMuted }
                        ]}>
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Content Area - Scrollable */}
            <ScrollView
                style={styles.contentArea}
                contentContainerStyle={{ paddingBottom: 20 }}
                showsVerticalScrollIndicator={false}
            >
                {renderTabContent()}
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.actionRow}>
                <TouchableOpacity
                    onPress={onCancel}
                    style={[styles.cancelBtn, { borderColor: colors.primary }]}
                >
                    <Text style={[styles.actionBtnText, { color: colors.textMuted }]}>CANCEL</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => { playHaptic('success'); onSave(config); }}
                    style={[styles.saveBtn, { backgroundColor: colors.primary }]}
                >
                    <Text style={[styles.actionBtnText, { color: colors.secondary }]}>SAVE</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 4,
    },

    // Preview Section
    previewSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        gap: 24,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    },
    randomBtn: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    randomText: {
        fontSize: 24,
    },

    // Tab Bar
    tabBar: {
        flexDirection: 'row',
        marginBottom: 16,
        paddingHorizontal: 8,
        justifyContent: 'space-between',
        paddingTop: 8,
    },
    tabItem: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderBottomWidth: 3,
        borderBottomColor: 'transparent',
    },
    tabText: {
        fontSize: 11,
        fontFamily: 'Panchang-Bold',
        letterSpacing: 0.5,
        textAlign: 'center',
    },

    // Content Area
    contentArea: {
        flex: 1,
        paddingHorizontal: 12,
    },
    tabContent: {
        flex: 1,
    },
    sectionTitle: {
        fontSize: 12,
        fontFamily: 'Panchang-Bold',
        letterSpacing: 2,
        marginBottom: 12,
        marginTop: 8,
        textAlign: 'center',
        opacity: 0.9,
    },
    sectionTitleSmall: {
        fontSize: 10,
        fontFamily: 'Panchang-Bold',
        letterSpacing: 1,
        marginBottom: 10,
        marginTop: 4,
        textAlign: 'center',
    },

    // Option Grid
    optionGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 20,
        justifyContent: 'center',
    },
    textBtn: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1.5,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        minWidth: 80,
        justifyContent: 'center',
    },
    textBtnLabel: {
        fontSize: 12,
        fontFamily: 'Teko-Medium',
        letterSpacing: 1,
    },
    textLockOverlay: {
        marginLeft: 4,
        opacity: 0.8,
    },

    // Color Section - side by side layout
    colorSection: {
        flexDirection: 'column',
        gap: 20,
    },
    colorGroup: {
        alignItems: 'center',
        width: '100%',
    },
    colorRowCompact: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        justifyContent: 'center',
    },

    // Color Row
    colorRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 14,
        marginBottom: 16,
        justifyContent: 'center',
    },
    colorBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 0,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    lockOverlay: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.4)',
        width: '100%',
        height: '100%',
        borderRadius: 18
    },

    // Action Buttons
    actionRow: {
        flexDirection: 'row',
        gap: 16,
        paddingTop: 16,
        paddingBottom: 24, // Added bottom padding
        paddingHorizontal: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.05)',
    },
    cancelBtn: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 25,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveBtn: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: "#000", // Add shadow for "pop"
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    actionBtnText: {
        fontSize: 16,
        fontFamily: 'Panchang-Bold', // Match other main buttons
        letterSpacing: 2,
    },
});

export { CustomAvatarBuilder as AvatarBuilder };
export default CustomAvatarBuilder;
