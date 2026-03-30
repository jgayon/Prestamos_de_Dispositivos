import { Injectable, NotFoundException } from '@nestjs/common';
import { DevicesRepository } from './devices.repository';
import { randomUUID } from 'crypto';

@Injectable()
export class DevicesService {
  constructor(private readonly devicesRepository: DevicesRepository) {}

  async createDevice(name: string, status: string) {
    const id = randomUUID();
    return this.devicesRepository.createDevice({ id, name, status });
  }

  async getDeviceById(id: string) {
    const device = await this.devicesRepository.findDeviceById(id);
    if (!device) throw new NotFoundException('Dispositivo no encontrado');
    return device;
  }

  async listDevices() {
    return this.devicesRepository.getAllDevices();
  }

  async listAvailable() {
    return this.devicesRepository.findAvailableDevices();
  }

  async updateDevice(id: string, data: any) {
    return this.devicesRepository.updateDevice(id, data);
  }

  async deleteDevice(id: string) {
    return this.devicesRepository.deleteDevice(id);
  }
}
