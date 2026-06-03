/**
 * IAP Service (In-App Purchase)
 * Cross-platform IAP 集成 - 支持 Apple StoreKit 和 Google Play Billing
 * 
 * 注意：此模块在 iOS/Android 上可用
 * Web 平台会返回错误提示用户使用移动端订阅
 */

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { subscriptionService } from './SubscriptionService';
import { getBackendBaseUrl } from '@/utils/Environment';

// 订阅产品配置 - iOS 和 Android 使用不同的产品 ID
export const IAP_PRODUCTS = {
  STARTER: {
    id: Platform.OS === 'ios' ? 'com.libo.tikboost.starter' : 'com.libo.tikboost.starter.android',
    name: 'Starter',
    price: 9.9,
    interval: 'month',
    strategyCount: 10,
    trendsCount: 10,
    description: 'Perfect for beginners - 10 strategies/month',
  },
  PRO: {
    id: Platform.OS === 'ios' ? 'com.libo.tikboost.pro' : 'com.libo.tikboost.pro.android',
    name: 'Pro',
    price: 29.9,
    interval: 'month',
    strategyCount: 50,
    trendsCount: 30,
    description: 'For serious creators - 50 strategies/month',
  },
  ULTIMATE: {
    id: Platform.OS === 'ios' ? 'com.libo.tikboost.ultimate' : 'com.libo.tikboost.ultimate.android',
    name: 'Ultimate',
    price: 59.9,
    interval: 'month',
    strategyCount: Infinity,
    trendsCount: Infinity,
    description: 'Unlimited access for power users',
  },
} as const;

// 获取平台名称
export const getPlatformName = (): string => {
  return Platform.OS === 'ios' ? 'App Store' : 'Google Play';
};

// 获取产品 ID 列表
const ALL_PRODUCT_IDS = [
  IAP_PRODUCTS.STARTER.id,
  IAP_PRODUCTS.PRO.id,
  IAP_PRODUCTS.ULTIMATE.id,
];

// 存储键
const IAP_STORAGE_KEYS = {
  PURCHASED_PRODUCT_ID: '@tikboost_purchased_product_id',
  PURCHASE_TOKEN: '@tikboost_purchase_token',
  PURCHASE_DATE: '@tikboost_purchase_date',
  SUBSCRIPTION_EXPIRES: '@tikboost_subscription_expires',
};

// 购买结果类型
export interface PurchaseResult {
  success: boolean;
  productId?: string;
  transactionId?: string;
  error?: string;
}

// 产品信息类型
export interface ProductInfo {
  productId: string;
  title: string;
  description: string;
  price: string;
  priceAmount: number;
  priceCurrency: string;
}

// IAP 模块类型定义
interface IAPResponseCode {
  OK: string;
  USER_CANCELED: string;
  ERROR: string;
}

interface InAppPurchaseItem {
  productId: string;
  title: string;
  description: string;
  price: string;
  priceAmount: number | string;
  priceCurrencyCode: string;
}

interface IAPQueryResponse<T> {
  responseCode: string;
  results?: T[];
  products?: T[];
}

interface InAppPurchasesType {
  connectAsync: () => Promise<void>;
  disconnectAsync: () => Promise<void>;
  setPurchaseListener: (callback: (results: IAPQueryResponse<any>) => void) => void;
  getProductsAsync: (productIds: string[]) => Promise<IAPQueryResponse<InAppPurchaseItem>>;
  purchaseItemAsync: (productId: string, extraData?: string) => Promise<IAPQueryResponse<any>>;
  getPurchaseHistoryAsync: () => Promise<IAPQueryResponse<any>>;
  acknowledgePurchaseAsync?: (purchaseToken: string) => Promise<void>;
  IAPResponseCode: IAPResponseCode;
}

// 动态加载 IAP 模块
let InAppPurchases: InAppPurchasesType | null = null;

