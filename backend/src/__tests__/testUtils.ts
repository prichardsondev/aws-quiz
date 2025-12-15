import { QuestionRepository } from '../db';
import { Question } from '../types';

export class InMemoryRepo implements QuestionRepository {
  private data: Record<string, Question[]> = {};

  constructor(seed: Record<string, Question[]> = {}) {
    this.data = seed;
  }

  get(category: string): Promise<Question[]> {
    return Promise.resolve(this.data[category] ?? []);
  }

  async post(category: string, question: Question): Promise<void> {
    if (!this.data[category]) {
      this.data[category] = [];
    }
    this.data[category].push(question);
  }

  getAll(): Promise<{ catagory: Record<string, Question[]> }> {
    return Promise.resolve({ catagory: this.data });
  }

  listCategories(): Promise<string[]> {
    return Promise.resolve(Object.keys(this.data));
  }
}

export const sampleQuestion: Question = {
  question: 'What does AWS stand for?',
  answer: 'Amazon Web Services',
  distractors: ['Amazon Web Storage', 'Advanced Web Services', 'Amazon Wide Services'],
};
