import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class UsersRepository {
  private prisma = new PrismaClient();

  async createUser(data: { id?: string; name: string; email: string }) {
    try {
    return await this.prisma.user.create({
      data,
    });
  } catch (error) {
    if (error.code === 'P2002') {
      throw new Error('El email ya está registrado');
    }
    throw error;
  }
  }

  async findUserById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async updateUser(id: string, data: any) {
    return this.prisma.user.update({ where: { id }, data });
  }

  async deleteUser(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }

  async getAllUsers() {
    return this.prisma.user.findMany();
  }
}
