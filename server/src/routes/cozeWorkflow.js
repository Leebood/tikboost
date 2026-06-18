import express from 'express';
import deepseekService from '../services/deepseek.js';

const router = express.Router();

router.post('/product_understanding', async (req, res) => {
  try {
    const { image_url, image_base64, additional_params } = req.body;
    
    if (!image_url && !image_base64) {
      return res.status(400).json({ success: false, error: 'image_url or image_base64 is required' });
    }
    
    const result = await deepseekService.analyzeProductImage(image_url || 'image');
    
    res.json({
      success: true,
      data: {
        ...result,
        output: result,
        workflow_id: 'product_understanding'
      }
    });
    
  } catch (error) {
    console.error('Product understanding error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/strategy_generation', async (req, res) => {
  try {
    const { product_insight, additional_params } = req.body;
    
    if (!product_insight) {
      return res.status(400).json({ success: false, error: 'product_insight is required' });
    }
    
    const duration = additional_params?.duration || 30;
    const style = additional_params?.style || 'professional';
    
    const result = await deepseekService.generateStrategy(
      product_insight, 
      duration, 
      style
    );
    
    res.json({
      success: true,
      data: {
        ...result,
        output: result,
        workflow_id: 'strategy_generation'
      }
    });
    
  } catch (error) {
    console.error('Strategy generation error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/benchmark_lookup', async (req, res) => {
  try {
    const { category, keyword, additional_params } = req.body;
    
    const searchCategory = category || keyword || 'all';
    const result = await deepseekService.getBenchmarkData(searchCategory);
    
    res.json({
      success: true,
      data: {
        ...result,
        output: result,
        workflow_id: 'benchmark_lookup'
      }
    });
    
  } catch (error) {
    console.error('Benchmark lookup error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
