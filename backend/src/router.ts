import { Router } from 'express';
import { QuizService } from './service';
import { buildController, requireApiKey } from './controller';

export const createRouter = (service: QuizService, apiKey?: string): Router => {
  const router = Router();
  const controller = buildController(service);

  router
    .route('/learn/:category')
    .get(controller.getQuestions)
    .post(requireApiKey(apiKey), controller.putQuestion);
  router.route('/categories').get(controller.getCategories);

  return router;
};
