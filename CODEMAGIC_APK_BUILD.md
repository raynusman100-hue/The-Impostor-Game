# Codemagic APK Build Branch

This branch (`codemagic-apk`) is specifically configured for building APKs using Codemagic CI/CD.

## Purpose
- **Separate from dev branches**: Keeps build configuration isolated from development work
- **APK Generation**: Automated Android APK builds via Codemagic
- **No interference**: Won't affect your tested dev files

## How to Use

### 1. Setup in Codemagic
1. Go to [Codemagic](https://codemagic.io/)
2. Add your repository: `raynusman100-hue/The-Impostor-Game`
3. In App Settings → Workflow Editor:
   - Switch to "YAML configuration" mode
   - Set Configuration file path to: `codemagic_build.yaml`

### 2. Trigger APK Build
1. Go to your app in Codemagic
2. Click **Start new build**
3. **Select Branch**: `codemagic-apk`
4. Select workflow: **Android Preview Build**
5. Click **Start build**

### 3. Download APK
- Wait ~10-15 minutes for build completion
- Download `app-debug.apk` from build artifacts
- Install on Android device for testing

## Build Configurations

### Preview Build (Debug APK)
- **Trigger**: Push to `codemagic-apk` branch
- **Output**: Debug APK for testing
- **Time**: ~10-15 minutes

### Release Build (Production APK/AAB)
- **Trigger**: Git tags (v1.0.0, v1.1.0, etc.)
- **Output**: Release APK + AAB for Play Store
- **Features**: Signed, optimized, ready for distribution

## Branch Strategy
```
main
├── ios-dev (your iOS development)
├── apk-dev (your Android development with all features)
└── codemagic-apk (this branch - APK builds only)
```

## Files Added
- `codemagic_build.yaml` - Codemagic build configuration
- `CODEMAGIC_APK_BUILD.md` - This documentation

## Important Notes
- This branch is based on the stable `codemagic` branch
- No development features from `apk-dev` are included here
- Only add build-related configurations to this branch
- Keep your development work in `apk-dev` branch

## Updating This Branch
When you want to include new features in APK builds:
1. Merge your tested features from `apk-dev` into this branch
2. Test the build in Codemagic
3. Only merge stable, tested code

## Support
- Build issues: Check Codemagic build logs
- Configuration issues: Review `codemagic_build.yaml`
- App issues: Test in `apk-dev` branch first