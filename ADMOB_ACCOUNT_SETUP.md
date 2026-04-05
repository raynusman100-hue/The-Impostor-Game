# AdMob Account Setup - Your Configuration

## Your Current Setup

**Firebase Project:** `imposter-game-e5f12`
**Project Number:** `831244408092`

**Accounts:**
- Play Console: starshape2025@gmail.com (owner)
- Firebase: Different account with admin role

---

## Recommended Approach

### Use starshape2025@gmail.com for AdMob

**Why?**
1. ✅ Same account as Play Console (easier management)
2. ✅ AdMob links to Play Console for app verification
3. ✅ Single account for all monetization (Play Store + AdMob)
4. ✅ Simpler revenue tracking

**How to Set Up:**

1. **Go to AdMob with starshape2025 account:**
   - Visit: https://admob.google.com
   - Sign in with: starshape2025@gmail.com
   - Click "Get Started" if first time

2. **Link to Firebase (Optional but Recommended):**
   - In AdMob, go to Settings → Firebase
   - Link to project: `imposter-game-e5f12`
   - This allows cross-platform analytics

3. **Add Your App:**
   - Click "Apps" → "Add App"
   - Select "Android"
   - Choose "Yes, it's listed on Google Play"
   - Enter package name: `com.rayn100.impostor`
   - App name: "Impostor Game: Film Edition"

4. **Create Ad Unit:**
   - Select your app
   - Click "Ad units" → "Add ad unit"
   - Select "Interstitial"
   - Name: "Interstitial Ad"
   - Click "Create ad unit"

5. **Copy IDs:**
   - App ID: `ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX`
   - Ad Unit ID: `ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX`

---

## Alternative: Use Firebase Account

If you prefer to use the Firebase admin account:

**Pros:**
- ✅ Same account as Firebase (unified analytics)
- ✅ Can manage from Firebase Console

**Cons:**
- ❌ Different from Play Console account
- ❌ Need to grant AdMob access separately
- ❌ More complex permission management

**Setup:**
1. Sign in to AdMob with Firebase account
2. Follow same steps as above
3. Grant starshape2025 account "Admin" role in AdMob settings

---

## My Recommendation

**Use starshape2025@gmail.com** because:
- It's your Play Console account
- Simpler to manage everything in one place
- AdMob and Play Console work better together
- You can still link to Firebase project

---

## After You Get IDs

Share with me:
1. Android App ID (for app.json)
2. Android Interstitial Ad Unit ID (for AdManager.js)

Or I can disable ads temporarily for internal testing.

---

## Quick Decision

**For Internal Testing NOW:**
→ Disable ads temporarily (I can do this in 30 seconds)

**For Production Launch:**
→ Set up AdMob with starshape2025@gmail.com (takes 10 minutes)

What would you like to do?
