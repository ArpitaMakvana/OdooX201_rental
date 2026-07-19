import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

/**
 * Signs a JWT for a user session.
 *
 * The payload intentionally carries only non-sensitive, low-churn data:
 * - `sub`: the user id
 * - `role`: cached so `restrictTo` can do a cheap check without a DB hit
 *   on every single request (the DB is still consulted in `protect` to
 *   confirm the user still exists / isn't suspended / token isn't stale)
 * - `tv`: the user's `tokenVersion` at issuance time, compared against
 *   the current DB value so we can invalidate all outstanding tokens for
 *   a user instantly (e.g. on suspension) without a token blacklist.
 */
export function signToken({ id, role, tokenVersion }) {
  return jwt.sign({ sub: id, role, tv: tokenVersion }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
}

export function verifyToken(token) {
  return jwt.verify(token, env.JWT_SECRET);
}
