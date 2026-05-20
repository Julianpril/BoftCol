import { Router } from 'express';
import { getSettings, updateSettings, uploadQrSetting } from '../controllers/settingsController.js';
import { requireAdmin } from '../middleware/authMiddleware.js';
import { qrUpload } from '../services/upload.js';

const router: Router = Router();

router.get('/', getSettings);
router.put('/', requireAdmin, updateSettings);
router.post('/qr', requireAdmin, qrUpload.single('qr'), uploadQrSetting);

export default router;
