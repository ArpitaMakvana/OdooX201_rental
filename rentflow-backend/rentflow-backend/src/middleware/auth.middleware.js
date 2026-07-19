import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';
import { catchAsync } from '../utils/catchAsync.js';
import { verifyToken } from '../utils/tokens.js';

function extractToken(req) {
  const cookieToken = req.cookies?.[env.COOKIE_NAME];
  if (cookieToken) return cookieToken;

  // Fallback to a Bearer header. The bundled frontend relies exclusively
  // on the httpOnly cookie, but supporting a header too keeps the API
  // usable from mobile clients, cron jobs, or tools like Postman/curl
  // that don't carry cookies.
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) return header.slice(7);

  return null;
}

/**
 * Verifies the incoming JWT, ensures it hasn't expired, confirms the user
 * still exists and hasn't been suspended, and attaches the authenticated
 * user (a raw Prisma `User`, including its `branch` relation) to
 * `req.user`. Every route below this middleware can assume `req.user` is
 * present and trustworthy.
 */
export const protect = catchAsync(async (req, res, next) => {
  const token = extractToken(req);

  if (!token) {
    return next(AppError.unauthorized('You are not logged in. Please log in to continue.'));
  }

  let decoded;
  try {
    decoded = verifyToken(token);
  } catch {
    return next(AppError.unauthorized('Invalid or expired session. Please log in again.'));
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.sub },
    include: { branch: true },
  });

  if (!user) {
    return next(AppError.unauthorized('The account belonging to this session no longer exists.'));
  }

  if (user.tokenVersion !== decoded.tv) {
    return next(AppError.unauthorized('Your session is no longer valid. Please log in again.'));
  }

  if (user.status === 'SUSPENDED') {
    return next(AppError.forbidden('This account has been suspended. Contact IT support.'));
  }

  req.user = user;
  next();
});

/**
 * Restricts a route to the given role(s). Must run after `protect`.
 * Usage: `restrictTo('admin')` or `restrictTo('admin', 'user')`.
 */
export function restrictTo(...roles) {
  const allowed = new Set(roles.map((r) => r.toLowerCase()));

  return (req, res, next) => {
    if (!req.user) {
      return next(AppError.unauthorized());
    }

    if (!allowed.has(req.user.role.toLowerCase())) {
      return next(AppError.forbidden('You do not have permission to perform this action.'));
    }

    next();
  };
}
