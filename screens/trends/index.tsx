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

  // 渲染带编号的列表
  const renderNumberedList = (items: string[], title?: string) => (
    <View className="mb-4">
      {title && <Text className="text-sm font-bold text-gray-800 mb-2">{title}</Text>}
      <View className="gap-2">
        {items.map((item, index) => (
          <View key={index} className="flex-row gap-3">
            <Text className="text-sm font-bold text-blue-600 min-w-[20px]">{index + 1}.</Text>
            <Text className="text-sm text-gray-600 flex-1 leading-relaxed">{item}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  // 渲染带图标的卡片
  const renderSectionCard = (
    icon: string,
    iconColor: string,
    iconBg: string,
    title: string,
    children: React.ReactNode,
    extraPadding: boolean = true
  ) => (
    <View className={`bg-white rounded-2xl mb-4 shadow-sm ${extraPadding ? 'p-5' : ''}`}>
      <View className="flex-row items-center gap-3 mb-4 pb-3 border-b border-gray-100">
        <View className={`w-10 h-10 rounded-xl ${iconBg} items-center justify-center`}>
          <Feather name={icon as any} size={20} color={iconColor} />
        </View>
        <Text className="text-lg font-bold text-gray-900 flex-1">{title}</Text>
      </View>
      {children}
    </View>
  );

  return (
    <Screen>
      <ScrollView className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="bg-white px-5 pt-6 pb-5 border-b border-gray-100 shadow-sm">
          <Text className="text-3xl font-bold text-gray-900">{t('trends.title')}</Text>
          <Text className="text-base text-gray-500 mt-2">{t('trends.subtitle')}</Text>
        </View>

        {/* Input Section */}
        <View className="p-5">
          <View className="bg-white rounded-2xl p-5 shadow-sm mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-3">关键词/话题</Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-gray-900 text-base"
              placeholder={t('trends.keyword')}
              placeholderTextColor="#9CA3AF"
              value={keyword}
              onChangeText={setKeyword}
              autoCapitalize="none"
              autoCorrect={false}
            />

            {/* Platform Selection */}
            <Text className="text-sm font-semibold text-gray-700 mt-5 mb-3">平台</Text>
            <View className="flex-row gap-2">
              {(['tiktok', 'instagram', 'youtube'] as PlatformType[]).map((p) => (
                <TouchableOpacity
                  key={p}
                  className={`flex-1 py-3 rounded-xl border-2 transition-all ${
                    platform === p
                      ? 'bg-blue-500 border-blue-500 shadow-md'
                      : 'bg-white border-gray-200'
                  }`}
                  onPress={() => setPlatform(p)}
                >
                  <Text
                    className={`text-center text-sm font-bold ${
                      platform === p ? 'text-white' : 'text-gray-600'
                    }`}
                  >
                    {p === 'tiktok' ? 'TikTok' : p === 'instagram' ? 'Instagram' : 'YouTube'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Analyze Button */}
          <TouchableOpacity
            className={`py-4 rounded-2xl flex-row items-center justify-center gap-3 shadow-lg ${
              !keyword.trim() || isAnalyzing ? 'bg-gray-300 shadow-none' : 'bg-blue-500'
            }`}
            onPress={handleAnalyze}
            disabled={!keyword.trim() || isAnalyzing}
          >
            {isAnalyzing ? (
              <>
                <ActivityIndicator color="white" size="small" />
                <Text className="text-white font-bold text-lg">{t('trends.analyzing')}</Text>
              </>
            ) : (
              <>
                <Feather name="trending-up" size={20} color="white" />
                <Text className="text-white font-bold text-lg">{t('trends.analyze')}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Results */}
        {report && (
          <View className="px-5 pb-10">
            {/* 标题分隔 */}
            <View className="flex-row items-center gap-2 mb-5">
              <View className="h-8 w-1 bg-blue-500 rounded-full" />
              <Text className="text-2xl font-bold text-gray-900">分析结果</Text>
            </View>

            {/* AI Insights - 更突出 */}
            {renderSectionCard(
              'brain',
              '#8B5CF6',
              'bg-purple-100',
              '核心洞察',
              <>
                <View className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                  <Text className="text-base text-gray-800 leading-relaxed">
                    {report.insights.summary}
                  </Text>
                </View>
                
                <View className="flex-row gap-3 mt-4">
                  <View className="flex-1 bg-green-50 rounded-xl p-4 border border-green-100">
                    <Text className="text-xs font-bold text-green-700 mb-1">趋势分数</Text>
                    <Text className="text-2xl font-bold text-green-600">{report.insights.trendScore}/100</Text>
                  </View>
                  <View className="flex-1 bg-blue-50 rounded-xl p-4 border border-blue-100">
                    <Text className="text-xs font-bold text-blue-700 mb-1">机会等级</Text>
                    <Text className="text-lg font-bold text-blue-600 uppercase">{report.insights.opportunityLevel}</Text>
                  </View>
                </View>
              </>
            )}

            {/* 爆款潜力 - 独立展示 */}
            {report.viralPotential && (
              <View className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-5 mb-4 border-2 border-yellow-200">
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center gap-2">
                    <Feather name="zap" size={20} color="#F59E0B" />
                    <Text className="text-lg font-bold text-yellow-800">爆款潜力</Text>
                  </View>
                  <Text className="text-2xl font-bold text-yellow-600">{report.viralPotential.score}/10</Text>
                </View>
                <View className="w-full h-4 bg-yellow-200 rounded-full overflow-hidden mb-3">
                  <View
                    className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
                    style={{ width: `${report.viralPotential.score * 10}%` }}
                  />
                </View>
                {report.viralPotential.factors && report.viralPotential.factors.length > 0 && (
                  <View className="mb-2">
                    <Text className="text-xs font-bold text-yellow-800 mb-2">关键因素</Text>
                    <View className="flex-row flex-wrap gap-2">
                      {report.viralPotential.factors.map((factor, index) => (
                        <View key={index} className="bg-yellow-100 px-3 py-1.5 rounded-full">
                          <Text className="text-xs text-yellow-800">• {factor}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
                {report.viralPotential.tips && report.viralPotential.tips.length > 0 && (
                  <View>
                    <Text className="text-xs font-bold text-yellow-800 mb-2">实用建议</Text>
                    {report.viralPotential.tips.map((tip, index) => (
                      <View key={index} className="flex-row gap-2 mb-1">
                        <Feather name="check-circle" size={14} color="#F59E0B" />
                        <Text className="text-xs text-yellow-800 flex-1">{tip}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* Recommended Topics */}
            {report.recommendedTopics && report.recommendedTopics.length > 0 && (
              renderSectionCard(
                'trending-up',
                '#10B981',
                'bg-green-100',
                '热门话题',
                <View className="gap-3">
                  {report.recommendedTopics.slice(0, 5).map((topic, index) => {
                    const badgeStyle = getTopicBadgeStyle((topic as any).type);
                    return (
                      <View
                        key={index}
                        className="p-4 bg-gray-50 rounded-xl border border-gray-100"
                      >
                        <View className="flex-row items-center justify-between mb-2">
                          <Text className="text-base font-bold text-gray-900 flex-1 mr-2">{topic.topic}</Text>
                          <View
                            className="px-3 py-1 rounded-full"
                            style={{ backgroundColor: badgeStyle.bg }}
                          >
                            <Text
                              className="text-xs font-bold"
                              style={{ color: badgeStyle.text }}
                            >
                              {(topic as any).type === 'hot'
                                ? '🔥 爆款'
                                : (topic as any).type === 'rising'
                                ? '📈 上升'
                                : '➡️ 稳定'}
                            </Text>
                          </View>
                        </View>
                        {(topic as any).reason && (
                          <Text className="text-sm text-gray-500 leading-relaxed">
                            💡 {(topic as any).reason}
                          </Text>
                        )}
                      </View>
                    );
                  })}
                </View>
              )
            )}

            {/* Content Ideas */}
            {report.contentIdeas && report.contentIdeas.length > 0 && (
              renderSectionCard(
                'lightbulb',
                '#F59E0B',
                'bg-yellow-100',
                '内容创意',
                <View className="gap-3">
                  {report.contentIdeas.map((idea, index) => (
                    <View
                      key={index}
                      className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-100"
                    >
                      <View className="flex-row items-center gap-2 mb-2">
                        <View className="w-6 h-6 bg-yellow-400 rounded-full items-center justify-center">
                          <Text className="text-xs font-bold text-white">{index + 1}</Text>
                        </View>
                        <Text className="text-base font-bold text-yellow-800">{idea.type}</Text>
                      </View>
                      <Text className="text-sm text-yellow-900 leading-relaxed pl-8">
                        {idea.description}
                      </Text>
                    </View>
                  ))}
                </View>
              )
            )}

            {/* Action Plan */}
            {report.actionPlan && (
              renderSectionCard(
                'check-square',
                '#3B82F6',
                'bg-blue-100',
                '行动计划',
                <View className="gap-4">
                  {report.actionPlan.map((action, index) => {
                    const priorityStyle = getPriorityStyle(action.priority);
                    return (
                      <View
                        key={index}
                        className="p-4 bg-blue-50 rounded-xl border border-blue-100"
                      >
                        <View className="flex-row items-start justify-between mb-3">
                          <Text className="text-base font-bold text-blue-900 flex-1 mr-2">{action.title}</Text>
                          <View
                            className="px-3 py-1.5 rounded-full"
                            style={{ backgroundColor: priorityStyle.bg }}
                          >
                            <Text
                              className="text-xs font-bold"
                              style={{ color: priorityStyle.text }}
                            >
                              {priorityStyle.label}
                            </Text>
                          </View>
                        </View>
                        <Text className="text-sm text-blue-800 leading-relaxed mb-3">{action.description}</Text>
                        {action.steps && action.steps.length > 0 && (
                          <View>
                            <Text className="text-xs font-bold text-blue-700 mb-2 flex-row items-center gap-1">
                              <Feather name="list" size={12} />
                              <Text>执行步骤</Text>
                            </Text>
                            {action.steps.map((step, stepIndex) => (
                              <View key={stepIndex} className="flex-row gap-2 mb-1.5 pl-2">
                                <View className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2" />
                                <Text className="text-sm text-blue-700 flex-1">{step}</Text>
                              </View>
                            ))}
                          </View>
                        )}
                        {action.impact && (
                          <View className="mt-3 pt-3 border-t border-blue-200">
                            <Text className="text-xs font-bold text-blue-700 mb-1">预期影响</Text>
                            <Text className="text-sm text-blue-600">{action.impact}</Text>
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              )
            )}

            {/* Hashtag Strategy */}
            {report.hashtagStrategy && (
              renderSectionCard(
                'hash',
                '#EC4899',
                'bg-pink-100',
                '标签策略',
                <>
                  <View className="mb-4">
                    <Text className="text-sm font-bold text-pink-700 mb-2 flex-row items-center gap-1">
                      <Feather name="star" size={14} />
                      <Text>核心标签</Text>
                    </Text>
                    <View className="flex-row flex-wrap gap-2">
                      {report.hashtagStrategy.primary.map((tag, index) => (
                        <View
                          key={index}
                          className="px-4 py-2 bg-pink-100 rounded-full border border-pink-200"
                        >
                          <Text className="text-sm font-bold text-pink-700">#{tag}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                  
                  <View className="mb-4">
                    <Text className="text-sm font-bold text-gray-700 mb-2 flex-row items-center gap-1">
                      <Feather name="tag" size={14} />
                      <Text>辅助标签</Text>
                    </Text>
                    <View className="flex-row flex-wrap gap-2">
                      {report.hashtagStrategy.secondary.map((tag, index) => (
                        <View
                          key={index}
                          className="px-3 py-1.5 bg-gray-100 rounded-full"
                        >
                          <Text className="text-sm text-gray-600">#{tag}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                  
                  {report.hashtagStrategy.trending && report.hashtagStrategy.trending.length > 0 && (
                    <View>
                      <Text className="text-sm font-bold text-orange-700 mb-2 flex-row items-center gap-1">
                        <Feather name="trending-up" size={14} />
                        <Text>趋势标签</Text>
                      </Text>
                      <View className="flex-row flex-wrap gap-2">
                        {report.hashtagStrategy.trending.map((tag, index) => (
                          <View
                            key={index}
                            className="px-3 py-1.5 bg-orange-50 rounded-full border border-orange-200"
                          >
                            <Text className="text-sm text-orange-700">#{tag}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                </>
              )
            )}

            {/* Optimal Timing */}
            {report.optimalTiming && (
              renderSectionCard(
                'clock',
                '#06B6D4',
                'bg-cyan-100',
                '最佳发布时间',
                <View className="gap-4">
                  <View className="flex-row items-center gap-3 p-4 bg-cyan-50 rounded-xl border border-cyan-100">
                    <View className="w-12 h-12 bg-cyan-100 rounded-xl items-center justify-center">
                      <Feather name="calendar" size={24} color="#06B6D4" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-xs font-bold text-cyan-700 mb-1">最佳发布日期</Text>
                      <Text className="text-base font-bold text-cyan-900">{report.optimalTiming.bestDays.join(', ')}</Text>
                    </View>
                  </View>
                  
                  <View className="flex-row items-center gap-3 p-4 bg-cyan-50 rounded-xl border border-cyan-100">
                    <View className="w-12 h-12 bg-cyan-100 rounded-xl items-center justify-center">
                      <Feather name="clock" size={24} color="#06B6D4" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-xs font-bold text-cyan-700 mb-1">最佳发布时间</Text>
                      <Text className="text-base font-bold text-cyan-900">{report.optimalTiming.bestTimes.join(', ')}</Text>
                    </View>
                  </View>
                  
                  {report.optimalTiming.reasoning && (
                    <View className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <Text className="text-xs font-bold text-gray-700 mb-2 flex-row items-center gap-1">
                        <Feather name="info" size={14} />
                        <Text>原因说明</Text>
                      </Text>
                      <Text className="text-sm text-gray-600 leading-relaxed">
                        {report.optimalTiming.reasoning}
                      </Text>
                    </View>
                  )}
                </View>
              )
            )}

            {/* 竞争程度 */}
            <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-3">
                  <View className="w-10 h-10 rounded-xl bg-gray-100 items-center justify-center">
                    <Feather name="bar-chart-2" size={20} color="#6B7280" />
                  </View>
                  <View>
                    <Text className="text-sm font-bold text-gray-700">竞争程度</Text>
                    <Text className="text-2xl font-bold text-gray-900 capitalize">{report.competitionLevel}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* 最终建议 */}
            <View className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-5 mb-4 shadow-lg">
              <View className="flex-row items-center gap-3 mb-3">
                <View className="w-10 h-10 rounded-xl bg-white/20 items-center justify-center">
                  <Feather name="award" size={20} color="white" />
                </View>
                <Text className="text-lg font-bold text-white">最终建议</Text>
              </View>
              <Text className="text-base text-white/95 leading-relaxed">
                {report.recommendation}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}
