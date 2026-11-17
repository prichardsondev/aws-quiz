import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { JsonDb } from '../db';
import { sampleQuestion } from './testUtils';

let dir: string;
let file: string;

beforeEach(async () => {
  dir = await fs.mkdtemp(path.join(os.tmpdir(), 'jsondb-'));
  file = path.join(dir, 'services.json');
});

afterEach(async () => {
  await fs.rm(dir, { recursive: true, force: true });
});

const readDisk = async () => JSON.parse(await fs.readFile(file, 'utf8'));

describe('JsonDb', () => {
  it('creates an empty file when none exists', async () => {
    const db = new JsonDb(file);
    await expect(db.listCategories()).resolves.toEqual([]);
    await expect(readDisk()).resolves.toEqual({ catagory: {} });
  });

  it('does not share state between instances after a missing file', async () => {
    await new JsonDb(file).post('general', sampleQuestion);
    const other = path.join(dir, 'other.json');
    await expect(new JsonDb(other).listCategories()).resolves.toEqual([]);
  });

  it('appends questions and persists them', async () => {
    await fs.writeFile(file, JSON.stringify({ catagory: { general: [] } }));
    const db = new JsonDb(file);
    await db.post('general', sampleQuestion);
    expect((await readDisk()).catagory.general).toEqual([sampleQuestion]);
    await expect(new JsonDb(file).get('general')).resolves.toEqual([sampleQuestion]);
  });

  it('keeps every write when posts run concurrently', async () => {
    const db = new JsonDb(file);
    await Promise.all(
      Array.from({ length: 20 }, (_, i) =>
        db.post('general', { ...sampleQuestion, question: `q${i}` })
      )
    );
    expect((await readDisk()).catagory.general).toHaveLength(20);
  });

  it('ignores inherited object keys as categories', async () => {
    const db = new JsonDb(file);
    await expect(db.get('constructor')).resolves.toEqual([]);
    await expect(db.get('toString')).resolves.toEqual([]);
  });

  it('throws on a corrupt file instead of overwriting it', async () => {
    await fs.writeFile(file, '{ not json');
    await expect(new JsonDb(file).listCategories()).rejects.toThrow();
    await expect(fs.readFile(file, 'utf8')).resolves.toBe('{ not json');
  });
});