async function loadIAPModule(): Promise<boolean> {
  if (InAppPurchases) return true;
  if (Platform.OS === 'web') return false;

  try {
    // 动态导入原生模块
    const module = await import('expo-in-app-purchases');
    InAppPurchases = module as unknown as InAppPurchasesType;
    return true;
  } catch (e) {
    console.warn('Failed to load IAP module:', e);
    return false;
  }
}

// IAP 服务类
class IAPServiceClass {
  private initialized: boolean = false;
  private products: Map<string, ProductInfo> = new Map();
  private purchaseListeners: ((result: PurchaseResult) => void)[] = [];

  /**
   * 初始化 IAP 服务
   */
  async initialize(): Promise<boolean> {
    if (this.initialized) return true;
    if (Platform.OS === 'web') return false;

    try {
      const loaded = await loadIAPModule();
      if (!loaded || !InAppPurchases) return false;

      // 连接 IAP 服务
      await InAppPurchases.connectAsync();
      
      // 设置购买监听器
      InAppPurchases.setPurchaseListener((results) => {
        this.handlePurchaseUpdate(results);
      });

      // 查询可用产品
      await this.queryProducts();

      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize IAP:', error);
      return false;
    }
  }

  /**
   * 查询可用产品
   */
  async queryProducts(): Promise<ProductInfo[]> {
    if (!InAppPurchases) return [];

    try {
      const result = await InAppPurchases.getProductsAsync(ALL_PRODUCT_IDS);
      
      if (result.responseCode === InAppPurchases.IAPResponseCode.OK && (result.products || result.results)) {
        this.products.clear();
        
        const products = result.products || result.results || [];
        for (const product of products) {
          this.products.set(product.productId, {
            productId: product.productId,
            title: product.title,
            description: product.description,
            price: product.price,
            priceAmount: typeof product.priceAmount === 'number' 
              ? product.priceAmount / 1000000 
              : Number(product.priceAmount) / 1000000,
            priceCurrency: product.priceCurrencyCode || 'USD',
          });
        }

        return Array.from(this.products.values());
      }

      return [];
    } catch (error) {
      console.error('Failed to query products:', error);
      return [];
    }
  }

  /**
   * 购买订阅
   */
  async purchaseSubscription(productId: string): Promise<PurchaseResult> {
    // Web 平台不支持
    if (Platform.OS === 'web' || !InAppPurchases) {
      return { 
        success: false, 
        error: 'In-app purchases are not supported on web. Please use the mobile app to subscribe.' 
      };
    }
    
    try {
      // 确保已初始化
      if (!this.initialized) {
        await this.initialize();
      }

      // 检查产品是否可用
      if (!this.products.has(productId)) {
        await this.queryProducts();
        
        if (!this.products.has(productId)) {
          return { success: false, error: 'Product not available' };
        }
      }

      // 显示付费对话框
      // Android 可能需要 extraData 来确认订阅
      const extraData = Platform.OS === 'android' ? '{"isAndroid": "true"}' : undefined;
      const result = await InAppPurchases.purchaseItemAsync(productId, extraData);

      if (result.responseCode === InAppPurchases.IAPResponseCode.OK && result.results && result.results.length > 0) {
        const purchase = result.results[0];
        
        // Android 需要确认购买
        if (Platform.OS === 'android' && InAppPurchases.acknowledgePurchaseAsync && purchase.purchaseToken) {
          try {
            await InAppPurchases.acknowledgePurchaseAsync(purchase.purchaseToken);
          } catch (ackError) {
            console.warn('Failed to acknowledge purchase:', ackError);
          }
        }
        
        // 保存购买信息
        await this.savePurchaseInfo({
          productId: purchase.productId,
          purchaseToken: purchase.purchaseToken || '',
          transactionId: purchase.transactionId || purchase.orderId || '',
        });

        const verified = await this.syncPurchaseToServer({
          productId: purchase.productId,
          purchaseToken: purchase.purchaseToken || '',
          transactionId: purchase.transactionId || purchase.orderId || '',
        });

        if (!verified) {
          return {
            success: false,
            productId: purchase.productId,
            transactionId: purchase.transactionId || purchase.orderId || '',
            error: 'Purchase could not be verified. Please try restoring purchases later.',
          };
        }

        const subscriptionType = this.getSubscriptionTypeFromProduct(purchase.productId);
        if (subscriptionType) {
          await subscriptionService.setSubscriptionType(subscriptionType as any);
        }

        return {
          success: true,
          productId: purchase.productId,
          transactionId: purchase.transactionId || purchase.orderId || '',
        };
      } else if (result.responseCode === InAppPurchases.IAPResponseCode.USER_CANCELED) {
        return { success: false, error: 'Purchase cancelled' };
      } else {
        return { success: false, error: 'Purchase failed' };
      }
    } catch (error: any) {
      console.error('Purchase error:', error);
      if (error.message?.includes('cancel')) {
        return { success: false, error: 'Purchase cancelled' };
      }
      return { success: false, error: error.message || 'Purchase failed' };
    }
  }

