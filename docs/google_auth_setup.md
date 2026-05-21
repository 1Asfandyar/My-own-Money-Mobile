# Google Sign-In Setup Guide (React Native / Expo)

This guide covers everything needed to set up Google Sign-In for this app from scratch — Firebase Console, Android configuration, and environment variables. The code implementation is already in place; this is the checklist to make it work in a new environment or after cloning.

---

## Prerequisites

- Node.js and Yarn installed
- Android Studio with an emulator or a physical device
- A Firebase account (free tier is fine)
- The app built with `expo run:android` (not Expo Go — native modules require a dev build)

---

## Step 1 — Get the SHA-1 Fingerprint

Google requires your app's signing key fingerprint to authorise authentication requests. For local development, the debug keystore is used.

Run this from the project root:

```bash
keytool -list -v \
  -keystore android/app/debug.keystore \
  -alias androiddebugkey \
  -storepass android \
  -keypass android
```

Copy the **SHA1** value from the output. It looks like:

```
5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25
```

You will need this in Step 3.

> For a release build, repeat this step with your release keystore and register that fingerprint separately in Firebase.

---

## Step 2 — Create a Firebase Project

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add project**
3. Enter a project name and follow the prompts (Google Analytics is optional)
4. Once created, you land on the project overview page

---

## Step 3 — Register the Android App in Firebase

1. On the project overview page, click the **Android icon** to add an Android app
2. Fill in the form:
   - **Android package name**: `com.myownmoney.app`
   - **App nickname**: anything (e.g. `MoM`)
   - **Debug signing certificate SHA-1**: paste the fingerprint from Step 1
3. Click **Register app**
4. On the next screen, click **Download google-services.json**
5. Place the downloaded file at:
   ```
   android/app/google-services.json
   ```
6. Click through the remaining Firebase setup screens (the Gradle changes are already done in this project — skip those steps)

> If you need to add the SHA-1 to an existing Firebase app later: Firebase Console → Project settings → Your apps → select the Android app → Add fingerprint.

---

## Step 4 — Enable Google Sign-In in Firebase Authentication

1. In the Firebase Console left sidebar, go to **Build → Authentication**
2. Click **Get started** if this is the first time
3. Go to the **Sign-in method** tab
4. Click **Google** in the provider list
5. Toggle **Enable**
6. Set a **Project support email** (required)
7. Click **Save**

---

## Step 5 — Get the Web Client ID

The Web Client ID is what the app passes to `GoogleSignin.configure()` and what the backend uses to verify ID tokens. It is different from the Android Client ID.

1. Still in Firebase Console → Authentication → Sign-in method → Google
2. Click the **pencil (edit) icon** next to Google
3. Expand **Web SDK configuration**
4. Copy the **Web client ID** — it ends in `.apps.googleusercontent.com`

---

## Step 6 — Configure Environment Variables

Open `.env` in the project root and set:

```env
GOOGLE_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
```

Use the Web Client ID from Step 5. Do not use the Android Client ID here.

> The Android Client ID (visible in Firebase or Google Cloud Console) is used internally by Google Play Services and the `google-services.json`. It does not go in the app's code or environment variables.

---

## Step 7 — Verify the Gradle Configuration

These changes are already committed in the project. Verify they are present before rebuilding.

**`android/build.gradle`** — the `google-services` classpath must be in `buildscript.dependencies`:

```groovy
buildscript {
  dependencies {
    classpath('com.google.gms:google-services:4.4.4')
    // ... other classpaths
  }
}
```

**`android/app/build.gradle`** — the plugin must be applied near the top:

```groovy
apply plugin: "com.google.gms.google-services"
```

If either is missing, add them manually and rebuild.

---

## Step 8 — Verify the Expo Plugin Configuration

**`app.config.js`** — the plugin must be in the plugins array:

```js
plugins: [
  ...(config.plugins ?? []),
  'expo-secure-store',
  '@react-native-google-signin/google-signin',
],
```

And the extra config must expose the client ID:

```js
extra: {
  googleClientId: process.env.GOOGLE_CLIENT_ID,
},
```

---

## Step 9 — Build and Run

```bash
npx expo run:android
```

This compiles the native Android project, picks up `google-services.json`, and installs the app on the emulator or device.

> Do not use `expo start` with Expo Go — `@react-native-google-signin/google-signin` is a native module and requires a dev build.

---

## Troubleshooting

### "Network connection failed" after selecting a Google account
The SHA-1 fingerprint is not registered in Firebase, or `google-services.json` is missing / out of date. Re-do Steps 1–3 and rebuild.

### "Invalid token" error from the backend
The `GOOGLE_CLIENT_ID` in `.env` is the Android client ID, not the Web client ID. Re-do Step 5 and make sure the Web client ID is used.

### "Missing GOOGLE_CLIENT_ID" crash on startup
The `.env` file is missing or the variable is not set. Check `.env.example` for the expected variable name.

### Google account picker does not appear
The emulator is not signed into a Google account. In the emulator, go to **Settings → Accounts → Add account → Google** and sign in.

### Build fails after adding `google-services.json`
The `google-services` Gradle plugin is not applied. Verify Step 7 and run `./gradlew clean` inside the `android/` folder before rebuilding.

---

## Key Files Reference

| File | Purpose |
|---|---|
| `android/app/google-services.json` | Firebase Android config — not committed, must be downloaded per environment |
| `.env` | `GOOGLE_CLIENT_ID` — Web client ID from Firebase Auth |
| `android/build.gradle` | Root Gradle — declares `google-services` classpath |
| `android/app/build.gradle` | App Gradle — applies `google-services` plugin |
| `app.config.js` | Expo config — registers the RNGS plugin and exposes `googleClientId` |
| `src/config/env.ts` | Reads `googleClientId` from Expo Constants and exports as `ENV.GOOGLE_CLIENT_ID` |
| `src/app/_layout.tsx` | Calls `GoogleSignin.configure({ webClientId: ENV.GOOGLE_CLIENT_ID })` on app start |
| `src/feature/auth/api/auth.api.ts` | `googleLogin(idToken)` — sends the ID token to the backend |
| `src/store/auth.store.ts` | `googleLogin` action — calls the API and saves the session |
