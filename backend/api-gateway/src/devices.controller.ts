import { Controller, Get, Post, Body, Param, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Controller('devices')
export class DevicesController {
  constructor(
    @Inject('DEVICE_SERVICE') private client: ClientProxy,
  ) {}

  @Post()
  create(@Body() data: any) {
    return this.client.send({ cmd: 'create_device' }, data);
  }

  @Get()
  findAll() {
    return this.client.send({ cmd: 'get_devices' }, {});
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.client.send({ cmd: 'get_device' }, id);
  }
}