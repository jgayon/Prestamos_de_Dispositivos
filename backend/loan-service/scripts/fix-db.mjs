import { PrismaClient } from '@prisma/client';
import { createHash, randomBytes } from 'crypto';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = resolve(__dirname, '../prisma/dev.db').replace(/\\/g, '/');

const prisma = new PrismaClient({
  datasources: { db: { url: `file:${dbPath}` } },
});

async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = createHash('sha256').update(password + salt).digest('hex');
  return `${hash}:${salt}`;
}

const columns = await prisma.$queryRawUnsafe('PRAGMA table_info(User);');
const hasRole = columns.some((c) => c.name === 'role');

if (!hasRole) {
  await prisma.$executeRawUnsafe(
    "ALTER TABLE User ADD COLUMN role TEXT NOT NULL DEFAULT 'USER';",
  );
  await prisma.$executeRawUnsafe('CREATE INDEX IF NOT EXISTS User_role_idx ON User(role);');
  console.log('Columna role agregada en', dbPath);
} else {
  console.log('Columna role ya existe en', dbPath);
}

const demoUsers = [
  {
    id: 'demo-admin-001',
    name: 'Carlos Mendoza',
    email: 'carlos.mendoza@empresa.com',
    password: 'admin123',
    role: 'ADMIN',
  },
  {
    id: 'demo-user-001',
    name: 'Ana Ramirez',
    email: 'ana.ramirez@empresa.com',
    password: 'user1234',
    role: 'USER',
  },
];

for (const user of demoUsers) {
  const hashedPassword = await hashPassword(user.password);
  await prisma.user.upsert({
    where: { email: user.email },
    update: { name: user.name, password: hashedPassword, role: user.role },
    create: {
      id: user.id,
      name: user.name,
      email: user.email,
      password: hashedPassword,
      role: user.role,
    },
  });
  console.log(`Demo: ${user.email} / ${user.password} (${user.role})`);
}

const all = await prisma.user.findMany({
  select: { email: true, role: true },
  orderBy: { email: 'asc' },
});
console.log('Usuarios en BD:', all);

await prisma.$disconnect();
