import { Redirect, Slot, usePathname } from 'expo-router';
import { View } from 'react-native';

import { ROUTES } from '@/config/routes';
import MainHeader from '@/feature/main/components/MainHeader';
import { useAuthStore } from '@/store/auth.store';

export default function MainLayout() {
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasCompletedOnboarding = useAuthStore(
    (state) => state.hasCompletedOnboarding,
  );

  if (!isAuthenticated) {
    return <Redirect href={ROUTES.AUTH_LOGIN} />;
  }

  if (!hasCompletedOnboarding) {
    return <Redirect href={ROUTES.ONBOARDING} />;
  }

  const shouldHideHeader =
    pathname.endsWith('/add-personal-record') ||
    pathname.endsWith('/add-shared-record') ||
    pathname.endsWith('/record-payment') ||
    pathname.includes('/friendship/') ||
    pathname.includes('/shared-transaction/');

  return (
    <View className="flex-1 bg-white">
      {shouldHideHeader ? null : <MainHeader />}
      <View className="flex-1">
        <Slot />
      </View>
    </View>
  );
}
