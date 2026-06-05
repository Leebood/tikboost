import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 9091;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', message: 'TikBoost Backend is running!' });
});

// Import routes
import authRoutes from './routes/auth.js';
import videoRoutes from './routes/video.js';
import trendRoutes from './routes/trends.js';

// Use routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/video', videoRoutes);
app.use('/api/v1/trends', trendRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 TikBoost Backend server is running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/api/v1/health`);
});
