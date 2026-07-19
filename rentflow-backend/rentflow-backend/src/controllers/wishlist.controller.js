import { catchAsync } from '../utils/catchAsync.js';
import { wishlistService } from '../services/wishlist.service.js';

export const getMyWishlist = catchAsync(async (req, res) => {
  const items = await wishlistService.getMyWishlist(req.user);
  res.status(200).json(items);
});

export const toggleWishlist = catchAsync(async (req, res) => {
  const result = await wishlistService.toggleWishlist(req.user, req.params.itemId);
  res.status(200).json(result);
});
