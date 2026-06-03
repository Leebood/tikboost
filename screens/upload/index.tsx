/**
 * Upload Screen - 产品图片上传页面
 * 纯白极简风格
 * 两大模式：电商模式、短视频模式
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  Modal,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Feather } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { useSafeRouter, useSafeSearchParams } from '@/hooks/useSafeRouter';
import { useTranslation } from '@/i18n';
import { getBackendBaseUrl } from '@/utils/Environment';
import { getTemplateById } from '@/services/TemplateService';
import { addGenerationHistoryItem } from '@/services/HistoryService';

import {
  hasUserAgreedToTerms,
  setUserAgreedToTerms,
  getRemainingFreeUsage,
  hasFreeUsageRemaining,
  incrementFreeUsage,
} from '@/services/SubscriptionService';
import { isImageSafe } from '@/utils/SensitiveWordsFilter';
import { PRIVACY_NOTICE } from '@/utils/PrivacyCompliance';

type DurationType = '15' | '30' | '60';
type StyleType = 'simple' | 'elegant' | 'funny' | 'suspenseful';
type ContentMode = 'ecommerce' | 'shortvideo';

export default function UploadScreen() {
  const router = useSafeRouter();
  const params = useSafeSearchParams<{
    templateId?: string;
    duration?: DurationType;
    style?: StyleType;
  }>();
  const { t } = useTranslation();

  // 状态
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [remainingFree, setRemainingFree] = useState(3);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [hasAgreed, setHasAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showParamsModal, setShowParamsModal] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);

  // 参数选择
  const [duration, setDuration] = useState<DurationType>('15');
  const [style, setStyle] = useState<StyleType>('simple');
  const [contentMode, setContentMode] = useState<ContentMode>('ecommerce');
  const selectedTemplate = getTemplateById(params.templateId);

  // 初始化
  useEffect(() => {
    const init = async () => {
      const agreed = await hasUserAgreedToTerms();
      setHasAgreed(agreed);
      if (!agreed) {
        setShowPrivacyModal(true);
      }
      const remaining = await getRemainingFreeUsage();
      setRemainingFree(remaining);
      if (params.duration) setDuration(params.duration);
      if (params.style) setStyle(params.style);
    };
    init();
  }, [params.duration, params.style]);

  const checkPrivacyStatus = useCallback(async () => {
    const agreed = await hasUserAgreedToTerms();
    setHasAgreed(agreed);
    if (!agreed) {
      setShowPrivacyModal(true);
    }
    return agreed;
  }, []);

  const loadFreeUsageCount = useCallback(async () => {
    const remaining = await getRemainingFreeUsage();
    setRemainingFree(remaining);
    return remaining;
  }, []);

  // 处理隐私同意
  const handlePrivacyAgree = async () => {
    await setUserAgreedToTerms(true);
    setHasAgreed(true);
    setShowPrivacyModal(false);
  };

  // 拍照
  const handleTakePhoto = async () => {
    const agreed = await checkPrivacyStatus();
    if (!agreed) return;

    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission Required', 'Camera permission is needed to take photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  // 从相册选择
  const handlePickImage = async () => {
    const agreed = await checkPrivacyStatus();
    if (!agreed) return;

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission Required', 'Photo library permission is needed to select images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  // 清除选择
  const handleClearImage = () => {
    setSelectedImage(null);
    setContentMode('ecommerce');
  };

  // 开始分析
  const handleStartAnalysis = async () => {
    if (!selectedImage) {
      Alert.alert('Error', 'Please select an image first');
      return;
    }

    if (!isImageSafe(selectedImage)) {
      Alert.alert('Content Not Allowed', 'This image contains prohibited content and cannot be processed.');
      return;
    }

    const hasUsage = await hasFreeUsageRemaining();
    if (!hasUsage) {
      setShowParamsModal(false);
      Alert.alert('No Free Usage', 'You have used all your free generations. Please upgrade to continue.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Upgrade', onPress: () => router.push('/settings') },
      ]);
      return;
    }

    setIsLoading(true);
    try {
      const requestBody = {
        imageUrl: selectedImage,
        duration: parseInt(duration),
        style,
        scene: contentMode,
        templateId: selectedTemplate?.id,
        templateCue: selectedTemplate?.promptCue,
      };

      const response = await fetch(`${getBackendBaseUrl()}/api/v1/analysis/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed');
      }

      await incrementFreeUsage();
      await loadFreeUsageCount();
      await addGenerationHistoryItem({
        taskId: data.taskId,
        mode: contentMode,
        duration: parseInt(duration),
        style,
        templateId: selectedTemplate?.id,
      });

      setShowParamsModal(false);
      router.push('/analysis', { taskId: data.taskId });
    } catch (error) {
      console.error('Analysis error:', error);
      Alert.alert('Error', (error as Error).message || 'Failed to start analysis');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Screen>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.pageTitle}>Create Strategy</Text>
              <Text style={styles.pageSubtitle}>Generate video strategy for your content</Text>
            </View>
            <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/settings')}>
              <Feather name="settings" size={20} color="#111111" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Usage Badge */}
        <TouchableOpacity style={styles.usageBadge} onPress={() => router.push('/settings')}>
          <Feather name="zap" size={16} color="#111111" />
          <Text style={styles.usageText}>{remainingFree} free generations left</Text>
        </TouchableOpacity>

        {selectedTemplate && (
          <View style={styles.templateBanner}>
            <View style={styles.templateBannerIcon}>
              <Feather name="layers" size={18} color="#111111" />
            </View>
            <View style={styles.templateBannerText}>
              <Text style={styles.templateBannerTitle}>{selectedTemplate.title}</Text>
              <Text style={styles.templateBannerSubtitle}>{selectedTemplate.bestFor}</Text>
            </View>
          </View>
        )}

        {/* Upload Area */}
        <View style={styles.uploadArea}>
          {!selectedImage ? (
            <TouchableOpacity style={styles.uploadPlaceholder} onPress={handlePickImage}>
              <View style={styles.uploadIconContainer}>
                <Feather name="upload" size={32} color="#111111" />
              </View>
              <Text style={styles.uploadText}>Upload Image</Text>
              <Text style={styles.uploadHint}>Tap to select from gallery</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.previewContainer}>
              <Image source={{ uri: selectedImage }} style={styles.previewImage} />
              <TouchableOpacity style={styles.clearButton} onPress={handleClearImage}>
                <Feather name="x" size={18} color="#FFFFFF" />
              </TouchableOpacity>
              {isDetecting && (
                <View style={styles.detectingOverlay}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.detectingText}>Analyzing...</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={handleTakePhoto}>
            <View style={styles.actionIcon}>
              <Feather name="camera" size={24} color="#111111" />
            </View>
            <Text style={styles.actionLabel}>Take Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handlePickImage}>
            <View style={styles.actionIcon}>
              <Feather name="image" size={24} color="#111111" />
            </View>
            <Text style={styles.actionLabel}>Choose from Library</Text>
          </TouchableOpacity>
        </View>

        {/* Mode Selection */}
        <View style={styles.modeSection}>
          <Text style={styles.sectionTitle}>Content Mode</Text>
          
          {/* E-commerce Mode */}
          <TouchableOpacity
            style={[styles.modeCard, contentMode === 'ecommerce' && styles.modeCardActive]}
            onPress={() => setContentMode('ecommerce')}
          >
            <View style={[styles.modeIcon, contentMode === 'ecommerce' && styles.modeIconActive]}>
              <Feather name="shopping-bag" size={24} color={contentMode === 'ecommerce' ? '#FFFFFF' : '#111111'} />
            </View>
            <View style={styles.modeText}>
              <Text style={[styles.modeTitle, contentMode === 'ecommerce' && styles.modeTitleActive]}>
                E-commerce
              </Text>
              <Text style={styles.modeSubtitle}>Product promotion with category-specific strategies</Text>
            </View>
            <Feather 
              name={contentMode === 'ecommerce' ? 'check-circle' : 'chevron-right'} 
              size={20} 
              color={contentMode === 'ecommerce' ? '#27AE60' : '#CCCCCC'} 
            />
          </TouchableOpacity>

          {/* Short Video Mode */}
          <TouchableOpacity
            style={[styles.modeCard, contentMode === 'shortvideo' && styles.modeCardActive]}
            onPress={() => setContentMode('shortvideo')}
          >
            <View style={[styles.modeIcon, contentMode === 'shortvideo' && styles.modeIconActive]}>
              <Feather name="play-circle" size={24} color={contentMode === 'shortvideo' ? '#FFFFFF' : '#111111'} />
            </View>
            <View style={styles.modeText}>
              <Text style={[styles.modeTitle, contentMode === 'shortvideo' && styles.modeTitleActive]}>
                Short Video
              </Text>
              <Text style={styles.modeSubtitle}>Viral content creation without specific product</Text>
            </View>
            <Feather 
              name={contentMode === 'shortvideo' ? 'check-circle' : 'chevron-right'} 
              size={20} 
              color={contentMode === 'shortvideo' ? '#27AE60' : '#CCCCCC'} 
            />
          </TouchableOpacity>
        </View>

        {/* Start Button */}
        <TouchableOpacity
          style={[styles.startButton, (!selectedImage || isDetecting) && styles.startButtonDisabled]}
          onPress={() => selectedImage && !isDetecting && setShowParamsModal(true)}
          disabled={!selectedImage || isDetecting}
        >
          <Text style={styles.startButtonText}>Generate Strategy</Text>
          <Feather name="arrow-right" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.searchLink} onPress={() => router.push('/templates')}>
          <Feather name="layers" size={16} color="#888888" />
          <Text style={styles.searchLinkText}>Browse strategy templates</Text>
        </TouchableOpacity>

        {/* Analyze Link */}
        <TouchableOpacity style={styles.searchLink} onPress={() => router.push('/search')}>
          <Feather name="search" size={16} color="#888888" />
          <Text style={styles.searchLinkText}>Analyze a video URL or keyword</Text>
        </TouchableOpacity>

        {/* Trends Link */}
        <TouchableOpacity style={styles.searchLink} onPress={() => router.push('/trends')}>
          <Feather name="trending-up" size={16} color="#888888" />
          <Text style={styles.searchLinkText}>Discover trending topics</Text>
        </TouchableOpacity>

        {/* Privacy Policy Link */}
        <TouchableOpacity style={styles.privacyPolicyLink} onPress={() => router.push('/privacy')}>
          <Text style={styles.privacyPolicyText}>Privacy Policy</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Privacy Modal */}
      <Modal visible={showPrivacyModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Feather name="lock" size={24} color="#111111" />
              <Text style={styles.modalTitle}>Privacy Notice</Text>
            </View>
            
            <ScrollView style={styles.modalBody}>
              <Text style={styles.privacyText}>{PRIVACY_NOTICE.content}</Text>
            </ScrollView>

            <TouchableOpacity style={styles.agreeButton} onPress={handlePrivacyAgree}>
              <Text style={styles.agreeButtonText}>I Understand & Agree</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Parameters Modal */}
      <Modal visible={showParamsModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Video Settings</Text>
              <TouchableOpacity onPress={() => setShowParamsModal(false)}>
                <Feather name="x" size={24} color="#111111" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScrollView}>
              {/* Mode Badge */}
              <View style={[
                styles.modeBadge,
                contentMode === 'shortvideo' && styles.modeBadgeVideo
              ]}>
                <Feather 
                  name={contentMode === 'ecommerce' ? 'shopping-bag' : 'play-circle'} 
                  size={14} 
                  color={contentMode === 'ecommerce' ? '#111111' : '#FFFFFF'} 
                />
                <Text style={[
                  styles.modeBadgeText,
                  contentMode === 'shortvideo' && styles.modeBadgeTextVideo
                ]}>
                  {contentMode === 'ecommerce' ? 'E-commerce Mode' : 'Short Video Mode'}
                </Text>
              </View>

              {/* Duration */}
              <Text style={styles.optionLabel}>Duration</Text>
              <View style={styles.optionRow}>
                {(['15', '30', '60'] as DurationType[]).map((d) => (
                  <TouchableOpacity
                    key={d}
                    style={[styles.optionButton, duration === d && styles.optionButtonActive]}
                    onPress={() => setDuration(d)}
                  >
                    <Text style={[styles.optionButtonText, duration === d && styles.optionButtonTextActive]}>
                      {d}s
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Style */}
              <Text style={styles.optionLabel}>Style</Text>
              <View style={styles.styleGrid}>
                {(['simple', 'elegant', 'funny', 'suspenseful'] as StyleType[]).map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={[styles.styleButton, style === s && styles.styleButtonActive]}
                    onPress={() => setStyle(s)}
                  >
                    <Text style={[styles.styleButtonText, style === s && styles.styleButtonTextActive]}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* Confirm Button */}
            <TouchableOpacity
              style={[styles.confirmButton, isLoading && styles.buttonDisabled]}
              onPress={handleStartAnalysis}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.confirmButtonText}>Start Generation</Text>
              )}
            </TouchableOpacity>
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F7F7F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111111',
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#888888',
    marginTop: 4,
  },
  usageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
    marginBottom: 24,
  },
  usageText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111111',
    marginLeft: 8,
  },
  templateBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#ECECEC',
    borderRadius: 8,
    padding: 12,
    marginBottom: 18,
  },
  templateBannerIcon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#F7F7F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  templateBannerText: {
    flex: 1,
  },
  templateBannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 2,
  },
  templateBannerSubtitle: {
    fontSize: 12,
    lineHeight: 17,
    color: '#666666',
  },
  uploadArea: {
    marginBottom: 16,
  },
  uploadPlaceholder: {
    height: 200,
    backgroundColor: '#F7F7F7',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#ECECEC',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  uploadText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111111',
    marginBottom: 4,
  },
  uploadHint: {
    fontSize: 12,
    color: '#888888',
  },
  previewContainer: {
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 16,
  },
  clearButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#111111',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detectingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  detectingText: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontSize: 14,
  },
  actionButtons: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#F7F7F7',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginRight: 12,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111111',
  },
  modeSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111111',
    marginBottom: 12,
  },
  modeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  modeCardActive: {
    borderColor: '#27AE60',
    backgroundColor: '#E8F5E9',
  },
  modeIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  modeIconActive: {
    backgroundColor: '#27AE60',
  },
  modeText: {
    flex: 1,
  },
  modeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111111',
    marginBottom: 2,
  },
  modeTitleActive: {
    color: '#27AE60',
  },
  modeSubtitle: {
    fontSize: 12,
    color: '#888888',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111111',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  startButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 8,
  },
  searchLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginBottom: 8,
  },
  searchLinkText: {
    fontSize: 14,
    color: '#888888',
    marginLeft: 8,
  },
  privacyPolicyLink: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 8,
  },
  privacyPolicyText: {
    fontSize: 12,
    color: '#AAAAAA',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111111',
  },
  modalScrollView: {
    maxHeight: 400,
  },
  modalBody: {
    maxHeight: 200,
  },
  privacyText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 22,
  },
  agreeButton: {
    backgroundColor: '#111111',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  agreeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  modeBadgeVideo: {
    backgroundColor: '#111111',
  },
  modeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111111',
    marginLeft: 6,
  },
  modeBadgeTextVideo: {
    color: '#FFFFFF',
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111111',
    marginBottom: 10,
    marginTop: 12,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginRight: 8,
    marginBottom: 8,
  },
  categoryCardActive: {
    backgroundColor: '#111111',
  },
  categoryTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#111111',
    marginLeft: 6,
  },
  categoryTitleActive: {
    color: '#FFFFFF',
  },
  optionRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  optionButton: {
    flex: 1,
    backgroundColor: '#F7F7F7',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 8,
  },
  optionButtonActive: {
    backgroundColor: '#111111',
  },
  optionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111111',
  },
  optionButtonTextActive: {
    color: '#FFFFFF',
  },
  styleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  styleButton: {
    backgroundColor: '#F7F7F7',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginRight: 8,
    marginBottom: 8,
  },
  styleButtonActive: {
    backgroundColor: '#111111',
  },
  styleButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#111111',
  },
  styleButtonTextActive: {
    color: '#FFFFFF',
  },
  confirmButton: {
    backgroundColor: '#111111',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
