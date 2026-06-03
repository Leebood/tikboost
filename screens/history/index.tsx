import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import {
  clearGenerationHistory,
  GenerationHistoryItem,
  getGenerationHistory,
} from '@/services/HistoryService';
import { getTemplateById } from '@/services/TemplateService';

export default function HistoryScreen() {
  const router = useSafeRouter();
  const [items, setItems] = useState<GenerationHistoryItem[]>([]);

  const loadHistory = () => {
    getGenerationHistory().then(setItems);
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleClear = () => {
    Alert.alert('Clear History', 'Remove all saved generation history from this device?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          await clearGenerationHistory();
          loadHistory();
        },
      },
    ]);
  };

  return (
    <Screen>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
            <Feather name="arrow-left" size={20} color="#111111" />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.title}>History</Text>
            <Text style={styles.subtitle}>Generation tasks saved on this device.</Text>
          </View>
          {items.length > 0 && (
            <TouchableOpacity style={styles.iconButton} onPress={handleClear}>
              <Feather name="trash-2" size={18} color="#111111" />
            </TouchableOpacity>
          )}
        </View>

        {items.length === 0 ? (
          <View style={styles.empty}>
            <Feather name="clock" size={36} color="#CCCCCC" />
            <Text style={styles.emptyText}>No generation history yet.</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {items.map((item) => {
              const template = getTemplateById(item.templateId);
              return (
                <View key={item.id} style={styles.card}>
                  <View style={styles.cardTop}>
                    <Text style={styles.mode}>{item.mode === 'ecommerce' ? 'E-commerce' : 'Short Video'}</Text>
                    <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                  </View>
                  <Text style={styles.taskId}>Task {item.taskId}</Text>
                  <Text style={styles.meta}>{item.duration}s · {item.style}</Text>
                  {template && <Text style={styles.template}>Template: {template.title}</Text>}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { padding: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20 },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F7F7F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: { flex: 1, marginHorizontal: 12 },
  title: { fontSize: 28, color: '#111111', fontWeight: '800' },
  subtitle: { fontSize: 13, color: '#666666', marginTop: 4 },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyText: { color: '#666666', fontSize: 14, marginTop: 12 },
  list: { gap: 12 },
  card: { borderWidth: 1, borderColor: '#ECECEC', borderRadius: 8, padding: 14 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  mode: { color: '#111111', fontSize: 13, fontWeight: '800' },
  date: { color: '#999999', fontSize: 12 },
  taskId: { color: '#111111', fontSize: 15, fontWeight: '700', marginBottom: 4 },
  meta: { color: '#666666', fontSize: 13 },
  template: { color: '#FE2C55', fontSize: 12, fontWeight: '700', marginTop: 8 },
});
