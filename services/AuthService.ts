/**
 * Auth Service - 认证服务
 * 处理邮箱登录、注册、验证等功能
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { getBackendBaseUrl } from '@/utils/Environment';

const API_BASE = getBackendBaseUrl();

// 存储键
const AUTH_TOKEN_KEY = '@tikboost_auth_token';
const USER_DATA_KEY = '@tikboost_user_data';

// 用户类型
export interface User {
  id: string;
  email: string;
  ageRange?: string; // 'under_13' | '13_17' | '18_24' | '25_34' | '35_44' | '45_54' | '55_plus'
  isMinor?: boolean; // 是否未成年 (13-17)
  subscription?: {
    type: 'free' | 'starter' | 'pro' | 'ultimate';
    expiresAt?: number;
  };
  createdAt?: number;
}

// 认证响应类型
interface AuthResponse {
  success: boolean;
  token?: string;
  user?: User;
  error?: string;
}

interface VerifyResponse {
  success: boolean;
  verified?: boolean;
  expires_in?: number;
  error?: string;
}

/**
 * 保存认证令牌
 */
async function saveAuthToken(token: string): Promise<void> {
  await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
}

/**
 * 获取认证令牌
 */
async function getAuthToken(): Promise<string | null> {
  return AsyncStorage.getItem(AUTH_TOKEN_KEY);
}

/**
 * 保存用户数据
 */
async function saveUserData(user: User): Promise<void> {
  await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
}

/**
 * 获取用户数据
 */
async function getUserData(): Promise<User | null> {
  const data = await AsyncStorage.getItem(USER_DATA_KEY);
  return data ? JSON.parse(data) : null;
}

/**
 * 清除认证数据
 */
async function clearAuthData(): Promise<void> {
  await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, USER_DATA_KEY]);
}

/**
 * 发送验证码到邮箱
 * @param email 邮箱地址
 */
export async function sendVerificationCode(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${API_BASE}/api/v1/auth/send-verification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Send verification error:', error);
    return { success: false, error: 'Failed to send verification code' };
  }
}

/**
 * 验证验证码
 * @param email 邮箱地址
 * @param code 验证码
 */
export async function verifyCode(email: string, code: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${API_BASE}/api/v1/auth/verify-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Verify code error:', error);
    return { success: false, error: 'Failed to verify code' };
  }
}

/**
 * 注册新用户
 * @param email 邮箱地址
 * @param password 密码
 * @param code 验证码
 * @param ageRange 年龄范围: 'under_13' | '13_17' | '18_24' | '25_34' | '35_44' | '45_54' | '55_plus'
 */
export async function register(
  email: string,
  password: string,
  code: string,
  ageRange?: string
): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, code, ageRange }),
    });

    const data = await response.json();
    
    if (data.success && data.token) {
      await saveAuthToken(data.token);
      await saveUserData(data.user);
    }
    
    return data;
  } catch (error) {
    console.error('Register error:', error);
    return { success: false, error: 'Registration failed' };
  }
}

/**
 * 登录
 * @param email 邮箱地址
 * @param password 密码
 */
export async function login(email: string, password: string): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    
    if (data.success && data.token) {
      await saveAuthToken(data.token);
      await saveUserData(data.user);
    }
    
    return data;
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'Login failed' };
  }
}

/**
 * 忘记密码 - 发送重置邮件
 * @param email 邮箱地址
 */
export async function forgotPassword(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${API_BASE}/api/v1/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Forgot password error:', error);
    return { success: false, error: 'Failed to send reset email' };
  }
}

/**
 * 重置密码
 * @param email 邮箱地址
 * @param token 重置令牌
 * @param newPassword 新密码
 */
export async function resetPassword(email: string, token: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${API_BASE}/api/v1/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, token, newPassword }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Reset password error:', error);
    return { success: false, error: 'Failed to reset password' };
  }
}

/**
 * 获取当前用户信息
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const token = await getAuthToken();
    if (!token) return null;

    const response = await fetch(`${API_BASE}/api/v1/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    
    if (data.success && data.user) {
      await saveUserData(data.user);
      return data.user;
    }
    
    return null;
  } catch (error) {
    console.error('Get current user error:', error);
    return getUserData(); // Fallback to cached data
  }
}

/**
 * 检查是否已登录
 */
export async function isAuthenticated(): Promise<boolean> {
  const token = await getAuthToken();
  return !!token;
}

/**
 * 登出
 */
export async function logout(): Promise<void> {
  try {
    const token = await getAuthToken();
    if (token) {
      await fetch(`${API_BASE}/api/v1/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    }
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    await clearAuthData();
  }
}

/**
 * 获取认证令牌（用于 API 请求）
 */
export async function getToken(): Promise<string | null> {
  return getAuthToken();
}

// 导出存储键常量
export { AUTH_TOKEN_KEY, USER_DATA_KEY };
