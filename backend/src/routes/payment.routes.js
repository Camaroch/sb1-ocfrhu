import express from 'express';
import { auth } from '../middleware/auth.js';
import { ageVerification } from '../middleware/ageVerification.js';
import {
  createOrder,
  confirmOrder,
  getOrder
} from '../controllers/payment.controller.js';

const router = express.Router();

router.post('/orders',
  auth,
  ageVerification,
  createOrder
);

router.post('/orders/:orderId/confirm',
  auth,
  confirmOrder
);

router.get('/orders/:orderId',
  auth,
  getOrder
);

export default router;