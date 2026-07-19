import { Router } from 'express';
import { getAddresses, createAddress } from '../controllers/address.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

router.use(protect);

router.get('/', getAddresses);
router.post('/', createAddress);

export default router;
