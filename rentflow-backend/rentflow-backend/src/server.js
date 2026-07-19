import { app } from './app.js';
import { env } from './config/env.js';
import { prisma, disconnectPrisma } from './config/prisma.js';

process.on('uncaughtException', (err) => {
  // eslint-disable-next-line no-console
  console.error('UNCAUGHT EXCEPTION 💥 Shutting down...', err);
  process.exit(1);
});

let server;

async function start() {
  // Fail fast if the database is unreachable rather than accepting
  // traffic and erroring on the first request.
  await prisma.$connect();

  server = app.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`🚀 RentFlow API listening on port ${env.PORT} [${env.NODE_ENV}]`);
  });
}

async function shutdown(signal) {
  // eslint-disable-next-line no-console
  console.log(`\n${signal} received. Shutting down gracefully...`);
  if (server) {
    server.close(async () => {
      await disconnectPrisma();
      process.exit(0);
    });
  } else {
    await disconnectPrisma();
    process.exit(0);
  }
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

process.on('unhandledRejection', (err) => {
  // eslint-disable-next-line no-console
  console.error('UNHANDLED REJECTION 💥 Shutting down...', err);
  server?.close(() => process.exit(1));
});

start();
