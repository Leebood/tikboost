import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import * as Linking from 'expo-linking';
import { Screen } from '@/components/Screen';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import {
  searchVideos,
  getExecutionReport,
  analyzeVideoFromUrl,
  getDeepAnalysisReport,
} from '@/services/VideoService';
import {
  checkDeepAnalysisAccess,
  incrementDeepAnalysisUsage,
  getUsageCount,
  SUBSCRIPTION_LIMITS,
} from '@/services/SubscriptionService';
import { useAuth } from '@/contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome6 } from '@expo/vector-icons';

type SearchType = 'keyword' | 'url';

interface SearchResult {
  keyword?: string;
  url?: string;
  videos: Array<{
    id: string;
    title: string;
    views: string;
    likes: string;
    hashtags: string[];
    thumbnail?: string;
  }>;
}

interface ExecutionReport {
  id: string;
  scriptStructure?: {
    hook?: string;
    intro?: string;
    body?: string;
    cta?: string;
  };
  suggestedHashtags?: string[];
  optimalPostingTimes?: string[];
  engagementPrediction?: string;
}

interface DeepAnalysisReport {
  id: string;
  videoDescription?: string;
  captions?: string[];
  sceneTimestamps?: Array<{ timestamp: string; description: string }>;
  keyElements?: string[];
  contentType?: string;
  scriptStructure?: {
    hook?: string;
    intro?: string;
    body?: string;
    cta?: string;
  };
  viralElements?: string[];
  musicInfo?: string;
  competitorAnalysis?: {
    strengths?: string[];
    weaknesses?: string[];
    opportunities?: string[];
  };
  scriptCopy?: {
    hook?: string;
    mainMessage?: string;
    callToAction?: string;
  };
}

