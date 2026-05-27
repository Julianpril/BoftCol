import { Request, Response } from 'express';
import { prisma } from '../db/prisma.js';

export async function getCodes(req: Request, res: Response): Promise<void> {
  try {
    const codes = await prisma.printCode.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(codes);
  } catch (error) {
    console.error('Error fetching print codes:', error);
    res.status(500).json({ error: 'Failed to fetch print codes' });
  }
}

export async function createCode(req: Request, res: Response): Promise<void> {
  try {
    const { code, value, expiresAt } = req.body;
    
    if (!code || !value) {
      res.status(400).json({ error: 'Code and value are required' });
      return;
    }

    const newCode = await prisma.printCode.create({
      data: {
        code,
        value: Number(value),
        expiresAt: expiresAt ? new Date(expiresAt) : new Date(Date.now() + 1000 * 60 * 60 * 24 * 30 * 6) // default 6 months
      }
    });

    res.status(201).json(newCode);
  } catch (error: any) {
    console.error('Error creating print code:', error);
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'Este código ya existe' });
      return;
    }
    res.status(500).json({ error: 'Failed to create print code' });
  }
}

export async function updateCode(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { code, value, isUsed, expiresAt } = req.body;

    const data: any = {};
    if (code !== undefined) data.code = code;
    if (value !== undefined) data.value = Number(value);
    if (isUsed !== undefined) data.isUsed = Boolean(isUsed);
    if (expiresAt !== undefined) data.expiresAt = new Date(expiresAt);

    if (Object.keys(data).length === 0) {
      res.status(400).json({ error: 'No fields to update' });
      return;
    }

    const updated = await (prisma as any).printCode.update({
      where: { id },
      data
    });
    res.json(updated);
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Código no encontrado' });
      return;
    }
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'Ese código ya existe' });
      return;
    }
    res.status(500).json({ error: 'Failed to update code' });
  }
}

export async function bulkUploadCodes(req: Request, res: Response): Promise<void> {
  try {
    const { codes } = req.body; // Expects array of { code: string, value: number, expiresAt?: string }
    
    if (!Array.isArray(codes) || codes.length === 0) {
      res.status(400).json({ error: 'Invalid or empty codes array' });
      return;
    }

    const defaultExpires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30 * 6);

    // Filtramos los que tengan código y valor
    const validCodes = codes.filter(c => c.code && c.value).map(c => ({
      code: c.code,
      value: Number(c.value),
      isUsed: false,
      expiresAt: c.expiresAt ? new Date(c.expiresAt) : defaultExpires
    }));

    // skipDuplicates ignora los que ya existen sin reventar la operación
    const result = await prisma.printCode.createMany({
      data: validCodes,
      skipDuplicates: true
    });

    res.status(201).json({ count: result.count, message: `Successfully imported ${result.count} codes.` });
  } catch (error) {
    console.error('Error bulk uploading print codes:', error);
    res.status(500).json({ error: 'Failed to bulk upload print codes' });
  }
}
