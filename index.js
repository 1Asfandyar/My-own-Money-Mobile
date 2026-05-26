import messaging from '@react-native-firebase/messaging';

// Must be registered here, before any React component mounts, so Firebase
// can wake the JS runtime and invoke this handler for background/quit-state messages.
messaging().setBackgroundMessageHandler(async remoteMessage => {
  // Firebase automatically displays the notification from the payload.
  // Process data-only messages here if needed.
  void remoteMessage;
});

require('expo-router/entry');
