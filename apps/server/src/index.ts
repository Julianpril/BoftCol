import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config.js';
import photoRoutes from './routes/photoRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import authRoutes from './routes/authRoutes.js';
import supportRoutes from './routes/supportRoutes.js';

import printCodeRoutes from './routes/printCodeRoutes.js';

const app: Express = express();

// ─── Seguridad ───
app.use(helmet());
app.use(cors({
  origin: config.cors.clientUrl,
  credentials: true,
}));

// ─── Parseo del body ───
app.use(express.json());

// ─── Rutas ───
app.use('/api/photos', photoRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/admin/codes', printCodeRoutes);

// ─── Estado del servidor ───
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: config.nodeEnv,
  });
});

// ─── Arrancamos ───
app.listen(config.port, () => {
  console.log(`\n  🚀 BOFT Server running on http://localhost:${config.port}`);
  console.log(`  🔒 CORS origin: ${config.cors.clientUrl}\n`);
});

export default app;