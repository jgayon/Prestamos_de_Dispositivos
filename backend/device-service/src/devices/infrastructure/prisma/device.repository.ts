import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class DeviceRepository {
  private prisma = new PrismaClient();

  create(data: any) {
    return this.prisma.device.create({ data });
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
}