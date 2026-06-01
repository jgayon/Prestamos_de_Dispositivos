import { PrismaClient } from '@prisma/client';
import { createHash, randomBytes } from 'crypto';

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const hash = createHash('sha256').update(password + salt).digest('hex');
  return `${hash}:${salt}`;
}

const defaultUsers = [
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

async function main() {
  for (const user of defaultUsers) {
    const hashedPassword = await hashPassword(user.password);
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        password: hashedPassword,
        role: user.role,
      },
      create: {
        id: user.id,
        name: user.name,
        email: user.email,
        password: hashedPassword,
        role: user.role,
      },
    });
    console.log(`Usuario listo: ${user.email} (${user.role})`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
