import { useCallback, useEffect, useRef, useState } from 'react';

import {
  acceptFriendship,
  listFriendships,
} from '@/feature/friendships/api/friendships.api';
import type { FriendshipLedger } from '@/feature/friendships/types/friendship.types';
import { useAccountsOverviewStore } from '@/feature/accounts/store/accountsOverview.store';
import { ApiError } from '@/services/api';
import { useAuthStore } from '@/store/auth.store';

const pendingFriendshipParams = {
  filter: 'incoming',
  status: 'pending',
} as const;

const useFriendshipNotifications = () => {
  const token = useAuthStore((state) => state.token);
  const setFriendshipLedgers = useAccountsOverviewStore(
    (state) => state.setFriendshipLedgers,
  );
  const requestIdRef = useRef(0);
  const [acceptingFriendshipId, setAcceptingFriendshipId] = useState<
    number | null
  >(null);
  const [error, setError] = useState('');
  const [incomingRequests, setIncomingRequests] = useState<FriendshipLedger[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const loadIncomingRequests = useCallback(async () => {
    if (!token) {
      setIncomingRequests([]);
      setIsLoading(false);
      return;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setError('');
    setIsLoading(true);

    try {
      const nextRequests = await listFriendships(token, pendingFriendshipParams);

      if (requestIdRef.current !== requestId) {
        return;
      }

      setIncomingRequests(nextRequests);
    } catch (nextError) {
      if (requestIdRef.current !== requestId) {
        return;
      }

      setError(
        nextError instanceof Error
          ? nextError.message
          : 'Could not load notifications.',
      );
    } finally {
      if (requestIdRef.current === requestId) {
        setIsLoading(false);
      }
    }
  }, [token]);

  useEffect(() => {
    void loadIncomingRequests();
  }, [loadIncomingRequests]);

  const openNotifications = useCallback(() => {
    setIsVisible(true);
    void loadIncomingRequests();
  }, [loadIncomingRequests]);

  const closeNotifications = useCallback(() => {
    setIsVisible(false);
  }, []);

  const acceptRequest = useCallback(
    async (friendshipId: number) => {
      if (!token) {
        setError('Please sign in again to accept this request.');
        return;
      }

      setAcceptingFriendshipId(friendshipId);
      setError('');

      try {
        const acceptedFriendship = await acceptFriendship(token, friendshipId);

        setIncomingRequests((currentRequests) =>
          currentRequests.filter((request) => request.id !== friendshipId),
        );

        const currentLedgers =
          useAccountsOverviewStore.getState().friendshipLedgers;
        const hasExistingLedger = currentLedgers.some(
          (ledger) => ledger.id === acceptedFriendship.id,
        );

        setFriendshipLedgers(
          hasExistingLedger
            ? currentLedgers.map((ledger) =>
                ledger.id === acceptedFriendship.id
                  ? acceptedFriendship
                  : ledger,
              )
            : [...currentLedgers, acceptedFriendship],
        );
      } catch (nextError) {
        setError(
          nextError instanceof ApiError
            ? nextError.fieldErrors.base || nextError.message
            : 'Could not accept this request.',
        );
      } finally {
        setAcceptingFriendshipId(null);
      }
    },
    [setFriendshipLedgers, token],
  );

  return {
    acceptingFriendshipId,
    error,
    incomingRequests,
    isLoading,
    isVisible,
    notificationCount: incomingRequests.length,
    onAcceptRequest: acceptRequest,
    onClose: closeNotifications,
    onOpen: openNotifications,
    onRetry: loadIncomingRequests,
  };
};

export default useFriendshipNotifications;
