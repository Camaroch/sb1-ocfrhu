import { ApiError } from '../utils/ApiError.js';

export const adminOnly = async (req, res, next) => {
  try {
    if (req.user.type !== 'admin') {
      throw new ApiError(403, 'Admin access required');
    }
    next();
  } catch (error) {
    next(error);
  }
};