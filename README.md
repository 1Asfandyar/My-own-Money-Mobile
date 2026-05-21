# My Own Money

A personal finance mobile app built with React Native and Expo.

## Prerequisites

- [Node.js](https://nodejs.org/) (LTS)
- [Yarn](https://yarnpkg.com/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [EAS CLI](https://docs.expo.dev/eas/) for production builds: `npm install -g eas-cli`
- [Android Studio](https://developer.android.com/studio) for Android development
- [Xcode](https://developer.apple.com/xcode/) for iOS development (macOS only)

## Setup

1. Clone the repository

   ```bash
   git clone <repo-url>
   cd my-own-money
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

Production builds use [EAS Build](https://docs.expo.dev/build/introduction/). Make sure you are logged in:

```bash
eas login
```

### Android

```bash
eas build --platform android --profile production
```

### iOS

```bash
eas build --platform ios --profile production
```

### Both platforms

```bash
eas build --platform all --profile production
```

## Other Commands

| Command | Description |
|---|---|
| `yarn typecheck` | Run TypeScript type checking |
| `yarn lint` | Run ESLint |
| `yarn format` | Format code with Prettier |
| `yarn test` | Run tests |
