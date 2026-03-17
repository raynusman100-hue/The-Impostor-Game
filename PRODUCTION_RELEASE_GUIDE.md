# Production Release Guide - Play Store

Complete guide for publishing your app to the Google Play Store for the first time.

---

## Current Status: Internal Testing ✅

Your app is now in internal testing. Before moving to production, you need to complete several required sections.

---

## Prerequisites Before Production Release

### 1. Complete Store Listing (REQUIRED)

Go to: **Grow → Store presence → Main store listing**

Fill in ALL required fields:

#### App Details:
- **App name**: Impostor Game: Film Edition
- **Short description** (80 chars max):
  ```
  Multiplayer word guessing game with voice chat. Find the impostor among players!
  ```

- **Full description** (4000 chars max):
  ```
  Welcome to Impostor Game: Film Edition - the ultimate multiplayer word guessing experience!

  🎮 GAME FEATURES:
  • Multiplayer word guessing gameplay
  • WiFi local multiplayer mode - play with friends nearby
  • Voice chat support for real-time communication
  • Multiple themed categories (Movies, Sports, Food, and more)
  • Premium features with exclusive content
  • Google Sign-In for easy account management
  • Customizable avatars and profiles

  🎯 HOW TO PLAY:
  One player is secretly assigned as the "impostor" who doesn't know the secret word. All other players know the word. Through discussion and voting, players must identify the impostor before they figure out the secret word!

  🌟 PREMIUM FEATURES:
  Unlock exclusive categories, remove ads, and access special game modes with our premium subscription.

  📱 PERFECT FOR:
  • Family game nights
  • Party entertainment
  • Team building activities
  • Social gatherings
  • Online gaming with friends

  Download now and start guessing!
  ```

#### Graphics Assets (REQUIRED):
You need to create and upload:

1. **App icon** (512 x 512 px, PNG, 32-bit)
2. **Feature graphic** (1024 x 500 px, JPG or PNG)
3. **Phone screenshots** (At least 2, up to 8):
   - Minimum: 320px
   - Maximum: 3840px
   - Aspect ratio: 16:9 to 9:16

4. **7-inch tablet screenshots** (Optional but recommended)
5. **10-inch tablet screenshots** (Optional but recommended)

#### Categorization:
- **App category**: Games → Word
- **Tags**: Add relevant tags (multiplayer, word game, party game, etc.)

#### Contact Details:
- **Email**: raynusman100hue@gmail.com
- **Phone**: (Optional)
- **Website**: (Optional but recommended)

#### Privacy Policy (REQUIRED):
- **Privacy policy URL**: You MUST provide a privacy policy URL
  - You can use a free generator like: https://www.freeprivacypolicy.com/
  - Or host it on GitHub Pages, Google Sites, etc.

---

### 2. Content Rating (REQUIRED)

Go to: **Policy → App content → Content rating**

Complete the questionnaire:
- Select your app category: **Game**
- Answer questions about violence, sexual content, language, etc.
- For your game, it should be rated **PEGI 3** or **Everyone**

---

### 3. Target Audience and Content (REQUIRED)

Go to: **Policy → App content → Target audience and content**

- **Target age group**: Select appropriate age (likely 13+)
- **Appeal to children**: Select "No" (unless specifically designed for kids)

---

### 4. Privacy and Security (REQUIRED)

Go to: **Policy → App content → Privacy and security**

Complete sections:
- **Data safety**: Declare what data you collect
  - User account info (Google Sign-In)
  - Device or other IDs
  - App activity
- **Data deletion**: Provide instructions for users to delete their data

---

### 5. App Access (REQUIRED)

Go to: **Policy → App content → App access**

- Declare if your app requires special access or login
- For your app: "All functionality is available without restrictions"

---

### 6. Ads Declaration (REQUIRED)

Go to: **Policy → App content → Ads**

- **Does your app contain ads?**: Yes (you use Google Mobile Ads)
- Declare ad types and placement

