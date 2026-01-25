# Codemagic Android Build Troubleshooting Guide

## Error: "Step 4 Build Release APK (Unsigned) exited with status code 1"

This error typically occurs during the Gradle build process. Here are the most common causes and solutions:

## Common Causes

### 1. **Resource Linking Errors (AAPT2)**
**Symptoms:**
- Error messages mentioning "AAPT2" or "resource linking failed"
- Errors about duplicate resources or invalid resource names

**Solutions:**
- Clean build directories before building
- Ensure all resource files follow Android naming conventions (lowercase, no special chars except underscore)
- Check for duplicate resource files

### 2. **Out of Memory Errors**
**Symptoms:**
- "OutOfMemoryError: Java heap space"
- "GC overhead limit exceeded"
- Build hangs or crashes without clear error

**Solutions:**
- Increase JVM heap size (already configured in updated codemagic.yaml)
- Reduce max-workers to 2 (less parallel processing = less memory)
- Use `--no-daemon` to prevent memory leaks

### 3. **Gradle Daemon Conflicts**
**Symptoms:**
- "Daemon will be stopped at the end of the build"
- Inconsistent build failures
- Timeout errors

**Solutions:**
- Stop all Gradle daemons before building (`./gradlew --stop`)
- Use `--no-daemon` flag
- Clean Gradle cache

### 4. **Dependency Resolution Issues**
**Symptoms:**
- "Could not resolve dependency"
- "Failed to download" errors
- Version conflict errors

**Solutions:**
- Clear npm cache: `npm cache clean --force`
- Delete node_modules and reinstall
- Check network connectivity in Codemagic

### 5. **Native Module Compilation Errors**
**Symptoms:**
- Errors mentioning specific native modules (react-native-*, expo-*)
- NDK or CMake errors
- JNI errors

**Solutions:**
- Ensure all native dependencies are compatible
- Check NDK version matches requirements
- Verify expo prebuild completed successfully

## Updated Codemagic Configuration

The codemagic.yaml has been updated with:

1. **Increased Memory Allocation**
   - JVM heap: 6GB (up from 4GB)
   - Metaspace: 1.5GB (up from 1GB)
   - Kotlin daemon: 2GB

2. **Reduced Parallelization**
   - max-workers: 2 (down from 4)
   - Prevents memory exhaustion on CI machines

3. **Enhanced Logging**
   - Added `--info` flag for detailed build logs
   - Added `--stacktrace` for error traces
   - Added environment verification step

4. **Aggressive Cleanup**
   - Stops Gradle daemons
   - Removes build directories
   - Cleans Gradle cache

5. **Build Optimizations**
   - Disabled R8 full mode (faster builds)
   - Enabled AndroidX and Jetifier
   - Added heap dump on OOM for debugging

## Debugging Steps

### Step 1: Check Codemagic Build Logs
Look for these specific error patterns:

```
FAILURE: Build failed with an exception.
```

Common error types:
- `Task :app:mergeReleaseResources FAILED` → Resource issues
- `Task :app:bundleReleaseJsAndAssets FAILED` → JS bundling issues
- `Task :app:compileReleaseKotlin FAILED` → Kotlin compilation issues
- `Execution failed for task ':app:lintVitalRelease'` → Lint errors

### Step 2: Verify Environment
The new "Verify Build Environment" step will show:
- Node, NPM, Java, Gradle versions
- Critical file existence
- Resource directory structure

### Step 3: Check for Resource Issues
Common resource problems:
- Files with uppercase letters in `res/` directories
- Special characters in resource names
- Duplicate resource IDs
- Invalid XML in layout files

### Step 4: Test Locally
Before pushing to Codemagic, test locally:

```bash
cd android
./gradlew clean
./gradlew assembleRelease --stacktrace --info
```

If it works locally but fails on Codemagic, it's likely a memory or environment issue.

## Quick Fixes to Try

### Fix 1: Reduce Build Complexity
Temporarily disable features to isolate the issue:

In `gradle.properties`:
```properties
# Disable new architecture temporarily
newArchEnabled=false

# Disable R8 optimization
android.enableR8=false
```

### Fix 2: Increase Build Timeout
In `codemagic.yaml`:
```yaml
max_build_duration: 120  # Increase from 90 to 120 minutes
```

### Fix 3: Use Different Instance Type
Try a more powerful machine:
```yaml
instance_type: mac_pro  # More memory and CPU
```

### Fix 4: Split Build Steps
Break the build into smaller steps:

```yaml
- name: Assemble Release (No Lint)
  script: |
    cd android
    ./gradlew assembleRelease -x lintVitalRelease --stacktrace
```

### Fix 5: Clear Codemagic Cache
In Codemagic UI:
1. Go to your app settings
2. Find "Dependency caching"
3. Click "Clear cache"
4. Trigger new build

## Environment Variables to Check

Ensure these are set in Codemagic (if needed):
- `JAVA_HOME` - Should be auto-set by Codemagic
- `ANDROID_HOME` - Should be auto-set by Codemagic
- `NODE_OPTIONS` - Can set to `--max-old-space-size=4096` if needed

## Getting More Information

### Enable Gradle Scan
Add to build command:
```bash
./gradlew assembleRelease --scan
```

This creates a detailed build report you can share.

### Enable Verbose Logging
Add to `gradle.properties`:
```properties
org.gradle.logging.level=debug
```

## Common Error Messages and Solutions

### "Execution failed for task ':app:mergeReleaseResources'"
**Cause:** Resource conflict or invalid resource
**Fix:** Check for duplicate resources, invalid XML, or naming issues

### "Could not determine the dependencies of task ':app:compileReleaseJavaWithJavac'"
**Cause:** Dependency resolution failure
**Fix:** Clear caches, check network, verify dependencies in build.gradle

### "Process 'command 'node'' finished with non-zero exit value 1"
**Cause:** JS bundling failed
**Fix:** Check for JS syntax errors, missing dependencies, or Metro bundler issues

### "AAPT: error: resource android:attr/lStar not found"
**Cause:** compileSdkVersion mismatch
**Fix:** Ensure compileSdkVersion is 31 or higher (currently set to 35)

## Next Steps

1. **Push the updated codemagic.yaml** to your `codemagic` branch
2. **Trigger a new build** in Codemagic
3. **Check the new "Verify Build Environment" step** output
4. **Review the detailed logs** from the build step with `--info` flag
5. **Share specific error messages** if the build still fails

## Contact Support

If the issue persists:
1. Copy the full error log from Codemagic
2. Note which specific Gradle task failed
3. Check if the same build works locally
4. Share the error details for more specific help
