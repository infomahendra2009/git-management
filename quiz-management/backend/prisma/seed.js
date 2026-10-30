import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const existing = await prisma.user.count({ where: { role: 'ADMIN' } });
if (existing === 0) {
  const e = process.env;
  await prisma.user.create({
    data: {
      userCode: 'ADMIN001',
      name: e.SEED_ADMIN_NAME || 'Admin',
      email: (e.SEED_ADMIN_EMAIL || 'admin@example.com').toLowerCase(),
      phone: e.SEED_ADMIN_PHONE || '+919999999999',
      passwordHash: await bcrypt.hash(e.SEED_ADMIN_PASSWORD || 'ChangeMe@123', 10),
      role: 'ADMIN',
      mustChangePassword: true,
    },
  });
  console.log('Seeded first admin. Change the password after first login.');
} else {
  console.log('Admin already exists, seed skipped.');
}
await prisma.$disconnect();
