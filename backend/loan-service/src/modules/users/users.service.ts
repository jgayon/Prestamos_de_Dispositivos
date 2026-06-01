import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { randomUUID } from 'crypto';
import { hashPassword, verifyPassword } from '../../utils/password.utils';

const VALID_ROLES = ['ADMIN', 'USER'] as const;
type UserRole = (typeof VALID_ROLES)[number];

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  private sanitizeUser<T extends { password?: string }>(user: T) {
    const { password: _password, ...safe } = user;
    return safe;
  }

  private normalizeRole(role?: string): UserRole {
    return role?.toUpperCase() === 'ADMIN' ? 'ADMIN' : 'USER';
  }

  async createUser(name: string, email: string, password: string, role?: string) {
    const id = randomUUID();
    const hashedPassword = await hashPassword(password);
    const normalizedRole = this.normalizeRole(role);

    try {
      const user = await this.usersRepository.createUser({
        id,
        name,
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        role: normalizedRole,
      });
      return this.sanitizeUser(user);
    } catch (error) {
      if (error instanceof Error && error.message === 'El email ya está registrado') {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  async validateCredentials(email: string, password: string) {
    const user = await this.usersRepository.findUserByEmail(email.trim().toLowerCase());
    if (!user) {
      return null;
    }

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return null;
    }

    return this.sanitizeUser(user);
  }

  async getUserById(id: string) {
    const user = await this.usersRepository.findUserById(id);
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return this.sanitizeUser(user);
  }

  async listUsers() {
    const users = await this.usersRepository.getAllUsers();
    return users.map((user) => this.sanitizeUser(user));
  }

  async updateUser(id: string, data: { name?: string; email?: string; role?: string }) {
    const payload: { name?: string; email?: string; role?: string } = {};

    if (data.name !== undefined) payload.name = data.name;
    if (data.email !== undefined) payload.email = data.email.trim().toLowerCase();
    if (data.role !== undefined) payload.role = this.normalizeRole(data.role);

    const user = await this.usersRepository.updateUser(id, payload);
    return this.sanitizeUser(user);
  }

  async deleteUser(id: string) {
    const user = await this.usersRepository.findUserById(id);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    await this.usersRepository.deleteUser(id);
    return { success: true };
  }
}
