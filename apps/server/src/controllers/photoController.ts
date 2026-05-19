import type { Request, Response } from 'express';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const archiver = require('archiver') as typeof import('archiver');
import { uploadFileToDrive, deleteFileFromDrive } from '../services/googleDrive.js';
import { PHOTO_FORMATS, getPricingTiers, calculatePrice } from '../services/catalog.js';

/**
 * GET /api/photos/formats
 * Returns available photo formats.
 */
export async function getFormats(_req: Request, res: Response) {
  res.json({ formats: PHOTO_FORMATS });
}

/**
 * GET /api/photos/pricing
 * Returns full pricing table.
 */
export async function getPricing(_req: Request, res: Response) {
  try {
    const tiers = await getPricingTiers();
    // Maps the DB schema to the frontend expected format
    res.json({ tiers: tiers.map((t: any) => ({ photos: t.photoCount, price: t.price, perPhoto: t.perPhoto })) });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching pricing' });
  }
}

/**
 * GET /api/photos/price?count=6
 * Calculates price for a specific photo count.
 */
export async function getPrice(req: Request, res: Response) {
  const count = parseInt(req.query.count as string, 10);

  if (!count || count < 1) {
    res.status(400).json({ error: 'El parámetro "count" es requerido y debe ser mayor a 0.' });
    return;
  }

  const result = await calculatePrice(count);
  if (!result) {
    res.status(400).json({ error: 'No se pudo calcular el precio.' });
    return;
  }

  res.json(result);
}

/**
 * POST /api/photos/upload
 * Uploads one or more photos to the local server storage.
 * Body: multipart/form-data with field "photos" (array of files)
 * Query: ?orderId=xxx (optional, auto-generated if not provided)
 */
export async function uploadPhotos(req: Request, res: Response) {
  try {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      res.status(400).json({ error: 'No se recibieron archivos.' });
      return;
    }

    const orderId = (req.query.orderId as string) || crypto.randomUUID();
    const driveFolderId = `local_order_${orderId}`;
    
    // Configurar directorio de subida local
    const __dirname = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([a-zA-Z]:\/)/, '$1');
    // Para asegurar compatibilidad con Windows y Linux al usar fileURLToPath:
    const uploadDir = path.resolve(process.cwd(), 'uploads', driveFolderId);
    
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const uploadResults = await Promise.all(
      files.map(async (file) => {
        const fileId = crypto.randomUUID();
        const extension = path.extname(file.originalname) || '.jpg';
        const fileName = `${fileId}${extension}`;
        const filePath = path.join(uploadDir, fileName);
        
        await fs.promises.writeFile(filePath, file.buffer);
        
        return {
          id: fileId,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          driveFileId: fileId,
          driveFolderId,
          driveViewLink: '', // No web link since it's local
          thumbnailUrl: '',
          uploadedAt: new Date().toISOString(),
        };
      }),
    );

    // Calculate price for the uploaded count
    const priceInfo = await calculatePrice(uploadResults.length);

    res.status(201).json({
      orderId,
      driveFolderId,
      photos: uploadResults,
      count: uploadResults.length,
      pricing: priceInfo,
    });
  } catch (error) {
    console.error('[Upload Error]', error);
    const message = error instanceof Error ? error.message : 'Error al subir las fotos.';
    res.status(500).json({ error: message });
  }
}

/**
 * DELETE /api/photos/:fileId
 * Removes a photo from Google Drive.
 */
export async function deletePhoto(req: Request, res: Response) {
  try {
    const fileId = req.params.fileId as string;

    if (!fileId) {
      res.status(400).json({ error: 'fileId es requerido.' });
      return;
    }

    await deleteFileFromDrive(fileId);
    res.json({ success: true, message: 'Foto eliminada.' });
  } catch (error) {
    console.error('[Delete Error]', error);
    const message = error instanceof Error ? error.message : 'Error al eliminar la foto.';
    res.status(500).json({ error: message });
  }
}

/**
 * GET /api/photos/download/:folderId
 * Downloads all photos from a local folder as a ZIP file
 */
export async function downloadOrderPhotos(req: Request, res: Response) {
  try {
    const folderId = req.params.folderId as string;
    if (!folderId) {
      res.status(400).json({ error: 'folderId es requerido.' });
      return;
    }

    const folderPath = path.resolve(process.cwd(), 'uploads', folderId);
    
    if (!fs.existsSync(folderPath)) {
      res.status(404).json({ error: 'No se encontraron las fotos para este pedido.' });
      return;
    }

    res.writeHead(200, {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="pedido-${folderId}.zip"`,
    });

    const archive = archiver('zip', {
      zlib: { level: 0 } // No compression, photos are already compressed JPEG/PNG. Fast download.
    });

    archive.on('error', (err: any) => {
      throw err;
    });

    archive.pipe(res);
    archive.directory(folderPath, false);
    await archive.finalize();
  } catch (error) {
    console.error('[Download Error]', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Error al generar el archivo ZIP.' });
    }
  }
}
