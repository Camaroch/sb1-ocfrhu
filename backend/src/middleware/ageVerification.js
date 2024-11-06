import { ApiError } from '../utils/ApiError.js';

export const ageVerification = async (req, res, next) => {
  try {
    if (!req.user.consent.ageVerification.verified) {
      throw new ApiError(403, 'Age verification required');
    }
    next();
  } catch (error) {
    next(error);
  }
};