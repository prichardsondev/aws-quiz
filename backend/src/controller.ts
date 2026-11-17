import { NextFunction, Request, Response } from 'express';
import crypto from 'crypto';
import { QuizService, ValidationError } from './service';

export const buildController = (service: QuizService) => ({
  putQuestion: async (req: Request, res: Response) => {
    try {
      await service.addQuestion(req.params.category, req.body);
      res.sendStatus(201);
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({ message: error.message });
        return;
      }
      console.error('controller.putQuestion', error);
      res.sendStatus(500);
    }
  },

  getQuestions: async (req: Request, res: Response) => {
    try {
      const questions = await service.getQuestions(req.params.category);
      res.json(questions);
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({ message: error.message });
        return;
      }
      console.error('controller.getQuestions', error);
      res.sendStatus(500);
    }
  },

  getCategories: async (_req: Request, res: Response) => {
    try {
      const categories = await service.getCategories();
      res.json(categories);
    } catch (error) {
      console.error('controller.getCategories', error);
      res.sendStatus(500);
    }
  },
});

// Writes are disabled unless ADMIN_API_KEY is set; callers must send it as a bearer token.
export const requireApiKey = (apiKey: string | undefined) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!apiKey) {
      res.sendStatus(403);
      return;
    }
    const header = req.get('authorization') ?? '';
    const expected = Buffer.from(`Bearer ${apiKey}`);
    const actual = Buffer.from(header);
    if (actual.length !== expected.length || !crypto.timingSafeEqual(actual, expected)) {
      res.sendStatus(401);
      return;
    }
    next();
  };
};
