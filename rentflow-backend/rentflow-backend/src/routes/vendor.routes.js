import { Router } from 'express';
import * as vendorController from '../controllers/vendor.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';

const router = Router();

// All vendor routes require auth + VENDOR (or ADMIN) role
router.use(protect, restrictTo('vendor', 'admin'));

router.get('/dashboard', vendorController.getDashboard);
router.get('/bookings',  vendorController.getBookings);
router.put('/bookings/:id/status', vendorController.updateBookingStatus);
router.get('/earnings',  vendorController.getEarnings);
router.get('/equipment', vendorController.getEquipment);
router.post('/equipment', vendorController.addEquipment);
router.patch('/equipment/:id/status', vendorController.updateEquipmentStatus);
router.put('/equipment/:id/status', vendorController.updateEquipmentStatus);

export default router;
