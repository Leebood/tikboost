/**
 * Analysis Screen - 分析加载页面
 * 显示分析进度，等待工作流返回
 */
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useSafeRouter, useSafeSearchParams } from '@/hooks/useSafeRouter';
import { Screen } from '@/components/Screen';
import { useTranslation } from '@/i18n';
import { IconContainer, IconColors } from '@/components/AppIcons';
import { getBackendBaseUrl } from '@/utils/Environment';

type AnalysisStep = 'uploading' | 'analyzing' | 'generating' | 'complete' | 'error';

export default function AnalysisScreen() {
  const router = useSafeRouter();
  const { t } = useTranslation();
  const params = useSafeSearchParams<{
    taskId?: string;
  }>();

  const [currentStep, setCurrentStep] = useState<AnalysisStep>('uploading');
  const [progress, setProgress] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(0));

  const taskId = params.taskId || '';

  useEffect(() => {
    // 开始淡入动画
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // 开始分析流程
    runAnalysis();
  }, []);

  const runAnalysis = async () => {
    try {
      if (!taskId) {
        throw new Error('Missing analysis task ID.');
      }

      setCurrentStep('analyzing');
      setProgress(35);

      const startedAt = Date.now();
      const timeoutMs = 120000;

      while (Date.now() - startedAt < timeoutMs) {
        const response = await fetch(`${getBackendBaseUrl()}/api/v1/analysis/status/${taskId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Unable to check analysis status.');
        }

        const status = data.status || data.data?.status;
        const result = data.result || data.data?.result || data.data?.strategy;

        if (status === 'generating' || status === 'processing') {
          setCurrentStep('generating');
          setProgress(70);
        }

        if (result) {
          setCurrentStep('complete');
          setProgress(100);
          await delay(300);
          router.replace('/result', { result });
          return;
        }

        if (status === 'completed' || status === 'complete') {
          throw new Error('Analysis completed without a strategy result.');
        }

        if (status === 'failed' || status === 'error') {
          throw new Error(data.error || data.data?.error || 'Analysis failed.');
        }

        await delay(2000);
      }

      throw new Error('Analysis timed out. Please try again.');
    } catch (error) {
      console.error('Analysis failed:', error);
      setCurrentStep('error');
    }
  };

  const getStepConfig = () => {
    switch (currentStep) {
      case 'uploading':
        return {
          icon: 'upload-cloud',
          title: 'Uploading Image',
          description: 'Securely uploading your product image...',
          progress: 20,
        };
      case 'analyzing':
        return {
          icon: 'search',
          title: 'Analyzing Product',
          description: 'Identifying product features and target audience...',
          progress: 50,
        };
      case 'generating':
        return {
          icon: 'cpu',
          title: 'Generating Strategy',
          description: 'Creating your TikTok strategy with hooks, scripts, and BGM...',
          progress: 80,
        };
      case 'complete':
        return {
          icon: 'check-circle',
          title: 'Complete!',
          description: 'Your strategy is ready...',
          progress: 100,
        };
      case 'error':
        return {
          icon: 'alert-circle',
          title: 'Analysis Failed',
          description: 'Something went wrong. Please try again.',
          progress: 0,
        };
      default:
        return {
          icon: 'loader',
          title: 'Processing...',
          description: 'Please wait...',
          progress: 0,
        };
    }
  };

  const stepConfig = getStepConfig();

  const handleRetry = () => {
    setCurrentStep('uploading');
    setProgress(0);
    runAnalysis();
  };

  const handleGoBack = () => {
    router.navigate('/');
  };

  return (
    <Screen>
      <View style={styles.container}>
        {/* Progress Circle */}
        <View style={styles.progressContainer}>
          <View style={styles.progressCircle}>
            <View style={styles.progressBackground} />
            <View
              style={[
                styles.progressFill,
                { width: `${progress}%` },
              ]}
            />
            <View style={styles.progressCenter}>
              <IconContainer
                icon={stepConfig.icon as any}
                size="xl"
                color={currentStep === 'error' ? '#EF4444' : '#111111'}
              />
            </View>
          </View>
        </View>

        {/* Step Info */}
        <Animated.View style={[styles.stepInfo, { opacity: fadeAnim }]}>
          <Text style={styles.stepTitle}>{stepConfig.title}</Text>
          <Text style={styles.stepDescription}>{stepConfig.description}</Text>
        </Animated.View>

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${progress}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>{progress}%</Text>
        </View>

        {/* Error Actions */}
        {currentStep === 'error' && (
          <View style={styles.errorActions}>
            <View style={styles.actionButton}>
              <IconContainer icon="refresh-cw" size="sm" />
              <Text
                style={styles.actionButtonTextPrimary}
                onPress={handleRetry}
              >
                Try Again
              </Text>
            </View>
            <View style={styles.actionButton}>
              <IconContainer icon="arrow-left" size="sm" />
              <Text
                style={styles.actionButtonTextSecondary}
                onPress={handleGoBack}
              >
                Go Back
              </Text>
            </View>
          </View>
        )}

        {/* Loading Animation */}
        {currentStep !== 'error' && (
          <View style={styles.dotsContainer}>
            <View style={styles.dot} />
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
          </View>
        )}
      </View>
    </Screen>
  );
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  progressContainer: {
    marginBottom: 48,
  },
  progressCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#F7F7F7',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  progressBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 80,
    backgroundColor: '#F0F0F0',
  },
  progressFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    backgroundColor: '#E5E5E5',
  },
  progressCenter: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepInfo: {
    alignItems: 'center',
    marginBottom: 32,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 8,
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: 15,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
  },
  progressBarContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#F0F0F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#111111',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111111',
    width: 40,
    textAlign: 'right',
  },
  errorActions: {
    marginTop: 32,
    alignItems: 'center',
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  actionButtonTextPrimary: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#111111',
  },
  actionButtonTextSecondary: {
    marginLeft: 8,
    fontSize: 16,
    color: '#666666',
  },
  dotsContainer: {
    flexDirection: 'row',
    marginTop: 48,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E5E5',
  },
  dotActive: {
    backgroundColor: '#111111',
    width: 24,
  },
});
