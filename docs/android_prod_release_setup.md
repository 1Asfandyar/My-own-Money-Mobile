# Android Production Release Setup (Local Machine + Google Play Upload Key)

This guide uses a fully local Android release flow (no EAS cloud build).

## Goal

- Build Android production AAB on your own machine.
- Use Google Play App Signing with an upload key.
- Keep secure backups so you do not lose release access.

## 1. Prerequisites

Install and verify:

- Node.js (LTS)
- Yarn
- Android Studio (SDK + Build Tools + Platform Tools)
- Java 17

Check tools:

```bash
java -version
adb --version
```

## 2. Prepare production environment values

Your app reads values from `.env` through `app.config.js`.

1. Create or update `.env` with production values.
2. Ensure all required vars exist (for example `EXPO_PUBLIC_API_URL`, `ROLLBAR_ACCESS_TOKEN`, and other `EXPO_PUBLIC_*` keys used by the app).

## 3. Generate Android native project

If `android/` does not exist yet:

```bash
yarn prepare:android:release
```

This runs Expo prebuild locally and generates Android native files.

## 4. Create your Google Play upload keystore (PKCS12)

Run this locally (choose strong passwords):

```bash
keytool -genkeypair -v \
	-storetype PKCS12 \
	-keystore upload-keystore.p12 \
  -alias upload \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

Or run the project helper:

```bash
yarn keystore:android:generate:pkcs12
```

Use this target path:

```text
android/app/upload-keystore.p12
```

If you already created a JKS file and want to migrate instead of recreating:

```bash
keytool -importkeystore \
	-srckeystore android/app/upload-keystore.jks \
	-destkeystore android/app/upload-keystore.p12 \
	-deststoretype PKCS12
```

After you verify release build works with PKCS12, remove the old JKS file:

```bash
rm -f android/app/upload-keystore.jks
```

## 5. Configure Gradle signing (local only)

Add to `android/gradle.properties`:

```properties
MYAPP_UPLOAD_STORE_FILE=upload-keystore.p12
MYAPP_UPLOAD_KEY_ALIAS=upload
MYAPP_UPLOAD_STORE_PASSWORD=your_store_password
MYAPP_UPLOAD_KEY_PASSWORD=your_key_password
```

Update `android/app/build.gradle` in the `android { signingConfigs { ... } }` and `buildTypes { release { ... } }` sections:

```gradle
signingConfigs {
	debug {
		storeFile file('debug.keystore')
		storePassword 'android'
		keyAlias 'androiddebugkey'
		keyPassword 'android'
	}
	release {
		if (project.hasProperty('MYAPP_UPLOAD_STORE_FILE')) {
			storeFile file(MYAPP_UPLOAD_STORE_FILE)
			storePassword MYAPP_UPLOAD_STORE_PASSWORD
			keyAlias MYAPP_UPLOAD_KEY_ALIAS
			keyPassword MYAPP_UPLOAD_KEY_PASSWORD
		}
	}
}

buildTypes {
	debug {
		signingConfig signingConfigs.debug
	}
	release {
		signingConfig signingConfigs.release
		minifyEnabled false
		shrinkResources false
		proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
	}
}
```

## 6. Build release AAB locally

Before each new Play Console upload, increment Android version code.

This project reads `ANDROID_VERSION_CODE` from environment during prebuild.

Example for next upload:

```bash
ANDROID_VERSION_CODE=2 yarn build:android:release:aab:vc
```

For later uploads, keep increasing (`3`, `4`, `5`, ...).

Use the project script:

```bash
yarn build:android:release:aab
```

Output file:

```text
android/app/build/outputs/bundle/release/app-release.aab
```

Optional release APK:

```bash
yarn build:android:release:apk
```

### Current size optimizations enabled in this project

- R8 code shrinking and obfuscation is enabled for release.
- Unused Android resources are removed in release.
- PNG crunching is enabled in release.
- Release architectures are limited to ARM (`armeabi-v7a`, `arm64-v8a`).

These settings reduce the final AAB compared with default debug-like release settings.

### Extra options if you still need a smaller AAB

1. Prefer SVG/vector drawables over large PNG assets where possible.
2. Convert heavy PNG/JPG image assets to WebP where quality allows.
3. Remove unused fonts and large static files from app assets.
4. Keep Hermes enabled (already enabled) to reduce JS runtime size vs JSC.
5. Review dependencies and remove unused native libraries.

## 7. Upload to Google Play Internal Testing

1. Open Play Console.
2. Go to Testing > Internal testing.
3. Create release and upload `app-release.aab`.
4. Add testers and publish.

## 8. Enable Google Play App Signing (recommended)

In Play Console, keep App Signing enabled.

- Google stores and protects the app signing key.
- You only use your upload key for releases.
- If upload key is lost, Google can reset upload key after ownership verification.

## 9. Backup strategy so you do not lose keys

Back up these 4 items in at least 2 secure places:

- `upload-keystore.p12`
- Keystore password
- Key alias
- Key password

Recommended storage:

- Encrypted password manager/secrets vault
- Encrypted offline backup

Also save a short internal note that says exactly where backups are stored.

## 10. If upload key is lost

1. Generate a new upload key with `keytool`.
2. Export certificate:

```bash
keytool -export -rfc -keystore android/app/upload-keystore.p12 -alias upload -file upload_certificate.pem
```

3. Request upload key reset in Play Console support.
4. Register the new upload certificate when Google approves.

Your published app remains safe because app signing key stays with Google Play App Signing.

## Troubleshooting

### Failed to read key upload from store ... keystore password was incorrect

This means one of these values does not match your keystore:

- `MYAPP_UPLOAD_STORE_PASSWORD`
- `MYAPP_UPLOAD_KEY_PASSWORD`
- `MYAPP_UPLOAD_KEY_ALIAS`

For PKCS12 created with the commands in this guide, alias is usually `upload` and key password is typically the same as store password.

Verify alias and keystore access:

```bash
keytool -list -v -storetype PKCS12 -keystore android/app/upload-keystore.p12
```

Then update `android/gradle.properties` (or set env vars) with the exact values.

If password is unknown, create a new upload keystore and request upload key reset in Google Play Console.
