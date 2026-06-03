/**
 * Forgot Password Screen - 忘记密码页面
 * 通过邮箱验证重置密码
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
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { forgotPassword, resetPassword } from '@/services/AuthService';
import { useTranslation } from '@/i18n';

type ResetStep = 'email' | 'code' | 'newPassword';

export default function ForgotPasswordScreen() {
  const router = useSafeRouter();
  const { t } = useTranslation();
  const [step, setStep] = useState<ResetStep>('email');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
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

  const handleSendResetEmail = async () => {
    if (!email.trim() || !email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email');
      return;
    }

    setLoading(true);
    try {
      const result = await forgotPassword(email.trim());
      if (result.success) {
        setStep('code');
        setCountdown(60);
        Alert.alert('Success', 'Password reset link sent to your email');
      } else {
        Alert.alert('Error', result.error || 'Failed to send reset email');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = () => {
    if (code.length < 6) {
      Alert.alert('Error', 'Please enter a valid code');
      return;
    }
    setToken(code);
    setStep('newPassword');
  };

  const handleResetPassword = async () => {
    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const result = await resetPassword(email.trim(), token, newPassword);
      if (result.success) {
        Alert.alert('Success', 'Password reset successfully');
        router.replace('/auth-login');
      } else {
        Alert.alert('Error', result.error || 'Failed to reset password');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const renderStepEmail = () => (
    <>
      <Text style={styles.stepTitle}>Reset Password</Text>
      <Text style={styles.stepDescription}>
        Enter your email and we will send you a link to reset your password
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
        onPress={handleSendResetEmail}
        disabled={loading}
      >
        {loading ? (
          <Feather name="loader" size={20} color="#FFFFFF" />
        ) : (
          <Text style={styles.primaryButtonText}>{t('auth.sendResetLink')}</Text>
        )}
      </TouchableOpacity>
    </>
  );

  const renderStepCode = () => (
    <>
      <Text style={styles.stepTitle}>Enter Code</Text>
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
          <Text style={styles.primaryButtonText}>Verify Code</Text>
        )}
      </TouchableOpacity>

      <View style={styles.resendContainer}>
        <Text style={styles.resendText}>
          {countdown > 0
            ? `Resend in ${countdown}s`
            : "Didn't receive the code?"}
        </Text>
        {countdown === 0 && (
          <TouchableOpacity onPress={handleSendResetEmail}>
            <Text style={styles.resendButton}>Resend</Text>
          </TouchableOpacity>
        )}
      </View>
    </>
  );

  const renderStepNewPassword = () => (
    <>
      <Text style={styles.stepTitle}>New Password</Text>
      <Text style={styles.stepDescription}>
        Create a new secure password for your account
      </Text>

      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <Feather name="lock" size={18} color="#888888" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder={t('auth.newPassword')}
            placeholderTextColor="#CCCCCC"
            value={newPassword}
            onChangeText={setNewPassword}
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
        onPress={handleResetPassword}
        disabled={loading}
      >
        {loading ? (
          <Feather name="loader" size={20} color="#FFFFFF" />
        ) : (
          <Text style={styles.primaryButtonText}>{t('auth.resetPassword')}</Text>
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
              if (step === 'code') setStep('email');
              if (step === 'newPassword') setStep('code');
            }}>
              <Feather name="arrow-left" size={24} color="#111111" />
            </TouchableOpacity>
          )}

          {/* Logo */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Feather name="lock" size={32} color="#111111" />
            </View>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {step === 'email' && renderStepEmail()}
            {step === 'code' && renderStepCode()}
            {step === 'newPassword' && renderStepNewPassword()}

            {/* Back to Login */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Remember your password? </Text>
              <TouchableOpacity>
                <Text style={styles.loginButton}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    color: '#888888',
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
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111111',
    paddingVertical: 16,
  },
  primaryButton: {
    backgroundColor: '#111111',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  resendText: {
    fontSize: 14,
    color: '#888888',
  },
  resendButton: {
    fontSize: 14,
    color: '#111111',
    fontWeight: '600',
    marginLeft: 4,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
  },
  loginText: {
    fontSize: 14,
    color: '#888888',
  },
  loginButton: {
    fontSize: 14,
    color: '#111111',
    fontWeight: '600',
  },
});
