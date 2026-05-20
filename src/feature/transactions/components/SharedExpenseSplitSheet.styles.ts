import { StyleSheet } from 'react-native';

export const sharedExpenseSplitSheetStyles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    height: '90%',
  },
  participantsList: {
    flex: 1,
  },
});
