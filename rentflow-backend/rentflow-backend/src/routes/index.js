import { Router } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import adminRoutes from './admin.routes.js';
import rentalRoutes from './rental.routes.js';
import addressRoutes from './address.routes.js';
import orderRoutes from './order.routes.js';
import itemRoutes from './item.routes.js';
import wishlistRoutes from './wishlist.routes.js';
import checkoutRoutes from './checkout.routes.js';
import vendorRoutes from './vendor.routes.js';

const router = Router();

router.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/admin', adminRoutes);
router.use('/rentals', rentalRoutes);
router.use('/addresses', addressRoutes);
router.use('/orders', orderRoutes);
router.use('/items', itemRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/checkout', checkoutRoutes);
router.use('/vendor', vendorRoutes);

export default router;
