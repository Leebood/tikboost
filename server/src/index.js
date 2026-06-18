import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'TikBoost Backend is running!',
    timestamp: new Date().toISOString()
  });
});

import authRoutes from './routes/auth.js';
import videoRoutes from './routes/video.js';
import trendsRoutes from './routes/trends.js';
import analysisRoutes from './routes/analysis.js';
import cozeWorkflowRoutes from './routes/cozeWorkflow.js';
import uploadRoutes from './routes/upload.js';
import subscriptionRoutes from './routes/subscription.js';

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/video', videoRoutes);
app.use('/api/v1/trends', trendsRoutes);
app.use('/api/v1/analysis', analysisRoutes);
app.use('/api/v1/coze/workflow', cozeWorkflowRoutes);
app.use('/api/v1', uploadRoutes);
app.use('/api/v1/subscription', subscriptionRoutes);

app.listen(PORT, () => {
  console.log(`🚀 TikBoost Backend server is running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/api/v1/health`);
  console.log("==> Your service is live 🎉");
});
