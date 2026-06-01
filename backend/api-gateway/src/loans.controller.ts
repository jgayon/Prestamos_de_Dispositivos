import { Controller, Post, Get, Body, Inject, Param, Patch, Query, ValidationPipe } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { CreateLoanDTO } from './dto/create-loan.dto';

@Controller('loans')
export class LoansController {
  constructor(
    @Inject('LOAN_SERVICE') private client: ClientProxy,
  ) {}

  @Post()
  async create(@Body(new ValidationPipe()) createLoanDto: CreateLoanDTO) {
    return await firstValueFrom(
      this.client.send({ cmd: 'create_loan' }, createLoanDto)
    );
  }

  @Get()
  async findAll(@Query() filters?: any) {
    return await firstValueFrom(
      this.client.send({ cmd: 'get_loans' }, filters || {})
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await firstValueFrom(
      this.client.send({ cmd: 'get_loan' }, { id })
    );
  }

  @Patch(':id/approve')
  async approve(@Param('id') id: string) {
    return await firstValueFrom(
      this.client.send({ cmd: 'approve_loan' }, { id })
    );
  }

  @Patch(':id/deliver')
  async deliver(@Param('id') id: string) {
    return await firstValueFrom(
      this.client.send({ cmd: 'deliver_loan' }, { id })
    );
  }

  @Patch(':id/return')
  async return(@Param('id') id: string) {
    return await firstValueFrom(
      this.client.send({ cmd: 'return_loan' }, { id })
    );
  }

  @Patch(':id/expire')
  async expire(@Param('id') id: string) {
    return await firstValueFrom(
      this.client.send({ cmd: 'expire_loan' }, { id })
    );
  }
}