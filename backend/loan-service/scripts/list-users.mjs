import { PrismaClient } from '@prisma/client';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = resolve(__dirname, '../prisma/dev.db').replace(/\\/g, '/');

const prisma = new PrismaClient({
  datasources: { db: { url: `file:${dbPath}` } },
});

try {
  const users = await prisma.user.findMany({
    select: { email: true, name: true, role: true },
    orderBy: { createdAt: 'asc' },
  });
  console.log(JSON.stringify(users, null, 2));
  console.log('Total:', users.length);
} catch (e) {
  console.error('Error:', e.message);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
