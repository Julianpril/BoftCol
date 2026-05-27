import { Router } from 'express';
import { requireAdmin } from '../middleware/authMiddleware.js';
import { getCodes, createCode, bulkUploadCodes, updateCode } from '../controllers/printCodeController.js';

const router: Router = Router();

router.use(requireAdmin);

router.get('/', getCodes);
router.post('/', createCode);
router.post('/upload', bulkUploadCodes);
router.patch('/:id', updateCode);

export default router;
