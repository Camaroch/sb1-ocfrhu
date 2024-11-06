import express from 'express';
import { auth } from '../middleware/auth.js';
import {
  createReview,
  getServiceReviews,
  respondToReview,
  reportReview
} from '../controllers/review.controller.js';

const router = express.Router();

router.post('/orders/:orderId/review',
  auth,
  createReview
);

router.get('/services/:serviceId/reviews',
  getServiceReviews
);

router.post('/reviews/:reviewId/response',
  auth,
  respondToReview
);

router.post('/reviews/:reviewId/report',
  auth,
  reportReview
);

export default router;