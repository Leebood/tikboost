/**
 * Sensitive Words Filter
 * 美国文化禁忌词过滤
 * 用于过滤 AI 生成内容中的敏感词汇
 */

// 美国常见禁忌词列表（简化版示例）
const US_CULTURAL_TABOO_WORDS = [
  // 政治敏感词
  'republican',
  'democrat',
  'trump',
  'biden',
  'politician',
  'liberal',
  'conservative',
  
  // 宗教敏感词
  'god',
  'jesus',
  'christian',
  'muslim',
  'jewish',
  'bible',
  'quran',
  
  // 暴力相关
  'kill',
  'murder',
  'attack',
  'weapon',
  'gun',
  'shoot',
  'blood',
  
  // 种族相关
  'white power',
  'black power',
  'n-word',
  'racist',
  
  // 色情低俗
  'sex',
  'naked',
  'sexy',
  'hot girl',
  'hot guy',
  
  // 毒品相关
  'drug',
  'cocaine',
  'weed',
  'marijuana',
  'high',
  
  // 歧视性词汇
  'fat',
  'ugly',
  'stupid',
  'dumb',
];

// 替换映射表
const REPLACEMENT_MAP: Record<string, string> = {
  republican: '[political]',
  democrat: '[political]',
  trump: '[political_figure]',
  biden: '[political_figure]',
  politician: '[politics]',
  liberal: '[ideology]',
  conservative: '[ideology]',
  god: '[divine]',
  jesus: '[religious]',
  christian: '[faith]',
  muslim: '[faith]',
  jewish: '[faith]',
  bible: '[sacred_text]',
  quran: '[sacred_text]',
  kill: '[action]',
  murder: '[action]',
  attack: '[action]',
  weapon: '[item]',
  gun: '[item]',
  shoot: '[action]',
  blood: '[medical]',
  drug: '[substance]',
  cocaine: '[substance]',
  weed: '[substance]',
  marijuana: '[substance]',
  high: '[state]',
};

// 钩子必需包含的元素类型
const HOOK_TYPES = ['surprise', 'pain point', 'suspense', 'price'];

/**
 * 过滤文本中的敏感词
 * @param text 输入文本
 * @returns 过滤后的文本
 */
export function filterSensitiveWords(text: string): string {
  let filteredText = text.toLowerCase();

  // 逐个检查敏感词并替换
  US_CULTURAL_TABOO_WORDS.forEach((word) => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    filteredText = filteredText.replace(regex, REPLACEMENT_MAP[word] || '[filtered]');
  });

  return filteredText;
}

/**
 * 验证钩子是否包含必需元素
 * @param hook 钩子文本
 * @returns 是否有效
 */
export function validateHook(hook: string): boolean {
  const lowerHook = hook.toLowerCase();
  return HOOK_TYPES.some((type) => lowerHook.includes(type));
}

/**
 * 获取钩子类型
 * @param hook 钩子文本
 * @returns 匹配的钩子类型
 */
export function getHookType(hook: string): string | null {
  const lowerHook = hook.toLowerCase();
  for (const type of HOOK_TYPES) {
    if (lowerHook.includes(type)) {
      return type;
    }
  }
  return null;
}

/**
 * 限制脚本长度
 * @param script 脚本文本
 * @param maxWords 最大单词数
 * @returns 截断后的脚本
 */
export function limitScriptLength(script: string, maxWords: number = 200): string {
  const words = script.split(/\s+/);
  if (words.length <= maxWords) {
    return script;
  }
  return words.slice(0, maxWords).join(' ') + '...';
}

/**
 * 完整的内容清洗流程
 * @param content AI 生成的内容
 * @returns 清洗后的内容
 */
export interface CleanedContent {
  hook: string;
  script: string;
  storyboard: string[];
  bgm: string;
  cta: string;
  hookType: string | null;
  warnings: string[];
}

export function cleanGeneratedContent(content: {
  hook: string;
  script: string;
  storyboard: string[];
  bgm: string;
  cta: string;
}): CleanedContent {
  const warnings: string[] = [];

  // 1. 过滤敏感词
  let hook = filterSensitiveWords(content.hook);
  let script = filterSensitiveWords(content.script);
  let bgm = filterSensitiveWords(content.bgm);
  let cta = filterSensitiveWords(content.cta);
  const storyboard = content.storyboard.map((shot) =>
    filterSensitiveWords(shot)
  );

  // 2. 验证钩子
  const hookType = getHookType(content.hook);
  if (!hookType) {
    warnings.push('Hook may not have sufficient attention-grabbing elements');
    // 如果没有匹配的类型，可以添加默认的惊叹元素
    if (!hook.includes('!') && !hook.includes('?')) {
      hook = 'Wait for it... ' + hook;
    }
  }

  // 3. 限制脚本长度
  const originalLength = script.split(/\s+/).length;
  if (originalLength > 200) {
    script = limitScriptLength(content.script, 200);
    warnings.push(`Script shortened from ${originalLength} to 200 words`);
  }

  // 4. 检查并清理常见问题
  // 移除多余的空白
  hook = hook.replace(/\s+/g, ' ').trim();
  script = script.replace(/\s+/g, ' ').trim();
  cta = cta.replace(/\s+/g, ' ').trim();

  return {
    hook,
    script,
    storyboard,
    bgm,
    cta,
    hookType,
    warnings,
  };
}

/**
 * 图片内容安全检测（客户端初步检测）
 * @param imageUri 图片 URI
 * @returns 是否通过初步检测
 */
export function isImageSafe(imageUri: string): boolean {
  // 客户端只能做基础检测，真正的违规检测在服务端
  // 这里可以做文件名检测等基础措施
  const unsafePatterns = ['nsfw', 'xxx', 'porn', 'gore'];
  const lowerUri = imageUri.toLowerCase();
  return !unsafePatterns.some((pattern) => lowerUri.includes(pattern));
}

export default {
  filterSensitiveWords,
  validateHook,
  getHookType,
  limitScriptLength,
  cleanGeneratedContent,
  isImageSafe,
  HOOK_TYPES,
};
