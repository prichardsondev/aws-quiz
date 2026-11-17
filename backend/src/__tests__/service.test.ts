import { QuizService, ValidationError } from '../service';
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

  it.each([
    ['missing fields', { question: 'Missing fields' }],
    ['whitespace question', { ...sampleQuestion, question: '   ' }],
    ['whitespace answer', { ...sampleQuestion, answer: ' ' }],
    ['non-array distractors', { ...sampleQuestion, distractors: 'a' as unknown as string[] }],
    ['no distractors', { ...sampleQuestion, distractors: [] }],
    ['empty distractor', { ...sampleQuestion, distractors: ['ok', ' '] }],
    ['non-string distractor', { ...sampleQuestion, distractors: [1 as unknown as string] }],
    ['null body', null as unknown as object],
  ])('rejects invalid payload: %s', async (_name, payload) => {
    const service = new QuizService(new InMemoryRepo());
    await expect(service.addQuestion('general', payload)).rejects.toThrow(ValidationError);
  });

  it('accepts exactly one distractor', async () => {
    const service = new QuizService(new InMemoryRepo());
    await expect(
      service.addQuestion('general', { ...sampleQuestion, distractors: ['only'] })
    ).resolves.toBeUndefined();
  });

  it.each(['', 'Upper', 'has space', '__proto__x<', 'a'.repeat(51)])(
    'rejects category %p',
    async (category) => {
      const service = new QuizService(new InMemoryRepo());
      await expect(service.getQuestions(category)).rejects.toThrow(ValidationError);
      await expect(service.addQuestion(category, sampleQuestion)).rejects.toThrow(ValidationError);
    }
  );
});
