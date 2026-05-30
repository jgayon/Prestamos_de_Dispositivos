import { Injectable, NotFoundException } from '@nestjs/common';
import { DeviceRepository } from './infrastructure/prisma/device.repository';
import { Logger } from '@nestjs/common';

@Injectable()
export class DevicesService {

  constructor(private readonly repo: DeviceRepository) {}
  private readonly logger = new Logger(DevicesService.name);
  
  async createDevice(data: { name: string; status?: string }) {
    return this.repo.create({
    name: data.name,
    status: data.status || 'AVAILABLE',
    });
  }
  
  async getDeviceById(id: string) {
    this.logger.debug(`Buscando device ${id}`);
    const device = await this.repo.findById(id);

    if (!device) {
      this.logger.warn(`Device ${id} no encontrado`);
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