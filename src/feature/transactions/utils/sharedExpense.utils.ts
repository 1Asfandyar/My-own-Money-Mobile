export const getSharedExpenseUserIds = (
  paidByUserId: number,
  selectedFriendIds: number[],
) =>
  Array.from(
    new Set([
      paidByUserId,
      ...selectedFriendIds.filter((userId) => userId !== paidByUserId),
    ]),
  );
