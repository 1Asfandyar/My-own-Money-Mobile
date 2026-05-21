import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';

import { ROUTES } from '@/config/routes';
import { useKeyboardVisible } from '@/hooks/useKeyboardVisible';
import { useRegisterForm } from '@/feature/auth/hooks/useRegisterForm';

const useRegisterScreen = () => {
  const router = useRouter();
  const form = useRegisterForm();
  const isKeyboardVisible = useKeyboardVisible();
  const [passwordVisibility, setPasswordVisibility] = useState({
    password: false,
    password_confirmation: false,
  });

  const openLogin = () => {
    router.replace(ROUTES.AUTH_LOGIN);
  };

  const togglePasswordVisibility = useCallback(
    (field: keyof typeof passwordVisibility) => {
      setPasswordVisibility((visibility) => ({
        ...visibility,
        [field]: !visibility[field],
      }));
    },
    [],
  );

  return {
    form,
    isKeyboardVisible,
    openLogin,
    passwordVisibility,
    togglePasswordVisibility,
  };
};

export default useRegisterScreen;
