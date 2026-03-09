import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { DevicesService } from './devices.service';

@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Post()
  create(@Body() body: { name: string; status?: string }) {
    return this.devicesService.createDevice(body.name, body.status || 'AVAILABLE');
  }

  @Get()
  list() {
    return this.devicesService.listDevices();
  }

  @Get('disponibles')
  available() {
    return this.devicesService.listAvailable();
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.devicesService.getDeviceById(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.devicesService.updateDevice(id, body);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.devicesService.deleteDevice(id);
  }
}