export default function SearchScreen() {
  const router = useSafeRouter();
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState<SearchType>('keyword');
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [deepAnalyzing, setDeepAnalyzing] = useState(false);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [report, setReport] = useState<ExecutionReport | null>(null);
  const [deepReport, setDeepReport] = useState<DeepAnalysisReport | null>(null);
  const [searchHistory, setSearchHistory] = useState<Array<{ query: string; type: SearchType; timestamp: number }>>([]);
  const [showDeepAnalysis, setShowDeepAnalysis] = useState(false);

  const loadHistory = useCallback(async () => {
    try {
      const historyStr = await AsyncStorage.getItem('searchHistory');
      if (historyStr) {
        setSearchHistory(JSON.parse(historyStr));
      }
    } catch {}
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleSearch = async () => {
    if (!query.trim()) {
      Alert.alert('Error', 'Please enter a search query');
      return;
    }

    setLoading(true);
    setReport(null);
    setDeepReport(null);
    setShowDeepAnalysis(false);

    try {
      const result = await searchVideos(searchType === 'keyword' ? query : '', searchType === 'url' ? query : '');
      setSearchResult(result);

      if (result.videos.length > 0) {
        // Save to history
        const newHistory = [{ query, type: searchType, timestamp: Date.now() }, ...searchHistory.slice(0, 19)];
        await AsyncStorage.setItem('searchHistory', JSON.stringify(newHistory));
        loadHistory();

        const reportResult = await getExecutionReport(result.videos[0].id);
        setReport(reportResult);
      }
    } catch (error) {
      Alert.alert('Analysis Failed', (error as Error).message || 'Unable to analyze this video source.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!searchResult?.videos[0]?.id) {
      Alert.alert('Error', 'Please search for a video first');
      return;
    }

    setAnalyzing(true);
    try {
      const result = await analyzeVideoFromUrl(searchResult.videos[0].id);
      setReport(result);
    } catch (error) {
      Alert.alert('Analysis Failed', (error as Error).message || 'Unable to refresh this analysis.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDeepAnalysis = async () => {
    if (!searchResult?.videos[0]?.id) {
      Alert.alert('Error', 'Please search for a video first');
      return;
    }

    // Check subscription for deep analysis
    const canUse = await checkDeepAnalysisAccess();
    if (!canUse) {
      const used = await getUsageCount('deepAnalysis');
      const total = SUBSCRIPTION_LIMITS.FREE.deepAnalysis;
      Alert.alert(
        'Usage Limit Reached',
        `You have used all ${used}/${total} deep analysis this month.\n\nUpgrade to Pro for more analysis!`,
        [
          { text: 'OK' },
          { 
            text: 'Upgrade', 
            onPress: () => router.push('/settings') 
          }
        ]
      );
      return;
    }

    setDeepAnalyzing(true);
    setShowDeepAnalysis(true);
    try {
      const result = await getDeepAnalysisReport(searchResult.videos[0].id);
      setDeepReport(result);
      incrementDeepAnalysisUsage();
    } catch (error) {
      Alert.alert('Deep Analysis Failed', (error as Error).message || 'Unable to complete deep analysis.');
    } finally {
      setDeepAnalyzing(false);
    }
  };

  const handleHistoryPress = (item: { query: string; type: SearchType }) => {
    setQuery(item.query);
    setSearchType(item.type);
    setSearchResult(null);
    setReport(null);
    setDeepReport(null);
    setShowDeepAnalysis(false);
  };

  const handleOpenUrl = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <Screen>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={handleSearch} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>Analyze</Text>
          <Text style={styles.subtitle}>Break down video links, keywords, hooks, structure, and reusable strategy patterns.</Text>
        </View>

        {/* Search Type Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, searchType === 'keyword' && styles.activeTab]}
            onPress={() => setSearchType('keyword')}
          >
            <FontAwesome6
              name="hashtag"
              size={16}
              color={searchType === 'keyword' ? '#FE2C55' : '#666'}
            />
            <Text style={[styles.tabText, searchType === 'keyword' && styles.activeTabText]}>
              Keyword
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, searchType === 'url' && styles.activeTab]}
            onPress={() => setSearchType('url')}
          >
            <FontAwesome6
              name="link"
              size={16}
              color={searchType === 'url' ? '#FE2C55' : '#666'}
            />
            <Text style={[styles.tabText, searchType === 'url' && styles.activeTabText]}>
              URL
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search Input */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder={searchType === 'keyword' ? 'Enter keywords...' : 'Paste video URL...'}
            placeholderTextColor="#666"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <FontAwesome6 name="magnifying-glass" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* History */}
        {searchHistory.length > 0 && !searchResult && (
          <View style={styles.historySection}>
            <Text style={styles.sectionTitle}>Recent Searches</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {searchHistory.slice(0, 10).map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.historyItem}
                  onPress={() => handleHistoryPress(item)}
                >
                  <FontAwesome6
                    name={item.type === 'keyword' ? 'hashtag' : 'link'}
                    size={12}
                    color="#666"
                  />
                  <Text style={styles.historyText} numberOfLines={1}>
                    {item.query}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Loading */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FE2C55" />
            <Text style={styles.loadingText}>Searching...</Text>
          </View>
        )}

        {/* Search Results */}
        {searchResult && searchResult.videos.length > 0 && (
          <View style={styles.resultsSection}>
            <Text style={styles.sectionTitle}>
              {searchResult.keyword ? `Keyword analysis for "${searchResult.keyword}"` : 'Video Analysis'}
            </Text>

            {/* Video Card */}
            <View style={styles.videoCard}>
              {searchResult.videos[0].thumbnail && (
                <View style={styles.thumbnailPlaceholder}>
                  <FontAwesome6 name="play" size={24} color="#FE2C55" />
                </View>
              )}
              <View style={styles.videoInfo}>
                <Text style={styles.videoTitle} numberOfLines={2}>
                  {searchResult.videos[0].title}
                </Text>
                <View style={styles.videoStats}>
                  <Text style={styles.statText}>
                    <FontAwesome6 name="eye" size={12} color="#666" /> {searchResult.videos[0].views}
                  </Text>
                  <Text style={styles.statText}>
                    <FontAwesome6 name="heart" size={12} color="#FE2C55" /> {searchResult.videos[0].likes}
                  </Text>
                </View>
                {searchResult.videos[0].hashtags.length > 0 && (
                  <View style={styles.hashtags}>
                    {searchResult.videos[0].hashtags.slice(0, 5).map((tag, idx) => (
                      <View key={idx} style={styles.hashtag}>
                        <Text style={styles.hashtagText}>#{tag}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.actionButton, styles.secondaryButton]}
                onPress={handleAnalyze}
                disabled={analyzing}
              >
                {analyzing ? (
                  <ActivityIndicator size="small" color="#FE2C55" />
                ) : (
                  <>
                    <FontAwesome6 name="brain" size={16} color="#FE2C55" />
                    <Text style={styles.secondaryButtonText}>Analyze</Text>
                  </>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.primaryButton]}
                onPress={handleDeepAnalysis}
                disabled={deepAnalyzing}
              >
                {deepAnalyzing ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <>
                    <FontAwesome6 name="microscope" size={16} color="#FFF" />
                    <Text style={styles.primaryButtonText}>Deep Analysis</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Basic Report */}
            {report && (
              <View style={styles.reportSection}>
                <Text style={styles.reportTitle}>Strategy Report</Text>

                {/* Script Structure */}
                {report.scriptStructure && (
                  <View style={styles.reportCard}>
                    <Text style={styles.reportSubtitle}>Script Structure</Text>
                    {report.scriptStructure.hook && (
                      <View style={styles.scriptItem}>
                        <Text style={styles.scriptLabel}>Hook</Text>
                        <Text style={styles.scriptText}>{report.scriptStructure.hook}</Text>
                      </View>
                    )}
                    {report.scriptStructure.intro && (
                      <View style={styles.scriptItem}>
                        <Text style={styles.scriptLabel}>Intro</Text>
                        <Text style={styles.scriptText}>{report.scriptStructure.intro}</Text>
                      </View>
                    )}
                    {report.scriptStructure.body && (
                      <View style={styles.scriptItem}>
                        <Text style={styles.scriptLabel}>Body</Text>
                        <Text style={styles.scriptText}>{report.scriptStructure.body}</Text>
                      </View>
                    )}
                    {report.scriptStructure.cta && (
                      <View style={styles.scriptItem}>
                        <Text style={styles.scriptLabel}>CTA</Text>
                        <Text style={styles.scriptText}>{report.scriptStructure.cta}</Text>
                      </View>
                    )}
                  </View>
                )}

                {/* Hashtags */}
                {report.suggestedHashtags && report.suggestedHashtags.length > 0 && (
                  <View style={styles.reportCard}>
                    <Text style={styles.reportSubtitle}>Suggested Hashtags</Text>
                    <View style={styles.hashtagList}>
                      {report.suggestedHashtags.map((tag, idx) => (
                        <View key={idx} style={styles.suggestedHashtag}>
                          <Text style={styles.suggestedHashtagText}>#{tag}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* Posting Time */}
                {report.optimalPostingTimes && (
                  <View style={styles.reportCard}>
                    <Text style={styles.reportSubtitle}>Optimal Posting Times</Text>
                    <Text style={styles.reportText}>{report.optimalPostingTimes.join(', ')}</Text>
                  </View>
                )}

                {/* Engagement Prediction */}
                {report.engagementPrediction && (
                  <View style={styles.reportCard}>
                    <Text style={styles.reportSubtitle}>Engagement Prediction</Text>
                    <Text style={styles.reportText}>{report.engagementPrediction}</Text>
                  </View>
                )}
              </View>
            )}

            {/* Deep Analysis Report */}
            {showDeepAnalysis && (
              <View style={styles.reportSection}>
                <Text style={styles.reportTitle}>Deep Analysis</Text>

                {deepReport ? (
                  <>
                    {/* Video Description */}
                    {deepReport.videoDescription && (
                      <View style={styles.reportCard}>
                        <Text style={styles.reportSubtitle}>Video Description</Text>
                        <Text style={styles.reportText}>{deepReport.videoDescription}</Text>
                      </View>
                    )}

                    {/* Captions */}
                    {deepReport.captions && deepReport.captions.length > 0 && (
                      <View style={styles.reportCard}>
                        <Text style={styles.reportSubtitle}>Captions / Text</Text>
                        {deepReport.captions.map((caption, idx) => (
                          <Text key={idx} style={styles.reportText}>&ldquo;{caption}&rdquo;</Text>
                        ))}
                      </View>
                    )}

                    {/* Scene Timestamps */}
                    {deepReport.sceneTimestamps && deepReport.sceneTimestamps.length > 0 && (
                      <View style={styles.reportCard}>
                        <Text style={styles.reportSubtitle}>Scene Breakdown</Text>
                        {deepReport.sceneTimestamps.map((scene, idx) => (
                          <View key={idx} style={styles.sceneItem}>
                            <Text style={styles.sceneTimestamp}>{scene.timestamp}</Text>
                            <Text style={styles.sceneDescription}>{scene.description}</Text>
                          </View>
                        ))}
                      </View>
                    )}

                    {/* Key Elements */}
                    {deepReport.keyElements && deepReport.keyElements.length > 0 && (
                      <View style={styles.reportCard}>
                        <Text style={styles.reportSubtitle}>Key Visual Elements</Text>
                        <View style={styles.elementList}>
                          {deepReport.keyElements.map((element, idx) => (
                            <View key={idx} style={styles.elementItem}>
                              <FontAwesome6 name="circle" size={8} color="#25F4EE" />
                              <Text style={styles.elementText}>{element}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    )}

                    {/* Viral Elements */}
                    {deepReport.viralElements && deepReport.viralElements.length > 0 && (
                      <View style={styles.reportCard}>
                        <Text style={styles.reportSubtitle}>Viral Elements</Text>
                        <View style={styles.elementList}>
                          {deepReport.viralElements.map((element, idx) => (
                            <View key={idx} style={styles.elementItem}>
                              <FontAwesome6 name="fire" size={12} color="#FE2C55" />
                              <Text style={styles.elementText}>{element}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    )}

                    {/* Music Info */}
                    {deepReport.musicInfo && (
                      <View style={styles.reportCard}>
                        <Text style={styles.reportSubtitle}>Music / Audio</Text>
                        <View style={styles.musicInfo}>
                          <FontAwesome6 name="music" size={16} color="#25F4EE" />
                          <Text style={styles.reportText}>{deepReport.musicInfo}</Text>
                        </View>
                      </View>
                    )}

                    {/* Script Copy */}
                    {deepReport.scriptCopy && (
                      <View style={styles.reportCard}>
                        <Text style={styles.reportSubtitle}>Extracted Script Copy</Text>
                        {deepReport.scriptCopy.hook && (
                          <View style={styles.scriptCopyItem}>
                            <Text style={styles.scriptCopyLabel}>Hook</Text>
                            <Text style={styles.scriptCopyText}>{deepReport.scriptCopy.hook}</Text>
                          </View>
                        )}
                        {deepReport.scriptCopy.mainMessage && (
                          <View style={styles.scriptCopyItem}>
                            <Text style={styles.scriptCopyLabel}>Main Message</Text>
                            <Text style={styles.scriptCopyText}>{deepReport.scriptCopy.mainMessage}</Text>
                          </View>
                        )}
                        {deepReport.scriptCopy.callToAction && (
                          <View style={styles.scriptCopyItem}>
                            <Text style={styles.scriptCopyLabel}>Call to Action</Text>
                            <Text style={styles.scriptCopyText}>{deepReport.scriptCopy.callToAction}</Text>
                          </View>
                        )}
                      </View>
                    )}

                    {/* Competitor Analysis */}
                    {deepReport.competitorAnalysis && (
                      <View style={styles.reportCard}>
                        <Text style={styles.reportSubtitle}>Competitor Analysis</Text>
                        {deepReport.competitorAnalysis.strengths && deepReport.competitorAnalysis.strengths.length > 0 && (
                          <View style={styles.analysisSection}>
                            <Text style={styles.analysisLabel}>
                              <FontAwesome6 name="thumbs-up" size={12} color="#4CAF50" /> Strengths
                            </Text>
                            {deepReport.competitorAnalysis.strengths.map((item, idx) => (
                              <Text key={idx} style={styles.analysisText}>• {item}</Text>
                            ))}
                          </View>
                        )}
                        {deepReport.competitorAnalysis.weaknesses && deepReport.competitorAnalysis.weaknesses.length > 0 && (
                          <View style={styles.analysisSection}>
                            <Text style={styles.analysisLabel}>
                              <FontAwesome6 name="thumbs-down" size={12} color="#F44336" /> Weaknesses
                            </Text>
                            {deepReport.competitorAnalysis.weaknesses.map((item, idx) => (
                              <Text key={idx} style={styles.analysisText}>• {item}</Text>
                            ))}
                          </View>
                        )}
                        {deepReport.competitorAnalysis.opportunities && deepReport.competitorAnalysis.opportunities.length > 0 && (
                          <View style={styles.analysisSection}>
                            <Text style={styles.analysisLabel}>
                              <FontAwesome6 name="lightbulb" size={12} color="#FFC107" /> Opportunities
                            </Text>
                            {deepReport.competitorAnalysis.opportunities.map((item, idx) => (
                              <Text key={idx} style={styles.analysisText}>• {item}</Text>
                            ))}
                          </View>
                        )}
                      </View>
                    )}
                  </>
                ) : (
                  <View style={styles.noDeepReport}>
                    <Text style={styles.noDeepReportText}>Deep analysis will appear here</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        )}

        {/* Empty State */}
        {!loading && !searchResult && (
          <View style={styles.emptyState}>
            <FontAwesome6 name="magnifying-glass" size={48} color="#333" />
            <Text style={styles.emptyText}>
              Paste a video URL or enter a keyword to start an analysis
            </Text>
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 6,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 19,
    color: '#888888',
    marginTop: 6,
  },
  tabs: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: 'rgba(254, 44, 85, 0.1)',
    borderWidth: 1,
    borderColor: '#FE2C55',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#FE2C55',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    height: 48,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#FFF',
  },
  searchButton: {
    width: 48,
    height: 48,
    backgroundColor: '#FE2C55',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historySection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 12,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    marginRight: 8,
  },
  historyText: {
    fontSize: 12,
    color: '#666',
    maxWidth: 100,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  resultsSection: {
    padding: 16,
  },
  videoCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  thumbnailPlaceholder: {
    width: '100%',
    height: 180,
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  videoInfo: {
    gap: 8,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  videoStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statText: {
    fontSize: 14,
    color: '#666',
  },
  hashtags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  hashtag: {
    backgroundColor: 'rgba(254, 44, 85, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  hashtagText: {
    fontSize: 12,
    color: '#FE2C55',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  secondaryButton: {
    backgroundColor: 'rgba(254, 44, 85, 0.1)',
    borderWidth: 1,
    borderColor: '#FE2C55',
  },
  primaryButton: {
    backgroundColor: '#FE2C55',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FE2C55',
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  reportSection: {
    marginTop: 8,
  },
  reportCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 12,
  },
  reportSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#25F4EE',
    marginBottom: 8,
  },
  reportText: {
    fontSize: 14,
    color: '#CCC',
    lineHeight: 20,
  },
  scriptItem: {
    marginBottom: 8,
  },
  scriptLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 2,
  },
  scriptText: {
    fontSize: 14,
    color: '#FFF',
  },
  hashtagList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  suggestedHashtag: {
    backgroundColor: 'rgba(37, 244, 238, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  suggestedHashtagText: {
    fontSize: 13,
    color: '#25F4EE',
  },
  sceneItem: {
    flexDirection: 'row',
    marginBottom: 8,
    gap: 8,
  },
  sceneTimestamp: {
    fontSize: 12,
    color: '#FE2C55',
    fontWeight: '600',
  },
  sceneDescription: {
    flex: 1,
    fontSize: 13,
    color: '#CCC',
  },
  elementList: {
    gap: 6,
  },
  elementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  elementText: {
    fontSize: 14,
    color: '#FFF',
  },
  musicInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scriptCopyItem: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
  },
  scriptCopyLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#25F4EE',
    marginBottom: 4,
  },
  scriptCopyText: {
    fontSize: 14,
    color: '#FFF',
    lineHeight: 20,
  },
  analysisSection: {
    marginBottom: 12,
  },
  analysisLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 4,
  },
  analysisText: {
    fontSize: 13,
    color: '#CCC',
    marginLeft: 8,
  },
  noDeepReport: {
    padding: 20,
    alignItems: 'center',
  },
  noDeepReportText: {
    fontSize: 14,
    color: '#666',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  bottomPadding: {
    height: 40,
  },
});
