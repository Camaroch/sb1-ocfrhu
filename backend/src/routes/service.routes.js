import express from 'express';
import { auth } from '../middleware/auth.js';
import { ageVerification } from '../middleware/ageVerification.js';
import { upload } from '../middleware/upload.js';
import {
  createService,
  getServices,
  getServiceById,
  updateService
} from '../controllers/service.controller.js';

const router = express.Router();

router.post('/', 
  auth, 
  ageVerification,
  upload.array('media', 4),
  createService
);

router.get('/', getServices);
router.get('/:id', getServiceById);

router.put('/:id',
  auth,
  ageVerification,
  upload.array('media', 4),
  updateService
);

export default router;