# Firebase Setup Guide — Google Auth & Push Notifications

Single reference for wiring up both Google Sign-In and FCM push notifications from scratch. Both features share the same Firebase project and `google-services.json`, so most console work is done once.

**Mobile stack:** Expo (bare workflow), `@react-native-google-signin/google-signin`, `@react-native-firebase/messaging`
**Backend stack:** Rails, `devise`, `devise-jwt`, `google-id-token`, `rpush`

---

## How Everything Connects

```
[Mobile App]
    │
    ├─ Google Sign-In  ──►  Google Play Services  ──►  Google OAuth
    │       └── sends ID token to backend
    │
    └─ FCM Messaging  ──►  Firebase Cloud Messaging  ──►  Backend via rpush
            └── registers device token with backend on login
```

1. On login, the app sends a Google ID token to the Rails backend.
2. The backend verifies it with `google-id-token` gem, finds or creates the user, and returns a JWT (`devise-jwt`).
3. After any successful login (Google or email), the app requests FCM permission, gets a device token, and registers it via `POST /api/v0/device_tokens`.
4. The backend (rpush) uses the device token to push notifications to the device.

---

## Prerequisites

- Android Studio with an emulator or physical device **that has Google Play Services** (standard emulator image, not AOSP)
- A Firebase account — free tier is fine
- Build with `expo run:android`, not `expo start` — native modules require a dev build
- Rails backend accessible from the device/emulator

---

## Part 1 — Firebase & GCP Console

Do this section once. Both features share everything here.

---

### Step 1 — Get the SHA-1 Fingerprint

Google requires your signing key fingerprint to authorise authentication requests. For local development the debug keystore is used.

```bash
keytool -list -v \
  -keystore android/app/debug.keystore \
  -alias androiddebugkey \
  -storepass android \
  -keypass android
```

Copy the **SHA1** value — it looks like:

```
5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25
```

> For a release build, repeat with your release keystore and register that fingerprint separately in Firebase.

---

### Step 2 — Create a Firebase Project

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add project**, give it a name, follow the prompts (Google Analytics is optional)
3. Once created you land on the project overview page

---

### Step 3 — Register the Android App in Firebase

1. On the project overview page click the **Android icon**
2. Fill in:
   - **Android package name:** `com.rupeerally.app`
   - **App nickname:** anything (e.g. `RupeeRally Android`)
   - **Debug signing certificate SHA-1:** paste the fingerprint from Step 1
3. Click **Register app**
4. **Download `google-services.json`** and place it at `android/app/google-services.json`
5. Click through the remaining Firebase screens — Gradle changes are already in this project

> To add an SHA-1 to an existing app: Firebase Console → Project settings → Your apps → select the Android app → **Add fingerprint**.

#### Fixing the "SHA-1 already in use" Warning

If Firebase shows a warning about the fingerprint already being in use:

