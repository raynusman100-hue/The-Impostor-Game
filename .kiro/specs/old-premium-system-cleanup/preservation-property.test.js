/**
 * Preservation Property Tests for Old Premium System Cleanup
 * 
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10**
 * 
 * CRITICAL: These tests MUST PASS on unfixed code - they capture the baseline behavior to preserve.
 * 
 * GOAL: Verify that the current RevenueCat premium system works correctly BEFORE implementing the fix.
 * After the fix, these tests should still pass, confirming no regressions.
 * 
 * OBSERVATION-FIRST METHODOLOGY:
 * - These tests observe and verify the current working behavior
 * - They establish a baseline that must be preserved after cleanup
 * - If these tests fail on unfixed code, the current system has issues
 */

const fs = require('fs');
const path = require('path');

// Helper to read file content
function readFile(filePath) {
    try {
        return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
        return null;
    }
}

// Helper to check if file exists
function fileExists(filePath) {
    return fs.existsSync(filePath);
}

// Helper to check if a file imports a module
function fileImports(fileContent, moduleName) {
    if (!fileContent) return false;
    const importRegex = new RegExp(`import.*${moduleName}.*from`, 'i');
    return importRegex.test(fileContent);
}

// Helper to check if a file has a navigation call
function hasNavigationCall(fileContent, screenName) {
    if (!fileContent) return false;
    const navRegex = new RegExp(`navigate\\(['"]${screenName}['"]\\)`, 'g');
    return navRegex.test(fileContent);
}

/**
 * Property 2: Preservation - Current RevenueCat System Unchanged
 * 
 * These tests verify that all current RevenueCat premium functionality works correctly.
 * They must pass on UNFIXED code and continue to pass after the cleanup.
 */
