import { isProd } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

/**
 * Translates known Prisma error codes into operational AppErrors.
 *
 * Deliberately duck-typed (checking `err.constructor.name` + `err.code`)
 * rather than `err instanceof Prisma.PrismaClientKnownRequestError` so
 * this module never needs to import `@prisma/client` itself — the error
 * handler stays usable even in contexts where the Prisma client hasn't
 * been generated yet (e.g. certain test/CI setups), and it keeps the
 * HTTP layer decoupled from the ORM's own types.
 */
function fromPrismaError(err) {
  if (err?.constructor?.name !== 'PrismaClientKnownRequestError' || !err.code) {
    return null;
  }

  switch (err.code) {
    case 'P2002': {
      const fields = err.meta?.target?.join?.(', ') ?? 'field';
      return AppError.conflict(`A record with this ${fields} already exists.`);
    }
    case 'P2025':
      return AppError.notFound('The requested resource was not found.');
    case 'P2003':
      return AppError.badRequest('This action references a resource that does not exist.');
    default:
      return null;
  }
}

function fromJwtError(err) {
  if (err.name === 'JsonWebTokenError') return AppError.unauthorized('Invalid session token.');
  if (err.name === 'TokenExpiredError') {
    return AppError.unauthorized('Your session has expired. Please log in again.');
  }
  return null;
}

/**
 * The single place every error in the app funnels through — synchronous
 * throws, `next(err)` calls, and rejected promises from `catchAsync`
 * handlers alike. Formats a clean, consistent JSON error body and never
 * leaks stack traces or internal details once NODE_ENV=production.
 */
// eslint-disable-next-line no-unused-vars
export function globalErrorHandler(err, req, res, next) {
  const normalized =
    (err instanceof AppError && err) || fromPrismaError(err) || fromJwtError(err) || null;

  if (normalized) {
    const body = { status: normalized.status, message: normalized.message };
    if (normalized.details) body.details = normalized.details;
    return res.status(normalized.statusCode).json(body);
  }

  // Unexpected / programming error — log full detail server-side, but
  // never expose it to the client in production.
  // eslint-disable-next-line no-console
  console.error('UNEXPECTED ERROR 💥', err);

  return res.status(500).json({
    status: 'error',
    message: isProd ? 'Something went wrong. Please try again later.' : err.message,
    ...(isProd ? {} : { stack: err.stack }),
  });
}

export function notFoundHandler(req, res) {
  res.status(404).json({ status: 'fail', message: `Cannot find ${req.method} ${req.originalUrl}` });
}
