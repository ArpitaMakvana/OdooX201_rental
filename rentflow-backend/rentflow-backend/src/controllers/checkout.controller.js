import { catchAsync } from '../utils/catchAsync.js';
import { checkoutService } from '../services/checkout.service.js';
import { AppError } from '../utils/AppError.js';
import { prisma } from '../config/prisma.js';
import path from 'path';
import multer from 'multer';
import fs from 'fs';

// Multer config for docs
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'docs');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'doc-' + uniqueSuffix + path.extname(file.originalname));
  }
});
export const uploadDocs = multer({ storage: storage });

export const processCheckout = catchAsync(async (req, res) => {
  const { cartItems, securityDeposit, totalAmount, deliveryType, address } = req.body;

  if (!cartItems || cartItems.length === 0) {
    throw AppError.badRequest('Cart is empty.');
  }

  let addressId = null;

  // For home delivery, save the address first and capture its ID
  if (deliveryType === 'DELIVERY') {
    if (!address || !address.street || !address.city || !address.state || !address.zipCode) {
      throw AppError.badRequest('A delivery address is required for home delivery.');
    }
    const savedAddress = await prisma.address.create({
      data: {
        userId: req.user.id,
        street: address.street,
        city: address.city,
        state: address.state,
        zipCode: address.zipCode,
      },
    });
    addressId = savedAddress.id;
  }

  const result = await checkoutService.processCheckout(req.user, {
    cartItems,
    securityDeposit,
    totalAmount,
    deliveryType: deliveryType ?? 'PICKUP',
    addressId,
  });

  res.status(201).json(result);
});


export const uploadVerificationDoc = catchAsync(async (req, res) => {
  if (!req.file) throw AppError.badRequest('No document uploaded');
  const type = req.body.type || 'ID_CARD';
  
  const doc = await checkoutService.uploadVerificationDoc(req.user, type, `/uploads/docs/${req.file.filename}`);
  res.status(201).json(doc);
});

export const getMyDocs = catchAsync(async (req, res) => {
  const docs = await checkoutService.getMyDocs(req.user);
  res.status(200).json(docs);
});
