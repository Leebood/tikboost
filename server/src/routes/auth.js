import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'tikboost-secret-key-change-in-production';

// 模拟用户数据库
const users = new Map();
const verificationCodes = new Map();

// 发送验证码
router.post('/send-verification', (req, res) => {
  const { email } = req.body;
  
  // 生成6位验证码
  const code = Math.random().toString().slice(2, 8);
  verificationCodes.set(email, code);
  
  console.log(`[AUTH] Verification code for ${email}: ${code}`);
  
  res.json({ success: true, message: 'Verification code sent' });
});

// 验证验证码
router.post('/verify-code', (req, res) => {
  const { email, code } = req.body;
  const storedCode = verificationCodes.get(email);
  
  if (storedCode === code) {
    res.json({ success: true, verified: true });
  } else {
    res.json({ success: false, error: 'Invalid verification code' });
  }
});

// 注册
router.post('/register', async (req, res) => {
  const { email, password, code, ageRange } = req.body;
  
  // 验证验证码
  const storedCode = verificationCodes.get(email);
  if (storedCode !== code) {
    return res.json({ success: false, error: 'Invalid verification code' });
  }
  
  // 检查用户是否已存在
  if (users.has(email)) {
    return res.json({ success: false, error: 'User already exists' });
  }
  
  // 哈希密码
  const hashedPassword = await bcrypt.hash(password, 10);
  
  // 创建用户
  const user = {
    id: Date.now().toString(),
    email,
    password: hashedPassword,
    ageRange,
    isMinor: ageRange === 'under_13' || ageRange === '13_17',
    subscription: {
      type: 'free',
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000 // 30天
    },
    createdAt: Date.now()
  };
  
  users.set(email, user);
  verificationCodes.delete(email);
  
  // 生成JWT
  const token = jwt.sign({ userId: user.id, email }, JWT_SECRET, { expiresIn: '30d' });
  
  console.log(`[AUTH] User registered: ${email}`);
  
  res.json({
    success: true,
    token,
    user: {
      id: user.id,
      email: user.email,
      ageRange: user.ageRange,
      isMinor: user.isMinor,
      subscription: user.subscription,
      createdAt: user.createdAt
    }
  });
});

// 登录
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  const user = users.get(email);
  if (!user) {
    return res.json({ success: false, error: 'User not found' });
  }
  
  // 验证密码
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return res.json({ success: false, error: 'Invalid password' });
  }
  
  // 生成JWT
  const token = jwt.sign({ userId: user.id, email }, JWT_SECRET, { expiresIn: '30d' });
  
  console.log(`[AUTH] User logged in: ${email}`);
  
  res.json({
    success: true,
    token,
    user: {
      id: user.id,
      email: user.email,
      ageRange: user.ageRange,
      isMinor: user.isMinor,
      subscription: user.subscription,
      createdAt: user.createdAt
    }
  });
});

// 忘记密码
router.post('/forgot-password', (req, res) => {
  const { email } = req.body;
  
  // 生成重置token
  const resetToken = Math.random().toString(36).slice(2, 15);
  console.log(`[AUTH] Password reset token for ${email}: ${resetToken}`);
  
  res.json({ success: true, message: 'Password reset email sent' });
});

// 重置密码
router.post('/reset-password', async (req, res) => {
  const { email, token, newPassword } = req.body;
  
  const user = users.get(email);
  if (!user) {
    return res.json({ success: false, error: 'User not found' });
  }
  
  // 更新密码
  user.password = await bcrypt.hash(newPassword, 10);
  
  console.log(`[AUTH] Password reset for: ${email}`);
  
  res.json({ success: true });
});

// 获取当前用户
router.get('/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.json({ success: false, error: 'No token provided' });
  }
  
  try {
    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const user = users.get(decoded.email);
    if (!user) {
      return res.json({ success: false, error: 'User not found' });
    }
    
    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        ageRange: user.ageRange,
        isMinor: user.isMinor,
        subscription: user.subscription,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.json({ success: false, error: 'Invalid token' });
  }
});

// 登出
router.post('/logout', (req, res) => {
  res.json({ success: true });
});

export default router;
