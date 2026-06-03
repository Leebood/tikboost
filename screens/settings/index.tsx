/**
 * Settings Screen - 设置与订阅页面
 * 管理订阅、查看历史、隐私设置、IAP 购买
 */
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Linking,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { Screen } from '@/components/Screen';
import { useTranslation } from '@/i18n';
import { IconContainer, IconColors } from '@/components/AppIcons';
import {
  getMonthlyUsageCount,
  getSubscriptionType,
  SUBSCRIPTION_INFO,
  SUBSCRIPTION_PRODUCTS,
  FREE_LIMITS,
} from '@/services/SubscriptionService';
import {
  iapService,
  IAP_PRODUCTS,
} from '@/services/IAPService';

type SubscriptionType = 'free' | 'starter' | 'pro' | 'ultimate';

export default function SettingsScreen() {
  const router = useSafeRouter();
  const { t } = useTranslation();
  const [monthlyUsage, setMonthlyUsage] = useState(0);
  const [subscriptionType, setSubscriptionType] = useState<SubscriptionType>('free');
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [iapInitialized, setIapInitialized] = useState(false);

  useEffect(() => {
    // 初始化数据
    const initData = async () => {
      setIsLoading(true);
      try {
        // 初始化 IAP
        const iapReady = await iapService.initialize();
        setIapInitialized(iapReady);

        // 获取使用次数和订阅状态
        const usage = await getMonthlyUsageCount();
        const subType = await getSubscriptionType();
        setMonthlyUsage(usage);
        setSubscriptionType(subType as SubscriptionType);
      } catch (error) {
        console.error('Failed to load settings data:', error);
      }
      setIsLoading(false);
    };
    initData();
  }, []);

  const getPlanName = () => {
    switch (subscriptionType) {
      case 'starter':
        return 'Starter';
      case 'pro':
        return 'Pro';
      case 'ultimate':
        return 'Ultimate';
      default:
        return 'Free';
    }
  };

  const getPlanBadgeColor = () => {
    switch (subscriptionType) {
      case 'starter':
        return '#10B981';
      case 'pro':
        return '#4F46E5';
      case 'ultimate':
        return '#7C3AED';
      default:
        return IconColors.muted;
    }
  };

  const getPlanPrice = () => {
    switch (subscriptionType) {
      case 'starter':
        return `$${SUBSCRIPTION_INFO.STARTER.price}/mo`;
      case 'pro':
        return `$${SUBSCRIPTION_INFO.PRO.price}/mo`;
      case 'ultimate':
        return `$${SUBSCRIPTION_INFO.ULTIMATE.price}/mo`;
      default:
        return 'Free';
    }
  };

  const handleUpgrade = () => {
    setShowSubscriptionModal(true);
  };

  const handleSubscribe = async (productId: string) => {
    if (!iapInitialized) {
      Alert.alert(
        'IAP Unavailable',
        'In-app purchases are not available on this device. Please try again later.',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsLoading(true);
    try {
      const result = await iapService.purchaseSubscription(productId);
      
      if (result.success) {
        setShowSubscriptionModal(false);
        Alert.alert(
          'Subscription Activated!',
          'Thank you for your subscription. Enjoy unlimited access!',
          [{ text: 'OK' }]
        );
        
        // 刷新数据
        const usage = await getMonthlyUsageCount();
        const subType = await getSubscriptionType();
        setMonthlyUsage(usage);
        setSubscriptionType(subType as SubscriptionType);
      } else if (result.error !== 'Purchase cancelled') {
        Alert.alert(
          'Purchase Failed',
          result.error || 'Unable to complete purchase. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.message || 'An unexpected error occurred.',
        [{ text: 'OK' }]
      );
    }
    setIsLoading(false);
  };

  const handleRestorePurchases = async () => {
    if (!iapInitialized) {
      Alert.alert('IAP Unavailable', 'In-app purchases are not available.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await iapService.restorePurchases();
      
      if (result.success && result.productId) {
        Alert.alert(
          'Restore Successful',
          'Your previous subscription has been restored.',
          [{ text: 'OK' }]
        );
        
        // 刷新数据
        const usage = await getMonthlyUsageCount();
        const subType = await getSubscriptionType();
        setMonthlyUsage(usage);
        setSubscriptionType(subType as SubscriptionType);
      } else {
        Alert.alert(
          'No Purchases Found',
          'No previous purchases were found to restore.',
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      Alert.alert(
        'Restore Failed',
        error.message || 'Unable to restore purchases.',
        [{ text: 'OK' }]
      );
    }
    setIsLoading(false);
  };

  const isCurrentPlan = (planType: SubscriptionType) => {
    return subscriptionType === planType;
  };

  return (
    <Screen>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t('settings.title')}</Text>
        </View>

        {/* Current Plan Card */}
        <View style={styles.planCard}>
          <View style={styles.planHeader}>
            <View>
              <Text style={styles.planLabel}>{t('settings.current.plan')}</Text>
              <Text style={styles.planPrice}>{getPlanPrice()}</Text>
            </View>
            <View style={[styles.planBadge, { backgroundColor: getPlanBadgeColor() }]}>
              <Text style={styles.planBadgeText}>{getPlanName()}</Text>
            </View>
          </View>

          {/* Usage Progress */}
          {subscriptionType === 'free' && (
            <View style={styles.usageContainer}>
              <View style={styles.usageHeader}>
                <Text style={styles.usageLabel}>{t('settings.usage')}</Text>
                <Text style={styles.usageCount}>
                  {monthlyUsage} / {FREE_LIMITS.strategy}
                </Text>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${Math.min((monthlyUsage / FREE_LIMITS.strategy) * 100, 100)}%` },
                  ]}
                />
              </View>
            </View>
          )}

          {subscriptionType !== 'free' && (
            <Text style={styles.unlimitedText}>Unlimited generations available</Text>
          )}

          {/* Upgrade Button */}
          {subscriptionType === 'free' && (
            <TouchableOpacity style={styles.upgradeButton} onPress={handleUpgrade}>
              <Text style={styles.upgradeButtonText}>{t('settings.upgrade')}</Text>
            </TouchableOpacity>
          )}

          {subscriptionType !== 'free' && (
            <TouchableOpacity style={styles.manageButton} onPress={handleUpgrade}>
              <Text style={styles.manageButtonText}>{t('settings.manage')}</Text>
            </TouchableOpacity>
          )}

          {/* Restore Purchases */}
          <TouchableOpacity 
            style={styles.restoreButton} 
            onPress={handleRestorePurchases}
            disabled={isLoading}
          >
            <Text style={styles.restoreButtonText}>Restore Purchases</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/benchmark')}
          >
            <IconContainer icon="bar-chart-2" size="md" backgroundColor={IconColors.background} />
            <Text style={styles.menuText}>{t('benchmark.title')}</Text>
            <IconContainer icon="chevron-right" size="sm" color={IconColors.muted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/history')}>
            <IconContainer icon="file-text" size="md" backgroundColor={IconColors.background} />
            <Text style={styles.menuText}>{t('settings.history')}</Text>
            <IconContainer icon="chevron-right" size="sm" color={IconColors.muted} />
          </TouchableOpacity>
        </View>

        {/* Privacy Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.privacy')}</Text>

          {/* Age Rating */}
          <View style={styles.aboutItem}>
            <Text style={styles.aboutLabel}>{t('settings.privacy.ageRating')}</Text>
            <View style={styles.ageRatingBadge}>
              <Text style={styles.ageRatingText}>13+</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/privacy')}
          >
            <IconContainer icon="shield" size="md" backgroundColor={IconColors.background} />
            <Text style={styles.menuText}>{t('settings.privacy.privacyPolicy')}</Text>
            <IconContainer icon="chevron-right" size="sm" color={IconColors.muted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => Linking.openURL('https://www.termsfeed.com/live/694f444f-3ab1-4f0b-9c69-b7c44ec7f238')}
          >
            <IconContainer icon="file" size="md" backgroundColor={IconColors.background} />
            <Text style={styles.menuText}>{t('settings.terms')}</Text>
            <IconContainer icon="chevron-right" size="sm" color={IconColors.muted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => Linking.openURL('mailto:support@tikboost.com')}
          >
            <IconContainer icon="mail" size="md" backgroundColor={IconColors.background} />
            <Text style={styles.menuText}>{t('settings.contact')}</Text>
            <IconContainer icon="chevron-right" size="sm" color={IconColors.muted} />
          </TouchableOpacity>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.about')}</Text>

          <View style={styles.aboutItem}>
            <Text style={styles.aboutLabel}>{t('app.name')}</Text>
            <Text style={styles.aboutValue}>Version 1.0.0</Text>
          </View>

          <View style={styles.aboutItem}>
            <Text style={styles.aboutLabel}>{t('settings.language')}</Text>
            <Text style={styles.aboutValue}>English (US)</Text>
          </View>
        </View>

        {/* Bottom Padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Subscription Modal */}
      <Modal
        visible={showSubscriptionModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSubscriptionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('subscription.title')}</Text>
              <TouchableOpacity onPress={() => setShowSubscriptionModal(false)}>
                <IconContainer icon="x" size="md" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Free Plan */}
              <View style={styles.planOption}>
                <View style={styles.planOptionHeader}>
                  <Text style={styles.planOptionTitle}>Free</Text>
                  <Text style={styles.planOptionPrice}>$0<Text style={styles.planOptionPriceSuffix}>/month</Text></Text>
                </View>
                <Text style={styles.planOptionDesc}>
                  {FREE_LIMITS.strategy} free generations per month
                </Text>
                <View style={styles.planOptionFeatures}>
                  <Text style={styles.planOptionFeature}>✓ Basic strategy generation</Text>
                  <Text style={styles.planOptionFeature}>✓ Trend analysis</Text>
                </View>
                <TouchableOpacity
                  style={[styles.planOptionButton, styles.planOptionButtonDisabled]}
                  disabled
                >
                  <Text style={styles.planOptionButtonText}>Current Plan</Text>
                </TouchableOpacity>
              </View>

              {/* Starter Plan */}
              <View style={[styles.planOption, styles.planOptionHighlight]}>
                <View style={styles.planOptionHeader}>
                  <View>
                    <Text style={styles.planOptionTitle}>{IAP_PRODUCTS.STARTER.name}</Text>
                  </View>
                  <Text style={styles.planOptionPrice}>
                    ${IAP_PRODUCTS.STARTER.price}
                    <Text style={styles.planOptionPriceSuffix}>/month</Text>
                  </Text>
                </View>
                <Text style={styles.planOptionDesc}>
                  {IAP_PRODUCTS.STARTER.strategyCount} generations per month
                </Text>
                <View style={styles.planOptionFeatures}>
                  <Text style={styles.planOptionFeature}>✓ All free features</Text>
                  <Text style={styles.planOptionFeature}>✓ Priority support</Text>
                  <Text style={styles.planOptionFeature}>✓ Trend analytics</Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.planOptionButton,
                    isCurrentPlan('starter') && styles.planOptionButtonActive,
                  ]}
                  onPress={() => handleSubscribe(IAP_PRODUCTS.STARTER.id)}
                  disabled={isCurrentPlan('starter') || isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.planOptionButtonText}>
                      {isCurrentPlan('starter') ? 'Current Plan' : 'Subscribe'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>

              {/* Pro Plan */}
              <View style={styles.planOption}>
                <View style={styles.planOptionHeader}>
                  <View>
                    <Text style={styles.planOptionTitle}>{IAP_PRODUCTS.PRO.name}</Text>
                    <Text style={styles.planOptionBadge}>POPULAR</Text>
                  </View>
                  <Text style={styles.planOptionPrice}>
                    ${IAP_PRODUCTS.PRO.price}
                    <Text style={styles.planOptionPriceSuffix}>/month</Text>
                  </Text>
                </View>
                <Text style={styles.planOptionDesc}>
                  {IAP_PRODUCTS.PRO.strategyCount} generations per month
                </Text>
                <View style={styles.planOptionFeatures}>
                  <Text style={styles.planOptionFeature}>✓ Everything in Starter</Text>
                  <Text style={styles.planOptionFeature}>✓ Benchmark database access</Text>
                  <Text style={styles.planOptionFeature}>✓ Advanced analytics</Text>
                  <Text style={styles.planOptionFeature}>✓ Priority processing</Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.planOptionButton,
                    isCurrentPlan('pro') && styles.planOptionButtonActive,
                  ]}
                  onPress={() => handleSubscribe(IAP_PRODUCTS.PRO.id)}
                  disabled={isCurrentPlan('pro') || isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.planOptionButtonText}>
                      {isCurrentPlan('pro') ? 'Current Plan' : 'Subscribe'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>

              {/* Ultimate Plan */}
              <View style={styles.planOption}>
                <View style={styles.planOptionHeader}>
                  <View>
                    <Text style={styles.planOptionTitle}>{IAP_PRODUCTS.ULTIMATE.name}</Text>
                    <Text style={styles.planOptionBadge}>BEST VALUE</Text>
                  </View>
                  <Text style={styles.planOptionPrice}>
                    ${IAP_PRODUCTS.ULTIMATE.price}
                    <Text style={styles.planOptionPriceSuffix}>/month</Text>
                  </Text>
                </View>
                <Text style={styles.planOptionDesc}>
                  Unlimited generations per month
                </Text>
                <View style={styles.planOptionFeatures}>
                  <Text style={styles.planOptionFeature}>✓ Everything in Pro</Text>
                  <Text style={styles.planOptionFeature}>✓ Priority queue</Text>
                  <Text style={styles.planOptionFeature}>✓ Early access to new features</Text>
                  <Text style={styles.planOptionFeature}>✓ Dedicated support</Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.planOptionButton,
                    isCurrentPlan('ultimate') && styles.planOptionButtonActive,
                  ]}
                  onPress={() => handleSubscribe(IAP_PRODUCTS.ULTIMATE.id)}
                  disabled={isCurrentPlan('ultimate') || isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.planOptionButtonText}>
                      {isCurrentPlan('ultimate') ? 'Current Plan' : 'Subscribe'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>

              {/* Legal Notice */}
              <View style={styles.legalNotice}>
                <Text style={styles.legalText}>
                  Subscriptions automatically renew unless cancelled at least 24 hours before the end of the current period. 
                  You can manage your subscription and cancel anytime in your App Store settings.
                </Text>
              </View>
            </ScrollView>
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111111',
    letterSpacing: -0.5,
  },
  planCard: {
    backgroundColor: '#F7F7F7',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  planLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  planPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111111',
  },
  planBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  planBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  usageContainer: {
    marginBottom: 16,
  },
  usageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  usageLabel: {
    fontSize: 14,
    color: '#666666',
  },
  usageCount: {
    fontSize: 14,
    color: '#111111',
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E5E5',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4F46E5',
    borderRadius: 4,
  },
  unlimitedText: {
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: '500',
    marginBottom: 16,
  },
  upgradeButton: {
    backgroundColor: '#111111',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  upgradeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  manageButton: {
    backgroundColor: '#F0F0F0',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  manageButtonText: {
    color: '#111111',
    fontSize: 16,
    fontWeight: '600',
  },
  restoreButton: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  restoreButtonText: {
    fontSize: 13,
    color: '#666666',
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#999999',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#111111',
    marginLeft: 12,
  },
  aboutItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  aboutLabel: {
    fontSize: 15,
    color: '#111111',
  },
  aboutValue: {
    fontSize: 15,
    color: '#999999',
  },
  ageRatingBadge: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  ageRatingText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  toggleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  toggleTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  toggleDesc: {
    fontSize: 12,
    color: '#999999',
    marginTop: 2,
  },
  toggleSwitch: {
    width: 50,
    height: 30,
    borderRadius: 15,
    padding: 2,
  },
  toggleSwitchOff: {
    backgroundColor: '#E5E5E5',
  },
  toggleSwitchOn: {
    backgroundColor: '#4F46E5',
  },
  toggleKnob: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
  },
  bottomPadding: {
    height: 40,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingHorizontal: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111111',
  },
  planOption: {
    backgroundColor: '#F7F7F7',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  planOptionHighlight: {
    backgroundColor: '#EEF2FF',
    borderWidth: 2,
    borderColor: '#4F46E5',
  },
  planOptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  planOptionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111111',
  },
  planOptionBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4F46E5',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
    marginLeft: 8,
  },
  planOptionPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111111',
  },
  planOptionPriceSuffix: {
    fontSize: 14,
    fontWeight: '400',
    color: '#666666',
  },
  planOptionDesc: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 12,
  },
  planOptionFeatures: {
    marginBottom: 12,
  },
  planOptionFeature: {
    fontSize: 13,
    color: '#111111',
    marginBottom: 4,
  },
  planOptionButton: {
    backgroundColor: '#111111',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  planOptionButtonActive: {
    backgroundColor: '#4F46E5',
  },
  planOptionButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  planOptionButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  legalNotice: {
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  legalText: {
    fontSize: 11,
    color: '#999999',
    textAlign: 'center',
    lineHeight: 16,
  },
});
