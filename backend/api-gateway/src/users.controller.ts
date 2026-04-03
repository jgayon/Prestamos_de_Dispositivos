import { Controller, Post, Get, Body, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Controller('users')
export class UsersController {
  constructor(
    @Inject('LOAN_SERVICE') private client: ClientProxy,
  ) {}

  @Post()
  create(@Body() data: any) {
    return this.client.send({ cmd: 'create_user' }, data);
  }

  @Get()
  findAll() {
    return this.client.send({ cmd: 'get_users' }, {});
  }
}