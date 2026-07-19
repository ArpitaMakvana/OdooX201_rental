import { catchAsync } from '../utils/catchAsync.js';
import { vendorService } from '../services/vendor.service.js';

export const getDashboard = catchAsync(async (req, res) => {
  const data = await vendorService.getDashboard(req.user);
  res.status(200).json(data);
});

export const getBookings = catchAsync(async (req, res) => {
  const data = await vendorService.getBookings(req.user);
  res.status(200).json(data);
});

export const updateBookingStatus = catchAsync(async (req, res) => {
  const { status } = req.body;
  const data = await vendorService.updateBookingStatus(req.user, req.params.id, status);
  res.status(200).json(data);
});

export const getEarnings = catchAsync(async (req, res) => {
  const data = await vendorService.getEarnings(req.user);
  res.status(200).json(data);
});

export const getEquipment = catchAsync(async (req, res) => {
  const data = await vendorService.getEquipment(req.user);
  res.status(200).json(data);
});

export const addEquipment = catchAsync(async (req, res) => {
  const newItem = await vendorService.addEquipment(req.user, req.body);
  res.status(201).json(newItem);
});

export const updateEquipmentStatus = catchAsync(async (req, res) => {
  const availableVal = req.body.available !== undefined ? req.body.available : req.body.isActive;
  const updatedItem = await vendorService.updateEquipmentStatus(req.user, req.params.id, availableVal);
  res.status(200).json(updatedItem);
});
