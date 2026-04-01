/**
 * Bug Condition Exploration Test for Old Premium System Cleanup
 * 
 * **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5**
 * 
 * CRITICAL: This test MUST FAIL on unfixed code - failure confirms the dead code exists.
 * DO NOT attempt to fix the test or the code when it fails.
 * 
 * This test encodes the expected behavior - it will validate the fix when it passes after implementation.
 * 
 * GOAL: Surface counterexamples that demonstrate old premium system code still exists in the codebase.
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

/**
 * Bug Condition: Old Premium System Remnants Exist
 * 
 * This test checks for specific code elements that should NOT exist after cleanup:
 * - ProVersionScreen.js file
 * - ProVersionScreen import in App.js
 * - ProVersion navigation route in App.js
 * - Unused helper functions exported from PremiumManager.js
 */
describe('Bug Condition Exploration - Old Premium System Remnants', () => {
    const projectRoot = path.resolve(__dirname, '../../..');
    
    describe('ProVersionScreen Dead Code', () => {
        test('ProVersionScreen.js file should NOT exist (Requirement 1.1)', () => {
            const filePath = path.join(projectRoot, 'src/screens/ProVersionScreen.js');
            const exists = fileExists(filePath);
            
            // EXPECTED TO FAIL on unfixed code: file exists
            expect(exists).toBe(false);
            
            if (exists) {
                console.log('❌ COUNTEREXAMPLE: ProVersionScreen.js file exists at:', filePath);
                const stats = fs.statSync(filePath);
                console.log(`   File size: ${stats.size} bytes`);
            }
        });
        
        test('App.js should NOT import ProVersionScreen (Requirement 1.2)', () => {
            const filePath = path.join(projectRoot, 'App.js');
            const content = readFile(filePath);
            
            expect(content).not.toBeNull();
            
            // Check for ProVersionScreen import
            const hasImport = content.includes('ProVersionScreen');
            
            // EXPECTED TO FAIL on unfixed code: import exists
            expect(hasImport).toBe(false);
            
            if (hasImport) {
                console.log('❌ COUNTEREXAMPLE: App.js imports ProVersionScreen');
                const importMatch = content.match(/import.*ProVersionScreen.*from.*/);
                if (importMatch) {
                    console.log(`   Import statement: ${importMatch[0]}`);
                }
            }
        });
        
        test('App.js should NOT register ProVersion navigation route (Requirement 1.3)', () => {
            const filePath = path.join(projectRoot, 'App.js');
            const content = readFile(filePath);
            
            expect(content).not.toBeNull();
            
            // Check for ProVersion navigation route
            const hasRoute = content.includes('name="ProVersion"');
            
            // EXPECTED TO FAIL on unfixed code: route exists
            expect(hasRoute).toBe(false);
            
            if (hasRoute) {
                console.log('❌ COUNTEREXAMPLE: App.js registers ProVersion navigation route');
                const routeMatch = content.match(/<Stack\.Screen.*name="ProVersion".*\/>/);
                if (routeMatch) {
                    console.log(`   Route registration: ${routeMatch[0]}`);
                }
            }
        });
    });
    
    describe('PremiumManager Unused Helper Functions', () => {
        test('PremiumManager should NOT export getAvailableCategories (Requirement 1.4)', () => {
            const filePath = path.join(projectRoot, 'src/utils/PremiumManager.js');
            const content = readFile(filePath);
            
            expect(content).not.toBeNull();
            
            // Check if function is defined
            const hasFunctionDefinition = content.includes('function getAvailableCategories');
            
            // Check if function is exported in default export
            const defaultExportMatch = content.match(/export default\s*{([^}]+)}/s);
            let hasExport = false;
            if (defaultExportMatch) {
                hasExport = defaultExportMatch[1].includes('getAvailableCategories');
            }
            
            // EXPECTED TO FAIL on unfixed code: function exists and is exported
            expect(hasFunctionDefinition).toBe(false);
            expect(hasExport).toBe(false);
            
            if (hasFunctionDefinition || hasExport) {
                console.log('❌ COUNTEREXAMPLE: getAvailableCategories exists in PremiumManager.js');
                if (hasFunctionDefinition) console.log('   - Function is defined');
                if (hasExport) console.log('   - Function is exported in default export');
            }
        });
        
        test('PremiumManager should NOT export isCategoryAvailable (Requirement 1.4)', () => {
            const filePath = path.join(projectRoot, 'src/utils/PremiumManager.js');
            const content = readFile(filePath);
            
            expect(content).not.toBeNull();
            
            // Check if function is defined
            const hasFunctionDefinition = content.includes('function isCategoryAvailable');
            
            // Check if function is exported in default export
            const defaultExportMatch = content.match(/export default\s*{([^}]+)}/s);
            let hasExport = false;
            if (defaultExportMatch) {
                hasExport = defaultExportMatch[1].includes('isCategoryAvailable');
            }
            
            // EXPECTED TO FAIL on unfixed code: function exists and is exported
            expect(hasFunctionDefinition).toBe(false);
            expect(hasExport).toBe(false);
            
            if (hasFunctionDefinition || hasExport) {
                console.log('❌ COUNTEREXAMPLE: isCategoryAvailable exists in PremiumManager.js');
                if (hasFunctionDefinition) console.log('   - Function is defined');
                if (hasExport) console.log('   - Function is exported in default export');
            }
        });
        
        test('PremiumManager should NOT export getPremiumStyling (Requirement 1.4)', () => {
            const filePath = path.join(projectRoot, 'src/utils/PremiumManager.js');
            const content = readFile(filePath);
            
            expect(content).not.toBeNull();
            
            // Check if function is defined
            const hasFunctionDefinition = content.includes('function getPremiumStyling');
            
            // Check if function is exported in default export
            const defaultExportMatch = content.match(/export default\s*{([^}]+)}/s);
            let hasExport = false;
            if (defaultExportMatch) {
                hasExport = defaultExportMatch[1].includes('getPremiumStyling');
            }
            
            // EXPECTED TO FAIL on unfixed code: function exists and is exported
            expect(hasFunctionDefinition).toBe(false);
            expect(hasExport).toBe(false);
            
            if (hasFunctionDefinition || hasExport) {
                console.log('❌ COUNTEREXAMPLE: getPremiumStyling exists in PremiumManager.js');
                if (hasFunctionDefinition) console.log('   - Function is defined');
                if (hasExport) console.log('   - Function is exported in default export');
            }
        });
        
        test('PremiumManager default export should only include active functions (Requirement 1.5)', () => {
            const filePath = path.join(projectRoot, 'src/utils/PremiumManager.js');
            const content = readFile(filePath);
            
            expect(content).not.toBeNull();
            
            // Extract default export object
            const defaultExportMatch = content.match(/export default\s*{([^}]+)}/s);
            expect(defaultExportMatch).not.toBeNull();
            
            if (defaultExportMatch) {
                const exportedFunctions = defaultExportMatch[1]
                    .split(',')
                    .map(line => line.trim())
                    .filter(line => line.length > 0);
                
                // Active functions that should be exported
                const activeFunctions = [
                    'checkPremiumStatus',
                    'refreshPremiumStatus',
                    'checkAndSyncHostPremium',
                    'shouldShowAds'
                ];
                
                // Unused functions that should NOT be exported
                const unusedFunctions = [
                    'getAvailableCategories',
                    'isCategoryAvailable',
                    'getPremiumStyling'
                ];
                
                // Check for unused functions in export
                const foundUnusedFunctions = unusedFunctions.filter(fn => 
                    defaultExportMatch[1].includes(fn)
                );
                
                // EXPECTED TO FAIL on unfixed code: unused functions are exported
                expect(foundUnusedFunctions.length).toBe(0);
                
                if (foundUnusedFunctions.length > 0) {
                    console.log('❌ COUNTEREXAMPLE: PremiumManager exports unused functions:');
                    foundUnusedFunctions.forEach(fn => {
                        console.log(`   - ${fn}`);
                    });
                }
            }
        });
    });
    
    describe('Summary of Old Premium System Remnants', () => {
        test('Document all counterexamples found', () => {
            const counterexamples = [];
            
            // Check ProVersionScreen.js
            const proVersionPath = path.join(projectRoot, 'src/screens/ProVersionScreen.js');
            if (fileExists(proVersionPath)) {
                counterexamples.push('ProVersionScreen.js file exists (8450 bytes, 263 lines)');
            }
            
            // Check App.js imports
            const appJsPath = path.join(projectRoot, 'App.js');
            const appJsContent = readFile(appJsPath);
            if (appJsContent && appJsContent.includes('ProVersionScreen')) {
                counterexamples.push('App.js imports ProVersionScreen');
            }
            if (appJsContent && appJsContent.includes('name="ProVersion"')) {
                counterexamples.push('App.js registers ProVersion navigation route');
            }
            
            // Check PremiumManager.js
            const premiumManagerPath = path.join(projectRoot, 'src/utils/PremiumManager.js');
            const premiumManagerContent = readFile(premiumManagerPath);
            if (premiumManagerContent) {
                if (premiumManagerContent.includes('function getAvailableCategories')) {
                    counterexamples.push('PremiumManager.js defines getAvailableCategories');
                }
                if (premiumManagerContent.includes('function isCategoryAvailable')) {
                    counterexamples.push('PremiumManager.js defines isCategoryAvailable');
                }
                if (premiumManagerContent.includes('function getPremiumStyling')) {
                    counterexamples.push('PremiumManager.js defines getPremiumStyling');
                }
                
                const defaultExportMatch = premiumManagerContent.match(/export default\s*{([^}]+)}/s);
                if (defaultExportMatch) {
                    const unusedInExport = ['getAvailableCategories', 'isCategoryAvailable', 'getPremiumStyling']
                        .filter(fn => defaultExportMatch[1].includes(fn));
                    if (unusedInExport.length > 0) {
                        counterexamples.push(`PremiumManager.js exports unused functions: ${unusedInExport.join(', ')}`);
                    }
                }
            }
            
            // EXPECTED TO FAIL on unfixed code: counterexamples exist
            expect(counterexamples.length).toBe(0);
            
            if (counterexamples.length > 0) {
                console.log('\n📋 SUMMARY OF COUNTEREXAMPLES (Old Premium System Remnants):');
                console.log('='.repeat(70));
                counterexamples.forEach((example, index) => {
                    console.log(`${index + 1}. ${example}`);
                });
                console.log('='.repeat(70));
                console.log(`\nTotal counterexamples found: ${counterexamples.length}`);
                console.log('\n✅ This test CORRECTLY FAILED - it proves the old system remnants exist.');
                console.log('   After implementing the fix, this test should PASS.\n');
            }
        });
    });
});
