import 'dotenv/config';
import { z } from 'zod';

/**
 * Validates and normalizes all environment variables the app depends on.
 * Failing fast here (at import time) means a missing/invalid var is a
 * loud boot-time crash instead of a confusing runtime bug three requests
 * later — much easier to diagnose in production.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),

  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters'),
  JWT_EXPIRES_IN: z.string().default('8h'),
  COOKIE_NAME: z.string().default('rentflow_token'),
  COOKIE_MAX_AGE_MS: z.coerce.number().int().positive().default(8 * 60 * 60 * 1000),

  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  // Parsed as an array of allowed origins (comma-separated in .env)

  DEFAULT_RENTAL_DAYS: z.coerce.number().int().positive().default(3),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error('❌ Invalid environment configuration:');
  // eslint-disable-next-line no-console
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export const isProd = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';
