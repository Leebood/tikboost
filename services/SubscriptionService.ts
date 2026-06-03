/**
 * Subscription Service
 * Freemium 订阅服务 - 支持策略生成和趋势分析两种功能
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// 存储键
const STORAGE_KEYS = {
  USER_EMAIL: '@tikboost_user_email',
  USER_TOKEN: '@tikboost_user_token',
  SUBSCRIPTION_TYPE: '@tikboost_subscription_type',
  HAS_USER: '@tikboost_has_user',
  USER_AGREED_TO_TERMS: '@tikboost_user_agreed',
  PURCHASED_SUBSCRIPTION: '@tikboost_purchased_subscription',
  TRENDS_USAGE_COUNT: '@tikboost_trends_usage_count',
  TRENDS_USAGE_RESET_DATE: '@tikboost_trends_usage_reset_date',
  STRATEGY_USAGE_COUNT: '@tikboost_strategy_usage_count',
  STRATEGY_USAGE_RESET_DATE: '@tikboost_strategy_usage_reset_date',
  DEEP_ANALYSIS_USAGE_COUNT: '@tikboost_deep_analysis_usage_count',
  DEEP_ANALYSIS_USAGE_RESET_DATE: '@tikboost_deep_analysis_usage_reset_date',
};

// 订阅产品 ID (Apple IAP)
export const SUBSCRIPTION_PRODUCT_IDS = {
  STARTER: Platform.OS === 'ios' ? 'com.libo.tikboost.starter' : 'com.libo.tikboost.starter.android',
  PRO: Platform.OS === 'ios' ? 'com.libo.tikboost.pro' : 'com.libo.tikboost.pro.android',
  ULTIMATE: Platform.OS === 'ios' ? 'com.libo.tikboost.ultimate' : 'com.libo.tikboost.ultimate.android',
};

// 订阅类型
export type SubscriptionType = 'free' | 'starter' | 'pro' | 'ultimate' | 'none';

// 功能类型
export type FeatureType = 'strategy' | 'trends' | 'deepAnalysis';

// 订阅信息
export interface SubscriptionInfo {
  type: SubscriptionType;
  isActive: boolean;
  expiresAt?: string;
}

// 订阅限制配置
export const SUBSCRIPTION_LIMITS = {
  FREE: { strategy: 3, trends: 3, deepAnalysis: 3 },
  STARTER: { strategy: 10, trends: 10, deepAnalysis: 10 },
  MONTHLY: { strategy: 30, trends: 20, deepAnalysis: 20 },
  PRO: { strategy: 50, trends: 30, deepAnalysis: 30 },
  ULTIMATE: { strategy: Infinity, trends: Infinity, deepAnalysis: Infinity },
} as const;

// 订阅服务类
class SubscriptionService {
  // 获取订阅类型
  async getSubscriptionType(): Promise<SubscriptionType> {
    try {
      const type = await AsyncStorage.getItem(STORAGE_KEYS.SUBSCRIPTION_TYPE);
      return (type as SubscriptionType) || 'free';
    } catch {
      return 'free';
    }
  }

  // 获取使用次数限制
  getUsageLimit(type: SubscriptionType): { strategy: number; trends: number; deepAnalysis: number } {
    return SUBSCRIPTION_LIMITS[type as keyof typeof SUBSCRIPTION_LIMITS] || SUBSCRIPTION_LIMITS.FREE;
  }

  // 获取存储键
  private getFeatureKey(feature: FeatureType): { count: string; resetDate: string } {
    switch (feature) {
      case 'strategy':
        return { count: STORAGE_KEYS.STRATEGY_USAGE_COUNT, resetDate: STORAGE_KEYS.STRATEGY_USAGE_RESET_DATE };
      case 'trends':
        return { count: STORAGE_KEYS.TRENDS_USAGE_COUNT, resetDate: STORAGE_KEYS.TRENDS_USAGE_RESET_DATE };
      case 'deepAnalysis':
        return { count: STORAGE_KEYS.DEEP_ANALYSIS_USAGE_COUNT, resetDate: STORAGE_KEYS.DEEP_ANALYSIS_USAGE_RESET_DATE };
    }
  }

  // 获取当前使用次数
  async getUsageCount(feature: FeatureType): Promise<number> {
    try {
      const keys = this.getFeatureKey(feature);
      const count = await AsyncStorage.getItem(keys.count);
      return parseInt(count || '0', 10);
    } catch {
      return 0;
    }
  }

  // 获取重置日期
  async getResetDate(feature: FeatureType): Promise<string | null> {
    const keys = this.getFeatureKey(feature);
    return AsyncStorage.getItem(keys.resetDate);
  }

  // 检查是否需要重置计数
  async checkAndResetIfNeeded(feature: FeatureType): Promise<void> {
    const resetDate = await this.getResetDate(feature);
    const today = new Date().toISOString().split('T')[0];
    
    if (!resetDate || resetDate !== today) {
      const keys = this.getFeatureKey(feature);
      await AsyncStorage.setItem(keys.count, '0');
      await AsyncStorage.setItem(keys.resetDate, today);
    }
  }

  // 增加使用次数
  async incrementUsageCount(feature: FeatureType): Promise<number> {
    await this.checkAndResetIfNeeded(feature);
    const keys = this.getFeatureKey(feature);
    const count = await this.getUsageCount(feature);
    const newCount = count + 1;
    await AsyncStorage.setItem(keys.count, newCount.toString());
    return newCount;
  }

  // 获取剩余次数
  async getRemainingCount(feature: FeatureType): Promise<number> {
    const type = await this.getSubscriptionType();
    const limit = this.getUsageLimit(type);
    const used = await this.getUsageCount(feature);
    return Math.max(0, limit[feature] - used);
  }

  // 检查功能是否可以访问
  async canUseFeature(feature: FeatureType): Promise<boolean> {
    const type = await this.getSubscriptionType();
    if (type === 'starter' || type === 'pro' || type === 'ultimate') {
      return true;
    }
    const remaining = await this.getRemainingCount(feature);
    return remaining > 0;
  }

  // 设置订阅类型（用于演示/测试）
  async setSubscriptionType(type: SubscriptionType): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.SUBSCRIPTION_TYPE, type);
  }

  // 重置使用次数
  async resetUsageCount(feature: FeatureType): Promise<void> {
    const keys = this.getFeatureKey(feature);
    await AsyncStorage.setItem(keys.count, '0');
  }

  // 获取订阅信息
  async getSubscriptionInfo(): Promise<SubscriptionInfo> {
    const type = await this.getSubscriptionType();
    return {
      type,
      isActive: type === 'starter' || type === 'pro' || type === 'ultimate',
    };
  }
}

// 导出单例
export const subscriptionService = new SubscriptionService();

// 默认导出
export default subscriptionService;

// 便捷导出函数
export const initialize = () => subscriptionService.checkAndResetIfNeeded('strategy');
export const hasActiveSubscription = async (): Promise<boolean> => {
  const type = await subscriptionService.getSubscriptionType();
  return type === 'starter' || type === 'pro' || type === 'ultimate';
};
export const checkTrendsAccess = () => subscriptionService.canUseFeature('trends');
export const checkStrategyAccess = () => subscriptionService.canUseFeature('strategy');
export const checkDeepAnalysisAccess = () => subscriptionService.canUseFeature('deepAnalysis');
export const incrementStrategyUsage = () => subscriptionService.incrementUsageCount('strategy');
export const incrementTrendsUsage = () => subscriptionService.incrementUsageCount('trends');
export const incrementDeepAnalysisUsage = () => subscriptionService.incrementUsageCount('deepAnalysis');

// 订阅信息常量
export const SUBSCRIPTION_INFO = {
  FREE: { name: 'Free', uses: 3, price: 0, priceId: null },
  STARTER: { name: 'Starter', uses: 10, price: 9.9, priceId: SUBSCRIPTION_PRODUCT_IDS.STARTER },
  PRO: { name: 'Pro', uses: 50, price: 29.9, priceId: SUBSCRIPTION_PRODUCT_IDS.PRO },
  ULTIMATE: { name: 'Ultimate', uses: Infinity, price: 59.9, priceId: SUBSCRIPTION_PRODUCT_IDS.ULTIMATE },
};

export const SUBSCRIPTION_PRODUCTS = SUBSCRIPTION_PRODUCT_IDS;

export const FREE_LIMITS = SUBSCRIPTION_LIMITS.FREE;

// 更多便捷导出
export const getMonthlyUsageCount = () => subscriptionService.getUsageCount('strategy');
export const getSubscriptionType = () => subscriptionService.getSubscriptionType();
export const getUsageCount = (feature: FeatureType) => subscriptionService.getUsageCount(feature);
export const canUseFeature = (feature: FeatureType) => subscriptionService.canUseFeature(feature);
export const getRemainingCount = (feature: FeatureType) => subscriptionService.getRemainingCount(feature);
export const hasUserAgreedToTerms = async (): Promise<boolean> => {
  const value = await AsyncStorage.getItem('USER_AGREED_TO_TERMS');
  return value === 'true';
};
export const setUserAgreedToTerms = async (agreed: boolean): Promise<void> => {
  await AsyncStorage.setItem('USER_AGREED_TO_TERMS', agreed ? 'true' : 'false');
};

// 调试用：重置隐私同意状态（开发测试用）
export const resetPrivacyConsent = async (): Promise<void> => {
  await AsyncStorage.removeItem('USER_AGREED_TO_TERMS');
};
export const getRemainingFreeUsage = async (): Promise<number> => {
  await subscriptionService.checkAndResetIfNeeded('strategy');
  return subscriptionService.getRemainingCount('strategy');
};
export const hasFreeUsageRemaining = async (): Promise<boolean> => {
  await subscriptionService.checkAndResetIfNeeded('strategy');
  return subscriptionService.canUseFeature('strategy');
};
export const incrementFreeUsage = async (): Promise<void> => {
  await subscriptionService.incrementUsageCount('strategy');
};
