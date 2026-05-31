import { Controller, Get, Post, Body, Param, Inject, Put, Delete } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Controller('devices')
export class DevicesController {
  constructor(
    @Inject('DEVICE_SERVICE') private client: ClientProxy,
  ) {}

  @Post()
  async create(@Body() data: any) {
    return await firstValueFrom(
      this.client.send('create_device', data)
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
  async update(@Param('id') id: string, @Body() data: any) {
    return await firstValueFrom(
      this.client.send('update_device_status', { id, ...data })
    );
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await firstValueFrom(
      this.client.send('delete_device', { id })
    );
  }
}