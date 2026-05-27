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

// Catálogo
router.get('/formats', getFormats);
router.get('/pricing', getPricing);
router.get('/price', getPrice);

// Subida y borrado
router.post('/upload', upload.array('photos', 50), uploadPhotos);
router.get('/download/:folderId', downloadOrderPhotos);
router.delete('/:fileId', deletePhoto);

export default router;
