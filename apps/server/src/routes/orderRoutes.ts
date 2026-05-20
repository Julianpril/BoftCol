import { Router } from 'express';
import { createOrder, uploadReceipt, getOrders, updateOrderStatus } from '../controllers/orderController.js';
import { upload } from '../services/upload.js';

const router: Router = Router();

// Admin routes
router.get('/', getOrders);
router.patch('/:id/status', updateOrderStatus);

// Create a new order in DB
router.post('/checkout', createOrder);

// Upload payment receipt
router.post('/:id/receipt', upload.single('receipt'), uploadReceipt);

export default router;
