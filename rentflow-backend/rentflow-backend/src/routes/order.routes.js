import { Router } from 'express';
import { createOrder, getMyOrders } from '../controllers/order.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

router.use(protect);

router.post('/', createOrder);
router.get('/mine', getMyOrders);

export default router;
