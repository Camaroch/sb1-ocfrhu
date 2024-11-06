import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { ApiError } from '../utils/ApiError.js';

const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);

const UPLOAD_DIR = process.env.UPLOAD_PATH || 'uploads';

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export const uploadFile = async (file) => {
  try {
    const fileName = `${Date.now()}-${file.originalname}`;
    const filePath = path.join(UPLOAD_DIR, fileName);
    
    await writeFile(filePath, file.buffer);
    
    // In production, you would upload to a cloud storage service
    // and return the cloud URL instead of local path
    return {
      url: `/uploads/${fileName}`,
      path: filePath
    };
  } catch (error) {
    throw new ApiError(500, 'File upload failed');
  }
};

export const deleteFile = async (filePath) => {
  try {
    await unlink(filePath);
  } catch (error) {
    throw new ApiError(500, 'File deletion failed');
  }
};