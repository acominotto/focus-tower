# Focus Tower Mobile

Expo dev-client app for iOS and Android. Blocks distracting **apps** using platform-native enforcement:

- **iOS** — Apple Screen Time APIs (Family Controls, Managed Settings, Device Activity)
- **Android** — Accessibility foreground detection + shield activity + AlarmManager relock

Shared logic (allowances, quotes, i18n) comes from [`@focus-tower/core`](../../packages/core). Native bridges live in [`@focus-tower/native-screen-time`](../../packages/native-screen-time).

## Requirements

- Bun (monorepo root)
- Xcode 16+ (iOS) with **Family Controls** entitlement from Apple
- Android Studio (Android)
- Expo dev client (not Expo Go — native modules are required)

## Setup

From the repository root:

```bash
bun install
```

## Development

```bash
cd apps/mobile
bun run start          # Metro + dev client
bun run ios            # Build & run iOS (after prebuild)
bun run android        # Build & run Android (after prebuild)
```

First native run:

```bash
cd apps/mobile
bunx expo prebuild
```

### iOS entitlements (one-time)

1. Request the **Family Controls** capability from Apple.
2. Enable **App Groups** (`group.com.focustower.shared`) in your Apple Developer account.
3. Add extension targets for Device Activity Monitor and Shield Configuration (source templates are in `packages/native-screen-time/ios/Extensions/`).

### Android accessibility

Users must enable the Focus Tower accessibility service in **Settings → Accessibility** so the app can detect when a blocked app is opened.

## Privacy

- No accounts, no analytics, no backend
- All data stored on device (AsyncStorage + App Group / SharedPreferences)
- Optional [Patreon support link](https://www.patreon.com/) in settings — opens externally, no login in-app

See [privacy policy](../../docs/privacy.html) for details.
