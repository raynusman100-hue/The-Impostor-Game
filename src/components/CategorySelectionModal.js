import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CATEGORY_LABELS } from '../utils/words';
import { useTheme } from '../utils/ThemeContext';
import { playHaptic } from '../utils/haptics';
import { checkPremiumStatus } from '../utils/PremiumManager';
import { auth } from '../utils/firebase';

const { width } = Dimensions.get('window');

const CategoryCard = ({ item, isSelected, onPress, theme, styles, isPremium, isLocked = false }) => {
    // Format labels with proper line breaks for compound words
    const formatLabel = (label) => {
        const twoLineLabels = {
            'Ball Knowledge': 'BALL\nKNOWLEDGE',
            'Famous People': 'FAMOUS\nPEOPLE',
            'Daily Life': 'DAILY\nLIFE',
        };
        return twoLineLabels[label] || label.toUpperCase();
    };

    const formattedLabel = formatLabel(item.label);
    const needsTwoLines = formattedLabel.includes('\n');

    return (
        <TouchableOpacity
            style={[
                styles.cardContainer,
                isSelected && styles.cardSelected,
                isLocked && styles.cardLocked,
            ]}
            onPress={onPress} // Always allow press (locked cards go to premium)
            activeOpacity={isLocked ? 0.9 : 0.8} // Slightly different feedback for locked
        >
            {/* Chromatic Aberration - Background layers only (not borders) */}
            <View style={[styles.chromaticLayer, {
                backgroundColor: isSelected ? '#FF000020' : '#FF000008',
                transform: [{ translateX: isSelected ? 2 : 1 }]
            }]} />
            <View style={[styles.chromaticLayer, {
                backgroundColor: isSelected ? '#0000FF20' : '#0000FF08',
                transform: [{ translateX: isSelected ? -2 : -1 }]
            }]} />
            <View style={[styles.chromaticLayer, {
                backgroundColor: isSelected ? '#00FF0015' : '#00FF0005',
                transform: [{ translateY: isSelected ? 1 : 0.5 }]
            }]} />

            <LinearGradient
                colors={isSelected
                    ? (theme.id === 'kodak-daylight'
                        ? ['#FFC700', '#FFB800']
                        : [theme.colors.primary, theme.colors.tertiary])
                    : [theme.colors.surface + '60', theme.colors.surface + '60']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.cardGradient}
            >
                {/* Premium Lock Overlay */}
                {isPremium && (
                    <View style={styles.premiumLockOverlay}>
                        <Text style={styles.premiumLockIcon}>🔒</Text>
                    </View>
                )}

                {/* Label with chromatic aberration text effect - always visible */}
                <View style={styles.labelContainer}>
                    {/* Red ghost text - always visible */}
                    <Text
                        style={[
                            styles.cardLabel,
                            needsTwoLines && styles.cardLabelTwoLine,
                            styles.chromaticTextRed,
                            isSelected && styles.chromaticTextRedSelected,
                            isPremium && styles.cardLabelLocked
                        ]}
                        numberOfLines={needsTwoLines ? 2 : 1}
                    >
                        {formattedLabel}
                    </Text>
                    {/* Blue ghost text - always visible */}
                    <Text
                        style={[
                            styles.cardLabel,
                            needsTwoLines && styles.cardLabelTwoLine,
                            styles.chromaticTextBlue,
                            isSelected && styles.chromaticTextBlueSelected,
                            isPremium && styles.cardLabelLocked
                        ]}
                        numberOfLines={needsTwoLines ? 2 : 1}
                    >
                        {formattedLabel}
                    </Text>
                    {/* Main text */}
                    <Text
                        style={[
                            styles.cardLabel,
                            needsTwoLines && styles.cardLabelTwoLine,
                            isSelected && styles.cardLabelSelected,
                            isPremium && styles.cardLabelLocked
                        ]}
                        numberOfLines={needsTwoLines ? 2 : 1}
                    >
                        {formattedLabel}
                    </Text>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );
};

