import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { randomUUID } from 'crypto';
import { hashPassword } from '../../utils/password.utils';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async createUser(name: string, email: string, password: string) {
    const id = randomUUID();
    const hashedPassword = await hashPassword(password);
    return this.usersRepository.createUser({ id, name, email, password: hashedPassword });
  }

  async getUserById(id: string) {
    const user = await this.usersRepository.findUserById(id);
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  async listUsers() {
    return this.usersRepository.getAllUsers();
  }

  async updateUser(id: string, data: any) {
    return this.usersRepository.updateUser(id, data);
  }

  async deleteUser(id: string) {
    const user = await this.usersRepository.findUserById(id);
    if (!user) {
      throw new NotFoundException(
        'Usuario no encontrado',
      );
    }

    return this.usersRepository.deleteUser(id);
  }
}
