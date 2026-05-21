import { Image } from 'expo-image';
import { View } from 'react-native';

import ThemedText from '@/theme/components/ThemedText';

import {
  onboardingLayout,
  onboardingStyles,
} from '../../styles/onboarding.styles';

const WelcomeStep = () => {
  return (
    <View className={onboardingStyles.welcomeContainer}>
      <Image
        source={require('../../../../assets/illustrations/onboarding-1.png')}
        contentFit="contain"
        style={[onboardingLayout.welcomeIllustration, { width: '100%' }]}
      />

      <View className={onboardingStyles.welcomeCopy}>
        <ThemedText className={onboardingStyles.centeredTitle} weight="bold">
          Welcome to MyOwnMoney
        </ThemedText>
        <ThemedText className={onboardingStyles.centeredDescription}>
          Money management made simple.
        </ThemedText>
      </View>
    </View>
  );
};

export default WelcomeStep;
