import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
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
        if (style === 'closed') return <View style={{ position: 'absolute', left: x - 5*S, top: EYE_Y - 1.5*S, width: 10*S, height: 3*S, backgroundColor: '#2d2d2d', borderRadius: 2*S }} />;
        if (style === 'happy') return <View style={{ position: 'absolute', left: x - 5*S, top: EYE_Y - 2.5*S, width: 10*S, height: 5*S, borderBottomWidth: 2.5*S, borderColor: '#2d2d2d', borderBottomLeftRadius: 8*S, borderBottomRightRadius: 8*S, backgroundColor: 'transparent' }} />;
        if (style === 'angry') { const rot = isRight ? '-12deg' : '12deg'; return <View style={{ position: 'absolute', left: x - baseW/2, top: EYE_Y - baseH/2 - 4*S }}><View style={{ width: 9*S, height: 2*S, backgroundColor: '#2d2d2d', marginBottom: 2*S, transform: [{ rotate: rot }], alignSelf: 'center' }} /><View style={{ width: baseW, height: baseH, backgroundColor: '#fff', borderRadius: baseW/2, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#e0e0e0' }}><View style={{ width: pupil, height: pupil, backgroundColor: '#2d2d2d', borderRadius: pupil/2 }} /></View></View>; }
        let w = baseW, h = baseH; if (style === 'big') { w = 11*S; h = 12*S; } if (style === 'small') { w = 6*S; h = 7*S; }
        const isCute = style === 'cute';
        return <View style={{ position: 'absolute', left: x - w/2, top: EYE_Y - h/2, width: w, height: h, backgroundColor: '#fff', borderRadius: w/2, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#e0e0e0' }}><View style={{ width: pupil, height: pupil, backgroundColor: '#2d2d2d', borderRadius: pupil/2, marginTop: isCute ? -2*S : 0 }} />{isCute && <View style={{ position: 'absolute', top: 2*S, right: 2*S, width: 2.5*S, height: 2.5*S, backgroundColor: '#fff', borderRadius: 1.5*S }} />}</View>;
    };

    const Eyes = () => { const map = { happy: 'happy', sleepy: 'closed', angry: 'angry', big: 'big', small: 'small', cute: 'cute', normal: 'normal' }; const left = eyeStyle === 'wink' ? 'normal' : (map[eyeStyle] || 'normal'); const right = eyeStyle === 'wink' ? 'closed' : (map[eyeStyle] || 'normal'); return <><SingleEye x={EYE_LEFT_X} style={left} /><SingleEye x={EYE_RIGHT_X} style={right} isRight /></>; };

    const Mouth = () => { const cx = FACE_CENTER_X; switch (mouthStyle) { case 'grin': return <View style={{ position: 'absolute', left: cx - 9*S, top: MOUTH_Y - 4.5*S, width: 18*S, height: 9*S, backgroundColor: '#2d2d2d', borderBottomLeftRadius: 9*S, borderBottomRightRadius: 9*S, overflow: 'hidden' }}><View style={{ position: 'absolute', bottom: 0, width: '100%', height: 4*S, backgroundColor: '#e85a5a' }} /></View>; case 'neutral': return <View style={{ position: 'absolute', left: cx - 6*S, top: MOUTH_Y - 1.25*S, width: 12*S, height: 2.5*S, backgroundColor: '#2d2d2d', borderRadius: 1.5*S }} />; case 'open': return <View style={{ position: 'absolute', left: cx - 5*S, top: MOUTH_Y - 5*S, width: 10*S, height: 10*S, backgroundColor: '#2d2d2d', borderRadius: 5*S, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 2*S }}><View style={{ width: 5*S, height: 3*S, backgroundColor: '#e85a5a', borderBottomLeftRadius: 3*S, borderBottomRightRadius: 3*S }} /></View>; case 'smirk': return <View style={{ position: 'absolute', left: cx - 5*S, top: MOUTH_Y - 2.5*S, width: 10*S, height: 5*S, borderBottomWidth: 2.5*S, borderRightWidth: 2*S, borderColor: '#2d2d2d', borderBottomRightRadius: 8*S, backgroundColor: 'transparent' }} />; case 'sad': return <View style={{ position: 'absolute', left: cx - 6*S, top: MOUTH_Y - 2.5*S, width: 12*S, height: 5*S, borderTopWidth: 2.5*S, borderColor: '#2d2d2d', borderTopLeftRadius: 8*S, borderTopRightRadius: 8*S, backgroundColor: 'transparent' }} />; case 'kiss': return <View style={{ position: 'absolute', left: cx - 3.5*S, top: MOUTH_Y - 3.5*S, width: 7*S, height: 7*S, backgroundColor: '#e85a5a', borderRadius: 3.5*S }} />; case 'teeth': return <View style={{ position: 'absolute', left: cx - 8*S, top: MOUTH_Y - 4.5*S, width: 16*S, height: 9*S, backgroundColor: '#2d2d2d', borderRadius: 4*S, alignItems: 'center', justifyContent: 'center' }}><View style={{ width: 12*S, height: 4*S, backgroundColor: '#fff', borderRadius: 1*S }} /></View>; default: return <View style={{ position: 'absolute', left: cx - 7*S, top: MOUTH_Y - 3.5*S, width: 14*S, height: 7*S, borderBottomWidth: 2.5*S, borderColor: '#2d2d2d', borderBottomLeftRadius: 9*S, borderBottomRightRadius: 9*S, backgroundColor: 'transparent' }} />; } };

    // Hair component - all dimensions based on face width (FW) and height (FH) for perfect scaling
    const Hair = () => {
        if (hairStyle === 'none') return null;
        
        // Adjust hair positioning based on face shape
        // Square face has flatter top, so hair sits differently
        const isSquare = faceShape === 'square';
        const hairTop = isSquare ? -FH * 0.12 : -FH * 0.18;
        const sideExtend = FW * 0.08;
        // Square face needs less rounded corners on hair
        const topRadius = isSquare ? FW * 0.15 : FW * 0.45;
        
        switch (hairStyle) {
            case 'short':
                return (
                    <View style={{
                        position: 'absolute',
                        left: FW * 0.05,
                        top: hairTop,
                        width: FW * 0.9,
                        height: FH * 0.38,
                        backgroundColor: hairColor,
                        borderTopLeftRadius: topRadius,
                        borderTopRightRadius: topRadius,
                        borderBottomLeftRadius: isSquare ? FW * 0.05 : FW * 0.1,
                        borderBottomRightRadius: isSquare ? FW * 0.05 : FW * 0.1,
                    }} />
                );
                
            case 'spiky':
                const spikeW = FW * 0.12;
                const spikeH = isSquare ? FH * 0.28 : FH * 0.32;
                const spikeTop = isSquare ? hairTop - FH * 0.05 : hairTop - FH * 0.08;
                return (
                    <View style={{ position: 'absolute', left: 0, top: spikeTop, width: FW, height: FH * 0.5 }}>
                        {[-2, -1, 0, 1, 2].map(i => (
                            <View key={i} style={{
                                position: 'absolute',
                                left: FACE_CENTER_X + (i * FW * 0.14) - spikeW/2,
                                top: Math.abs(i) * FH * 0.04,
                                width: spikeW,
                                height: spikeH,
                                backgroundColor: hairColor,
                                borderRadius: spikeW / 2,
                                transform: [{ rotate: `${i * 10}deg` }],
                            }} />
                        ))}
                    </View>
                );
                
            case 'curly':
                const curlSize = FW * 0.18;
                const curlTop = isSquare ? hairTop : hairTop - FH * 0.05;
                const curls = [];
                for (let i = 0; i < 7; i++) {
                    curls.push(
                        <View key={i} style={{
                            position: 'absolute',
                            left: (i * FW * 0.14) - sideExtend,
                            top: (i % 2) * FH * 0.06,
                            width: curlSize,
                            height: curlSize,
                            backgroundColor: hairColor,
                            borderRadius: curlSize / 2,
                        }} />
                    );
                }
                return (
                    <View style={{ position: 'absolute', left: 0, top: curlTop, width: FW, height: FH * 0.4 }}>
                        {curls}
                    </View>
                );
                
            case 'wavy':
                return (
                    <View style={{
                        position: 'absolute',
                        left: -sideExtend,
                        top: hairTop,
                        width: FW + sideExtend * 2,
                        height: FH * 0.6,
                        backgroundColor: hairColor,
                        borderTopLeftRadius: isSquare ? FW * 0.2 : FW * 0.5,
                        borderTopRightRadius: isSquare ? FW * 0.2 : FW * 0.5,
                        borderBottomLeftRadius: FW * 0.15,
                        borderBottomRightRadius: FW * 0.15,
                    }} />
                );
                
            case 'long':
                const strandW = FW * 0.18;
                return (
                    <>
                        <View style={{
                            position: 'absolute',
                            left: -sideExtend,
                            top: hairTop,
                            width: FW + sideExtend * 2,
                            height: FH * 0.45,
                            backgroundColor: hairColor,
                            borderTopLeftRadius: isSquare ? FW * 0.2 : FW * 0.5,
                            borderTopRightRadius: isSquare ? FW * 0.2 : FW * 0.5,
                        }} />
                        <View style={{
                            position: 'absolute',
                            left: -sideExtend - strandW * 0.3,
                            top: FH * 0.1,
                            width: strandW,
                            height: FH * 0.75,
                            backgroundColor: hairColor,
                            borderBottomLeftRadius: strandW / 2,
                            borderBottomRightRadius: strandW / 2,
                        }} />
                        <View style={{
                            position: 'absolute',
                            left: FW + sideExtend - strandW * 0.7,
                            top: FH * 0.1,
                            width: strandW,
                            height: FH * 0.75,
                            backgroundColor: hairColor,
                            borderBottomLeftRadius: strandW / 2,
                            borderBottomRightRadius: strandW / 2,
                        }} />
                    </>
                );
                
            case 'ponytail':
                const tailW = FW * 0.16;
                const tailH = FH * 0.4;
                return (
                    <>
                        <View style={{
                            position: 'absolute',
                            left: FW * 0.05,
                            top: hairTop,
                            width: FW * 0.9,
                            height: FH * 0.38,
                            backgroundColor: hairColor,
                            borderTopLeftRadius: topRadius,
                            borderTopRightRadius: topRadius,
                        }} />
                        <View style={{
                            position: 'absolute',
                            left: FW * 0.75,
                            top: hairTop - FH * 0.05,
                            width: tailW,
                            height: tailH,
                            backgroundColor: hairColor,
                            borderRadius: tailW / 2,
                            transform: [{ rotate: '35deg' }],
                        }} />
                    </>
                );
                
            case 'mohawk':
                const mohawkW = FW * 0.2;
                const mohawkH = isSquare ? FH * 0.45 : FH * 0.5;
                return (
                    <View style={{
                        position: 'absolute',
                        left: FACE_CENTER_X - mohawkW / 2,
                        top: hairTop - (isSquare ? FH * 0.1 : FH * 0.15),
                        width: mohawkW,
                        height: mohawkH,
                        backgroundColor: hairColor,
                        borderTopLeftRadius: mohawkW / 2,
                        borderTopRightRadius: mohawkW / 2,
                        borderBottomLeftRadius: mohawkW / 4,
                        borderBottomRightRadius: mohawkW / 4,
                    }} />
                );
                
            case 'buzz':
                return (
                    <View style={{
                        position: 'absolute',
                        left: FW * 0.08,
                        top: hairTop + (isSquare ? FH * 0.05 : FH * 0.08),
                        width: FW * 0.84,
                        height: FH * 0.28,
                        backgroundColor: hairColor,
                        borderTopLeftRadius: isSquare ? FW * 0.15 : FW * 0.42,
                        borderTopRightRadius: isSquare ? FW * 0.15 : FW * 0.42,
                        opacity: 0.75,
                    }} />
                );
                
            case 'cap':
                const brimW = FW * 0.55;
                const brimH = FH * 0.12;
                return (
                    <>
                        <View style={{
                            position: 'absolute',
                            left: -sideExtend * 0.5,
                            top: hairTop + FH * 0.02,
                            width: FW + sideExtend,
                            height: FH * 0.35,
                            backgroundColor: hairColor,
                            borderTopLeftRadius: isSquare ? FW * 0.2 : FW * 0.5,
                            borderTopRightRadius: isSquare ? FW * 0.2 : FW * 0.5,
                        }} />
                        <View style={{
                            position: 'absolute',
                            left: -sideExtend * 1.5,
                            top: isSquare ? FH * 0.15 : FH * 0.12,
                            width: brimW,
                            height: brimH,
                            backgroundColor: hairColor,
                            borderRadius: brimH / 2,
                        }} />
                    </>
                );
                
            case 'beanie':
                return (
                    <>
                        <View style={{
                            position: 'absolute',
                            left: -sideExtend * 0.5,
                            top: hairTop,
                            width: FW + sideExtend,
                            height: FH * 0.42,
                            backgroundColor: hairColor,
                            borderTopLeftRadius: isSquare ? FW * 0.2 : FW * 0.5,
                            borderTopRightRadius: isSquare ? FW * 0.2 : FW * 0.5,
                        }} />
                        <View style={{
                            position: 'absolute',
                            left: -sideExtend,
                            top: isSquare ? FH * 0.18 : FH * 0.15,
                            width: FW + sideExtend * 2,
                            height: FH * 0.1,
                            backgroundColor: hairColor,
                            opacity: 0.7,
                        }} />
                    </>
                );
                
            default:
                return null;
        }
    };

    const Accessory = () => { if (accessory === 'none') return null; const glassesWidth = (EYE_RIGHT_X - EYE_LEFT_X) + 20*S, glassesLeft = EYE_LEFT_X - 10*S, lensSize = 14*S, bridgeWidth = EYE_RIGHT_X - EYE_LEFT_X - lensSize; switch (accessory) { case 'glasses': return <View style={{ position: 'absolute', left: glassesLeft, top: EYE_Y - 7*S, width: glassesWidth, height: 14*S }}><View style={{ position: 'absolute', left: 10*S - lensSize/2, top: 0, width: lensSize, height: lensSize, borderWidth: 2*S, borderColor: '#2d2d2d', borderRadius: 2*S, backgroundColor: 'transparent' }} /><View style={{ position: 'absolute', left: 10*S + (EYE_RIGHT_X - EYE_LEFT_X) - lensSize/2, top: 0, width: lensSize, height: lensSize, borderWidth: 2*S, borderColor: '#2d2d2d', borderRadius: 2*S, backgroundColor: 'transparent' }} /><View style={{ position: 'absolute', left: 10*S + lensSize/2, top: 5*S, width: bridgeWidth, height: 2*S, backgroundColor: '#2d2d2d' }} /><View style={{ position: 'absolute', left: 0, top: 3*S, width: 10*S - lensSize/2, height: 2*S, backgroundColor: '#2d2d2d' }} /><View style={{ position: 'absolute', right: 0, top: 3*S, width: 10*S - lensSize/2, height: 2*S, backgroundColor: '#2d2d2d' }} /></View>; case 'sunglasses': return <View style={{ position: 'absolute', left: glassesLeft, top: EYE_Y - 7*S, width: glassesWidth, height: 14*S }}><View style={{ position: 'absolute', left: 10*S - lensSize/2, top: 0, width: lensSize, height: lensSize, backgroundColor: '#1a1a1a', borderRadius: 2*S }} /><View style={{ position: 'absolute', left: 10*S + (EYE_RIGHT_X - EYE_LEFT_X) - lensSize/2, top: 0, width: lensSize, height: lensSize, backgroundColor: '#1a1a1a', borderRadius: 2*S }} /><View style={{ position: 'absolute', left: 10*S + lensSize/2, top: 5*S, width: bridgeWidth, height: 2.5*S, backgroundColor: '#1a1a1a' }} /><View style={{ position: 'absolute', left: 0, top: 3*S, width: 10*S - lensSize/2, height: 2.5*S, backgroundColor: '#1a1a1a' }} /><View style={{ position: 'absolute', right: 0, top: 3*S, width: 10*S - lensSize/2, height: 2.5*S, backgroundColor: '#1a1a1a' }} /></View>; case 'roundGlasses': const rs = 13*S; return <View style={{ position: 'absolute', left: glassesLeft, top: EYE_Y - 6.5*S, width: glassesWidth, height: 14*S }}><View style={{ position: 'absolute', left: 10*S - rs/2, top: 0, width: rs, height: rs, borderWidth: 1.5*S, borderColor: '#8B4513', borderRadius: rs/2, backgroundColor: 'transparent' }} /><View style={{ position: 'absolute', left: 10*S + (EYE_RIGHT_X - EYE_LEFT_X) - rs/2, top: 0, width: rs, height: rs, borderWidth: 1.5*S, borderColor: '#8B4513', borderRadius: rs/2, backgroundColor: 'transparent' }} /><View style={{ position: 'absolute', left: 10*S + rs/2, top: 5*S, width: (EYE_RIGHT_X - EYE_LEFT_X) - rs, height: 1.5*S, backgroundColor: '#8B4513' }} /></View>; case 'eyepatch': return <><View style={{ position: 'absolute', left: EYE_RIGHT_X - 8*S, top: EYE_Y - 8*S, width: 16*S, height: 16*S, backgroundColor: '#1a1a1a', borderRadius: 3*S }} /><View style={{ position: 'absolute', left: EYE_RIGHT_X + 6*S, top: EYE_Y - 1*S, width: FW - EYE_RIGHT_X, height: 2*S, backgroundColor: '#1a1a1a' }} /><View style={{ position: 'absolute', left: 0, top: EYE_Y - 1*S, width: EYE_RIGHT_X - 8*S, height: 2*S, backgroundColor: '#1a1a1a' }} /></>; case 'bandana': return <View style={{ position: 'absolute', left: -3*S, top: -FH * 0.08, width: FW + 6*S, height: 12*S, backgroundColor: '#E74C3C', borderRadius: 2*S }}><View style={{ position: 'absolute', left: FW * 0.7, top: 8*S, width: 8*S, height: 15*S, backgroundColor: '#E74C3C', borderRadius: 4*S, transform: [{ rotate: '20deg' }] }} /></View>; case 'earrings': return <><View style={{ position: 'absolute', left: -4*S, top: EYE_Y + 8*S, width: 6*S, height: 6*S, backgroundColor: '#FFD700', borderRadius: 3*S }} /><View style={{ position: 'absolute', left: FW - 2*S, top: EYE_Y + 8*S, width: 6*S, height: 6*S, backgroundColor: '#FFD700', borderRadius: 3*S }} /></>; case 'headphones': return <><View style={{ position: 'absolute', left: -2*S, top: -FH * 0.12, width: FW + 4*S, height: FH * 0.25, borderWidth: 4*S, borderColor: '#2d2d2d', borderTopLeftRadius: FW * 0.5, borderTopRightRadius: FW * 0.5, borderBottomWidth: 0, backgroundColor: 'transparent' }} /><View style={{ position: 'absolute', left: -10*S, top: EYE_Y - 5*S, width: 14*S, height: 18*S, backgroundColor: '#2d2d2d', borderRadius: 4*S }} /><View style={{ position: 'absolute', left: FW - 4*S, top: EYE_Y - 5*S, width: 14*S, height: 18*S, backgroundColor: '#2d2d2d', borderRadius: 4*S }} /></>; default: return null; } };

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


// ============ BUILDER UI - GRID LAYOUT ============
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

    // Text option button
    const TextBtn = ({ value, selected, onPress }) => (
        <TouchableOpacity 
            onPress={onPress} 
            style={[styles.textBtn, { borderColor: selected ? colors.primary : colors.textMuted + '40' }, selected && { backgroundColor: colors.primary + '20' }]}
        >
            <Text style={[styles.textBtnLabel, { color: selected ? colors.primary : colors.textMuted }]}>{value.toUpperCase()}</Text>
        </TouchableOpacity>
    );

    // Color option button
    const ColorBtn = ({ color, selected, onPress }) => (
        <TouchableOpacity 
            onPress={onPress} 
            style={[styles.colorBtn, { backgroundColor: color, borderColor: selected ? colors.primary : 'transparent', borderWidth: selected ? 3 : 0 }]}
        />
    );

    const renderTab = () => {
        switch (activeTab) {
            case 'face':
                return (
                    <View style={styles.tabContent}>
                        <Text style={[styles.sectionTitle, { color: colors.primary }]}>SHAPE</Text>
                        <View style={styles.grid}>
                            {FACE_SHAPES.map(v => <TextBtn key={v} value={v} selected={config.faceShape === v} onPress={() => update('faceShape', v)} />)}
                        </View>
                        <Text style={[styles.sectionTitle, { color: colors.primary }]}>SKIN</Text>
                        <View style={styles.colorGrid}>
                            {SKIN_COLORS.map(c => <ColorBtn key={c} color={c} selected={config.skinColor === c} onPress={() => update('skinColor', c)} />)}
                        </View>
                        <Text style={[styles.sectionTitle, { color: colors.primary }]}>BACKGROUND</Text>
                        <View style={styles.colorGrid}>
                            {BG_COLORS.map(c => <ColorBtn key={c} color={c} selected={config.bgColor === c} onPress={() => update('bgColor', c)} />)}
                        </View>
                    </View>
                );
            case 'eyes':
                return (
                    <View style={styles.tabContent}>
                        <Text style={[styles.sectionTitle, { color: colors.primary }]}>STYLE</Text>
                        <View style={styles.grid}>
                            {EYE_STYLES.map(v => <TextBtn key={v} value={v} selected={config.eyeStyle === v} onPress={() => update('eyeStyle', v)} />)}
                        </View>
                    </View>
                );
            case 'mouth':
                return (
                    <View style={styles.tabContent}>
                        <Text style={[styles.sectionTitle, { color: colors.primary }]}>STYLE</Text>
                        <View style={styles.grid}>
                            {MOUTH_STYLES.map(v => <TextBtn key={v} value={v} selected={config.mouthStyle === v} onPress={() => update('mouthStyle', v)} />)}
                        </View>
                    </View>
                );
            case 'hair':
                return (
                    <View style={styles.tabContent}>
                        <Text style={[styles.sectionTitle, { color: colors.primary }]}>STYLE</Text>
                        <View style={styles.grid}>
                            {HAIR_STYLES.map(v => <TextBtn key={v} value={v} selected={config.hairStyle === v} onPress={() => update('hairStyle', v)} />)}
                        </View>
                        <Text style={[styles.sectionTitle, { color: colors.primary }]}>COLOR</Text>
                        <View style={styles.colorGrid}>
                            {HAIR_COLORS.map(c => <ColorBtn key={c} color={c} selected={config.hairColor === c} onPress={() => update('hairColor', c)} />)}
                        </View>
                    </View>
                );
            case 'extras':
                return (
                    <View style={styles.tabContent}>
                        <Text style={[styles.sectionTitle, { color: colors.primary }]}>ACCESSORY</Text>
                        <View style={styles.grid}>
                            {ACCESSORIES.map(v => <TextBtn key={v} value={v} selected={config.accessory === v} onPress={() => update('accessory', v)} />)}
                        </View>
                    </View>
                );
            default: return null;
        }
    };

    return (
        <View style={styles.container}>
            {/* Top: Preview + Random */}
            <View style={styles.header}>
                <CustomBuiltAvatar config={config} size={80} />
                <TouchableOpacity onPress={randomize} style={[styles.randomBtn, { backgroundColor: colors.primary }]}>
                    <Text style={styles.randomText}>🎲</Text>
                </TouchableOpacity>
            </View>

            {/* Tabs */}
            <View style={[styles.tabs, { borderBottomColor: colors.primary + '30' }]}>
                {['face', 'eyes', 'mouth', 'hair', 'extras'].map(tab => (
                    <TouchableOpacity
                        key={tab}
                        onPress={() => { playHaptic('light'); setActiveTab(tab); }}
                        style={[styles.tab, activeTab === tab && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
                    >
                        <Text style={[styles.tabLabel, { color: activeTab === tab ? colors.primary : colors.textMuted }]}>{tab.toUpperCase()}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Options */}
            <View style={styles.optionsArea}>
                {renderTab()}
            </View>

            {/* Buttons */}
            <View style={styles.buttons}>
                <TouchableOpacity onPress={onCancel} style={[styles.cancelBtn, { borderColor: colors.primary }]}>
                    <Text style={[styles.btnLabel, { color: colors.textMuted }]}>CANCEL</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { playHaptic('success'); onSave(config); }} style={[styles.saveBtn, { backgroundColor: colors.primary }]}>
                    <Text style={[styles.btnLabel, { color: colors.secondary }]}>SAVE</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 12, gap: 20 },
    randomBtn: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
    randomText: { fontSize: 22 },
    
    tabs: { flexDirection: 'row', borderBottomWidth: 1, marginBottom: 10 },
    tab: { flex: 1, paddingVertical: 8, alignItems: 'center' },
    tabLabel: { fontSize: 11, fontFamily: 'Panchang-Bold', letterSpacing: 0.5 },
    
    optionsArea: { flex: 1 },
    tabContent: {},
    sectionTitle: { fontSize: 10, fontFamily: 'Panchang-Bold', letterSpacing: 1, marginBottom: 8, marginTop: 6 },
    
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    textBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 2 },
    textBtnLabel: { fontSize: 11, fontFamily: 'Teko-Medium', letterSpacing: 0.5 },
    
    colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 6 },
    colorBtn: { width: 34, height: 34, borderRadius: 17 },
    
    buttons: { flexDirection: 'row', gap: 12, marginTop: 10 },
    cancelBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, borderWidth: 2, alignItems: 'center' },
    saveBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
    btnLabel: { fontSize: 13, fontFamily: 'CabinetGrotesk-Black', letterSpacing: 1.5 },
});

export { CustomAvatarBuilder as AvatarBuilder };
export default CustomAvatarBuilder;
