import { PrismaClient } from '@prisma/client';
import { isProd } from './env.js';

/**
 * A single shared PrismaClient instance for the whole process.
 *
 * In dev, tools like nodemon can trigger multiple module reloads which
 * would otherwise spin up a new PrismaClient (and a new connection pool)
 * each time. Stashing it on `globalThis` avoids exhausting Postgres
 * connections during local development.
 */
const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.__rentflowPrisma__ ??
  new PrismaClient({
    log: isProd ? ['error', 'warn'] : ['warn', 'error'],
  });

if (!isProd) {
  globalForPrisma.__rentflowPrisma__ = prisma;
}

export async function disconnectPrisma() {
  await prisma.$disconnect();
}

export default prisma;
