import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    // Clientes para comunicarse con microservicios
    ClientsModule.register([
      {
        name: 'LOAN_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.LOAN_SERVICE_HOST || 'localhost',
          port: parseInt(process.env.LOAN_SERVICE_RPC_PORT || '3011'),
        },
      },
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
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}