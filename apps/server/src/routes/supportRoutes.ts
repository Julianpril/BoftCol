import { Router, type Router as ExpressRouter } from 'express';
import multer from 'multer';
import {
  createSession,
  getSessionHistory,
  sendMessage,
  uploadReceipt,
  listSessions,
  takeoverSession,
  releaseSession,
  adminSendMessage,
  pollMessages,
} from '../controllers/supportController.js';
import { requireAdmin } from '../middleware/authMiddleware.js';

const router: ExpressRouter = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Customer-facing routes
router.post('/session', createSession);
router.get('/session/:id', getSessionHistory);
router.post('/message', sendMessage);
router.post('/upload-receipt', upload.single('receipt'), uploadReceipt);
router.get('/:id/poll', pollMessages);

// Admin-only routes (JWT required)
router.get('/admin/sessions', requireAdmin, listSessions);
router.post('/admin/:id/takeover', requireAdmin, takeoverSession);
router.post('/admin/:id/release', requireAdmin, releaseSession);
router.post('/admin/:id/message', requireAdmin, adminSendMessage);

export default router;
