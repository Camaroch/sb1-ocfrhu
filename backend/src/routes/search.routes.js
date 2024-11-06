import express from 'express';
import { search, getCategories } from '../controllers/search.controller.js';

const router = express.Router();

router.get('/services', search);
router.get('/categories', getCategories);

export default router;