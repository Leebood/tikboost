import express from 'express';
import deepseekService from '../services/deepseek.js';

const router = express.Router();

const videoReports = new Map();

router.post('/search', async (req, res) => {
  try {
    const { keyword, url } = req.body;
    
    if (!keyword && !url) {
      return res.status(400).json({
        success: false,
        error: 'Keyword or URL is required'
      });
    }

    const result = await deepseekService.searchVideos(keyword, url);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Search videos error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search videos'
    });
  }
});

router.get('/execution-report/:id', (req, res) => {
  try {
    const { id } = req.params;
    const report = videoReports.get(id);
    
    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Report not found'
      });
    }
    
    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Get execution report error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get report'
    });
  }
});

router.get('/analyze/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    res.json({
      success: true,
      data: {
        id,
        videoTitle: 'Amazing TikTok Video',
        contentAnalysis: {
          overall: '高互动，情感积极',
          hook: '开头3秒抓住注意力',
          pacing: '节奏适中，信息密度合理'
        },
        contentTips: [
          '优化开头钩子',
          '增加互动元素',
          '调整视频时长'
        ]
      }
    });
  } catch (error) {
    console.error('Analyze video error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze video'
    });
  }
});

router.get('/deep-analysis/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    res.json({
      success: true,
      data: {
        id,
        emotionalAnalysis: {
          primaryEmotion: 'excitement',
          sentimentScore: 0.85
        },
        visualAnalysis: {
          frameComposition: '动态切换，节奏感强',
          colorScheme: '明亮，高饱和度'
        },
        audioAnalysis: {
          bgmMatch: '音乐与内容高度契合',
          voiceClarity: '清晰，语速适中'
        },
        actionableInsights: [
          '建议保持当前音乐风格',
          '可以尝试更多画面特效',
          '优化字幕位置和样式'
        ]
      }
    });
  } catch (error) {
    console.error('Deep analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get deep analysis'
    });
  }
});

export default router;
