import { jest } from '@jest/globals';
import request from 'supertest';
import { mockDeep, mockReset } from 'jest-mock-extended';
import bcrypt from 'bcryptjs';

const prismaMock = mockDeep();

jest.unstable_mockModule('../../src/config/prisma.js', () => ({ prisma: prismaMock }));

const { app } = await import('../../src/app.js');

beforeEach(() => {
  mockReset(prismaMock);
});

describe('POST /api/auth/register', () => {
  it('creates a user, sets an httpOnly cookie, and never returns the password', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue({
      id: 'usr_new',
      name: 'New Person',
      email: 'new@example.com',
      role: 'USER',
      status: 'ACTIVE',
      branchId: 'main-branch',
      tokenVersion: 0,
      avatarUrl: null,
      createdAt: new Date(),
    });

    const res = await request(app).post('/api/auth/register').send({
      name: 'New Person',
      email: 'new@example.com',
      password: 'password123',
      role: 'admin', // deliberately trying to self-escalate
    });

    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe('user'); // client-supplied role was ignored
    expect(res.body.user).not.toHaveProperty('password');
    expect(res.headers['set-cookie']?.[0]).toMatch(/HttpOnly/);
  });
});

describe('POST /api/auth/login', () => {
  it('logs in successfully with matching branch/identifier/password', async () => {
    const hashed = await bcrypt.hash('user123', 4);
    prismaMock.user.findFirst.mockResolvedValue({
      id: 'usr_customer_01',
      name: 'Devon Carter',
      email: 'devon@example.com',
      password: hashed,
      role: 'USER',
      status: 'ACTIVE',
      branchId: 'gandhinagar',
      tokenVersion: 0,
      avatarUrl: null,
      createdAt: new Date(),
    });

    const res = await request(app).post('/api/auth/login').send({
      branch: 'gandhinagar',
      identifier: 'devon@example.com',
      password: 'user123',
    });

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('devon@example.com');
  });

  it('returns a generic 401 for a suspended-looking or wrong-branch account', async () => {
    prismaMock.user.findFirst.mockResolvedValue({
      id: 'usr_customer_02',
      password: await bcrypt.hash('user123', 4),
      role: 'USER',
      status: 'ACTIVE',
      branchId: 'ahmedabad',
      tokenVersion: 0,
    });

    const res = await request(app).post('/api/auth/login').send({
      branch: 'main-branch', // wrong branch for this account
      identifier: 'maria@example.com',
      password: 'user123',
    });

    expect(res.status).toBe(401);
  });
});