1. Open [console.cloud.google.com](https://console.cloud.google.com), select the same GCP project
2. Go to **APIs & Services → Credentials**
3. Under **OAuth 2.0 Client IDs**, delete any Android client that has package `com.rupeerally.app` and the same SHA-1
4. Return to Firebase and re-register — the warning will be gone

> If no duplicate appears, the warning is cosmetic and you can proceed.

---

### Step 4 — Enable Google Sign-In

1. Firebase Console → **Build → Authentication → Get started**
2. Go to the **Sign-in method** tab
3. Click **Google** → toggle **Enable**
4. Set a **Project support email** (required)
5. Click **Save**

---

### Step 5 — Enable Firebase Cloud Messaging

1. Firebase Console → **Build → Cloud Messaging**
2. If prompted, click **Enable**

Then confirm the API is on in GCP:

1. [console.cloud.google.com](https://console.cloud.google.com) → same project
2. **APIs & Services → Enabled APIs**
3. Confirm **Firebase Cloud Messaging API** is listed as Enabled
4. If not, click **+ Enable APIs and Services**, search for it, enable it

---

### Step 6 — Get the Web Client ID (Google Auth)

The Web Client ID is what the mobile app passes to `GoogleSignin.configure()` and what the backend uses to verify ID tokens. It is **not** the Android Client ID.

1. Firebase Console → Authentication → Sign-in method → **Google** → pencil icon
2. Expand **Web SDK configuration**
3. Copy the **Web client ID** — ends in `.apps.googleusercontent.com`

You will set this in Step 8.

---

### Step 7 — Create a Service Account (Backend Push Notifications)

The backend uses a service account to send notifications via the FCM HTTP v1 API.

1. Firebase Console → **Project settings** (gear icon) → **Service accounts** tab
2. Click **Generate new private key** → **Generate key**
3. A `.json` file downloads — keep it secret, never commit it

The file looks like:

```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "...",
  "private_key": "-----BEGIN RSA PRIVATE KEY-----\n...",
  "client_email": "firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token"
}
```

You will use this in Part 3 (Rails backend setup).

---

## Part 2 — Mobile App Configuration

The code is already implemented. These are the verification steps.

---

### Step 8 — Set Environment Variables

Create or update `.env` in the project root:

```env
GOOGLE_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
EXPO_PUBLIC_API_URL=http://10.0.2.2:3000
EXPO_PUBLIC_APP_NAME=My Own Money
```

- `GOOGLE_CLIENT_ID` — Web Client ID from Step 6. **Not** the Android Client ID.
- `EXPO_PUBLIC_API_URL` — `10.0.2.2` is the Android emulator's alias for `localhost`. Use your machine's LAN IP for a physical device.

---

### Step 9 — Verify `app.config.js`

The file must have all three plugins and expose `googleClientId`:

```js
plugins: [
  ...(config.plugins ?? []),
  'expo-secure-store',
  '@react-native-firebase/app',           // required for FCM
  '@react-native-google-signin/google-signin',
],
extra: {
  googleClientId: process.env.GOOGLE_CLIENT_ID,
},
```

> Both `@react-native-firebase/app` and `@react-native-google-signin/google-signin` must be listed — omitting either will break the native build.

---

### Step 10 — Verify `index.js` (Background Message Handler)

`index.js` is the app entry point (`"main": "index.js"` in `package.json`). It registers the Firebase background handler **before any React component mounts** — this is required for push notifications to work when the app is in the background or killed state.

```js
import messaging from '@react-native-firebase/messaging';

messaging().setBackgroundMessageHandler(async remoteMessage => {
  void remoteMessage;
});

require('expo-router/entry');
```

If this file is missing or the `setBackgroundMessageHandler` call is absent, background notifications will silently fail.

---

### Step 11 — Verify Gradle Configuration

Both files are already committed. Confirm they are present before rebuilding.

**`android/build.gradle`** — `google-services` classpath in `buildscript.dependencies`:

```groovy
buildscript {
  dependencies {
    classpath('com.google.gms:google-services:4.4.4')
  }
}
```

**`android/app/build.gradle`** — plugin applied near the top:

```groovy
apply plugin: "com.google.gms.google-services"
```

---

### Step 12 — Place `google-services.json`

The file downloaded in Step 3 must be at:

```
android/app/google-services.json
```

This file is not committed to version control. Every developer and CI environment needs their own copy from the Firebase Console.

---

### Step 13 — Build and Run

```bash
npx expo run:android
```

This compiles the native Android project, picks up `google-services.json`, and installs the app on the emulator or device.

After login the app will:
1. Request notification permission
2. Retrieve the FCM device token
3. Register it with the backend via `POST /api/v0/device_tokens`

---

## Part 3 — Rails Backend Configuration

---

### Google Auth — `google-id-token` + `devise-jwt`

The mobile app sends a Google ID token to the backend. The backend verifies it with the `google-id-token` gem and issues a JWT via `devise-jwt`.

**Gemfile:**

```ruby
gem "devise"
gem "devise-jwt"
gem "google-id-token"
```

**Verification (in your sessions or auth controller):**

```ruby
validator = GoogleIDToken::Validator.new
payload = validator.check(
  params[:id_token],
  ENV['GOOGLE_CLIENT_ID']   # same Web Client ID from Step 6
)
# payload["sub"]   — Google user ID (stable, use as uid)
# payload["email"] — user's email
# payload["name"]  — display name
```

**Environment variable needed on the backend:**

```
GOOGLE_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
```

This must match exactly what the mobile app uses. Using the Android Client ID here will cause `Invalid token` errors.

---

### Push Notifications — `rpush` + FCM HTTP v1

**Gemfile:**

```ruby
gem "rpush"
```

**Install rpush tables:**

```bash
rails generate rpush
rails db:migrate
```

**Create the rpush app record (run once, e.g. in a seed or one-off task):**

```ruby
# FCM HTTP v1 (recommended — uses service account, not legacy server key)
app = Rpush::FcmV1::App.new
app.name = "android"
app.service_json = File.read(Rails.root.join("config", "firebase_service_account.json"))
app.connections = 1
app.save!
```

Place the service account JSON downloaded in Step 7 at `config/firebase_service_account.json` on the backend server. Add it to `.gitignore`.

Alternatively, load it from an environment variable:

```ruby
app.service_json = ENV["GOOGLE_APPLICATION_CREDENTIALS_JSON"]
```

**Sending a notification:**

```ruby
n = Rpush::FcmV1::Notification.new
n.app = Rpush::App.find_by_name("android")
n.registration_ids = [device_token_string]
n.notification = { title: "New Transaction", body: "A new transaction was recorded." }
n.data = { transaction_id: transaction.id.to_s }
n.save!
```

The `transaction_id` key inside `data` is what the mobile app uses to navigate to the Transactions tab when the notification is tapped.

**Environment variables needed on the backend (if not using the JSON file directly):**

| Variable | Source | Purpose |
|---|---|---|
| `GOOGLE_APPLICATION_CREDENTIALS_JSON` | Full contents of service account JSON | Authenticates rpush with FCM |
| `FCM_PROJECT_ID` | `project_id` field in service account JSON | Identifies the Firebase project |

> rpush uses the service account to obtain short-lived OAuth2 tokens automatically. You do not need to manage token refresh manually.

---

## Part 4 — Testing

### Test Google Sign-In

1. Build and run the app (`expo run:android`)
2. Tap **Sign in with Google**
3. Select a Google account from the picker
4. The app should navigate to the home screen

If the account picker does not appear: the emulator is not signed into a Google account. Go to **Settings → Accounts → Add account → Google** on the emulator.

---

### Test Push Notifications via Firebase Console

1. Firebase Console → **Engage → Messaging → New campaign → Firebase Notification messages**
2. Fill in title and text
3. Under **Target**, select `com.rupeerally.app`
4. Click **Send test message**
5. Paste an FCM registration token (you can log it in `src/services/notifications.ts` temporarily) and click `+`
6. Click **Test**

---

### Test Transaction Deep-Link Navigation

To verify the `transaction_id` routing (navigates to the Transactions tab when tapped):

Send a notification with this payload shape:

```json
{
  "data": {
    "transaction_id": "123"
  },
  "notification": {
    "title": "New Transaction",
    "body": "A new transaction was recorded."
  }
}
```

The `transaction_id` must be in `data`, not inside `notification`. Fields in `notification` are display-only and are not accessible to the tap handler.

---

## Troubleshooting

**"Network connection failed" after selecting a Google account**
SHA-1 not registered in Firebase or `google-services.json` is stale. Redo Steps 1–3 and rebuild.

**"Invalid token" from the backend**
`GOOGLE_CLIENT_ID` on the backend is the Android Client ID, not the Web Client ID. Redo Step 6.

**"Missing GOOGLE_CLIENT_ID" crash on app startup**
`.env` file is missing or the variable is not set. Check `.env.example`.

**Google account picker does not appear**
The emulator has no Google account. Settings → Accounts → Add account → Google on the emulator.

**FCM token is null**
The device does not have Google Play Services (AOSP emulator image), or permission was denied. Use a Play Store emulator image. On a physical device check notification permission in Android Settings.

**Token registered but no notification delivered**
Confirm the backend rpush app record exists and uses the correct service account. Check backend logs for rpush/FCM errors. `registration-token-not-registered` means the token expired — re-login will refresh it.

**App does not navigate to Transactions on tap**
Backend is sending `transaction_id` inside `notification` instead of `data`. Move it to the `data` field.

**Build fails after adding `google-services.json`**
The `google-services` Gradle plugin is not applied. Verify Step 11, then run `./gradlew clean` inside the `android/` folder before rebuilding.

**"SHA-1 already in use" warning**
See the note in Step 3.

---

## Key Files Reference

| File | Purpose |
|---|---|
| `android/app/google-services.json` | Firebase Android config — download per environment, not committed |
| `index.js` | App entry point — registers FCM background message handler before React mounts |
| `.env` | `GOOGLE_CLIENT_ID`, `EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_APP_NAME` |
| `app.config.js` | Registers Firebase + Google Sign-In plugins; exposes `googleClientId` |
| `android/build.gradle` | Declares `google-services` classpath |
| `android/app/build.gradle` | Applies `google-services` plugin |
| `src/config/env.ts` | Reads `googleClientId` from Expo Constants |
| `src/app/_layout.tsx` | Calls `GoogleSignin.configure()` on app start; mounts `usePushNotifications()` |
| `src/services/notifications.ts` | `registerFCMToken`, `unregisterFCMToken`, `setupTokenRefreshListener` |
| `src/hooks/usePushNotifications.ts` | Foreground message handler, tap navigation, token refresh listener |
| `src/feature/notifications/api/notifications.api.ts` | `registerDeviceToken` / `unregisterDeviceToken` — `POST/DELETE /api/v0/device_tokens` |
| `src/feature/auth/api/auth.api.ts` | `googleLogin(idToken)` — sends ID token to backend |
| `src/store/auth.store.ts` | Calls `registerFCMToken` on login/signup/session restore; `unregisterFCMToken` on logout |
