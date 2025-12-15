import { QuestionRepository } from './db';
import { Question, QuestionPayload } from './types';

const MIN_DISTRACTORS = 1;

export class QuizService {
  constructor(private readonly repository: QuestionRepository) {}

  async addQuestion(category: string, payload: QuestionPayload): Promise<void> {
    if (!category) {
      throw new Error('Category is required');
    }
    if (!isValidQuestion(payload)) {
      throw new Error('Invalid question payload');
    }
    await this.repository.post(category, payload);
  }

  getQuestions(category: string): Promise<Question[]> {
    if (!category) {
      throw new Error('Category is required');
    }
    return this.repository.get(category);
  }

  async getCategories(): Promise<string[]> {
    const categories = await this.repository.listCategories();
    return categories;
  }
}

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
