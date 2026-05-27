import { Request, Response } from 'express';
import { prisma } from '../db/prisma.js';

export async function createOrder(req: Request, res: Response): Promise<void> {
  try {
    const { orderId, driveFolderId, customerName, email, city, phone, address, photoCount, formatId, totalPrice, shippingCost } = req.body;

    if (!customerName || !city || !phone || !address || !photoCount) {
      res.status(400).json({ error: 'Faltan campos obligatorios' });
      return;
    }

    // Guardamos el pedido
    const newOrder = await prisma.order.create({
      data: {
        id: orderId, // Usamos el ID que se generó al subir las fotos
        driveFolderId,
        customerName,
        email,
        city,
        phone,
        address,
        photoCount,
        formatId,
        totalPrice,
        shippingCost: shippingCost || 2900,
        status: 'PENDING'
      }
    });

    res.status(201).json({
      message: 'Orden creada exitosamente',
      order: newOrder
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Error al procesar la orden' });
  }
}

import fs from 'fs';
import path from 'path';

export async function uploadReceipt(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    const file = req.file;

    if (!file) {
      res.status(400).json({ error: 'No se recibió el comprobante' });
      return;
    }

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      res.status(404).json({ error: 'Orden no encontrada' });
      return;
    }

    const uploadDir = path.resolve(process.cwd(), 'uploads', `local_order_${id}`);
    fs.mkdirSync(uploadDir, { recursive: true });
    const localName = `comprobante_${Date.now()}_${file.originalname}`;
    fs.writeFileSync(path.join(uploadDir, localName), file.buffer);

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { receiptFileId: localName, status: 'PAID' }
    });

    res.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error('Error uploading receipt:', error);
    res.status(500).json({ error: 'Error al subir el comprobante' });
  }
}

export async function getReceiptImage(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    const order = await prisma.order.findUnique({ where: { id } });

    if (!order?.receiptFileId) {
      res.status(404).json({ error: 'Sin comprobante' });
      return;
    }

    const filePath = path.resolve(process.cwd(), 'uploads', `local_order_${id}`, order.receiptFileId);

    if (!fs.existsSync(filePath)) {
      res.status(404).json({ error: 'Archivo no encontrado' });
      return;
    }

    res.sendFile(filePath);
  } catch (error) {
    console.error('Error serving receipt:', error);
    res.status(500).json({ error: 'Error al obtener el comprobante' });
  }
}

export async function getOrders(_req: Request, res: Response): Promise<void> {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Error fetching orders' });
  }
}

export async function updateOrderStatus(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    const { status, rejectReason } = req.body;

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      res.status(404).json({ error: 'Orden no encontrada' });
      return;
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status,
        ...(rejectReason && { rejectReason }),
      }
    });

    // Si aprueban el pedido, generamos el código y mandamos el correo
    if (status === 'PROCESSING' && order.email) {
      try {
        const { sendApprovalEmail } = await import('../services/emailService.js');

        // Generamos el código de impresión
        const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
        const printCode = `BOFT-${suffix}`;
        const sixMonths = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30 * 6);

        await (prisma as any).printCode.create({
          data: {
            code: printCode,
            value: order.totalPrice,
            isUsed: false,
            expiresAt: sixMonths,
          }
        });

        await sendApprovalEmail({
          customerName: order.customerName,
          customerEmail: order.email,
          orderId: order.id,
          printCode,
          totalPrice: order.totalPrice,
          photoCount: order.photoCount,
        });

        console.log(`[Email] Approval sent to ${order.email} with code ${printCode}`);
      } catch (emailErr) {
        // Si falla el correo no bloqueamos la aprobación, solo lo registramos
        console.error('[Email] Failed to send approval email:', emailErr);
      }
    }

    res.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Error updating order status' });
  }
}
