import multer from 'multer';
import { ApiError } from '../utils/ApiError.js';

const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 100000000; // 100MB default
const ALLOWED_FILE_TYPES = (process.env.ALLOWED_FILE_TYPES || '')
  .split(',')
  .filter(Boolean);

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (ALLOWED_FILE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, 'Invalid file type'), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE
  }
});