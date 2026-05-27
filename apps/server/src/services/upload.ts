import multer from 'multer';
import { config } from '../config.js';
import type { Request } from 'express';

/** Multer guarda los archivos en memoria para subirlos sin escribir nada al disco. */
const storage = multer.memoryStorage();

function fileFilter(_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  if (config.upload.allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Tipo de archivo no soportado: ${file.mimetype}. Solo JPG, PNG y WebP.`));
  }
}

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.upload.maxFileSizeMB * 1024 * 1024,
    files: config.upload.maxFilesPerUpload,
  },
});

export const qrUpload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    if (['image/jpeg', 'image/png'].includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se aceptan imágenes JPG o PNG para el QR'));
    }
  },
  limits: {
    fileSize: 2 * 1024 * 1024,
    files: 1,
  },
});
