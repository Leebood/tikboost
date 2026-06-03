# TikBoost Release Checklist

Use this before every App Store or Google Play submission.

## 1. Product Scope

- [ ] Core positioning is clear: short-video strategy app for creators and e-commerce sellers.
- [ ] Create flow supports e-commerce and short-video modes.
- [ ] Templates flow includes e-commerce, creator growth, trends, and analysis templates.
- [ ] Analyze flow supports keyword and video URL analysis.
- [ ] Trends flow clearly separates real data from AI-generated recommendations.
- [ ] History flow saves generation tasks and can be cleared by the user.

## 2. Environment And Build

- [ ] `EXPO_PUBLIC_BACKEND_BASE_URL` is set to the production HTTPS API.
- [ ] `.env` is not committed.
- [ ] `package-lock.json` is committed.
- [ ] `npm install` completes successfully.
- [ ] `npm run lint` passes.
- [ ] `npx expo-doctor` has no unresolved release-blocking issues.
- [ ] `ios/` and `android/` native folders are not committed when using Expo/EAS managed prebuild.
- [ ] Production Android build uses AAB.
- [ ] iOS build number and Android version code increment for every submission.

## 3. Backend Contracts

- [ ] `POST /api/v1/analysis/start` accepts `imageUrl`, `duration`, `style`, `scene`, `templateId`, and `templateCue`.
- [ ] Analysis start returns a stable `taskId`.
- [ ] `GET /api/v1/analysis/status/:taskId` returns `status` and final `result`.
- [ ] Final result includes `hook`, `script`, `storyboard`, `bgm`, and `cta`.
- [ ] Video search/analyze endpoints return real data or clear errors, never mock data.
- [ ] Trend endpoints return real source-backed data or clear errors.
- [ ] `POST /api/v1/subscription/verify` validates Apple/Google purchase data server-side.
- [ ] Auth-required endpoints reject missing or invalid tokens.

## 4. Payments And Subscription

- [ ] App Store subscriptions exist: `com.libo.tikboost.starter`, `com.libo.tikboost.pro`, `com.libo.tikboost.ultimate`.
- [ ] Google Play subscriptions exist: `com.libo.tikboost.starter.android`, `com.libo.tikboost.pro.android`, `com.libo.tikboost.ultimate.android`.
- [ ] Purchases unlock paid features only after server verification.
- [ ] Restore purchases works on a real device.
- [ ] Free usage limits reset as intended.
- [ ] Deep analysis and premium template limits match the subscription plan.
- [ ] Store subscription descriptions match in-app plan descriptions.

## 5. Privacy And Permissions

- [ ] Privacy policy URL is live and public.
- [ ] Terms of service URL is live and public.
- [ ] Privacy policy names TikBoost consistently.
- [ ] Privacy policy discloses AI processing providers, uploaded images/content, auth data, purchases, and analytics if used.
- [ ] Camera permission is justified by product/content image capture.
- [ ] Photo library permission is justified by image upload.
- [ ] No unused location, microphone, ad tracking, or tracking permission remains in the binary.
- [ ] In-app privacy notice is shown before upload/analysis.
- [ ] Contact email works.

## 6. App Store Connect

- [ ] Bundle ID is `com.libo.tikboost`.
- [ ] App display name is TikBoost.
- [ ] App category is selected.
- [ ] Age rating is consistent with the app content and privacy wording.
- [ ] Privacy nutrition labels match actual data collection.
- [ ] Reviewer test account is provided if login is required.
- [ ] Reviewer notes explain AI/video analysis and subscription test steps.
- [ ] At least required iPhone screenshots are uploaded.
- [ ] Subscription products are approved or ready for review.

## 7. Google Play Console

- [ ] Package name is `com.libo.tikboost`.
- [ ] App content questionnaire is complete.
- [ ] Data safety form matches actual data collection.
- [ ] Privacy policy URL is set.
- [ ] Internal testing track has a signed AAB.
- [ ] Test users can access subscriptions.
- [ ] Store listing does not mention old brand names.
- [ ] Short description and full description match app functionality.
- [ ] Screenshots show Create, Templates, Analyze, Trends, and Settings/Billing.

## 8. Manual QA

- [ ] Fresh install opens Home successfully.
- [ ] Create flow works with camera.
- [ ] Create flow works with photo library.
- [ ] E-commerce mode sends `scene: "ecommerce"`.
- [ ] Short-video mode sends `scene: "shortvideo"`.
- [ ] Starting from a template sends `templateId` and `templateCue`.
- [ ] Analysis polling reaches Result screen with real output.
- [ ] Result copy buttons work.
- [ ] Analyze keyword flow handles success and failure.
- [ ] Analyze URL flow handles success and failure.
- [ ] Deep analysis respects usage limits.
- [ ] Trends handles success and failure.
- [ ] Settings subscription modal opens.
- [ ] Purchase, cancel purchase, and restore purchase paths are tested.
- [ ] History records generation tasks.
- [ ] Privacy and terms links open.
- [ ] Offline or backend-down states show clear errors.

## 9. Repository Hygiene

- [ ] Git root is the TikBoost project directory, not the user home directory.
- [ ] `node_modules/`, `.tools/`, `.env`, build artifacts, service account keys, and archives are ignored.
- [ ] No secrets are committed.
- [ ] No old brand references remain in user-facing files.
- [ ] No mock/demo fallback data is returned in production paths.
- [ ] Release commit includes `package-lock.json`.

## 10. Known Decisions

- [x] Submit with Expo/EAS cloud build.
- [ ] Keep native `ios/` and `android/` folders out of the release commit so EAS can generate them from `app.config.ts`.
- [ ] If using local iOS builds later, install CocoaPods 1.15.2 or newer.
- [ ] Decide whether Expo SDK 56 upgrade is required before release or deferred to a later release.
