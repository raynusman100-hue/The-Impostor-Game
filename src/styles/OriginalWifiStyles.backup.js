/**
 * BACKUP OF ORIGINAL WIFI MODE STYLES
 * Created: December 31, 2025
 * 
 * This file contains the original styles for WiFi mode screens before the Kodak cinematic redesign.
 * Use this to restore the original look if needed.
 */

// ============================================
// ORIGINAL DISCUSSION SCREEN STYLES
// ============================================
export const originalDiscussionStyles = (theme) => ({
    container: { flex: 1 },
    safeArea: { flex: 1, alignItems: 'center' },

    header: {
        width: '100%',
        alignItems: 'center',
        paddingVertical: 10,
    },
    roomCodeSmall: {
        color: theme.colors.textSecondary,
        fontSize: 14,
        fontFamily: theme.fonts.bold
    },

    tabContainer: {
        flexDirection: 'row',
        marginBottom: 10,
        backgroundColor: theme.colors.surface,
        borderRadius: 25,
        padding: 4,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        alignSelf: 'center',
        zIndex: 50
    },
    tab: {
        paddingVertical: 8,
        paddingHorizontal: 30,
        borderRadius: 20,
    },
    activeTab: {
        backgroundColor: theme.colors.primary,
    },
    tabText: {
        color: theme.colors.textSecondary,
        fontFamily: theme.fonts.medium,
        fontSize: 14,
    },
    activeTabText: {
        color: '#fff',
        fontFamily: theme.fonts.bold,
    },
    notificationDot: {
        position: 'absolute',
        top: -6,
        right: -8,
        backgroundColor: theme.colors.error,
        borderRadius: 6,
        width: 12,
        height: 12,
        borderWidth: 2,
        borderColor: theme.colors.background,
    },

    title: {
        fontSize: 48,
        color: theme.colors.tertiary,
        fontFamily: theme.fonts.header,
        letterSpacing: 2,
    },
    subtitle: {
        fontSize: theme.fontSize.medium,
        color: theme.colors.textSecondary,
        marginTop: 5,
        letterSpacing: 4,
        fontFamily: theme.fonts.medium,
        textTransform: 'uppercase'
    },

    timerCircle: {
        width: 260,
        height: 260,
        borderRadius: 130,
        borderWidth: 4,
        borderColor: theme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    timer: { 
        fontSize: 64, 
        color: theme.colors.text, 
        fontFamily: theme.fonts.header, 
        letterSpacing: 4 
    },
    timerLabel: { 
        fontSize: theme.fontSize.small, 
        color: theme.colors.textMuted, 
        fontFamily: theme.fonts.medium, 
        letterSpacing: 2, 
        textTransform: 'uppercase', 
        marginTop: 4 
    },

    countdownOverlay: {
        position: 'absolute',
        top: '30%',
        backgroundColor: 'rgba(0,0,0,0.9)',
        padding: 30,
        borderRadius: 20,
        alignItems: 'center',
        zIndex: 100,
        borderWidth: 2,
        borderColor: theme.colors.primary,
        width: '90%'
    },
    countdownBig: { 
        color: theme.colors.tertiary, 
        fontSize: 80, 
        fontFamily: theme.fonts.header 
    },
});

// ============================================
// ORIGINAL RESULT SCREEN STYLES
// ============================================
export const originalResultStyles = (theme) => ({
    container: { flex: 1 },
    safeArea: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: theme.spacing.m },
    
    title: { 
        fontSize: 56, 
        fontFamily: theme.fonts.header, 
        color: theme.colors.tertiary, 
        marginBottom: theme.spacing.s, 
        textAlign: 'center', 
        letterSpacing: 4 
    },
    subtitle: { 
        fontSize: theme.fontSize.large, 
        color: theme.colors.textSecondary, 
        marginBottom: theme.spacing.xl, 
        fontFamily: theme.fonts.medium, 
        letterSpacing: 2 
    },
    winnerBanner: { 
        fontSize: 28, 
        fontFamily: theme.fonts.header, 
        marginBottom: 10, 
        letterSpacing: 4, 
        textTransform: 'uppercase',
        color: theme.colors.primary 
    },
    
    resultCard: { 
        width: '100%', 
        marginBottom: theme.spacing.m, 
        borderRadius: theme.borderRadius.l, 
        overflow: 'hidden', 
        borderWidth: 1, 
        borderColor: theme.colors.textSecondary, 
        backgroundColor: theme.colors.surface 
    },
    impostorCard: { 
        borderColor: theme.colors.error, 
        backgroundColor: 'rgba(205, 92, 92, 0.1)' 
    },
    
    label: { 
        fontSize: theme.fontSize.medium, 
        color: theme.colors.textSecondary, 
        marginBottom: theme.spacing.s, 
        fontFamily: theme.fonts.medium, 
        letterSpacing: 3, 
        textTransform: 'uppercase' 
    },
    word: { 
        fontSize: 48, 
        color: theme.colors.text, 
        fontFamily: theme.fonts.header, 
        letterSpacing: 2, 
        textAlign: 'center' 
    },
    impostorName: { 
        fontSize: 36, 
        color: theme.colors.error, 
        fontFamily: theme.fonts.header, 
        marginVertical: theme.spacing.xs, 
        letterSpacing: 2, 
        textTransform: 'uppercase' 
    },
    
    waitingContainer: {
        width: '100%',
        paddingVertical: theme.spacing.m,
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: theme.colors.textSecondary,
        borderRadius: theme.borderRadius.m,
        alignItems: 'center',
        justifyContent: 'center'
    },
    waitingText: {
        color: theme.colors.textSecondary,
        fontFamily: theme.fonts.bold,
        fontSize: 16,
        letterSpacing: 2
    },
});

