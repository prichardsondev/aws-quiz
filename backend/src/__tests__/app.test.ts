import request from 'supertest';
import { createApp } from '../app';
import { QuizService } from '../service';
import { InMemoryRepo, sampleQuestion } from './testUtils';

const setupTestApp = () => {
  const repo = new InMemoryRepo({ general: [sampleQuestion] });
  const service = new QuizService(repo);
  const app = createApp(service);
  return { app, repo };
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

  it('validates payload when creating new questions', async () => {
    const { app } = setupTestApp();
    const res = await request(app).post('/learn/general').send({ question: 'invalid' });
    expect(res.status).toBe(400);
  });

  it('allows creating a new question', async () => {
    const { app } = setupTestApp();
    const payload = {
      question: 'New question',
      answer: 'Answer',
      distractors: ['a', 'b', 'c'],
    };
    const createRes = await request(app).post('/learn/general').send(payload);
    expect(createRes.status).toBe(201);

    const fetchRes = await request(app).get('/learn/general');
    expect(fetchRes.body).toHaveLength(2);
  });
});
