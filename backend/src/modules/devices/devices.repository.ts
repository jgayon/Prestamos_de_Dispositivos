import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class DevicesRepository {
  private prisma = new PrismaClient();

  async createDevice(data: { id?: string; name: string; status: string }) {
    return this.prisma.device.create({ data });
  }

  async findDeviceById(id: string) {
    return this.prisma.device.findUnique({ where: { id } });
  }

  async updateDevice(id: string, data: any) {
    return this.prisma.device.update({ where: { id }, data });
  }

  async deleteDevice(id: string) {
    return this.prisma.device.delete({ where: { id } });
  }

  async getAllDevices() {
    return this.prisma.device.findMany();
  }

  async findAvailableDevices() {
    return this.prisma.device.findMany({ where: { status: 'AVAILABLE' } });
  }
}
