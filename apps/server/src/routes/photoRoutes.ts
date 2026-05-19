import { Router } from 'express';
import { upload } from '../services/upload.js';
import {
  getFormats,
  getPricing,
  getPrice,
  uploadPhotos,
  deletePhoto,
  downloadOrderPhotos,
} from '../controllers/photoController.js';

const router = Router();

// Catalog
router.get('/formats', getFormats);
router.get('/pricing', getPricing);
router.get('/price', getPrice);

// Upload & Delete
router.post('/upload', upload.array('photos', 50), uploadPhotos);
router.get('/download/:folderId', downloadOrderPhotos);
router.delete('/:fileId', deletePhoto);

export default router;
