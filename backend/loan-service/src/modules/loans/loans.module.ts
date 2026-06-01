import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { LoansController } from './loans.controller';
import { LoansService } from './loans.service';
import { LoanRepository } from './infrastructure/prisma/loan.repository';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'DEVICE_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.DEVICE_SERVICE_HOST || 'localhost',
          port: parseInt(process.env.DEVICE_SERVICE_PORT || '3002'),
          retryAttempts: 3,
          retryDelay: 1000,
          timeout: 5000,
        },
      },
    ]),
  ],
  controllers: [LoansController],
  providers: [LoansService, LoanRepository]
})
export class LoansModule {}
