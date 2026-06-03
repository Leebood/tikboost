/**
 * 隐私合规与用户同意服务
 */

// 隐私清单内容（用于展示给用户）
export const PRIVACY_NOTICE = {
  title: 'Privacy Notice',
  content: `TikBoost needs your permission to analyze product images.

What we collect:
• Product images you upload
• Usage data for improving our service

How we use your data:
• Images are analyzed using AI (OpenAI/Coze)
• Your data may be processed by third-party AI providers
• We do not sell your personal information

Your rights:
• Delete your data at any time
• Opt out of analytics

By tapping "I Agree", you consent to this data processing.`,
  agreementButton: 'I Agree',
  declineButton: 'Cancel',
  
  // AI 生成标识
  aiDisclaimer: '*AI generated strategy, for reference only',
  
  // 数据处理说明
  dataProcessingNotice: `Your uploaded image will be sent to our AI partners (OpenAI/Coze) for analysis. These providers process data in accordance with their privacy policies.`,
};

// 首次使用弹窗标题
export const FIRST_TIME_MODAL = {
  title: 'Before You Continue',
  subtitle: 'Please review our data processing terms',
  privacyUrl: 'https://www.iubenda.com/privacy-policy/98497272',
  termsUrl: 'https://www.termsfeed.com/live/694f444f-3ab1-4f0b-9c69-b7c44ec7f238',
};

// 检查是否为首次使用
export async function isFirstTimeUser(): Promise<boolean> {
  // 这个函数会被 SubscriptionService.hasUserAgreedToTerms 替代
  // 保留作为备用
  return true;
}

export default {
  PRIVACY_NOTICE,
  FIRST_TIME_MODAL,
  isFirstTimeUser,
};
