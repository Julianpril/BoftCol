import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config.js';
import photoRoutes from './routes/photoRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import authRoutes from './routes/authRoutes.js';

const app: Express = express();

// ─── Security ───
app.use(helmet());
app.use(cors({
  origin: config.cors.clientUrl,
  credentials: true,
}));

// ─── Body parsing ───
app.use(express.json());

// ─── Routes ───
app.use('/api/photos', photoRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/auth', authRoutes);

// ─── Health Check ───
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: config.nodeEnv,
  });
});

// ─── Start server ───
app.listen(config.port, () => {
  console.log(`\n  🚀 BOFT Server running on http://localhost:${config.port}`);
  console.log(`  📁 Google Drive folder: ${config.google.driveFolderId || '(not configured)'}`);
  console.log(`  🔒 CORS origin: ${config.cors.clientUrl}\n`);
});

export default app;