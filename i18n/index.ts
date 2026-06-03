/**
 * 本地化字符串 Hook
 * 提供 NSLocalizedString 风格的国际化支持
 */
import { useCallback } from 'react';

// 翻译键类型
type TranslationKey =
  | 'common.continue'
  | 'common.cancel'
  | 'common.save'
  | 'common.loading'
  | 'common.error'
  | 'common.back'
  | 'common.done'
  | 'app.name'
  | 'app.tagline'
  | 'upload.title'
  | 'upload.subtitle'
  | 'upload.camera.button'
  | 'upload.gallery.button'
  | 'upload.free.remaining'
  | 'upload.no.free'
  | 'upload.agree.notice'
  | 'upload.button'
  | 'upload.preparing'
  | 'upload.select.image'
  | 'analysis.title'
  | 'analysis.step.upload'
  | 'analysis.step.analyze'
  | 'analysis.step.generate'
  | 'analysis.step.complete'
  | 'analysis.please.wait'
  | 'result.title'
  | 'result.hook'
  | 'result.script'
  | 'result.storyboard'
  | 'result.bgm'
  | 'result.cta'
  | 'result.copy.all'
  | 'result.regenerate'
  | 'result.adjust.params'
  | 'result.copied'
  | 'result.ai.disclaimer'
  | 'result.shot'
  | 'params.title'
  | 'params.duration'
  | 'params.apply'
  | 'benchmark.title'
  | 'benchmark.subtitle'
  | 'benchmark.pro.required'
  | 'benchmark.top.videos'
  | 'benchmark.hook.template'
  | 'benchmark.upgrade'
  | 'settings.title'
  | 'settings.subscription'
  | 'settings.current.plan'
  | 'settings.free.plan'
  | 'settings.usage'
  | 'settings.upgrade'
  | 'settings.manage'
  | 'settings.history'
  | 'settings.privacy'
  | 'settings.privacy.policy'
  | 'settings.terms'
  | 'settings.about'
  | 'settings.version'
  | 'settings.contact'
  | 'subscription.title'
  | 'subscription.free.title'
  | 'subscription.pro.title'
  | 'subscription.pro.badge'
  | 'subscription.subscribe'
  | 'subscription.restore'
  | 'subscription.tos'
  | 'privacy.title'
  | 'privacy.subtitle'
  | 'privacy.agree'
  | 'privacy.decline'
  | 'privacy.learn.more'
  | 'error.upload.failed'
  | 'error.analysis.failed'
  | 'error.network'
  | 'error.subscription.failed'
  | 'category.beauty'
  | 'category.3c'
  | 'category.clothing'
  | 'category.home'
  | 'category.food'
  | 'category.other';

