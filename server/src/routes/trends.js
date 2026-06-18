import express from 'express';
import deepseekService from '../services/deepseek.js';

const router = express.Router();

router.post('/analyze', async (req, res) => {
  try {
    const { keyword, platform = 'all' } = req.body;
    
    if (!keyword) {
      return res.status(400).json({
        success: false,
        error: 'Keyword is required'
      });
    }

    const result = await deepseekService.analyzeTrends(keyword, platform);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Analyze trends error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze trends'
    });
  }
});

router.get('/topics', (req, res) => {
  res.json({
    success: true,
    data: {
      topics: [
        { topic: 'AI生成', trend: 'rising', volume: 150000, category: 'tech' },
        { topic: '极简生活', trend: 'stable', volume: 120000, category: 'lifestyle' },
        { topic: '健康饮食', trend: 'rising', volume: 180000, category: 'health' },
        { topic: '旅行vlog', trend: 'stable', volume: 100000, category: 'travel' },
        { topic: '好物分享', trend: 'rising', volume: 200000, category: 'shopping' }
      ]
    }
  });
});

router.get('/platform', (req, res) => {
  res.json({
    success: true,
    data: {
      platforms: [
        {
          name: 'TikTok',
          bestPostingTimes: ['07:00', '12:00', '18:00', '21:00'],
          trendingHashtags: ['#fyp', '#viral', '#trending', '#foryou', '#learnontiktok'],
          averageVideoLength: 15
        },
        {
          name: 'Instagram',
          bestPostingTimes: ['09:00', '13:00', '17:00', '20:00'],
          trendingHashtags: ['#instagood', '#photography', '#love', '#fashion', '#beautiful'],
          averageVideoLength: 30
        },
        {
          name: 'YouTube Shorts',
          bestPostingTimes: ['08:00', '14:00', '19:00', '22:00'],
          trendingHashtags: ['#shorts', '#youtubeshorts', '#trending', '#viral', '#funny'],
          averageVideoLength: 45
        }
      ]
    }
  });
});

export default router;
