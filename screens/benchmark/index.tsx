/**
 * Benchmark Screen - 对标库页面（专业版功能）
 * 展示同品类 TOP 3 爆款结构和模板
 */
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useSafeRouter, useSafeSearchParams } from '@/hooks/useSafeRouter';
import { Screen } from '@/components/Screen';
import { useTranslation } from '@/i18n';
import { IconContainer, IconColors } from '@/components/AppIcons';
import { runBenchmarkLookupWorkflow, BenchmarkReport } from '@/services/CozeService';
import { hasActiveSubscription } from '@/services/SubscriptionService';

export default function BenchmarkScreen() {
  const router = useSafeRouter();
  const { t } = useTranslation();
  const params = useSafeSearchParams<{
    category?: string;
  }>();

  const [isLoading, setIsLoading] = useState(true);
  const [isProUser, setIsProUser] = useState(false);
  const [benchmarkData, setBenchmarkData] = useState<BenchmarkReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const category = params.category || 'beauty';

  useEffect(() => {
    checkProStatus();
  }, []);

  const checkProStatus = async () => {
    setIsLoading(true);
    const isPro = await hasActiveSubscription();
    setIsProUser(isPro);

    if (isPro) {
      loadBenchmarkData();
    } else {
      setIsLoading(false);
    }
  };

  const loadBenchmarkData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await runBenchmarkLookupWorkflow(category);
      setBenchmarkData(data);
    } catch (err) {
      console.error('Failed to load benchmark data:', err);
      setError('Failed to load benchmark data');
    }
    setIsLoading(false);
  };

  const handleUpgrade = () => {
    router.navigate('/settings');
  };

  const handleBack = () => {
    router.back();
  };

  // Loading State
  if (isLoading) {
    return (
      <Screen>
        <View style={styles.centerContainer}>
          <IconContainer icon="loader" size="lg" />
          <Text style={styles.loadingText}>Loading benchmark data...</Text>
        </View>
      </Screen>
    );
  }

  // Non-Pro User - Show Upgrade Prompt
  if (!isProUser) {
    return (
      <Screen>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBack}>
              <IconContainer icon="arrow-left" size="md" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Benchmark</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Locked Content */}
          <View style={styles.lockedContainer}>
            <View style={styles.lockedIcon}>
              <IconContainer icon="lock" size="xl" color={IconColors.secondary} />
            </View>
            <Text style={styles.lockedTitle}>Pro Feature</Text>
            <Text style={styles.lockedDescription}>
              Benchmark database is available for Pro subscribers. Upgrade to access
              top-performing content in your category.
            </Text>

            <TouchableOpacity style={styles.upgradeButton} onPress={handleUpgrade}>
              <IconContainer icon="zap" size="sm" color="#FFFFFF" />
              <Text style={styles.upgradeButtonText}>Upgrade to Pro</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Screen>
    );
  }

  // Error State
  if (error) {
    return (
      <Screen>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBack}>
              <IconContainer icon="arrow-left" size="md" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Benchmark</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Error Content */}
          <View style={styles.centerContainer}>
            <IconContainer icon="alert-circle" size="lg" color="#EF4444" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadBenchmarkData}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Screen>
    );
  }

  // Success State - Show Benchmark Data
  return (
    <Screen>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack}>
            <IconContainer icon="arrow-left" size="md" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Benchmark</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Category Badge */}
          <View style={styles.categoryBadge}>
            <IconContainer icon="grid" size="sm" color="#4F46E5" />
            <Text style={styles.categoryText}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Text>
          </View>

          {/* Top Performers */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <IconContainer icon="trending-up" size="md" backgroundColor="#D1FAE5" />
              <Text style={styles.sectionTitle}>Top Performers</Text>
            </View>

            {benchmarkData?.top_videos?.map((video, index) => (
              <View key={index} style={styles.videoCard}>
                <View style={styles.videoHeader}>
                  <View style={styles.videoRank}>
                    <Text style={styles.videoRankText}>{index + 1}</Text>
                  </View>
                  <View style={styles.videoInfo}>
                    <Text style={styles.videoTitle} numberOfLines={2}>
                      {video.video_title}
                    </Text>
                    <View style={styles.videoMeta}>
                      <View style={styles.metaItem}>
                        <IconContainer icon="heart" size="sm" color={IconColors.secondary} />
                        <Text style={styles.metaText}>{video.engagement_rate}</Text>
                      </View>
                    </View>
                  </View>
                </View>
                <View style={styles.hookBox}>
                  <Text style={styles.hookLabel}>Hook:</Text>
                  <Text style={styles.hookText}>{video.hook}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Templates */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <IconContainer icon="copy" size="md" backgroundColor="#DBEAFE" />
              <Text style={styles.sectionTitle}>Reusable Templates</Text>
            </View>

            {/* Hook Template */}
            <View style={styles.templateCard}>
              <View style={styles.templateHeader}>
                <IconContainer icon="type" size="sm" color="#4F46E5" />
                <Text style={styles.templateTitle}>3-Second Hook Template</Text>
              </View>
              <Text style={styles.templateText}>
                {benchmarkData?.templates?.hook_template || 'Start with a shocking statement + product preview...'}
              </Text>
            </View>

            {/* Script Template */}
            <View style={styles.templateCard}>
              <View style={styles.templateHeader}>
                <IconContainer icon="file-text" size="sm" color="#7C3AED" />
                <Text style={styles.templateTitle}>Script Fill-in Template</Text>
              </View>
              <Text style={styles.templateText}>
                {benchmarkData?.templates?.script_template ||
                  'Hook (0-3s) → Problem (3-8s) → Solution (8-20s) → Social Proof (20-25s) → CTA (25-30s)'}
              </Text>
            </View>
          </View>

          {/* Bottom Padding */}
          <View style={styles.bottomPadding} />
        </ScrollView>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111111',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: IconColors.secondary,
  },
  errorText: {
    marginTop: 16,
    fontSize: 15,
    color: '#EF4444',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#F7F7F7',
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111111',
  },
  // Locked state
  lockedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  lockedIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F7F7F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  lockedTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 12,
  },
  lockedDescription: {
    fontSize: 15,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111111',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Content state
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#EEF2FF',
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  categoryText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    marginLeft: 10,
    fontSize: 18,
    fontWeight: '600',
    color: '#111111',
  },
  videoCard: {
    backgroundColor: '#F7F7F7',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  videoHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  videoRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#111111',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  videoRankText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  videoInfo: {
    flex: 1,
  },
  videoTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111111',
    marginBottom: 4,
  },
  videoMeta: {
    flexDirection: 'row',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  metaText: {
    marginLeft: 4,
    fontSize: 13,
    color: IconColors.secondary,
  },
  hookBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
  },
  hookLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: IconColors.secondary,
    marginBottom: 4,
  },
  hookText: {
    fontSize: 14,
    color: '#111111',
    lineHeight: 20,
  },
  templateCard: {
    backgroundColor: '#F7F7F7',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  templateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  templateTitle: {
    marginLeft: 8,
    fontSize: 15,
    fontWeight: '600',
    color: '#111111',
  },
  templateText: {
    fontSize: 14,
    color: '#444444',
    lineHeight: 22,
  },
  bottomPadding: {
    height: 40,
  },
});