const translations: Record<string, string> = {
  // Common
  'common.continue': 'Continue',
  'common.cancel': 'Cancel',
  'common.save': 'Save',
  'common.delete': 'Delete',
  'common.edit': 'Edit',
  'common.share': 'Share',
  'common.copy': 'Copy',
  'common.loading': 'Loading...',
  'common.error': 'Error',
  'common.success': 'Success',
  'common.retry': 'Retry',
  'common.back': 'Back',
  'common.next': 'Next',
  'common.done': 'Done',

  // App Info
  'app.name': 'TikBoost',
  'app.tagline': 'Generate viral TikTok strategies in seconds',

  // Upload Page
  'upload.title': 'Upload Product',
  'upload.subtitle': 'Take a photo or select from gallery',
  'upload.camera.button': 'Take Photo',
  'upload.gallery.button': 'Choose from Gallery',
  'upload.free.remaining': 'Free uses remaining: %d',
  'upload.no.free': 'No free uses left this month',
  'upload.agree.notice': 'By uploading, you agree that your image will be processed by AI',
  'upload.button': 'Generate Strategy',
  'upload.preparing': 'Preparing...',
  'upload.select.image': 'Please select an image first',

  // Analysis Page
  'analysis.title': 'Analyzing Product',
  'analysis.step.upload': 'Uploading image...',
  'analysis.step.analyze': 'Analyzing product...',
  'analysis.step.generate': 'Generating strategy...',
  'analysis.step.complete': 'Complete!',
  'analysis.please.wait': 'Please wait while we create your strategy',

  // Result Page
  'result.title': 'Your TikTok Strategy',
  'result.hook': 'Hook (First 3 Seconds)',
  'result.script': 'Script',
  'result.storyboard': 'Storyboard',
  'result.bgm': 'Recommended BGM',
  'result.cta': 'Call to Action',
  'result.copy.all': 'Copy All',
  'result.regenerate': 'Regenerate',
  'result.adjust.params': 'Adjust Parameters',
  'result.share': 'Share Strategy',
  'result.copied': 'Copied to clipboard!',
  'result.ai.disclaimer': '*AI generated strategy, for reference only',
  'result.shot': 'Shot %d',

  // Parameters Modal
  'params.title': 'Adjust Parameters',
  'params.duration': 'Video Duration',
  'params.duration.15': '15 seconds',
  'params.duration.30': '30 seconds',
  'params.duration.60': '60 seconds',
  'params.style': 'Content Style',
  'params.style.simple': 'Simple',
  'params.style.elegant': 'Elegant',
  'params.style.funny': 'Funny',
  'params.style.suspenseful': 'Suspenseful',
  'params.apply': 'Apply',

  // Benchmark Page
  'benchmark.title': 'Benchmark Analysis',
  'benchmark.subtitle': 'See what works in your category',
  'benchmark.pro.required': 'Pro subscription required',
  'benchmark.top.videos': 'Top Performing Videos',
  'benchmark.hook.template': 'Hook Template',
  'benchmark.script.template': 'Script Template',
  'benchmark.engagement': 'Engagement',
  'benchmark.comments': 'Top Comments',
  'benchmark.upgrade': 'Upgrade to Pro',

  // Settings Page
  'settings.title': 'Settings',
  'settings.subscription': 'Subscription',
  'settings.current.plan': 'Current Plan',
  'settings.free.plan': 'Free Plan',
  'settings.usage': 'This month\'s usage: %d of %d',
  'settings.upgrade': 'Upgrade',
  'settings.manage': 'Manage Subscription',
  'settings.history': 'Generation History',
  'settings.privacy': 'Privacy & Data',
  'settings.privacy.policy': 'Privacy Policy',
  'settings.terms': 'Terms of Service',
  'settings.about': 'About',
  'settings.version': 'Version %@',
  'settings.contact': 'Contact Support',

  // Subscription Page
  'subscription.title': 'Choose Your Plan',
  'subscription.free.title': 'Free',
  'subscription.free.desc': 'Get started with %d free generations',
  'subscription.pro.title': 'Pro',
  'subscription.pro.badge': 'Most Popular',
  'subscription.subscribe': 'Subscribe',
  'subscription.restore': 'Restore Purchases',
  'subscription.tos': 'By subscribing, you agree to our Terms of Service and Privacy Policy.',

  // Privacy
  'privacy.title': 'Before You Continue',
  'privacy.subtitle': 'Please review our data processing terms',
  'privacy.agree': 'I Agree',
  'privacy.decline': 'Cancel',
  'privacy.learn.more': 'Learn More',

  // Errors
  'error.upload.failed': 'Failed to upload image. Please try again.',
  'error.analysis.failed': 'Analysis failed. Please try again.',
  'error.network': 'Network error. Please check your connection.',
  'error.subscription.failed': 'Subscription failed. Please try again.',

  // Categories
  'category.beauty': 'Beauty',
  'category.3c': 'Electronics',
  'category.clothing': 'Clothing',
  'category.home': 'Home & Living',
  'category.food': 'Food & Beverage',
  'category.other': 'Other',
};

export function useTranslation() {
  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    let text = translations[key] || key;
    
    if (params) {
      Object.entries(params).forEach(([paramKey, value]) => {
        text = text.replace(`%${paramKey}`, String(value));
        // 也处理简单的 %d 占位符
        text = text.replace('%d', String(value));
      });
    }
    
    return text;
  }, []);

  return { t };
}

// 同步版本的翻译函数（用于非 React 上下文）
export function getTranslation(key: string, params?: Record<string, string | number>): string {
  let text = translations[key] || key;
  
  if (params) {
    Object.entries(params).forEach(([paramKey, value]) => {
      text = text.replace(`%${paramKey}`, String(value));
      text = text.replace('%d', String(value));
    });
  }
  
  return text;
}

export default useTranslation;
