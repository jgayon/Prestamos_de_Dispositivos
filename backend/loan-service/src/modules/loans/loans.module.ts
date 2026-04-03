import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { LoansController } from './loans.controller';
import { LoansService } from './loans.service';
import { LoanRepository } from './infrastructure/prisma/loan.repository';
import { DevicesRepository } from '../devices/devices.repository';
import { LoansRpcController } from './loans.rpc.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'DEVICE_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.DEVICE_SERVICE_HOST || 'localhost',
          port: parseInt(process.env.DEVICE_SERVICE_PORT || '3002'),
        },
      },
    ]),
  ],
  controllers: [LoansController, LoansRpcController],
  providers: [LoansService, LoanRepository, DevicesRepository]
})
export class LoansModule {}
