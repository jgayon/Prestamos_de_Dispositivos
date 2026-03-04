import { Controller, Post, Patch, Param, Body, Get } from '@nestjs/common';
import { LoansService } from './loans.service';

@Controller('loans')
export class LoansController {
  constructor(private readonly loansService: LoansService) {}

  @Post()
  create(@Body('type') type: string) {
    return this.loansService.createLoan(type);
  }

  @Get()
  list() {
    return this.loansService.listLoans();
  }

  @Patch(':id/approve')
  approve(@Param('id') id: string) {
    return this.loansService.approveLoan(id);
  }

  @Patch(':id/deliver')
  deliver(@Param('id') id: string) {
    return this.loansService.deliverLoan(id);
  }

  @Patch(':id/return')
  return(@Param('id') id: string) {
    return this.loansService.returnLoan(id);
  }

  @Patch(':id/expire')
  expire(@Param('id') id: string) {
    return this.loansService.expireLoan(id);
  }
}