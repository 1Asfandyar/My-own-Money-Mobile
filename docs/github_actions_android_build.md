# GitHub Actions Android Build (APK + AAB Artifacts)

Yes, this is possible.

This workflow lets you:

- Select a branch manually.
- Build signed Android AAB and APK in CI.
- Download output files from GitHub Actions Artifacts.
- Keep upload keys secure with GitHub Secrets.

Workflow file:

- `.github/workflows/android-build-artifacts.yml`

## 1. Add repository secrets

Open GitHub repository settings:

- Settings -> Secrets and variables -> Actions -> New repository secret

Create these secrets:

- `ANDROID_UPLOAD_KEYSTORE_BASE64`
- `ANDROID_UPLOAD_KEY_ALIAS`
- `ANDROID_UPLOAD_STORE_PASSWORD`
- `ANDROID_UPLOAD_KEY_PASSWORD`

### How to create `ANDROID_UPLOAD_KEYSTORE_BASE64`

From project root (or where your keystore file exists):

```bash
base64 -w 0 android/app/upload-keystore.p12
```

Copy the full output and store it as secret value.

If your shell does not support `-w 0` (macOS), use:

```bash
base64 android/app/upload-keystore.p12 | tr -d '\n'
```

## 2. Run the workflow

In GitHub:

1. Go to Actions.
2. Open workflow **Android Build Artifacts**.
3. Click **Run workflow**.
4. Set:
   - `branch` (for example `master` or `release/v0.0.1`)
   - `android_version_code` (must be higher than previous uploaded value)
   - `android_version_name` (optional label for internal build)
5. Run.

## 3. Download build outputs

After workflow completes:

1. Open the workflow run.
2. In **Artifacts**, download `android-build-<run>-vc<versionCode>`.
3. You will get:
   - `.aab`
   - `.apk`
   - `mapping.txt` (for Play deobfuscation)

## 4. Upload key management best practices

- Never commit keystore files, passwords, or aliases into git.
- Store keystore only in secure local storage and GitHub Secrets.
- Restrict who can edit repo secrets.
- Rotate upload key if compromise is suspected.
- Keep two encrypted backups of the keystore file outside git.

## 5. Key rotation flow (if needed)

1. Generate new PKCS12 upload keystore.
2. Export upload certificate.
3. Request upload key reset in Google Play Console support.
4. Update all 4 GitHub secrets with new values.
5. Re-run workflow with a higher `android_version_code`.

## 6. Notes

- This project currently ignores `/android` in git, so workflow generates Android native files each run with Expo prebuild.
- Version code must always increase for every Play Console upload.
- `mapping.txt` should be uploaded in Play Console when minification is enabled.
