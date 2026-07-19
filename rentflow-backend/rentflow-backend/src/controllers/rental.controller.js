import { catchAsync } from '../utils/catchAsync.js';
import { rentalService } from '../services/rental.service.js';

export const listMine = catchAsync(async (req, res) => {
  const rentals = await rentalService.listMine(req.user);
  res.status(200).json(rentals);
});

export const browseAvailable = catchAsync(async (req, res) => {
  const items = await rentalService.browseAvailable(req.user, req.query);
  res.status(200).json(items);
});

export const requestRental = catchAsync(async (req, res) => {
  const rental = await rentalService.requestRental(req.user, req.params.itemId);
  res.status(201).json(rental);
});

export const updateStatus = catchAsync(async (req, res) => {
  const { status } = req.body;
  const rental = await rentalService.updateStatus(req.user, req.params.id, status);
  res.status(200).json(rental);
});
