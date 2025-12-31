import React from 'react';
import { View, StyleSheet } from 'react-native';

export default function CrewmateIcon({ color, size = 100, style }) {
    // Scaling ratio based on size
    const s = (val) => (val / 100) * size;

    return (
        <View style={[{ width: size, height: size * 1.2, alignItems: 'center' }, style]}>
            {/* Backpack */}
            <View style={{
                position: 'absolute',
                left: 0,
                top: s(25),
                width: s(20),
                height: s(45),
                backgroundColor: color,
                borderTopLeftRadius: s(10),
                borderBottomLeftRadius: s(10),
                borderWidth: s(3),
                borderColor: 'black',
            }} />

            {/* Body Main */}
            <View style={{
                width: s(65),
                height: s(80),
                backgroundColor: color,
                borderRadius: s(30),
                borderWidth: s(3),
                borderColor: 'black',
                zIndex: 2,
                overflow: 'hidden', // Mask legs if needed, but we draw legs separate or simpler
            }}>
                {/* Visor (Glass) */}
                <View style={{
                    position: 'absolute',
                    top: s(15),
                    right: s(-5), // Stick out a bit
                    width: s(45),
                    height: s(30),
                    backgroundColor: '#75D5E7', // Visor Cyan
                    borderRadius: s(15),
                    borderWidth: s(3),
                    borderColor: 'black',
                    zIndex: 10,
                }}>
                    {/* Reflection */}
                    <View style={{
                        position: 'absolute',
                        top: s(5),
                        right: s(8),
                        width: s(25),
                        height: s(10),
                        backgroundColor: 'white',
                        opacity: 0.4,
                        borderRadius: s(10),
                    }} />
                </View>
            </View>

            {/* Legs (Simpler approach: Just extend body bottom or add two rects) */}
            <View style={{
                position: 'absolute',
                bottom: 0,
                flexDirection: 'row',
                width: s(65),
                justifyContent: 'space-between',
                zIndex: 1,
            }}>
                <View style={{
                    width: s(25),
                    height: s(30),
                    backgroundColor: color,
                    borderBottomLeftRadius: s(10),
                    borderBottomRightRadius: s(10),
                    borderWidth: s(3),
                    borderColor: 'black',
                    borderTopWidth: 0,
                }} />
                <View style={{
                    width: s(25),
                    height: s(30),
                    backgroundColor: color,
                    borderBottomLeftRadius: s(10),
                    borderBottomRightRadius: s(10),
                    borderWidth: s(3),
                    borderColor: 'black',
                    borderTopWidth: 0,
                }} />
            </View>
        </View>
    );
}
