import { Module } from '@nestjs/common';
import { DevicesService } from './devices.service';
import { DevicesController } from './devices.controller';
import { DeviceRepository } from './infrastructure/prisma/device.repository';

@Module({
  controllers: [DevicesController],
  providers: [DevicesService, DeviceRepository],
})
export class DevicesModule {}