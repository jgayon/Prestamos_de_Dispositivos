import { createHash, randomBytes } from 'crypto';

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const hash = createHash('sha256').update(password + salt).digest('hex');
  return `${hash}:${salt}`;
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    const parts = hash.split(':');
    if (parts.length !== 2) {
      return false;
    }

    const storedHash = parts[0];
    const salt = parts[1];
    const computedHash = createHash('sha256').update(password + salt).digest('hex');

    return computedHash === storedHash;
  } catch (error) {
    return false;
  }
}
