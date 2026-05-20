const API_BASE = '/api';

/**
 * Generic fetch wrapper with error handling.
 */
async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Error ${res.status}: ${res.statusText}`);
  }

  return res.json();
}

// ─── Types (mirrored from server) ───

export interface PhotoFormat {
  id: string;
  name: string;
  dimensions: string;
  description: string;
  photosPerPrint: number;
}

export interface PriceTier {
  photos: number;
  price: number;
  perPhoto: number;
}

export interface UploadedPhoto {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  driveFileId: string;
  driveViewLink: string;
  thumbnailUrl: string;
  uploadedAt: string;
}

// ─── API Methods ───

export async function fetchFormats(): Promise<PhotoFormat[]> {
  const data = await apiFetch<{ formats: PhotoFormat[] }>('/photos/formats');
  return data.formats;
}

export async function fetchPricing(): Promise<PriceTier[]> {
  const data = await apiFetch<{ tiers: PriceTier[] }>('/photos/pricing');
  return data.tiers;
}

export async function fetchPrice(count: number): Promise<{ tier: PriceTier; total: number }> {
  return apiFetch(`/photos/price?count=${count}`);
}

export interface UploadResponse {
  orderId: string;
  photos: UploadedPhoto[];
  count: number;
  pricing: { tier: PriceTier; total: number } | null;
}

export async function uploadPhotos(files: File[], orderId?: string): Promise<UploadResponse> {
  const formData = new FormData();
  files.forEach((file) => formData.append('photos', file));

  const url = orderId ? `/photos/upload?orderId=${orderId}` : '/photos/upload';

  const res = await fetch(`${API_BASE}${url}`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Error al subir las fotos.');
  }

  return res.json();
}

export async function deletePhoto(fileId: string): Promise<void> {
  await apiFetch(`/photos/${fileId}`, { method: 'DELETE' });
}
