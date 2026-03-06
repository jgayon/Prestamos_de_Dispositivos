import { Module } from '@nestjs/common';
import { LoansController } from './loans.controller';
import { LoansService } from './loans.service';
import { LoanRepository } from './infrastructure/prisma/loan.repository';

@Module({
  controllers: [LoansController],
  providers: [LoansService, LoanRepository]
})
export class LoansModule {}
