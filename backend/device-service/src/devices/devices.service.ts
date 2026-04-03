import { Injectable, NotFoundException } from '@nestjs/common';
import { DeviceRepository } from './infrastructure/prisma/device.repository';

@Injectable()
export class DevicesService {

  constructor(private readonly repo: DeviceRepository) {}
  
  async createDevice(data: { name: string; status?: string }) {
    return this.repo.create({
    name: data.name,
    status: data.status || 'AVAILABLE',
    });
  }
  
  async getDeviceById(id: string) {
    const device = await this.repo.findById(id);

    if (!device) {
      throw new NotFoundException('Dispositivo no encontrado');
    }

    return device;
  }

  async updateDeviceStatus(id: string, status: string) {
    const device = await this.repo.findById(id);

    if (!device) {
      throw new NotFoundException('Dispositivo no encontrado');
    }

    return this.repo.update(id, { status });
  }

  async getAllDevices() {
    return this.repo.findAll();
  }
}