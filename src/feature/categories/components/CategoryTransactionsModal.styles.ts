import { StyleSheet } from 'react-native';

export const categoryTransactionsModalStyles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(17, 24, 39, 0.42)',
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '82%',
  },
  transactionList: {
    paddingBottom: 8,
  },
  transactionListContainer: {
    flexGrow: 0,
  },
});
