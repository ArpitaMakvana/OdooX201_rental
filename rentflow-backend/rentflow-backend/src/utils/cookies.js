import { env, isProd } from '../config/env.js';

/**
 * The frontend (see rentflow-frontend/src/services/api.ts) calls the API
 * with `withCredentials: true` and never touches localStorage — the JWT
 * lives exclusively in an httpOnly cookie so it can't be read or
 * exfiltrated by client-side JS (XSS-resistant by construction).
 */
export function setAuthCookie(res, token) {
  res.cookie(env.COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProd, // requires HTTPS in production
    sameSite: isProd ? 'strict' : 'lax',
    maxAge: env.COOKIE_MAX_AGE_MS,
    path: '/',
  });
}

export function clearAuthCookie(res) {
  res.clearCookie(env.COOKIE_NAME, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'strict' : 'lax',
    path: '/',
  });
}
