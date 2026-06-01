import { existsSync } from 'fs';
import { join } from 'path';

/**
 * Prisma resuelve rutas SQLite relativas desde la carpeta prisma/,
 * no desde process.cwd(). Por eso usamos siempre ruta absoluta.
 */
export function resolveDatabaseUrl(): string {
  const candidates = [
    join(process.cwd(), 'prisma', 'dev.db'),
    join(process.cwd(), 'backend', 'loan-service', 'prisma', 'dev.db'),
  ];

  const dbFile = (candidates.find((p) => existsSync(p)) ?? candidates[0]).replace(/\\/g, '/');
  return `file:${dbFile}`;
}

export function ensureDatabaseUrl(): void {
  process.env.DATABASE_URL = resolveDatabaseUrl();
}
