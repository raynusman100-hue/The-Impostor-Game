---
description: How to setup and trigger Codemagic builds
---

# Codemagic Setup & Trigger Guide

This project is configured to build an Android Preview APK using Codemagic.

## Prerequisites
1.  **Push Code**: Ensure all your latest changes are pushed to your GitHub repository.
    (This is handled automatically by the agent pushing to the `codemagic` branch).

2.  **Codemagic Account**:
    -   Log in to [Codemagic](https://codemagic.io/).
    -   Add Application -> Connect Repository (GitHub) -> Select `raynusman100-hue/The-Impostor-Game`.

3.  **Configuration**:
    -   Codemagic should automatically detect `codemagic.yaml` in the root.
    -   If not, go to App Settings -> Workflow Editor -> Switch to `codemagic.yaml` mode.

## Triggering a Build
1.  Go to your App in Codemagic.
2.  Click **Start new build**.
3.  **Select Branch**: choose **`codemagic`**.
4.  Select workflow: **Android Preview Build**.
5.  Click **Start build**.

## Result
-   Wait ~10-15 minutes.
-   Download the **app-debug.apk** from the build artifacts.
-   Install it on your Android device to test Native Google Sign-In.
