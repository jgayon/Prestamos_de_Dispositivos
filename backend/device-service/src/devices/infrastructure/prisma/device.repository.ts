import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

@Injectable()
export class DeviceRepository implements OnModuleInit, OnModuleDestroy {
  // Force Prisma to use the explicit DATABASE_URL at runtime to avoid
  // picking a different .env or relative path when the service runs.
  private prisma = new PrismaClient({
    datasources: {
      db: { url: process.env.DATABASE_URL || undefined },
    },
  });

  async onModuleInit() {
    await this.prisma.$connect();
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }

  create(data: any) {
  return this.prisma.device.create({
    data: {
      id: randomUUID(), 
      name: data.name,
      status: data.status,
    },
  });
}

  findById(id: string) {
    return this.prisma.device.findUnique({ where: { id } });
  }

  update(id: string, data: any) {
    return this.prisma.device.update({
      where: { id },
      data,
    });
  }

  findAll() {
    return this.prisma.device.findMany();
  }

  findByStatus(status: string) {
    return this.prisma.device.findMany({ where: { status } });
  }

  delete(id: string) {
    return this.prisma.device.delete({ where: { id } });
  }
}