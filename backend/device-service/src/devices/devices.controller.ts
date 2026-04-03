import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { DevicesService } from './devices.service';

@Controller()
export class DevicesController {

  constructor(private readonly devicesService: DevicesService) {}
    @MessagePattern( 'create_device' )
    createDevice(@Payload() data: { name: string }) {
      console.log('📡 create_device recibido:', data);
      return this.devicesService.createDevice(data);
    }
    @MessagePattern( 'get_device' )
    getDevice(@Payload() data: { id: string }) {
       console.log('📡 get_device recibido:', data);
      return this.devicesService.getDeviceById(data.id);
    }

    @MessagePattern( 'update_device_status' )
    updateDeviceStatus(@Payload() data: { id: string; status: string }) {
      console.log('📡 update_device_status:', data);
      return this.devicesService.updateDeviceStatus(data.id, data.status);
    }

    @MessagePattern('get_all_devices')
    getAllDevices() {
      console.log('📡 get_all_devices recibido');
      return this.devicesService.getAllDevices();
    }
}