import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => {
  return {
    ...config,
    "name": "TikBoost",
    "slug": "tikboost",
    "version": "1.1.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "tikboost",
    "userInterfaceStyle": "automatic",
    "newArchEnabled": true,
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.libo.tikboost",
      "buildNumber": "4",
      "infoPlist": {
        "NSCameraUsageDescription": "TikBoost needs camera access to take photos of products for video strategy analysis.",
        "NSPhotoLibraryUsageDescription": "TikBoost needs photo library access to select product images for video strategy generation.",
        "ITSAppUsesNonExemptEncryption": false
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#000000"
      },
      "package": "com.libo.tikboost",
      "versionCode": 4,
      // Android 权限配置
      "permissions": [
        "CAMERA",
        "READ_MEDIA_IMAGES",
        "VIBRATE",
        "com.android.vending.BILLING",
        "INTERNET",
        "ACCESS_NETWORK_STATE"
      ],
      "blockedPermissions": [
        "android.permission.RECORD_AUDIO"
      ],
      // Google Play 配置
      "playStoreUrl": "https://play.google.com/store/apps/details?id=com.libo.tikboost",
      // 拦截链接配置
      "intentFilters": [
        {
          "action": "VIEW",
          "autoVerify": true,
          "data": [
            {
              "scheme": "https",
              "host": "tikboost.com",
              "pathPrefix": "/"
            }
          ],
          "category": ["BROWSABLE", "DEFAULT"]
        },
        {
          "action": "VIEW",
          "autoVerify": false,
          "data": [
            {
              "scheme": "tikboost"
            }
          ],
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ]
    },
    "web": {
      "bundler": "metro",
      "output": "single",
      "favicon": "./assets/images/favicon.png"
    },
    "plugins": [
      "expo-router",
      [
        "expo-splash-screen",
        {
          "image": "./assets/images/splash-icon.png",
          "imageWidth": 200,
          "resizeMode": "contain",
          "backgroundColor": "#000000"
        }
      ],
      [
        "expo-image-picker",
        {
          "photosPermission": "Allow TikBoost to access your photos to upload or save images.",
          "cameraPermission": "Allow TikBoost to use your camera to take photos for upload."
        }
      ]
    ],
    "experiments": {
      "typedRoutes": true
    },
    "extra": {
      "eas": {
        "projectId": "f292895a-5df4-408b-a179-11d80cab69b3"
      }
    }
  }
}
