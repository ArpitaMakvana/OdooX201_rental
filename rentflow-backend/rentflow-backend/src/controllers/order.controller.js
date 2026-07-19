import { catchAsync } from '../utils/catchAsync.js';
import { orderService } from '../services/order.service.js';

export const createOrder = catchAsync(async (req, res) => {
  const order = await orderService.createOrder(req.user, req.body);
  res.status(201).json(order);
});

export const getMyOrders = catchAsync(async (req, res) => {
  const orders = await orderService.getMyOrders(req.user);
  res.status(200).json(orders);
});
