import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, View } from 'react-native';

import CurrencyPreferenceModal from '@/feature/profile/components/CurrencyPreferenceModal';
import ProfileStatusMessage from '@/feature/profile/components/ProfileStatusMessage';
import type { ProfileInformationSectionProps } from '@/feature/profile/types/profile.types';
import ThemedButton from '@/theme/components/ThemedButton';
import ThemedInput from '@/theme/components/ThemedInput';
import ThemedText from '@/theme/components/ThemedText';
import { themeColors } from '@/theme/utilities';

const ProfileInformationSection = ({
  currencies,
  fieldErrors,
  isCurrencyPickerVisible,
  isLoadingCurrencies,
  isProfileDirty,
  isSavingProfile,
  onChangeProfileField,
  onCloseCurrencyPicker,
  onOpenCurrencyPicker,
  onSaveProfile,
  onSelectCurrency,
  profileError,
  profileSuccess,
  profileValues,
  selectedCurrency,
}: ProfileInformationSectionProps) => (
  <>
    <ProfileStatusMessage message={profileSuccess} tone="success" />
    <ProfileStatusMessage message={profileError} tone="error" />

    <ThemedInput
      autoCapitalize="words"
      error={fieldErrors.full_name}
      label="Full name"
      leftIcon="person-outline"
      onChangeText={(value) => onChangeProfileField('full_name', value)}
      value={profileValues.full_name}
    />

    <ThemedInput
      autoCapitalize="none"
      autoComplete="email"
      error={fieldErrors.email}
      keyboardType="email-address"
      label="Email"
      leftIcon="mail-outline"
      onChangeText={(value) => onChangeProfileField('email', value)}
      textContentType="emailAddress"
      value={profileValues.email}
    />

    <ThemedInput
      autoComplete="tel"
      error={fieldErrors.mobile_number}
      keyboardType="phone-pad"
      label="Mobile number"
      leftIcon="call-outline"
      onChangeText={(value) => onChangeProfileField('mobile_number', value)}
      textContentType="telephoneNumber"
      value={profileValues.mobile_number}
    />

    <TouchableOpacity
      activeOpacity={0.82}
      accessibilityRole="button"
      onPress={onOpenCurrencyPicker}
      className={`mt-1 flex-row items-center rounded-xl border px-4 py-4 ${
        fieldErrors.currency_id ? 'border-red-400' : 'border-gray-200'
      }`}
    >
      <View className="h-10 w-10 items-center justify-center rounded-full bg-gray-100">
        <Ionicons name="cash-outline" size={19} color={themeColors.primary} />
      </View>
      <View className="ml-3 min-w-0 flex-1">
        <ThemedText className="text-xs text-gray-500">
          Default currency
        </ThemedText>
        <ThemedText
          className="mt-0.5 text-base text-gray-900"
          numberOfLines={1}
          weight="semiBold"
        >
          {selectedCurrency.code} - {selectedCurrency.name}
        </ThemedText>
      </View>
      <Ionicons name="chevron-forward" size={20} color={themeColors.gray500} />
    </TouchableOpacity>

    {fieldErrors.currency_id ? (
      <ThemedText className="mt-1 text-xs text-red-500">
        {fieldErrors.currency_id}
      </ThemedText>
    ) : null}

    <ThemedButton
      title="Save profile"
      leftIcon="save-outline"
      loading={isSavingProfile}
      disabled={!isProfileDirty}
      onPress={onSaveProfile}
      containerClassName="mt-5"
    />

    <CurrencyPreferenceModal
      currencies={currencies}
      isLoading={isLoadingCurrencies}
      isVisible={isCurrencyPickerVisible}
      selectedCurrencyId={profileValues.currency_id}
      onClose={onCloseCurrencyPicker}
      onSelect={onSelectCurrency}
    />
  </>
);

export default ProfileInformationSection;
