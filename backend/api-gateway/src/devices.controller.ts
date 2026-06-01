import { Controller, Get, Post, Body, Param, Inject, Put, Delete, ValidationPipe } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { CreateDeviceDTO, UpdateDeviceStatusDTO } from './dto/create-device.dto';

@Controller('devices')
export class DevicesController {
  constructor(
    @Inject('DEVICE_SERVICE') private client: ClientProxy,
  ) {}

  @Post()
  async create(@Body(new ValidationPipe()) createDeviceDto: CreateDeviceDTO) {
    return await firstValueFrom(
      this.client.send('create_device', createDeviceDto)
    );
  }

  @Get()
  async findAll() {
    return await firstValueFrom(
      this.client.send('get_all_devices', {})
    );
  }

  @Get('disponibles')
  async findAvailable() {
    return await firstValueFrom(
      this.client.send('get_available_devices', {})
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await firstValueFrom(
      this.client.send('get_device', { id })
    );
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body(new ValidationPipe()) updateDeviceDto: UpdateDeviceStatusDTO) {
    return await firstValueFrom(
      this.client.send('update_device_status', { id, ...updateDeviceDto })
    );
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await firstValueFrom(
      this.client.send('delete_device', { id })
    );
  }
}