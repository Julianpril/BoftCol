import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { uploadQrToDrive, deleteFileFromDrive } from '../services/googleDrive.js';

const prisma = new PrismaClient();

export async function getSettings(_req: Request, res: Response) {
  try {
    const settings = await prisma.settings.findUnique({
      where: { id: 'global' },
      select: {
        shippingCost: true,
        nequiNumber: true,
        nequiName: true,
        nequiQrUrl: true,
      },
    });

    if (!settings) {
      return res.status(404).json({ error: 'Settings not found' });
    }

    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
}

export async function updateSettings(req: Request, res: Response) {
  const { nequiNumber, nequiName } = req.body as { nequiNumber?: string; nequiName?: string };

  if (!nequiNumber || !/^\d{10}$/.test(nequiNumber.replace(/[\s-]/g, ''))) {
    return res.status(400).json({ error: 'Número Nequi inválido (debe tener 10 dígitos)' });
  }
  if (!nequiName || nequiName.trim().length === 0) {
    return res.status(400).json({ error: 'Nombre de cuenta requerido' });
  }

  try {
    const settings = await prisma.settings.update({
      where: { id: 'global' },
      data: { nequiNumber: nequiNumber.replace(/\s/g, ''), nequiName: nequiName.trim() },
      select: { nequiNumber: true, nequiName: true, nequiQrUrl: true, shippingCost: true },
    });
    res.json(settings);
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
}

export async function uploadQrSetting(req: Request, res: Response) {
  const file = req.file;
  if (!file) {
    return res.status(400).json({ error: 'Archivo QR requerido' });
  }

  try {
    const current = await prisma.settings.findUnique({
      where: { id: 'global' },
      select: { nequiQrDriveId: true },
    });

    const { fileId, publicUrl } = await uploadQrToDrive(file.buffer, file.mimetype);

    if (current?.nequiQrDriveId) {
      await deleteFileFromDrive(current.nequiQrDriveId).catch(() => {});
    }

    const settings = await prisma.settings.update({
      where: { id: 'global' },
      data: { nequiQrDriveId: fileId, nequiQrUrl: publicUrl },
      select: { nequiQrUrl: true },
    });

    res.json({ nequiQrUrl: settings.nequiQrUrl });
  } catch (error) {
    console.error('Error uploading QR:', error);
    res.status(500).json({ error: 'Error al subir el QR' });
  }
}
