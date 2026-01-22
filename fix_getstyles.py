import os
import re

# Base path
src_path = r"c:\Users\shuai\OneDrive\Desktop\New folder\zayan10\src"

# Files to fix (screens and components)
files_to_fix = [
    "screens/SetupScreen.js",
    "screens/HomeScreen.js",
    "screens/WifiLobbyScreen.js",
    "screens/WifiVotingScreen.js",
    "screens/WifiWhoStartsScreen.js",
    "screens/WifiModeSelectorScreen.js",
    "screens/RoleRevealScreen.js",
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

fixed_count = 0
error_count = 0

for file_rel in files_to_fix:
    file_path = os.path.join(src_path, file_rel)
    
    if not os.path.exists(file_path):
        print(f"SKIP: {file_rel} (not found)")
        continue
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check if it has the pattern
        if 'const getStyles =' not in content:
            print(f"SKIP: {file_rel} (no const getStyles)")
            continue
        
        # Find the getStyles declaration
        # Pattern: const getStyles = (theme...) => StyleSheet.create({
        pattern = r'const getStyles = \((.*?)\) => StyleSheet\.create\(\{'
        
        if not re.search(pattern, content):
            print(f"SKIP: {file_rel} (pattern not found)")
            continue
        
        # Replace with function declaration
        new_content = re.sub(
            pattern,
            r'function getStyles(\1) {\n    return StyleSheet.create({',
            content
        )
        
        # Find the last }); that closes the StyleSheet.create and add closing }
        # We need to find the matching }); for the getStyles function
        # This is tricky - let's use a different approach
        
        # Find where const getStyles was
        match = re.search(r'function getStyles\(.*?\) \{', new_content)
        if not match:
            print(f"ERROR: {file_rel} (can't find function start)")
            error_count += 1
            continue
        
        start_pos = match.end()
        
        # Find the closing }); after the opening
        # Count braces to find the right one
        brace_count = 0
        in_stylesheet = False
        close_pos = -1
        
        i = start_pos
        while i < len(new_content):
            if new_content[i:i+20] == 'StyleSheet.create({':
                in_stylesheet = True
                brace_count = 1
                i += 20
                continue
            
            if in_stylesheet:
                if new_content[i] == '{':
                    brace_count += 1
                elif new_content[i] == '}':
                    brace_count -= 1
                    if brace_count == 0:
                        # Found the closing }, check if followed by );
                        if new_content[i:i+3] == '});':
                            close_pos = i + 3
                            break
            i += 1
        
        if close_pos == -1:
            print(f"ERROR: {file_rel} (can't find closing braces)")
            error_count += 1
            continue
        
        # Add closing } after });
        final_content = new_content[:close_pos] + '\n}' + new_content[close_pos:]
        
        # Write back
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(final_content)
        
        print(f"FIXED: {file_rel}")
        fixed_count += 1
        
    except Exception as e:
        print(f"ERROR: {file_rel} - {str(e)}")
        error_count += 1

print(f"\n=== Summary ===")
print(f"Fixed: {fixed_count}")
print(f"Errors: {error_count}")
