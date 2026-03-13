// ALTERNATIVE FIX: If the heading is still not visible, replace the return statement with this:

// Option 1: Absolute positioning (most aggressive)
return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        {/* Fixed Header at Top */}
        <View style={{
            position: 'absolute',
            top: Platform.OS === 'ios' ? 50 : 40,
            left: 0,
            right: 0,
            zIndex: 1000,
            backgroundColor: theme.colors.background,
            paddingHorizontal: 24,
        }}>
            {/* Back Button */}
            <TouchableOpacity 
                onPress={safeGoBack} 
                style={{ paddingVertical: 8, marginBottom: 8 }}
            >
                <Text style={{ 
                    fontSize: 14, 
                    fontFamily: 'CabinetGrotesk-Bold', 
                    color: theme.colors.primary 
                }}>
                    ← BACK
                </Text>
            </TouchableOpacity>
            
            {/* Heading */}
            <View style={{
                paddingVertical: 16,
                borderBottomWidth: 2,
                borderBottomColor: theme.colors.primary + '40',
                backgroundColor: theme.colors.surface,
            }}>
                <Text style={{
                    fontSize: 26,
                    fontFamily: 'Panchang-Bold',
                    color: theme.colors.primary,
                    textAlign: 'center',
                    letterSpacing: 4,
                }}>
                    PROFILE
                </Text>
            </View>
        </View>

        {/* Scrollable Content with top padding to avoid overlap */}
        <ScrollView 
            style={{ flex: 1 }}
            contentContainerStyle={{ 
                paddingTop: Platform.OS === 'ios' ? 160 : 150,
                paddingHorizontal: 24,
                paddingBottom: 30 
            }}
        >
            {(mode === 'signed_out' || mode === 'login') && renderSignedOut()}
            {mode === 'profile_setup' && renderProfileSetup()}
            {mode === 'profile_view' && renderProfileView()}
        </ScrollView>

        {/* Modal stays the same */}
        <Modal visible={showUsernameModal} transparent={true} animationType="fade">
            {/* ... modal content ... */}
        </Modal>
    </View>
);

// Option 2: Force visibility with inline styles
return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 60 }}>
            {/* Back Button - Force visible */}
            <View style={{ height: 40, justifyContent: 'center', backgroundColor: 'rgba(255,0,0,0.1)' }}>
                <TouchableOpacity onPress={safeGoBack}>
                    <Text style={{ fontSize: 14, fontFamily: 'CabinetGrotesk-Bold', color: theme.colors.primary }}>
                        ← BACK
                    </Text>
                </TouchableOpacity>
            </View>
            
            {/* Heading - Force visible with debug background */}
            <View style={{ 
                height: 80, 
                justifyContent: 'center',
                backgroundColor: 'rgba(0,255,0,0.2)', // Green tint for debugging
                borderBottomWidth: 2,
                borderBottomColor: theme.colors.primary,
                marginBottom: 20
            }}>
                <Text style={{
                    fontSize: 32, // Extra large
                    fontFamily: 'Panchang-Bold',
                    color: '#FF0000', // Bright red for debugging
                    textAlign: 'center',
                    letterSpacing: 4,
                }}>
                    PROFILE
                </Text>
                <Text style={{ color: 'blue', textAlign: 'center', fontSize: 12 }}>
                    If you see this, the component is rendering! Mode: {mode}
                </Text>
            </View>
            
            {/* Content */}
            <View style={{ flex: 1 }}>
                {(mode === 'signed_out' || mode === 'login') && renderSignedOut()}
                {mode === 'profile_setup' && renderProfileSetup()}
                {mode === 'profile_view' && renderProfileView()}
            </View>
        </View>
    </SafeAreaView>
);

// Option 3: Simplest possible version
return (
    <View style={{ flex: 1, backgroundColor: '#000000', padding: 20, paddingTop: 60 }}>
        <Text style={{ fontSize: 40, color: '#FF0000', textAlign: 'center', marginBottom: 20 }}>
            PROFILE
        </Text>
        <Text style={{ fontSize: 16, color: '#FFFFFF', textAlign: 'center' }}>
            Mode: {mode}
        </Text>
        <View style={{ flex: 1, marginTop: 20 }}>
            {(mode === 'signed_out' || mode === 'login') && renderSignedOut()}
            {mode === 'profile_setup' && renderProfileSetup()}
            {mode === 'profile_view' && renderProfileView()}
        </View>
    </View>
);
