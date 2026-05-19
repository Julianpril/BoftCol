import { prisma } from '../db/prisma.js';

/**
 * Available photo formats.
 */
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

/**
 * Fetch all pricing tiers from the database.
 */
export async function getPricingTiers() {
  return prisma.priceTier.findMany({
    orderBy: { photoCount: 'asc' },
  });
}

/**
 * Calculates the price for a given number of photos based on DB tiers.
 */
export async function calculatePrice(photoCount: number) {
  if (photoCount <= 0) return null;

  const tiers = await getPricingTiers();

  // Find exact match first
  const exact = tiers.find((t: any) => t.photoCount === photoCount);
  if (exact) return { tier: exact, total: exact.price };

  // Find next tier up
  const nextUp = tiers.find((t: any) => t.photoCount >= photoCount);
  if (nextUp) return { tier: nextUp, total: nextUp.price };

  // More than max tier: calculate at $2,000 per photo
  const perPhoto = 2000;
  return {
    tier: { photoCount, price: photoCount * perPhoto, perPhoto },
    total: photoCount * perPhoto,
  };
}
