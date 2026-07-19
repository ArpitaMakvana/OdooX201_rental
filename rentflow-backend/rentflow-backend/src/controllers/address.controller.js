import { catchAsync } from '../utils/catchAsync.js';
import { addressService } from '../services/address.service.js';

export const getAddresses = catchAsync(async (req, res) => {
  const addresses = await addressService.getAddresses(req.user);
  res.status(200).json(addresses);
});

export const createAddress = catchAsync(async (req, res) => {
  const address = await addressService.createAddress(req.user, req.body);
  res.status(201).json(address);
});
