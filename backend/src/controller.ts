import { Request, Response } from 'express';
import { QuizService } from './service';

export const buildController = (service: QuizService) => ({
  putQuestion: async (req: Request, res: Response) => {
    try {
      await service.addQuestion(req.params.category, req.body);
      res.sendStatus(201);
    } catch (error) {
      if (isClientError(error)) {
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
      if (isClientError(error)) {
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

const isClientError = (error: unknown): error is Error => {
  return error instanceof Error && error.message.toLowerCase().includes('invalid');
};
