# Bugfix Requirements Document

## Introduction

The HomeScreen button layout was accidentally changed from the original simple vertical stack design to glassmorphic buttons during UI experiments. This bugfix restores the original App Store release button layout with proper styling, correct button text ("WI-FI MODE" instead of "ONLINE MODE"), and removes the incorrectly added "PREMIUM" button.

The original design featured 4 vertically stacked buttons with clean, minimal styling:
- Two primary buttons with solid yellow (#FFB800) backgrounds
- Two secondary buttons with transparent backgrounds and yellow borders
- Simple spring animations on press
- Specific typography using CabinetGrotesk-Black font

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN the HomeScreen is rendered THEN the system displays GlassmorphicButton components with crystal glass effects, gradients, and premium shadows instead of simple styled buttons

1.2 WHEN the HomeScreen is rendered THEN the system displays button text "ONLINE MODE" instead of "WI-FI MODE"

1.3 WHEN the HomeScreen is rendered THEN the system displays a "PREMIUM" button that was not part of the original design

1.4 WHEN the HomeScreen is rendered THEN the system uses glassmorphic styling (height 48px, complex gradients, shine effects) instead of the original simple button styling (height 52px, solid colors, pill shape)

1.5 WHEN the HomeScreen is rendered THEN the system uses Panchang-Bold font with 13px size and 1.5 letter-spacing instead of CabinetGrotesk-Black font with 14px size and 2 letter-spacing

### Expected Behavior (Correct)

2.1 WHEN the HomeScreen is rendered THEN the system SHALL display SimpleMenuButton components with clean, minimal styling without glass effects or complex gradients

2.2 WHEN the HomeScreen is rendered THEN the system SHALL display button text "WI-FI MODE" instead of "ONLINE MODE"

2.3 WHEN the HomeScreen is rendered THEN the system SHALL display exactly 4 buttons in vertical stack: "PASS & PLAY", "WI-FI MODE", "THEMES", and "HOW TO PLAY" without any "PREMIUM" button

2.4 WHEN the HomeScreen is rendered THEN the system SHALL use the original button styling:
   - Height: 52px
   - Border radius: 26px (pill shape)
   - Primary buttons: solid #FFB800 background with dark text (#0a0a0a)
   - Secondary buttons: transparent background with 2px #FFB800 border and yellow text
   - Gap between buttons: 12px

2.5 WHEN the HomeScreen is rendered THEN the system SHALL use CabinetGrotesk-Black font with size 14px and letter-spacing 2 for button text

2.6 WHEN a button is pressed THEN the system SHALL animate with spring effect scaling to 0.95

### Unchanged Behavior (Regression Prevention)

3.1 WHEN the HomeScreen is rendered THEN the system SHALL CONTINUE TO display the settings button in the top left corner with gear icon

3.2 WHEN the HomeScreen is rendered THEN the system SHALL CONTINUE TO display the profile button in the top right corner with user avatar

3.3 WHEN the HomeScreen is rendered THEN the system SHALL CONTINUE TO display the film perforations on left and right sides

3.4 WHEN the HomeScreen is rendered THEN the system SHALL CONTINUE TO display the "IMPOSTOR GAME" title with cinematic styling

3.5 WHEN the HomeScreen is rendered THEN the system SHALL CONTINUE TO display the animated character (sweat_boy.png) with breathing and floating animations

3.6 WHEN the HomeScreen is rendered THEN the system SHALL CONTINUE TO display the film frame header line at the top

3.7 WHEN the HomeScreen is rendered THEN the system SHALL CONTINUE TO use the theme colors from ThemeContext

3.8 WHEN the HomeScreen is rendered THEN the system SHALL CONTINUE TO load and display user profile data from AsyncStorage

3.9 WHEN button navigation occurs THEN the system SHALL CONTINUE TO navigate to the correct screens:
   - "PASS & PLAY" → Setup screen
   - "WI-FI MODE" → WifiModeSelector screen
   - "THEMES" → ThemeSelector screen
   - "HOW TO PLAY" → HowToPlay screen

3.10 WHEN buttons are pressed THEN the system SHALL CONTINUE TO trigger haptic feedback
