import { Router } from 'express';
import * as adminController from '../controllers/admin.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  userIdParamSchema,
  updateRoleSchema,
  updateStatusSchema,
  lateFeePolicySchema,
} from '../validations/admin.validation.js';

const router = Router();

// Every route below requires a valid session AND the ADMIN role.
router.use(protect, restrictTo('admin'));

router.get('/users', adminController.listUsers);

router.patch(
  '/users/:id/role',
  validate(userIdParamSchema, 'params'),
  validate(updateRoleSchema),
  adminController.updateUserRole,
);

router.patch(
  '/users/:id/status',
  validate(userIdParamSchema, 'params'),
  validate(updateStatusSchema),
  adminController.updateUserStatus,
);

router.delete('/users/:id', validate(userIdParamSchema, 'params'), adminController.deleteUser);

router.get('/config/late-fees', adminController.getLateFeePolicy);
router.put('/config/late-fees', validate(lateFeePolicySchema), adminController.saveLateFeePolicy);

export default router;
