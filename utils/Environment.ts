const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

export function getBackendBaseUrl(): string {
  const value = process.env.EXPO_PUBLIC_BACKEND_BASE_URL;

  if (!value) {
    // 开发时提供默认值，方便测试
    if (__DEV__) {
      console.warn('EXPO_PUBLIC_BACKEND_BASE_URL not set, using default for development');
      return 'http://localhost:9091';
    }
    throw new Error('EXPO_PUBLIC_BACKEND_BASE_URL must be set for TikBoost builds.');
  }

  return trimTrailingSlash(value);
}
