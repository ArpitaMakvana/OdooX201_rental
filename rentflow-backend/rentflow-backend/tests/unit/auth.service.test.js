import { jest } from '@jest/globals';
import { mockDeep, mockReset } from 'jest-mock-extended';
import bcrypt from 'bcryptjs';

const prismaMock = mockDeep();

// Must be registered before the module under test (and its transitive
// imports) are loaded, since ESM modules are evaluated eagerly on import.
jest.unstable_mockModule('../../src/config/prisma.js', () => ({ prisma: prismaMock }));

const { authService } = await import('../../src/services/auth.service.js');
// const { AppError } = await import('../../src/utils/AppError.js'); // unused in tests

const baseUser = {
  id: 'usr_1',
  name: 'Devon Carter',
  email: 'devon@example.com',
  role: 'USER',
  status: 'ACTIVE',
  branchId: 'gandhinagar',
  tokenVersion: 0,
  avatarUrl: null,
  createdAt: new Date('2024-03-02T11:30:00Z'),
};

beforeEach(() => {
  mockReset(prismaMock);
});

describe('authService.register', () => {
  it('rejects duplicate emails with a 409 AppError', async () => {
    prismaMock.user.findUnique.mockResolvedValue(baseUser);

    await expect(
      authService.register({ name: 'X', email: 'devon@example.com', password: 'password123' }),
    ).rejects.toMatchObject({ statusCode: 409 });
  });

  it('creates a plain USER in the default branch and returns a token', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue({ ...baseUser, id: 'usr_new' });

    const result = await authService.register({
      name: 'New Person',
      email: 'new@example.com',
      password: 'password123',
    });

    expect(prismaMock.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ role: 'USER', branchId: 'main-branch' }),
      }),
    );
    expect(result.user).not.toHaveProperty('password');
    expect(typeof result.token).toBe('string');
  });
});

describe('authService.login', () => {
  it('throws a generic 401 when the branch does not match the account', async () => {
    prismaMock.user.findFirst.mockResolvedValue(baseUser);

    await expect(
      authService.login({ branch: 'main-branch', identifier: 'devon@example.com', password: 'user123' }),
    ).rejects.toMatchObject({ statusCode: 401, message: 'Invalid credentials.' });
  });

  it('throws a generic 401 for a wrong password (never reveals which part was wrong)', async () => {
    const hashed = await bcrypt.hash('user123', 4);
    prismaMock.user.findFirst.mockResolvedValue({ ...baseUser, password: hashed });

    await expect(
      authService.login({ branch: 'gandhinagar', identifier: 'devon@example.com', password: 'wrong' }),
    ).rejects.toMatchObject({ statusCode: 401, message: 'Invalid credentials.' });
  });

  it('throws 403 for a suspended account with a specific message', async () => {
    const hashed = await bcrypt.hash('user123', 4);
    prismaMock.user.findFirst.mockResolvedValue({
      ...baseUser,
      password: hashed,
      status: 'SUSPENDED',
    });

    await expect(
      authService.login({ branch: 'gandhinagar', identifier: 'devon@example.com', password: 'user123' }),
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  it('succeeds with matching branch, identifier, and password', async () => {
    const hashed = await bcrypt.hash('user123', 4);
    prismaMock.user.findFirst.mockResolvedValue({ ...baseUser, password: hashed });

    const result = await authService.login({
      branch: 'gandhinagar',
      identifier: 'devon@example.com',
      password: 'user123',
    });

    expect(result.user.email).toBe('devon@example.com');
    expect(result.user).not.toHaveProperty('password');
    expect(typeof result.token).toBe('string');
  });
});
