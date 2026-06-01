import { PrismaClient } from '@prisma/client';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = resolve(__dirname, '../prisma/dev.db').replace(/\\/g, '/');

const prisma = new PrismaClient({
  datasources: { db: { url: `file:${dbPath}` } },
});

const info = await prisma.$queryRawUnsafe('PRAGMA table_info(User);');
console.log('DB:', dbPath);
console.log('Columns:', info);
