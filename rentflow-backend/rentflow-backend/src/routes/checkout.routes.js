import { Router } from 'express';
import * as checkoutController from '../controllers/checkout.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

router.use(protect);

router.post('/', checkoutController.processCheckout);
router.post('/docs', checkoutController.uploadDocs.single('document'), checkoutController.uploadVerificationDoc);
router.get('/docs', checkoutController.getMyDocs);

export default router;
