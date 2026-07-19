import { Router } from 'express';
import * as wishlistController from '../controllers/wishlist.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';

const router = Router();

router.use(protect);
router.use(restrictTo('user', 'ADMIN')); // allowing ADMIN too just in case

router.get('/', wishlistController.getMyWishlist);
router.post('/:itemId/toggle', wishlistController.toggleWishlist);

export default router;
