import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { playHaptic } from '../utils/haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Options
const FACE_SHAPES = ['round', 'oval', 'square', 'heart', 'long'];
const SKIN_COLORS = ['#FFDBB4', '#EDB98A', '#D08B5B', '#AE5D29', '#614335', '#F5D0C5'];
const EYE_STYLES = ['normal', 'happy', 'sleepy', 'wink', 'big', 'small', 'angry', 'cute'];
const MOUTH_STYLES = ['smile', 'grin', 'neutral', 'open', 'smirk', 'sad', 'kiss', 'teeth'];
const HAIR_STYLES = ['none', 'short', 'spiky', 'curly', 'wavy', 'long', 'ponytail', 'mohawk', 'buzz', 'cap', 'beanie'];
const HAIR_COLORS = ['#1a1a1a', '#4A3728', '#8B4513', '#D4A574', '#FFD700', '#FF6B6B', '#9B59B6', '#3498DB'];
const ACCESSORIES = ['none', 'glasses', 'sunglasses', 'roundGlasses', 'eyepatch', 'bandana', 'earrings', 'headphones'];
const BG_COLORS = ['#FFB800', '#FF6B6B', '#4ECDC4', '#9B59B6', '#3498DB', '#2ECC71', '#E74C3C', '#1a1a1a'];

