import os
import re

src_path = r"c:\Users\shuai\OneDrive\Desktop\New folder\zayan10\src"

# All files that need fixing based on grep_search results
files = [
    "screens/SetupScreen.js",
    "screens/HomeScreen.js",
    "screens/WifiLobbyScreen.js",
    "screens/WifiVotingScreen.js",
    "screens/WifiWhoStartsScreen.js",
    "screens/WifiModeSelectorScreen.js",
    "screens/DiscussionScreen.js",
    "screens/ResultScreen.js",
    "screens/WhoStartsScreen.js",
    "screens/VotingScreen.js",
    "screens/HostScreen.js",
    "screens/JoinScreen.js",
    "screens/PremiumScreen.js",
    "screens/ConsentScreen.js",
    "screens/PrivacyPolicyScreen.js",
    "screens/TermsOfServiceScreen.js",
    "screens/ThemeSelectorScreen.js",
    "components/VoiceControl.js",
    "components/RoleCard.js",
    "components/ChatSystem.js",
    "components/LanguageSelectorModal.js"
]

for file_rel in files:
    file_path = os.path.join(src_path, file_rel)
    
    if not os.path.exists(file_path):
        print(f"SKIP: {file_rel} (not found)")
        continue
    
    try:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
        
        # Check if it needs fixing
        if 'const getStyles = ' not in content:
            print(f"SKIP: {file_rel} (already fixed or no getStyles)")
            continue
        
        # Step 1: Replace the const declaration with function
        new_content = re.sub(
            r'const getStyles = \(([^)]+)\) => StyleSheet\.create\(\{',
            r'function getStyles(\1) {\n    return StyleSheet.create({',
            content,
            count=1
        )
        
        # Step 2: Find the LAST occurrence of }); and append }
        # But we need to be careful - only the one for StyleSheet.create
        # Since we know it's at the end of the file, let's look for });`r`n} or just });
        
        # Remove the corrupted `r`n} pattern if it exists
        new_content = new_content.replace('});`r`n}', '});\n}')
        
        # If the file ends with }); (no closing function brace), add it
        if new_content.rstrip().endswith('});'):
            new_content = new_content.rstrip() + '\n}\n'
        
        # Write back
        with open(file_path, 'w', encoding='utf-8', newline='') as f:
            f.write(new_content)
        
        print(f"FIXED: {file_rel}")
        
    except Exception as e:
        print(f"ERROR: {file_rel} - {str(e)}")

print("\nDone!")
