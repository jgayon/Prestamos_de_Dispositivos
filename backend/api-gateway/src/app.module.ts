import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AppController } from './app.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'LOAN_SERVICE',
        transport: Transport.TCP,
        options: {
          port: 3000, // puerto del loan-service
        },
      },
    ]),
  ],
  controllers: [AppController],
})
export class AppModule {}