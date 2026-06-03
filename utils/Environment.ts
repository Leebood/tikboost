const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

export function getBackendBaseUrl(): string {
  const value = process.env.EXPO_PUBLIC_BACKEND_BASE_URL;

  if (!value) {
    throw new Error('EXPO_PUBLIC_BACKEND_BASE_URL must be set for TikBoost builds.');
  }

  return trimTrailingSlash(value);
}