---

### 7. Government Apps (REQUIRED)

Go to: **Policy → App content → Government apps**

- Select "No" (unless you're a government entity)

---

### 8. Financial Features (REQUIRED if applicable)

Go to: **Policy → App content → Financial features**

- Declare if your app handles financial transactions
- For premium features: Declare in-app purchases

---

### 9. Health & Fitness (REQUIRED if applicable)

Go to: **Policy → App content → Health**

- Select "No" (your app doesn't provide health/fitness features)

---

### 10. Data Safety Form (REQUIRED)

Go to: **Policy → App content → Data safety**

Declare:
- What data you collect (email, user ID, device info)
- How you use it (authentication, analytics)
- Whether it's shared with third parties
- Security practices

---

## After Completing All Requirements

### Step 1: Review Dashboard

Go to: **Dashboard** (left sidebar)

Check that all sections show:
- ✅ Green checkmarks (completed)
- No ❌ red X marks (incomplete)

### Step 2: Create Production Release

1. Go to: **Release → Production** (left sidebar)
2. Click **"Create new release"**
3. Upload the SAME AAB you used for internal testing
4. Add release notes for production
5. Set rollout percentage:
   - Start with **20%** for safety
   - Monitor for crashes/issues
   - Increase to 50%, then 100%

### Step 3: Submit for Review

1. Click **"Review release"**
2. Review all information
3. Click **"Start rollout to Production"**

### Step 4: Wait for Google Review

- **Review time**: 1-7 days (usually 1-3 days)
- Google will review your app for policy compliance
- You'll receive an email when approved or if changes are needed

---

## Production Release Checklist

Before submitting, verify:

- [ ] Store listing complete (name, description, graphics)
- [ ] Screenshots uploaded (at least 2 phone screenshots)
- [ ] Feature graphic uploaded
- [ ] App icon uploaded
- [ ] Privacy policy URL provided
- [ ] Content rating completed
- [ ] Target audience declared
- [ ] Data safety form completed
- [ ] Ads declaration completed
- [ ] All policy sections completed
- [ ] AAB uploaded to production track
- [ ] Release notes added
- [ ] Rollout percentage set (recommend 20% initially)

---

## After Approval

Once Google approves your app:

1. **Monitor**: Check Play Console for crash reports and user feedback
2. **Respond**: Reply to user reviews (builds trust)
3. **Update**: Release updates to fix bugs and add features
4. **Promote**: Share your Play Store link with users

---

## Important Notes

### Testing Period Recommendation:
- Keep app in **internal testing** for at least 1-2 weeks
- Get feedback from testers
- Fix any critical bugs
- Then move to production

### Rollout Strategy:
- Start with **20% rollout** to production
- Monitor for 24-48 hours
- If no issues, increase to **50%**
- After another 24-48 hours, go to **100%**

### Version Management:
- Always increment `versionCode` in `app.json` for new releases
- Current: `versionCode: 2`
- Next release: `versionCode: 3`

---

## Quick Commands for Next Release

When ready to build a new version:

```bash
# Update version in app.json first
# Then build new AAB
eas build --platform android --profile production-aab --non-interactive
```

---

## Need Help?

Common issues:
- **Missing screenshots**: Use Android emulator or real device to capture
- **Privacy policy**: Use free generators online
- **Content rating**: Answer honestly, most games are PEGI 3 or Everyone
- **Data safety**: Declare Google Sign-In and analytics data

---

## Timeline Estimate

From internal testing to production:

1. Complete all requirements: **2-4 hours** (first time)
2. Submit for review: **5 minutes**
3. Google review: **1-7 days**
4. App goes live: **Immediately after approval**

---

**Current Status**: Internal testing complete ✅
**Next Step**: Complete store listing and policy sections
**Estimated Time to Production**: 1-2 weeks (including testing period)

Good luck with your production release! 🚀
