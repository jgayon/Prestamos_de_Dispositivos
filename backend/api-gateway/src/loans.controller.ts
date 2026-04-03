import { Controller, Post, Get, Body, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Controller('loans')
export class LoansController {
  constructor(
    @Inject('LOAN_SERVICE') private client: ClientProxy,
  ) {}

  @Post()
  create(@Body() data: any) {
    return this.client.send({ cmd: 'create_loan' }, data);
  }

  @Get()
  findAll() {
    return this.client.send({ cmd: 'get_loans' }, {});
  }
}