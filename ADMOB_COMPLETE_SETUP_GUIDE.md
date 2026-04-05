# AdMob Complete Setup Guide - Step by Step

## ✅ Payment System Working!
Your RevenueCat/Google Play billing is working - you're seeing the purchase popup. Now let's add ads.

---

## Step 1: Access AdMob Console

### Try These URLs (in order):
1. **Primary:** https://admob.google.com
2. **Alternative:** https://apps.admob.google.com/v2/home
3. **Through Play Console:**
   - Go to: https://play.google.com/console
   - Select "Impostor Game: Film Edition"
   - Left sidebar → "Monetize" → "Monetization setup"
   - Click "Set up AdMob"

### Sign In With:
**starshape2025@gmail.com** (your Play Console account)

---

## Step 2: Create AdMob Account (If First Time)

If you see "Get Started" or "Sign Up":

1. Click "Get Started"
2. Select your country
3. Accept terms and conditions
4. Choose timezone
5. Click "Create AdMob Account"

---

## Step 3: Add Your App

### A. Click "Apps" in Left Sidebar

### B. Click "+ ADD APP" Button

### C. Fill in Details:
- **Is your app listed on Google Play?** → YES
- **Search for your app:** Type "Impostor Game" or paste: `com.rayn100.impostor`
- If not found, select "No" and enter manually:
  - App name: `Impostor Game: Film Edition`
  - Platform: Android
  - Package name: `com.rayn100.impostor`

### D. Click "ADD"

---

## Step 4: Create Interstitial Ad Unit

After adding your app, you'll see "Create ad unit" screen:

### A. Select "Interstitial"
(Full-screen ad that shows between game screens)

### B. Fill in Details:
- **Ad unit name:** `Interstitial Ad` (or any name you want)
- **Ad format:** Interstitial
- Leave other settings as default

### C. Click "CREATE AD UNIT"

### D. **IMPORTANT - COPY THESE IDs:**

You'll see a success screen with:

```
✅ Ad unit created!

App ID: ca-app-pub-1234567890123456~1234567890
Ad unit ID: ca-app-pub-1234567890123456/1234567890
```

**Copy BOTH IDs** - you'll need them in the next step!

---

## Step 5: Share IDs With Me

Once you have the IDs, share them here in this format:

```
App ID: ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX
Ad Unit ID: ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX
```

I'll update your code files immediately.

---

## Step 6: I'll Update Your Code

Once you share the IDs, I'll update:
1. `app.json` - Add your App ID
2. `src/utils/AdManager.js` - Add your Ad Unit ID

---

## Step 7: Build & Test

After I update the code:
```bash
eas build --platform android --profile production
```

---

## Troubleshooting

### Can't Access AdMob?
- **Check your internet connection**
- **Try incognito/private browsing mode**
- **Clear browser cache**
- **Try different browser** (Chrome, Edge, Firefox)
- **VPN might be blocking** - try disabling it

### App Not Found in Search?
- Select "No, it's not listed yet"
- Enter details manually
- You can link it to Play Store later

### Don't See "Create Ad Unit"?
- Click on your app name
- Click "Ad units" tab
- Click "+ ADD AD UNIT"

---

## What Happens After Setup?

1. ✅ Ads will show to FREE users
2. ✅ Premium users won't see ads (already coded)
3. ✅ You'll start earning revenue from ads
4. ⏳ First ads may take 24-48 hours to appear (Google review)

---

## Quick Summary

1. Go to https://admob.google.com
2. Sign in with starshape2025@gmail.com
3. Add app: "Impostor Game: Film Edition"
4. Create Interstitial ad unit
5. Copy App ID and Ad Unit ID
6. Share IDs with me
7. I'll update code
8. Build and deploy!

---

## Need Help?

If you get stuck at any step, tell me:
- Which step you're on
- What you see on screen
- Any error messages

I'll guide you through it!
