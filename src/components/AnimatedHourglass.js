import React, { useRef, useEffect, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import { useTheme } from '../utils/ThemeContext';

const AnimatedHourglass = React.memo(({ isRunning = true, style }) => {
    const animationRef = useRef(null);
    const { theme } = useTheme();

    // Map Lottie layers to theme colors - Use Kodak amber/gold colors
    const colorFilters = useMemo(() => {
        // Use Kodak amber colors for cinematic feel
        const primaryColor = '#FFB800'; // Kodak amber
        const textColor = '#FFD54F'; // Kodak gold

        return [
            // Sand / Active Elements -> Primary Color (Kodak Amber)
            { keypath: 'time-down.time.Fill 1', color: primaryColor },
            { keypath: 'time-down.time 2.Fill 1', color: primaryColor },
            { keypath: 'time-up.time.Fill 1', color: primaryColor },
            { keypath: 'time-up.time 2.Fill 1', color: primaryColor },
            { keypath: 'bubble.Rectangle 1.Fill 1', color: primaryColor },
            { keypath: 'timeline.Shape 1.Stroke 1', color: primaryColor },

            // Structure / Frame Elements -> Text Color (Kodak Gold)
            { keypath: 'top.top.Fill 1', color: textColor },
            { keypath: 'bottom.bottom.Fill 1', color: textColor },
            { keypath: 'outline-shape.shape.Stroke 1', color: textColor },
            { keypath: 'bubble.Rectangle 1.Stroke 1', color: textColor },
        ];
    }, [theme.colors.primary, theme.colors.text]);

    useEffect(() => {
        if (animationRef.current) {
            if (isRunning) {
                animationRef.current.play();
            } else {
                animationRef.current.pause();
            }
        }
    }, [isRunning]);

    return (
        <View style={[styles.container, style]}>
            <LottieView
                ref={animationRef}
                source={require('../../assets/hourglass.json')}
                style={styles.animation}
                resizeMode="contain"
                loop
                colorFilters={colorFilters}
            />
        </View>
    );
});

export default AnimatedHourglass;

const styles = StyleSheet.create({
    container: {
        width: 220,
        height: 220,
        alignItems: 'center',
        justifyContent: 'center',
    },
    animation: {
        width: '100%',
        height: '100%',
    }
});