import cors from 'cors';
import express from 'express';
import path from 'path';
import { JsonDb } from './db';
import { createRouter } from './router';
import { QuizService } from './service';

const corsOptions: cors.CorsOptions = {
  origin: [
    'https://awsquiz.raspberrynode.com',
    'http://localhost:4000',
    'https://awsquizapi.raspberrynode.com',
  ],
  optionsSuccessStatus: 200,
};

export const createApp = (service: QuizService = new QuizService(new JsonDb())) => {
  const app = express();
  app.use(cors(corsOptions));
  app.use(express.static(path.join(__dirname, '..', 'public')));
  app.use(express.json());
  app.use(createRouter(service));

  app.get('/', (_req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
  });

  return app;
};

export const app = createApp();