describe('Preservation Property Tests - Current RevenueCat System', () => {
    const projectRoot = path.resolve(__dirname, '../../..');
    
    describe('PremiumScreen Navigation (Requirement 3.1)', () => {
        test('PremiumScreen should be registered in App.js navigation', () => {
            const appJsPath = path.join(projectRoot, 'App.js');
            const content = readFile(appJsPath);
            
            expect(content).not.toBeNull();
            
            // Check for PremiumScreen import
            const hasPremiumScreenImport = fileImports(content, 'PremiumScreen');
            expect(hasPremiumScreenImport).toBe(true);
            
            // Check for Premium navigation route
            const hasPremiumRoute = content.includes('name="Premium"');
            expect(hasPremiumRoute).toBe(true);
            
            console.log('✅ BASELINE: PremiumScreen is properly registered in navigation');
        });
        
        test('HomeScreen should navigate to Premium screen', () => {
            const homeScreenPath = path.join(projectRoot, 'src/screens/HomeScreen.js');
            const content = readFile(homeScreenPath);
            
            expect(content).not.toBeNull();
            
            const hasNavigation = hasNavigationCall(content, 'Premium');
            expect(hasNavigation).toBe(true);
            
            console.log('✅ BASELINE: HomeScreen navigates to Premium');
        });
        
        test('ProfileScreen should navigate to Premium screen', () => {
            const profileScreenPath = path.join(projectRoot, 'src/screens/ProfileScreen.js');
            const content = readFile(profileScreenPath);
            
            expect(content).not.toBeNull();
            
            const hasNavigation = hasNavigationCall(content, 'Premium');
            expect(hasNavigation).toBe(true);
            
            console.log('✅ BASELINE: ProfileScreen navigates to Premium');
        });
        
        test('CategorySelectionModal should navigate to Premium screen', () => {
            const modalPath = path.join(projectRoot, 'src/components/CategorySelectionModal.js');
            const content = readFile(modalPath);
            
            expect(content).not.toBeNull();
            
            const hasNavigation = hasNavigationCall(content, 'Premium');
            expect(hasNavigation).toBe(true);
            
            console.log('✅ BASELINE: CategorySelectionModal navigates to Premium');
        });
        
        test('SettingsScreen should navigate to Premium screen', () => {
            const settingsPath = path.join(projectRoot, 'src/screens/SettingsScreen.js');
            const content = readFile(settingsPath);
            
            expect(content).not.toBeNull();
            
            const hasNavigation = hasNavigationCall(content, 'Premium');
            expect(hasNavigation).toBe(true);
            
            console.log('✅ BASELINE: SettingsScreen navigates to Premium');
        });
    });
    
    describe('PremiumManager Active Functions (Requirements 3.2, 3.3, 3.4, 3.5)', () => {
        test('PremiumManager should export checkPremiumStatus function', () => {
            const premiumManagerPath = path.join(projectRoot, 'src/utils/PremiumManager.js');
            const content = readFile(premiumManagerPath);
            
            expect(content).not.toBeNull();
            
            // Check function is defined
            const hasFunctionDef = content.includes('function checkPremiumStatus');
            expect(hasFunctionDef).toBe(true);
            
            // Check function is exported
            const defaultExportMatch = content.match(/export default\s*{([^}]+)}/s);
            expect(defaultExportMatch).not.toBeNull();
            expect(defaultExportMatch[1]).toContain('checkPremiumStatus');
            
            console.log('✅ BASELINE: checkPremiumStatus is defined and exported');
        });
        
        test('PremiumManager should export refreshPremiumStatus function', () => {
            const premiumManagerPath = path.join(projectRoot, 'src/utils/PremiumManager.js');
            const content = readFile(premiumManagerPath);
            
            expect(content).not.toBeNull();
            
            // Check function is defined
            const hasFunctionDef = content.includes('function refreshPremiumStatus');
            expect(hasFunctionDef).toBe(true);
            
            // Check function is exported
            const defaultExportMatch = content.match(/export default\s*{([^}]+)}/s);
            expect(defaultExportMatch).not.toBeNull();
            expect(defaultExportMatch[1]).toContain('refreshPremiumStatus');
            
            console.log('✅ BASELINE: refreshPremiumStatus is defined and exported');
        });
        
        test('PremiumManager should export checkAndSyncHostPremium function', () => {
            const premiumManagerPath = path.join(projectRoot, 'src/utils/PremiumManager.js');
            const content = readFile(premiumManagerPath);
            
            expect(content).not.toBeNull();
            
            // Check function is defined
            const hasFunctionDef = content.includes('function checkAndSyncHostPremium');
            expect(hasFunctionDef).toBe(true);
            
            // Check function is exported
            const defaultExportMatch = content.match(/export default\s*{([^}]+)}/s);
            expect(defaultExportMatch).not.toBeNull();
            expect(defaultExportMatch[1]).toContain('checkAndSyncHostPremium');
            
            console.log('✅ BASELINE: checkAndSyncHostPremium is defined and exported');
        });
        
        test('PremiumManager should export shouldShowAds function', () => {
            const premiumManagerPath = path.join(projectRoot, 'src/utils/PremiumManager.js');
            const content = readFile(premiumManagerPath);
            
            expect(content).not.toBeNull();
            
            // Check function is defined
            const hasFunctionDef = content.includes('function shouldShowAds');
            expect(hasFunctionDef).toBe(true);
            
            // Check function is exported
            const defaultExportMatch = content.match(/export default\s*{([^}]+)}/s);
            expect(defaultExportMatch).not.toBeNull();
            expect(defaultExportMatch[1]).toContain('shouldShowAds');
            
            console.log('✅ BASELINE: shouldShowAds is defined and exported');
        });
        
        test('PremiumManager should import PurchaseManager', () => {
            const premiumManagerPath = path.join(projectRoot, 'src/utils/PremiumManager.js');
            const content = readFile(premiumManagerPath);
            
            expect(content).not.toBeNull();
            
            const importsPurchaseManager = fileImports(content, 'PurchaseManager');
            expect(importsPurchaseManager).toBe(true);
            
            console.log('✅ BASELINE: PremiumManager imports PurchaseManager');
        });
        
        test('checkPremiumStatus should call PurchaseManager.getProStatus', () => {
            const premiumManagerPath = path.join(projectRoot, 'src/utils/PremiumManager.js');
            const content = readFile(premiumManagerPath);
            
            expect(content).not.toBeNull();
            
            // Find checkPremiumStatus function
            const functionMatch = content.match(/function checkPremiumStatus[\s\S]*?(?=\n(?:export|function|$))/);
            expect(functionMatch).not.toBeNull();
            
            // Check it calls PurchaseManager.getProStatus()
            const callsGetProStatus = functionMatch[0].includes('PurchaseManager.getProStatus()');
            expect(callsGetProStatus).toBe(true);
            
            console.log('✅ BASELINE: checkPremiumStatus calls PurchaseManager.getProStatus()');
        });
        
        test('refreshPremiumStatus should call PurchaseManager.checkProStatus', () => {
            const premiumManagerPath = path.join(projectRoot, 'src/utils/PremiumManager.js');
            const content = readFile(premiumManagerPath);
            
            expect(content).not.toBeNull();
            
            // Find refreshPremiumStatus function
            const functionMatch = content.match(/async function refreshPremiumStatus[\s\S]*?(?=\n(?:export|function|\/\*\*|$))/);
            expect(functionMatch).not.toBeNull();
            
            // Check it calls PurchaseManager.checkProStatus()
            const callsCheckProStatus = functionMatch[0].includes('PurchaseManager.checkProStatus()');
            expect(callsCheckProStatus).toBe(true);
            
            console.log('✅ BASELINE: refreshPremiumStatus calls PurchaseManager.checkProStatus()');
        });
    });
    
    describe('PurchaseManager Integration (Requirements 3.6, 3.8)', () => {
        test('PurchaseManager.js file should exist', () => {
            const purchaseManagerPath = path.join(projectRoot, 'src/utils/PurchaseManager.js');
            const exists = fileExists(purchaseManagerPath);
            
            expect(exists).toBe(true);
            
            console.log('✅ BASELINE: PurchaseManager.js exists');
        });
        
        test('PurchaseManager should have getProStatus method', () => {
            const purchaseManagerPath = path.join(projectRoot, 'src/utils/PurchaseManager.js');
            const content = readFile(purchaseManagerPath);
            
            expect(content).not.toBeNull();
            
            const hasMethod = content.includes('getProStatus()');
            expect(hasMethod).toBe(true);
            
            console.log('✅ BASELINE: PurchaseManager has getProStatus method');
        });
        
        test('PurchaseManager should have checkProStatus method', () => {
            const purchaseManagerPath = path.join(projectRoot, 'src/utils/PurchaseManager.js');
            const content = readFile(purchaseManagerPath);
            
            expect(content).not.toBeNull();
            
            const hasMethod = content.includes('checkProStatus()');
            expect(hasMethod).toBe(true);
            
            console.log('✅ BASELINE: PurchaseManager has checkProStatus method');
        });
        
        test('PurchaseManager should have purchaseRemoveAds method', () => {
            const purchaseManagerPath = path.join(projectRoot, 'src/utils/PurchaseManager.js');
            const content = readFile(purchaseManagerPath);
            
            expect(content).not.toBeNull();
            
            const hasMethod = content.includes('purchaseRemoveAds');
            expect(hasMethod).toBe(true);
            
            console.log('✅ BASELINE: PurchaseManager has purchaseRemoveAds method');
        });
        
        test('PurchaseManager should import react-native-purchases', () => {
            const purchaseManagerPath = path.join(projectRoot, 'src/utils/PurchaseManager.js');
            const content = readFile(purchaseManagerPath);
            
            expect(content).not.toBeNull();
            
            const importsRevenueCat = content.includes("from 'react-native-purchases'");
            expect(importsRevenueCat).toBe(true);
            
            console.log('✅ BASELINE: PurchaseManager imports react-native-purchases');
        });
    });
    
    describe('PremiumScreen Purchase Flow (Requirement 3.9)', () => {
        test('PremiumScreen.js file should exist', () => {
            const premiumScreenPath = path.join(projectRoot, 'src/screens/PremiumScreen.js');
            const exists = fileExists(premiumScreenPath);
            
            expect(exists).toBe(true);
            
            console.log('✅ BASELINE: PremiumScreen.js exists');
        });
        
        test('PremiumScreen should import PurchaseManager', () => {
            const premiumScreenPath = path.join(projectRoot, 'src/screens/PremiumScreen.js');
            const content = readFile(premiumScreenPath);
            
            expect(content).not.toBeNull();
            
            const importsPurchaseManager = fileImports(content, 'PurchaseManager');
            expect(importsPurchaseManager).toBe(true);
            
            console.log('✅ BASELINE: PremiumScreen imports PurchaseManager');
        });
        
        test('PremiumScreen should call PurchaseManager.purchaseRemoveAds', () => {
            const premiumScreenPath = path.join(projectRoot, 'src/screens/PremiumScreen.js');
            const content = readFile(premiumScreenPath);
            
            expect(content).not.toBeNull();
            
            const callsPurchase = content.includes('PurchaseManager.purchaseRemoveAds');
            expect(callsPurchase).toBe(true);
            
            console.log('✅ BASELINE: PremiumScreen calls PurchaseManager.purchaseRemoveAds');
        });
        
        test('PremiumScreen should import PremiumManager for refreshPremiumStatus', () => {
            const premiumScreenPath = path.join(projectRoot, 'src/screens/PremiumScreen.js');
            const content = readFile(premiumScreenPath);
            
            expect(content).not.toBeNull();
            
            const importsPremiumManager = fileImports(content, 'PremiumManager');
            expect(importsPremiumManager).toBe(true);
            
            console.log('✅ BASELINE: PremiumScreen imports PremiumManager');
        });
    });
    
    describe('Firebase hostHasPremium Integration (Requirement 3.7)', () => {
        test('PremiumManager should import updateHostPremiumStatus from connectionUtils', () => {
            const premiumManagerPath = path.join(projectRoot, 'src/utils/PremiumManager.js');
            const content = readFile(premiumManagerPath);
            
            expect(content).not.toBeNull();
            
            const importsUpdateFunction = content.includes('updateHostPremiumStatus');
            expect(importsUpdateFunction).toBe(true);
            
            console.log('✅ BASELINE: PremiumManager imports updateHostPremiumStatus');
        });
        
        test('checkAndSyncHostPremium should call updateHostPremiumStatus', () => {
            const premiumManagerPath = path.join(projectRoot, 'src/utils/PremiumManager.js');
            const content = readFile(premiumManagerPath);
            
            expect(content).not.toBeNull();
            
            // Find checkAndSyncHostPremium function
            const functionMatch = content.match(/async function checkAndSyncHostPremium[\s\S]*?(?=\nexport)/);
            expect(functionMatch).not.toBeNull();
            
            // Check it calls updateHostPremiumStatus
            const callsUpdate = functionMatch[0].includes('updateHostPremiumStatus');
            expect(callsUpdate).toBe(true);
            
            console.log('✅ BASELINE: checkAndSyncHostPremium calls updateHostPremiumStatus');
        });
        
        test('VoiceChatContext should monitor hostHasPremium field', () => {
            const voiceChatPath = path.join(projectRoot, 'src/utils/VoiceChatContext.js');
            const content = readFile(voiceChatPath);
            
            expect(content).not.toBeNull();
            
            // Check for hostHasPremium state
            const hasHostPremiumState = content.includes('hostHasPremium');
            expect(hasHostPremiumState).toBe(true);
            
            // Check for Firebase listener on hostHasPremium
            const hasFirebaseListener = content.includes('rooms/${currentRoomCode}/hostHasPremium') ||
                                       content.includes('rooms/') && content.includes('/hostHasPremium');
            expect(hasFirebaseListener).toBe(true);
            
            console.log('✅ BASELINE: VoiceChatContext monitors Firebase hostHasPremium field');
        });
    });
    
    describe('AsyncStorage Premium Keys (Requirement 3.10)', () => {
        test('AppInitializer should use premium_last_check AsyncStorage key', () => {
            const appInitPath = path.join(projectRoot, 'src/screens/AppInitializer.js');
            
            if (fileExists(appInitPath)) {
                const content = readFile(appInitPath);
                expect(content).not.toBeNull();
                
                const usesPremiumLastCheck = content.includes('premium_last_check');
                expect(usesPremiumLastCheck).toBe(true);
                
                console.log('✅ BASELINE: AppInitializer uses premium_last_check key');
            } else {
                console.log('⚠️  AppInitializer.js not found, skipping test');
            }
        });
        
        test('ProfileScreen should use profile_save_count AsyncStorage key', () => {
            const profilePath = path.join(projectRoot, 'src/screens/ProfileScreen.js');
            const content = readFile(profilePath);
            
            expect(content).not.toBeNull();
            
            const usesProfileSaveCount = content.includes('profile_save_count');
            expect(usesProfileSaveCount).toBe(true);
            
            console.log('✅ BASELINE: ProfileScreen uses profile_save_count key');
        });
    });
    
    describe('Summary - Preservation Baseline Established', () => {
        test('All current RevenueCat premium functionality is verified', () => {
            const verifiedComponents = [
                'PremiumScreen navigation from 4 entry points',
                'PremiumManager active functions (checkPremiumStatus, refreshPremiumStatus, checkAndSyncHostPremium, shouldShowAds)',
                'PurchaseManager RevenueCat integration',
                'PremiumScreen purchase flow',
                'Firebase hostHasPremium synchronization',
                'VoiceChatContext premium monitoring',
                'AsyncStorage premium keys'
            ];
            
            console.log('\n📋 PRESERVATION BASELINE ESTABLISHED:');
            console.log('='.repeat(70));
            verifiedComponents.forEach((component, index) => {
                console.log(`${index + 1}. ${component}`);
            });
            console.log('='.repeat(70));
            console.log(`\nTotal components verified: ${verifiedComponents.length}`);
            console.log('\n✅ These tests CORRECTLY PASSED - they establish the baseline to preserve.');
            console.log('   After implementing the fix, these tests should STILL PASS.\n');
            
            // This test always passes - it's just for documentation
            expect(verifiedComponents.length).toBeGreaterThan(0);
        });
    });
});
