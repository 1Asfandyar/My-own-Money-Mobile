import { ScrollView, View } from 'react-native';

import ProfileAccordionSection from '@/feature/profile/components/ProfileAccordionSection';
import ProfileInfoList from '@/feature/profile/components/ProfileInfoList';
import ProfileInformationSection from '@/feature/profile/components/ProfileInformationSection';
import ProfilePasswordSection from '@/feature/profile/components/ProfilePasswordSection';
import ProfileSessionSection from '@/feature/profile/components/ProfileSessionSection';
import ProfileSummaryCard from '@/feature/profile/components/ProfileSummaryCard';
import type { ProfileSettingsViewModel } from '@/feature/profile/types/profile.types';

type ProfileViewProps = {
  profile: ProfileSettingsViewModel;
};

const ProfileView = ({ profile }: ProfileViewProps) => (
  <View className="flex-1 bg-white">
    <ScrollView
      className="flex-1"
      contentContainerStyle={{
        paddingBottom: 144,
        paddingHorizontal: 20,
        paddingTop: 24,
      }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <ProfileSummaryCard user={profile.user} />

      <ProfileInfoList
        items={[
          {
            iconName: 'calendar-outline',
            label: 'Member since',
            value: profile.memberSinceLabel,
          },
          {
            iconName: 'sync-outline',
            label: 'Last updated',
            value: profile.lastUpdatedLabel,
          },
        ]}
      />

      <ProfileAccordionSection
        isExpanded={profile.expandedSections.profile}
        onToggle={() => profile.onToggleSection('profile')}
        subtitle="Name, phone, email, and default currency."
        title="Profile information"
      >
        <ProfileInformationSection
          currencies={profile.currencies}
          fieldErrors={profile.fieldErrors}
          isCurrencyPickerVisible={profile.isCurrencyPickerVisible}
          isLoadingCurrencies={profile.isLoadingCurrencies}
          isProfileDirty={profile.isProfileDirty}
          isSavingProfile={profile.isSavingProfile}
          onChangeProfileField={profile.onChangeProfileField}
          onCloseCurrencyPicker={profile.onCloseCurrencyPicker}
          onOpenCurrencyPicker={profile.onOpenCurrencyPicker}
          onSaveProfile={profile.onSaveProfile}
          onSelectCurrency={profile.onSelectCurrency}
          profileError={profile.profileError}
          profileSuccess={profile.profileSuccess}
          profileValues={profile.profileValues}
          selectedCurrency={profile.selectedCurrency}
        />
      </ProfileAccordionSection>

      <ProfileAccordionSection
        isExpanded={profile.expandedSections.password}
        onToggle={() => profile.onToggleSection('password')}
        subtitle="Change the password used to sign in."
        title="Password"
      >
        <ProfilePasswordSection
          isChangingPassword={profile.isChangingPassword}
          isPasswordDraftStarted={profile.isPasswordDraftStarted}
          onChangePassword={profile.onChangePassword}
          onChangePasswordField={profile.onChangePasswordField}
          onTogglePasswordVisibility={profile.onTogglePasswordVisibility}
          passwordError={profile.passwordError}
          passwordFieldErrors={profile.passwordFieldErrors}
          passwordSuccess={profile.passwordSuccess}
          passwordValues={profile.passwordValues}
          passwordVisibility={profile.passwordVisibility}
        />
      </ProfileAccordionSection>

      <ProfileSessionSection onSignOut={profile.onSignOut} />
    </ScrollView>
  </View>
);

export default ProfileView;
