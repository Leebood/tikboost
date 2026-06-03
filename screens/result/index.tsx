/**
 * Result Screen - 策略生成结果页面
 * 展示钩子、脚本、分镜、BGM、CTA
 */
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Feather } from '@expo/vector-icons';
import { useSafeRouter, useSafeSearchParams } from '@/hooks/useSafeRouter';
import { Screen } from '@/components/Screen';
import { useTranslation } from '@/i18n';
import { IconContainer, IconColors } from '@/components/AppIcons';

interface ResultData {
  hook: string;
  script: string;
  storyboard: string[];
  bgm: string;
  cta: string;
}

export default function ResultScreen() {
  const router = useSafeRouter();
  const params = useSafeSearchParams<{ result?: ResultData }>();
  const { t } = useTranslation();
  const [result, setResult] = useState<ResultData | null>(null);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  useEffect(() => {
    if (params.result) {
      setResult(params.result);
    }
  }, [params.result]);

  const copyToClipboard = async (text: string, section: string) => {
    await Clipboard.setStringAsync(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleRegenerate = () => {
    router.back();
  };

  const handleNewStrategy = () => {
    router.navigate('/');
  };

  if (!result) {
    return (
      <Screen>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>No strategy result was returned. Please try again.</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleNewStrategy}>
            <IconContainer icon="home" size="md" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Your Strategy</Text>
          <TouchableOpacity onPress={handleRegenerate}>
            <IconContainer icon="rotate-ccw" size="md" />
          </TouchableOpacity>
        </View>

        {/* Success Badge */}
        <View style={styles.successBadge}>
          <IconContainer icon="check-circle" size="sm" color="#22C55E" />
          <Text style={styles.successText}>Strategy generated successfully</Text>
        </View>

        {/* Hook Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <IconContainer icon="zap" size="md" backgroundColor="#FEF3C7" />
              <Text style={styles.sectionTitle}>Hook</Text>
            </View>
            <TouchableOpacity onPress={() => copyToClipboard(result.hook, 'hook')}>
              <View style={styles.copyButton}>
                <Feather
                  name={copiedSection === 'hook' ? 'check' : 'copy'}
                  size={14}
                  color={IconColors.secondary}
                />
                <Text style={styles.copyButtonText}>
                  {copiedSection === 'hook' ? 'Copied' : 'Copy'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
          <Text style={styles.hookText}>{result.hook}</Text>
        </View>

        {/* Script Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <IconContainer icon="align-left" size="md" backgroundColor="#DBEAFE" />
              <Text style={styles.sectionTitle}>Script</Text>
            </View>
            <TouchableOpacity onPress={() => copyToClipboard(result.script, 'script')}>
              <View style={styles.copyButton}>
                <Feather
                  name={copiedSection === 'script' ? 'check' : 'copy'}
                  size={14}
                  color={IconColors.secondary}
                />
                <Text style={styles.copyButtonText}>
                  {copiedSection === 'script' ? 'Copied' : 'Copy'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
          <Text style={styles.scriptText}>{result.script}</Text>
        </View>

        {/* Storyboard Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <IconContainer icon="layout" size="md" backgroundColor="#F3E8FF" />
              <Text style={styles.sectionTitle}>Storyboard</Text>
            </View>
            <TouchableOpacity
              onPress={() => copyToClipboard(result.storyboard.join('\n'), 'storyboard')}
            >
              <View style={styles.copyButton}>
                <Feather
                  name={copiedSection === 'storyboard' ? 'check' : 'copy'}
                  size={14}
                  color={IconColors.secondary}
                />
                <Text style={styles.copyButtonText}>
                  {copiedSection === 'storyboard' ? 'Copied' : 'Copy'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
          {result.storyboard.map((scene, index) => (
            <View key={index} style={styles.sceneItem}>
              <View style={styles.sceneNumber}>
                <Text style={styles.sceneNumberText}>{index + 1}</Text>
              </View>
              <Text style={styles.sceneText}>{scene}</Text>
            </View>
          ))}
        </View>

        {/* BGM Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <IconContainer icon="music" size="md" backgroundColor="#FCE7F3" />
              <Text style={styles.sectionTitle}>BGM Recommendation</Text>
            </View>
            <TouchableOpacity onPress={() => copyToClipboard(result.bgm, 'bgm')}>
              <View style={styles.copyButton}>
                <Feather
                  name={copiedSection === 'bgm' ? 'check' : 'copy'}
                  size={14}
                  color={IconColors.secondary}
                />
                <Text style={styles.copyButtonText}>
                  {copiedSection === 'bgm' ? 'Copied' : 'Copy'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
          <Text style={styles.bgmText}>{result.bgm}</Text>
        </View>

        {/* CTA Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <IconContainer icon="arrow-right-circle" size="md" backgroundColor="#D1FAE5" />
              <Text style={styles.sectionTitle}>CTA</Text>
            </View>
            <TouchableOpacity onPress={() => copyToClipboard(result.cta, 'cta')}>
              <View style={styles.copyButton}>
                <Feather
                  name={copiedSection === 'cta' ? 'check' : 'copy'}
                  size={14}
                  color={IconColors.secondary}
                />
                <Text style={styles.copyButtonText}>
                  {copiedSection === 'cta' ? 'Copied' : 'Copy'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
          <Text style={styles.ctaText}>{result.cta}</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.regenerateButton} onPress={handleRegenerate}>
            <IconContainer icon="refresh-cw" size="sm" color="#111111" />
            <Text style={styles.regenerateButtonText}>Regenerate</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.newButton} onPress={handleNewStrategy}>
            <IconContainer icon="plus" size="sm" color="#FFFFFF" />
            <Text style={styles.newButtonText}>New Strategy</Text>
          </TouchableOpacity>
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <IconContainer icon="info" size="sm" color={IconColors.muted} />
          <Text style={styles.disclaimerText}>
            AI generated strategy, for reference only
          </Text>
        </View>

        {/* Bottom Padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: IconColors.secondary,
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
  successBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
  },
  successText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#22C55E',
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '600',
    color: '#111111',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#F7F7F7',
    borderRadius: 8,
  },
  copyButtonText: {
    marginLeft: 4,
    fontSize: 12,
    color: IconColors.secondary,
  },
  hookText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111111',
    lineHeight: 26,
  },
  scriptText: {
    fontSize: 15,
    color: '#444444',
    lineHeight: 24,
  },
  sceneItem: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  sceneNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#111111',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sceneNumberText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  sceneText: {
    flex: 1,
    fontSize: 14,
    color: '#444444',
    lineHeight: 22,
  },
  bgmText: {
    fontSize: 15,
    color: '#444444',
    lineHeight: 24,
  },
  ctaText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111111',
    lineHeight: 24,
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  regenerateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    backgroundColor: '#F7F7F7',
    borderRadius: 12,
    gap: 8,
  },
  regenerateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111111',
  },
  newButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    backgroundColor: '#111111',
    borderRadius: 12,
    gap: 8,
  },
  newButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  disclaimerText: {
    marginLeft: 6,
    fontSize: 12,
    color: IconColors.muted,
    textAlign: 'center',
  },
  bottomPadding: {
    height: 40,
  },
});
