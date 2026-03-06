import { Controller, Post, Patch, Param, Body, Get } from '@nestjs/common';
import { LoansService } from './loans.service';
import { CreateLoanDto } from './dto/create-loan.dto';

@Controller('loans')
export class LoansController {
  constructor(private readonly loansService: LoansService) {}

  @Post()
  create(
  @Body('userId') userId: string,
  @Body('bookId') bookId: string,
  @Body('type') type: string
  ) {
    return this.loansService.createLoan( userId, bookId, type);
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