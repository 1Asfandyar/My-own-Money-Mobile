import ThemedButton from '@/theme/components/ThemedButton'
import ThemedDivider from '@/theme/components/ThemedDivider'
import ThemedInput from '@/theme/components/ThemedInput'
import ThemedPhoneInput from '@/theme/components/ThemedPhoneInput'
import ThemedText from '@/theme/components/ThemedText'
import { CountryOption } from '@/types/country.types'
import useRegisterScreen from '@/feature/auth/hooks/useRegisterScreen'
import { Image } from 'expo-image'
import { View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const RegisterScreen = () => {
  const {
    form,
    isKeyboardVisible,
    openLogin,
    passwordVisibility,
    togglePasswordVisibility,
  } = useRegisterScreen()
  const {
    values,
    fieldErrors,
    formError,
    isLoading,
    submit,
    updateField,
    validateField,
    setCountryDialCode,
  } = form

  return (
    <SafeAreaView className={`flex-1 items-center pb-28 px-6 bg-white ${!isKeyboardVisible ? 'justify-between' : ''}`}>
      {!isKeyboardVisible && <Image
        source={require('../../../assets/logo/myownmoney_logo.png')}
        style={{ width: '40%', height: '40%' }}
        contentFit="contain"
      />}
      <View className='w-full'>
        <ThemedInput
          leftIcon='person'
          placeholder='Full Name'
          containerClassName='w-full'
          value={values.full_name}
          onChangeText={(value) => updateField('full_name', value)}
          onBlur={() => validateField('full_name')}
          autoCapitalize='words'
          autoComplete='name'
          textContentType='name'
          returnKeyType='next'
          error={fieldErrors.full_name}
        />
        <ThemedInput
          leftIcon='mail'
          placeholder='Email Address'
          containerClassName='w-full'
          value={values.email}
          onChangeText={(value) => updateField('email', value)}
          onBlur={() => validateField('email')}
          autoCapitalize='none'
          keyboardType='email-address'
          autoComplete='email'
          textContentType='emailAddress'
          returnKeyType='next'
          error={fieldErrors.email}
        />
        <ThemedPhoneInput
          containerClassName='w-full'
          value={values.mobile_number}
          onChangeText={(value) => updateField('mobile_number', value)}
          onBlur={() => validateField('mobile_number')}
          onCountryChange={(country: CountryOption) => setCountryDialCode(country.dialCode)}
          returnKeyType='next'
          error={fieldErrors.mobile_number}
        />
        <ThemedInput
          leftIcon='lock-closed-sharp'
          placeholder='Password'
          containerClassName='w-full'
          value={values.password}
          onChangeText={(value) => updateField('password', value)}
          onBlur={() => validateField('password')}
          secureTextEntry={!passwordVisibility.password}
          rightIcon={passwordVisibility.password ? 'eye-off-outline' : 'eye-outline'}
          onRightIconPress={() => togglePasswordVisibility('password')}
          autoComplete='new-password'
          textContentType='newPassword'
          returnKeyType='next'
          error={fieldErrors.password}
        />
        <ThemedInput
          leftIcon='lock-closed-sharp'
          placeholder='Confirm Password'
          containerClassName='w-full'
          value={values.password_confirmation}
          onChangeText={(value) => updateField('password_confirmation', value)}
          onBlur={() => validateField('password_confirmation')}
          secureTextEntry={!passwordVisibility.password_confirmation}
          rightIcon={passwordVisibility.password_confirmation ? 'eye-off-outline' : 'eye-outline'}
          onRightIconPress={() => togglePasswordVisibility('password_confirmation')}
          autoComplete='new-password'
          textContentType='newPassword'
          returnKeyType='done'
          error={fieldErrors.password_confirmation}
        />
      </View>
      {formError ? (
        <ThemedText className='w-full text-center text-sm text-red-500'>
          {formError}
        </ThemedText>
      ) : null}
      <ThemedButton
        title='Register'
        containerClassName='w-full'
        onPress={submit}
        loading={isLoading}
      />
      <ThemedDivider label='or continue with' />
      <ThemedButton
        title='Register with Google'
        variant='outline'
        leftIcon='logo-google'
        textClassName='text-gray-700'
        containerClassName='w-full'
        disabled
      />
      <View className="mt-4 flex-row justify-center items-center">
        <ThemedText className="text-l text-gray-500">
          Already have an account?{' '}
        </ThemedText>
        <ThemedButton
          title="Login"
          variant="ghost"
          weight="medium"
          onPress={openLogin}
          containerClassName="self-start py-1"
          textClassName="text-l text-primary"
        />
      </View>
    </SafeAreaView>
  )
}

export default RegisterScreen