  /**
   * 处理购买更新
   */
  private handlePurchaseUpdate(results: IAPQueryResponse<any>) {
    if (!results.results) return;

    for (const result of results.results) {
      if (result.purchaseResult === InAppPurchases?.IAPResponseCode?.OK) {
        const purchase = result;
        
        this.savePurchaseInfo({
          productId: purchase.productId,
          purchaseToken: purchase.purchaseToken || '',
          transactionId: purchase.transactionId || purchase.orderId || '',
        }).then(async () => {
          const verified = await this.syncPurchaseToServer({
            productId: purchase.productId,
            purchaseToken: purchase.purchaseToken || '',
            transactionId: purchase.transactionId || purchase.orderId || '',
          });
          if (!verified) return;

          const subscriptionType = this.getSubscriptionTypeFromProduct(purchase.productId);
          if (subscriptionType) {
            await subscriptionService.setSubscriptionType(subscriptionType as any);
          }

          this.purchaseListeners.forEach((listener) => {
            listener({
              success: true,
              productId: purchase.productId,
              transactionId: purchase.transactionId || purchase.orderId || '',
            });
          });
        });
      }
    }
  }

  /**
   * 从产品 ID 获取订阅类型
   */
  private getSubscriptionTypeFromProduct(productId: string): string | null {
    if (productId.includes('starter')) return 'starter';
    if (productId.includes('ultimate')) return 'ultimate';
    if (productId.includes('pro')) return 'pro';
    return null;
  }

