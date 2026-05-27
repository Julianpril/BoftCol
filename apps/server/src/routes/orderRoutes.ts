import { Router } from 'express';
import { createOrder, uploadReceipt, getReceiptImage, getOrders, updateOrderStatus } from '../controllers/orderController.js';
import { upload } from '../services/upload.js';

const router: Router = Router();

// Rutas del admin
router.get('/', getOrders);
router.patch('/:id/status', updateOrderStatus);

// Crear pedido en la DB
router.post('/checkout', createOrder);

// Subir comprobante de pago
router.post('/:id/receipt', upload.single('receipt'), uploadReceipt);

// Servir la imagen del comprobante
router.get('/:id/receipt-image', getReceiptImage);

export default router;
