/**
 * Register Screen - 邮箱注册页面
 * 包含验证码发送、年龄验证和密码设置流程
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Linking,
  Modal,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import {
  sendVerificationCode,
  verifyCode,
  register,
} from '@/services/AuthService';
import { useTranslation } from '@/i18n';

type RegisterStep = 'email' | 'age' | 'code' | 'password';

// Age range options
const AGE_RANGES = [
  { key: 'under_13', label: 'Under 13', minAge: 0 },
  { key: '13_17', label: '13 - 17', minAge: 13 },
  { key: '18_24', label: '18 - 24', minAge: 18 },
  { key: '25_34', label: '25 - 34', minAge: 25 },
  { key: '35_44', label: '35 - 44', minAge: 35 },
  { key: '45_54', label: '45 - 54', minAge: 45 },
  { key: '55_plus', label: '55+', minAge: 55 },
];

export default function RegisterScreen() {
  const router = useSafeRouter();
  const { t } = useTranslation();
  const [step, setStep] = useState<RegisterStep>('email');
  const [email, setEmail] = useState('');
  const [selectedAgeRange, setSelectedAgeRange] = useState<string | null>(null);
  const [showMinorWarning, setShowMinorWarning] = useState(false);
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // 倒计时
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendCode = async () => {
    if (!email.trim() || !email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email');
      return;
    }

    setLoading(true);
    try {
      const result = await sendVerificationCode(email.trim());
      if (result.success) {
        setStep('age');
        setCountdown(60);
      } else {
        Alert.alert('Error', result.error || 'Failed to send code');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleAgeSelect = (ageKey: string) => {
    setSelectedAgeRange(ageKey);
    
    if (ageKey === 'under_13') {
      // Show modal and exit
      setShowMinorWarning(true);
    } else if (ageKey === '13_17') {
      // Show minor warning modal
      setShowMinorWarning(true);
    } else {
      // Proceed to code verification
      setStep('code');
    }
  };

  const handleMinorWarningClose = () => {
    setShowMinorWarning(false);
    if (selectedAgeRange === 'under_13') {
      // Open App Store or external link
      Alert.alert(
        'Unable to Continue',
        'This app is designed for users 13 years and older. Thank you for your understanding.',
        [
          { text: 'OK', onPress: () => router.back() }
        ]
      );
    } else {
      // Minor user confirmed - proceed with limited access
      setStep('code');
    }
  };

  const handleVerifyCode = async () => {
    if (code.length !== 6) {
      Alert.alert('Error', 'Please enter the 6-digit code');
      return;
    }

    setLoading(true);
    try {
      const result = await verifyCode(email.trim(), code);
      if (result.success) {
        setStep('password');
      } else {
        Alert.alert('Error', result.error || 'Invalid code');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const result = await register(email.trim(), password, code, selectedAgeRange!);
      if (result.success) {
        // Check if user is a minor
        const user = result.user;
        if (user?.isMinor) {
          Alert.alert(
            'Welcome!',
            'As a user under 18, some features may have limited access. A parent or guardian may need to review and approve your account.',
            [{ text: 'Continue', onPress: () => router.replace('/upload') }]
          );
        } else {
          Alert.alert('Success', 'Account created successfully');
          router.replace('/upload');
        }
      } else if (result.error === 'UNDER_13_NOT_ALLOWED') {
        Alert.alert(
          'Age Verification Failed',
          'This app is not available for users under 13 years old.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } else {
        Alert.alert('Error', result.error || 'Registration failed');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const renderStepEmail = () => (
    <>
      <Text style={styles.stepTitle}>Create Account</Text>
      <Text style={styles.stepDescription}>
        Enter your email to receive a verification code
      </Text>

      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <Feather name="mail" size={18} color="#888888" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder={t('auth.email')}
            placeholderTextColor="#CCCCCC"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      </View>

      <TouchableOpacity
        style={[styles.primaryButton, loading && styles.buttonDisabled]}
        onPress={handleSendCode}
        disabled={loading}
      >
        {loading ? (
          <Feather name="loader" size={20} color="#FFFFFF" />
        ) : (
          <Text style={styles.primaryButtonText}>{t('auth.sendCode')}</Text>
        )}
      </TouchableOpacity>
    </>
  );

  const renderStepAge = () => (
    <>
      <Text style={styles.stepTitle}>Verify Age</Text>
      <Text style={styles.stepDescription}>
        Please select your age range to continue.{'\n'}This helps us provide appropriate content.
      </Text>

      <View style={styles.ageRangeContainer}>
        {AGE_RANGES.map((range) => (
          <TouchableOpacity
            key={range.key}
            style={[
              styles.ageRangeButton,
              selectedAgeRange === range.key && styles.ageRangeButtonSelected,
            ]}
            onPress={() => handleAgeSelect(range.key)}
          >
            <Text
              style={[
                styles.ageRangeText,
                selectedAgeRange === range.key && styles.ageRangeTextSelected,
              ]}
            >
              {range.label}
            </Text>
            {selectedAgeRange === range.key && (
              <Feather name="check" size={18} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.ageNote}>
        By continuing, you confirm that you are at least 13 years old and agree to our Terms of Service and Privacy Policy.
      </Text>
    </>
  );

  const renderStepCode = () => (
    <>
      <Text style={styles.stepTitle}>Verify Email</Text>
      <Text style={styles.stepDescription}>
        Enter the 6-digit code sent to{'\n'}{email}
      </Text>

      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <Feather name="key" size={18} color="#888888" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="000000"
            placeholderTextColor="#CCCCCC"
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            maxLength={6}
            textAlign="center"
          />
        </View>
      </View>

      <TouchableOpacity
        style={[styles.primaryButton, loading && styles.buttonDisabled]}
        onPress={handleVerifyCode}
        disabled={loading}
      >
        {loading ? (
          <Feather name="loader" size={20} color="#FFFFFF" />
        ) : (
          <Text style={styles.primaryButtonText}>{t('auth.verifyCode')}</Text>
        )}
      </TouchableOpacity>

      <View style={styles.resendContainer}>
        <Text style={styles.resendText}>
          {countdown > 0
            ? `Resend in ${countdown}s`
            : "Didn't receive the code?"}
        </Text>
        {countdown === 0 && (
          <TouchableOpacity onPress={handleSendCode}>
            <Text style={styles.resendButton}>Resend</Text>
          </TouchableOpacity>
        )}
      </View>
    </>
  );

  const renderStepPassword = () => (
    <>
      <Text style={styles.stepTitle}>Set Password</Text>
      <Text style={styles.stepDescription}>
        Create a secure password for your account
      </Text>

      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <Feather name="lock" size={18} color="#888888" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder={t('auth.password')}
            placeholderTextColor="#CCCCCC"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Feather
              name={showPassword ? 'eye-off' : 'eye'}
              size={18}
              color="#888888"
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <Feather name="lock" size={18} color="#888888" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder={t('auth.confirmPassword')}
            placeholderTextColor="#CCCCCC"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
          />
        </View>
      </View>

      <TouchableOpacity
        style={[styles.primaryButton, loading && styles.buttonDisabled]}
        onPress={handleRegister}
        disabled={loading}
      >
        {loading ? (
          <Feather name="loader" size={20} color="#FFFFFF" />
        ) : (
          <Text style={styles.primaryButtonText}>{t('auth.createAccount')}</Text>
        )}
      </TouchableOpacity>
    </>
  );

  return (
    <Screen style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Back Button */}
          {step !== 'email' && (
            <TouchableOpacity style={styles.backButton} onPress={() => {
              if (step === 'age') {
                setStep('email');
                setSelectedAgeRange(null);
              }
              if (step === 'code') setStep('age');
              if (step === 'password') setStep('code');
            }}>
              <Feather name="arrow-left" size={24} color="#111111" />
            </TouchableOpacity>
          )}

          {/* Logo */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Feather name="play" size={32} color="#111111" />
            </View>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {step === 'email' && renderStepEmail()}
            {step === 'age' && renderStepAge()}
            {step === 'code' && renderStepCode()}
            {step === 'password' && renderStepPassword()}

            {/* Login Link */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/auth-login')}>
                <Text style={styles.loginButton}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Minor Warning Modal */}
      <Modal
        visible={showMinorWarning}
        transparent
        animationType="fade"
        onRequestClose={handleMinorWarningClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconContainer}>
              <Feather
                name={selectedAgeRange === 'under_13' ? 'alert-triangle' : 'shield'}
                size={48}
                color={selectedAgeRange === 'under_13' ? '#FF6B6B' : '#FFB84D'}
              />
            </View>
            
            <Text style={styles.modalTitle}>
              {selectedAgeRange === 'under_13'
                ? 'Unable to Continue'
                : 'Parental Guidance Notice'}
            </Text>
            
            <Text style={styles.modalText}>
              {selectedAgeRange === 'under_13'
                ? 'This app is designed for users 13 years and older. We\'re sorry, but we\'re unable to allow access at this time.'
                : 'You have selected an age range that indicates you may be under 18. Some features of this app may have limited access. A parent or guardian should review and approve your account usage.'}
            </Text>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleMinorWarningClose}
            >
              <Text style={styles.modalButtonText}>
                {selectedAgeRange === 'under_13' ? 'I Understand' : 'I Acknowledge'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
  },
  backButton: {
    marginBottom: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#F7F7F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  form: {
    width: '100%',
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  stepDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 32,
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111111',
  },
  primaryButton: {
    backgroundColor: '#111111',
    borderRadius: 12,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    gap: 6,
  },
  resendText: {
    fontSize: 14,
    color: '#666666',
  },
  resendButton: {
    fontSize: 14,
    color: '#111111',
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
  },
  loginText: {
    fontSize: 14,
    color: '#666666',
  },
  loginButton: {
    fontSize: 14,
    color: '#111111',
    fontWeight: '600',
  },
  // Age Range Styles
  ageRangeContainer: {
    marginBottom: 24,
  },
  ageRangeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F7F7F7',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  ageRangeButtonSelected: {
    backgroundColor: '#111111',
    borderColor: '#111111',
  },
  ageRangeText: {
    fontSize: 16,
    color: '#111111',
    fontWeight: '500',
  },
  ageRangeTextSelected: {
    color: '#FFFFFF',
  },
  ageNote: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'center',
    lineHeight: 18,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  modalIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF5E6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  modalButton: {
    backgroundColor: '#111111',
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 14,
    width: '100%',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
