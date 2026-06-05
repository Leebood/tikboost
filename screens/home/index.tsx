import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { IconColors } from '@/components/AppIcons';

const modules = [
  {
    title: 'Create',
    subtitle: 'Generate a video strategy from a product image or content idea.',
    route: '/upload',
    icon: 'plus-square',
  },
  {
    title: 'Analyze',
    subtitle: 'Paste a video URL or keyword to extract structure and opportunities.',
    route: '/search',
    icon: 'search',
  },
  {
    title: 'Trends',
    subtitle: 'Find content angles, topics, hashtags, and platform timing ideas.',
    route: '/trends',
    icon: 'trending-up',
  },
  {
    title: 'Templates',
    subtitle: 'Start from proven short-video frameworks and save favorites.',
    route: '/templates',
    icon: 'layers',
  },
] as const;

export default function HomeScreen() {
  const router = useSafeRouter();

  return (
    <Screen>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>TikBoost</Text>
            <Text style={styles.subtitle}>Short-video strategy workspace</Text>
          </View>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/settings')}>
            <Feather name="settings" size={20} color="#111111" />
          </TouchableOpacity>
        </View>

        <View style={styles.primaryPanel}>
          <Text style={styles.panelLabel}>Your trend engine</Text>
          <Text style={styles.panelTitle}>
            With TikBoost planning and analysis, you are the next trend.
          </Text>
        </View>

        <View style={styles.grid}>
          {modules.map((item) => (
            <TouchableOpacity key={item.title} style={styles.moduleCard} onPress={() => router.push(item.route)}>
              <View style={styles.moduleIcon}>
                <Feather name={item.icon} size={22} color="#111111" />
              </View>
              <Text style={styles.moduleTitle}>{item.title}</Text>
              <Text style={styles.moduleSubtitle}>{item.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111111',
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F7F7F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryPanel: {
    backgroundColor: '#111111',
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
  },
  panelLabel: {
    fontSize: 12,
    color: '#C7F36A',
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  panelTitle: {
    fontSize: 20,
    lineHeight: 28,
    color: '#FFFFFF',
    fontWeight: '700',
    marginBottom: 18,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FE2C55',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  grid: {
    gap: 12,
  },
  moduleCard: {
    borderWidth: 1,
    borderColor: IconColors.border,
    borderRadius: 8,
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  moduleIcon: {
    width: 42,
    height: 42,
    borderRadius: 8,
    backgroundColor: '#F7F7F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  moduleTitle: {
    fontSize: 18,
    color: '#111111',
    fontWeight: '700',
    marginBottom: 6,
  },
  moduleSubtitle: {
    fontSize: 13,
    color: '#666666',
    lineHeight: 19,
  },
});
