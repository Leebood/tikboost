import AsyncStorage from '@react-native-async-storage/async-storage';
import { getBackendBaseUrl } from '@/utils/Environment';
import { AUTH_TOKEN_KEY } from './AuthService';

const API_BASE = getBackendBaseUrl();

export interface VideoInfo {
  id: string;
  title: string;
  views: string;
  likes: string;
  hashtags: string[];
  thumbnail?: string;
}

export interface SearchResult {
  keyword?: string;
  url?: string;
  videos: VideoInfo[];
}

export interface ExecutionReport {
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

export interface DeepAnalysisReport {
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

export interface EnhancedVideoAnalysis {
  id: string;
  videoUrl: string;
  platform: string;
  analysis_timestamp: string;
  basic_info: {
    video_description: string;
    video_duration: string;
    content_type: string;
    target_audience: string;
  };
  content_analysis: {
    captions: string[];
    scene_timestamps: Array<{ timestamp: string; description: string }>;
    key_visual_elements: string[];
    text_overlays: string[];
    spoken_topics: string[];
  };
  engagement_metrics: {
    estimated_views: string;
    estimated_likes: string;
    estimated_shares: string;
    engagement_rate: string;
  };
  music_analysis: {
    bgm_type: string;
    bgm_style: string;
    sound_effects: string[];
    voice_over_style: string;
  };
  viral_elements: {
    core_appeal: string;
    hook_strength: string;
    engagement_drivers: string[];
    shareworthiness: string;
  };
  script_copy: {
    hook: string;
    main_message: string;
    key_phrases: string[];
    call_to_action: string;
  };
  competitor_analysis: {
    content_similarity: number;
    differentiation: string[];
    market_position: string;
  };
  audience_insights: {
    demographics: string;
    interests: string[];
    behavior_patterns: string[];
  };
}

// Helper to get auth token
async function getAuthToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

// Search videos by keyword or URL
export async function searchVideos(keyword?: string, url?: string): Promise<SearchResult> {
  const token = await getAuthToken();
  
  const response = await fetch(`${API_BASE}/api/v1/video/search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify({
      keyword: keyword || undefined,
      url: url || undefined,
    }),
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Video search failed');
  }

  return data;
}

// Get execution report for a video
export async function getExecutionReport(videoId: string): Promise<ExecutionReport> {
  const token = await getAuthToken();
  
  const response = await fetch(`${API_BASE}/api/v1/video/execution-report/${videoId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Execution report failed');
  }

  return data;
}

// Analyze video from URL
export async function analyzeVideoFromUrl(videoId: string): Promise<ExecutionReport> {
  const token = await getAuthToken();
  
  const response = await fetch(`${API_BASE}/api/v1/video/analyze/${videoId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Video analysis failed');
  }

  return data;
}

// Get deep analysis report
export async function getDeepAnalysisReport(videoId: string): Promise<DeepAnalysisReport> {
  const token = await getAuthToken();
  
  const response = await fetch(`${API_BASE}/api/v1/video/deep-analysis/${videoId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Deep analysis failed');
  }

  return data;
}
