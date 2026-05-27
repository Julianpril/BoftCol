/** Formatos de foto disponibles para impresión. */
export interface PhotoFormat {
  id: string;
  name: string;
  dimensions: string;
  description: string;
  photosPerPrint: number;
}

/** Franja de precios según cantidad de fotos. */
export interface PriceTier {
  photos: number;
  price: number;
  perPhoto: number;
}

/** Metadatos de una foto subida. */
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

/** Pedido en curso. */
export interface PhotoOrder {
  orderId: string;
  formatId: string;
  photos: UploadedPhoto[];
  totalPrice: number;
  status: 'uploading' | 'pending_payment' | 'paid' | 'printing' | 'shipped' | 'delivered';
  createdAt: string;
}
