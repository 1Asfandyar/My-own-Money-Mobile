# My Own Money Manager

A personal finance mobile app built with React Native and Expo.

## Prerequisites

- [Node.js](https://nodejs.org/) (LTS)
- [Yarn](https://yarnpkg.com/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [Android Studio](https://developer.android.com/studio) for Android development
- [Xcode](https://developer.apple.com/xcode/) for iOS development (macOS only)

## Setup

1. Clone the repository

   ```bash
   git clone <repo-url>
   cd my-own-money-manager
   ```

2. Install dependencies

   ```bash
   yarn
   ```

3. Configure environment variables

   ```bash
   cp .env.example .env
   ```

   Then open `.env` and fill in the required values.

## Development

Start the development server:

```bash
yarn start
```

Run on a specific platform:

```bash
yarn android   # Android emulator
yarn ios       # iOS simulator
```

## Production Builds

Android production builds are done locally with Gradle:

```bash
yarn build:android:release:aab
```

### Android

```bash
yarn build:android:release:aab
```

Detailed Android release and upload key setup: [docs/android_prod_release_setup.md](docs/android_prod_release_setup.md)

## Other Commands

| Command | Description |
|---|---|
| `yarn typecheck` | Run TypeScript type checking |
| `yarn lint` | Run ESLint |
| `yarn format` | Format code with Prettier |
| `yarn test` | Run tests |
