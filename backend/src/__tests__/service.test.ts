import { QuizService } from '../service';
import { InMemoryRepo, sampleQuestion } from './testUtils';

describe('QuizService', () => {
  it('returns questions for a category', async () => {
    const repo = new InMemoryRepo({ general: [sampleQuestion] });
    const service = new QuizService(repo);
    await expect(service.getQuestions('general')).resolves.toHaveLength(1);
  });

  it('adds a new question', async () => {
    const repo = new InMemoryRepo({ general: [] });
    const service = new QuizService(repo);
    await service.addQuestion('general', sampleQuestion);
    await expect(service.getQuestions('general')).resolves.toHaveLength(1);
  });

  it('rejects invalid payloads', async () => {
    const repo = new InMemoryRepo();
    const service = new QuizService(repo);
    await expect(
      service.addQuestion('general', { question: 'Missing fields' })
    ).rejects.toThrow('Invalid question payload');
  });
});