// ============ AVATAR DISPLAY COMPONENT ============
export const CustomBuiltAvatar = ({ config, size = 100 }) => {
    const S = size / 100;
    const { faceShape = 'round', skinColor = '#FFDBB4', eyeStyle = 'normal', mouthStyle = 'smile', hairStyle = 'none', hairColor = '#1a1a1a', accessory = 'none', bgColor = '#FFB800' } = config || {};

    const FACE = { round: { w: 64, h: 64, r: 32 }, oval: { w: 56, h: 68, r: 28 }, square: { w: 60, h: 60, r: 12 }, heart: { w: 58, h: 62, r: 29 }, long: { w: 52, h: 70, r: 26 } }[faceShape] || { w: 64, h: 64, r: 32 };
    const FW = FACE.w * S, FH = FACE.h * S, FR = FACE.r * S;
    const EYE_Y = FH * 0.38, EYE_LEFT_X = FW * 0.28, EYE_RIGHT_X = FW * 0.72, MOUTH_Y = FH * 0.68, FACE_CENTER_X = FW / 2;

    const SingleEye = ({ x, isRight, style }) => {
        const baseW = 8 * S, baseH = 9 * S, pupil = 4 * S;
        if (style === 'closed') return <View style={{ position: 'absolute', left: x - 5 * S, top: EYE_Y - 1.5 * S, width: 10 * S, height: 3 * S, backgroundColor: '#2d2d2d', borderRadius: 2 * S }} />;
        if (style === 'happy') return <View style={{ position: 'absolute', left: x - 5 * S, top: EYE_Y - 2.5 * S, width: 10 * S, height: 5 * S, borderBottomWidth: 2.5 * S, borderColor: '#2d2d2d', borderBottomLeftRadius: 8 * S, borderBottomRightRadius: 8 * S, backgroundColor: 'transparent' }} />;
        if (style === 'angry') { const rot = isRight ? '-12deg' : '12deg'; return <View style={{ position: 'absolute', left: x - baseW / 2, top: EYE_Y - baseH / 2 - 4 * S }}><View style={{ width: 9 * S, height: 2 * S, backgroundColor: '#2d2d2d', marginBottom: 2 * S, transform: [{ rotate: rot }], alignSelf: 'center' }} /><View style={{ width: baseW, height: baseH, backgroundColor: '#fff', borderRadius: baseW / 2, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#e0e0e0' }}><View style={{ width: pupil, height: pupil, backgroundColor: '#2d2d2d', borderRadius: pupil / 2 }} /></View></View>; }
        let w = baseW, h = baseH; if (style === 'big') { w = 11 * S; h = 12 * S; } if (style === 'small') { w = 6 * S; h = 7 * S; }
        const isCute = style === 'cute';
        return <View style={{ position: 'absolute', left: x - w / 2, top: EYE_Y - h / 2, width: w, height: h, backgroundColor: '#fff', borderRadius: w / 2, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#e0e0e0' }}><View style={{ width: pupil, height: pupil, backgroundColor: '#2d2d2d', borderRadius: pupil / 2, marginTop: isCute ? -2 * S : 0 }} />{isCute && <View style={{ position: 'absolute', top: 2 * S, right: 2 * S, width: 2.5 * S, height: 2.5 * S, backgroundColor: '#fff', borderRadius: 1.5 * S }} />}</View>;
    };

    const Eyes = () => { const map = { happy: 'happy', sleepy: 'closed', angry: 'angry', big: 'big', small: 'small', cute: 'cute', normal: 'normal' }; const left = eyeStyle === 'wink' ? 'normal' : (map[eyeStyle] || 'normal'); const right = eyeStyle === 'wink' ? 'closed' : (map[eyeStyle] || 'normal'); return <><SingleEye x={EYE_LEFT_X} style={left} /><SingleEye x={EYE_RIGHT_X} style={right} isRight /></>; };

    const Mouth = () => { const cx = FACE_CENTER_X; switch (mouthStyle) { case 'grin': return <View style={{ position: 'absolute', left: cx - 9 * S, top: MOUTH_Y - 4.5 * S, width: 18 * S, height: 9 * S, backgroundColor: '#2d2d2d', borderBottomLeftRadius: 9 * S, borderBottomRightRadius: 9 * S, overflow: 'hidden' }}><View style={{ position: 'absolute', bottom: 0, width: '100%', height: 4 * S, backgroundColor: '#e85a5a' }} /></View>; case 'neutral': return <View style={{ position: 'absolute', left: cx - 6 * S, top: MOUTH_Y - 1.25 * S, width: 12 * S, height: 2.5 * S, backgroundColor: '#2d2d2d', borderRadius: 1.5 * S }} />; case 'open': return <View style={{ position: 'absolute', left: cx - 5 * S, top: MOUTH_Y - 5 * S, width: 10 * S, height: 10 * S, backgroundColor: '#2d2d2d', borderRadius: 5 * S, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 2 * S }}><View style={{ width: 5 * S, height: 3 * S, backgroundColor: '#e85a5a', borderBottomLeftRadius: 3 * S, borderBottomRightRadius: 3 * S }} /></View>; case 'smirk': return <View style={{ position: 'absolute', left: cx - 5 * S, top: MOUTH_Y - 2.5 * S, width: 10 * S, height: 5 * S, borderBottomWidth: 2.5 * S, borderRightWidth: 2 * S, borderColor: '#2d2d2d', borderBottomRightRadius: 8 * S, backgroundColor: 'transparent' }} />; case 'sad': return <View style={{ position: 'absolute', left: cx - 6 * S, top: MOUTH_Y - 2.5 * S, width: 12 * S, height: 5 * S, borderTopWidth: 2.5 * S, borderColor: '#2d2d2d', borderTopLeftRadius: 8 * S, borderTopRightRadius: 8 * S, backgroundColor: 'transparent' }} />; case 'kiss': return <View style={{ position: 'absolute', left: cx - 3.5 * S, top: MOUTH_Y - 3.5 * S, width: 7 * S, height: 7 * S, backgroundColor: '#e85a5a', borderRadius: 3.5 * S }} />; case 'teeth': return <View style={{ position: 'absolute', left: cx - 8 * S, top: MOUTH_Y - 4.5 * S, width: 16 * S, height: 9 * S, backgroundColor: '#2d2d2d', borderRadius: 4 * S, alignItems: 'center', justifyContent: 'center' }}><View style={{ width: 12 * S, height: 4 * S, backgroundColor: '#fff', borderRadius: 1 * S }} /></View>; default: return <View style={{ position: 'absolute', left: cx - 7 * S, top: MOUTH_Y - 3.5 * S, width: 14 * S, height: 7 * S, borderBottomWidth: 2.5 * S, borderColor: '#2d2d2d', borderBottomLeftRadius: 9 * S, borderBottomRightRadius: 9 * S, backgroundColor: 'transparent' }} />; } };

    const Hair = () => {
        if (hairStyle === 'none') return null;
        const isSquare = faceShape === 'square';
        const hairTop = isSquare ? -FH * 0.12 : -FH * 0.18;
        const sideExtend = FW * 0.08;
        const topRadius = isSquare ? FW * 0.15 : FW * 0.45;

        switch (hairStyle) {
            case 'short':
                return <View style={{ position: 'absolute', left: FW * 0.05, top: hairTop, width: FW * 0.9, height: FH * 0.38, backgroundColor: hairColor, borderTopLeftRadius: topRadius, borderTopRightRadius: topRadius, borderBottomLeftRadius: isSquare ? FW * 0.05 : FW * 0.1, borderBottomRightRadius: isSquare ? FW * 0.05 : FW * 0.1 }} />;
            case 'spiky':
                const spikeW = FW * 0.12, spikeH = isSquare ? FH * 0.28 : FH * 0.32, spikeTop = isSquare ? hairTop - FH * 0.05 : hairTop - FH * 0.08;
                return <View style={{ position: 'absolute', left: 0, top: spikeTop, width: FW, height: FH * 0.5 }}>{[-2, -1, 0, 1, 2].map(i => <View key={i} style={{ position: 'absolute', left: FACE_CENTER_X + (i * FW * 0.14) - spikeW / 2, top: Math.abs(i) * FH * 0.04, width: spikeW, height: spikeH, backgroundColor: hairColor, borderRadius: spikeW / 2, transform: [{ rotate: `${i * 10}deg` }] }} />)}</View>;
            case 'curly':
                const curlSize = FW * 0.18, curlTop = isSquare ? hairTop : hairTop - FH * 0.05;
                return <View style={{ position: 'absolute', left: 0, top: curlTop, width: FW, height: FH * 0.4 }}>{[0, 1, 2, 3, 4, 5, 6].map(i => <View key={i} style={{ position: 'absolute', left: (i * FW * 0.14) - sideExtend, top: (i % 2) * FH * 0.06, width: curlSize, height: curlSize, backgroundColor: hairColor, borderRadius: curlSize / 2 }} />)}</View>;
            case 'wavy':
                return <View style={{ position: 'absolute', left: -sideExtend, top: hairTop, width: FW + sideExtend * 2, height: FH * 0.6, backgroundColor: hairColor, borderTopLeftRadius: isSquare ? FW * 0.2 : FW * 0.5, borderTopRightRadius: isSquare ? FW * 0.2 : FW * 0.5, borderBottomLeftRadius: FW * 0.15, borderBottomRightRadius: FW * 0.15 }} />;
            case 'long':
                const strandW = FW * 0.18;
                return <><View style={{ position: 'absolute', left: -sideExtend, top: hairTop, width: FW + sideExtend * 2, height: FH * 0.45, backgroundColor: hairColor, borderTopLeftRadius: isSquare ? FW * 0.2 : FW * 0.5, borderTopRightRadius: isSquare ? FW * 0.2 : FW * 0.5 }} /><View style={{ position: 'absolute', left: -sideExtend - strandW * 0.3, top: FH * 0.1, width: strandW, height: FH * 0.75, backgroundColor: hairColor, borderBottomLeftRadius: strandW / 2, borderBottomRightRadius: strandW / 2 }} /><View style={{ position: 'absolute', left: FW + sideExtend - strandW * 0.7, top: FH * 0.1, width: strandW, height: FH * 0.75, backgroundColor: hairColor, borderBottomLeftRadius: strandW / 2, borderBottomRightRadius: strandW / 2 }} /></>;
            case 'ponytail':
                const tailW = FW * 0.16, tailH = FH * 0.4;
                return <><View style={{ position: 'absolute', left: FW * 0.05, top: hairTop, width: FW * 0.9, height: FH * 0.38, backgroundColor: hairColor, borderTopLeftRadius: topRadius, borderTopRightRadius: topRadius }} /><View style={{ position: 'absolute', left: FW * 0.75, top: hairTop - FH * 0.05, width: tailW, height: tailH, backgroundColor: hairColor, borderRadius: tailW / 2, transform: [{ rotate: '35deg' }] }} /></>;
            case 'mohawk':
                const mohawkW = FW * 0.2, mohawkH = isSquare ? FH * 0.45 : FH * 0.5;
                return <View style={{ position: 'absolute', left: FACE_CENTER_X - mohawkW / 2, top: hairTop - (isSquare ? FH * 0.1 : FH * 0.15), width: mohawkW, height: mohawkH, backgroundColor: hairColor, borderTopLeftRadius: mohawkW / 2, borderTopRightRadius: mohawkW / 2, borderBottomLeftRadius: mohawkW / 4, borderBottomRightRadius: mohawkW / 4 }} />;
            case 'buzz':
                return <View style={{ position: 'absolute', left: FW * 0.08, top: hairTop + (isSquare ? FH * 0.05 : FH * 0.08), width: FW * 0.84, height: FH * 0.28, backgroundColor: hairColor, borderTopLeftRadius: isSquare ? FW * 0.15 : FW * 0.42, borderTopRightRadius: isSquare ? FW * 0.15 : FW * 0.42, opacity: 0.75 }} />;
            case 'cap':
                const brimH = FH * 0.12;
                return <><View style={{ position: 'absolute', left: -sideExtend * 0.5, top: hairTop + FH * 0.02, width: FW + sideExtend, height: FH * 0.35, backgroundColor: hairColor, borderTopLeftRadius: isSquare ? FW * 0.2 : FW * 0.5, borderTopRightRadius: isSquare ? FW * 0.2 : FW * 0.5 }} /><View style={{ position: 'absolute', left: -sideExtend * 1.5, top: isSquare ? FH * 0.15 : FH * 0.12, width: FW * 0.55, height: brimH, backgroundColor: hairColor, borderRadius: brimH / 2 }} /></>;
            case 'beanie':
                return <><View style={{ position: 'absolute', left: -sideExtend * 0.5, top: hairTop, width: FW + sideExtend, height: FH * 0.42, backgroundColor: hairColor, borderTopLeftRadius: isSquare ? FW * 0.2 : FW * 0.5, borderTopRightRadius: isSquare ? FW * 0.2 : FW * 0.5 }} /><View style={{ position: 'absolute', left: -sideExtend, top: isSquare ? FH * 0.18 : FH * 0.15, width: FW + sideExtend * 2, height: FH * 0.1, backgroundColor: hairColor, opacity: 0.7 }} /></>;
            default: return null;
        }
    };

    const Accessory = () => { if (accessory === 'none') return null; const glassesWidth = (EYE_RIGHT_X - EYE_LEFT_X) + 20 * S, glassesLeft = EYE_LEFT_X - 10 * S, lensSize = 14 * S, bridgeWidth = EYE_RIGHT_X - EYE_LEFT_X - lensSize; switch (accessory) { case 'glasses': return <View style={{ position: 'absolute', left: glassesLeft, top: EYE_Y - 7 * S, width: glassesWidth, height: 14 * S }}><View style={{ position: 'absolute', left: 10 * S - lensSize / 2, top: 0, width: lensSize, height: lensSize, borderWidth: 2 * S, borderColor: '#2d2d2d', borderRadius: 2 * S, backgroundColor: 'transparent' }} /><View style={{ position: 'absolute', left: 10 * S + (EYE_RIGHT_X - EYE_LEFT_X) - lensSize / 2, top: 0, width: lensSize, height: lensSize, borderWidth: 2 * S, borderColor: '#2d2d2d', borderRadius: 2 * S, backgroundColor: 'transparent' }} /><View style={{ position: 'absolute', left: 10 * S + lensSize / 2, top: 5 * S, width: bridgeWidth, height: 2 * S, backgroundColor: '#2d2d2d' }} /><View style={{ position: 'absolute', left: 0, top: 3 * S, width: 10 * S - lensSize / 2, height: 2 * S, backgroundColor: '#2d2d2d' }} /><View style={{ position: 'absolute', right: 0, top: 3 * S, width: 10 * S - lensSize / 2, height: 2 * S, backgroundColor: '#2d2d2d' }} /></View>; case 'sunglasses': return <View style={{ position: 'absolute', left: glassesLeft, top: EYE_Y - 7 * S, width: glassesWidth, height: 14 * S }}><View style={{ position: 'absolute', left: 10 * S - lensSize / 2, top: 0, width: lensSize, height: lensSize, backgroundColor: '#1a1a1a', borderRadius: 2 * S }} /><View style={{ position: 'absolute', left: 10 * S + (EYE_RIGHT_X - EYE_LEFT_X) - lensSize / 2, top: 0, width: lensSize, height: lensSize, backgroundColor: '#1a1a1a', borderRadius: 2 * S }} /><View style={{ position: 'absolute', left: 10 * S + lensSize / 2, top: 5 * S, width: bridgeWidth, height: 2.5 * S, backgroundColor: '#1a1a1a' }} /><View style={{ position: 'absolute', left: 0, top: 3 * S, width: 10 * S - lensSize / 2, height: 2.5 * S, backgroundColor: '#1a1a1a' }} /><View style={{ position: 'absolute', right: 0, top: 3 * S, width: 10 * S - lensSize / 2, height: 2.5 * S, backgroundColor: '#1a1a1a' }} /></View>; case 'roundGlasses': const rs = 13 * S; return <View style={{ position: 'absolute', left: glassesLeft, top: EYE_Y - 6.5 * S, width: glassesWidth, height: 14 * S }}><View style={{ position: 'absolute', left: 10 * S - rs / 2, top: 0, width: rs, height: rs, borderWidth: 1.5 * S, borderColor: '#8B4513', borderRadius: rs / 2, backgroundColor: 'transparent' }} /><View style={{ position: 'absolute', left: 10 * S + (EYE_RIGHT_X - EYE_LEFT_X) - rs / 2, top: 0, width: rs, height: rs, borderWidth: 1.5 * S, borderColor: '#8B4513', borderRadius: rs / 2, backgroundColor: 'transparent' }} /><View style={{ position: 'absolute', left: 10 * S + rs / 2, top: 5 * S, width: (EYE_RIGHT_X - EYE_LEFT_X) - rs, height: 1.5 * S, backgroundColor: '#8B4513' }} /></View>; case 'eyepatch': return <><View style={{ position: 'absolute', left: EYE_RIGHT_X - 8 * S, top: EYE_Y - 8 * S, width: 16 * S, height: 16 * S, backgroundColor: '#1a1a1a', borderRadius: 3 * S }} /><View style={{ position: 'absolute', left: EYE_RIGHT_X + 6 * S, top: EYE_Y - 1 * S, width: FW - EYE_RIGHT_X, height: 2 * S, backgroundColor: '#1a1a1a' }} /><View style={{ position: 'absolute', left: 0, top: EYE_Y - 1 * S, width: EYE_RIGHT_X - 8 * S, height: 2 * S, backgroundColor: '#1a1a1a' }} /></>; case 'bandana': return <View style={{ position: 'absolute', left: -3 * S, top: -FH * 0.08, width: FW + 6 * S, height: 12 * S, backgroundColor: '#E74C3C', borderRadius: 2 * S }}><View style={{ position: 'absolute', left: FW * 0.7, top: 8 * S, width: 8 * S, height: 15 * S, backgroundColor: '#E74C3C', borderRadius: 4 * S, transform: [{ rotate: '20deg' }] }} /></View>; case 'earrings': return <><View style={{ position: 'absolute', left: -4 * S, top: EYE_Y + 8 * S, width: 6 * S, height: 6 * S, backgroundColor: '#FFD700', borderRadius: 3 * S }} /><View style={{ position: 'absolute', left: FW - 2 * S, top: EYE_Y + 8 * S, width: 6 * S, height: 6 * S, backgroundColor: '#FFD700', borderRadius: 3 * S }} /></>; case 'headphones': return <><View style={{ position: 'absolute', left: -2 * S, top: -FH * 0.12, width: FW + 4 * S, height: FH * 0.25, borderWidth: 4 * S, borderColor: '#2d2d2d', borderTopLeftRadius: FW * 0.5, borderTopRightRadius: FW * 0.5, borderBottomWidth: 0, backgroundColor: 'transparent' }} /><View style={{ position: 'absolute', left: -10 * S, top: EYE_Y - 5 * S, width: 14 * S, height: 18 * S, backgroundColor: '#2d2d2d', borderRadius: 4 * S }} /><View style={{ position: 'absolute', left: FW - 4 * S, top: EYE_Y - 5 * S, width: 14 * S, height: 18 * S, backgroundColor: '#2d2d2d', borderRadius: 4 * S }} /></>; default: return null; } };

    return (
        <View style={{ width: size, height: size, backgroundColor: bgColor, borderRadius: size / 2, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            <View style={{ width: FW, height: FH, position: 'relative' }}>
                {(hairStyle === 'long' || hairStyle === 'wavy') && <Hair />}
                <View style={{ position: 'absolute', left: 0, top: 0, width: FW, height: FH, backgroundColor: skinColor, borderRadius: FR }} />
                {hairStyle !== 'long' && hairStyle !== 'wavy' && <Hair />}
                <Eyes /><Mouth /><Accessory />
            </View>
        </View>
    );
};


// ============ BUILDER UI ============
const TABS = [
    { id: 'face', label: 'FACE' },
    { id: 'eyes', label: 'EYES' },
    { id: 'mouth', label: 'MOUTH' },
    { id: 'hair', label: 'HAIR' },
    { id: 'extras', label: 'EXTRAS' },
];

const CustomAvatarBuilder = ({ initialConfig, onSave, onCancel, theme }) => {
    const colors = theme?.colors || { primary: '#FFB800', secondary: '#000', background: '#0a0a0a', surface: '#1a1a1a', text: '#fff', textMuted: '#888' };

    const [config, setConfig] = useState(initialConfig || {
        faceShape: 'round', skinColor: '#FFDBB4', eyeStyle: 'normal', mouthStyle: 'smile',
        hairStyle: 'none', hairColor: '#1a1a1a', accessory: 'none', bgColor: '#FFB800',
    });
    const [activeTab, setActiveTab] = useState('face');

    const update = (key, value) => { playHaptic('light'); setConfig(p => ({ ...p, [key]: value })); };

    const randomize = () => {
        playHaptic('medium');
        setConfig({
            faceShape: FACE_SHAPES[Math.floor(Math.random() * FACE_SHAPES.length)],
            skinColor: SKIN_COLORS[Math.floor(Math.random() * SKIN_COLORS.length)],
            eyeStyle: EYE_STYLES[Math.floor(Math.random() * EYE_STYLES.length)],
            mouthStyle: MOUTH_STYLES[Math.floor(Math.random() * MOUTH_STYLES.length)],
            hairStyle: HAIR_STYLES[Math.floor(Math.random() * HAIR_STYLES.length)],
            hairColor: HAIR_COLORS[Math.floor(Math.random() * HAIR_COLORS.length)],
            accessory: ACCESSORIES[Math.floor(Math.random() * ACCESSORIES.length)],
            bgColor: BG_COLORS[Math.floor(Math.random() * BG_COLORS.length)],
        });
    };

    const PillBtn = ({ value, selected, onPress }) => (
        <TouchableOpacity onPress={onPress} style={[styles.pillBtn, { borderColor: selected ? colors.primary : colors.textMuted + '50', backgroundColor: selected ? colors.primary + '20' : 'transparent' }]}>
            <Text style={[styles.pillBtnText, { color: selected ? colors.primary : colors.textMuted }]}>{value.toUpperCase()}</Text>
        </TouchableOpacity>
    );

    const ColorBtn = ({ color, selected, onPress }) => (
        <TouchableOpacity onPress={onPress} style={[styles.colorBtn, { backgroundColor: color }, selected && { borderColor: colors.primary, borderWidth: 3, transform: [{ scale: 1.1 }] }]} />
    );

    const renderTabContent = () => {
        // Replaced ScrollView with View + flexWrap for non-scrolling layout
        // Assuming content fits. If it doesn't, we can reduce padding or item size.
        // For HAIRSTYLES (11 items), it should wrap to ~4 lines. 
        // With PillBtn height ~35px + margin 12px = ~47px * 4 = 188px.
        // Plus Color row ~40px. Total ~230px. Should fit easily in remaining space.

        const ContentContainer = ({ children }) => (
            <View style={styles.tabContentContainer}>
                {children}
            </View>
        );

        switch (activeTab) {
            case 'face':
                return (
                    <ContentContainer>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>SHAPE</Text>
                        <View style={styles.optionRow}>{FACE_SHAPES.map(v => <PillBtn key={v} value={v} selected={config.faceShape === v} onPress={() => update('faceShape', v)} />)}</View>
                        <Text style={[styles.sectionTitleSmall, { color: colors.text }]}>SKIN CODE</Text>
                        <View style={styles.colorRow}>{SKIN_COLORS.map(c => <ColorBtn key={c} color={c} selected={config.skinColor === c} onPress={() => update('skinColor', c)} />)}</View>
                        <Text style={[styles.sectionTitleSmall, { color: colors.text }]}>BACKGROUND</Text>
                        <View style={styles.colorRow}>{BG_COLORS.map(c => <ColorBtn key={c} color={c} selected={config.bgColor === c} onPress={() => update('bgColor', c)} />)}</View>
                    </ContentContainer>
                );
            case 'eyes':
                return (
                    <ContentContainer>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>STYLE</Text>
                        <View style={styles.optionRow}>{EYE_STYLES.map(v => <PillBtn key={v} value={v} selected={config.eyeStyle === v} onPress={() => update('eyeStyle', v)} />)}</View>
                    </ContentContainer>
                );
            case 'mouth':
                return (
                    <ContentContainer>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>STYLE</Text>
                        <View style={styles.optionRow}>{MOUTH_STYLES.map(v => <PillBtn key={v} value={v} selected={config.mouthStyle === v} onPress={() => update('mouthStyle', v)} />)}</View>
                    </ContentContainer>
                );
            case 'hair':
                return (
                    <ContentContainer>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>STYLE</Text>
                        <View style={styles.optionRow}>{HAIR_STYLES.map(v => <PillBtn key={v} value={v} selected={config.hairStyle === v} onPress={() => update('hairStyle', v)} />)}</View>
                        <Text style={[styles.sectionTitleSmall, { color: colors.text }]}>COLOR</Text>
                        <View style={styles.colorRow}>{HAIR_COLORS.map(c => <ColorBtn key={c} color={c} selected={config.hairColor === c} onPress={() => update('hairColor', c)} />)}</View>
                    </ContentContainer>
                );
            case 'extras':
                return (
                    <ContentContainer>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>ACCESSORY</Text>
                        <View style={styles.optionRow}>{ACCESSORIES.map(v => <PillBtn key={v} value={v} selected={config.accessory === v} onPress={() => update('accessory', v)} />)}</View>
                    </ContentContainer>
                );
            default:
                return null;
        }
    };

    return (
        <View style={styles.container}>
            {/* Preview Header */}
            <View style={styles.previewSection}>
                <CustomBuiltAvatar config={config} size={100} />
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

            {/* Content Area */}
            <View style={styles.contentArea}>
                {renderTabContent()}
            </View>

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
        paddingHorizontal: 20,
    },

    // Preview Section
    previewSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        gap: 20,
    },
    randomBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    randomText: {
        fontSize: 22,
    },

    // Tab Bar
    tabBar: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        marginBottom: 16,
    },
    tabItem: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
    },
    tabText: {
        fontSize: 10,
        fontFamily: 'Panchang-Bold',
        letterSpacing: 1,
        textAlign: 'center',
    },

    // Content Area
    contentArea: {
        flex: 1,
        justifyContent: 'flex-start', // Align to top
    },
    tabContentContainer: {
        width: '100%',
    },
    sectionTitle: {
        fontSize: 12,
        fontFamily: 'Panchang-Bold',
        letterSpacing: 2,
        marginBottom: 12,
        marginTop: 4,
    },
    sectionTitleSmall: {
        fontSize: 11,
        fontFamily: 'Panchang-Bold',
        letterSpacing: 1,
        marginBottom: 8,
        marginTop: 8,
    },

    // Option Row
    optionRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 12,
    },
    pillBtn: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 16,
        borderWidth: 1,
    },
    pillBtnText: {
        fontSize: 10,
        fontFamily: 'Teko-Bold',
        letterSpacing: 1,
    },

    // Color Row
    colorRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 12,
    },
    colorBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 0,
    },

    // Action Buttons
    actionRow: {
        flexDirection: 'row',
        gap: 16,
        paddingBottom: Platform.OS === 'ios' ? 30 : 20,
        paddingTop: 10,
    },
    cancelBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 25,
        borderWidth: 1,
        alignItems: 'center',
    },
    saveBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 25,
        alignItems: 'center',
    },
    actionBtnText: {
        fontSize: 14,
        fontFamily: 'Panchang-Bold',
        letterSpacing: 2,
    },
});

export { CustomAvatarBuilder as AvatarBuilder };
export default CustomAvatarBuilder;
