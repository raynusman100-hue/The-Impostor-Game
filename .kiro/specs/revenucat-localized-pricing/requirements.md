# Requirements Document

## Introduction

This feature implements production-ready localized pricing display in the Premium screen using RevenueCat SDK. The system will fetch real subscription prices from Apple App Store and Google Play Store APIs through RevenueCat, displaying them in the user's local currency (e.g., ₹50 in India, $1.99 in US, €1.99 in EU). The implementation prioritizes robust error handling, graceful degradation, and user experience over "happy path" functionality.

## Glossary

- **RevenueCat_SDK**: The react-native-purchases library that interfaces with Apple StoreKit and Google Play Billing APIs
- **Offering**: A collection of subscription packages configured in RevenueCat dashboard
- **Package**: A specific subscription product (weekly, monthly, or yearly) with pricing information
- **Price_String**: The localized, formatted price string provided by the store (e.g., "₹50", "$1.99", "€1,99")
- **Product_Identifier**: The unique identifier for a subscription product ($rc_weekly, $rc_monthly, $rc_annual)
- **Premium_Screen**: The React Native component (src/screens/PremiumScreen.js) that displays subscription options
- **Purchase_Manager**: The utility class (src/utils/PurchaseManager.js) that manages RevenueCat operations
- **Fallback_Price**: Hardcoded price displayed when RevenueCat fetch fails or is loading
- **Loading_State**: UI state displayed while fetching packages from RevenueCat
- **Store_API**: Apple StoreKit API (iOS) or Google Play Billing API (Android)
- **Package_State**: The React state object containing fetched subscription packages

## Requirements

### Requirement 1: Fetch Subscription Packages from RevenueCat

**User Story:** As a user, I want to see subscription prices in my local currency, so that I understand the actual cost in my region.

#### Acceptance Criteria

1. WHEN the Premium_Screen mounts, THE Premium_Screen SHALL call Purchases.getOfferings() to fetch available subscription packages
2. WHEN Purchases.getOfferings() returns successfully, THE Premium_Screen SHALL extract packages with identifiers "$rc_weekly", "$rc_monthly", and "$rc_annual"
3. WHEN a package is found, THE Premium_Screen SHALL store the package object in Package_State
4. WHEN Purchases.getOfferings() returns offerings.current as null, THE Premium_Screen SHALL log a warning and use Fallback_Price values
5. WHEN Purchases.getOfferings() returns offerings.current.availablePackages as empty array, THE Premium_Screen SHALL log a warning and use Fallback_Price values

### Requirement 2: Display Localized Prices

**User Story:** As a user, I want to see prices with the correct currency symbol and formatting, so that I can make an informed purchase decision.

#### Acceptance Criteria

1. WHEN a package is available in Package_State, THE Premium_Screen SHALL display package.product.priceString in the pricing card
2. THE Premium_Screen SHALL NOT perform manual currency conversion or formatting
3. THE Premium_Screen SHALL NOT hardcode currency symbols when displaying Price_String
4. FOR the yearly subscription, WHEN the package is available, THE Premium_Screen SHALL calculate the per-week equivalent price by dividing package.product.price by 52
5. FOR the yearly subscription, THE Premium_Screen SHALL display both the per-week equivalent and the full yearly price using Price_String format

### Requirement 3: Handle Loading States

**User Story:** As a user, I want to see a loading indicator while prices are being fetched, so that I know the app is working.

#### Acceptance Criteria

1. WHEN the Premium_Screen mounts, THE Premium_Screen SHALL set a loading state to true
2. WHILE loading state is true, THE Premium_Screen SHALL display Fallback_Price values with a loading indicator or shimmer effect
3. WHEN Purchases.getOfferings() completes (success or failure), THE Premium_Screen SHALL set loading state to false
4. WHILE loading state is true, THE Premium_Screen SHALL NOT disable purchase buttons
5. WHEN a user clicks a purchase button during loading, THE Premium_Screen SHALL wait for package fetch to complete before initiating purchase

### Requirement 4: Implement Error Handling with Retry Logic

**User Story:** As a user, I want the app to retry fetching prices if the initial attempt fails, so that temporary network issues don't prevent me from seeing accurate pricing.

#### Acceptance Criteria

