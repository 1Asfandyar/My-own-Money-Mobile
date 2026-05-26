import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';

import { ERROR_MESSAGES } from '@/config/constants';
import { ROUTES } from '@/config/routes';
import { useLoginForm } from '@/feature/auth/hooks/useLoginForm';
import { useKeyboardVisible } from '@/hooks/useKeyboardVisible';
import { useAuthStore } from '@/store/auth.store';
import { GoogleSignin, isErrorWithCode, statusCodes } from '@react-native-google-signin/google-signin';

const useLoginScreen = () => {
  const router = useRouter();
  const form = useLoginForm();
  const isKeyboardVisible = useKeyboardVisible();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [googleError, setGoogleError] = useState('');

  const googleLogin = useAuthStore((state) => state.googleLogin);
  const isGoogleSigningIn = useAuthStore((state) => state.status === 'googleSignIn');

  const openRegister = () => {
    router.replace(ROUTES.AUTH_REGISTER);
  };

  const togglePasswordVisibility = useCallback(() => {
    setIsPasswordVisible((isVisible) => !isVisible);
  }, []);

  const handleGoogleSignIn = useCallback(async () => {
    setGoogleError('');

    try {
      await GoogleSignin.hasPlayServices();
      const result = await GoogleSignin.signIn();

      if (result.type !== 'success') return;

      const idToken = result.data.idToken;
      if (!idToken) throw new Error('No ID token returned from Google.');

      await googleLogin(idToken);
      router.replace(ROUTES.ONBOARDING);
    } catch (error: unknown) {
      if (isErrorWithCode(error)) {
        console.error('Google Sign-In error:', error);
        switch (error.code) {
          case statusCodes.SIGN_IN_CANCELLED:
          case statusCodes.IN_PROGRESS:
            return;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            setGoogleError('Google Play Services is not available on this device.');
            return;
          default:
            setGoogleError(`Google sign-in failed (${error.code}). Please try again.`);
            return;
        }
      }

      if (error instanceof Error) {
        setGoogleError(error.message);
        return;
      }

      setGoogleError(ERROR_MESSAGES.NETWORK_ERROR);
    }
  }, [googleLogin, router]);

  return {
    form,
    isPasswordVisible,
    isKeyboardVisible,
    googleError,
    isGoogleSigningIn,
    openRegister,
    togglePasswordVisibility,
    handleGoogleSignIn,
  };
};

export default useLoginScreen;