export default function CategorySelectionModal({ visible, onClose, selectedCategories, onSelectCategory, navigation }) {
    const { theme } = useTheme();
    const styles = getStyles(theme);
    const [expandedBallKnowledge, setExpandedBallKnowledge] = useState(false);
    const [hasPremium, setHasPremium] = useState(false);

    useEffect(() => {
        const checkPremium = async () => {
            const user = auth.currentUser;
            if (user) {
                const premium = await checkPremiumStatus(user.email, user.uid);
                setHasPremium(premium);
            }
        };
        if (visible) {
            checkPremium();
        }
    }, [visible]);

    const handleSelect = (key) => {
        playHaptic('selection');
        onSelectCategory(key);
    };

    const handlePremiumPress = () => {
        playHaptic('medium');
        onClose(); // Close the modal first
        if (navigation) {
            navigation.navigate('Premium');
        }
    };

    const isAllSelected = selectedCategories.includes('all');

    // Separate categories into premium and free
    const premiumCategories = CATEGORY_LABELS.filter(c => c.premium === true && c.key !== 'all' && c.key !== 'ballKnowledge');
    const freeCategories = CATEGORY_LABELS.filter(c => (c.free === true || (!c.premium && !c.free)) && c.key !== 'all' && c.key !== 'ballKnowledge');

    // Debug logging
    console.log('Premium categories:', premiumCategories.map(c => c.label));
    console.log('Free categories:', freeCategories.map(c => c.label));

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalContainer}>
                <LinearGradient
                    colors={theme.colors.background === '#F5F0E6'
                        ? ['#F5F0E6', '#EDE5D8']
                        : ['rgba(0,0,0,0.95)', 'rgba(0,0,0,0.98)']}
                    style={StyleSheet.absoluteFill}
                />

                <View style={styles.safeArea}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerTitleContainer}>
                            <Text style={styles.eyebrow}>FROM THE DIRECTOR</Text>
                            {/* Title with chromatic aberration */}
                            <View style={styles.titleContainer}>
                                <Text style={[styles.title, styles.titleChromaticRed]}>FILM GENRES</Text>
                                <Text style={[styles.title, styles.titleChromaticBlue]}>FILM GENRES</Text>
                                <Text style={styles.title}>FILM GENRES</Text>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                            <Text style={styles.closeButtonText}>DONE</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Premium Card - Only show for non-premium users */}
                        {!hasPremium && (
                            <TouchableOpacity
                                style={styles.premiumCard}
                                onPress={handlePremiumPress}
                                activeOpacity={0.9}
                            >
                                {/* Chromatic aberration on premium card */}
                                <View style={[styles.premiumChromaticLayer, {
                                    backgroundColor: '#FF000020',
                                    transform: [{ translateX: 3 }]
                                }]} />
                                <View style={[styles.premiumChromaticLayer, {
                                    backgroundColor: '#0000FF20',
                                    transform: [{ translateX: -3 }]
                                }]} />

                                <LinearGradient
                                    colors={['#FFC700', '#FFB800']}
                                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                                    style={styles.premiumGradient}
                                >
                                    <View style={styles.premiumContent}>
                                        <View style={styles.premiumTextContainer}>
                                            <View style={styles.premiumBadge}>
                                                <Text style={styles.premiumBadgeText}>✨ PREMIUM</Text>
                                            </View>
                                            {/* Title with chromatic text effect */}
                                            <View style={styles.premiumTitleContainer}>
                                                <Text style={[styles.premiumTitle, styles.premiumTitleRed]}>EXPLORE MORE{'\n'}WITH PREMIUM</Text>
                                                <Text style={[styles.premiumTitle, styles.premiumTitleBlue]}>EXPLORE MORE{'\n'}WITH PREMIUM</Text>
                                                <Text style={styles.premiumTitle}>EXPLORE MORE{'\n'}WITH PREMIUM</Text>
                                            </View>
                                            <Text style={styles.premiumSubtitle}>Unlock all premium categories</Text>
                                        </View>
                                        <View style={styles.premiumArrow}>
                                            <Text style={styles.premiumArrowText}>→</Text>
                                        </View>
                                    </View>
                                </LinearGradient>
                            </TouchableOpacity>
                        )}

                        <Text style={styles.sectionTitle}>SELECT CATEGORIES</Text>

                        {/* Ball Knowledge - HOT category, first under SELECT CATEGORIES */}
                        {CATEGORY_LABELS.filter(c => c.key === 'ballKnowledge').map((cat) => {
                            const hasSubcategorySelected = cat.subcategories?.some(sub => selectedCategories.includes(sub.key));
                            return (
                                <View key={cat.key} style={{ marginBottom: 20 }}>
                                    <TouchableOpacity
                                        style={[styles.fullWidthCard, hasSubcategorySelected && styles.fullWidthCardSelected]}
                                        onPress={() => setExpandedBallKnowledge(!expandedBallKnowledge)}
                                        activeOpacity={0.8}
                                    >
                                        {/* Badge */}
                                        <View style={styles.fullWidthBadge}>
                                            <Text style={styles.fullWidthBadgeText}>🔥 HOT</Text>
                                        </View>

                                        <LinearGradient
                                            colors={hasSubcategorySelected
                                                ? (theme.id === 'kodak-daylight'
                                                    ? ['#FFC700', '#FFB800']
                                                    : [theme.colors.primary, theme.colors.tertiary])
                                                : [theme.colors.surface + '60', theme.colors.surface + '60']}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                            style={styles.fullWidthGradient}
                                        >
                                            <View style={styles.fullWidthContent}>
                                                <Text style={[styles.fullWidthLabel, hasSubcategorySelected && styles.fullWidthLabelSelected]}>
                                                    {cat.label.toUpperCase()}
                                                </Text>
                                                <Text style={[styles.dropdownIcon, expandedBallKnowledge && styles.dropdownIconExpanded]}>
                                                    ▼
                                                </Text>
                                            </View>
                                        </LinearGradient>
                                    </TouchableOpacity>

                                    {/* Subcategories */}
                                    {expandedBallKnowledge && cat.subcategories && (
                                        <View style={styles.subcategoriesContainer}>
                                            {cat.subcategories.map((subcat) => (
                                                <TouchableOpacity
                                                    key={subcat.key}
                                                    style={[styles.subcategoryCard, selectedCategories.includes(subcat.key) && styles.subcategoryCardSelected]}
                                                    onPress={() => handleSelect(subcat.key)}
                                                    activeOpacity={0.8}
                                                >
                                                    <LinearGradient
                                                        colors={selectedCategories.includes(subcat.key)
                                                            ? (theme.id === 'kodak-daylight'
                                                                ? ['#FFC700', '#FFB800']
                                                                : [theme.colors.primary, theme.colors.tertiary])
                                                            : [theme.colors.surface + '80', theme.colors.surface + '80']}
                                                        start={{ x: 0, y: 0 }}
                                                        end={{ x: 1, y: 0 }}
                                                        style={styles.subcategoryGradient}
                                                    >
                                                        <Text
                                                            style={[
                                                                styles.subcategoryLabel,
                                                                selectedCategories.includes(subcat.key) && styles.subcategoryLabelSelected,
                                                            ]}
                                                            numberOfLines={1}
                                                            adjustsFontSizeToFit={true}
                                                            minimumFontScale={0.5}
                                                            allowFontScaling={false}
                                                        >
                                                            {subcat.label.toUpperCase()}
                                                        </Text>
                                                    </LinearGradient>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    )}
                                </View>
                            );
                        })}

                        {/* Category Grid - Premium locked categories first, then free */}
                        <View style={styles.grid}>
                            {/* All Category Card */}
                            <CategoryCard
                                key="all"
                                item={{ key: 'all', label: 'All' }}
                                isSelected={selectedCategories.includes('all')}
                                onPress={() => handleSelect('all')}
                                theme={theme}
                                styles={styles}
                                isPremium={false}
                            />

                            {/* Free categories first - at the top for easy access */}
                            {freeCategories.map((cat) => (
                                <CategoryCard
                                    key={cat.key}
                                    item={cat}
                                    isSelected={selectedCategories.includes(cat.key)}
                                    onPress={() => handleSelect(cat.key)}
                                    theme={theme}
                                    styles={styles}
                                    isPremium={false}
                                />
                            ))}

                            {/* Premium categories - unlocked for premium users, locked for free users */}
                            {premiumCategories.map((cat) => (
                                <CategoryCard
                                    key={cat.key}
                                    item={cat}
                                    isSelected={hasPremium && selectedCategories.includes(cat.key)}
                                    onPress={hasPremium ? () => handleSelect(cat.key) : handlePremiumPress}
                                    theme={theme}
                                    styles={styles}
                                    isPremium={!hasPremium}
                                    isLocked={!hasPremium}
                                />
                            ))}
                        </View>

                        <View style={styles.footerSpacing} />
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

function getStyles(theme) {
    return StyleSheet.create({
        modalContainer: {
            flex: 1,
            justifyContent: 'flex-end',
        },
        safeArea: {
            flex: 1,
            paddingTop: 50,
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 24,
            marginBottom: 16,
        },
        headerTitleContainer: {
            justifyContent: 'center',
        },
        eyebrow: {
            color: theme.colors.textMuted,
            fontSize: 10,
            fontFamily: theme.fonts.bold, // Panchang-Bold
            letterSpacing: 2,
            marginBottom: 4,
        },
        titleContainer: {
            position: 'relative',
        },
        title: {
            color: theme.colors.text,
            fontSize: 28,
            fontFamily: theme.fonts.header, // CabinetGrotesk-Black
            letterSpacing: 1,
        },
        titleChromaticRed: {
            position: 'absolute',
            color: '#FF0000',
            opacity: 0.3,
            transform: [{ translateX: 2 }],
        },
        titleChromaticBlue: {
            position: 'absolute',
            color: '#00FFFF',
            opacity: 0.3,
            transform: [{ translateX: -2 }],
        },
        closeButton: {
            backgroundColor: theme.colors.primary,
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 20,
        },
        closeButtonText: {
            color: theme.colors.secondary,
            fontFamily: theme.fonts.bold,
            fontSize: 12,
            letterSpacing: 1,
        },
        scrollContent: {
            paddingHorizontal: 24,
        },
        // Premium Card - Always yellow, standalone
        premiumCard: {
            borderRadius: 20,
            height: 140,
            marginBottom: 20,
            overflow: 'hidden',
            borderWidth: 2,
            borderColor: '#FFC700',
            ...theme.shadows.medium,
        },
        premiumChromaticLayer: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: 24,
            zIndex: 1,
        },
        premiumGradient: {
            flex: 1,
            padding: 20,
            zIndex: 2,
        },
        premiumContent: {
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
        },
        premiumTextContainer: {
            flex: 1,
        },
        premiumBadge: {
            alignSelf: 'flex-start',
            backgroundColor: 'rgba(0,0,0,0.2)',
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 12,
            marginBottom: 8,
        },
        premiumBadgeText: {
            color: '#1A1A1A',
            fontSize: 9,
            fontFamily: theme.fonts.bold,
            letterSpacing: 1.5,
        },
        premiumTitleContainer: {
            position: 'relative',
        },
        premiumTitle: {
            color: '#1A1A1A',
            fontSize: 24,
            fontFamily: theme.fonts.header,
            marginBottom: 4,
        },
        premiumTitleRed: {
            position: 'absolute',
            color: '#FF0000',
            opacity: 0.4,
            transform: [{ translateX: 3 }],
        },
        premiumTitleBlue: {
            position: 'absolute',
            color: '#00FFFF',
            opacity: 0.4,
            transform: [{ translateX: -3 }],
        },
        premiumSubtitle: {
            color: '#1A1A1A',
            fontSize: 12,
            fontFamily: theme.fonts.medium,
            opacity: 0.8,
        },
        premiumArrow: {
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: 'rgba(0,0,0,0.15)',
            alignItems: 'center',
            justifyContent: 'center',
        },
        premiumArrowText: {
            color: '#1A1A1A',
            fontSize: 20,
            fontWeight: 'bold',
        },
        // Grid Styles
        sectionTitle: {
            color: theme.colors.text,
            fontSize: 16,
            fontFamily: theme.fonts.header,
            marginBottom: 12,
            letterSpacing: 1,
        },
        grid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
        },
        // Full Width Card (Ball Knowledge)
        fullWidthCard: {
            width: '100%',
            height: 80,
            borderRadius: 18,
            marginBottom: 16,
            borderWidth: 1.5,
            borderColor: theme.colors.text + '30',
            position: 'relative',
        },
        fullWidthCardSelected: {
            borderWidth: 2,
            borderColor: theme.colors.primary,
            ...theme.shadows.soft,
        },
        fullWidthBadge: {
            position: 'absolute',
            top: -8,
            right: 12,
            backgroundColor: theme.colors.primary,
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: 10,
            zIndex: 10,
            borderWidth: 2,
            borderColor: theme.colors.background,
        },
        fullWidthBadgeText: {
            color: theme.colors.secondary,
            fontSize: 9,
            fontFamily: theme.fonts.bold,
            letterSpacing: 0.5,
        },
        fullWidthGradient: {
            flex: 1,
            paddingHorizontal: 20,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 16,
            overflow: 'hidden',
        },
        fullWidthContent: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
        },
        fullWidthLabel: {
            color: theme.colors.text,
            fontSize: 20,
            fontFamily: theme.fonts.header,
            letterSpacing: 2,
            textAlign: 'center',
        },
        fullWidthLabelSelected: {
            color: theme.colors.secondary,
        },
        dropdownIcon: {
            color: theme.colors.text,
            fontSize: 14,
            opacity: 0.6,
        },
        dropdownIconExpanded: {
            transform: [{ rotate: '180deg' }],
        },
        // Subcategories
        subcategoriesContainer: {
            flexDirection: 'row',
            gap: 8,
            marginBottom: 16,
            paddingHorizontal: 4,
        },
        subcategoryCard: {
            flex: 1,
            height: Platform.OS === 'android' ? 70 : 65, // Taller to accommodate 2 lines
            borderRadius: 14,
            overflow: 'hidden',
            borderWidth: 1.5,
            borderColor: theme.colors.text + '30',
        },
        subcategoryCardSelected: {
            borderWidth: 2,
            borderColor: theme.colors.primary,
            ...theme.shadows.soft,
        },
        subcategoryGradient: {
            flex: 1,
            paddingHorizontal: 12,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 12,
        },
        subcategoryLabel: {
            color: theme.colors.text,
            fontSize: Platform.OS === 'android' ? 17 : 16,
            fontFamily: theme.fonts.bold,
            letterSpacing: 0.5,
            textAlign: 'center',
            flexShrink: 0,
        },
        subcategoryLabelSelected: {
            color: theme.colors.secondary,
        },
        // Card Styles
        cardContainer: {
            width: (width - 48 - 16) / 3,
            minHeight: 70,
            borderRadius: 18,
            marginBottom: 0,
            borderWidth: 1.5,
            borderColor: theme.colors.text + '30',
            position: 'relative',
        },
        categoryBadge: {
            position: 'absolute',
            top: -6,
            right: -6,
            backgroundColor: theme.colors.primary,
            paddingHorizontal: 6,
            paddingVertical: 2,
            borderRadius: 8,
            zIndex: 10,
            borderWidth: 1.5,
            borderColor: theme.colors.background,
        },
        categoryBadgeText: {
            color: theme.colors.secondary,
            fontSize: 8,
            fontFamily: theme.fonts.bold,
            letterSpacing: 0.5,
        },
        cardSelected: {
            borderWidth: 2,
            borderColor: theme.colors.primary,
            ...theme.shadows.soft,
        },
        cardLocked: {
            opacity: 0.7, // Slightly dimmed but still clearly clickable
            borderColor: theme.colors.primary + '60', // Subtle premium border hint
        },
        cardGradient: {
            flex: 1,
            padding: 8,
            borderRadius: 16,
            overflow: 'hidden',
            justifyContent: 'center',
            alignItems: 'center',
        },
        labelContainer: {
            position: 'relative',
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center',
        },
        cardLabel: {
            color: theme.colors.text,
            fontSize: 11,
            fontFamily: theme.fonts.bold,
            letterSpacing: 0.2,
            lineHeight: 14,
            textAlign: 'center',
        },
        cardLabelTwoLine: {
            fontSize: 9.5,
            lineHeight: 12,
        },
        cardLabelSelected: {
            color: theme.colors.secondary,
        },
        cardLabelLocked: {
            opacity: 0.4,
        },
        premiumLockOverlay: {
            position: 'absolute',
            top: 4,
            right: 4,
            zIndex: 10,
        },
        premiumLockIcon: {
            fontSize: 16,
            opacity: 0.8,
        },
        chromaticTextRed: {
            position: 'absolute',
            color: '#FF0000',
            opacity: 0.25,
            transform: [{ translateX: 1 }],
        },
        chromaticTextRedSelected: {
            opacity: 0.4,
            transform: [{ translateX: 1.5 }],
        },
        chromaticTextBlue: {
            position: 'absolute',
            color: '#00FFFF',
            opacity: 0.25,
            transform: [{ translateX: -1 }],
        },
        chromaticTextBlueSelected: {
            opacity: 0.4,
            transform: [{ translateX: -1.5 }],
        },
        chromaticLayer: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: 18,
        },
        footerSpacing: {
            height: 30,
        },
    });
}
