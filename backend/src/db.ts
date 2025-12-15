import fs from 'fs/promises';
import path from 'path';
import { Question, QuestionPayload, ServicesFile } from './types';

export interface QuestionRepository {
  get(category: string): Promise<Question[]>;
  post(category: string, question: Question): Promise<void>;
  getAll(): Promise<ServicesFile>;
  listCategories(): Promise<string[]>;
}

const DEFAULT_DATA_FILE =
  process.env.SERVICES_FILE || path.join(__dirname, '..', 'services.json');

const EMPTY_DATA: ServicesFile = { catagory: {} };

export class JsonDb implements QuestionRepository {
  constructor(private readonly filePath: string = DEFAULT_DATA_FILE) {}

  async get(category: string): Promise<Question[]> {
    const data = await this.readFile();
    return data.catagory[category] ?? [];
  }

  async post(category: string, question: Question): Promise<void> {
    const data = await this.readFile();
    if (!data.catagory[category]) {
      data.catagory[category] = [];
    }
    data.catagory[category].push(question);
    await this.writeFile(data);
  }

  async getAll(): Promise<ServicesFile> {
    return this.readFile();
  }

  async listCategories(): Promise<string[]> {
    const data = await this.readFile();
    return Object.keys(data.catagory || {});
  }

  private async readFile(): Promise<ServicesFile> {
    try {
      const content = await fs.readFile(this.filePath, 'utf8');
      const parsed = JSON.parse(content) as ServicesFile;
      parsed.catagory = parsed.catagory || {};
      return parsed;
    } catch (err: unknown) {
      if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
        await this.writeFile(EMPTY_DATA);
        return EMPTY_DATA;
      }
      throw err;
    }
  }

  private async writeFile(data: ServicesFile): Promise<void> {
    await fs.writeFile(this.filePath, JSON.stringify(data, null, 2), 'utf8');
  }
}
