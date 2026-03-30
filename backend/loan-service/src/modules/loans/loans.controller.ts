import { Controller, Post, Patch, Param, Body, Get, UsePipes, ValidationPipe, Query,} from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { LoansService } from './loans.service';
import { CreateLoanDto } from './dto/create-loan.dto';

@Controller('loans')
export class LoansController {
  constructor(private readonly loansService: LoansService) {}

  //HTTP

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  create(@Body() createLoanDto: CreateLoanDto) {
    const { userId, deviceId, type, startDate, endDate } = createLoanDto;

    return this.loansService.createLoan(
      userId,
      deviceId,
      type,
      new Date(startDate),
      new Date(endDate),
    );
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
  return(@Param('id') id: string) {
    return this.loansService.returnLoan(id);
  }

  @Patch(':id/expire')
  expire(@Param('id') id: string) {
    return this.loansService.expireLoan(id);
  }

  //MICRO (API GATEWAY)

  @MessagePattern('create_loan')
  async createLoanMicro(@Payload() data: any) {
    const { userId, deviceId, type, startDate, endDate } = data;

    return this.loansService.createLoan(
      userId,
      deviceId,
      type,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @MessagePattern('get_loan')
  async getLoanMicro(@Payload() data: { id: string }) {
    return this.loansService.getLoanById(data.id);
  }

  @MessagePattern('list_loans')
  async listLoansMicro(@Payload() filters: any) {
    return this.loansService.listLoans(filters);
  }

  @MessagePattern('change_loan_status')
  async changeStatusMicro(@Payload() data: { id: string; status: string }) {
    return this.loansService.changeStatus(data.id, data.status);
  }
}