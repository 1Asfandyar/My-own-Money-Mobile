import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';

import { ROUTES } from '@/config/routes';
import { useKeyboardVisible } from '@/hooks/useKeyboardVisible';
import { useLoginForm } from '@/feature/auth/hooks/useLoginForm';

const useLoginScreen = () => {
  const router = useRouter();
  const form = useLoginForm();
  const isKeyboardVisible = useKeyboardVisible();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const openRegister = () => {
    router.replace(ROUTES.AUTH_REGISTER);
  };

  const togglePasswordVisibility = useCallback(() => {
    setIsPasswordVisible((isVisible) => !isVisible);
  }, []);

  return {
    form,
    isPasswordVisible,
    isKeyboardVisible,
    openRegister,
    togglePasswordVisibility,
  };
};

export default useLoginScreen;
