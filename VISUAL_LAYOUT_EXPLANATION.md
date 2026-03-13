# Visual Layout Explanation

## BEFORE (Problem)

```
┌─────────────────────────────────────┐
│  [Navigation Header - EMPTY]        │ ← Transparent, covering content
│  (headerShown: true, title: "")     │
├─────────────────────────────────────┤
│                                     │
│  [PROFILE heading was here]         │ ← HIDDEN behind nav header!
│                                     │
│  Content...                         │
│                                     │
└─────────────────────────────────────┘
```

## AFTER (Fixed)

```
┌─────────────────────────────────────┐
│  SafeAreaView (handles notch/status)│
│  ┌───────────────────────────────┐  │
│  │ ← BACK                        │  │ ← Custom back button
│  ├───────────────────────────────┤  │
│  │                               │  │
│  │        PROFILE                │  │ ← NOW VISIBLE!
│  │      (Mode: ...)              │  │    - 26px font
│  │                               │  │    - Background color
│  ├───────────────────────────────┤  │    - z-index: 100
│  │                               │  │
│  │  Content...                   │  │
│  │                               │  │
│  │                               │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

## Key Differences

### Navigation Header
- **Before**: `headerShown: true` with empty title → Created invisible overlay
- **After**: `headerShown: false` → No overlay, no conflict

### Heading Position
- **Before**: Under navigation header → Hidden/overlapped
- **After**: At top of SafeAreaView → Fully visible

### Padding
- **Before**: `paddingTop: Platform.OS === 'android' ? 44 : 0` on SafeAreaView
- **After**: `paddingTop: Platform.OS === 'ios' ? 60 : 50` on container

### Heading Styles
- **Before**: 
  - fontSize: 20
  - No background
  - No z-index
  - letterSpacing: 3
  
- **After**:
  - fontSize: 26 (30% larger)
  - backgroundColor: theme.colors.surface
  - zIndex: 100
  - letterSpacing: 4
  - More padding and margins

## Component Hierarchy

```
ProfileScreen
└── SafeAreaView (styles.safeArea)
    └── View (styles.container)
        ├── TouchableOpacity (Back Button)
        │   └── Text "← BACK"
        │
        ├── View (styles.headingContainer) ← THE HEADING!
        │   ├── Text "PROFILE" (styles.mainHeading)
        │   └── Text "Mode: ..." (debug)
        │
        ├── View (styles.content)
        │   └── [Conditional rendering based on mode]
        │       ├── renderSignedOut()
        │       ├── renderProfileSetup()
        │       └── renderProfileView()
        │
        └── Modal (Username input)
```

## Z-Index Layers

```
Layer 1000: Modal (username input)
Layer 100:  Heading container ← Ensures visibility
Layer 10:   Avatar wheel center hub
Layer 20:   Avatar wheel selector
Layer 1:    Film perforations (if any)
Layer 0:    Background content
```

## Padding Breakdown

```
iOS:
┌─────────────────────┐
│ Status Bar (auto)   │ ← SafeAreaView handles this
├─────────────────────┤
│ paddingTop: 60      │ ← Container padding
│ ┌─────────────────┐ │
│ │ Back Button     │ │
│ │ Heading         │ │
│ │ Content         │ │
│ └─────────────────┘ │
└─────────────────────┘

Android:
┌─────────────────────┐
│ paddingTop: 50      │ ← Container padding (no SafeAreaView auto-padding)
│ ┌─────────────────┐ │
│ │ Back Button     │ │
│ │ Heading         │ │
│ │ Content         │ │
│ └─────────────────┘ │
└─────────────────────┘
```

## Color Scheme

```
Heading Container:
┌────────────────────────────────┐
│ backgroundColor: surface       │ ← Subtle background
│ borderBottomColor: primary+40% │ ← Visible border
│                                │
│  color: primary (#FFB800)      │ ← Bright yellow/amber
│        PROFILE                 │
│                                │
└────────────────────────────────┘
```

## Responsive Behavior

### On Small Screens
- Heading scales with screen width
- Padding adjusts automatically
- Content scrolls if needed

### On Large Screens
- Heading remains centered
- Maximum width constraints apply
- More breathing room

### On Notched Devices (iPhone X+)
- SafeAreaView handles notch automatically
- Heading appears below notch
- No manual adjustment needed

## Debug Indicators

When testing, you'll see:
```
┌─────────────────────────────────┐
│ ← BACK                          │ ← Should be visible
├─────────────────────────────────┤
│                                 │
│         PROFILE                 │ ← Large, yellow/amber
│      Mode: signed_out           │ ← Red debug text
│                                 │
├─────────────────────────────────┤
│ Content...                      │
```

If you see the red "Mode: ..." text, the component is rendering correctly!

## Common Issues Visualized

### Issue: Heading Too High
```
┌─────────────────────┐
│ PROFILE ← Too close │ ← Increase marginTop
│ Content             │
```

### Issue: Heading Too Low
```
┌─────────────────────┐
│                     │
│                     │ ← Too much space
│ PROFILE             │ ← Decrease paddingTop
```

### Issue: Heading Overlapping Content
```
┌─────────────────────┐
│ PROFILE             │
│ Content overlaps    │ ← Increase marginBottom
```

### Issue: Back Button Too Close
```
┌─────────────────────┐
│ ← BACK              │
│ PROFILE             │ ← Too close
```
Fix: Increase marginBottom on backButton

## Success Indicators

✅ You'll know it's working when:
1. You see "← BACK" at the top
2. You see "PROFILE" in large text below it
3. You see red "Mode: ..." text (debug)
4. There's clear spacing between elements
5. No overlap with content below
6. Console shows "ProfileScreen rendering"
