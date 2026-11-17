import fs from 'fs/promises';
import path from 'path';
import { Question, ServicesFile } from './types';

export interface QuestionRepository {
  get(category: string): Promise<Question[]>;
  post(category: string, question: Question): Promise<void>;
  getAll(): Promise<ServicesFile>;
  listCategories(): Promise<string[]>;
}

const DEFAULT_DATA_FILE =
  process.env.SERVICES_FILE || path.join(__dirname, '..', 'services.json');

const hasOwn = (obj: object, key: string) => Object.prototype.hasOwnProperty.call(obj, key);

const emptyData = (): ServicesFile => ({ catagory: {} });

export class JsonDb implements QuestionRepository {
  private cache: ServicesFile | null = null;
  // Serializes read-modify-write cycles so concurrent posts don't lose updates.
  private writeQueue: Promise<void> = Promise.resolve();

  constructor(private readonly filePath: string = DEFAULT_DATA_FILE) {}

  async get(category: string): Promise<Question[]> {
    const data = await this.load();
    return hasOwn(data.catagory, category) ? data.catagory[category] : [];
  }

  post(category: string, question: Question): Promise<void> {
    const run = this.writeQueue.then(async () => {
      const data = await this.load();
      if (!hasOwn(data.catagory, category)) {
        data.catagory[category] = [];
      }
      data.catagory[category].push(question);
      try {
        await this.writeFile(data);
      } catch (err) {
        this.cache = null; // drop the unsaved change so memory matches disk
        throw err;
      }
    });
    this.writeQueue = run.catch(() => undefined);
    return run;
  }

  async getAll(): Promise<ServicesFile> {
    return this.load();
  }

  async listCategories(): Promise<string[]> {
    const data = await this.load();
    return Object.keys(data.catagory);
  }

  private async load(): Promise<ServicesFile> {
    if (!this.cache) {
      this.cache = await this.readFile();
    }
    return this.cache;
  }

  private async readFile(): Promise<ServicesFile> {
    try {
      const content = await fs.readFile(this.filePath, 'utf8');
      const parsed = JSON.parse(content) as ServicesFile;
      parsed.catagory = parsed.catagory || {};
      return parsed;
    } catch (err: unknown) {
      if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
        const data = emptyData();
        await this.writeFile(data);
        return data;
      }
      throw err;
    }
  }

  // Write to a temp file and rename so a crash never leaves a truncated file.
  private async writeFile(data: ServicesFile): Promise<void> {
    const tmp = `${this.filePath}.${process.pid}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(data, null, 2), 'utf8');
    await fs.rename(tmp, this.filePath);
  }
}
