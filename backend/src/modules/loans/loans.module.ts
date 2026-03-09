import { Module } from '@nestjs/common';
import { LoansController } from './loans.controller';
import { LoansService } from './loans.service';
import { LoanRepository } from './infrastructure/prisma/loan.repository';
import { DevicesRepository } from '../devices/devices.repository';

@Module({
  controllers: [LoansController],
  providers: [LoansService, LoanRepository, DevicesRepository]
})
export class LoansModule {}
