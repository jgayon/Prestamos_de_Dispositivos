import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const paths = [
  '../prisma/dev.db',
  '../prisma/prisma/dev.db',
  '../dev.db',
];

for (const rel of paths) {
  const full = resolve(__dirname, rel);
  if (!existsSync(full)) {
    console.log('MISSING', full);
    continue;
  }
  const buf = readFileSync(full);
  const hasRole = buf.includes(Buffer.from('role'));
  console.log(full, 'size=', buf.length, 'buffer_has_role_string=', hasRole);
}
