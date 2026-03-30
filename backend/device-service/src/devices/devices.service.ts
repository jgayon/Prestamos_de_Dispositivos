import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';

export interface Device {
  id: string;
  name: string;
  status: 'AVAILABLE' | 'LOANED';
}

@Injectable()
export class DevicesService {

  //Simulación de base de datos
  private devices: Device[] = [
    { id: '1', name: 'Laptop', status: 'AVAILABLE' },
    { id: '2', name: 'Charger', status: 'AVAILABLE' },
  ];

  //Obtener dispositivo por ID
  getDeviceById(id: string): Device {
    const device = this.devices.find(d => d.id === id);

    if (!device) {
      throw new NotFoundException('Dispositivo no encontrado');
    }

    return device;
  }

  //Actualizar estado del dispositivo
  updateDeviceStatus(id: string, status: string): Device {
    const device = this.devices.find(d => d.id === id);

    if (!device) {
      throw new NotFoundException('Dispositivo no encontrado');
    }

    //Validación
    if (!['AVAILABLE', 'LOANED'].includes(status)) {
      throw new BadRequestException('Estado no válido');
    }

    device.status = status as 'AVAILABLE' | 'LOANED';

    return device;
  }

  //Obtener todos los dispositivos (para pruebas/debug)
  getAllDevices(): Device[] {
    return this.devices;
  }
}