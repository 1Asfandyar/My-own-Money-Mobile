import ProfileStatusMessage from '@/feature/profile/components/ProfileStatusMessage';
import type { ProfilePasswordSectionProps } from '@/feature/profile/types/profile.types';
import ThemedButton from '@/theme/components/ThemedButton';
import ThemedInput from '@/theme/components/ThemedInput';

const ProfilePasswordSection = ({
  isChangingPassword,
  isPasswordDraftStarted,
  onChangePassword,
  onChangePasswordField,
  onTogglePasswordVisibility,
  passwordError,
  passwordFieldErrors,
  passwordSuccess,
  passwordValues,
  passwordVisibility,
}: ProfilePasswordSectionProps) => (
  <>
    <ProfileStatusMessage message={passwordSuccess} tone="success" />
    <ProfileStatusMessage message={passwordError} tone="error" />

    <ThemedInput
      autoCapitalize="none"
      autoComplete="password"
      error={passwordFieldErrors.current_password}
      label="Current password"
      leftIcon="lock-closed-outline"
      onChangeText={(value) =>
        onChangePasswordField('current_password', value)
      }
      onRightIconPress={() => onTogglePasswordVisibility('current_password')}
      rightIcon={
        passwordVisibility.current_password ? 'eye-off-outline' : 'eye-outline'
      }
      secureTextEntry={!passwordVisibility.current_password}
      textContentType="password"
      value={passwordValues.current_password}
    />

    <ThemedInput
      autoCapitalize="none"
      autoComplete="new-password"
      error={passwordFieldErrors.password}
      label="New password"
      leftIcon="key-outline"
      onChangeText={(value) => onChangePasswordField('password', value)}
      onRightIconPress={() => onTogglePasswordVisibility('password')}
      rightIcon={passwordVisibility.password ? 'eye-off-outline' : 'eye-outline'}
      secureTextEntry={!passwordVisibility.password}
      textContentType="newPassword"
      value={passwordValues.password}
    />

    <ThemedInput
      autoCapitalize="none"
      autoComplete="new-password"
      error={passwordFieldErrors.password_confirmation}
      label="Confirm new password"
      leftIcon="checkmark-done-outline"
      onChangeText={(value) =>
        onChangePasswordField('password_confirmation', value)
      }
      onRightIconPress={() =>
        onTogglePasswordVisibility('password_confirmation')
      }
      rightIcon={
        passwordVisibility.password_confirmation
          ? 'eye-off-outline'
          : 'eye-outline'
      }
      secureTextEntry={!passwordVisibility.password_confirmation}
      textContentType="newPassword"
      value={passwordValues.password_confirmation}
    />

    <ThemedButton
      title="Change password"
      leftIcon="shield-outline"
      loading={isChangingPassword}
      disabled={!isPasswordDraftStarted}
      onPress={onChangePassword}
      containerClassName="mt-3"
    />
  </>
);

export default ProfilePasswordSection;
