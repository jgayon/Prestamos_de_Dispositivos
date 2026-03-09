import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { randomUUID } from 'crypto';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async createUser(name: string, email: string) {
    const id = randomUUID();
    return this.usersRepository.createUser({ id, name, email });
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
    return this.usersRepository.deleteUser(id);
  }
}
