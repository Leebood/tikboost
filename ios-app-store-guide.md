# TikBoost - Xcode 发布到 App Store 详细指南

## 准备工作

### 1. 环境检查
```bash
# 检查 Node.js 版本 (需要 >= 18)
node --version

# 检查 npm 版本
npm --version

# 检查 Xcode 版本 (需要 >= 15)
xcodebuild -version

# 检查 CocoaPods (需要 >= 1.14)
pod --version
```

### 2. 安装 EAS CLI
```bash
npm install -g eas-cli
```

### 3. 登录 EAS
```bash
eas login
# 按照提示输入 Apple Developer 账号密码
```

---

## 第一步：生成本地 iOS 项目

```bash
cd /Users/leo/Documents/Codex/2026-06-03/github/tikboost

# 生成本地 iOS 项目（会创建 ios/ 目录）
npx expo prebuild --platform ios
```

> ⚠️ 如果 ios/ 目录已存在，会询问是否覆盖

---

## 第二步：配置 Apple Developer

### 1. 创建 App Store Connect 应用

1. 访问 [App Store Connect](https://appstoreconnect.apple.com)
2. 点击 **我的 App** → **+** → **新建 App**
3. 填写信息：
   - **平台**: iOS
   - **名称**: TikBoost
   - **主要语言**: 简体中文 或 English
   - **套装 ID**: com.libo.tikboost (需在 Apple Developer 创建)
   - **SKU**: tikboost-app
4. 点击 **创建**

### 2. 创建订阅产品 (IAP)

在 App Store Connect 中：

1. 进入刚创建的 App
2. 点击 **App 内购买项目**
3. 点击 **+** 创建订阅：
   - **订阅组**: TikBoost Subscription
   - **参考名称**: Starter Plan
   - **产品 ID**: `com.libo.tikboost.starter`
   - **订阅时长**: 1 个月
   - **价格**: $9.99
4. 重复创建 Pro ($29.99) 和 Ultimate ($59.99)

### 3. 创建 Apple Developer 证书

访问 [Apple Developer](https://developer.apple.com)：

1. 进入 **Certificates, Identifiers & Profiles**
2. 创建 **iOS Distribution** 证书
3. 创建 **App Store** 分发描述文件（选择 App 的 Bundle ID）

---

## 第三步：配置 Xcode 项目

### 1. 打开项目
```bash
cd /Users/leo/Documents/Codex/2026-06-03/github/tikboost/ios
open ReelAIApp.xcworkspace
```

### 2. 配置签名

在 Xcode 中：

1. 选择 **TikBoost** 项目
2. **Signing & Capabilities** 标签
3. 勾选 **Automatically manage signing**
4. 选择 **Team** (你的 Apple Developer 团队)
5. 确保 Bundle Identifier 为 `com.libo.tikboost`

### 3. 配置版本信息

- **Version**: 1.0.0
- **Build**: 1

---

## 第四步：构建 App Store 版本

### 方法一：使用 EAS Build（推荐）

```bash
cd /Users/leo/Documents/Codex/2026-06-03/github/tikboost

# 构建 iOS App Store 版本
eas build --platform ios --profile production

# 查看构建状态
eas build:list
```

### 方法二：使用 Xcode 本地构建

```bash
cd /Users/leo/Documents/Codex/2026-06-03/github/tikboost/ios

# 清理并构建
xcodebuild clean -workspace ReelAIApp.xcworkspace -scheme ReelAIApp
xcodebuild -workspace ReelAIApp.xcworkspace -scheme ReelAIApp \
  -configuration Release \
  -archivePath build/TikBoost.xcarchive \
  archive
```

### 方法三：使用 xcrun 命令导出

```bash
# 从 archive 导出 ipa
xcodebuild -exportArchive \
  -archivePath build/TikBoost.xcarchive \
  -exportPath build \
  -exportOptionsPlist ExportOptions.plist
```

---

## 第五步：上传到 App Store

### 使用 Transporter (推荐)

1. 下载 [Transporter](https://apps.apple.com/us/app/transporter/id1450874784) App
2. 用 Apple ID 登录
3. 拖入 `.ipa` 文件或点击 **+** 选择文件
4. 点击 **交付**

### 使用 Xcode Organizer

1. Xcode → **Window** → **Organizer**
2. 选择 **Archives**
3. 选择 TikBoost 的 archive
4. 点击 **Distribute App**
5. 选择 **App Store Connect**
6. 按照向导完成上传

---

## 第六步：提交审核

### 在 App Store Connect 中填写信息

1. **App 信息**
   - 副标题: TikTok Video Strategy AI
   - 类别: 工具 > 社交
   - 年龄分级: 13+

2. **App 隐私**
   - 填写隐私政策 URL
   - 回答所有隐私问题

3. **定价与可用性**
   - 配置订阅价格
   - 选择可用国家/地区

4. **App Store 截图**
   - 上传各尺寸截图
   - 尺寸参考:
     - iPhone 6.7": 1290×2796
     - iPhone 6.5": 1284×2778
     - iPhone 5.5": 1242×2208
     - iPad 12.9": 2048×2732

5. **App 描述**
   - 使用 `/workspace/projects/app-store-content.md` 中的内容

### 提交审核

1. 完成所有必填信息
2. 点击 **添加以供审核**
3. 等待 Apple 审核（通常 24-48 小时）

---

## 常见问题

### Q: 证书无效？
```
确保 Apple Developer 证书在有效期内
删除过期证书后重新创建
```

### Q: Bundle ID 冲突？
```
Bundle ID 必须唯一
在 Apple Developer 重新创建 App ID
```

### Q: IAP 无法购买？
```
确保 App Store Connect 中已创建订阅产品
产品 ID 必须与代码中一致
```

### Q: 审核被拒绝？
```
查看拒绝原因
参考 `/workspace/projects/RELEASE_CHECKLIST.md` 中的常见问题
```

---

## 快速检查清单

- [ ] Apple Developer 账号已注册 ($99/年)
- [ ] App Store Connect 应用已创建
- [ ] 订阅产品已配置 (starter/pro/ultimate)
- [ ] IAP 协议已签署
- [ ] Bundle ID 已注册
- [ ] 隐私政策 URL 已配置
- [ ] App Store 截图已上传
- [ ] 版本号已更新
- [ ] 构建版本已上传
- [ ] 所有信息已填写完成

---

## 参考链接

- [App Store Connect](https://appstoreconnect.apple.com)
- [Apple Developer](https://developer.apple.com)
- [EAS Build 文档](https://docs.expo.dev/build/introduction/)
- [Transporter 下载](https://apps.apple.com/us/app/transporter/id1450874784)
