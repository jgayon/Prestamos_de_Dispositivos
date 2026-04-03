import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('DeviceService');

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.TCP,
    options: {
      host: process.env.DEVICE_SERVICE_HOST || '0.0.0.0',
      port: parseInt(process.env.DEVICE_SERVICE_PORT || '3002'),
    },
  });

  const port = parseInt(process.env.DEVICE_SERVICE_PORT || '3002');
  await app.listen();
  logger.log(`✅ Device Service (Microservice) listening on port ${port}`);
  logger.log(`📡 Transport: TCP`);
}
bootstrap();