1. WHEN Purchases.getOfferings() throws an error, THE Premium_Screen SHALL log the error with error code and message
2. IF the first fetch attempt fails, THEN THE Premium_Screen SHALL retry after 2 seconds
3. IF the retry attempt fails, THEN THE Premium_Screen SHALL retry once more after 5 seconds
4. WHEN all retry attempts fail, THE Premium_Screen SHALL display Fallback_Price values and log a final error
5. WHEN any fetch attempt succeeds, THE Premium_Screen SHALL cancel pending retry attempts
6. WHEN a network error occurs (error.code includes "network" or "connection"), THE Premium_Screen SHALL display a user-friendly message indicating network issues

### Requirement 5: Implement Fallback Pricing Mechanism

**User Story:** As a user, I want to see approximate prices even when the app cannot fetch real prices, so that I can still understand the subscription cost.

#### Acceptance Criteria

1. THE Premium_Screen SHALL define Fallback_Price values: weekly "$1.99", monthly "$4.99", yearly "$19.99"
2. WHEN Package_State is null or undefined for a subscription tier, THE Premium_Screen SHALL display the corresponding Fallback_Price
3. WHEN displaying Fallback_Price, THE Premium_Screen SHALL show a small disclaimer text "Approximate price - final price shown at checkout"
4. WHEN displaying Fallback_Price, THE Premium_Screen SHALL use a slightly muted text color to indicate uncertainty
5. WHEN Package_State becomes available after displaying Fallback_Price, THE Premium_Screen SHALL smoothly transition to displaying the real Price_String

### Requirement 6: Handle RevenueCat SDK Initialization State

**User Story:** As a developer, I want to know if RevenueCat SDK failed to initialize, so that I can diagnose pricing issues.

#### Acceptance Criteria

1. WHEN Purchases.getOfferings() is called, THE Premium_Screen SHALL check if Purchase_Manager.isConfigured is true
2. IF Purchase_Manager.isConfigured is false, THEN THE Premium_Screen SHALL log a warning "RevenueCat SDK not initialized"
3. IF Purchase_Manager.isConfigured is false, THEN THE Premium_Screen SHALL display Fallback_Price values immediately without attempting fetch
4. WHEN Purchase_Manager.isConfigured becomes true after initial check, THE Premium_Screen SHALL automatically retry fetching packages
5. THE Premium_Screen SHALL display a debug indicator (in development mode only) showing SDK initialization status

### Requirement 7: Support Regional Pricing Variations

**User Story:** As a user in a specific region, I want to see prices set for my country, so that I pay the appropriate regional price.

#### Acceptance Criteria

1. THE Premium_Screen SHALL display package.product.priceString without modification
2. THE Premium_Screen SHALL NOT detect or display the user's country or region
3. WHEN Store_API returns different prices for different regions, THE Premium_Screen SHALL display the price appropriate for the user's App Store or Play Store account region
4. THE Premium_Screen SHALL support all currency formats provided by Store_API (including right-to-left currencies)
5. THE Premium_Screen SHALL handle price strings with varying decimal separators (e.g., "1.99" vs "1,99")

### Requirement 8: Handle Slow Network Conditions

**User Story:** As a user on a slow network, I want to see fallback prices quickly while real prices load in the background, so that I don't wait indefinitely.

#### Acceptance Criteria

1. WHEN Purchases.getOfferings() takes longer than 3 seconds, THE Premium_Screen SHALL display Fallback_Price values
2. WHILE Purchases.getOfferings() is still pending, THE Premium_Screen SHALL continue showing a subtle loading indicator
3. WHEN Purchases.getOfferings() eventually completes, THE Premium_Screen SHALL update to display real Price_String values
4. THE Premium_Screen SHALL set a maximum timeout of 15 seconds for Purchases.getOfferings()
5. IF the 15-second timeout is reached, THEN THE Premium_Screen SHALL cancel the fetch and use Fallback_Price values permanently for that session

### Requirement 9: Handle Products Not Synced in Store

**User Story:** As a developer testing the app, I want clear feedback when products aren't configured in App Store Connect or Play Console, so that I can fix the configuration.

#### Acceptance Criteria

1. WHEN offerings.current.availablePackages does not include a Product_Identifier, THE Premium_Screen SHALL log "Product not found: {Product_Identifier}"
2. WHEN no packages are found for any Product_Identifier, THE Premium_Screen SHALL log "No products configured in RevenueCat or Store"
3. IF running in development mode AND no packages are found, THEN THE Premium_Screen SHALL display a warning banner "Products not synced - check App Store Connect/Play Console"
4. WHEN a subset of products is missing (e.g., only weekly available), THE Premium_Screen SHALL display available products with real prices and missing products with Fallback_Price
5. THE Premium_Screen SHALL NOT crash or show blank pricing cards when products are missing

