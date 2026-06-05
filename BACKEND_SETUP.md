# TikBoost 后端地址配置指南

## 环境配置方案

### 1. 本地开发（当前方案）

已为你配置好本地开发环境：

- **文件位置**: `.env` (已创建)
- **配置内容**:
  ```env
  EXPO_PUBLIC_BACKEND_BASE_URL=http://localhost:9091
  ```
- **使用场景**: 本地开发、调试

### 2. EAS 构建配置（已配置）

已在 `eas.json` 中配置三种构建环境：

#### 开发构建 (development)
- 后端地址: `http://localhost:9091`
- 用途: 内部测试、开发版本

#### 预览构建 (preview)
- 后端地址: `http://localhost:9091`
- 用途: 内部预览、测试分发

#### 生产构建 (production)
- 后端地址: `https://api.tikboost.com`
- 用途: App Store / Google Play 上架

## 使用步骤

### 本地开发测试
```bash
# 1. 确保 .env 文件存在（已创建）
# 2. 启动开发服务器
npm start

# 3. 开发时，应用会自动使用 .env 中的配置
```

### EAS 构建测试
```bash
# 1. 开发构建（用于内部测试）
npx eas-cli build --platform ios --profile development

# 2. 预览构建（用于预览测试）
npx eas-cli build --platform ios --profile preview

# 3. 生产构建（用于上架）
npx eas-cli build --platform ios --profile production
```

## 如何修改后端地址

### 临时修改（仅本地）
直接编辑 `.env` 文件：
```env
EXPO_PUBLIC_BACKEND_BASE_URL=https://your-custom-api.com
```

### 永久修改（EAS 构建）
编辑 `eas.json`，修改对应 profile 的 `env.EXPO_PUBLIC_BACKEND_BASE_URL`。

### 生产环境地址
上架前，请确保：
1. 已部署生产后端到 `https://api.tikboost.com`
2. 或在 `eas.json` 的 production profile 中修改为你的真实生产地址

## 当前状态

✅ 本地 .env 文件已创建
✅ eas.json 已配置三种环境
✅ Environment.ts 支持开发模式默认值
✅ 所有 EAS Build 问题已修复

可以开始测试和上架了！
