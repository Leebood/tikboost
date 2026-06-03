# TikBoost EAS Build Guide

TikBoost uses Expo/EAS cloud builds for store releases. The native `ios/` and `android/` folders should stay out of the release commit so EAS can generate native projects from `app.config.ts`.

## 1. Local Node

This workspace includes a portable Node/npm runtime:

```sh
export PATH=/Users/leo/Documents/Codex/2026-06-03/github/tikboost/.tools/node-v22.22.3-darwin-x64/bin:$PATH
```

Verify:

```sh
node -v
npm -v
```

## 2. Required Environment

Create a local `.env` file before testing or building:

```sh
EXPO_PUBLIC_BACKEND_BASE_URL=https://your-production-api.example.com
```

Do not commit `.env`.

## 3. Preflight

```sh
npm install
npm run lint
npx expo-doctor
```

## 4. Login And Configure EAS

```sh
npm run eas:login
npm run eas:configure
```

If EAS creates a project id, keep the generated `extra.eas.projectId` in `app.config.ts`.

## 5. Store Builds

iOS App Store build:

```sh
npm run build:ios
```

Android Google Play AAB:

```sh
npm run build:android
```

## 6. Submit

Submit after App Store Connect and Google Play Console products, privacy forms, screenshots, and reviewer notes are ready:

```sh
npm run submit:ios
npm run submit:android
```

## Current Local Check

- `npm run lint`: passed
- `npx expo-doctor`: 18/18 passed
- EAS route: cloud build, no committed native folders