### Requirement 10: Calculate Yearly Per-Week Equivalent

**User Story:** As a user considering the yearly plan, I want to see the per-week cost, so that I can compare it with the weekly plan.

#### Acceptance Criteria

1. WHEN the yearly package is available, THE Premium_Screen SHALL calculate per-week price as package.product.price divided by 52
2. THE Premium_Screen SHALL format the per-week price to 2 decimal places
3. THE Premium_Screen SHALL display the per-week price with the same currency symbol as Price_String
4. THE Premium_Screen SHALL display both "per week" equivalent and "billed as {yearly price}/year" text
5. WHEN the yearly package is not available, THE Premium_Screen SHALL calculate per-week equivalent from Fallback_Price ($19.99 / 52 = $0.38)

### Requirement 11: Maintain Current UI/UX Design

**User Story:** As a user, I want the pricing display to look consistent with the current app design, so that the experience feels polished.

#### Acceptance Criteria

1. THE Premium_Screen SHALL maintain the existing PricingCard component structure
2. THE Premium_Screen SHALL maintain the existing layout with yearly card on top and weekly/monthly cards in a row below
3. THE Premium_Screen SHALL maintain the "BEST VALUE" badge on the yearly card
4. THE Premium_Screen SHALL maintain the existing typography, colors, and spacing from the current design
5. WHEN transitioning from Fallback_Price to real Price_String, THE Premium_Screen SHALL NOT cause layout shifts or jumps

### Requirement 12: Handle Purchase Flow with Fetched Packages

**User Story:** As a user, I want to purchase a subscription using the displayed price, so that I get charged the correct amount.

#### Acceptance Criteria

1. WHEN a user clicks a purchase button, THE Premium_Screen SHALL pass the corresponding package object to Purchase_Manager.purchaseRemoveAds()
2. IF Package_State is null for the selected tier, THEN THE Premium_Screen SHALL wait for package fetch to complete before initiating purchase
3. IF package fetch fails and Package_State remains null, THEN THE Premium_Screen SHALL display an error "Unable to load subscription details. Please check your connection and try again."
4. WHEN Purchase_Manager.purchaseRemoveAds() is called with a package, THE Purchase_Manager SHALL use the package's Product_Identifier to initiate the purchase
5. THE Premium_Screen SHALL NOT allow purchase initiation if all packages failed to load after all retry attempts

### Requirement 13: Log Diagnostic Information

**User Story:** As a developer, I want detailed logs when pricing fetch fails, so that I can diagnose issues in production.

#### Acceptance Criteria

1. WHEN Purchases.getOfferings() is called, THE Premium_Screen SHALL log "Fetching subscription packages from RevenueCat"
2. WHEN Purchases.getOfferings() succeeds, THE Premium_Screen SHALL log "Packages fetched successfully: {count} packages"
3. WHEN Purchases.getOfferings() fails, THE Premium_Screen SHALL log error code, error message, and SDK initialization status
4. WHEN using Fallback_Price, THE Premium_Screen SHALL log "Using fallback prices for {tier}"
5. WHEN a package is missing, THE Premium_Screen SHALL log "Package not found: {Product_Identifier}"

### Requirement 14: Handle Offline Mode

**User Story:** As a user without internet connection, I want to see approximate prices, so that I can still browse subscription options.

#### Acceptance Criteria

1. WHEN the device is offline, THE Purchases.getOfferings() call SHALL fail with a network error
2. WHEN a network error is detected, THE Premium_Screen SHALL immediately display Fallback_Price values without retrying
3. WHEN displaying Fallback_Price due to offline mode, THE Premium_Screen SHALL show a message "Connect to internet to see current prices"
4. WHEN the device comes back online, THE Premium_Screen SHALL NOT automatically retry fetching packages
5. WHEN a user attempts to purchase while offline, THE Premium_Screen SHALL display "Internet connection required to complete purchase"

### Requirement 15: Preserve Existing Premium Status Check

**User Story:** As a user who already has premium, I want to see my active subscription status, so that I know my subscription is working.

#### Acceptance Criteria

1. THE Premium_Screen SHALL maintain the existing premium status check on mount
2. WHEN hasPremium is true, THE Premium_Screen SHALL display the "Active Premium" screen without fetching packages
3. WHEN hasPremium is false, THE Premium_Screen SHALL fetch packages and display the paywall
4. THE Premium_Screen SHALL NOT modify the existing PurchaseManager.checkProStatus() logic
5. THE Premium_Screen SHALL NOT modify the existing restore purchases functionality

