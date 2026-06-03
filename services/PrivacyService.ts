/**
 * Tracking & Privacy Service
 * Manages tracking permissions and privacy settings
 */

// Import AsyncStorage for persistent storage
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  TRACKING_ENABLED: '@privacy/tracking_enabled',
  ANALYTICS_ENABLED: '@privacy/analytics_enabled',
  AGE_CONFIRMED: '@privacy/age_confirmed',
  PRIVACY_ACCEPTED: '@privacy/accepted',
};

export interface PrivacySettings {
  trackingEnabled: boolean;
  analyticsEnabled: boolean;
  ageConfirmed: boolean;
  privacyAccepted: boolean;
}

/**
 * Get current privacy settings
 */
export async function getPrivacySettings(): Promise<PrivacySettings> {
  try {
    const [trackingEnabled, analyticsEnabled, ageConfirmed, privacyAccepted] = await Promise.all([
      AsyncStorage.getItem(STORAGE_KEYS.TRACKING_ENABLED),
      AsyncStorage.getItem(STORAGE_KEYS.ANALYTICS_ENABLED),
      AsyncStorage.getItem(STORAGE_KEYS.AGE_CONFIRMED),
      AsyncStorage.getItem(STORAGE_KEYS.PRIVACY_ACCEPTED),
    ]);

    return {
      // Default: tracking is disabled (privacy-first approach)
      trackingEnabled: trackingEnabled === 'true',
      // Default: analytics is enabled (for app improvement)
      analyticsEnabled: analyticsEnabled !== 'false',
      ageConfirmed: ageConfirmed === 'true',
      privacyAccepted: privacyAccepted === 'true',
    };
  } catch (error) {
    console.error('Error getting privacy settings:', error);
    return {
      trackingEnabled: false, // Default disabled
      analyticsEnabled: true,  // Default enabled
      ageConfirmed: false,
      privacyAccepted: false,
    };
  }
}

/**
 * Set tracking enabled state
 */
export async function setTrackingEnabled(enabled: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.TRACKING_ENABLED, enabled.toString());
  } catch (error) {
    console.error('Error setting tracking enabled:', error);
  }
}

/**
 * Set analytics enabled state
 */
export async function setAnalyticsEnabled(enabled: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.ANALYTICS_ENABLED, enabled.toString());
  } catch (error) {
    console.error('Error setting analytics enabled:', error);
  }
}

/**
 * Confirm user age (13+ requirement)
 */
export async function confirmAge(): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.AGE_CONFIRMED, 'true');
  } catch (error) {
    console.error('Error confirming age:', error);
  }
}

/**
 * Accept privacy policy
 */
export async function acceptPrivacy(): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.PRIVACY_ACCEPTED, 'true');
  } catch (error) {
    console.error('Error accepting privacy:', error);
  }
}

/**
 * Check if user is eligible (age 13+)
 */
export async function isUserEligible(): Promise<boolean> {
  const settings = await getPrivacySettings();
  return settings.ageConfirmed;
}

/**
 * Check if privacy has been accepted
 */
export async function hasAcceptedPrivacy(): Promise<boolean> {
  const settings = await getPrivacySettings();
  return settings.privacyAccepted;
}

/**
 * Reset all privacy settings (for testing/logout)
 */
export async function resetPrivacySettings(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.TRACKING_ENABLED,
      STORAGE_KEYS.ANALYTICS_ENABLED,
      STORAGE_KEYS.AGE_CONFIRMED,
      STORAGE_KEYS.PRIVACY_ACCEPTED,
    ]);
  } catch (error) {
    console.error('Error resetting privacy settings:', error);
  }
}

/**
 * Request tracking permission (iOS 14+)
 * Note: This only works on iOS devices
 */
export async function requestTrackingPermission(): Promise<boolean> {
  // Check if running on native platform
  if (typeof window !== 'undefined' && 'ontouchstart' in window) {
    // On mobile, we just enable it (actual ATT prompt will be shown by the system)
    await setTrackingEnabled(true);
    return true;
  }
  
  // On web or other platforms, just enable it
  await setTrackingEnabled(true);
  return true;
}

/**
 * Get minimum age requirement based on jurisdiction
 */
export function getMinimumAge(): number {
  // Most jurisdictions require 13, some require 16
  // You can customize this based on user's location if needed
  return 13;
}

/**
 * Check if user meets minimum age requirement
 */
export function isAboveMinimumAge(birthYear: number): boolean {
  const currentYear = new Date().getFullYear();
  const age = currentYear - birthYear;
  return age >= getMinimumAge();
}
