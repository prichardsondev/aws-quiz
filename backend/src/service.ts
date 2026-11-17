import { QuestionRepository } from './db';
import { Question, QuestionPayload } from './types';

const MIN_DISTRACTORS = 1;
const CATEGORY_PATTERN = /^[a-z0-9_]{1,50}$/;

export class ValidationError extends Error {}

export class QuizService {
  constructor(private readonly repository: QuestionRepository) {}

  async addQuestion(category: string, payload: QuestionPayload): Promise<void> {
    assertValidCategory(category);
    if (!isValidQuestion(payload)) {
      throw new ValidationError('Invalid question payload');
    }
    await this.repository.post(category, payload);
  }

  async getQuestions(category: string): Promise<Question[]> {
    assertValidCategory(category);
    return this.repository.get(category);
  }

  async getCategories(): Promise<string[]> {
    const categories = await this.repository.listCategories();
    return categories;
  }
}

const assertValidCategory = (category: string) => {
  if (!CATEGORY_PATTERN.test(category ?? '')) {
    throw new ValidationError('Invalid category');
  }
};

const isValidQuestion = (payload: QuestionPayload): payload is Question => {
  return Boolean(
    payload &&
      typeof payload.question === 'string' &&
      payload.question.trim() &&
      typeof payload.answer === 'string' &&
      payload.answer.trim() &&
      Array.isArray(payload.distractors) &&
      payload.distractors.length >= MIN_DISTRACTORS &&
      payload.distractors.every((option) => typeof option === 'string' && option.trim())
  );
};
