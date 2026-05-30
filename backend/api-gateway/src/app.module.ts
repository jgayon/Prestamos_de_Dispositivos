import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersController } from './users.controller';
import { DevicesController } from './devices.controller';
import { LoansController } from './loans.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'LOAN_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.LOAN_SERVICE_HOST || 'localhost',
          port: parseInt(
            process.env.LOAN_SERVICE_RPC_PORT || '3011',
            10,
          ),
        },
      },
      {
        name: 'DEVICE_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.DEVICE_SERVICE_HOST || 'localhost',
          port: parseInt(
            process.env.DEVICE_SERVICE_RPC_PORT || '3012',
            10,
          ),
        },
      },
    ]),
  ],
  controllers: [
    AppController,
    UsersController,
    DevicesController,
    LoansController,
  ],
  providers: [AppService],
})
export class AppModule {}