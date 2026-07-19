import { catchAsync } from '../utils/catchAsync.js';
import { AppError } from '../utils/AppError.js';
import { userService } from '../services/user.service.js';

/** A user may update their own profile; an admin may update anyone's. */
export const updateProfile = catchAsync(async (req, res, next) => {
  const isSelf = req.user.id === req.params.id;
  const isAdmin = req.user.role === 'ADMIN';

  if (!isSelf && !isAdmin) {
    return next(AppError.forbidden("You can only update your own profile."));
  }

  const updated = await userService.updateProfile(req.params.id, req.body);
  res.status(200).json(updated);
});
