import { jest } from '@jest/globals';
import { mockDeep, mockReset } from 'jest-mock-extended';

const prismaMock = mockDeep();

jest.unstable_mockModule('../../src/config/prisma.js', () => ({ prisma: prismaMock }));

const { rentalService } = await import('../../src/services/rental.service.js');

const user = { id: 'usr_1', role: 'USER', branchId: 'gandhinagar' };
const admin = { id: 'usr_admin', role: 'ADMIN', branchId: 'main-branch' };

const item = {
  id: 'itm_1',
  name: 'Canon EOS R6 Camera Kit',
  category: 'Photography',
  branchId: 'gandhinagar',
  dailyRate: '40.00',
  isActive: true,
  rentals: [],
};

beforeEach(() => {
  mockReset(prismaMock);
});

describe('rentalService.listMine', () => {
  it('scopes to the caller for a regular user', async () => {
    prismaMock.rental.findMany.mockResolvedValue([]);
    await rentalService.listMine(user);

    expect(prismaMock.rental.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'usr_1' } }),
    );
  });

  it('returns every rental system-wide for an admin (powers the admin dashboard)', async () => {
    prismaMock.rental.findMany.mockResolvedValue([]);
    await rentalService.listMine(admin);

    expect(prismaMock.rental.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: {} }));
  });
});

describe('rentalService.browseAvailable', () => {
  it('reports an item with no rental history as available ("returned")', async () => {
    prismaMock.item.findMany.mockResolvedValue([item]);

    const result = await rentalService.browseAvailable(user);

    expect(result).toEqual([
      expect.objectContaining({ id: 'itm_1', status: 'returned', dailyRate: 40 }),
    ]);
  });

  it('reports an item with an open rental as "reserved"', async () => {
    const withOpenRental = {
      ...item,
      rentals: [
        {
          status: 'RESERVED',
          startDate: new Date('2026-07-01'),
          dueDate: new Date('2026-07-05'),
          returnedAt: null,
          lateFee: null,
        },
      ],
    };
    prismaMock.item.findMany.mockResolvedValue([withOpenRental]);

    const result = await rentalService.browseAvailable(user);
    expect(result[0].status).toBe('reserved');
  });
});

describe('rentalService.requestRental', () => {
  it('throws 404 when the item does not exist', async () => {
    prismaMock.item.findUnique.mockResolvedValue(null);

    await expect(rentalService.requestRental(user, 'missing')).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it('throws 409 when the item already has an open rental', async () => {
    prismaMock.item.findUnique.mockResolvedValue({
      ...item,
      rentals: [{ status: 'ACTIVE' }],
    });

    await expect(rentalService.requestRental(user, 'itm_1')).rejects.toMatchObject({
      statusCode: 409,
    });
  });

  it('creates a RESERVED rental and returns it in the reserved state', async () => {
    prismaMock.item.findUnique.mockResolvedValue({ ...item, rentals: [] });
    prismaMock.rental.create.mockResolvedValue({
      status: 'RESERVED',
      startDate: new Date(),
      dueDate: new Date(),
      returnedAt: null,
      lateFee: null,
    });

    const result = await rentalService.requestRental(user, 'itm_1');

    expect(prismaMock.rental.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ userId: 'usr_1', itemId: 'itm_1', status: 'RESERVED' }),
      }),
    );
    expect(result.status).toBe('reserved');
    expect(result.id).toBe('itm_1'); // re-keyed to the item id for frontend compatibility
  });
});
