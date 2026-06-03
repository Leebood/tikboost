import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { trendService, TrendReport } from '@/services/TrendService';
import { subscriptionService, initialize, checkTrendsAccess } from '@/services/SubscriptionService';
import { getTranslation } from '@/i18n';

// Localized function
const t = (key: string): string => getTranslation(key);

type PlatformType = 'tiktok' | 'instagram' | 'youtube';

export default function TrendsScreen() {
  const [keyword, setKeyword] = useState('');
  const [platform, setPlatform] = useState<PlatformType>('tiktok');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [report, setReport] = useState<TrendReport | null>(null);

  useEffect(() => {
    initialize();
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!keyword.trim()) {
      Alert.alert(t('common.error'), t('trends.error'));
      return;
    }

    // Check usage limit for non-premium users
    const canUse = await checkTrendsAccess();
    if (!canUse) {
      Alert.alert(
        t('subscription.limitReached'),
        t('subscription.upgradeToUnlimited'),
        [
          { text: t('subscription.cancel'), style: 'cancel' },
          { text: t('subscription.upgrade'), onPress: () => {} },
        ]
      );
      return;
    }

    setIsAnalyzing(true);
    setReport(null);

    try {
      const result = await trendService.analyzeTrends(keyword.trim(), platform);
      setReport(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : t('trends.error');
      Alert.alert(t('common.error'), message);
    } finally {
      setIsAnalyzing(false);
    }
  }, [keyword, platform]);

  const getTopicBadgeStyle = (type: string) => {
    switch (type) {
      case 'hot':
        return { bg: '#FEE2E2', text: '#EF4444' };
      case 'rising':
        return { bg: '#FEF3C7', text: '#D97706' };
      default:
        return { bg: '#E0E7FF', text: '#4F46E5' };
    }
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'high':
        return { bg: '#FEE2E2', text: '#EF4444', label: t('trends.actionPlan.priority.high') };
      case 'medium':
        return { bg: '#FEF3C7', text: '#D97706', label: t('trends.actionPlan.priority.medium') };
      default:
        return { bg: '#E0E7FF', text: '#4F46E5', label: t('trends.actionPlan.priority.low') };
    }
  };

  return (
    <Screen>
      <ScrollView className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="bg-white px-5 pt-4 pb-5 border-b border-gray-100">
          <Text className="text-2xl font-bold text-gray-900">{t('trends.title')}</Text>
          <Text className="text-sm text-gray-500 mt-1">{t('trends.subtitle')}</Text>
        </View>

        {/* Input Section */}
        <View className="p-5">
          <TextInput
            className="bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 text-base"
            placeholder={t('trends.keyword')}
            placeholderTextColor="#9CA3AF"
            value={keyword}
            onChangeText={setKeyword}
            autoCapitalize="none"
            autoCorrect={false}
          />

          {/* Platform Selection */}
          <Text className="text-sm font-medium text-gray-700 mt-4 mb-2">{t('trends.platform')}</Text>
          <View className="flex-row gap-2">
            {(['tiktok', 'instagram', 'youtube'] as PlatformType[]).map((p) => (
              <TouchableOpacity
                key={p}
                className={`flex-1 py-2.5 rounded-lg border ${
                  platform === p
                    ? 'bg-blue-500 border-blue-500'
                    : 'bg-white border-gray-200'
                }`}
                onPress={() => setPlatform(p)}
              >
                <Text
                  className={`text-center text-sm font-medium ${
                    platform === p ? 'text-white' : 'text-gray-600'
                  }`}
                >
                  {p === 'tiktok' ? 'TikTok' : p === 'instagram' ? 'Instagram' : 'YouTube'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Analyze Button */}
          <TouchableOpacity
            className={`mt-4 py-3.5 rounded-xl flex-row items-center justify-center gap-2 ${
              !keyword.trim() || isAnalyzing ? 'bg-gray-300' : 'bg-blue-500'
            }`}
            onPress={handleAnalyze}
            disabled={!keyword.trim() || isAnalyzing}
          >
            {isAnalyzing ? (
              <>
                <ActivityIndicator color="white" size="small" />
                <Text className="text-white font-medium">{t('trends.analyzing')}</Text>
              </>
            ) : (
              <>
                <Feather name="trending-up" size={18} color="white" />
                <Text className="text-white font-medium">{t('trends.analyze')}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Results */}
        {report && (
          <View className="px-5 pb-8">
            {/* AI Insights */}
            <View className="bg-white rounded-xl p-4 mb-4">
              <View className="flex-row items-center gap-2 mb-3">
                <View className="w-8 h-8 rounded-lg bg-purple-100 items-center justify-center">
                  <Feather name="star" size={16} color="#8B5CF6" />
                </View>
                <Text className="text-base font-semibold text-gray-900">{t('trends.insights')}</Text>
              </View>
              <Text className="text-sm text-gray-600 leading-relaxed">{report.insights.summary}</Text>
            </View>

            {/* Recommended Topics */}
            {report.recommendedTopics && report.recommendedTopics.length > 0 && (
              <View className="bg-white rounded-xl p-4 mb-4">
                <View className="flex-row items-center gap-2 mb-3">
                  <View className="w-8 h-8 rounded-lg bg-green-100 items-center justify-center">
                    <Feather name="zap" size={16} color="#10B981" />
                  </View>
                  <Text className="text-base font-semibold text-gray-900">{t('trends.topics')}</Text>
                </View>
                <View className="gap-2">
                  {report.recommendedTopics.slice(0, 5).map((topic, index) => {
                    const badgeStyle = getTopicBadgeStyle((topic as any).type);
                    return (
                      <View
                        key={index}
                        className="flex-row items-center justify-between py-2.5 px-3 bg-gray-50 rounded-lg"
                      >
                        <View className="flex-1">
                          <Text className="text-sm font-medium text-gray-900">{topic.topic}</Text>
                          <Text className="text-xs text-gray-500 mt-0.5">{(topic as any).reason}</Text>
                        </View>
                        <View
                          className="px-2 py-1 rounded-md"
                          style={{ backgroundColor: badgeStyle.bg }}
                        >
                          <Text
                            className="text-xs font-medium"
                            style={{ color: badgeStyle.text }}
                          >
                            {(topic as any).type === 'hot'
                              ? t('trends.topics.hot')
                              : (topic as any).type === 'rising'
                              ? t('trends.topics.rising')
                              : t('trends.topics.stable')}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Action Plan */}
            {report.actionPlan && (
              <View className="bg-white rounded-xl p-4 mb-4">
                <View className="flex-row items-center gap-2 mb-3">
                  <View className="w-8 h-8 rounded-lg bg-blue-100 items-center justify-center">
                    <Feather name="check-circle" size={16} color="#3B82F6" />
                  </View>
                  <Text className="text-base font-semibold text-gray-900">{t('trends.actionPlan')}</Text>
                </View>
                <View className="gap-3">
                  {report.actionPlan.map((action, index) => {
                    const priorityStyle = getPriorityStyle(action.priority);
                    return (
                      <View
                        key={index}
                        className="p-3 bg-gray-50 rounded-lg"
                      >
                        <View className="flex-row items-center justify-between mb-2">
                          <Text className="text-sm font-semibold text-gray-900">{action.title}</Text>
                          <View
                            className="px-2 py-0.5 rounded"
                            style={{ backgroundColor: priorityStyle.bg }}
                          >
                            <Text
                              className="text-xs font-medium"
                              style={{ color: priorityStyle.text }}
                            >
                              {priorityStyle.label}
                            </Text>
                          </View>
                        </View>
                        <Text className="text-xs text-gray-600 leading-relaxed">{action.description}</Text>
                        {action.steps && action.steps.length > 0 && (
                          <View className="mt-2">
                            <Text className="text-xs font-medium text-gray-700 mb-1">{t('trends.actionPlan.steps')}</Text>
                            {action.steps.map((step, stepIndex) => (
                              <Text key={stepIndex} className="text-xs text-gray-600 pl-2">
                                • {step}
                              </Text>
                            ))}
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Content Ideas */}
            {report.contentIdeas && (
              <View className="bg-white rounded-xl p-4 mb-4">
                <View className="flex-row items-center gap-2 mb-3">
                  <View className="w-8 h-8 rounded-lg bg-purple-100 items-center justify-center">
                    <Feather name="star" size={16} color="#8B5CF6" />
                  </View>
                  <Text className="text-base font-semibold text-gray-900">{t('trends.contentIdeas')}</Text>
                </View>
                <View className="gap-2">
                  {report.contentIdeas.map((idea, index) => (
                    <View
                      key={index}
                      className="p-3 bg-gray-50 rounded-lg"
                    >
                      <Text className="text-sm font-medium text-gray-900">{idea.type}</Text>
                      <Text className="text-xs text-gray-600 mt-1">{idea.description}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Hashtag Strategy */}
            {report.hashtagStrategy && (
              <View className="bg-white rounded-xl p-4 mb-4">
                <View className="flex-row items-center gap-2 mb-3">
                  <View className="w-8 h-8 rounded-lg bg-pink-100 items-center justify-center">
                    <Feather name="hash" size={16} color="#EC4899" />
                  </View>
                  <Text className="text-base font-semibold text-gray-900">{t('trends.hashtags')}</Text>
                </View>
                <View className="flex-row flex-wrap gap-2">
                  {[...report.hashtagStrategy.primary, ...report.hashtagStrategy.secondary].map(
                    (tag, index) => (
                      <View
                        key={index}
                        className="px-3 py-1.5 bg-gray-100 rounded-full"
                      >
                        <Text className="text-sm text-gray-700">#{tag}</Text>
                      </View>
                    )
                  )}
                </View>
              </View>
            )}

            {/* Optimal Timing */}
            {report.optimalTiming && (
              <View className="bg-white rounded-xl p-4 mb-4">
                <View className="flex-row items-center gap-2 mb-3">
                  <View className="w-8 h-8 rounded-lg bg-cyan-100 items-center justify-center">
                    <Feather name="clock" size={16} color="#06B6D4" />
                  </View>
                  <Text className="text-base font-semibold text-gray-900">{t('trends.timing')}</Text>
                </View>
                <View className="gap-2">
                  <View className="flex-row items-center gap-2">
                    <Feather name="calendar" size={14} color="#6B7280" />
                    <Text className="text-sm text-gray-600">
                      {t('trends.timing.bestDays')}: {report.optimalTiming.bestDays.join(', ')}
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <Feather name="clock" size={14} color="#6B7280" />
                    <Text className="text-sm text-gray-600">
                      {t('trends.timing.bestTimes')}: {report.optimalTiming.bestTimes.join(', ')}
                    </Text>
                  </View>
                  {report.optimalTiming.reasoning && (
                    <Text className="text-xs text-gray-500 mt-2 pl-6">
                      {report.optimalTiming.reasoning}
                    </Text>
                  )}
                </View>
              </View>
            )}

            {/* Viral Potential */}
            {report.viralPotential && (
              <View className="bg-white rounded-xl p-4 mb-4">
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm font-medium text-gray-700">{t('trends.viralPotential')}</Text>
                  <View className="flex-row items-center gap-2">
                    <View className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <View
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${report.viralPotential.score * 10}%` }}
                      />
                    </View>
                    <Text className="text-sm font-semibold text-gray-900">
                      {report.viralPotential.score}/10
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}
