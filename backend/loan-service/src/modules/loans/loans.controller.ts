import {
  Controller,
  Post,
  Patch,
  Param,
  Body,
  Get,
  UsePipes,
  ValidationPipe,
  Query,
} from '@nestjs/common';
import { LoansService } from './loans.service';

@Controller('loans')
export class LoansController {
  constructor(private readonly loansService: LoansService) {}

  // HTTP ENDPOINTS

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  create(@Body() body: any) {
    return this.loansService.createLoan(body);
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.loansService.getLoanById(id);
  }

  @Get()
  list(
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const filters: any = {};

    if (status) filters.status = status.toUpperCase();
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);

    return this.loansService.listLoans(filters);
  }

  @Patch(':id/status')
  changeStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.loansService.changeStatus(id, status);
  }

  // legacy endpoints
  @Patch(':id/approve')
  approve(@Param('id') id: string) {
    return this.loansService.approveLoan(id);
  }

  @Patch(':id/deliver')
  deliver(@Param('id') id: string) {
    return this.loansService.deliverLoan(id);
  }

  @Patch(':id/return')
  returnLoan(@Param('id') id: string) {
    return this.loansService.returnLoan(id);
  }

  @Patch(':id/expire')
  expire(@Param('id') id: string) {
    return this.loansService.expireLoan(id);
  }
}