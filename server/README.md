# TikBoost 后端部署指南

## 概述

这是 TikBoost 应用的后端 API 服务，使用 Node.js + Express 构建。

## 功能

- ✅ 用户认证（注册、登录、验证码）
- ✅ 视频搜索和分析
- ✅ 趋势分析
- ✅ 模拟数据（可随时替换为真实逻辑）

## 快速开始 - 本地开发

```bash
# 进入后端目录
cd server

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 或直接启动
npm start
```

服务将在 http://localhost:9091 启动

## 测试 API

健康检查：
```bash
curl http://localhost:9091/api/v1/health
```

## 部署到 Render

### 方法 1：一键部署（推荐）

1. **准备代码**
   - 确保后端代码在 GitHub 仓库中
   - 仓库应该包含 `server/` 目录

2. **在 Render 上创建 Web Service**
   - 访问 https://render.com
   - 注册/登录（用 GitHub 账号）
   - 点击 "New +" → "Web Service"
   - 选择你的 GitHub 仓库

3. **配置部署**
   - **Name**: `tikboost-backend`
   - **Root Directory**: `server` （重要！）
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: 选择 **Free**

4. **点击 "Create Web Service"**
   - 等待部署完成
   - 完成后你会得到一个地址，如：`https://tikboost-backend.onrender.com`

### 方法 2：使用完整仓库

如果把整个项目部署：
- **Root Directory**: 留空
- **Build Command**: `cd server && npm install`
- **Start Command**: `cd server && npm start`

## 绑定自定义域名

### 在 Render 中设置

1. 进入你的 Web Service 后台
2. 找到 "Custom Domains" 部分
3. 点击 "Add Custom Domain"
4. 输入：`api.ailiveonline.cloud`

### 在域名服务商设置 DNS

1. 登录你的域名管理平台
2. 添加 CNAME 记录：
   - **主机记录**: `api`
   - **记录值**: Render 给你的地址（如 `tikboost-backend.onrender.com`）

## 更新前端配置

部署成功后，更新前端的 `eas.json`：

```json
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_BACKEND_BASE_URL": "https://api.ailiveonline.cloud"
      }
    }
  }
}
```

或者用 Render 给的临时地址：

```json
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_BACKEND_BASE_URL": "https://tikboost-backend.onrender.com"
      }
    }
  }
}
```

## API 接口文档

### 认证相关

- `POST /api/v1/auth/send-verification` - 发送验证码
- `POST /api/v1/auth/verify-code` - 验证验证码
- `POST /api/v1/auth/register` - 注册
- `POST /api/v1/auth/login` - 登录
- `POST /api/v1/auth/forgot-password` - 忘记密码
- `POST /api/v1/auth/reset-password` - 重置密码
- `GET /api/v1/auth/me` - 获取当前用户
- `POST /api/v1/auth/logout` - 登出

### 视频相关

- `POST /api/v1/video/search` - 搜索视频
- `GET /api/v1/video/execution-report/:videoId` - 获取执行报告
- `GET /api/v1/video/analyze/:videoId` - 分析视频
- `GET /api/v1/video/deep-analysis/:videoId` - 深度分析

### 趋势相关

- `POST /api/v1/trends/analyze` - 分析趋势
- `GET /api/v1/trends/topics` - 搜索相关话题
- `GET /api/v1/trends/platform` - 获取平台趋势

### 健康检查

- `GET /api/v1/health` - 健康检查

## 注意事项

### Free 实例限制

- 15 分钟不活动会自动休眠
- 首次请求可能需要几秒钟唤醒
- 适合测试和小规模使用

### 升级建议

如果需要更好的性能，可以升级到付费实例：
- Starter: $7/月
- Standard: $25/月

## 下一步

1. ✅ 把后端代码推到 GitHub
2. ✅ 在 Render 上部署
3. ✅ 测试 API 是否正常工作
4. ✅ 更新前端配置中的后端地址
5. ✅ 重新构建前端应用

## 需要帮助？

如果部署过程中遇到问题，检查：
1. Root Directory 是否设置正确
2. Build Command 和 Start Command 是否正确
3. Render 的日志中是否有错误信息
