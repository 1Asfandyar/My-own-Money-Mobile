import type { AuthUser } from '@/types/auth.types';
import { useAuthStore } from '@/store/auth.store';

/**
 * Hook to access the logged-in user data from the auth store.
 * Provides user information, authentication status, and loading state.
 *
 * @returns Object containing:
 *   - user: The logged-in user data (null if not authenticated)
 *   - isAuthenticated: Boolean indicating if user is logged in
 *   - isLoading: Boolean indicating if auth state is still being restored
 *
 * @example
 * const { user, isAuthenticated, isLoading } = useLoggedInUser();
 * if (!isAuthenticated) return <LoginScreen />;
 * return <Text>{user?.full_name}</Text>;
 */
export const useLoggedInUser = () => {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isRestoring = useAuthStore((state) => state.isRestoring);

  return {
    user: user as AuthUser | null,
    isAuthenticated,
    isLoading: isRestoring,
  };
};

export default useLoggedInUser;
