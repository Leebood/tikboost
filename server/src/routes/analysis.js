import express from 'express';
import taskStore from '../services/taskStore.js';
import deepseekService from '../services/deepseek.js';

const router = express.Router();

const uploadedImages = new Map();

router.post('/start', async (req, res) => {
  try {
    const { imageId, platform, category, duration, style, productInsight } = req.body;
    
    if (!imageId && !productInsight) {
      return res.status(400).json({ success: false, error: 'imageId or productInsight is required' });
    }

    const task = taskStore.createTask('analysis');
    
    // 异步执行任务
    (async () => {
      try {
        taskStore.startTask(task.id);
        
        let insight = productInsight;
        
        // 如果有图片，先分析图片
        if (imageId && !productInsight) {
          taskStore.updateTask(task.id, { progress: 20 });
          const imageUrl = uploadedImages.get(imageId);
          if (imageUrl) {
            insight = await deepseekService.analyzeProductImage(imageUrl);
          }
        }
        
        taskStore.updateTask(task.id, { progress: 50 });
        
        // 生成策略
        const strategy = await deepseekService.generateStrategy(
          insight || {}, 
          duration || 30, 
          style || 'professional'
        );
        
        taskStore.updateTask(task.id, { progress: 80 });
        
        // 构造结果
        const result = {
          productInsight: insight,
          strategy,
          videoAnalysis: {
            title: `你的${category || '产品'}推广视频`,
            duration: duration || 30,
            script: strategy.script,
            storyboard: strategy.storyboard,
            bgm: strategy.bgm,
            cta: strategy.cta,
            captions: ['字幕1', '字幕2', '字幕3'],
            voiceover: '这是一段语音脚本'
          },
          contentIdeas: [
            {
              title: '开箱展示',
              description: '展示产品开箱过程，真实感拉满',
              duration: 15,
              difficulty: 'easy'
            }
          ],
          hashtags: ['#fyp', '#viral', '#trending'],
          postingTimes: ['09:00', '12:00', '18:00', '21:00'],
          targetAudience: '18-35岁，对新鲜事物感兴趣的用户',
          competitorAnalysis: {
            strengths: ['产品优势'],
            weaknesses: ['需要改进的地方'],
            opportunities: ['市场机会']
          }
        };
        
        taskStore.completeTask(task.id, result);
        
      } catch (error) {
        console.error('Analysis task error:', error);
        taskStore.failTask(task.id, error);
      }
    })();
    
    res.json({
      success: true,
      taskId: task.id,
      status: task.status
    });
    
  } catch (error) {
    console.error('Start analysis error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/status/:taskId', (req, res) => {
  try {
    const { taskId } = req.params;
    const task = taskStore.getTask(taskId);
    
    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }
    
    res.json({
      success: true,
      taskId: task.id,
      status: task.status,
      progress: task.progress,
      result: task.result,
      error: task.error
    });
    
  } catch (error) {
    console.error('Get status error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
