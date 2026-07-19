import { Router } from 'express';
import * as rentalController from '../controllers/rental.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { itemIdParamSchema } from '../validations/rental.validation.js';

const router = Router();

router.use(protect);

router.get('/mine', rentalController.listMine);
router.get('/available', rentalController.browseAvailable);
router.post(
  '/:itemId/request',
  restrictTo('user'),
  validate(itemIdParamSchema, 'params'),
  rentalController.requestRental,
);

router.put('/:id/status', restrictTo('admin', 'vendor', 'user'), rentalController.updateStatus);

export default router;
