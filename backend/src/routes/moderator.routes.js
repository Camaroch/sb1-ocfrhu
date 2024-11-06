import express from 'express';
import { auth } from '../middleware/auth.js';
import { adminOnly } from '../middleware/admin.js';
import {
  getReports,
  resolveReport,
  createReport
} from '../controllers/moderator.controller.js';

const router = express.Router();

// Public routes (require auth)
router.post('/report', auth, createReport);

// Admin routes
router.get('/admin/reports', auth, adminOnly, getReports);
router.post('/admin/reports/:reportId/resolve', auth, adminOnly, resolveReport);

export default router;