import { jest } from '@jest/globals';
import request from 'supertest';
import { mockDeep } from 'jest-mock-extended';

// These tests never actually need the database (they exercise routes
// that fail validation/authorization before any Prisma call), but the
// app module graph still imports the Prisma client singleton at load
// time, so it's mocked here purely to keep this suite runnable in any
// environment, generated Prisma client or not.
jest.unstable_mockModule('../../src/config/prisma.js', () => ({ prisma: mockDeep() }));

const { app } = await import('../../src/app.js');

describe('GET /api/health', () => {
  it('returns 200 ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});

describe('unknown routes', () => {
  it('returns a clean 404 JSON body', async () => {
    const res = await request(app).get('/api/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body.status).toBe('fail');
  });
});

describe('protected routes without a session', () => {
  it('rejects with 401 when no auth cookie/header is present', async () => {
    const res = await request(app).get('/api/rentals/mine');
    expect(res.status).toBe(401);
  });

  it('rejects admin-only routes with 401 when unauthenticated', async () => {
    const res = await request(app).get('/api/admin/users');
    expect(res.status).toBe(401);
  });
});

describe('input validation', () => {
  it('rejects a malformed login payload with 400', async () => {
    const res = await request(app).post('/api/auth/login').send({ branch: '' });
    expect(res.status).toBe(400);
    expect(res.body.details).toBeDefined();
  });
});
