import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { DevicesService } from './devices.service';

@Controller()
export class DevicesController {

  constructor(private readonly devicesService: DevicesService) {}
    @MessagePattern({ cmd: 'create_device' })
    createDevice(@Payload() data: { name: string }) {
      return this.devicesService.createDevice(data);
    }
    @MessagePattern({ cmd: 'get_device' })
    getDevice(@Payload() data: { id: string }) {
      return this.devicesService.getDeviceById(data.id);
    }

    @MessagePattern({ cmd: 'update_device_status' })
    updateDeviceStatus(@Payload() data: { id: string; status: string }) {
      return this.devicesService.updateDeviceStatus(data.id, data.status);
    }

    @MessagePattern({ cmd: 'get_all_devices' })
    getAllDevices() {
      return this.devicesService.getAllDevices();
    }
}