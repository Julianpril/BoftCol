import { google, type drive_v3 } from 'googleapis';
import { Readable } from 'stream';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from '../config.js';

let driveClient: drive_v3.Drive | null = null;

/** Inicializa el cliente de Google Drive. Acepta archivo de credenciales o variables de entorno. */
function getAuthClient() {
  const { serviceAccountKeyFile, clientEmail, privateKey } = config.google;

  // Opción A: archivo de credenciales
  if (serviceAccountKeyFile) {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const resolvedPath = path.resolve(__dirname, '../../', serviceAccountKeyFile);
    if (fs.existsSync(resolvedPath)) {
      const auth = new google.auth.GoogleAuth({
        keyFile: resolvedPath,
        scopes: ['https://www.googleapis.com/auth/drive.file'],
      });
      return auth;
    }
    console.warn(`[GoogleDrive] Key file not found at: ${resolvedPath}`);
  }

  // Opción B: credenciales en variables de entorno
  if (clientEmail && privateKey) {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
      },
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    });
    return auth;
  }

  console.warn('[GoogleDrive] No credentials configured. Uploads will be stored locally only.');
  return null;
}

/** Devuelve el cliente singleton de Drive, lo inicializa si aún no existe. */
export function getDriveClient(): drive_v3.Drive | null {
  if (driveClient) return driveClient;

  const auth = getAuthClient();
  if (!auth) return null;

  driveClient = google.drive({ version: 'v3', auth });
  return driveClient;
}

export interface UploadResult {
  fileId: string;
  folderId: string;
  fileName: string;
  mimeType: string;
  webViewLink: string;
  thumbnailLink: string;
}

/** Sube un archivo a Drive dentro de la carpeta configurada. Crea una subcarpeta por pedido para no mezclar archivos. */
export async function uploadFileToDrive(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string,
  orderId: string,
): Promise<UploadResult> {
  const drive = getDriveClient();
  if (!drive) {
    throw new Error('Google Drive not configured. Set GOOGLE_SERVICE_ACCOUNT_KEY_FILE or inline credentials in .env');
  }

  // Buscamos (o creamos) la subcarpeta del pedido
  const folderId = await getOrCreateOrderFolder(drive, orderId);

  // Subimos el archivo
  const response = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: [folderId],
      mimeType,
    },
    media: {
      mimeType,
      body: Readable.from(fileBuffer),
    },
    fields: 'id, name, mimeType, webViewLink, thumbnailLink',
  });

  const file = response.data;

  return {
    fileId: file.id || '',
    folderId,
    fileName: file.name || fileName,
    mimeType: file.mimeType || mimeType,
    webViewLink: file.webViewLink || '',
    thumbnailLink: file.thumbnailLink || '',
  };
}

/** Busca o crea la subcarpeta del pedido dentro de la carpeta raíz de Drive. */
async function getOrCreateOrderFolder(
  drive: drive_v3.Drive,
  orderId: string,
): Promise<string> {
  const parentFolderId = config.google.driveFolderId;
  const folderName = `order_${orderId}`;

  // Verificamos si ya existe la carpeta
  const search = await drive.files.list({
    q: `name='${folderName}' and '${parentFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: 'files(id)',
    spaces: 'drive',
  });

  if (search.data.files && search.data.files.length > 0) {
    return search.data.files[0].id!;
  }

  // La creamos si no existía
  const folder = await drive.files.create({
    requestBody: {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentFolderId],
    },
    fields: 'id',
  });

  return folder.data.id!;
}

/** Elimina un archivo de Google Drive. */
export async function deleteFileFromDrive(fileId: string): Promise<void> {
  const drive = getDriveClient();
  if (!drive) return;

  await drive.files.delete({ fileId });
}

async function getOrCreateSettingsFolder(drive: drive_v3.Drive): Promise<string> {
  const parentFolderId = config.google.driveFolderId;
  const folderName = 'settings';

  const search = await drive.files.list({
    q: `name='${folderName}' and '${parentFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: 'files(id)',
    spaces: 'drive',
  });

  if (search.data.files && search.data.files.length > 0) {
    return search.data.files[0].id!;
  }

  const folder = await drive.files.create({
    requestBody: {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentFolderId],
    },
    fields: 'id',
  });

  return folder.data.id!;
}

export interface QrUploadResult {
  fileId: string;
  publicUrl: string;
}

/** Sube el QR de Nequi a la carpeta 'settings/' en Drive, lo hace público y devuelve la URL directa. */
export async function uploadQrToDrive(
  fileBuffer: Buffer,
  mimeType: string,
): Promise<QrUploadResult> {
  const drive = getDriveClient();
  if (!drive) {
    throw new Error('Google Drive not configured. Set credentials in .env');
  }

  const settingsFolderId = await getOrCreateSettingsFolder(drive);
  const ext = mimeType === 'image/png' ? 'png' : 'jpg';

  const response = await drive.files.create({
    requestBody: {
      name: `nequi-qr-${Date.now()}.${ext}`,
      parents: [settingsFolderId],
      mimeType,
    },
    media: {
      mimeType,
      body: Readable.from(fileBuffer),
    },
    fields: 'id',
  });

  const fileId = response.data.id!;

  await drive.permissions.create({
    fileId,
    requestBody: { role: 'reader', type: 'anyone' },
  });

  return {
    fileId,
    publicUrl: `https://drive.google.com/uc?export=view&id=${fileId}`,
  };
}
