import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { Screen } from '@/components/Screen';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import useTranslation from '@/i18n';
import { Feather } from '@expo/vector-icons';

interface PrivacyPolicyScreenProps {
  showCloseButton?: boolean;
}

export default function PrivacyPolicyScreen({ showCloseButton = true }: PrivacyPolicyScreenProps) {
  const router = useSafeRouter();
  const { t } = useTranslation();

  const lastUpdated = 'January 15, 2025';

  const sections = [
    {
      title: '1. Information We Collect',
      content: 'We collect information you provide directly to us, including: email address, profile information, and images you upload. We also collect usage data such as feature interactions, generated strategies, and device information.',
    },
    {
      title: '2. How We Use Your Information',
      content: 'We use the information we collect to: provide and improve our AI-powered video strategy services, generate personalized content recommendations, process your subscription and payments, and communicate with you about our services.',
    },
    {
      title: '3. AI and Third-Party Services',
      content: 'Our app uses AI services (Coze/OpenAI) to analyze images and generate video strategies. Your uploaded images are processed by these AI services. We ensure that third-party AI providers comply with applicable privacy laws.',
    },
    {
      title: '4. Data Sharing',
      content: 'We do not sell your personal information. We may share information with: AI service providers (for content analysis), analytics providers (to improve our app), and when required by law.',
    },
    {
      title: '5. Data Security',
      content: 'We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.',
    },
    {
      title: '6. Your Rights',
      content: 'Depending on your location, you may have the right to: access your personal information, correct inaccurate data, delete your data, and opt out of certain processing. Contact us at support@tikboost.com to exercise these rights.',
    },
    {
      title: '7. Children\'s Privacy',
      content: 'Our service is not intended for users under 13 years of age. We do not knowingly collect personal information from children under 13.',
    },
    {
      title: '8. International Transfers',
      content: 'Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for such transfers.',
    },
    {
      title: '9. Changes to This Policy',
      content: 'We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.',
    },
    {
      title: '10. Contact Us',
      content: 'If you have questions about this Privacy Policy, please contact us at support@tikboost.com or through the in-app support feature.',
    },
  ];

  return (
    <Screen>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.shieldIcon}>
              <Feather name="shield" size={24} color="#1A1A1A" />
            </View>
            <Text style={styles.title}>{t('privacy.title')}</Text>
            <Text style={styles.subtitle}>
              {t('privacy.subtitle').replace('%@', lastUpdated)}
            </Text>
          </View>
          {showCloseButton && (
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => router.back()}
              accessibilityLabel={t('common.close')}
            >
              <Feather name="x" size={24} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>

        {/* Content */}
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* Intro */}
            <View style={styles.introCard}>
              <Text style={styles.introText}>
                {t('privacy.intro')}
              </Text>
            </View>

            {/* Sections */}
            {sections.map((section, index) => (
              <View key={index} style={styles.section}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <Text style={styles.sectionContent}>{section.content}</Text>
              </View>
            ))}

            {/* Contact */}
            <View style={styles.contactCard}>
              <Text style={styles.contactTitle}>{t('privacy.contact')}</Text>
              <TouchableOpacity onPress={() => Linking.openURL('mailto:support@tikboost.com')}>
                <Text style={styles.contactEmail}>support@tikboost.com</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>TikBoost - Video Strategist</Text>
          <Text style={styles.footerSubtext}>AI generated content is for reference only</Text>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 24,
    paddingTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerContent: {
    flex: 1,
  },
  shieldIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  closeButton: {
    padding: 8,
    marginLeft: 16,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  introCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  introText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  sectionContent: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 22,
  },
  contactCard: {
    backgroundColor: '#F0F4FF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  contactEmail: {
    fontSize: 16,
    color: '#4F46E5',
    fontWeight: '500',
  },
  footer: {
    padding: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  footerText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  footerSubtext: {
    fontSize: 11,
    color: '#D1D5DB',
    marginTop: 4,
  },
});
