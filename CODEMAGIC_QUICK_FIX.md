# Codemagic Build Error - Quick Fix

## What Changed

Updated `codemagic.yaml` with improved build configuration for the `android-apk-unsigned` workflow (codemagic branch).

## Key Improvements

### 1. **More Memory**
- JVM Heap: 6GB (was 4GB)
- Metaspace: 1.5GB (was 1GB)
- Kotlin Daemon: 2GB

### 2. **Better Cleanup**
- Stops Gradle daemons properly
- Removes build directories
- Cleans Gradle cache before building

### 3. **Fallback Build**
- If first build fails, automatically tries a simpler build
- Disables lint checks and R8 optimization
- Uses single worker (less memory)

### 4. **Enhanced Logging**
- Added `--info` flag for detailed logs
- Added environment verification step
- Better error messages

### 5. **Optimized Settings**
- Reduced workers from 4 to 2
- Disabled R8 full mode
- Added heap dump on OOM

## What to Do Now

1. **Commit and push** the updated `codemagic.yaml`:
   ```bash
   git add codemagic.yaml
   git commit -m "Fix: Improve Codemagic build configuration with fallback"
   git push origin codemagic
   ```

2. **Trigger a new build** in Codemagic (it should auto-trigger on push)

3. **Check the logs** for the new "Verify Build Environment" step

4. **If it still fails**, look for the specific error message in the logs and check `CODEMAGIC_BUILD_TROUBLESHOOTING.md`

## Expected Build Flow

```
✓ Install dependencies
✓ Prebuild Android native project
✓ Verify Build Environment (NEW)
✓ Build Release APK (Unsigned)
  ├─ Try optimized build first
  └─ If fails → Try fallback build (simpler)
✓ Print APK Info
```

## Common Issues & Quick Fixes

### Issue: Still getting OOM errors
**Fix:** In codemagic.yaml, change:
```yaml
instance_type: mac_pro  # More powerful machine
```

### Issue: Build times out
**Fix:** In codemagic.yaml, change:
```yaml
max_build_duration: 120  # Increase timeout
```

### Issue: Specific Gradle task fails
**Fix:** Add to the build command:
```bash
-x lintVitalRelease  # Skip lint
-x test              # Skip tests
```

## Getting Help

If the build still fails:
1. Copy the **full error message** from Codemagic logs
2. Note which **Gradle task** failed (e.g., `:app:mergeReleaseResources`)
3. Check if it **works locally**: `cd android && ./gradlew assembleRelease`
4. Share the error details

## Testing Locally

Before pushing to Codemagic, test the build locally:

```bash
# Clean everything
cd android
./gradlew --stop
rm -rf app/build build
./gradlew clean

# Build with same settings as Codemagic
./gradlew assembleRelease \
  --no-daemon \
  --max-workers=2 \
  --stacktrace \
  -Pandroid.enableR8.fullMode=false
```

If it works locally but fails on Codemagic, it's likely a memory or environment issue.
