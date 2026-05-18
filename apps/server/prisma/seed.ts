import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

const PRICE_TIERS = [
  { photoCount: 2, price: 6000, perPhoto: 3000 },
  { photoCount: 4, price: 12000, perPhoto: 3000 },
  { photoCount: 6, price: 15000, perPhoto: 2500 },
  { photoCount: 8, price: 20000, perPhoto: 2500 },
  { photoCount: 10, price: 25000, perPhoto: 2500 },
  { photoCount: 12, price: 30000, perPhoto: 2500 },
  { photoCount: 14, price: 35000, perPhoto: 2500 },
  { photoCount: 18, price: 45000, perPhoto: 2500 },
  { photoCount: 20, price: 50000, perPhoto: 2409.09 },
  { photoCount: 22, price: 55000, perPhoto: 2291.67 },
  { photoCount: 26, price: 58000, perPhoto: 2230.77 },
  { photoCount: 28, price: 60000, perPhoto: 2142.86 },
  { photoCount: 32, price: 65000, perPhoto: 2031.25 },
  { photoCount: 34, price: 68000, perPhoto: 2000 },
  { photoCount: 36, price: 72000, perPhoto: 2000 },
  { photoCount: 38, price: 76000, perPhoto: 2000 },
  { photoCount: 40, price: 80000, perPhoto: 2000 },
  { photoCount: 42, price: 84000, perPhoto: 2000 },
  { photoCount: 44, price: 88000, perPhoto: 2000 },
  { photoCount: 46, price: 92000, perPhoto: 2000 },
  { photoCount: 48, price: 96000, perPhoto: 2000 },
  { photoCount: 50, price: 100000, perPhoto: 2000 },
];

async function main() {
  console.log('Start seeding...');
  for (const tier of PRICE_TIERS) {
    await prisma.priceTier.upsert({
      where: { photoCount: tier.photoCount },
      update: tier,
      create: tier,
    });
  }
  console.log('Pricing tiers seeded successfully.');

  // Seed settings
  await prisma.settings.upsert({
    where: { id: 'global' },
    update: {},
    create: {
      id: 'global',
      shippingCost: 2900,
      nequiNumber: '312 5871 829',
      nequiName: 'BOFT COLOMBIA SAS'
    }
  });
  console.log('Settings seeded.');

  // Seed admin from .env
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (adminEmail && adminPassword) {
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    await prisma.admin.upsert({
      where: { email: adminEmail },
      update: {},
      create: { email: adminEmail, passwordHash },
    });
    console.log(`Admin seeded: ${adminEmail}`);
  } else {
    console.warn('ADMIN_EMAIL or ADMIN_PASSWORD not set — skipping admin seed');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
