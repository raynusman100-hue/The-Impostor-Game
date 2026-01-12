# App Store Compliance Checklist (Google Play & Apple App Store)

## ✅ IMPLEMENTED IN-APP

### Account Management
- [x] **In-App Account Deletion** - Profile → "DELETE ACCOUNT" button (cross-platform modal)
- [x] **Privacy Policy Screen** - In-app screen at Profile → Privacy Policy
- [x] **Terms of Service Screen** - In-app screen at Profile → Terms of Service
- [x] **Legal Links on Auth Screens** - Visible before account creation (Apple requirement)

### iOS Specific
- [x] **Camera Permission Description** - Clear explanation for QR code scanning
- [x] **Microphone Permission Description** - Clear explanation for voice messages
- [x] **Non-Exempt Encryption Declaration** - ITSAppUsesNonExemptEncryption = false

### Android Specific
- [x] **Cross-platform Delete Modal** - Uses Modal instead of iOS-only Alert.prompt
- [x] **All permissions declared** - INTERNET, NETWORK_STATE, RECORD_AUDIO, CAMERA

### Data & Privacy
- [x] **Data Minimization** - Only requesting necessary permissions (Camera for QR, Microphone for voice chat, Network for multiplayer)
- [x] **No Placeholder Content** - All UI elements are functional
- [x] **No Beta/Demo Labels** - App name and UI are production-ready

---

## ⚠️ PRODUCTION BUILD CHECKLIST

### Console Logging (CRITICAL)
A logger utility has been created at `src/utils/logger.js` with `IS_PRODUCTION = true`.

**Before submission, verify:**
- [ ] `IS_PRODUCTION` is set to `true` in `src/utils/logger.js`
- [ ] Run a production build and verify no console output appears

**Note:** The codebase has ~130 console statements. For a cleaner codebase, you can optionally replace them with the logger utility, but setting `IS_PRODUCTION = true` will suppress all output.

### Error Handling
- [ ] Test all error scenarios (network failures, Firebase errors)
- [ ] Verify graceful degradation when offline
- [ ] Test account deletion flow end-to-end

---

## 🔧 MANUAL SETUP REQUIRED

### 1. Apple App Store Connect Setup

**App Review Notes (REQUIRED):**
When submitting, provide a demo account in the "App Review Information" section:
```
Demo Account:
Email: reviewer@imposter-game.com
Password: ReviewerPass123!
```
Create this account in Firebase before submission.

**Age Rating Questionnaire:**
- Cartoon or Fantasy Violence: None
- Realistic Violence: None
- Sexual Content: None
- Profanity: None
- Drugs/Alcohol: None
- Gambling: None
- Horror/Fear: None
- Mature/Suggestive Themes: None
- User-Generated Content: No (usernames only, no chat)

Recommended Rating: **4+**

**Privacy Policy URL:**
You still need a PUBLIC web URL for the App Store listing metadata.
Host at: `https://rayn100.github.io/imposter-game/privacy-policy.html`

### 2. Google Play Console Setup

**Data Safety Form:**
| Data Type | Collected | Purpose | Shared |
|-----------|-----------|---------|--------|
| Email address | Yes | Account authentication | No |
| User ID | Yes | Account functionality | No |
| Username | Yes | In-game display | Yes (other players) |
| Voice messages | Yes | In-game chat | Yes (other players in same room) |

**Web-Based Account Deletion URL (Required):**
Host at: `https://rayn100.github.io/imposter-game/delete-account.html`

**20-Tester Rule:**
If dev account created after Nov 2023:
1. Create Closed Testing track
2. Add 20+ testers
3. Run for 14 days
4. Then apply for Production

### 3. Store Listing Assets

**Both Stores:**
- App Icon: 1024x1024 PNG (no alpha, no badges)
- Screenshots: At least 3 per device type
- Short Description: Max 80 chars
- Full Description: Max 4000 chars

**Apple Specific:**
- Preview Video (optional): 15-30 seconds

**Google Specific:**
- Feature Graphic: 1024x500 PNG
- No "Top Rated" or "Best" text on graphics

---

## 📋 PRE-SUBMISSION CHECKLIST

### Performance Testing
- [ ] Test on physical iPhone (not just simulator)
- [ ] Test on physical Android device
- [ ] Verify no crashes on app startup
- [ ] Test all buttons lead somewhere (no dead ends)
- [ ] Test account creation flow
- [ ] Test account deletion flow
- [ ] Test WiFi multiplayer with 2+ devices
- [ ] Test pass-and-play mode

### Firebase Backend
- [ ] Firebase project is live and accessible
- [ ] Security rules are properly configured
- [ ] Demo reviewer account created

### Legal
- [ ] Privacy Policy web page hosted
- [ ] Terms of Service web page hosted  
- [ ] Account deletion web page hosted (Google)
- [ ] Contact email is valid and monitored

### Metadata
- [ ] App name doesn't contain "Beta", "Demo", "Trial"
- [ ] Screenshots show actual app (not mockups)
- [ ] Description is accurate
- [ ] Age rating is appropriate (4+)

---

## 🚫 COMMON REJECTION REASONS TO AVOID

### Apple
1. **Crash on launch** - Test on real devices
2. **Placeholder content** - Remove all "Lorem ipsum" or empty states
3. **Missing demo account** - Provide in App Review notes
4. **Privacy policy not accessible** - Must be live URL
5. **Permission without purpose** - Camera is justified (QR scanning)

### Google
1. **Data Safety mismatch** - Form must match actual data collection
2. **No account deletion** - ✅ Already implemented
3. **No web deletion option** - Need to host web page
4. **Target API too low** - Expo SDK 54 handles this

---

## 📄 WEB PAGES TO HOST

Create a GitHub Pages site with these files:

### privacy-policy.html
(Copy content from PrivacyPolicyScreen.js, convert to HTML)

### terms.html  
(Copy content from TermsOfServiceScreen.js, convert to HTML)

### delete-account.html
```html
<!DOCTYPE html>
<html>
<head>
    <title>Delete Account - Imposter Game</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body { font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #0a0a0a; color: #fff; }
        h1 { color: #FFB800; }
        .option { background: #1a1a1a; padding: 20px; border-radius: 12px; margin: 20px 0; border: 1px solid #333; }
    </style>
</head>
<body>
    <h1>🗑️ Delete Your Account</h1>
    
    <div class="option">
        <h2>Option 1: In-App (Recommended)</h2>
        <ol>
            <li>Open Imposter Game</li>
            <li>Go to Profile</li>
            <li>Tap "Delete Account"</li>
            <li>Confirm with your password</li>
        </ol>
    </div>
    
    <div class="option">
        <h2>Option 2: Email Request</h2>
        <p>Email <strong>imposter.game.app@gmail.com</strong> with:</p>
        <ul>
            <li>Subject: "Account Deletion Request"</li>
            <li>Your account email address</li>
        </ul>
        <p>We'll process within 7 business days.</p>
    </div>
    
    <p><strong>Warning:</strong> This permanently deletes your account, username, and all data.</p>
</body>
</html>
```

---

## ✅ FINAL SUBMISSION READY WHEN:

- [ ] All in-app features tested and working
- [ ] Demo account created for Apple reviewer
- [ ] Web pages hosted (privacy, terms, delete-account)
- [ ] Store listing assets prepared
- [ ] Data Safety form ready (Google)
- [ ] 20-tester period completed (if applicable)
