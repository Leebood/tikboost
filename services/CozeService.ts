/**
 * Coze API Service
 * 封装与 Coze 平台的 API 交互
 */

import { getBackendBaseUrl } from '@/utils/Environment';

// 后端 API Base URL
const getApiBase = () => getBackendBaseUrl();

// 工作流 ID 配置
const WORKFLOW_IDS = {
  product_understanding: process.env.EXPO_PUBLIC_WORKFLOW_PRODUCT_UNDERSTANDING || 'product_understanding',
  strategy_generation: process.env.EXPO_PUBLIC_WORKFLOW_STRATEGY_GENERATION || 'strategy_generation',
  benchmark_lookup: process.env.EXPO_PUBLIC_WORKFLOW_BENCHMARK_LOOKUP || 'benchmark_lookup',
};

export interface ProductInsight {
  image_description: string;
  category: 'beauty' | '3c' | 'clothing' | 'home' | 'food' | 'other';
  selling_points: string[];
  target_audience: string;
}

export interface StrategyResult {
  hook: string;
  script: string;
  storyboard: string[];
  bgm: string;
  cta: string;
}

export interface BenchmarkReport {
  top_videos: Array<{
    video_title: string;
    hook: string;
    engagement_rate: string;
    high_freq_comments: string[];
  }>;
  templates: {
    hook_template: string;
    script_template: string;
  };
}

// 创建 FormData 文件的辅助函数
export function createFormDataFile(
  uri: string,
  name: string,
  mimeType: string
): { uri: string; name: string; type: string } {
  return {
    uri,
    name,
    type: mimeType,
  };
}

/**
 * 上传图片到服务器或对象存储
 * @param imageUri 本地图片 URI
 * @returns 上传后的图片 URL
 */
export async function uploadImage(imageUri: string): Promise<string> {
  try {
    const formData = new FormData();
    const fileInfo = createFormDataFile(
      imageUri,
      `product_${Date.now()}.jpg`,
      'image/jpeg'
    );
    formData.append('image', fileInfo as any);

    const response = await fetch(`${getApiBase()}/api/v1/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`);
    }

    const result = await response.json();
    return result.image_url;
  } catch (error) {
    console.error('Image upload error:', error);
    throw error;
  }
}

/**
 * 调用产品理解工作流
 * @param imageUrl 产品图片 URL
 * @returns 产品洞察结果
 */
export async function runProductUnderstandingWorkflow(
  imageUrl: string
): Promise<ProductInsight> {
  try {
    const response = await fetch(
      `${getApiBase()}/api/v1/coze/workflow/product_understanding`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image_url: imageUrl }),
      }
    );

    if (!response.ok) {
      throw new Error(`Workflow failed: ${response.status}`);
    }

    const result = await response.json();
    return result.data as ProductInsight;
  } catch (error) {
    console.error('Product understanding workflow error:', error);
    throw error;
  }
}

/**
 * 调用方案生成工作流
 * @param productInsight 产品洞察
 * @param duration 视频时长 (15/30/60秒)
 * @param style 风格 (simple/elegant/funny/suspenseful)
 * @returns 生成的策略方案
 */
export async function runStrategyGenerationWorkflow(
  productInsight: ProductInsight,
  duration: '15' | '30' | '60' = '15',
  style: 'simple' | 'elegant' | 'funny' | 'suspenseful' = 'simple'
): Promise<StrategyResult> {
  try {
    const response = await fetch(
      `${getApiBase()}/api/v1/coze/workflow/strategy_generation`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_insight: productInsight,
          duration,
          style,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Workflow failed: ${response.status}`);
    }

    const result = await response.json();
    return result.data as StrategyResult;
  } catch (error) {
    console.error('Strategy generation workflow error:', error);
    throw error;
  }
}

/**
 * 调用对标库工作流（专业版功能）
 * @param category 产品品类
 * @returns 对标报告
 */
export async function runBenchmarkLookupWorkflow(
  category: string
): Promise<BenchmarkReport> {
  try {
    const response = await fetch(
      `${getApiBase()}/api/v1/coze/workflow/benchmark_lookup`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ category }),
      }
    );

    if (!response.ok) {
      throw new Error(`Workflow failed: ${response.status}`);
    }

    const result = await response.json();
    return result.data as BenchmarkReport;
  } catch (error) {
    console.error('Benchmark lookup workflow error:', error);
    throw error;
  }
}

/**
 * 完整的 TikTok 策略生成流程
 * 依次执行：产品理解 → 方案生成
 */
export async function generateFullStrategy(
  imageUri: string,
  duration: '15' | '30' | '60' = '15',
  style: 'simple' | 'elegant' | 'funny' | 'suspenseful' = 'simple',
  onProgress?: (step: string) => void
): Promise<{ productInsight: ProductInsight; strategy: StrategyResult }> {
  try {
    // Step 1: 上传图片
    onProgress?.('Uploading image...');
    const imageUrl = await uploadImage(imageUri);

    // Step 2: 产品理解
    onProgress?.('Analyzing product...');
    const productInsight = await runProductUnderstandingWorkflow(imageUrl);

    // Step 3: 方案生成
    onProgress?.('Generating strategy...');
    const strategy = await runStrategyGenerationWorkflow(
      productInsight,
      duration,
      style
    );

    return { productInsight, strategy };
  } catch (error) {
    console.error('Full strategy generation error:', error);
    throw error;
  }
}

export default {
  uploadImage,
  runProductUnderstandingWorkflow,
  runStrategyGenerationWorkflow,
  runBenchmarkLookupWorkflow,
  generateFullStrategy,
  createFormDataFile,
};
