import express from 'express';
import { protect, restrictTo } from '../middleware/auth.middleware.js';
import * as itemController from '../controllers/item.controller.js';

const router = express.Router();

router.use(protect);

router.get('/', itemController.listItems);
router.get('/:id', itemController.getItem);

// Admin and Vendor routes
router.use(restrictTo('ADMIN', 'VENDOR'));

router.post('/', itemController.createItem);

router.route('/:id')
  .put(itemController.updateItem)
  .delete(itemController.deleteItem);

router.post('/:id/upload', itemController.upload.fields([
  { name: 'images', maxCount: 10 },
  { name: 'documents', maxCount: 5 }
]), itemController.uploadMedia);

export default router;
