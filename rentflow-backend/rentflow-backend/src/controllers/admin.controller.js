import { catchAsync } from '../utils/catchAsync.js';
import { adminService } from '../services/admin.service.js';

export const listUsers = catchAsync(async (req, res) => {
  const users = await adminService.listUsers();
  res.status(200).json(users);
});

export const updateUserRole = catchAsync(async (req, res) => {
  const updated = await adminService.updateUserRole(req.user.id, req.params.id, req.body.role);
  res.status(200).json(updated);
});

export const updateUserStatus = catchAsync(async (req, res) => {
  const updated = await adminService.updateUserStatus(req.user.id, req.params.id, req.body.status);
  res.status(200).json(updated);
});

export const deleteUser = catchAsync(async (req, res) => {
  await adminService.deleteUser(req.user.id, req.params.id);
  res.status(204).send();
});

export const getLateFeePolicy = catchAsync(async (req, res) => {
  const policy = await adminService.getLateFeePolicy();
  res.status(200).json(policy);
});

export const saveLateFeePolicy = catchAsync(async (req, res) => {
  const policy = await adminService.saveLateFeePolicy(req.body);
  res.status(200).json(policy);
});
