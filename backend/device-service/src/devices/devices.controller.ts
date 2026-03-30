import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { DevicesService } from './devices.service';

@Controller()
export class DevicesController {

  constructor(private readonly devicesService: DevicesService) {}

  //Obtener dispositivo por ID
  @MessagePattern('get_device')
  getDevice(@Payload() data: { id: string }) {
    return this.devicesService.getDeviceById(data.id);
  }

  //Actualizar estado del dispositivo
  @MessagePattern('update_device_status')
  updateDeviceStatus(@Payload() data: { id: string; status: string }) {
    return this.devicesService.updateDeviceStatus(data.id, data.status);
  }

  //Obtener todos los dispositivos
  @MessagePattern('get_all_devices')
  getAllDevices() {
    return this.devicesService.getAllDevices();
  }
}