import AsyncStorage from '@react-native-async-storage/async-storage';

export interface GenerationHistoryItem {
  id: string;
  taskId: string;
  mode: 'ecommerce' | 'shortvideo';
  duration: number;
  style: string;
  templateId?: string;
  createdAt: number;
}

const GENERATION_HISTORY_KEY = '@tikboost_generation_history';

export async function addGenerationHistoryItem(
  item: Omit<GenerationHistoryItem, 'id' | 'createdAt'>
): Promise<GenerationHistoryItem[]> {
  const current = await getGenerationHistory();
  const nextItem: GenerationHistoryItem = {
    ...item,
    id: `${item.taskId}-${Date.now()}`,
    createdAt: Date.now(),
  };
  const next = [nextItem, ...current].slice(0, 50);
  await AsyncStorage.setItem(GENERATION_HISTORY_KEY, JSON.stringify(next));
  return next;
}

export async function getGenerationHistory(): Promise<GenerationHistoryItem[]> {
  const value = await AsyncStorage.getItem(GENERATION_HISTORY_KEY);
  return value ? JSON.parse(value) : [];
}

export async function clearGenerationHistory(): Promise<void> {
  await AsyncStorage.removeItem(GENERATION_HISTORY_KEY);
}
