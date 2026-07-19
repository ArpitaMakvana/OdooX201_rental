import { catchAsync } from '../utils/catchAsync.js';
import { setAuthCookie, clearAuthCookie } from '../utils/cookies.js';
import { authService } from '../services/auth.service.js';
import { toUserDTO } from '../dto/user.dto.js';

export const register = catchAsync(async (req, res) => {
  const { user, token } = await authService.register(req.body);
  setAuthCookie(res, token);
  res.status(201).json({ user, token });
});

export const login = catchAsync(async (req, res) => {
  const { user, token } = await authService.login(req.body);
  setAuthCookie(res, token);
  res.status(200).json({ user, token });
});

export const logout = catchAsync(async (req, res) => {
  clearAuthCookie(res);
  res.status(200).json({ status: 'success' });
});

/** Re-hydrates the session on app load from the httpOnly cookie (see `protect`). */
export const getSession = catchAsync(async (req, res) => {
  res.status(200).json(toUserDTO(req.user));
});
