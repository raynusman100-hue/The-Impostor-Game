---
description: Build iOS IPA without paid Apple Account and install via Sideloadly
---

# Unsigned iOS Build + Sideloadly Workflow

This workflow allows you to build an iOS app **without a paid Apple Developer Account ($99/yr)** and install it on your iPhone using Sideloadly.

## How It Works
1.  **Codemagic** builds the app in the cloud *without signing it*.
2.  **You download** the unsigned `.ipa` file.
3.  **Sideloadly** signs it (using your free Apple ID) and installs it.

## 1. Trigger the Build
Push your code to the `ios-dev` branch to start the build automatically.

```bash
git checkout -b ios-dev
git add .
git commit -m "Trigger iOS dev build"
git push origin ios-dev
```

## 2. Download the IPA
1.  Go to Codemagic Dashboard.
2.  Wait for the **iOS Unsigned Dev Build** to finish (~15 mins).
3.  Download `imposter-dev-unsigned.ipa` from Artifacts.

## 3. Install & Sign via Sideloadly
1.  Open **Sideloadly** on Windows.
2.  Connect your iPhone via USB.
3.  Drag `imposter-dev-unsigned.ipa` into Sideloadly.
4.  Enter your Apple ID (free account is fine).
5.  Click **Start**.
    *   Sideloadly will extract the app, sign it with your personal cert, and install it.

## 4. Trust & Run
1.  On iPhone: Settings -> General -> VPN & Device Management.
2.  Trust your email address.
3.  Open the App.

## 5. Daily Development (Instant Reload)
Since this is a **Debug/Development Build**:
1.  Run `npx expo start --dev-client` on your PC.
2.  Open the app on iPhone.
3.  Scan the QR code.
4.  **Instant Reload** works just like Android!

## Note on Expiration
Files signed with a free Apple ID expire after **7 days**.
*   **Solution**: Just run Sideloadly again with the *same* IPA file every 7 days. You don't need to rebuild unless you added native code.
