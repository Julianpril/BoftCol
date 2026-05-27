import { prisma } from '../db/prisma.js';

/** Formatos disponibles para impresión. */
export const PHOTO_FORMATS = [
  {
    id: 'standard',
    name: 'Tamaño Estándar',
    dimensions: '7.5 x 10 cm',
    description: 'Incluye 2 fotos del mismo tamaño',
    photosPerPrint: 2,
  },
  {
    id: 'mini',
    name: 'Tamaño Mini',
    dimensions: '5 x 7.5 cm',
    description: 'Incluye 4 fotos pequeñas en un impreso',
    photosPerPrint: 4,
  },
];

/** Trae todos los rangos de precios desde la DB. */
export async function getPricingTiers() {
  return prisma.priceTier.findMany({
    orderBy: { photoCount: 'asc' },
  });
}

/** Calcula el precio según la cantidad de fotos usando los rangos de la DB. */
export async function calculatePrice(photoCount: number) {
  if (photoCount <= 0) return null;

  const tiers = await getPricingTiers();

  // Primero buscamos una coincidencia exacta
  const exact = tiers.find((t: any) => t.photoCount === photoCount);
  if (exact) return { tier: exact, total: exact.price };

  // Si no hay exacta, tomamos el siguiente rango superior
  const nextUp = tiers.find((t: any) => t.photoCount >= photoCount);
  if (nextUp) return { tier: nextUp, total: nextUp.price };

  // Si superan el máximo, cobramos $2.000 por foto
  const perPhoto = 2000;
  return {
    tier: { photoCount, price: photoCount * perPhoto, perPhoto },
    total: photoCount * perPhoto,
  };
}