  /**
   * 保存购买信息到本地
   */
  private async savePurchaseInfo(info: {
    productId: string;
    purchaseToken: string;
    transactionId: string;
  }): Promise<void> {
    try {
      await AsyncStorage.setItem(IAP_STORAGE_KEYS.PURCHASED_PRODUCT_ID, info.productId);
      await AsyncStorage.setItem(IAP_STORAGE_KEYS.PURCHASE_TOKEN, info.purchaseToken);
      await AsyncStorage.setItem(IAP_STORAGE_KEYS.PURCHASE_DATE, new Date().toISOString());
      
      // 设置过期时间（默认 30 天后）
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1);
      await AsyncStorage.setItem(
        IAP_STORAGE_KEYS.SUBSCRIPTION_EXPIRES,
        expiresAt.toISOString()
      );
    } catch (error) {
      console.error('Failed to save purchase info:', error);
    }
  }

  /**
   * 获取购买历史
   */
  async getPurchaseHistory(): Promise<PurchaseResult[]> {
    if (Platform.OS === 'web' || !InAppPurchases) return [];

    try {
      const result = await InAppPurchases.getPurchaseHistoryAsync();
      
      if (result.responseCode === InAppPurchases.IAPResponseCode.OK && result.results) {
        return result.results.map((purchase) => ({
          success: true,
          productId: purchase.productId,
          transactionId: purchase.transactionId || purchase.orderId || '',
        }));
      }

      return [];
    } catch (error) {
      console.error('Failed to get purchase history:', error);
      return [];
    }
  }

  /**
   * 恢复购买
   */
  async restorePurchases(): Promise<PurchaseResult> {
    if (Platform.OS === 'web') {
      return { success: false, error: 'Not supported on web' };
    }

    try {
      const history = await this.getPurchaseHistory();
      
      if (history.length > 0) {
        // 获取最新的购买
        const latestPurchase = history[history.length - 1];
        
        if (latestPurchase.productId) {
          const verified = await this.syncPurchaseToServer({
            productId: latestPurchase.productId,
            transactionId: latestPurchase.transactionId || '',
          });
          if (!verified) {
            return { success: false, error: 'Purchase could not be verified' };
          }

          const subscriptionType = this.getSubscriptionTypeFromProduct(latestPurchase.productId);
          if (subscriptionType) {
            await subscriptionService.setSubscriptionType(subscriptionType as any);
          }
        }

        return latestPurchase;
      }

      return { success: false, error: 'No purchases found' };
    } catch (error: any) {
      console.error('Failed to restore purchases:', error);
      return { success: false, error: error.message || 'Restore failed' };
    }
  }

  /**
   * 同步购买到服务器
   */
  private async syncPurchaseToServer(purchase: {
    productId: string;
    purchaseToken?: string;
    transactionId?: string;
  }): Promise<boolean> {
    const subscriptionType = this.getSubscriptionTypeFromProduct(purchase.productId);
    if (!subscriptionType) return false;

    try {
      // 获取本地存储的认证信息
      const { getToken } = await import('./AuthService');
      const token = await getToken();
      
      if (!token) return false;

      const response = await fetch(`${getBackendBaseUrl()}/api/v1/subscription/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: purchase.productId,
          purchaseToken: purchase.purchaseToken,
          transactionId: purchase.transactionId,
          platform: Platform.OS,
        }),
      });

      if (!response.ok) {
        throw new Error('Server sync failed');
      }
      return true;
    } catch (error) {
      console.warn('Failed to sync to server:', error);
      return false;
    }
  }

  /**
   * 添加购买监听器
   */
  addPurchaseListener(listener: (result: PurchaseResult) => void): void {
    this.purchaseListeners.push(listener);
  }

  /**
   * 移除购买监听器
   */
  removePurchaseListener(listener: (result: PurchaseResult) => void): void {
    const index = this.purchaseListeners.indexOf(listener);
    if (index > -1) {
      this.purchaseListeners.splice(index, 1);
    }
  }

  /**
   * 获取订阅状态
   */
  async getSubscriptionStatus(): Promise<{
    isActive: boolean;
    productId: string | null;
    expiresAt: Date | null;
  }> {
    try {
      const productId = await AsyncStorage.getItem(IAP_STORAGE_KEYS.PURCHASED_PRODUCT_ID);
      const expiresAtStr = await AsyncStorage.getItem(IAP_STORAGE_KEYS.SUBSCRIPTION_EXPIRES);
      
      if (!productId) {
        return { isActive: false, productId: null, expiresAt: null };
      }

      const expiresAt = expiresAtStr ? new Date(expiresAtStr) : null;
      const isActive = expiresAt ? expiresAt > new Date() : true;

      return { isActive, productId, expiresAt };
    } catch (error) {
      console.error('Failed to get subscription status:', error);
      return { isActive: false, productId: null, expiresAt: null };
    }
  }

  /**
   * 断开连接
   */
  async disconnect(): Promise<void> {
    if (InAppPurchases && this.initialized) {
      await InAppPurchases.disconnectAsync();
      this.initialized = false;
      InAppPurchases = null;
    }
  }
}

// 导出单例
export const iapService = new IAPServiceClass();
export default iapService;
