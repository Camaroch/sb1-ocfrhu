import express from 'express';
import { auth } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import {
  createDelivery,
  acceptDelivery,
  requestRevision,
  getDelivery
} from '../controllers/delivery.controller.js';

const router = express.Router();

router.post('/orders/:orderId/delivery',
  auth,
  upload.array('files', 10),
  createDelivery
);

router.post('/delivery/:deliveryId/accept',
  auth,
  acceptDelivery
);

router.post('/delivery/:deliveryId/revision',
  auth,
  requestRevision
);

router.get('/delivery/:deliveryId',
  auth,
  getDelivery
);

export default router;