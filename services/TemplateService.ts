import AsyncStorage from '@react-native-async-storage/async-storage';

export type TemplateGoal = 'sales' | 'engagement' | 'education' | 'trust';

export interface VideoTemplate {
  id: string;
  title: string;
  category: string;
  platform: string;
  duration: '15' | '30' | '60';
  goal: TemplateGoal;
  hook: string;
  structure: string[];
  bestFor: string;
  promptCue: string;
  isPremium?: boolean;
}

const FAVORITES_KEY = '@tikboost_template_favorites';

export const VIDEO_TEMPLATES: VideoTemplate[] = [
  {
    id: 'ugc-proof-demo',
    title: 'UGC Proof Demo',
    category: 'E-commerce',
    platform: 'TikTok Shop',
    duration: '30',
    goal: 'trust',
    hook: 'I did not expect this to work, but the result is obvious.',
    structure: ['Personal problem', 'Product in hand', 'Live proof', 'Before/after', 'Soft CTA'],
    bestFor: 'Products that need credibility, demonstration, or visual proof.',
    promptCue: 'Use a casual UGC voice, show proof early, and make the CTA feel personal.',
  },
  {
    id: 'three-second-hook',
    title: '3-Second Hook Sprint',
    category: 'Creator Growth',
    platform: 'Shorts/Reels/TikTok',
    duration: '15',
    goal: 'engagement',
    hook: 'Stop scrolling if you want a faster way to solve this.',
    structure: ['Pattern interrupt', 'Specific promise', 'One practical tip', 'Save/share CTA'],
    bestFor: 'Educational clips, fast tips, and audience-building content.',
    promptCue: 'Lead with a sharp pattern interrupt and keep every sentence short.',
  },
  {
    id: 'problem-solution-sale',
    title: 'Problem to Purchase',
    category: 'E-commerce',
    platform: 'TikTok',
    duration: '30',
    goal: 'sales',
    hook: 'If this happens to you every week, this is the fix.',
    structure: ['Pain point', 'Cost of ignoring it', 'Product reveal', 'Feature proof', 'Offer CTA'],
    bestFor: 'Direct-response product videos with a clear pain point.',
    promptCue: 'Make the viewer feel the pain before introducing the product.',
    isPremium: true,
  },
  {
    id: 'trend-remix',
    title: 'Trend Remix',
    category: 'Trends',
    platform: 'TikTok/Reels',
    duration: '15',
    goal: 'engagement',
    hook: 'Everyone is using this trend wrong for this niche.',
    structure: ['Trend reference', 'Niche twist', 'Fast example', 'Invite comments'],
    bestFor: 'Turning active platform trends into niche-specific content.',
    promptCue: 'Keep the trend recognizable but make the angle specific to the product or niche.',
    isPremium: true,
  },
  {
    id: 'deep-review-breakdown',
    title: 'Review Breakdown',
    category: 'Analysis',
    platform: 'YouTube Shorts',
    duration: '60',
    goal: 'education',
    hook: 'Here is why this video keeps people watching.',
    structure: ['Hook teardown', 'Retention beats', 'CTA analysis', 'Reusable template'],
    bestFor: 'Analyzing a competitor or creator video and extracting a reusable framework.',
    promptCue: 'Explain the strategy behind each segment and turn it into a reusable template.',
  },
];

export async function getFavoriteTemplateIds(): Promise<string[]> {
  const value = await AsyncStorage.getItem(FAVORITES_KEY);
  return value ? JSON.parse(value) : [];
}

export async function toggleFavoriteTemplate(templateId: string): Promise<string[]> {
  const favorites = await getFavoriteTemplateIds();
  const next = favorites.includes(templateId)
    ? favorites.filter((id) => id !== templateId)
    : [templateId, ...favorites];

  await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
  return next;
}

export function getTemplateById(templateId?: string): VideoTemplate | undefined {
  return VIDEO_TEMPLATES.find((template) => template.id === templateId);
}
