import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ensureDatabaseUrl } from '../../config/database';

@Injectable()
export class UsersRepository implements OnModuleInit, OnModuleDestroy {
  private prisma: PrismaClient;

  constructor() {
    ensureDatabaseUrl();
    this.prisma = new PrismaClient();
  }

  async onModuleInit() {
    await this.prisma.$connect();
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }

  async createUser(data: {
    id?: string;
    name: string;
    email: string;
    password: string;
    role?: string;
  }) {
    try {
      return await this.prisma.user.create({ data });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new Error('El email ya está registrado');
      }
      throw error;
    }
  }

  async findUserById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findUserByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async updateUser(id: string, data: { name?: string; email?: string; role?: string }) {
    return this.prisma.user.update({ where: { id }, data });
  }

  async deleteUser(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }

  async getAllUsers() {
    return this.prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
  }
}
