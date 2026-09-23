import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config';
import { getStore } from './data';
import { resolveTenant } from './middleware/tenant';
import { errorHandler, notFound } from './middleware/error-handler';
import { api } from './routes';

export function createApp() {
  const app = express();
  app.use(helmet());
  app.use(cors({ origin: config.corsOrigin }));
  app.use(express.json({ limit: '1mb' }));
  if (config.nodeEnv !== 'test') app.use(morgan('dev'));

  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      dataLayer: getStore().kind,
      useMockData: config.useMockData,
      redisAdapter: config.enableRedisAdapter,
      time: new Date().toISOString(),
    });
  });

  app.use('/api/v1', resolveTenant, api);
  app.use(notFound);
  app.use(errorHandler);
  return app;
}
