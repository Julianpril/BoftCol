/**
 * Photo format types available for printing.
 * In the future, these come from a database.
 */
export interface PhotoFormat {
  id: string;
  name: string;
  dimensions: string;
  description: string;
  photosPerPrint: number;
}

/**
 * Pricing tier based on number of photos.
 */
export interface PriceTier {
  photos: number;
  price: number;
  perPhoto: number;
}

/**
 * Uploaded photo metadata.
 */
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

/**
 * Order in progress.
 */
export interface PhotoOrder {
  orderId: string;
  formatId: string;
  photos: UploadedPhoto[];
  totalPrice: number;
  status: 'uploading' | 'pending_payment' | 'paid' | 'printing' | 'shipped' | 'delivered';
  createdAt: string;
}
