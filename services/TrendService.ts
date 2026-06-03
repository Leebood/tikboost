/**
 * Trend Service
 * 趋势分析服务 - 基于 Google Trends 和 AI 分析
 */

import { getBackendBaseUrl } from '@/utils/Environment';

const BACKEND_BASE_URL = getBackendBaseUrl();

// 热门话题接口
interface TrendingTopic {
  topic: string;
  trend: 'rising' | 'stable' | 'hot';
  volume: number;
  category: string;
}

// 内容创意接口
interface ContentIdea {
  type: 'hook' | 'script' | 'format' | 'style';
  description: string;
  example: string;
}

// 行动方案接口
interface ActionPlan {
  title?: string;
  priority: 'high' | 'medium' | 'low';
  description: string;
  steps: string[];
  impact: string;
}

// 趋势报告接口
export interface TrendReport {
  keyword: string;
  platform: string;
  timestamp: string;
  insights: {
    summary: string;
    trendScore: number;
    opportunityLevel: 'high' | 'medium' | 'low';
  };
  topics: TrendingTopic[];
  contentIdeas: ContentIdea[];
  actionPlan: ActionPlan[];
  hashtagStrategy: {
    primary: string[];
    secondary: string[];
    trending: string[];
  };
  optimalTiming: {
    bestDays: string[];
    bestTimes: string[];
    reasoning: string;
  };
  competitionLevel: 'low' | 'medium' | 'high';
  recommendation: string;
  recommendedTopics: TrendingTopic[];
  viralPotential: {
    score: number;
    factors: string[];
    tips: string[];
  };
}

// 趋势分析服务类
class TrendService {
  /**
   * 分析趋势并生成行动方案
   */
  async analyzeTrends(keyword: string, platform: string): Promise<TrendReport> {
    const response = await fetch(
      `${BACKEND_BASE_URL}/api/v1/trends/analyze`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keyword, platform }),
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Analysis failed' }));
      throw new Error(error.error || 'Analysis failed');
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * 搜索相关话题
   */
  async searchRelatedTopics(keyword: string): Promise<TrendingTopic[]> {
    const response = await fetch(
      `${BACKEND_BASE_URL}/api/v1/trends/topics?keyword=${encodeURIComponent(keyword)}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch topics');
    }

    const data = await response.json();
    return data.data || [];
  }

  /**
   * 获取平台趋势
   */
  async getPlatformTrends(platform: string): Promise<TrendingTopic[]> {
    const response = await fetch(
      `${BACKEND_BASE_URL}/api/v1/trends/platform?platform=${platform}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch trends');
    }

    const data = await response.json();
    return data.data || [];
  }
}

// 导出单例
export const trendService = new TrendService();

// 默认导出
export default trendService;
