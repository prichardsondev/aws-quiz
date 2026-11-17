import request from 'supertest';
import { createApp } from '../app';
import { QuizService } from '../service';
import { InMemoryRepo, sampleQuestion } from './testUtils';

const API_KEY = 'test-key';

const setupTestApp = (apiKey = API_KEY) => {
  const repo = new InMemoryRepo({ general: [sampleQuestion] });
  const service = new QuizService(repo);
  const app = createApp(service, apiKey);
  return { app, repo };
};

const newQuestion = {
  question: 'New question',
  answer: 'Answer',
  distractors: ['a', 'b', 'c'],
};

describe('app routes', () => {
  it('returns available categories', async () => {
    const { app } = setupTestApp();
    const res = await request(app).get('/categories');
    expect(res.status).toBe(200);
    expect(res.body).toContain('general');
  });

  it('retrieves questions for a category', async () => {
    const { app } = setupTestApp();
    const res = await request(app).get('/learn/general');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  it.each(['Bad<script>', 'a'.repeat(51)])('rejects category name %s', async (category) => {
    const { app } = setupTestApp();
    const res = await request(app).get(`/learn/${encodeURIComponent(category)}`);
    expect(res.status).toBe(400);
  });

  it.each(['constructor', '__proto__'])('returns no questions for object key %s', async (category) => {
    const { app } = setupTestApp();
    const res = await request(app).get(`/learn/${category}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('validates payload when creating new questions', async () => {
    const { app } = setupTestApp();
    const res = await request(app)
      .post('/learn/general')
      .set('Authorization', `Bearer ${API_KEY}`)
      .send({ question: 'invalid' });
    expect(res.status).toBe(400);
  });

  it('allows creating a new question with the API key', async () => {
    const { app } = setupTestApp();
    const createRes = await request(app)
      .post('/learn/general')
      .set('Authorization', `Bearer ${API_KEY}`)
      .send(newQuestion);
    expect(createRes.status).toBe(201);

    const fetchRes = await request(app).get('/learn/general');
    expect(fetchRes.body).toHaveLength(2);
    expect(fetchRes.body[1]).toEqual(newQuestion);
  });

  it('rejects writes without the API key', async () => {
    const { app, repo } = setupTestApp();
    const res = await request(app).post('/learn/general').send(newQuestion);
    expect(res.status).toBe(401);
    await expect(repo.get('general')).resolves.toHaveLength(1);
  });

  it('rejects writes with a wrong API key', async () => {
    const { app } = setupTestApp();
    const res = await request(app)
      .post('/learn/general')
      .set('Authorization', 'Bearer nope')
      .send(newQuestion);
    expect(res.status).toBe(401);
  });

  it('disables writes when no API key is configured', async () => {
    const { app } = setupTestApp('');
    const res = await request(app)
      .post('/learn/general')
      .set('Authorization', 'Bearer ')
      .send(newQuestion);
    expect(res.status).toBe(403);
  });

  it('returns 500 when the repository fails', async () => {
    const repo = new InMemoryRepo();
    jest.spyOn(repo, 'get').mockRejectedValue(new Error('disk on fire'));
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const app = createApp(new QuizService(repo), API_KEY);
    const res = await request(app).get('/learn/general');
    expect(res.status).toBe(500);
  });
});
