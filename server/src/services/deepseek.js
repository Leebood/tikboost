import axios from 'axios';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || 'sk-09193401e89e43ef96bbff91a491b875';
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

/**
 * 调用 DeepSeek API
 */
export async function callDeepSeek(messages, model = 'deepseek-chat') {
  try {
    const response = await axios.post(
      DEEPSEEK_API_URL,
      {
        model,
        messages,
        temperature: 0.7,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        },
        timeout: 120000,
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('DeepSeek API error:', error.response?.data || error.message);
    throw new Error('DeepSeek API call failed');
  }
}

/**
 * 产品理解（分析图片）
 */
export async function analyzeProductImage(imageUrl) {
  const prompt = `请分析这张产品图片，返回 JSON 格式：

{
  "image_description": "图片内容描述",
  "category": "beauty|3c|clothing|home|food|other",
  "selling_points": ["卖点1", "卖点2", "卖点3"],
  "target_audience": "目标受众描述"
}

只返回 JSON，不要其他文字。`;

  // 注意：DeepSeek 的图片分析需要用 vision 模型
  // 这里先用文本模拟，实际需要用 deepseek-v3 等 vision 模型
  const messages = [
    {
      role: 'user',
      content: `${prompt}\n\n图片URL: ${imageUrl}\n\n假设这是一个产品图片，生成合理的JSON。`
    }
  ];

  const result = await callDeepSeek(messages);
  
  try {
    return JSON.parse(result);
  } catch {
    // 如果解析失败，返回默认值
    return {
      image_description: '产品图片',
      category: 'other',
      selling_points: ['优质产品', '性价比高', '值得购买'],
      target_audience: '大众消费者'
    };
  }
}

/**
 * 策略生成
 */
export async function generateStrategy(productInsight, duration, style) {
  const prompt = `根据以下产品信息，生成 TikTok/短视频策略，返回 JSON：

产品信息：
${JSON.stringify(productInsight, null, 2)}

视频时长：${duration}秒
风格：${style}

返回格式：
{
  "hook": "吸引人的开头文案（3秒内）",
  "script": "完整视频脚本",
  "storyboard": [
    "0:00-0:03 画面描述",
    "0:03-0:15 画面描述",
    "0:15-0:30 画面描述",
    "0:30-0:60 画面描述"
  ],
  "bgm": "推荐的BGM风格描述",
  "cta": "行动号召文案"
}

只返回 JSON，不要其他文字。`;

  const messages = [
    { role: 'user', content: prompt }
  ];

  const result = await callDeepSeek(messages);
  
  try {
    return JSON.parse(result);
  } catch {
    // 如果解析失败，返回默认值
    return {
      hook: '想知道如何让你的产品爆火吗？',
      script: '这是一个很棒的产品，让我来告诉你怎么推广...',
      storyboard: [
        '0:00-0:03 展示产品，吸引注意力',
        '0:03-0:15 介绍产品特点',
        '0:15-0:30 演示使用方法',
        '0:30-0:60 行动号召'
      ],
      bgm: '轻快、有活力的流行音乐',
      cta: '关注我，获取更多营销策略！'
    };
  }
}

/**
 * 对标分析
 */
export async function getBenchmarkData(category) {
  const prompt = `分析${category}品类的爆款视频，返回 JSON：

{
  "top_videos": [
    {
      "video_title": "视频标题",
      "hook": "开头钩子",
      "engagement_rate": "互动率",
      "high_freq_comments": ["评论1", "评论2", "评论3"]
    }
  ],
  "templates": {
    "hook_template": "钩子模板",
    "script_template": "脚本模板"
  }
}

只返回 JSON，不要其他文字。`;

  const messages = [
    { role: 'user', content: prompt }
  ];

  const result = await callDeepSeek(messages);
  
  try {
    return JSON.parse(result);
  } catch {
    return {
      top_videos: [
        {
          video_title: `${category}爆款视频示例`,
          hook: '你绝对不能错过这个！',
          engagement_rate: '15%',
          high_freq_comments: ['太棒了！', '学到了', '已收藏']
        }
      ],
      templates: {
        hook_template: '你想知道...吗？',
        script_template: '开头吸引 + 中间讲干货 + 结尾行动号召'
      }
    };
  }
}

/**
 * 视频搜索分析
 */
export async function searchVideos(keyword, url) {
  const searchQuery = keyword || url || '热门视频';
  const prompt = `分析"${searchQuery}"相关的视频，返回 JSON：

{
  "keyword": "${keyword || ''}",
  "url": "${url || ''}",
  "videos": [
    {
      "id": "1",
      "title": "视频标题1",
      "views": "1.2M",
      "likes": "89K",
      "hashtags": ["trending", "viral", "fyp"],
      "thumbnail": "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400"
    }
  ]
}

只返回 JSON，不要其他文字。`;

  const messages = [
    { role: 'user', content: prompt }
  ];

  const result = await callDeepSeek(messages);
  
  try {
    return JSON.parse(result);
  } catch {
    return {
      keyword,
      url,
      videos: [
        {
          id: '1',
          title: `Top ${searchQuery} videos you should watch`,
          views: '1.2M',
          likes: '89K',
          hashtags: ['trending', 'viral', 'fyp'],
          thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400'
        }
      ]
    };
  }
}

/**
 * 趋势分析
 */
export async function analyzeTrends(keyword, platform) {
  const prompt = `分析${platform}平台上"${keyword}"的趋势，返回 JSON：

{
  "keyword": "${keyword}",
  "platform": "${platform}",
  "timestamp": "${new Date().toISOString()}",
  "insights": {
    "summary": "趋势总结",
    "trendScore": 85,
    "opportunityLevel": "high"
  },
  "topics": [
    { "topic": "话题1", "trend": "rising", "volume": 150000, "category": "education" }
  ],
  "contentIdeas": [
    { "type": "hook", "description": "描述", "example": "示例" }
  ],
  "actionPlan": [
    { "title": "标题", "priority": "high", "description": "描述", "steps": ["步骤1"], "impact": "影响" }
  ],
  "hashtagStrategy": {
    "primary": ["#tag1"],
    "secondary": ["#tag2"],
    "trending": ["#tag3"]
  },
  "optimalTiming": {
    "bestDays": ["Tuesday"],
    "bestTimes": ["09:00"],
    "reasoning": "原因"
  },
  "competitionLevel": "medium",
  "recommendation": "推荐",
  "recommendedTopics": [],
  "viralPotential": {
    "score": 82,
    "factors": ["因素1"],
    "tips": ["提示1"]
  }
}

只返回 JSON，不要其他文字。`;

  const messages = [
    { role: 'user', content: prompt }
  ];

  const result = await callDeepSeek(messages);
  
  try {
    return JSON.parse(result);
  } catch {
    return {
      keyword,
      platform,
      timestamp: new Date().toISOString(),
      insights: {
        summary: `${keyword} is showing strong growth potential`,
        trendScore: 85,
        opportunityLevel: 'high'
      },
      topics: [],
      contentIdeas: [],
      actionPlan: [],
      hashtagStrategy: { primary: [], secondary: [], trending: [] },
      optimalTiming: { bestDays: [], bestTimes: [], reasoning: '' },
      competitionLevel: 'medium',
      recommendation: 'Great opportunity',
      recommendedTopics: [],
      viralPotential: { score: 82, factors: [], tips: [] }
    };
  }
}

export default {
  callDeepSeek,
  analyzeProductImage,
  generateStrategy,
  getBenchmarkData,
  searchVideos,
  analyzeTrends
};
