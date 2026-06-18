import express from 'express';
const router = express.Router();

// 模拟订阅产品数据
const subscriptionProducts = {
  'com.libo.tikboost.starter': {
    id: 'com.libo.tikboost.starter',
    type: 'starter',
    name: 'Starter',
    price: '$4.99/月',
    benefits: ['50次分析/月', '基础模板', '邮件支持']
  },
  'com.libo.tikboost.pro': {
    id: 'com.libo.tikboost.pro',
    type: 'pro',
    name: 'Pro',
    price: '$9.99/月',
    benefits: ['200次分析/月', '高级模板', '优先支持', '趋势分析']
  },
  'com.libo.tikboost.ultimate': {
    id: 'com.libo.tikboost.ultimate',
    type: 'ultimate',
    name: 'Ultimate',
    price: '$29.99/月',
    benefits: ['无限分析', '所有模板', '专属顾问', 'API访问']
  }
};

// 获取订阅产品列表
router.get('/products', (req, res) => {
  res.json({
    success: true,
    products: Object.values(subscriptionProducts)
  });
});

// 验证购买（生产环境应该验证 App Store 收据）
router.post('/verify', async (req, res) => {
  try {
    const { productId, purchaseToken, transactionId, platform } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        error: 'Product ID is required'
      });
    }

    const product = subscriptionProducts[productId];
    if (!product) {
      return res.status(400).json({
        success: false,
        error: 'Invalid product ID'
      });
    }

    // 注意：生产环境应该验证 App Store/Google Play 收据
    // 这里简化处理，直接返回验证成功
    console.log(`[Subscription] Verifying purchase: ${productId} (${platform})`);
    console.log(`[Subscription] Transaction ID: ${transactionId}`);

    res.json({
      success: true,
      verified: true,
      subscriptionType: product.type,
      product: product,
      transactionId: transactionId
    });

  } catch (error) {
    console.error('[Subscription] Verify error:', error);
    res.status(500).json({
      success: false,
      error: 'Verification failed'
    });
  }
});

// 测试接口：直接设置会员类型（仅用于测试！）
router.post('/test/set-subscription', async (req, res) => {
  try {
    const { subscriptionType } = req.body;

    if (!subscriptionType) {
      return res.status(400).json({
        success: false,
        error: 'Subscription type is required'
      });
    }

    const validTypes = ['free', 'starter', 'pro', 'ultimate'];
    if (!validTypes.includes(subscriptionType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid subscription type'
      });
    }

    console.log(`[Subscription] Test: Setting subscription to ${subscriptionType}`);

    res.json({
      success: true,
      subscriptionType: subscriptionType,
      message: `Subscription set to ${subscriptionType} (test mode)`
    });

  } catch (error) {
    console.error('[Subscription] Test set error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to set subscription'
    });
  }
});

export default router;
