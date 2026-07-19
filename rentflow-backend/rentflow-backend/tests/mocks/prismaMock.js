import { mockDeep, mockReset } from 'jest-mock-extended';

/**
 * A deep mock of PrismaClient. Import `prismaMock` in tests and stub
 * whichever methods the code under test calls, e.g.:
 *
 *   prismaMock.user.findUnique.mockResolvedValue(fakeUser);
 */
export const prismaMock = mockDeep();

beforeEach(() => {
  mockReset(prismaMock);
});