// ============================================
// ORIGINAL HOST SCREEN STYLES
// ============================================
export const originalHostStyles = (theme) => ({
    container: { flex: 1 },
    scrollContent: { padding: theme.spacing.l, alignItems: 'center' },
    header: { marginTop: 80, alignItems: 'center', marginBottom: 10 },
    title: { fontSize: 20, color: theme.colors.tertiary, fontFamily: theme.fonts.medium, letterSpacing: 4 },
    codeText: { fontSize: 56, color: theme.colors.text, fontFamily: theme.fonts.header, letterSpacing: 6 },
    
    tabContainer: {
        flexDirection: 'row',
        marginBottom: 10,
        backgroundColor: theme.colors.surface,
        borderRadius: 25,
        padding: 4,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        alignSelf: 'center'
    },
    tab: {
        paddingVertical: 8,
        paddingHorizontal: 30,
        borderRadius: 20,
    },
    activeTab: {
        backgroundColor: theme.colors.primary,
    },
    tabText: {
        color: theme.colors.textSecondary,
        fontFamily: theme.fonts.medium,
        fontSize: 14,
    },
    activeTabText: {
        color: '#fff',
        fontFamily: theme.fonts.bold,
    },
    
    qrContainer: { padding: 15, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 15, marginVertical: 20 },
    section: { width: '100%', padding: 15, borderRadius: 16, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    sectionTitle: { fontSize: 14, color: theme.colors.primary, fontFamily: theme.fonts.bold, marginBottom: 15, letterSpacing: 2 },
    
    countBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.colors.textSecondary },
    countBtnText: { color: theme.colors.text, fontSize: 24 },
    
    playerCount: { fontSize: 16, color: theme.colors.primary, fontFamily: theme.fonts.bold, marginBottom: 10, letterSpacing: 2 },
    playerItem: { fontSize: 18, color: theme.colors.text, fontFamily: theme.fonts.medium },
});

// ============================================
// ORIGINAL WIFI LOBBY SCREEN STYLES
// ============================================
export const originalWifiLobbyStyles = (theme) => ({
    container: {
        flex: 1,
        padding: theme.spacing.xl,
        alignItems: 'center',
    },
    header: {
        marginTop: 40,
        alignItems: 'center',
        marginBottom: 20,
    },
    roomLabel: {
        fontSize: 18,
        color: theme.colors.tertiary,
        fontFamily: theme.fonts.medium,
        letterSpacing: 4,
    },
    roomCode: {
        fontSize: 56,
        color: theme.colors.text,
        fontFamily: theme.fonts.header,
        letterSpacing: 8,
    },
    
    tabContainer: {
        flexDirection: 'row',
        marginBottom: 10,
        backgroundColor: theme.colors.surface,
        borderRadius: 25,
        padding: 4,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    activeTab: {
        backgroundColor: theme.colors.primary,
    },
    tabText: {
        color: theme.colors.textSecondary,
        fontFamily: theme.fonts.medium,
        fontSize: 14,
    },
    activeTabText: {
        color: '#fff',
        fontFamily: theme.fonts.bold,
    },
    
    statusText: {
        fontSize: 20,
        color: theme.colors.text,
        fontFamily: theme.fonts.medium,
        textAlign: 'center',
        marginBottom: 40,
        letterSpacing: 2,
    },
    playerBox: {
        width: '100%',
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        backgroundColor: theme.colors.surface,
    },
    playerCount: {
        fontSize: 16,
        color: theme.colors.primary,
        fontFamily: theme.fonts.bold,
        marginBottom: 10,
        letterSpacing: 2,
    },
    playerName: {
        fontSize: 18,
        color: theme.colors.text,
        fontFamily: theme.fonts.medium,
        marginBottom: 4,
        flex: 1,
    },
});

// ============================================
// ORIGINAL JOIN SCREEN STYLES
// ============================================
export const originalJoinStyles = (theme) => ({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: theme.spacing.xl,
        alignItems: 'center',
        paddingTop: 100,
    },
    title: {
        fontSize: 48,
        fontFamily: theme.fonts.header,
        color: theme.colors.tertiary,
        letterSpacing: 4,
        marginBottom: 40,
    },
    
    label: {
        color: theme.colors.textSecondary,
        fontFamily: theme.fonts.medium,
        fontSize: 16,
        letterSpacing: 2,
        marginBottom: 8,
        marginLeft: 4,
    },
    input: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        height: 60,
        borderRadius: 12,
        paddingHorizontal: 20,
        fontSize: 24,
        fontFamily: theme.fonts.medium,
        borderWidth: 1,
        borderColor: theme.colors.primary,
        color: theme.colors.text,
        marginBottom: 20,
    },
    
    profileCard: {
        alignItems: 'center',
        marginBottom: 30,
        backgroundColor: 'rgba(255,255,255,0.05)',
        padding: 20,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: theme.colors.primary
    },
    profileName: {
        color: theme.colors.text,
        fontSize: 24,
        fontFamily: theme.fonts.bold,
        marginTop: 10,
        marginBottom: 5,
        letterSpacing: 1
    },
    
    scannerText: {
        color: 'white',
        fontSize: 24,
        fontFamily: theme.fonts.header,
        letterSpacing: 2,
        marginTop: 100,
    },
});

/**
 * HOW TO RESTORE ORIGINAL STYLES:
 * 
 * 1. Copy the relevant style object from this file
 * 2. Replace the getStyles function in the target screen
 * 3. Remove the Kodak-specific imports (KodakButton, film strip elements)
 * 4. Replace KodakButton with regular Button component
 * 5. Remove translation button if not needed
 * 6. Change LinearGradient colors back to theme.colors.backgroundGradient
 */
