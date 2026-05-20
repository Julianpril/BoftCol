import { Request, Response } from 'express';
import { prisma } from '../db/prisma.js';

export async function createOrder(req: Request, res: Response): Promise<void> {
  try {
    const { orderId, driveFolderId, customerName, email, city, phone, address, photoCount, formatId, totalPrice, shippingCost } = req.body;

    if (!customerName || !city || !phone || !address || !photoCount) {
      res.status(400).json({ error: 'Faltan campos obligatorios' });
      return;
    }

    // Save order to the database
    const newOrder = await prisma.order.create({
      data: {
        id: orderId, // Use the ID generated during photo upload
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

import { uploadFileToDrive } from '../services/googleDrive.js';

export async function uploadReceipt(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    const file = req.file;

    if (!file) {
      res.status(400).json({ error: 'No se recibió el comprobante' });
      return;
    }

    // Verify order exists
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      res.status(404).json({ error: 'Orden no encontrada' });
      return;
    }

    // Upload receipt to Google Drive using the Order ID folder
    const result = await uploadFileToDrive(
      file.buffer,
      `comprobante_${id}_${file.originalname}`,
      file.mimetype,
      id
    );

    // Update order in DB
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        receiptFileId: result.fileId,
        status: 'PAID'
      }
    });

    res.json({
      success: true,
      order: updatedOrder
    });
  } catch (error) {
    console.error('Error uploading receipt:', error);
    res.status(500).json({ error: 'Error al subir el comprobante' });
  }
}

export async function getOrders(req: Request, res: Response): Promise<void> {
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

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { 
        status,
        ...(rejectReason && { rejectReason }) // Store rejection reason if provided
      }
    });

    res.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Error updating order status' });
  }
}
