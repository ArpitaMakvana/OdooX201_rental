import rateLimit from 'express-rate-limit';

/**
 * Throttles login/register attempts per IP to blunt credential-stuffing
 * and brute-force attacks. Deliberately generous enough not to lock out
 * a real user who mistypes a password a few times.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 'fail', message: 'Too many attempts. Please try again later.' },
});
