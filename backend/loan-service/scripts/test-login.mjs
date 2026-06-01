import { PrismaClient } from '@prisma/client';
import { createHash } from 'crypto';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, '../prisma/dev.db').replace(/\\/g, '/');

const prisma = new PrismaClient({
  datasources: { db: { url: `file:${dbPath}` } },
});

function verifyPassword(password, hash) {
  const parts = hash.split(':');
  if (parts.length !== 2) return false;
  const [storedHash, salt] = parts;
  const computedHash = createHash('sha256').update(password + salt).digest('hex');
  return computedHash === storedHash;
}

const email = 'carlos.mendoza@empresa.com';
const password = 'admin123';

const user = await prisma.user.findUnique({ where: { email } });
console.log('DB:', dbPath);
console.log('User found:', !!user);
if (user) {
  console.log('Email:', user.email, 'Role:', user.role);
  console.log('Password valid:', verifyPassword(password, user.password));
}

await prisma.$disconnect();
