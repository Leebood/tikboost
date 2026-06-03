import { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import {
  VIDEO_TEMPLATES,
  getFavoriteTemplateIds,
  toggleFavoriteTemplate,
  VideoTemplate,
} from '@/services/TemplateService';

const filters = ['All', 'E-commerce', 'Creator Growth', 'Trends', 'Analysis'] as const;

export default function TemplatesScreen() {
  const router = useSafeRouter();
  const [activeFilter, setActiveFilter] = useState<(typeof filters)[number]>('All');
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    getFavoriteTemplateIds().then(setFavorites);
  }, []);

  const templates = useMemo(() => {
    if (activeFilter === 'All') return VIDEO_TEMPLATES;
    return VIDEO_TEMPLATES.filter((template) => template.category === activeFilter);
  }, [activeFilter]);

  const handleToggleFavorite = async (templateId: string) => {
    const next = await toggleFavoriteTemplate(templateId);
    setFavorites(next);
  };

  const handleUseTemplate = (template: VideoTemplate) => {
    router.push('/upload', {
      templateId: template.id,
      duration: template.duration,
      style: template.goal === 'sales' ? 'elegant' : 'simple',
    });
  };

  return (
    <Screen>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Feather name="arrow-left" size={20} color="#111111" />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.title}>Templates</Text>
            <Text style={styles.subtitle}>Reusable frameworks for strategy generation and video analysis.</Text>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[styles.filterChip, activeFilter === filter && styles.filterChipActive]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text style={[styles.filterText, activeFilter === filter && styles.filterTextActive]}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.list}>
          {templates.map((template) => {
            const isFavorite = favorites.includes(template.id);
            return (
              <View key={template.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.badges}>
                    <Text style={styles.badge}>{template.platform}</Text>
                    {template.isPremium && <Text style={styles.premiumBadge}>Pro</Text>}
                  </View>
                  <TouchableOpacity onPress={() => handleToggleFavorite(template.id)}>
                    <Feather
                      name="star"
                      size={20}
                      color={isFavorite ? '#F59E0B' : '#CCCCCC'}
                    />
                  </TouchableOpacity>
                </View>

                <Text style={styles.cardTitle}>{template.title}</Text>
                <Text style={styles.bestFor}>{template.bestFor}</Text>

                <View style={styles.structure}>
                  {template.structure.map((step, index) => (
                    <View key={step} style={styles.stepRow}>
                      <Text style={styles.stepIndex}>{index + 1}</Text>
                      <Text style={styles.stepText}>{step}</Text>
                    </View>
                  ))}
                </View>

                <TouchableOpacity style={styles.useButton} onPress={() => handleUseTemplate(template)}>
                  <Text style={styles.useButtonText}>Use Template</Text>
                  <Feather name="arrow-right" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { padding: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 18 },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F7F7F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerText: { flex: 1 },
  title: { fontSize: 28, fontWeight: '800', color: '#111111' },
  subtitle: { color: '#666666', fontSize: 13, lineHeight: 19, marginTop: 4 },
  filterRow: { marginBottom: 18 },
  filterChip: {
    borderWidth: 1,
    borderColor: '#ECECEC',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  filterChipActive: { backgroundColor: '#111111', borderColor: '#111111' },
  filterText: { fontSize: 13, color: '#666666', fontWeight: '600' },
  filterTextActive: { color: '#FFFFFF' },
  list: { gap: 14 },
  card: { borderWidth: 1, borderColor: '#ECECEC', borderRadius: 8, padding: 16 },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  badges: { flexDirection: 'row', gap: 6 },
  badge: {
    backgroundColor: '#F7F7F7',
    color: '#666666',
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  premiumBadge: {
    backgroundColor: '#FEF3C7',
    color: '#92400E',
    fontSize: 11,
    fontWeight: '800',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  cardTitle: { fontSize: 19, color: '#111111', fontWeight: '800', marginBottom: 6 },
  bestFor: { fontSize: 13, color: '#666666', lineHeight: 19, marginBottom: 14 },
  structure: { gap: 8, marginBottom: 16 },
  stepRow: { flexDirection: 'row', alignItems: 'center' },
  stepIndex: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: '#F7F7F7',
    textAlign: 'center',
    lineHeight: 22,
    fontSize: 12,
    fontWeight: '700',
    color: '#111111',
    marginRight: 8,
  },
  stepText: { flex: 1, color: '#333333', fontSize: 13 },
  useButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111111',
    borderRadius: 8,
    paddingVertical: 12,
    gap: 8,
  },
  useButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
});
