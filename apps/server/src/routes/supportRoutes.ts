import { Router, type Router as ExpressRouter } from 'express';
import multer from 'multer';
import { createSession, getSessionHistory, sendMessage, uploadReceipt } from '../controllers/supportController.js';

const router: ExpressRouter = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/session', createSession);
router.get('/session/:id', getSessionHistory);
router.post('/message', sendMessage);
router.post('/upload-receipt', upload.single('receipt'), uploadReceipt);

export default router;
