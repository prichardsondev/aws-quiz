import { Router } from 'express';
import { QuizService } from './service';
import { buildController } from './controller';

export const createRouter = (service: QuizService): Router => {
  const router = Router();
  const controller = buildController(service);

  router.route('/learn/:category').get(controller.getQuestions).post(controller.putQuestion);
  router.route('/categories').get(controller.getCategories);

  return router;
};
