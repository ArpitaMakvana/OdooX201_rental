import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const branches = [
    { id: 'main-branch', name: 'Main Branch — HQ' },
    { id: 'gandhinagar', name: 'Gandhinagar' },
    { id: 'ahmedabad', name: 'Ahmedabad' },
  ];
  for (const branch of branches) {
    await prisma.branch.upsert({ where: { id: branch.id }, update: {}, create: branch });
  }

  const users = [
    {
      id: 'usr_admin_01',
      name: 'Priya Sharma',
      email: 'admin@rentflow.io',
      password: 'admin123',
      role: 'ADMIN',
      branchId: 'main-branch',
      status: 'ACTIVE',
    },
    {
      id: 'usr_customer_01',
      name: 'Devon Carter',
      email: 'devon@example.com',
      password: 'user123',
      role: 'USER',
      branchId: 'gandhinagar',
      status: 'ACTIVE',
    },
    {
      id: 'usr_customer_02',
      name: 'Maria Alvarez',
      email: 'maria@example.com',
      password: 'user123',
      role: 'USER',
      branchId: 'ahmedabad',
      status: 'REJECTED',
    },
    {
      id: 'usr_customer_03',
      name: 'Tom Nakamura',
      email: 'tom@example.com',
      password: 'user123',
      role: 'USER',
      branchId: 'main-branch',
      status: 'ACTIVE',
    },
    {
      id: 'usr_vendor_01',
      name: 'Ravi Patel',
      email: 'vendor@rentflow.io',
      password: 'vendor123',
      role: 'VENDOR',
      branchId: 'gandhinagar',
      status: 'ACTIVE',
    },
  ];

  for (const user of users) {
    const hashed = await bcrypt.hash(user.password, 12);
    await prisma.user.upsert({
      where: { email: user.email },
      update: { name: user.name, role: user.role, status: user.status, branchId: user.branchId },
      create: { ...user, password: hashed },
    });
  }

  const items = [
    {
      id: 'itm_camera_r6',
      name: 'Canon EOS R6 Camera Kit',
      category: 'Photography',
      branchId: 'gandhinagar',
      dailyRate: 40,
    },
    {
      id: 'itm_dewalt_set',
      name: 'DeWalt Power Tool Set',
      category: 'Tools',
      branchId: 'gandhinagar',
      dailyRate: 15,
    },
    {
      id: 'itm_cargo_van',
      name: '20ft Cargo Van',
      category: 'Vehicles',
      branchId: 'main-branch',
      dailyRate: 89,
    },
    {
      id: 'itm_party_tent',
      name: 'Party Tent (30x30)',
      category: 'Events',
      branchId: 'ahmedabad',
      dailyRate: 120,
    },
  ];

  for (const item of items) {
    await prisma.item.upsert({ where: { id: item.id }, update: {}, create: item });
  }

  // Sample bookings reflecting each RentalStatus, matching the frontend's
  // mock data (src/services/mockData.ts) so the demo UI looks identical
  // to the mocked version once pointed at this real backend.
  const rentals = [
    {
      id: 'rnt_1001',
      userId: 'usr_customer_01',
      itemId: 'itm_camera_r6',
      branchId: 'gandhinagar',
      status: 'ACTIVE',
      startDate: new Date('2026-07-10'),
      dueDate: new Date('2026-07-20'),
    },
    {
      id: 'rnt_1002',
      userId: 'usr_customer_01',
      itemId: 'itm_dewalt_set',
      branchId: 'gandhinagar',
      status: 'OVERDUE',
      startDate: new Date('2026-06-28'),
      dueDate: new Date('2026-07-08'),
      lateFee: 45,
    },
    {
      id: 'rnt_1003',
      userId: 'usr_customer_03',
      itemId: 'itm_cargo_van',
      branchId: 'main-branch',
      status: 'RESERVED',
      startDate: new Date('2026-07-25'),
      dueDate: new Date('2026-07-27'),
    },
    {
      id: 'rnt_1004',
      userId: 'usr_customer_02',
      itemId: 'itm_party_tent',
      branchId: 'ahmedabad',
      status: 'RETURNED',
      startDate: new Date('2026-06-01'),
      dueDate: new Date('2026-06-04'),
      returnedAt: new Date('2026-06-04'),
    },
  ];

  for (const rental of rentals) {
    await prisma.rental.upsert({ where: { id: rental.id }, update: {}, create: rental });
  }

  await prisma.lateFeePolicy.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });

  console.log('✅ Seed complete.');
  console.log('   Admin login  -> branch: main-branch,  identifier: admin@rentflow.io,  password: admin123');
  console.log('   Vendor login -> branch: gandhinagar,   identifier: vendor@rentflow.io, password: vendor123');
  console.log('   Customer     -> branch: gandhinagar,   identifier: devon@example.com,  password: user123');
}

main()
  .catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
