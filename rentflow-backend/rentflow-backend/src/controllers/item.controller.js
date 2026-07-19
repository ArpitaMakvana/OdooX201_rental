import { catchAsync } from '../utils/catchAsync.js';
import { itemService } from '../services/item.service.js';
import { AppError } from '../utils/AppError.js';
import path from 'path';
import multer from 'multer';
import fs from 'fs';

// --- Multer Configuration ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
export const upload = multer({ storage: storage });
// ----------------------------

export const listItems = catchAsync(async (req, res) => {
  const items = await itemService.listItems(req.user);
  res.status(200).json(items);
});

export const getItem = catchAsync(async (req, res) => {
  const item = await itemService.getById(req.params.id);
  res.status(200).json(item);
});

export const createItem = catchAsync(async (req, res) => {
  const data = req.body;
  if (!data.branchId) throw AppError.badRequest('branchId is required');
  const newItem = await itemService.createItem(data);
  res.status(201).json(newItem);
});

export const updateItem = catchAsync(async (req, res) => {
  const updatedItem = await itemService.updateItem(req.params.id, req.body);
  res.status(200).json(updatedItem);
});

export const deleteItem = catchAsync(async (req, res) => {
  await itemService.deleteItem(req.params.id);
  res.status(204).send();
});

export const uploadMedia = catchAsync(async (req, res) => {
  // Expected files: req.files.images (array), req.files.documents (array)
  const files = req.files;
  if (!files) throw AppError.badRequest('No files uploaded');

  const imageUrls = files.images ? files.images.map(f => `/uploads/${f.filename}`) : [];
  const docUrls = files.documents ? files.documents.map(f => `/uploads/${f.filename}`) : [];

  // Update item with these new paths
  const item = await itemService.getItem(req.params.id);
  
  const updatedItem = await itemService.updateItem(req.params.id, {
    images: [...item.images, ...imageUrls],
    documents: [...item.documents, ...docUrls]
  });

  res.status(200).json(updatedItem);
});
