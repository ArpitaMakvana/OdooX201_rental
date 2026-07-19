import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { updateProfileSchema, userIdParamSchema } from '../validations/user.validation.js';

const router = Router();

router.use(protect);

router.patch(
  '/:id',
  validate(userIdParamSchema, 'params'),
  validate(updateProfileSchema),
  userController.updateProfile,
);

export default router;
