import cors from 'cors';
import express from 'express';
import path from 'path';
import { JsonDb } from './db';
import { createRouter } from './router';
import { QuizService } from './service';

const DEFAULT_ORIGINS = [
  'https://awsquiz.raspberrynode.com',
  'http://localhost:4000',
  'https://awsquizapi.raspberrynode.com',
];

const allowedOrigins = () =>
  process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',').map((o) => o.trim()) : DEFAULT_ORIGINS;

export const createApp = (
  service: QuizService = new QuizService(new JsonDb()),
  apiKey: string | undefined = process.env.ADMIN_API_KEY
) => {
  const app = express();
  app.use(cors({ origin: allowedOrigins(), optionsSuccessStatus: 200 }));
  app.use(express.static(path.join(__dirname, '..', 'public')));
  app.use(express.json({ limit: '10kb' }));
  app.use(createRouter(service, apiKey));

  app.get('/', (_req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
  });

  return app;
};

export const app = createApp();
